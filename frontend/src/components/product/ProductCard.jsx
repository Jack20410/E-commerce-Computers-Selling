import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const mainImage = product.images && product.images.length > 0
    ? product.images.find(img => img.isMain) || product.images[0]
    : null;

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    navigate(`/products/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking the add to cart button
    
    // Get current quantity in cart
    const currentQty = getItemQuantity(product._id);
    
    // Check if adding one more would exceed stock
    if (currentQty >= product.stock) {
      // Could add a toast notification here
      return;
    }

    setIsAdding(true);
    
    const productToAdd = {
      id: product._id,
      name: `${product.brand} ${product.model}`,
      price: product.price,
      image: product.images?.[0]?.url ? getImageUrl(product.images[0].url) : getPlaceholderImage(product.category),
      brand: product.brand,
      model: product.model,
      category: product.category,
      stock: product.stock
    };

    const success = addToCart(productToAdd);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const renderSpecs = () => {
    if (!product.specifications) return null;
    const specs = product.specifications;
    switch (product.category) {
      case 'laptop':
        return (
          <ul className="text-xs text-gray-600 space-y-1 mt-2">
            <li><span className="font-semibold">CPU:</span> {specs.processor}</li>
            <li><span className="font-semibold">RAM:</span> {specs.ram}</li>
            <li><span className="font-semibold">Storage:</span> {specs.storage}</li>
            <li><span className="font-semibold">Display:</span> {specs.displaySize}</li>
            <li><span className="font-semibold">GPU:</span> {specs.graphicsCard}</li>
          </ul>
        );
      case 'pc':
        return (
          <ul className="text-xs text-gray-600 space-y-1 mt-2">
            <li><span className="font-semibold">CPU:</span> {specs.processor}</li>
            <li><span className="font-semibold">RAM:</span> {specs.ram}</li>
            <li><span className="font-semibold">Storage:</span> {specs.storage}</li>
            <li><span className="font-semibold">GPU:</span> {specs.graphicsCard}</li>
            <li><span className="font-semibold">Mainboard:</span> {specs.motherboard}</li>
          </ul>
        );
      default:
        return (
          <ul className="text-xs text-gray-600 space-y-1 mt-2">
            {Object.entries(specs).slice(0, 5).map(([key, value]) => (
              <li key={key}><span className="font-semibold">{key}:</span> {String(value)}</li>
            ))}
          </ul>
        );
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl border border-gray-100 cursor-pointer group"
    >
      <div className="relative w-full aspect-square overflow-hidden">
        {mainImage ? (
          <img
            src={getImageUrl(mainImage.url)}
            alt={product.model}
            className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            <img
              src={getPlaceholderImage(product.category)}
              alt="No Image"
              className="w-full h-full object-contain opacity-50"
            />
          </div>
        )}
        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow">
          {product.category ? product.category.toUpperCase() : 'NO CATEGORY'}
        </span>
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow">
            Out of Stock
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Brand Badge */}
        {product.brand && (
          <span className="inline-block bg-gray-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded mb-1">
            {product.brand}
          </span>
        )}
        <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {product.name || product.model}
        </h3>
        <div className="text-blue-600 font-extrabold text-base sm:text-lg mb-2">
          {product.price.toLocaleString('vi-VN')}₫
        </div>
        <div className="mt-auto flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 pt-3">
          <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || isAdding}
            className={`inline-flex items-center space-x-1 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              product.stock === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isAdding
                ? 'bg-green-500 text-white cursor-wait'
                : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 hover:shadow-md active:scale-95'
            }`}
          >
            {isAdding ? (
              <>
                <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;