import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

/**
 * Simple ProductCard component for studying
 */
function ProductCard({ product }) {
  const { addItem } = useCart();
  
  const handleAddToCart = () => {
    addItem(product);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={`/products/${product.id}`}>
        <img 
          src={product.image || 'https://via.placeholder.com/300x200'} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>
      
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        </Link>
        
        <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">{formatPrice(product.price)}</span>
          <button 
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard; 