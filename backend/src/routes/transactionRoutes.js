import express from 'express';
import { reserveItem, verifyHandover, getHistory, getPlatformStats } from '../controllers/transactionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for the landing page
router.get('/stats', getPlatformStats);

// Protected routes
router.post('/reserve', protect, reserveItem);
router.post('/verify', protect, verifyHandover);
router.get('/history', protect, getHistory);

export default router;