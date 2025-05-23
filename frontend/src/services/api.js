import axios from 'axios';

// Determine which API URL to use based on environment
const API_URL = import.meta.env.VITE_BACKEND_API_URL_DOCKER || 'http://localhost:3001';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log('Making request to:', config.url, config.method);
    console.log('Request data type:', config.data instanceof FormData ? 'FormData' : typeof config.data);
    
    // Add token to request headers if it exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - axios will set it automatically with boundary
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      // Ensure Content-Type is not set for FormData
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Log the response for debugging
    console.log('Received response:', response.data);
    
    // If the response has data property, return it directly
    if (response.data) {
      return response;
    }
    
    return response;
  },
  (error) => {
    console.error('Response error:', error.response || error);
    // Chi tiết hơn về lỗi kết nối
    if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused - check if backend server is running');
    }
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      
      // If we have an error message in the response, use it
      if (error.response.data && error.response.data.message) {
        error.message = error.response.data.message;
      }

      // Handle 401 Unauthorized error
      if (error.response.status === 401) {
        // Clear local storage and reload page if token is invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      error.message = 'No response received from server';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Export the axios instance
export default api; 