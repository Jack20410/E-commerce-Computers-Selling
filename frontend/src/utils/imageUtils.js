/**
 * Convert relative image paths to full URLs
 * @param {string} imagePath - The relative path of the image
 * @returns {string} The full URL of the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // In development, use the backend URL
  const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';
  
  return `${backendUrl}/${cleanPath}`;
};

/**
 * Get category-specific placeholder image
 * @param {string} category - Product category
 * @returns {string} URL of the placeholder image
 */
export const getPlaceholderImage = (category) => {
  const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';
  return `${backendUrl}/images/placeholders/${category || 'default'}.jpg`;
}; 