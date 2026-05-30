import * as messageRepo from '../repositories/messageRepository.js';

export const fetchChatHistory = async (listingId, currentUserId, otherUserId) => {
  return await messageRepo.getChatHistory(listingId, currentUserId, otherUserId);
};

export const createMessage = async (listingId, senderId, receiverId, encryptedContent) => {
  return await messageRepo.saveMessage(listingId, senderId, receiverId, encryptedContent);
};

export const fetchUserInbox = async (userId) => {
  return await messageRepo.getUserInbox(userId);
};

export const fetchUnreadCount = async (userId) => {
  return await messageRepo.getTotalUnreadCount(userId);
};

export const markMessagesAsRead = async (userId, otherUserId, listingId) => {
  await messageRepo.markChatAsRead(userId, otherUserId, listingId);
};
