const Order = require('../Models/order.model');
const User = require('../Models/user.model');
const Product = require('../Models/product.model');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail, sendOrderConfirmationEmail } = require('../services/email.service');

// Get orders by user
exports.getOrdersByUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;

        let query = { user: req.user._id };
        if (status) {
            query.currentStatus = status;
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({
                path: 'user',
                select: 'fullName email addresses',
                populate: {
                    path: 'addresses'
                }
            });

        // Map through orders to find matching shipping address
        const ordersWithAddress = orders.map(order => {
            const orderObj = order.toObject();
            if (order.user && order.user.addresses) {
                orderObj.shippingAddress = order.user.addresses.find(
                    addr => addr._id.toString() === order.shippingAddress.toString()
                );
            }
            return orderObj;
        });

        const total = await Order.countDocuments(query);

        res.json({
            orders: ordersWithAddress,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            message: 'Error fetching user orders',
            error: error.message
        });
    }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // Build query
        let query = {};
        if (status) {
            query.currentStatus = status;
        }

        // Search by user email or name if provided
        const searchTerm = req.query.search;
        if (searchTerm) {
            const users = await User.find({
                $or: [
                    { email: { $regex: searchTerm, $options: 'i' } },
                    { fullName: { $regex: searchTerm, $options: 'i' } }
                ]
            });
            const userIds = users.map(user => user._id);
            query.user = { $in: userIds };
        }

        // Date range filter
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Build sort object
        let sort = {};
        sort[sortBy] = sortOrder;

        const orders = await Order.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({
                path: 'user',
                select: 'fullName email addresses',
                populate: {
                    path: 'addresses'
                }
            });

        // Map through orders to find matching shipping address
        const ordersWithAddress = orders.map(order => {
            const orderObj = order.toObject();
            if (order.user && order.user.addresses) {
                orderObj.shippingAddress = order.user.addresses.find(
                    addr => addr._id.toString() === order.shippingAddress.toString()
                );
            }
            return orderObj;
        });

        const total = await Order.countDocuments(query);

        res.json({
            orders: ordersWithAddress,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({
            message: 'Error fetching all orders',
            error: error.message
        });
    }
};

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const {
            items,
            shippingAddressId,
            paymentMethod,
            loyaltyPointsUsed = 0
        } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }
        if (!shippingAddressId) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }
        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }

        // Kiểm tra số điểm loyalty hiện có của user
        if (loyaltyPointsUsed > 0) {
            const completedOrders = await Order.find({
                user: req.user._id,
                currentStatus: 'delivered'
            });

            let totalPointsEarned = 0;
            let totalPointsUsed = 0;

            completedOrders.forEach(order => {
                totalPointsEarned += order.loyaltyPointsEarned || 0;
                totalPointsUsed += order.loyaltyPointsUsed || 0;
            });

            const currentPoints = totalPointsEarned - totalPointsUsed;

            if (loyaltyPointsUsed > currentPoints) {
                return res.status(400).json({
                    message: 'Không đủ điểm loyalty',
                    currentPoints,
                    requestedPoints: loyaltyPointsUsed,
                    pointsValue: currentPoints * 1000
                });
            }
        }

        // Get user and validate shipping address
        const user = await User.findById(req.user._id).populate('addresses');
        const shippingAddress = user.addresses.id(shippingAddressId);
        if (!shippingAddress) {
            return res.status(400).json({ message: 'Invalid shipping address' });
        }

        // Process items and get product details
        const processedItems = [];
        let subtotal = 0;

        for (const item of items) {
            // Validate item structure
            if (!item.product || !item.quantity) {
                return res.status(400).json({ 
                    message: 'Each item must have product ID and quantity' 
                });
            }

            // Get product details from database
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ 
                    message: `Product not found: ${item.product}` 
                });
            }

            // Check if product is in stock
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product: ${product.name}`,
                    available: product.stockQuantity,
                    requested: item.quantity
                });
            }

            // Create processed item with product details
            const mainImage = product.images.find(img => img.isMain);
            const processedItem = {
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                productSnapshot: {
                    name: product.brand + ' ' + product.model,
                    brand: product.brand,
                    model: product.model,
                    category: product.category,
                    image: mainImage ? mainImage.url : product.images[0]?.url,
                    specifications: product.specifications
                }
            };

            // Update stock quantity
            product.stockQuantity -= item.quantity;
            await product.save();

            processedItems.push(processedItem);
            subtotal += product.price * item.quantity;
        }

        // Create new order with initial status history
        const order = new Order({
            user: req.user._id,
            items: processedItems,
            shippingAddress: shippingAddressId,
            subtotal,
            loyaltyPointsUsed,
            paymentMethod,
            currentStatus: 'pending',
            totalAmount: subtotal - (loyaltyPointsUsed * 1000),
            statusHistory: [{
                status: 'pending',
                timestamp: new Date(),
                note: 'Đơn hàng mới được tạo'
            }]
        });

        // Calculate loyalty points earned
        order.calculateLoyaltyPoints();

        // Save the order
        await order.save();

        // Populate the order with related data
        await order.populate([
            {
                path: 'user',
                select: 'fullName email addresses'
            },
            {
                path: 'items.product',
                select: 'name images price'
            }
        ]);

        // Send order confirmation email
        await sendOrderConfirmationEmail({
            ...order.toObject(),
            user: {
                fullName: user.fullName,
                email: user.email
            },
            shippingAddress: shippingAddress
        });

        res.status(201).json({
            message: 'Order created successfully',
            order: {
                _id: order._id,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email
                },
                shippingAddress: shippingAddress,
                totalAmount: order.totalAmount,
                loyaltyPointsEarned: order.loyaltyPointsEarned,
                currentStatus: order.currentStatus,
                statusHistory: order.statusHistory,
                items: order.items,
                createdAt: order.createdAt,
                paymentMethod: order.paymentMethod
            }
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            message: 'Error creating order', 
            error: error.message 
        });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        
        const order = await Order.findById(orderId)
            .populate({
                path: 'user',
                select: 'fullName email addresses',
                populate: {
                    path: 'addresses'
                }
            });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user has permission to view this order
        if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Find matching shipping address
        const orderObj = order.toObject();
        if (order.user && order.user.addresses) {
            orderObj.shippingAddress = order.user.addresses.find(
                addr => addr._id.toString() === order.shippingAddress.toString()
            );
        }

        res.json(orderObj);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, note } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Kiểm tra tính hợp lệ của trạng thái mới
        if (!order.isValidStatusTransition(status)) {
            return res.status(400).json({
                message: `Invalid status transition from ${order.currentStatus} to ${status}. Allowed transitions are: pending → confirmed/cancelled, confirmed → shipping/cancelled, shipping → delivered/cancelled`
            });
        }

        // Cập nhật trạng thái và thêm vào history
        order.currentStatus = status;
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            note: note || `Trạng thái đơn hàng được cập nhật sang ${status}`
        });

        await order.save();

        // Populate order data
        await order.populate([
            {
                path: 'user',
                select: 'fullName email'
            },
            {
                path: 'items.product',
                select: 'name images price'
            }
        ]);

        res.json({
            message: 'Order status updated successfully',
            order: {
                _id: order._id,
                currentStatus: order.currentStatus,
                statusHistory: order.statusHistory,
                updatedAt: order.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// Get user's total loyalty points
exports.getUserLoyaltyPoints = async (req, res) => {
    try {
        // Lấy tất cả đơn hàng đã hoàn thành của user
        const completedOrders = await Order.find({
            user: req.user._id,
            currentStatus: 'delivered'
        });

        // Tính toán tổng điểm
        let totalPointsEarned = 0;
        let totalPointsUsed = 0;

        completedOrders.forEach(order => {
            totalPointsEarned += order.loyaltyPointsEarned || 0;
            totalPointsUsed += order.loyaltyPointsUsed || 0;
        });

        // Tính số điểm hiện có
        const currentPoints = totalPointsEarned - totalPointsUsed;

        // Tính giá trị quy đổi sang tiền
        const pointsValue = currentPoints * 1000; // 1 point = 1,000 VND

        res.json({
            totalPointsEarned,
            totalPointsUsed,
            currentPoints,
            pointsValue,
            summary: {
                ordersCount: completedOrders.length,
                lastOrderDate: completedOrders.length > 0 
                    ? completedOrders[completedOrders.length - 1].createdAt 
                    : null
            }
        });

    } catch (error) {
        console.error('Error fetching loyalty points:', error);
        res.status(500).json({
            message: 'Error fetching loyalty points',
            error: error.message
        });
    }
};

// Create order for guest users
exports.createGuestOrder = async (req, res) => {
    try {
        const {
            items,
            email,
            fullName,
            shippingAddress,
            paymentMethod,
        } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }

        if (!email || !fullName || !shippingAddress) {
            return res.status(400).json({ 
                message: 'Email, full name, and shipping address are required for guest checkout' 
            });
        }

        if (!paymentMethod) {
            return res.status(400).json({ message: 'Payment method is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate shipping address
        if (!shippingAddress.street || !shippingAddress.ward || 
            !shippingAddress.district || !shippingAddress.city) {
            return res.status(400).json({ 
                message: 'Invalid shipping address. All fields are required.' 
            });
        }

        // Kiểm tra và tạo guest user nếu cần
        let user = await User.findOne({ email: email.toLowerCase() });
        let isNewUser = false;
        
        if (!user) {
            // Tạo mật khẩu tạm thời cho guest user
            const temporaryPassword = crypto.randomBytes(8).toString('hex');
            
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(temporaryPassword, salt);
            
            // Tạo guest user mới
            user = new User({
                email: email.toLowerCase(),
                fullName,
                isGuest: true,
                password: hashedPassword, // Lưu mật khẩu đã hash
                addresses: [{
                    ...shippingAddress,
                    isDefault: true
                }]
            });
            await user.save();
            isNewUser = true;

            // Gửi email chào mừng với mật khẩu tạm thời
            await sendWelcomeEmail({
                email: user.email,
                fullName: user.fullName,
                password: temporaryPassword
            });
        }

        // Process items and get product details
        const processedItems = [];
        let subtotal = 0;

        for (const item of items) {
            if (!item.product || !item.quantity) {
                return res.status(400).json({ 
                    message: 'Each item must have product ID and quantity' 
                });
            }

            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(400).json({ 
                    message: `Product not found: ${item.product}` 
                });
            }

            // Check if product is in stock
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for product: ${product.name}`,
                    available: product.stockQuantity,
                    requested: item.quantity
                });
            }

            const mainImage = product.images.find(img => img.isMain);
            const processedItem = {
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                productSnapshot: {
                    name: product.brand + ' ' + product.model,
                    brand: product.brand,
                    model: product.model,
                    category: product.category,
                    image: mainImage ? mainImage.url : product.images[0]?.url,
                    specifications: product.specifications
                }
            };

            // Update stock quantity
            product.stockQuantity -= item.quantity;
            await product.save();

            processedItems.push(processedItem);
            subtotal += product.price * item.quantity;
        }

        // Create new order
        const order = new Order({
            user: user._id,
            items: processedItems,
            shippingAddress: user.addresses[0]._id,
            subtotal,
            paymentMethod,
            currentStatus: 'pending',
            totalAmount: subtotal,
            statusHistory: [{
                status: 'pending',
                timestamp: new Date(),
                note: 'Đơn hàng mới được tạo bởi khách'
            }]
        });

        // Calculate loyalty points earned
        order.calculateLoyaltyPoints();

        // Save the order
        await order.save();

        // Populate the order with related data
        await order.populate([
            {
                path: 'user',
                select: 'fullName email addresses'
            },
            {
                path: 'items.product',
                select: 'name images price'
            }
        ]);

        // Send order confirmation email
        await sendOrderConfirmationEmail({
            ...order.toObject(),
            user: {
                fullName: user.fullName,
                email: user.email
            },
            shippingAddress
        });

        res.status(201).json({
            message: isNewUser 
                ? 'Order created successfully. Please check your email for account details.' 
                : 'Order created successfully',
            order: {
                _id: order._id,
                user: {
                    _id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    isGuest: user.isGuest
                },
                shippingAddress,
                totalAmount: order.totalAmount,
                loyaltyPointsEarned: order.loyaltyPointsEarned,
                currentStatus: order.currentStatus,
                statusHistory: order.statusHistory,
                items: order.items,
                createdAt: order.createdAt,
                paymentMethod: order.paymentMethod
            }
        });

    } catch (error) {
        console.error('Error creating guest order:', error);
        res.status(500).json({ 
            message: 'Error creating guest order', 
            error: error.message 
        });
    }
};