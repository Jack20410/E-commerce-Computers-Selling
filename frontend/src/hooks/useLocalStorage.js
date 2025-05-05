import { useState, useEffect } from 'react';

/**
 * Custom hook for working with localStorage
 * @param {string} key - The key to store data under in localStorage
 * @param {any} initialValue - The initial value if no value exists in localStorage
 * @returns {[any, function]} - Current value and setter function
 */
function useLocalStorage(key, initialValue) {
  // Get value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  // Update localStorage when the value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage; 