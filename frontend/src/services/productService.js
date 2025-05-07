import api from './api';

/**
 * Service for product-related API operations
 */
const productService = {
  /**
   * Get all products with optional filtering and pagination
   */
  getProducts: async (params = {}) => {
    try {
      console.log('Fetching products with params:', params);
      const response = await api.get('/api/products', { params });
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
   * Create a new product
   */
  createProduct: async (productData) => {
    try {
      const formData = new FormData();
      
      // Handle images if present
      if (productData.images) {
        productData.images.forEach(image => {
          formData.append('images', image);
        });
        delete productData.images;
      }

      // Add other product data
      Object.keys(productData).forEach(key => {
        formData.append(key, productData[key]);
      });

      const response = await api.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create product');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error in createProduct:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get a single product by ID
   */
  getProductById: async (id) => {
    try {
      console.log('Fetching product with ID:', id);
      const response = await api.get(`/api/products/${id}`);
      console.log('Product response:', response.data);
      
      if (!response.data) {
        throw new Error('No response data received');
      }

      return response.data.data || response.data;
      
    } catch (error) {
      console.error('Error in getProductById:', error);
      throw error;
    }
  },

  /**
   * Update a product
   */
  updateProduct: async (id, productData) => {
    try {
      const formData = new FormData();
      
      // Handle images if present
      if (productData.images) {
        productData.images.forEach(image => {
          formData.append('images', image);
        });
        delete productData.images;
      }

      // Add other product data
      Object.keys(productData).forEach(key => {
        formData.append(key, productData[key]);
      });

      const response = await api.put(`/api/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update product');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete a product
   */
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/api/products/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete product');
      }
      return response.data.message;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Search products
   */
  searchProducts: async (query, params = {}) => {
    try {
      console.log('Searching products:', query, params);
      const response = await api.get('/api/products/search', {
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
   */
  getProductsByCategory: async (category, params = {}) => {
    try {
      console.log('Fetching products by category:', category, params);
      const response = await api.get(`/api/products/category/${category}`, { params });
      console.log('Category products response:', response.data);
      
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      if (response.data.data) {
        return {
          data: response.data.data,
          pagination: response.data.pagination || {}
        };
      }
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch category products');
      }
      
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      console.error('Original error details:', error.response?.data || error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get similar products for a specific product
   */
  getSimilarProducts: async (category, productId) => {
    try {
      console.log('Fetching similar products for:', category, 'excluding:', productId);
      const response = await api.get(`/api/products/similar/${category}/${productId}`);
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
   * Get all brands for a specific category
   */
  getBrandsByCategory: async (category) => {
    try {
      const response = await api.get(`/api/products/category/${category}/brands`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch brands');
      }
      return response.data.data || [];
    } catch (error) {
      console.error('Error in getBrandsByCategory:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update product stock
   */
  updateStock: async (id, stock) => {
    try {
      const response = await api.patch(`/api/products/${id}/stock`, { stock });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update stock');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error in updateStock:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Add images to a product
   */
  addProductImages: async (id, images) => {
    try {
      const formData = new FormData();
      images.forEach(image => {
        formData.append('images', image);
      });

      const response = await api.post(`/api/products/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add images');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error in addProductImages:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Delete a product image
   */
  deleteProductImage: async (id, imageUrl) => {
    try {
      const response = await api.delete(`/api/products/${id}/images`, {
        data: { imageUrl }
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete image');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error in deleteProductImage:', error);
      throw error.response?.data || error;
    }
  }
};

export default productService; 