import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

/**
 * Simple CartItem component for studying
 */
function CartItem({ item }) {
  const { removeItem, updateQuantity } = useCart();
  
  const handleRemove = () => {
    removeItem(item.id);
  };
  
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity);
    }
  };
  
  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      <img 
        src={item.image || 'https://via.placeholder.com/80x80'} 
        alt={item.name}
        className="w-20 h-20 object-cover rounded"
      />
      
      <div className="flex-1 ml-4">
        <h3 className="text-lg font-medium">{item.name}</h3>
        <p className="text-gray-600 text-sm">{formatPrice(item.price)}</p>
      </div>
      
      <div className="flex items-center">
        <select 
          value={item.quantity} 
          onChange={handleQuantityChange}
          className="border rounded-md px-2 py-1 mr-4"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
        
        <button 
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default CartItem; 