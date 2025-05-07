import { createContext, useContext, useState, useEffect } from 'react';

const CART_STORAGE_KEY = 'techstation_cart';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Helper function to get cart from localStorage
const getStoredCart = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

// Helper function to save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage
  const [cartItems, setCartItems] = useState(getStoredCart);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product || !product.id) {
      console.error('Invalid product:', product);
      return false;
    }

    let success = true;
    setCartItems(prevItems => {
      const items = Array.isArray(prevItems) ? prevItems : [];
      const existingItemIndex = items.findIndex(item => item.id === product.id);
      
      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = items.map((item, index) => {
          if (index === existingItemIndex) {
            const newQuantity = (item.quantity || 0) + 1;
            if (product.stock && newQuantity > product.stock) {
              success = false;
              return item;
            }
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
      } else {
        // Add new item
        const newItem = {
          id: product.id,
          name: product.name || `${product.brand} ${product.model}`,
          price: Number(product.price) || 0,
          image: product.image,
          brand: product.brand,
          model: product.model,
          category: product.category,
          quantity: 1,
          stock: product.stock
        };
        updatedItems = [...items, newItem];
      }

      // Save to localStorage immediately after update
      saveCartToStorage(updatedItems);
      return updatedItems;
    });

    return success;
  };

  const removeFromCart = (productId) => {
    if (!productId) return;
    
    setCartItems(prevItems => {
      const items = Array.isArray(prevItems) ? prevItems : [];
      const updatedItems = items.filter(item => item.id !== productId);
      // Save to localStorage immediately after update
      saveCartToStorage(updatedItems);
      return updatedItems;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (!productId || typeof newQuantity !== 'number' || newQuantity < 0) return false;
    
    let success = true;
    setCartItems(prevItems => {
      const items = Array.isArray(prevItems) ? prevItems : [];
      
      const updatedItems = items.map(item => {
        if (item.id === productId) {
          if (item.stock && newQuantity > item.stock) {
            success = false;
            return item;
          }
          if (newQuantity === 0) {
            return null;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean);

      // Save to localStorage immediately after update
      saveCartToStorage(updatedItems);
      return updatedItems;
    });

    return success;
  };

  const clearCart = () => {
    setCartItems([]);
    // Clear localStorage
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  };

  const getCartTotal = () => {
    if (!Array.isArray(cartItems)) return 0;
    
    try {
      return cartItems.reduce((total, item) => {
        if (!item) return total;
        const itemPrice = parseFloat(item.price) || 0;
        const itemQuantity = parseInt(item.quantity) || 0;
        return total + (itemPrice * itemQuantity);
      }, 0);
    } catch (error) {
      console.error('Error calculating cart total:', error);
      return 0;
    }
  };

  const getCartItemsCount = () => {
    if (!Array.isArray(cartItems)) return 0;
    
    try {
      return cartItems.reduce((total, item) => {
        if (!item) return total;
        const itemQuantity = parseInt(item.quantity) || 0;
        return total + itemQuantity;
      }, 0);
    } catch (error) {
      console.error('Error calculating cart items count:', error);
      return 0;
    }
  };

  // Check if a product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Get quantity of a specific product in cart
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems: Array.isArray(cartItems) ? cartItems : [],
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getItemQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 