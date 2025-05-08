const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/order.controller');
const { authenticateToken, requireAdmin } = require('../Middlewares/auth.middleware');

// Guest route (không cần authentication)
router.post('/guest', orderController.createGuestOrder);

// Admin routes - đặt trước để tránh conflict với route params
router.get('/admin/orders', authenticateToken, requireAdmin, orderController.getAllOrders);
router.patch('/admin/:orderId/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);

// User routes
router.post('/', authenticateToken, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getOrdersByUser);
router.get('/loyalty-points', authenticateToken, orderController.getUserLoyaltyPoints);
router.get('/:orderId', authenticateToken, orderController.getOrderById);

module.exports = router; 