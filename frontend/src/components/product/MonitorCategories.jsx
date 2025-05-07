import React, { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import productService from '../../services/productService';
import './CategorySlider.css';
import { Link } from 'react-router-dom';

const MonitorCategories = () => {
  const [monitors, setMonitors] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchMonitors();
  }, []);

  const fetchMonitors = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productService.getProductsByCategory('monitor', { 
        limit: 10,
        sort: '-createdAt',
        ...filterParams 
      });
      
      if (response.data && Array.isArray(response.data)) {
        setMonitors(response.data);
      } else {
        setError('Could not load products');
        setMonitors([]);
      }
    } catch (err) {
      console.error('Error fetching monitors:', err);
      setError('Could not connect to server');
      setMonitors([]);
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
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Monitors
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Find the perfect display for your setup
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
                <span className="ml-3">Loading data...</span>
              </div>
            ) : error ? (
              <div className="text-center w-full py-10 text-red-500">
                <p>{error}</p>
                <button 
                  onClick={() => fetchMonitors()} 
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            ) : monitors.length === 0 ? (
              <div className="text-center w-full py-10">No products found.</div>
            ) : (
              monitors.map(monitor => (
                <div key={monitor._id} className="slider-card">
                  <ProductCard product={monitor} />
                </div>
              ))
            )}
          </div>
          <button 
            className="slider-button next"
            onClick={() => scroll('next')}
            disabled={!monitors.length || scrollPosition >= (monitors.length - 4) * 300}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="mt-10 text-center">
          <Link to="/products/category/monitor" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            View all Monitors
            <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MonitorCategories;