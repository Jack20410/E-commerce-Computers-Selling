/**
 * Image utility functions for backend
 */

// Get the full image URL for uploaded images
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path starting with /uploads, return as is for serving
  if (imagePath.startsWith('/uploads/')) {
    return imagePath;
  }
  
  // If it's just a filename or relative path without /uploads, add it
  if (!imagePath.startsWith('/')) {
    return `/uploads/${imagePath}`;
  }
  
  return imagePath;
};

// Get placeholder image based on category
const getPlaceholderImage = (category) => {
  const placeholders = {
    'pc': '/images/pre-built-pc.webp',
    'laptop': '/images/laptop.jpg',
    'cpu': '/images/cpu.webp',
    'graphicsCard': '/images/gpu.jpg',
    'motherboard': '/images/motherboard.jpg',
    'memory': '/images/memory.png',
    'storage': '/images/storage.jpg',
    'monitor': '/images/monitors.jpg',
    'gears': '/images/gears.png'
  };
  
  return placeholders[category] || '/images/pre-built-pc.webp';
};

module.exports = {
  getImageUrl,
  getPlaceholderImage
};
