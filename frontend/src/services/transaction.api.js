import api from './api';

export const transactionApi = {
  reserveItem: async (listingId, buyerId) => {
    const response = await api.post('/transactions/reserve', { listingId, buyerId });
    return response.data.data.transaction;
  },

  verifyHandover: async (listingId, otp) => {
    const response = await api.post('/transactions/verify', { listingId, otp });
    return response.data.data.transaction;
  },

  getHistory: async () => {
    const response = await api.get('/transactions/history');
    return response.data.data.history;
  },

  getStats: async () => {
    const response = await api.get('/transactions/stats');
    return response.data.data;
  }
};
