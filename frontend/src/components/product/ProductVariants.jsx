import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';

// Comparison Modal Component
const VariantComparisonModal = ({ currentProduct, variant, onClose }) => {
  if (!currentProduct || !variant) return null;
  
  // Get all specification keys from both products
  const allKeys = new Set([
    ...Object.keys(currentProduct.specifications || {}),
    ...Object.keys(variant.specifications || {})
  ]);
  
  // Organize keys by importance/category
  const organizeSpecs = (keys) => {
    // Define key categories based on product type
    const categoryMapping = {
      pc: {
        primary: ['processor', 'ram', 'graphicsCard', 'storage'],
        secondary: ['motherboard', 'powerSupply', 'case', 'operatingSystem'],
        other: []
      },
      laptop: {
        primary: ['processor', 'ram', 'graphicsCard', 'storage', 'displaySize'],
        secondary: ['batteryLife', 'weight', 'operatingSystem'],
        other: []
      },
      // Add other categories as needed
      default: {
        primary: [],
        secondary: [],
        other: []
      }
    };
    
    const category = currentProduct.category || 'default';
    const mapping = categoryMapping[category] || categoryMapping.default;
    
    // Sort keys into categories
    const organized = {
      primary: [],
      secondary: [],
      other: []
    };
    
    keys.forEach(key => {
      if (mapping.primary.includes(key.toLowerCase())) {
        organized.primary.push(key);
      } else if (mapping.secondary.includes(key.toLowerCase())) {
        organized.secondary.push(key);
      } else {
        organized.other.push(key);
      }
    });
    
    return organized;
  };
  
  const organizedKeys = organizeSpecs(allKeys);
  
  // Helper to format specification values for display
  const formatSpecValue = (value) => {
    if (value === undefined || value === null) return 'N/A';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };
  
  // Helper to determine if values are different
  const areValuesDifferent = (val1, val2) => {
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return JSON.stringify(val1) !== JSON.stringify(val2);
    }
    return val1 !== val2;
  };
  
  // Define a row renderer for specs
  const renderSpecRow = (key) => {
    const currentValue = currentProduct.specifications?.[key];
    const variantValue = variant.specifications?.[key];
    const isDifferent = areValuesDifferent(currentValue, variantValue);
    
    return (
      <tr key={key} className={isDifferent ? 'bg-yellow-50' : ''}>
        <td className="py-2 px-4 border-b font-medium">{key}</td>
        <td className={`py-2 px-4 border-b ${isDifferent ? 'font-medium' : ''}`}>
          {formatSpecValue(currentValue)}
        </td>
        <td className={`py-2 px-4 border-b ${isDifferent ? 'font-medium text-blue-700' : ''}`}>
          {formatSpecValue(variantValue)}
        </td>
      </tr>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold">Product Comparison</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {/* Product Headers */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-1"></div>
            <div className="text-center">
              <div className="font-bold mb-2">Current Product</div>
              <div className="h-24 flex items-center justify-center">
                <img 
                  src={getProductMainImage(currentProduct)} 
                  alt={currentProduct.model}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="mt-2 font-medium">{currentProduct.brand} {currentProduct.model}</div>
              <div className="text-blue-600 font-bold">{currentProduct.price.toLocaleString('vi-VN')}₫</div>
            </div>
            <div className="text-center">
              <div className="font-bold mb-2">Variant</div>
              <div className="h-24 flex items-center justify-center">
                <img 
                  src={getProductMainImage(variant)} 
                  alt={variant.model}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="mt-2 font-medium">{variant.brand} {variant.model}</div>
              <div className="text-blue-600 font-bold">{variant.price.toLocaleString('vi-VN')}₫</div>
            </div>
          </div>
          
          {/* Variant Description */}
          {variant.variantDescription && (
            <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6">
              <div className="font-bold mb-1">Variant Description:</div>
              <div>{variant.variantDescription}</div>
            </div>
          )}
          
          {/* Specifications Table */}
          <div className="border rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-gray-700 w-1/3">Specification</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-700">Current Product</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-700">Variant</th>
                </tr>
              </thead>
              <tbody>
                {/* Primary Specs */}
                {organizedKeys.primary.length > 0 && (
                  <>
                    <tr>
                      <td colSpan="3" className="py-2 px-4 bg-gray-100 font-medium">Primary Specifications</td>
                    </tr>
                    {organizedKeys.primary.map(renderSpecRow)}
                  </>
                )}
                
                {/* Secondary Specs */}
                {organizedKeys.secondary.length > 0 && (
                  <>
                    <tr>
                      <td colSpan="3" className="py-2 px-4 bg-gray-100 font-medium">Secondary Specifications</td>
                    </tr>
                    {organizedKeys.secondary.map(renderSpecRow)}
                  </>
                )}
                
                {/* Other Specs */}
                {organizedKeys.other.length > 0 && (
                  <>
                    <tr>
                      <td colSpan="3" className="py-2 px-4 bg-gray-100 font-medium">Other Specifications</td>
                    </tr>
                    {organizedKeys.other.map(renderSpecRow)}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductVariants = ({ productId }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [displayType, setDisplayType] = useState('grid'); // 'grid' or 'table'

  // Fetch current product
  useEffect(() => {
    const fetchCurrentProduct = async () => {
      if (!productId) return;
      
      try {
        const product = await productService.getProductById(productId);
        setCurrentProduct(product);
      } catch (err) {
        console.error('Error fetching current product:', err);
      }
    };
    
    fetchCurrentProduct();
  }, [productId]);

  // Fetch variants
  useEffect(() => {
    const fetchVariants = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const variantsData = await productService.getProductVariants(productId);
        setVariants(variantsData);
      } catch (err) {
        console.error('Error fetching variants:', err);
        setError('Failed to load variants');
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [productId]);

  // Handle opening comparison modal
  const handleCompareVariant = (variant) => {
    setSelectedVariant(variant);
    setShowComparison(true);
  };

  if (loading) {
    return (
      <div className="animate-pulse flex flex-col space-y-3 mb-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return null; // Don't show errors to end users
  }

  if (!variants || variants.length === 0) {
    return null; // Don't display the section if there are no variants
  }

  // Get main image for a product
  const getProductMainImage = (product) => {
    if (!product || !product.images || product.images.length === 0) {
      return getPlaceholderImage(product?.category || 'pc');
    }
    
    const mainImage = product.images.find(img => img.isMain) || product.images[0];
    return getImageUrl(mainImage.url);
  };

  // Helper to format price
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  // Helper to determine the primary differentiator for display
  const getVariantDifferentiator = (variant) => {
    if (variant.variantDescription) {
      return variant.variantDescription;
    }
    
    // If no description, try to find meaningful specs differences
    if (variant.specifications && currentProduct?.specifications) {
      // Find differences between current product and variant
      const differentKeys = Object.keys(variant.specifications).filter(key => {
        const currentValue = currentProduct.specifications[key];
        const variantValue = variant.specifications[key];
        return currentValue !== variantValue;
      });
      
      if (differentKeys.length > 0) {
        // Generate a description based on the first few significant differences
        const keyDiffs = differentKeys.slice(0, 3).map(key => {
          const value = variant.specifications[key];
          return `${key}: ${formatSpecValue(value)}`;
        });
        
        return keyDiffs.join(', ');
      }
    }
    
    // If no differences found or no current product, use category-specific display
    if (variant.specifications) {
      // Different display based on category
      switch (variant.category) {
        case 'pc':
        case 'laptop':
          if (variant.specifications.processor) return `CPU: ${variant.specifications.processor}`;
          if (variant.specifications.ram) return `RAM: ${variant.specifications.ram}`;
          if (variant.specifications.storage) return `Storage: ${variant.specifications.storage}`;
          if (variant.specifications.graphicsCard) return `GPU: ${variant.specifications.graphicsCard}`;
          break;
        
        case 'memory':
          if (variant.specifications.capacity) return `${variant.specifications.capacity}`;
          break;
          
        case 'storage':
          if (variant.specifications.capacity) return `${variant.specifications.capacity}`;
          break;
          
        case 'graphicsCard':
          if (variant.specifications.memory) return `${variant.specifications.memory}`;
          break;
          
        default:
          // For other categories, use the first spec
          const firstKey = Object.keys(variant.specifications)[0];
          if (firstKey) {
            return `${firstKey}: ${variant.specifications[firstKey]}`;
          }
      }
    }
    
    // Fallback
    return 'Different configuration';
  };
  
  // Helper to format spec values
  const formatSpecValue = (value) => {
    if (value === undefined || value === null) return 'N/A';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Available Variants
        </h2>
        
        {/* View type toggle */}
        <div className="flex border rounded overflow-hidden">
          <button 
            className={`px-3 py-1 ${displayType === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setDisplayType('grid')}
            title="Grid View"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
            </svg>
          </button>
          <button 
            className={`px-3 py-1 ${displayType === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => setDisplayType('table')}
            title="Table View"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Variant Relationship Breadcrumb */}
      {currentProduct && (
        <div className="mb-4 bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Product Family:</div>
          <div className="flex flex-wrap items-center">
            <span className="font-medium text-blue-700">
              {currentProduct.brand} {currentProduct.model} Series
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <span className="text-gray-700">
              Showing {variants.length + 1} configuration{variants.length > 0 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap items-center mt-2 gap-1">
            <div className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs border border-blue-200 font-medium">
              Current: {currentProduct.specifications?.processor || currentProduct.specifications?.capacity || 'Base model'}
            </div>
            {variants.map((variant, index) => (
              <Link
                key={variant._id}
                to={`/products/${variant._id}`}
                className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs border border-gray-200 hover:bg-gray-200"
              >
                {variant.specifications?.processor || variant.specifications?.capacity || `Variant ${index + 1}`}
              </Link>
            ))}
          </div>
        </div>
      )}

      {displayType === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {variants.map(variant => (
            <div
              key={variant._id} 
              className="border rounded-lg overflow-hidden hover:shadow-md transition duration-200 flex flex-col"
            >
              <div className="aspect-video bg-gray-50 flex items-center justify-center">
                <Link to={`/products/${variant._id}`}>
                  <img 
                    src={getProductMainImage(variant)} 
                    alt={variant.model}
                    className="max-h-full max-w-full object-contain p-2"
                  />
                </Link>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <Link to={`/products/${variant._id}`} className="font-semibold text-blue-600 hover:underline">
                  {variant.brand} {variant.model}
                </Link>
                <div className="text-sm text-gray-600 mb-2">{getVariantDifferentiator(variant)}</div>
                <div className="mt-auto flex justify-between items-center">
                  <span className="font-bold text-blue-700">{formatPrice(variant.price)}</span>
                  <span className={`text-xs px-2 py-1 rounded ${variant.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {variant.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <button
                  onClick={() => handleCompareVariant(variant)}
                  className="mt-3 text-sm text-blue-600 underline hover:text-blue-800"
                >
                  Compare with current
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Table View
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Product</th>
                <th className="py-3 px-4 text-left font-medium text-gray-700">Key Differences</th>
                <th className="py-3 px-4 text-right font-medium text-gray-700">Price</th>
                <th className="py-3 px-4 text-center font-medium text-gray-700">Availability</th>
                <th className="py-3 px-4 text-center font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {variants.map(variant => (
                <tr key={variant._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <img 
                        src={getProductMainImage(variant)} 
                        alt={variant.model}
                        className="w-12 h-12 object-contain mr-3"
                      />
                      <Link to={`/products/${variant._id}`} className="font-medium text-blue-600 hover:underline">
                        {variant.brand} {variant.model}
                      </Link>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {getVariantDifferentiator(variant)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700">
                    {formatPrice(variant.price)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${variant.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {variant.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <Link 
                        to={`/products/${variant._id}`}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleCompareVariant(variant)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                      >
                        Compare
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Comparison Modal */}
      {showComparison && selectedVariant && (
        <VariantComparisonModal
          currentProduct={currentProduct}
          variant={selectedVariant}
          onClose={() => {
            setShowComparison(false);
            setSelectedVariant(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductVariants; 