import axios from 'axios';

/**
 * Axios instance configured with base URL from environment variables
 * and pre-configured interceptors for Spring Boot JWT authentication.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
    // If backend returns 401 Unauthorized, clear stored token if expired
    if (error.response && error.response.status === 401) {
      // Optional: dispatch custom event or let AuthContext handle it
      localStorage.removeItem('writewave_token');
    }
    return Promise.reject(error);
  }
);

export default api;
