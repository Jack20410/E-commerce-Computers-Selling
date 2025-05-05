import React, { useState, useRef } from 'react';
import ProductCard from './ProductCard';
import './CategorySlider.css';

const ProcessorCategories = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const sliderRef = useRef(null);

  const sampleProcessors = [
    {
      id: 1,
      name: "AMD Ryzen 9 7950X",
      description: "16-Core, 32-Thread, Up to 5.7GHz, Socket AM5",
      price: 16990000,
      oldPrice: 18990000,
      discount: 12,
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 2,
      name: "Intel Core i9-13900K",
      description: "24-Core (8P+16E), Up to 5.8GHz, LGA 1700",
      price: 14990000,
      image: "https://images.unsplash.com/photo-1555617778-02518510b9fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 3,
      name: "AMD Ryzen 7 7700X",
      description: "8-Core, 16-Thread, Up to 5.4GHz, Socket AM5",
      price: 8990000,
      oldPrice: 9990000,
      discount: 11,
      image: "https://images.unsplash.com/photo-1592664474496-8f3d1183e805?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 4,
      name: "Intel Core i5-13600K",
      description: "14-Core (6P+8E), Up to 5.1GHz, LGA 1700",
      price: 7490000,
      image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 5,
      name: "AMD Ryzen 5 7600X",
      description: "6-Core, 12-Thread, Up to 5.3GHz, Socket AM5",
      price: 6990000,
      oldPrice: 7490000,
      discount: 7,
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 6,
      name: "Intel Core i7-13700K",
      description: "16-Core (8P+8E), Up to 5.4GHz, LGA 1700",
      price: 9990000,
      image: "https://images.unsplash.com/photo-1555617778-02518510b9fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 7,
      name: "AMD Ryzen 9 7900X",
      description: "12-Core, 24-Thread, Up to 5.6GHz, Socket AM5",
      price: 12990000,
      oldPrice: 13990000,
      discount: 8,
      image: "https://images.unsplash.com/photo-1592664474496-8f3d1183e805?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 8,
      name: "Intel Core i5-12600K",
      description: "10-Core (6P+4E), Up to 4.9GHz, LGA 1700",
      price: 5990000,
      image: "https://images.unsplash.com/photo-1563770660941-20978e870e26?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 9,
      name: "AMD Ryzen 7 5800X3D",
      description: "8-Core, 16-Thread, Up to 4.5GHz, Socket AM4",
      price: 7990000,
      oldPrice: 8490000,
      discount: 6,
      image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 10,
      name: "Intel Core i9-12900KS",
      description: "16-Core (8P+8E), Up to 5.5GHz, LGA 1700",
      price: 13990000,
      oldPrice: 15990000,
      discount: 13,
      image: "https://images.unsplash.com/photo-1555617778-02518510b9fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
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
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Processors (CPU)
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Power your build with the latest processors from top manufacturers
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
            {sampleProcessors.map(processor => (
              <div key={processor.id} className="slider-card">
                <ProductCard product={processor} />
              </div>
            ))}
          </div>
          <button 
            className="slider-button next"
            onClick={() => scroll('next')}
            disabled={scrollPosition >= (sampleProcessors.length - 4) * 300}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="mt-10 text-center">
          <a href="/processors" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            View All Processors
            <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProcessorCategories; 