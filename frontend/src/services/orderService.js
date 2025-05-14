import api from './api';

const orderService = {
  // Create order for logged in users
  createOrder: async (orderData) => {
    return api.post('/api/orders', orderData);
  },

  // Create order for guest users
  createGuestOrder: async (orderData) => {
    return api.post('/api/orders/guest', orderData);
  },

  // Get user's orders
  getMyOrders: async () => {
    return api.get('/api/orders/my-orders');
  },

  // Get specific order
  getOrderById: async (orderId) => {
    return api.get(`/api/orders/${orderId}`);
  },

  // Get user's loyalty points
  getLoyaltyPoints: async () => {
    return api.get('/api/orders/loyalty-points');
  },

  getAllOrders: async () => {
    try {
      const response = await api.get('/api/orders/admin/orders');
      return response.data;
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      throw error;
    }
  },

  // Get revenue data
  getRevenue: async (type = 'month') => {
    try {
      const response = await api.get(`/api/orders/admin/revenue?type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Error in getRevenue:', error);
      throw error;
    }
  },

  // Get recent orders
  getRecentOrders: async (limit = 5) => {
    try {
      const response = await api.get('/api/orders/admin/orders');
      // Sắp xếp theo thời gian tạo mới nhất và lấy số lượng limit
      const sortedOrders = response.data.orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
      
      // Format dữ liệu để phù hợp với RecentOrdersTable
      return sortedOrders.map(order => ({
        id: order._id,
        customer: order.user?.fullName || 'Guest',
        date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
        status: order.currentStatus,
        total: order.totalAmount
      }));
    } catch (error) {
      console.error('Error in getRecentOrders:', error);
      throw error;
    }
  },

  // Get top selling products
  getTopSellingProducts: async (limit = 5) => {
    try {
      const response = await api.get(`/api/orders/admin/top-products?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error in getTopSellingProducts:', error);
      throw error;
    }
  },

  // Get top selling categories
  getTopSellingCategories: async (limit = 9) => {
    try {
      const response = await api.get(`/api/orders/admin/top-categories?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error in getTopSellingCategories:', error);
      throw error;
    }
  }
};

export default orderService; 