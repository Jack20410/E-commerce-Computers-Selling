import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import ProductCard from './ProductCard';
import './CategorySlider.css';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getProducts({
        limit: 8,
        sort: '-createdAt'
      });

      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + 4 >= products.length ? 0 : prevIndex + 4
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 4 < 0 ? Math.max(0, products.length - 4) : prevIndex - 4
    );
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Newest Products
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Discover our top technology products
          </p>
        </div>

        <div className="mt-10">
          {loading ? (
            <div className="flex justify-center items-center w-full py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3">Loading products...</span>
            </div>
          ) : error ? (
            <div className="text-center w-full py-10 text-red-500">
              <p>{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center w-full py-10">No products available.</div>
          ) : (
            <div className="slider-container">
              <button 
                className="slider-button prev" 
                onClick={prevSlide}
                disabled={currentIndex === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div 
                className="slider-wrapper"
                style={{ transform: `translateX(-${currentIndex * (100 / 4)}%)` }}
              >
                {products.map((product) => (
                  <div key={product._id} className="slider-card">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              <button 
                className="slider-button next" 
                onClick={nextSlide}
                disabled={currentIndex + 4 >= products.length}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
