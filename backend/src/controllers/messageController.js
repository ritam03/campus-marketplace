import * as messageRepo from '../repositories/messageRepository.js';

export const getHistory = async (req, res) => {
  try {
    const { listingId, otherUserId } = req.params;
    const currentUserId = req.user.id;

    const messages = await messageRepo.getChatHistory(listingId, currentUserId, otherUserId);
    res.status(200).json({ status: 'success', data: { messages } });
  } catch (error) {
    console.error('Fetch Messages Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load chat history' });
  }
};

export const saveEncryptedMessage = async (req, res) => {
  try {
    const { listingId, receiverId, encryptedContent } = req.body;
    const senderId = req.user.id;

    const savedMessage = await messageRepo.saveMessage(listingId, senderId, receiverId, encryptedContent);
    res.status(201).json({ status: 'success', data: { message: savedMessage } });
  } catch (error) {
    console.error('Save Message Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save message' });
  }
};

export const getInbox = async (req, res) => {
  try {
    const inbox = await messageRepo.getUserInbox(req.user.id);
    res.status(200).json({ status: 'success', data: { inbox } });
  } catch (error) {
    console.error('Inbox Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to load inbox' });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await messageRepo.getTotalUnreadCount(req.user.id);
    res.status(200).json({ status: 'success', data: { unreadCount: count } });
  } catch (error) {
    console.error('Unread Count Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch unread count' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { otherUserId, listingId } = req.body;
    await messageRepo.markChatAsRead(req.user.id, otherUserId, listingId);
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Mark Read Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to mark as read' });
  }
};