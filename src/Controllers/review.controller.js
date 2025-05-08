const Review = require('../Models/review.model');

// Tạo mới đánh giá
exports.createReview = async (req, res) => {
  try {
    const { productId, userName, rating, comment } = req.body;
    if (!productId || !rating) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin bắt buộc' });
    }
    const review = new Review({
      productId,
      userName,
      rating,
      comment,
      createdAt: new Date()
    });
    await review.save();
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
    res.json({ success: true, data: reviews });
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
