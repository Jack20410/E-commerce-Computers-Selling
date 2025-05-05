import { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  items: [],
  total: 0,
};

// Create context
const CartContext = createContext(initialState);

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id
      );

      let updatedItems;

      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        updatedItems = state.items.map((item, index) => {
          if (index === existingItemIndex) {
            return { 
              ...item, 
              quantity: item.quantity + (action.payload.quantity || 1),
            };
          }
          return item;
        });
      } else {
        // Item doesn't exist, add to cart
        updatedItems = [
          ...state.items,
          { ...action.payload, quantity: action.payload.quantity || 1 },
        ];
      }

      // Calculate new total
      const total = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );

      return { items: updatedItems, total };
    }

    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload
      );

      // Calculate new total
      const total = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );

      return { items: updatedItems, total };
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map((item) => {
        if (item.id === action.payload.id) {
          return { ...item, quantity: action.payload.quantity };
        }
        return item;
      });

      // Calculate new total
      const total = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );

      return { items: updatedItems, total };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}

// Cart provider component
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState, () => {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : initialState;
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  // Add item to cart
  const addItem = (product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...product, quantity },
    });
  };

  // Remove item from cart
  const removeItem = (productId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: productId,
    });
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: productId, quantity },
    });
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        cart: state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext; 