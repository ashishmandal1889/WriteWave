import axios from 'axios';

/**
 * Determine the backend API base URL from environment variables.
 * Supports VITE_API_URL and VITE_API_BASE_URL, defaulting to local development.
 */
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) {
    return 'http://localhost:5000/api/v1';
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api/v1') && !cleanUrl.includes('/api/')) {
    return `${cleanUrl}/api/v1`;
  }
  return cleanUrl;
};

/**
 * Axios instance configured with base URL from environment variables
 * and pre-configured interceptors for JWT authentication.
 */
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('writewave_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle common HTTP responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 Unauthorized if token expired
      localStorage.removeItem('writewave_token');
    }
    return Promise.reject(error);
  }
);

export default api;