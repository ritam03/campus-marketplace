import axios from 'axios';
import { useAppStore } from '../store/useAppStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL, 
  withCredentials: true, // Crucial for sending httpOnly cookies
});

// Intercept outgoing requests to attach the short-lived JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('marketplace_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept incoming responses to handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to get a new access token using the httpOnly refresh cookie
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        
        const newToken = refreshResponse.data.token;
        
        // Save new token
        localStorage.setItem('marketplace_token', newToken);
        
        // Update the Zustand store token without overwriting user data
        useAppStore.getState().setToken(newToken);

        // Update the failed request with the new token and retry it
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // If refresh fails (e.g. refresh token expired), forcefully log the user out
        useAppStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;