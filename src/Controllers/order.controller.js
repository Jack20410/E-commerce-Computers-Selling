const Order = require('../Models/order.model');
const User = require('../Models/user.model');
const Product = require('../Models/product.model');

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

        // Get user and validate shipping address
        const user = await User.findById(req.user._id);
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

            // Create processed item with product details
            const processedItem = {
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                productSnapshot: {
                    name: product.name,
                    brand: product.brand,
                    model: product.model,
                    category: product.category,
                    image: product.images[0], // Lấy ảnh đầu tiên làm ảnh chính
                    specifications: product.specifications
                }
            };

            processedItems.push(processedItem);
            subtotal += product.price * item.quantity;
        }

        // Create new order
        const order = new Order({
            user: req.user._id,
            items: processedItems,
            shippingAddress: shippingAddressId,
            subtotal,
            loyaltyPointsUsed,
            paymentMethod,
            totalAmount: subtotal - (loyaltyPointsUsed * 1000) // 1 point = 1000 VND
        });

        // Calculate loyalty points earned
        order.calculateLoyaltyPoints();

        // Save the order
        await order.save();

        // Return the created order
        res.status(201).json({
            message: 'Order created successfully',
            order: {
                _id: order._id,
                user: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email
                },
                shippingAddress: {
                    _id: shippingAddress._id,
                    name: shippingAddress.name,
                    street: shippingAddress.street,
                    ward: shippingAddress.ward,
                    district: shippingAddress.district,
                    city: shippingAddress.city
                },
                totalAmount: order.totalAmount,
                loyaltyPointsEarned: order.loyaltyPointsEarned,
                currentStatus: order.currentStatus,
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
                message: `Invalid status transition from ${order.currentStatus} to ${status}`
            });
        }

        // Cập nhật trạng thái
        order.currentStatus = status;
        if (note) {
            order.statusHistory[order.statusHistory.length - 1].note = note;
        }

        await order.save();

        res.json({
            message: 'Order status updated successfully',
            order: await order.populate(['user', 'items.product', 'shippingAddress'])
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { note } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user has permission to cancel this order
        if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Only allow cancellation of pending or confirmed orders
        if (!['pending', 'confirmed'].includes(order.currentStatus)) {
            return res.status(400).json({
                message: 'Cannot cancel order. Order is already in progress or completed'
            });
        }

        // Update status to cancelled
        order.currentStatus = 'cancelled';
        order.statusHistory.push({
            status: 'cancelled',
            timestamp: new Date(),
            note: note || `Order cancelled by ${req.user.role === 'admin' ? 'admin' : 'user'}`
        });

        await order.save();

        res.json({
            message: 'Order cancelled successfully',
            order: {
                _id: order._id,
                currentStatus: order.currentStatus,
                statusHistory: order.statusHistory
            }
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            message: 'Error cancelling order',
            error: error.message
        });
    }
}; 