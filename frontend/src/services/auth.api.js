import api from './api';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return { token: response.data.token, user: response.data.data.user };
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return { token: response.data.token, user: response.data.data.user };
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data.data.user;
  },
};
