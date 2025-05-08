import api from './api';

const reviewService = {
  // Lấy tất cả đánh giá của 1 sản phẩm
  async getReviewsByProduct(productId) {
    const res = await api.get(`/api/reviews/product/${productId}`);
    return res.data.data;
  },
  // Lấy tổng số review và rating trung bình
  async getRatingSummary(productId) {
    const res = await api.get(`/api/reviews/summary/${productId}`);
    return res.data;
  },
  // Thêm hàm tạo mới đánh giá
  async createReview(data) {
    const res = await api.post('/api/reviews', data);
    return res.data;
  }
};

export default reviewService; 