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
    console.log('Gửi đánh giá:', data);
    const res = await api.post('/api/reviews', data);
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