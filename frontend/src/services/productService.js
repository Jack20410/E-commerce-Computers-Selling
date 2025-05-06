import api from './api';

/**
 * Service for product-related API operations
 */
const productService = {
  /**
   * Get all products with optional filtering and pagination
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} - Promise resolving to products data with pagination
   */
  getProducts: async (params = {}) => {
    try {
      console.log('Fetching products with params:', params);
      const response = await api.get('/products/api/products', { params });
      console.log('Products response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error in getProducts:', error);
      throw error.response?.data || error;
    }
  },
  
  /**
   * Get a single product by ID
   * @param {string|number} id - Product ID
   * @returns {Promise} - Promise resolving to product data
   */
  getProductById: async (id) => {
    try {
      console.log('Fetching product with ID:', id);
      const response = await api.get(`/products/api/${id}`);
      console.log('Product response:', response.data);
      
      if (!response.data) {
        throw new Error('No response data received');
      }

      // Return the product data regardless of success flag
      // Some valid responses might not have the success flag
      return response.data.data || response.data;
      
    } catch (error) {
      console.error('Error in getProductById:', error);
      throw error;
    }
  },
  
  /**
   * Search products
   * @param {string} query - Search query
   * @returns {Promise} - Promise resolving to search results
   */
  searchProducts: async (query, params = {}) => {
    try {
      console.log('Searching products:', query, params);
      const response = await api.get('/products/api/search', {
        params: { q: query, ...params }
      });
      console.log('Search response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Search failed');
      }
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error in searchProducts:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get products by category
   * @param {string} category - Category name
   * @param {Object} params - Additional query parameters
   * @returns {Promise} - Promise resolving to products in category
   */
  getProductsByCategory: async (category, params = {}) => {
    try {
      console.log('Fetching products by category:', category, params);
      const response = await api.get(`/products/api/category/${category}`, { params });
      console.log('Category products response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch category products');
      }
      return {
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      throw error.response?.data || error;
    }
  },
  
  /**
   * Get similar products for a specific product
   * @param {string} category - Product category
   * @param {string} productId - Current product ID to exclude
   * @returns {Promise} - Promise resolving to similar products
   */
  getSimilarProducts: async (category, productId) => {
    try {
      console.log('Fetching similar products for:', category, 'excluding:', productId);
      const response = await api.get(`/products/api/similar/${category}/${productId}`);
      console.log('Similar products response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch similar products');
      }
      return response.data.data || [];
    } catch (error) {
      console.error('Error in getSimilarProducts:', error);
      throw error.response?.data || error;
    }
  },
  
  /**
   * Get featured products
   * @param {number} limit - Number of featured products to retrieve
   * @returns {Promise} - Promise resolving to featured products data
   */
  getFeaturedProducts: (limit = 4) => {
    return api.get(`/products/api/featured?limit=${limit}`);
  },
  
  /**
   * Get product categories
   * @returns {Promise} - Promise resolving to categories data
   */
  getCategories: () => {
    return api.get('/products/api/categories');
  },
};

export default productService; 