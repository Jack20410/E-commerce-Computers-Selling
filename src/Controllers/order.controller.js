const Order = require('../Models/order.model');
const User = require('../Models/user.model');
const Product = require('../Models/product.model');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sendWelcomeEmail, sendOrderConfirmationEmail } = require('../services/email.service');
const websocketService = require('../services/websocket.service');
const Discount = require('../Models/discount.model');

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
            discountCode,
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

        // Xử lý mã giảm giá nếu có
        let discountAmount = 0;
        let discountCodeId = null;
        let discount = null;
        if (discountCode) {
            discount = await Discount.findOne({ code: discountCode.toUpperCase() });
            if (!discount) {
                return res.status(404).json({ message: 'Invalid discount code' });
            }
            if (!discount.isValid()) {
                return res.status(400).json({ 
                    message: 'Discount code is not valid',
                    reason: discount.currentUses >= discount.maxUses ? 'Usage limit reached' : 'Code is inactive'
                });
            }
            discountAmount = subtotal * (discount.discountValue / 100);
            discountCodeId = discount._id;
        }

        // Create new order with initial status history
        const order = new Order({
            user: req.user._id,
            items: processedItems,
            shippingAddress: shippingAddressId,
            subtotal,
            discountCode: discountCodeId,
            discountAmount,
            loyaltyPointsUsed,
            paymentMethod,
            currentStatus: 'pending',
            totalAmount: subtotal - discountAmount - (loyaltyPointsUsed * 1000),
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

        // Nếu có sử dụng mã giảm giá, cập nhật discount
        if (discount) {
            discount.currentUses += 1;
            discount.orders.push(order._id);
            await discount.save();
        }

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
                paymentMethod: order.paymentMethod,
                discount: discount ? {
                    code: discount.code,
                    discountValue: discount.discountValue,
                    discountAmount: order.discountAmount
                } : null
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

        const order = await Order.findById(orderId).populate('user', '_id');
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

        // Emit WebSocket event to notify user - wrapped in try-catch
        try {
            websocketService.emitOrderStatusUpdate(
                order.user._id.toString(),
                order._id.toString(),
                status
            );
        } catch (wsError) {
            console.error('WebSocket error:', wsError);
            // Continue execution even if WebSocket fails
        }

        res.json({
            success: true,
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
            success: false,
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

// Get revenue statistics
exports.getRevenue = async (req, res) => {
    try {
        const { type = 'month' } = req.query; // type: 'week', 'month', 'year', 'quarter'
        const now = new Date();
        let startDate, labels;

        switch (type) {
            case 'week':
                // 7 ngày gần nhất
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 6);
                labels = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + i);
                    return date.toLocaleDateString('vi-VN', { weekday: 'short' });
                });
                break;
            case 'month':
                // 30 ngày gần nhất
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 29);
                labels = Array.from({ length: 30 }, (_, i) => {
                    const date = new Date(startDate);
                    date.setDate(date.getDate() + i);
                    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                });
                break;
            case 'year':
                // 12 tháng gần nhất
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 11);
                labels = Array.from({ length: 12 }, (_, i) => {
                    const date = new Date(startDate);
                    date.setMonth(date.getMonth() + i);
                    return (
                        (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getFullYear()
                    );
                });
                break;
            case 'quarter':
                // 4 quý gần nhất
                let currentQuarter = Math.floor(now.getMonth() / 3) + 1;
                let currentYear = now.getFullYear();
                labels = [];
                for (let i = 3; i >= 0; i--) {
                    let quarter = currentQuarter - i;
                    let year = currentYear;
                    if (quarter <= 0) {
                        quarter += 4;
                        year -= 1;
                    }
                    labels.push(`Q${quarter}/${year}`);
                }
                // Lấy ngày bắt đầu của quý xa nhất
                let firstQuarter = labels[0].split('/');
                let fq = parseInt(firstQuarter[0].replace('Q', ''));
                let fy = parseInt(firstQuarter[1]);
                startDate = new Date(fy, (fq - 1) * 3, 1);
                break;
            default:
                return res.status(400).json({ message: 'Invalid type parameter' });
        }

        // Lấy tất cả đơn hàng đã hoàn thành trong khoảng thời gian
        const orders = await Order.find({
            currentStatus: 'delivered',
            createdAt: { $gte: startDate }
        });

        // Tạo map để lưu doanh thu và số lượng đơn hàng theo thời gian
        const revenueMap = new Map();
        const orderCountMap = new Map();
        labels.forEach(label => {
            revenueMap.set(label, 0);
            orderCountMap.set(label, 0);
        });

        // Tính toán doanh thu và số lượng đơn hàng
        orders.forEach(order => {
            const date = new Date(order.createdAt);
            let label;
            switch (type) {
                case 'week':
                    label = date.toLocaleDateString('vi-VN', { weekday: 'short' });
                    break;
                case 'month':
                    label = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                    break;
                case 'year':
                    label = (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getFullYear();
                    break;
                case 'quarter':
                    const q = Math.floor(date.getMonth() / 3) + 1;
                    label = `Q${q}/${date.getFullYear()}`;
                    break;
            }
            if (revenueMap.has(label)) {
                revenueMap.set(label, revenueMap.get(label) + order.totalAmount);
                orderCountMap.set(label, orderCountMap.get(label) + 1);
            }
        });

        // Chuyển đổi map thành mảng dữ liệu
        const data = labels.map(label => ({
            label,
            revenue: revenueMap.get(label),
            orderCount: orderCountMap.get(label)
        }));

        res.json({
            success: true,
            data,
            type,
            startDate,
            endDate: now
        });

    } catch (error) {
        console.error('Error calculating revenue:', error);
        res.status(500).json({
            message: 'Error calculating revenue',
            error: error.message
        });
    }
};

