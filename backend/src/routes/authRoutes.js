import express from 'express';
import { register, login, refresh, logout, updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.put('/profile', protect, updateProfile);

export default router;