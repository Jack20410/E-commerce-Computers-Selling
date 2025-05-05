/**
 * Format a price value to a currency string
 * @param {number} price - The price to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} - Formatted price
 */
export function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Format a date to a readable string
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Truncate a text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export function truncateText(text, length = 100) {
  if (!text || text.length <= length) {
    return text;
  }
  
  return text.slice(0, length) + '...';
}

/**
 * Generate a random product ID for testing
 * @returns {string} - Random ID
 */
export function generateRandomId() {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} salePrice - Sale price
 * @returns {number} - Discount percentage
 */
export function calculateDiscount(originalPrice, salePrice) {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) {
    return 0;
  }
  
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
} 