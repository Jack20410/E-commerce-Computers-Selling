import { useCart } from '../../context/CartContext';
import { formatVND } from '../../utils/currencyFormatter';

/**
 * Simple CartItem component for studying
 */
const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();
  
  const handleRemove = () => {
    removeFromCart(item.id);
  };
  
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateQuantity(item.id, newQuantity);
    }
  };
  
  if (!item) return null;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
      <div className="w-20 h-20 flex-shrink-0">
        <img 
          src={item.image || '/placeholder-image.jpg'} 
          alt={item.name}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg';
            e.target.onerror = null;
          }}
        />
      </div>
      
      <div className="flex-1">
        <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
        <p className="text-gray-600 text-sm mt-1">
          {item.brand} {item.model}
        </p>
        <p className="text-blue-600 font-medium mt-1">{formatVND(item.price)}</p>
      </div>
      
      <div className="flex items-center gap-4">
        <select 
          value={item.quantity} 
          onChange={handleQuantityChange}
          className="border rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {Array.from({ length: Math.min(10, item.stock || 10) }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
        
        <button 
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700 transition-colors duration-200"
          aria-label="Remove item"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem; 