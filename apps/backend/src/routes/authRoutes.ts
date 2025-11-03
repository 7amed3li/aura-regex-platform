// C:\...\src\routes\authRoutes.js

import express from 'express';
// 1. قم باستيراد Middleware الحماية الجديد
import { loginLimiter } from '../middleware/bruteForceProtection.js';
import { signupController, loginController, profileController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

// مسار التسجيل
router.post('/signup', signupController);

// 2. تطبيق الحماية على مسار الدخول
router.post('/login', loginLimiter, loginController);

// مسار الملف الشخصي
router.get('/profile', authenticateToken, profileController);

// 3. استخدام export default
export default router;
