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
  }
};

export default orderService; 