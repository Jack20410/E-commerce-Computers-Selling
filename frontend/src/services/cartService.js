import api from './api';

/**
 * Simple cart service for studying
 */
const cartService = {
  /**
   * Get cart items
   * @returns {Promise} - Promise resolving to cart data
   */
  getCart: () => {
    return api.get('/cart');
  },
  
  /**
   * Add item to cart
   * @param {Object} item - Product to add to cart
   * @returns {Promise} - Promise resolving to updated cart
   */
  addToCart: (item) => {
    return api.post('/cart/items', item);
  },
  
  /**
   * Remove item from cart
   * @param {string|number} productId - ID of product to remove
   * @returns {Promise} - Promise resolving to updated cart
   */
  removeFromCart: (productId) => {
    return api.delete(`/cart/items/${productId}`);
  },
  
  /**
   * Update item quantity in cart
   * @param {string|number} productId - ID of product to update
   * @param {number} quantity - New quantity
   * @returns {Promise} - Promise resolving to updated cart
   */
  updateQuantity: (productId, quantity) => {
    return api.put(`/cart/items/${productId}`, { quantity });
  },
  
  /**
   * Clear the cart
   * @returns {Promise} - Promise resolving to empty cart
   */
  clearCart: () => {
    return api.delete('/cart');
  }
};

export default cartService; 