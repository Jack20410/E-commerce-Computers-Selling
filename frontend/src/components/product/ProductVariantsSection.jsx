import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import { getImageUrl, getPlaceholderImage } from '../../utils/imageUtils';

// New component to display comparison between products
const VariantComparison = ({ currentProduct, variantProduct }) => {
  if (!currentProduct || !variantProduct) return null;
  
  // Get all specification keys from both products
  const allKeys = new Set([
    ...Object.keys(currentProduct.specifications || {}),
    ...Object.keys(variantProduct.specifications || {})
  ]);
  
  // Filter to only show keys that have different values
  const differences = Array.from(allKeys).filter(key => {
    const currentValue = currentProduct.specifications?.[key];
    const variantValue = variantProduct.specifications?.[key];
    
    // Consider arrays, objects, and primitive values
    if (Array.isArray(currentValue) && Array.isArray(variantValue)) {
      return JSON.stringify(currentValue) !== JSON.stringify(variantValue);
    }
    
    return currentValue !== variantValue;
  });
  
  if (differences.length === 0) return <p className="text-sm italic">No specification differences found</p>;
  
  return (
    <div className="mt-3 border rounded p-3 bg-gray-50">
      <h4 className="font-medium mb-2">Key Differences:</h4>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="font-medium">Specification</div>
        <div className="font-medium">Current Product</div>
        <div className="font-medium">Selected Variant</div>
        
        {differences.map(key => (
          <React.Fragment key={key}>
            <div className="py-1 border-t">{key}</div>
            <div className="py-1 border-t">{formatSpecValue(currentProduct.specifications?.[key])}</div>
            <div className="py-1 border-t">{formatSpecValue(variantProduct.specifications?.[key])}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Helper to format specification values for display
const formatSpecValue = (value) => {
  if (value === undefined || value === null) return 'N/A';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};

const ProductVariantsSection = ({ productId, productModel, onVariantsChange, refreshKey }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [variantDescription, setVariantDescription] = useState('');
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [compareMode, setCompareMode] = useState(false);

  // Fetch current product to get its category and brand
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

  // Fetch existing variants
  useEffect(() => {
    const fetchVariants = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setError('');
        const variantsData = await productService.getProductVariants(productId);
        setVariants(variantsData);
        if (onVariantsChange) {
          onVariantsChange(variantsData);
        }
      } catch (err) {
        console.error('Error fetching variants:', err);
        setError('Failed to load variants');
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [productId, refreshKey]);

  // Function to search for potential variants (products with same category and brand)
  const searchPotentialVariants = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError('');
      
      // Use the intelligent search functionality without requiring a search term
      const response = await productService.searchPotentialVariants(productId);
      
      // Results are already filtered and sorted for relevance and similarity
      setSearchResults(response.data);
      
    } catch (err) {
      console.error('Error searching potential variants:', err);
      setError('Failed to load potential variants: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  // Load potential variants when component mounts
  useEffect(() => {
    if (productId && currentProduct) {
      searchPotentialVariants();
    }
  }, [productId, currentProduct]);

  // Add a variant
  const addVariant = async () => {
    if (!selectedProductId) return;

    try {
      setIsAddingVariant(true);
      setError('');
      
      await productService.addProductVariant(productId, selectedProductId, variantDescription);
      
      // Refresh variants
      const variantsData = await productService.getProductVariants(productId);
      setVariants(variantsData);
      if (onVariantsChange) {
        onVariantsChange(variantsData);
      }
      
      // Clear form
      setSelectedProductId('');
      setVariantDescription('');
      setSelectedVariant(null);
      setCompareMode(false);
      
      // Reload potential variants list
      searchPotentialVariants();
    } catch (err) {
      console.error('Error adding variant:', err);
      setError('Failed to add variant: ' + (err.message || 'Unknown error'));
    } finally {
      setIsAddingVariant(false);
    }
  };

  // Remove a variant
  const removeVariant = async (variantId) => {
    if (!window.confirm('Are you sure you want to remove this variant?')) return;

    try {
      setLoading(true);
      setError('');
      
      await productService.removeProductVariant(productId, variantId);
      
      // Refresh variants
      const variantsData = await productService.getProductVariants(productId);
      setVariants(variantsData);
      if (onVariantsChange) {
        onVariantsChange(variantsData);
      }
    } catch (err) {
      console.error('Error removing variant:', err);
      setError('Failed to remove variant');
    } finally {
      setLoading(false);
    }
  };

  // Handle selection of a search result
  const handleSelectProduct = async (product) => {
    setSelectedProductId(product._id);
    setSelectedVariant(product);
    setCompareMode(true);
    
    // Auto-generate a variant description based on key differences
    if (currentProduct && product) {
      try {
        // Get all specification keys from both products
        const allKeys = new Set([
          ...Object.keys(currentProduct.specifications || {}),
          ...Object.keys(product.specifications || {})
        ]);
        
        // Filter to only show keys that have different values
        const differences = Array.from(allKeys).filter(key => {
          const currentValue = currentProduct.specifications?.[key];
          const variantValue = product.specifications?.[key];
          return currentValue !== variantValue;
        });
        
        if (differences.length > 0) {
          // Generate a description based on the first few significant differences
          const keyDiffs = differences.slice(0, 3).map(key => {
            const value = product.specifications?.[key];
            if (value) {
              return `${key}: ${formatSpecValue(value)}`;
            }
            return '';
          }).filter(Boolean);
          
          if (keyDiffs.length > 0) {
            setVariantDescription(keyDiffs.join(', '));
          }
        }
      } catch (err) {
        console.error('Error generating variant description:', err);
      }
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  // Get the main image for a product
  const getProductMainImage = (product) => {
    if (!product || !product.images || product.images.length === 0) {
      return getPlaceholderImage(product?.category || 'pc');
    }
    
    const mainImage = product.images.find(img => img.isMain) || product.images[0];
    return getImageUrl(mainImage.url);
  };

  // Format specification differences to display
  const formatSpecDifferences = (variant) => {
    if (!variant || !variant.specifications) return 'N/A';
    
    const differences = [];
    
    // Check if there's a variant description
    if (variant.variantDescription) {
      return variant.variantDescription;
    }
    
    // Otherwise, try to identify key differences
    if (currentProduct && currentProduct.specifications) {
      const diffKeys = Object.keys(variant.specifications).filter(key => {
        return variant.specifications[key] !== currentProduct.specifications[key];
      });
      
      const significantDiffs = diffKeys.slice(0, 3).map(key => {
        return `${key}: ${formatSpecValue(variant.specifications[key])}`;
      });
      
      if (significantDiffs.length > 0) {
        return significantDiffs.join(' | ');
      }
    }
    
    // Fallback to just showing some specs
    const specKeys = Object.keys(variant.specifications);
    const keySpecs = specKeys.slice(0, 3); // Just show first 3 specs
    
    keySpecs.forEach(key => {
      const value = formatSpecValue(variant.specifications[key]);
      if (value) {
        differences.push(`${key}: ${value}`);
      }
    });
    
    return differences.join(' | ') || 'Different specifications';
  };

  return (
    <div className="mt-8 border rounded-lg p-4 bg-white">
      <h2 className="text-xl font-bold mb-4">Product Variants</h2>
      
      {/* Current Variants */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Current Variants</h3>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : variants.length === 0 ? (
          <div className="text-gray-500 italic">No variants added yet</div>
        ) : (
          <ul className="border rounded divide-y">
            {variants.map(variant => (
              <li key={variant._id} className="p-3 flex items-center">
                <img 
                  src={getProductMainImage(variant)}
                  alt={variant.model}
                  className="w-16 h-16 object-contain rounded border mr-4"
                />
                <div className="flex-1">
                  <div className="font-medium">{variant.brand} {variant.model}</div>
                  <div className="text-sm text-gray-600">{formatSpecDifferences(variant)}</div>
                  <div className="flex space-x-2 text-sm mt-1">
                    <span className="text-blue-600 font-medium">{formatPrice(variant.price)}</span>
                    <span className={variant.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                      {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link 
                    to={`/admin/products/edit/${variant._id}`}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => removeVariant(variant._id)}
                    className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Add New Variant */}
      <div>
        <h3 className="font-medium mb-3">Add New Variant</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Select a product with same category ({currentProduct?.category}) and brand ({currentProduct?.brand})
            </p>
            <div className="flex space-x-2">
              <select
                className="flex-1 p-2 border rounded"
                value={selectedProductId}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (selectedId) {
                    const product = searchResults.find(p => p._id === selectedId);
                    if (product) {
                      handleSelectProduct(product);
                    }
                  } else {
                    setSelectedProductId('');
                    setSelectedVariant(null);
                    setCompareMode(false);
                  }
                }}
              >
                <option value="">-- Select a product --</option>
                {searchResults.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.model} - {formatPrice(product.price)} - {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={searchPotentialVariants}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loading || !currentProduct}
              >
                {loading ? 'Loading...' : 'Load Products'}
              </button>
            </div>
          </div>
          
          {/* Comparison and Variant Description */}
          {compareMode && selectedVariant && (
            <div className="border rounded p-4">
              <h4 className="font-medium mb-3">Variant Comparison</h4>
              <VariantComparison 
                currentProduct={currentProduct} 
                variantProduct={selectedVariant} 
              />
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant Description <span className="text-gray-500">(How this variant differs from the main product)</span>
                </label>
                <input
                  type="text"
                  value={variantDescription}
                  onChange={(e) => setVariantDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="e.g. Higher RAM, Different color"
                />
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2"
                  onClick={() => {
                    setSelectedProductId('');
                    setSelectedVariant(null);
                    setCompareMode(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addVariant}
                  disabled={isAddingVariant || !selectedProductId}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isAddingVariant ? 'Adding...' : 'Add Variant'}
                </button>
              </div>
            </div>
          )}
          
          {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default ProductVariantsSection; 