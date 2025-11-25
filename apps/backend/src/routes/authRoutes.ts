// src/routes/authRoutes.ts

import { Router } from 'express';

// --- Middlewares ---
import { loginLimiter } from '../middleware/bruteForceProtection.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

// --- Controllers ---
import { 
  signupController, 
  loginController, 
  profileController 
} from '../controllers/authController.js';

const router = Router();

// =============================================================================
// PUBLIC ROUTES (لا تتطلب تسجيل دخول)
// =============================================================================

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signupController);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 * @note    محمية بواسطة loginLimiter ضد هجمات التخمين (Brute Force)
 */
router.post('/login', loginLimiter, loginController);

// =============================================================================
// PROTECTED ROUTES (تتطلب Token صالح)
// =============================================================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile information
 * @access  Private (Logged in users)
 */
router.get('/profile', authenticateToken, profileController);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (Client should discard the token)
 * @access  Public/Private
 * @note    في أنظمة JWT، السيرفر لا يحتفظ بالجلسة، لكن هذا المسار مفيد
 * للتأكيد للفرونت إند أو لتنظيف الكوكيز مستقبلاً.
 */
router.post('/logout', (req, res) => {
  // يمكن هنا إضافة منطق لإبطال التوكن (Blacklisting) إذا استخدمنا Redis مستقبلاً
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;