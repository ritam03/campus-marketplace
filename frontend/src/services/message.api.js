import api from './api';

export const messageApi = {
  getHistory: async (listingId, otherUserId) => {
    const response = await api.get(`/messages/${listingId}/${otherUserId}`);
    return response.data.data.messages;
  },

  saveMessage: async (listingId, receiverId, encryptedContent) => {
    const response = await api.post('/messages', { listingId, receiverId, encryptedContent });
    return response.data.data.message;
  },

  getInbox: async () => {
    const response = await api.get('/messages/inbox');
    return response.data.data.inbox;
  },

  getUnreadCount: async () => {
    const response = await api.get('/messages/unread');
    return response.data.data.unreadCount;
  },

  markAsRead: async (otherUserId, listingId) => {
    const response = await api.post('/messages/read', { otherUserId, listingId });
    return response.data;
  }
};