// API: Top selling products (Pie chart)
exports.getTopSellingProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        // Lấy tất cả đơn hàng đã giao thành công
        const orders = await Order.find({ currentStatus: 'delivered' });
        // Gom nhóm sản phẩm và tính tổng số lượng bán ra, tổng doanh thu
        const productMap = new Map();
        orders.forEach(order => {
            order.items.forEach(item => {
                const key = item.product.toString();
                if (!productMap.has(key)) {
                    productMap.set(key, {
                        id: key,
                        name: item.productSnapshot?.name || 'Unknown',
                        category: item.productSnapshot?.category || '',
                        image: item.productSnapshot?.image || '',
                        sold: 0,
                        revenue: 0
                    });
                }
                productMap.get(key).sold += item.quantity;
                productMap.get(key).revenue += (item.price || 0) * item.quantity;
            });
        });
        // Sắp xếp theo số lượng bán ra giảm dần
        const topProducts = Array.from(productMap.values())
            .sort((a, b) => b.sold - a.sold)
            .slice(0, limit);
        res.json({ success: true, data: topProducts });
    } catch (error) {
        console.error('Error fetching top selling products:', error);
        res.status(500).json({ message: 'Error fetching top selling products', error: error.message });
    }
};

// API: Top selling categories (Bar chart)
exports.getTopSellingCategories = async (req, res) => {
    try {
        // Lấy tất cả đơn hàng đã giao thành công
        const orders = await Order.find({ currentStatus: 'delivered' });
        // Gom nhóm theo category và tính tổng số lượng bán ra
        const categoryMap = new Map();
        orders.forEach(order => {
            order.items.forEach(item => {
                const cat = item.productSnapshot?.category || 'Unknown';
                if (!categoryMap.has(cat)) {
                    categoryMap.set(cat, { category: cat, sold: 0 });
                }
                categoryMap.get(cat).sold += item.quantity;
            });
        });
        // Return all categories without limiting
        const topCategories = Array.from(categoryMap.values())
            .sort((a, b) => b.sold - a.sold);
        res.json({ success: true, data: topCategories });
    } catch (error) {
        console.error('Error fetching top selling categories:', error);
        res.status(500).json({ message: 'Error fetching top selling categories', error: error.message });
    }
};