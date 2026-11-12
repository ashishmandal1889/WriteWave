import api from './api';

const TOKEN_KEY = 'writewave_token';
const USER_KEY = 'writewave_user';

export const authService = {
  /**
   * Send login credentials to backend
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user: object, token: string }>}
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      if (response.data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  /**
   * Register new user account
   * @param {{ fullName: string, email: string, password: string }} userData
   * @returns {Promise<{ user: object, token: string, message: string }>}
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data?.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      if (response.data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      }
    }
    return response.data;
  },

  /**
   * Log out the current user session
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Backend may be stateless JWT; ignore network errors on logout
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Fetch current user profile from backend
   */
  async getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Check if token is present
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Retrieve cached user profile
   */
  getStoredUser() {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
};

export default authService;
