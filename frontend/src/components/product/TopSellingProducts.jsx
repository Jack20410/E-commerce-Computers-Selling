import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import ProductCard from './ProductCard';

const TopSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching top selling products...');
      const response = await orderService.getTopSellingProductsHomePage(4);
      console.log('API Response received:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        // Transform the top selling product data to match the format expected by ProductCard
        const formattedProducts = response.data.map(product => ({
          _id: product.id,
          brand: product.name.split(' ')[0] || '',
          model: product.name.split(' ').slice(1).join(' ') || product.name,
          category: product.category,
          price: product.price || 0,
          stock: 99, // Assuming these are in stock since they're top selling
          images: product.image ? [{ url: product.image, isMain: true }] : [],
          specifications: {},
          // Add a badge for top seller
          isBestSeller: true,
          soldCount: product.soldCount || 0
        }));
        
        setProducts(formattedProducts);
      } else {
        console.error('Invalid API response format:', response);
        setError('Could not load top selling products');
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching top products:', err);
      setError('Error loading products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // If no products and not loading, don't show section
  if (products.length === 0 && !loading) {
    return null;
  }

  return (
    <section className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Best Sellers
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Our most popular products based on sales
          </p>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3">Loading products...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">
              <p>{error}</p>
              <button 
                onClick={fetchTopProducts}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <div key={product._id} className="relative">
                  {/* Add a "Top Seller" badge */}
                  <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    TOP SELLER
                  </div>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TopSellingProducts; 