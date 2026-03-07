import express from 'express';
import { 
  getHistory, 
  saveEncryptedMessage, 
  getInbox, 
  getUnreadCount, 
  markAsRead 
} from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 1. General User Message Routes (Must come first!)
router.get('/inbox', protect, getInbox);
router.get('/unread-count', protect, getUnreadCount);
router.put('/read', protect, markAsRead);

// 2. Specific Item/User Chat Routes
router.get('/:listingId/:otherUserId', protect, getHistory);
router.post('/', protect, saveEncryptedMessage);

export default router;