const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/order.controller');
const { authenticateToken, requireAdmin } = require('../Middlewares/auth.middleware');

// Public routes
router.post('/guest', orderController.createGuestOrder);
router.get('/top-selling', orderController.getPublicTopSellingProducts);

// Admin routes - đặt trước để tránh conflict với route params
router.get('/admin/orders', authenticateToken, requireAdmin, orderController.getAllOrders);
router.get('/admin/revenue', authenticateToken, requireAdmin, orderController.getRevenue);
router.get('/admin/top-products', authenticateToken, requireAdmin, orderController.getTopSellingProducts);
router.get('/admin/top-categories', authenticateToken, requireAdmin, orderController.getTopSellingCategories);
router.patch('/admin/:orderId/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);

// User routes
router.post('/', authenticateToken, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getOrdersByUser);
router.get('/loyalty-points', authenticateToken, orderController.getUserLoyaltyPoints);
router.get('/:orderId', authenticateToken, orderController.getOrderById);

module.exports = router; 