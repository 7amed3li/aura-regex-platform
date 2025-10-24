import express from 'express';
import { signupController, loginController, profileController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.get('/profile', authenticateToken, profileController);

export default router;