import React, { useState, useRef } from 'react';
import ProductCard from './ProductCard';
import './CategorySlider.css';

const GraphicsCategories = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const sliderRef = useRef(null);

  const sampleGraphicsCards = [
    {
      id: 1,
      name: "NVIDIA RTX 4090",
      description: "24GB GDDR6X, Ray Tracing, DLSS 3.0",
      price: 42990000,
      oldPrice: 45990000,
      discount: 11,
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 2,
      name: "AMD Radeon RX 7900 XTX",
      description: "24GB GDDR6, Ray Tracing, FSR 3.0",
      price: 27990000,
      image: "https://images.unsplash.com/photo-1587202372616-b43abea06c2f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 3,
      name: "NVIDIA RTX 4080",
      description: "16GB GDDR6X, Ray Tracing, DLSS 3.0",
      price: 31990000,
      oldPrice: 33990000,
      discount: 8,
      image: "https://images.unsplash.com/photo-1587202372634-32789010c0ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 4,
      name: "AMD Radeon RX 7800 XT",
      description: "16GB GDDR6, Ray Tracing, FSR 3.0",
      price: 19990000,
      oldPrice: 21990000,
      discount: 9,
      image: "https://images.unsplash.com/photo-1587202372616-b43abea06c2f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 5,
      name: "NVIDIA RTX 4070 Ti",
      description: "12GB GDDR6X, Ray Tracing, DLSS 3.0",
      price: 23990000,
      image: "https://images.unsplash.com/photo-1587202372634-32789010c0ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 6,
      name: "AMD Radeon RX 7700 XT",
      description: "12GB GDDR6, Ray Tracing, FSR 3.0",
      price: 17990000,
      oldPrice: 19990000,
      discount: 10,
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 7,
      name: "NVIDIA RTX 4070",
      description: "12GB GDDR6X, Ray Tracing, DLSS 3.0",
      price: 18990000,
      image: "https://images.unsplash.com/photo-1587202372634-32789010c0ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 8,
      name: "AMD Radeon RX 6950 XT",
      description: "16GB GDDR6, Ray Tracing, FSR 2.0",
      price: 24990000,
      oldPrice: 26990000,
      discount: 7,
      image: "https://images.unsplash.com/photo-1587202372616-b43abea06c2f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 9,
      name: "NVIDIA RTX 3090 Ti",
      description: "24GB GDDR6X, Ray Tracing, DLSS 2.0",
      price: 29990000,
      oldPrice: 32990000,
      discount: 9,
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 10,
      name: "AMD Radeon RX 6900 XT",
      description: "16GB GDDR6, Ray Tracing, FSR 2.0",
      price: 22990000,
      image: "https://images.unsplash.com/photo-1587202372616-b43abea06c2f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    }
  ];

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
            {sampleGraphicsCards.map(gpu => (
              <div key={gpu.id} className="slider-card">
                <ProductCard product={gpu} />
              </div>
            ))}
          </div>
          <button 
            className="slider-button next"
            onClick={() => scroll('next')}
            disabled={scrollPosition >= (sampleGraphicsCards.length - 4) * 300}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="mt-10 text-center">
          <a href="/products/category/graphics card" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            View All Graphics Cards
            <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default GraphicsCategories;