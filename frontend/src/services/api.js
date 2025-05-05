const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic function to handle API requests
 */
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      return Promise.reject(error);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    return Promise.reject(error);
  }
}

/**
 * Service object with methods for common API operations
 */
const api = {
  get: (endpoint, options = {}) => 
    request(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint, data, options = {}) => 
    request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: (endpoint, data, options = {}) => 
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (endpoint, options = {}) => 
    request(endpoint, { ...options, method: 'DELETE' }),
};

export default api; 