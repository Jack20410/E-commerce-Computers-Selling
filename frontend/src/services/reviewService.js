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
    // Nếu không có rating thì không truyền lên
    const payload = { ...data };
    if (!payload.rating) delete payload.rating;
    const res = await api.post('/api/reviews', payload);
    return res.data;
  },
  // Lấy review của user cho 1 sản phẩm trong 1 đơn hàng
  async getUserReview(productId, userName, orderId) {
    const res = await api.get(`/api/reviews/product/${productId}/user`, { params: { userName, orderId } });
    return res.data.data;
  },
  // Sửa đánh giá
  async updateReview(id, data) {
    const res = await api.put(`/api/reviews/${id}`, data);
    return res.data;
  },
  // Xoá đánh giá
  async deleteReview(id) {
    const res = await api.delete(`/api/reviews/${id}`);
    return res.data;
  }
};

export default reviewService; 