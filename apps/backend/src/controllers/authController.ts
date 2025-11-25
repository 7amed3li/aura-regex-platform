// src/controllers/authController.ts

import { Request, Response } from 'express';
import * as authService from '../services/authService.js';

/**
 * تسجيل مستخدم جديد في النظام.
 * Route: POST /api/auth/signup
 */
export const signupController = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // 1. Basic Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 2. Call Service
    const result = await authService.signup({ email, username, password });

    // 3. Success Response
    res.status(201).json(result);

  } catch (error: any) {
    // التعامل مع الأخطاء المتوقعة (مثل تكرار الإيميل)
    if (error.message === 'Email or username already exists') {
      return res.status(409).json({ error: error.message });
    }

    // التعامل مع الأخطاء غير المتوقعة
    console.error('[Signup Controller Error]:', error);
    res.status(500).json({ error: 'An unexpected error occurred during signup.' });
  }
};

/**
 * تسجيل الدخول والحصول على Token.
 * Route: POST /api/auth/login
 */
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // محاولة الحصول على الـ IP الحقيقي حتى لو كان خلف Proxy (مثل Nginx أو Cloudflare)
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await authService.login({ email, password }, ip);
    res.status(200).json(result);

  } catch (error: any) {
    if (error.message === 'Invalid credentials or inactive account') {
      // 401 Unauthorized هو الرد الصحيح لفشل تسجيل الدخول
      return res.status(401).json({ error: error.message });
    }

    console.error('[Login Controller Error]:', error);
    res.status(500).json({ error: 'An unexpected error occurred during login.' });
  }
};

/**
 * جلب بيانات الملف الشخصي للمستخدم الحالي.
 * Route: GET /api/auth/profile
 */
export const profileController = async (req: Request, res: Response) => {
  try {
    // بفضل الـ Global Type Definition، لا نحتاج لواجهة خاصة هنا
    // Typescript الآن يعرف أن req.user موجود
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token.' });
    }

    const userProfile = await authService.getProfile(userId);
    res.status(200).json(userProfile);

  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }

    console.error('[Profile Controller Error]:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};