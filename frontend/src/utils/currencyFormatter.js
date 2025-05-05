/**
 * Formats a number to Vietnamese Dong (VND) currency format
 * @param {number} amount - The number to format
 * @param {Object} options - Intl.NumberFormat options (optional)
 * @returns {string} Formatted currency string
 */
export const formatVND = (amount, options = {}) => {
  const defaultOptions = {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options
  };

  return new Intl.NumberFormat('vi-VN', defaultOptions).format(amount);
};

// Example usage:
// formatVND(150000) => "150.000 ₫"
// formatVND(1500000) => "1.500.000 ₫" 