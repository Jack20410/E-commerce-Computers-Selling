import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';
import { formatVND } from '../utils/currencyFormatter';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Product not found.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | Computer Store</title>
        <meta name="description" content={product.description} />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-100 rounded-lg flex items-center justify-center p-4 h-96">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <p className="text-gray-500">No image available</p>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-xl text-gray-800 mb-4">{formatVND(product.price)}</p>
            <p className="text-gray-600 mb-6">
              {product.description}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <label htmlFor="quantity" className="mr-2">Quantity:</label>
                <select 
                  id="quantity"
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border rounded-md px-2 py-1 mr-4"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage; 