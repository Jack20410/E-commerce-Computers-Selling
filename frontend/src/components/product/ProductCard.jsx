import React from 'react';

const ProductCard = ({ product }) => {
  const mainImage = product.images && product.images.length > 0
    ? product.images.find(img => img.isMain) || product.images[0]
    : null;

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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl border border-gray-100">
      <div className="relative group">
        {mainImage ? (
          <img
            src={`http://localhost:3001${mainImage.url}`}
            alt={product.model}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
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
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{product.brand} {product.model}</h3>
        {/* Đã bỏ phần mô tả và thông số kỹ thuật */}
        <div className="text-blue-600 font-extrabold text-lg mb-2">
          {product.price.toLocaleString('vi-VN')}₫
        </div>
        <div className="mt-auto flex justify-between items-center pt-4">
          <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `Còn: ${product.stock}` : 'Hết hàng'}
          </span>
          <a
            href={`/products/${product._id}`}
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-1.5 rounded-lg shadow hover:from-blue-700 hover:to-blue-900 text-xs font-semibold transition-colors"
          >
            Add to Cart
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;