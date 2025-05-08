const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/review.controller');

router.post('/', reviewController.createReview);
router.get('/product/:productId', reviewController.getReviewsByProduct);
router.get('/summary/:productId', reviewController.getRatingSummary);
router.get('/all', reviewController.getAllReviews);

module.exports = router;
