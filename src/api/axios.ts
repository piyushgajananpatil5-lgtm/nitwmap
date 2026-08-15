import axios from 'axios';

// Get API Base URL from environment variable or relative /api
const baseURL = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically attaches JWT Authorization token if present in localStorage
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nitw_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles 401 Unauthorized globally by clearing token
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('nitw_admin_token');
      localStorage.removeItem('nitw_admin_user');
    }
    return Promise.reject(error);
  }
);

export default api;
