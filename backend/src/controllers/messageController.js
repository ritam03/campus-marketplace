import * as messageService from '../services/messageService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHistory = asyncHandler(async (req, res) => {
  const { listingId, otherUserId } = req.params;
  const currentUserId = req.user.id;

  const messages = await messageService.fetchChatHistory(listingId, currentUserId, otherUserId);
  res.status(200).json({ status: 'success', data: { messages } });
});

export const saveEncryptedMessage = asyncHandler(async (req, res) => {
  const { listingId, receiverId, encryptedContent } = req.body;
  const senderId = req.user.id;

  const savedMessage = await messageService.createMessage(listingId, senderId, receiverId, encryptedContent);
  res.status(201).json({ status: 'success', data: { message: savedMessage } });
});

export const getInbox = asyncHandler(async (req, res) => {
  const inbox = await messageService.fetchUserInbox(req.user.id);
  res.status(200).json({ status: 'success', data: { inbox } });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await messageService.fetchUnreadCount(req.user.id);
  res.status(200).json({ status: 'success', data: { unreadCount: count } });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { otherUserId, listingId } = req.body;
  await messageService.markMessagesAsRead(req.user.id, otherUserId, listingId);
  res.status(200).json({ status: 'success' });
});