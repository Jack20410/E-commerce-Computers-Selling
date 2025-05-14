import api from './api';

/**
 * Service for product-related API operations
 */
const productService = {
  /**
   * Get all products without pagination
   */
  getAllProducts: async (params = {}) => {
    try {
      console.log('Fetching all products with params:', params);
      const response = await api.get('/api/products/all', { params });
      console.log('All products response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch all products');
      }
      return response.data;
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      throw error.response?.data || error;
    }
  },

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
      return response.data;
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
  searchProducts: async (query, page = 1, limit = 10, minPrice, maxPrice) => {
    const params = new URLSearchParams({
      query,
      page,
      limit,
      ...(minPrice ? { minPrice } : {}),
      ...(maxPrice ? { maxPrice } : {}),
    });
    const res = await fetch(`/api/products/search?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch search results');
    const data = await res.json();
    // Map lại id -> _id cho mỗi sản phẩm
    if (Array.isArray(data.products)) {
      data.products = data.products.map(p => ({
        ...p,
        _id: p._id || p.id, // Ưu tiên _id, fallback sang id
      }));
    }
    return data;
  },

  /**
   * Get products by category
   */
  getProductsByCategory: async (category, params = {}) => {
    try {
      console.log('Fetching products by category:', category, params);
      const response = await api.get(`/api/products/category/${category}`, { params });
      console.log('Category products response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch category products');
      }
      
      return response.data;
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
  deleteProductImage: async (productId, imageId) => {
    try {
      const response = await api.delete(`/api/products/${productId}/image`, {
        data: { imageId }
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete image');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error in deleteProductImage:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all specifications for a specific category
   */
  getSpecificationsByCategory: async (category) => {
    try {
      const response = await api.get(`/api/products/category/${category}/specifications`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch specifications');
      }
      return response.data.data || {};
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get variants of a product
   */
  getProductVariants: async (productId) => {
    try {
      const response = await api.get(`/api/products/${productId}/variants`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch product variants');
      }
      return response.data.data || [];
    } catch (error) {
      console.error('Error in getProductVariants:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Add a variant to a product
   */
  addProductVariant: async (productId, variantId, variantDescription = '') => {
    try {
      const response = await api.post(`/api/products/${productId}/variants`, {
        variantId,
        variantDescription
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to add product variant');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error in addProductVariant:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Remove a variant from a product
   */
  removeProductVariant: async (productId, variantId) => {
    try {
      const response = await api.delete(`/api/products/${productId}/variants/${variantId}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to remove product variant');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error in removeProductVariant:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update variant description
   */
  updateVariantDescription: async (productId, variantId, variantDescription) => {
    try {
      const response = await api.patch(`/api/products/${productId}/variants/${variantId}/description`, {
        variantDescription
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update variant description');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error in updateVariantDescription:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Search for potential variants for a product
   * This finds products of same category and brand with intelligent similarity ranking
   */
  searchPotentialVariants: async (productId, searchQuery = '') => {
    try {
      const params = searchQuery ? { query: searchQuery } : {};
      const response = await api.get(`/api/products/${productId}/potential-variants`, { params });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to search for potential variants');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in searchPotentialVariants:', error);
      throw error.response?.data || error;
    }
  },
};

export default productService;