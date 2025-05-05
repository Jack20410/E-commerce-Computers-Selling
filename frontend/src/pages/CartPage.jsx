import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import { formatVND } from '../utils/currencyFormatter';

const CartPage = () => {
  const { cart, clearCart } = useCart();
  const { items, total } = cart;

  // Simple tax calculation (for study purposes)
  const tax = total * 0.08;
  const shipping = total > 100 ? 0 : 10;
  const orderTotal = total + tax + shipping;

  return (
    <>
      <Helmet>
        <title>Your Cart | Computer Store</title>
        <meta name="description" content="View and manage items in your shopping cart" />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Link 
                    to="/products" 
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex justify-between border-b pb-4 mb-4">
                    <h2 className="text-lg font-semibold">Cart Items ({items.length})</h2>
                    <button 
                      onClick={clearCart}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      Clear Cart
                    </button>
                  </div>
                  {items.map(item => (
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
                  <span>{formatVND(total)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatVND(shipping)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Tax</span>
                  <span>{formatVND(tax)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-4 mt-2">
                  <span>Total</span>
                  <span>{formatVND(orderTotal)}</span>
                </div>
              </div>
              <button 
                className={`w-full py-3 rounded-lg mt-6 transition-colors ${
                  items.length === 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                disabled={items.length === 0}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage; 