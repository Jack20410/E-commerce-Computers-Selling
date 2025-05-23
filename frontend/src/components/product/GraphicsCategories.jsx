import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import productService from '../../services/productService';
import './CategorySlider.css';
import { Link } from 'react-router-dom';

const GraphicsCategories = () => {
  const [graphics, setGraphics] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchGraphicsCards();
  }, []);

  const fetchGraphicsCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProductsByCategory('graphicsCard', { 
        limit: 10,
        sort: '-createdAt'
      });
      
      setGraphics(response.data);
    } catch (error) {
      console.error('Error fetching graphics cards:', error);
      setError('Failed to load graphics cards. Please try again later.');
      setGraphics([]);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    const container = sliderRef.current;
    const scrollAmount = 300; // Width of one card
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    let newPosition;
    if (direction === 'next') {
      newPosition = Math.min(scrollPosition + scrollAmount, maxScroll);
    } else {
      newPosition = Math.max(scrollPosition - scrollAmount, 0);
    }
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Graphics Cards
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Elevate your visual experience with cutting-edge graphics cards
          </p>
        </div>
        <div className="mt-10 slider-container">
          <button 
            className="slider-button prev"
            onClick={() => scroll('prev')}
            disabled={scrollPosition === 0}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div 
            ref={sliderRef}
            className="slider-wrapper"
            style={{
              transform: `translateX(-${scrollPosition}px)`
            }}
          >
            {loading ? (
              <div className="flex justify-center items-center w-full py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3">Đang tải dữ liệu...</span>
              </div>
            ) : error ? (
              <div className="text-center w-full py-10 text-red-500">
                <p>{error}</p>
                <button 
                  onClick={() => fetchGraphicsCards()} 
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Thử lại
                </button>
              </div>
            ) : graphics.length === 0 ? (
              <div className="text-center w-full py-10">Không có sản phẩm nào.</div>
            ) : (
              graphics.map(gpu => (
                <div key={gpu._id} className="slider-card">
                  <ProductCard product={gpu} />
                </div>
              ))
            )}
          </div>
          <button 
            className="slider-button next"
            onClick={() => scroll('next')}
            disabled={!graphics.length || scrollPosition >= (graphics.length - 4) * 300}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="mt-10 text-center">
          <Link to="/products/category/graphicsCard" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          View ALl Graphics Cards
            <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GraphicsCategories;