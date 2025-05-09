const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  orderId: { type: String }, // Đánh giá theo từng đơn hàng
  userId: { type: String }, // Không bắt buộc nếu không cần đăng nhập
  userName: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);