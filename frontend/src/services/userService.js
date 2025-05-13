import api from './api';

const userService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/users/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  },

  getTotalCustomers: async () => {
    try {
      const response = await api.get('/api/users/admin/users');
      // Lọc và đếm số lượng user có role là customer
      const customers = response.data.users.filter(user => user.role === 'customer');
      return customers.length;
    } catch (error) {
      console.error('Error in getTotalCustomers:', error);
      throw error;
    }
  }
};

export default userService; 