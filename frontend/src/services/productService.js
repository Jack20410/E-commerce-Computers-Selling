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
      // productData should already be FormData
      if (!(productData instanceof FormData)) {
        throw new Error('Product data must be FormData');
      }
      
      // Add a timestamp to prevent caching
      productData.append('_timestamp', Date.now());

      // Check and parse specifications to ensure it's valid JSON
      const specificationsStr = productData.get('specifications');
      if (specificationsStr) {
        try {
          // Validate JSON format
          const parsedSpecs = JSON.parse(specificationsStr);
          console.log('Valid specifications JSON:', parsedSpecs);
          
          // If parsing was successful, replace the specifications with the validated string
          productData.delete('specifications');
          productData.append('specifications', JSON.stringify(parsedSpecs));
        } catch (e) {
          console.error('Invalid JSON in specifications:', e);
          throw new Error('Specifications must be a valid JSON object');
        }
      }

      // Log what's in the FormData (for debugging)
      console.log('Creating product with FormData:');
      for (let pair of productData.entries()) {
        if (pair[0] === 'images') {
          console.log(pair[0], ':', pair[1].name);
        } else {
          console.log(pair[0], ':', pair[1]);
        }
      }

      // Important: Let axios set the correct multipart/form-data content-type with boundary
      const response = await api.post('/api/products', productData);

      console.log('Backend response:', response);

      if (!response.data || !response.data.success) {
        const errorMessage = response.data?.message || 'Failed to create product';
        console.error('API Error Response:', response.data);
        throw new Error(errorMessage);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error in createProduct:', error);
      if (error.response?.data) {
        console.error('Response error data:', error.response.data);
        throw error.response.data;
      }
      throw error;
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
      // productData should already be FormData
      if (!(productData instanceof FormData)) {
        throw new Error('Product data must be FormData');
      }

      // Log FormData contents for debugging
      console.log('Updating product with FormData:');
      for (let pair of productData.entries()) {
        if (pair[0] === 'images') {
          console.log(pair[0], ':', pair[1].name);
        } else {
          console.log(pair[0], ':', pair[1]);
        }
      }

      const response = await api.put(`/api/products/${id}`, productData);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update product');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      if (error.response?.data) {
        console.error('Response error data:', error.response.data);
        throw error.response.data;
      }
      throw error;
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
  searchProducts: async (query, page = 1, limit = 10) => {
    const res = await fetch(`/api/products/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch search results');
    return res.json();
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