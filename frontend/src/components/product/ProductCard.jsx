import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatVND } from '../../utils/currencyFormatter';

/**
 * Simple ProductCard component for studying
 */
const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  
  const handleAddToCart = () => {
    addItem(product);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            -{product.discount}%
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
        <p className="mt-1 text-sm text-gray-500 h-12 overflow-hidden">{product.description}</p>
        <div className="mt-2 flex items-center">
          {product.oldPrice && (
            <span className="text-sm text-gray-400 line-through mr-2">
              {formatVND(product.oldPrice)}
            </span>
          )}
          <span className="text-lg font-bold text-gray-900">{formatVND(product.price)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button 
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add to Cart
          </button>
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 