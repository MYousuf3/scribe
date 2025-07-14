import axios, { isAxiosError } from 'axios';

// Create and configure axios instance to include cookies with requests
const axiosInstance = axios.create({
  // Include credentials (cookies) with all requests
  withCredentials: true,
  
  // Set default headers
  headers: {
    'Content-Type': 'application/json',
  },
  
  // Timeout for requests (30 seconds)
  timeout: 30000,
});

// Add request interceptor for debugging (optional)
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the request for debugging purposes
    console.log('🌐 Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('🚫 Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('✅ Response received from:', response.config.url);
    return response;
  },
  (error) => {
    // Enhanced error logging
    if (error.response) {
      console.error('🚫 Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('🚫 Network error:', error.message);
    } else {
      console.error('🚫 Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { isAxiosError }; 