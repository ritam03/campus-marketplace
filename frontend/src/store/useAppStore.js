import { create } from 'zustand';
import { io } from 'socket.io-client';

// 🌟 FIXED: Dynamically grab the server URL based on the environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = API_URL.replace('/api', '');

const socket = io(SOCKET_URL, {
  autoConnect: false,
});

// Helper to safely parse JSON from localStorage
const getSavedUser = () => {
  try {
    const saved = localStorage.getItem('marketplace_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const useAppStore = create((set) => ({
  // --- Auth State ---
  user: getSavedUser(),
  token: localStorage.getItem('marketplace_token') || null,
  isAuthenticated: !!localStorage.getItem('marketplace_token'),

  login: (userData, token) => {
    localStorage.setItem('marketplace_token', token);
    localStorage.setItem('marketplace_user', JSON.stringify(userData));
    set({ user: userData, token, isAuthenticated: true });
  },

  setToken: (token) => {
    set({ token, isAuthenticated: !!token });
  },

  logout: () => {
    localStorage.removeItem('marketplace_token');
    localStorage.removeItem('marketplace_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // --- Real-Time & Metrics State ---
  socket: socket,
  totalItemsSold: 0,
  
  // Unread Messages State
  unreadMessageCount: 0,
  setUnreadMessageCount: (count) => set({ unreadMessageCount: count }),
  decrementUnreadCount: (amount = 1) => set((state) => ({ 
    unreadMessageCount: Math.max(0, state.unreadMessageCount - amount) 
  })),

  connectSocket: () => {
    if (!socket.connected) {
      socket.connect();
      socket.on('metrics_updated', (data) => {
        set({ totalItemsSold: data.totalSold });
      });
    }
  },

  disconnectSocket: () => {
    if (socket.connected) {
      socket.disconnect();
    }
  }
}));