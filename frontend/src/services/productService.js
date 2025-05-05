import api from './api';

/**
 * Service for product-related API operations
 */
const productService = {
  /**
   * Get all products with optional filtering
   * @param {Object} filters - Query parameters for filtering products
   * @returns {Promise} - Promise resolving to products data
   */
  getProducts: (filters = {}) => {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return api.get(endpoint);
  },
  
  /**
   * Get a single product by ID
   * @param {string|number} id - Product ID
   * @returns {Promise} - Promise resolving to product data
   */
  getProductById: (id) => {
    return api.get(`/products/${id}`);
  },
  
  /**
   * Get featured products
   * @param {number} limit - Number of featured products to retrieve
   * @returns {Promise} - Promise resolving to featured products data
   */
  getFeaturedProducts: (limit = 4) => {
    return api.get(`/products/featured?limit=${limit}`);
  },
  
  /**
   * Get product categories
   * @returns {Promise} - Promise resolving to categories data
   */
  getCategories: () => {
    return api.get('/categories');
  },
};

export default productService; 