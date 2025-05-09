const Review = require('../Models/review.model');

// Tạo mới đánh giá
exports.createReview = async (req, res) => {
  try {
    const { productId, userName, rating, comment, orderId } = req.body;
    if (!productId || !userName || !comment) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }
    const review = new Review({
      productId,
      orderId,
      userName,
      comment,
      createdAt: new Date()
    });
    if (rating) review.rating = rating;
    await review.save();
    // Emit review update via websocket
    const websocketService = require('../services/websocket.service');
    websocketService.emitReviewUpdate(productId, review);
    res.status(201).json({ success: true, message: 'Đánh giá thành công', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy tất cả đánh giá theo productId
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    // Thêm purchaseVerified: true nếu có orderId
    const reviewsWithPurchase = reviews.map(r => ({
      ...r.toObject(),
      purchaseVerified: !!r.orderId
    }));
    res.json({ success: true, data: reviewsWithPurchase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy tổng số review và rating trung bình cho 1 sản phẩm
exports.getRatingSummary = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId });
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 0;
    res.json({ success: true, total, average: Number(avg) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy tất cả review mới nhất cho testimonials
exports.getAllReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const reviews = await Review.find({})
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Lấy review của user cho 1 sản phẩm trong 1 đơn hàng
exports.getUserReviewForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userName, orderId } = req.query;
    if (!productId || !userName || !orderId) {
      return res.status(400).json({ success: false, message: 'Thiếu productId, userName hoặc orderId' });
    }
    const review = await Review.findOne({ productId, userName, orderId });
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Sửa đánh giá
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
    }
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    review.updatedAt = new Date();
    await review.save();
    res.json({ success: true, message: 'Cập nhật đánh giá thành công', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// Xoá đánh giá
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' });
    }
    res.json({ success: true, message: 'Xoá đánh giá thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
