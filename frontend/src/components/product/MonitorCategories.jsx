import React, { useState, useRef } from 'react';
import ProductCard from './ProductCard';
import './CategorySlider.css';

const MonitorCategories = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const sliderRef = useRef(null);

  const sampleMonitors = [
    {
      id: 1,
      name: "ASUS ROG Swift PG32UQX",
      description: "32\" 4K HDR 144Hz G-SYNC Ultimate Gaming Monitor",
      price: 49990000,
      oldPrice: 52990000,
      discount: 9,
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 2,
      name: "LG 34WN80C-B UltraWide",
      description: "34\" WQHD Curved USB-C Monitor",
      price: 15990000,
      image: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 3,
      name: "Dell UltraSharp U2723QE",
      description: "27\" 4K USB-C Hub Monitor",
      price: 17990000,
      oldPrice: 19990000,
      discount: 11,
      image: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 4,
      name: "Samsung Odyssey G9",
      description: "49\" DQHD 240Hz Curved Gaming Monitor",
      price: 39990000,
      image: "https://images.unsplash.com/photo-1619953942547-233eab5a70d6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 5,
      name: "LG 27GP950-B",
      description: "27\" 4K 144Hz Nano IPS Gaming Monitor",
      price: 22990000,
      oldPrice: 24990000,
      discount: 8,
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 6,
      name: "ASUS ProArt PA32UCX",
      description: "32\" 4K HDR Mini LED Professional Monitor",
      price: 69990000,
      image: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 7,
      name: "Alienware AW3423DW",
      description: "34\" QD-OLED Curved Gaming Monitor",
      price: 34990000,
      oldPrice: 37990000,
      discount: 8,
      image: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 8,
      name: "BenQ PD3200U",
      description: "32\" 4K Designer Monitor",
      price: 19990000,
      image: "https://images.unsplash.com/photo-1619953942547-233eab5a70d6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 9,
      name: "MSI MPG ARTYMIS 343CQR",
      description: "34\" UWQHD 165Hz Curved Gaming Monitor",
      price: 24990000,
      oldPrice: 26990000,
      discount: 7,
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: 10,
      name: "ViewSonic VP3268a-4K",
      description: "32\" 4K Professional Monitor",
      price: 21990000,
      image: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
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
            {sampleMonitors.map(monitor => (
              <div key={monitor.id} className="slider-card">
                <ProductCard product={monitor} />
              </div>
            ))}
          </div>
          <button 
            className="slider-button next"
            onClick={() => scroll('next')}
            disabled={scrollPosition >= (sampleMonitors.length - 4) * 300}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="mt-10 text-center">
          <a href="/monitors" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            View All Monitors
            <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default MonitorCategories; 