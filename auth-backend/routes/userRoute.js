import express from 'express';
import {
  loginUser,
  registerUser,
  getCurrentUser,
  updateProfile,
  updatePassword
} from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, updatePassword);

export default router;
