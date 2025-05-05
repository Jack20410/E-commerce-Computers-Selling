import React, { useState, useRef } from 'react';
import ProductCard from './ProductCard';
import './CategorySlider.css';

const LaptopCategories = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const sliderRef = useRef(null);

  const sampleLaptops = [
    {
      id: 1,
      name: "ROG Strix G15 Gaming Laptop",
      description: "AMD Ryzen 9, RTX 3080, 32GB RAM, 1TB SSD",
      price: 45990000,
      oldPrice: 52990000,
      discount: 13,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1468&q=80"
    },
    {
      id: 2,
      name: "MacBook Pro 16",
      description: "M1 Pro, 16GB RAM, 512GB SSD, 16-inch Retina Display",
      price: 57990000,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1026&q=80"
    },
    {
      id: 3,
      name: "Dell XPS 13 Plus",
      description: "Intel i7, 16GB RAM, 1TB SSD, 4K OLED Display",
      price: 39990000,
      oldPrice: 43990000,
      discount: 10,
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80"
    },
    {
      id: 4,
      name: "Razer Blade 15",
      description: "Intel i9, RTX 3070 Ti, 32GB RAM, 1TB SSD",
      price: 49990000,
      oldPrice: 54990000,
      discount: 9,
      image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 5,
      name: "Lenovo Legion 7i",
      description: "Intel i7, RTX 3080, 32GB RAM, 2TB SSD",
      price: 47990000,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1468&q=80"
    },
    {
      id: 6,
      name: "MacBook Air M2",
      description: "M2 chip, 16GB RAM, 512GB SSD, 13.6-inch Display",
      price: 32990000,
      oldPrice: 35990000,
      discount: 8,
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1026&q=80"
    },
    {
      id: 7,
      name: "HP Spectre x360",
      description: "Intel i7, 16GB RAM, 1TB SSD, OLED Touch Display",
      price: 37990000,
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80"
    },
    {
      id: 8,
      name: "MSI GE76 Raider",
      description: "Intel i9, RTX 3080 Ti, 64GB RAM, 2TB SSD",
      price: 59990000,
      oldPrice: 64990000,
      discount: 7,
      image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80"
    },
    {
      id: 9,
      name: "Acer Predator Triton",
      description: "Intel i7, RTX 3070, 32GB RAM, 1TB SSD",
      price: 41990000,
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1468&q=80"
    },
    {
      id: 10,
      name: "ASUS ZenBook Pro",
      description: "Intel i9, RTX 3060, 32GB RAM, 1TB SSD",
      price: 44990000,
      oldPrice: 47990000,
      discount: 6,
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1032&q=80"
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
            Gaming & Professional Laptops
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Find the perfect laptop for your needs - from gaming beasts to ultralight workstations
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
            {sampleLaptops.map(laptop => (
              <div key={laptop.id} className="slider-card">
                <ProductCard product={laptop} />
              </div>
            ))}
          </div>
          <button 
            className="slider-button next"
            onClick={() => scroll('next')}
            disabled={scrollPosition >= (sampleLaptops.length - 4) * 300}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="mt-10 text-center">
          <a href="/laptops" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            View All Laptops
            <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default LaptopCategories; 