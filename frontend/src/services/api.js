import axios from 'axios';

// Use Vite's environment variable for production, fallback to localhost for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL, 
});

// Intercept outgoing requests to attach the JWT token
api.interceptors.request.use(
  (config) => {
    // Safely check for the token (checking both keys based on our earlier debugging)
    const token = localStorage.getItem('marketplace_token') || localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;