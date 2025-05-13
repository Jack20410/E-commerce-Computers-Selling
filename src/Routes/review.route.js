const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/review.controller');

router.post('/', reviewController.createReview);
router.get('/product/:productId', reviewController.getReviewsByProduct);
router.get('/summary/:productId', reviewController.getRatingSummary);
router.get('/all', reviewController.getAllReviews);
router.get('/product/:productId/user', reviewController.getUserReviewForProduct);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.get('/top-5star', reviewController.getTop5StarReviews);

module.exports = router;
