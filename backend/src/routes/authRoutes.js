import express from 'express';
import { register, login, updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Ensure you have this middleware

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateProfile); // This powers your Settings page

export default router;