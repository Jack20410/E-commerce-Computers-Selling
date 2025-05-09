import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import { formatVND } from '../utils/currencyFormatter';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartTotal } = useCart();
  
  // Simple tax calculation (for study purposes)
  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 5000000 ? 0 : 50000; // Free shipping over 5M VND
  const orderTotal = subtotal + tax + shipping;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <>
      <Helmet>
        <title>Your Cart | TechStation</title>
        <meta name="description" content="View and manage items in your shopping cart" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Link 
                    to="/products" 
                    className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 text-white px-6 py-2 rounded-lg transition-all duration-300"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex justify-between border-b pb-4 mb-4">
                    <h2 className="text-lg font-semibold">Cart Items ({cartItems.length})</h2>
                    <button 
                      onClick={clearCart}
                      className="text-sm text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      Clear Cart
                    </button>
                  </div>
                  {cartItems.map(item => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatVND(shipping)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax (8%)</span>
                  <span>{formatVND(tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-4 mt-2">
                  <span>Total</span>
                  <span>{formatVND(orderTotal)}</span>
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                className={`w-full py-3 rounded-lg mt-6 transition-all duration-300 ${
                  cartItems.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-blue-600 text-white transform hover:scale-[1.02]'
                }`}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage; 