const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/review.controller');

// Tạo mới đánh giá
router.post('/', reviewController.createReview);
// Lấy tất cả đánh giá theo productId
router.get('/product/:productId', reviewController.getReviewsByProduct);
// Lấy tổng số review và rating trung bình
router.get('/summary/:productId', reviewController.getRatingSummary);

module.exports = router;
