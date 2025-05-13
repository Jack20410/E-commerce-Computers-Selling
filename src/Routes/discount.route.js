const express = require('express');
const router = express.Router();
const discountController = require('../Controllers/discount.controller');
const { authenticateToken, requireAdmin } = require('../Middlewares/auth.middleware');

// Routes cho admin
router.post('/create', authenticateToken, requireAdmin, discountController.createDiscount);
router.get('/all', authenticateToken, requireAdmin, discountController.getAllDiscounts);
router.put('/:id/status', authenticateToken, requireAdmin, discountController.updateDiscountStatus);
router.delete('/:id', authenticateToken, requireAdmin, discountController.deleteDiscount);

// Routes cho cả user và admin
router.get('/valid', authenticateToken, discountController.getValidDiscounts); // lấy danh sách discount hợp lệ
router.post('/validate', authenticateToken, discountController.validateDiscount); // tính toán discount

module.exports = router; 