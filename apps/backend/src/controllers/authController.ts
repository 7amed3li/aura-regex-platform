import { Request, Response } from 'express';
import * as authService from '../services/authService.js';
import { UserPayload } from '../types/auth.js';

// ✅ تعريف نوع الطلب الموثق مرة واحدة هنا
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// --- Controller لإنشاء حساب جديد ---
export const signupController = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const result = await authService.signup({ email, username, password });
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'Email or username already exists') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Signup controller error:', error);
    res.status(500).json({ error: 'An unexpected error occurred during signup.' });
  }
};

// --- Controller لتسجيل الدخول ---
export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || 'unknown';
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const result = await authService.login({ email, password }, ip);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'Invalid credentials or inactive account') {
      return res.status(401).json({ error: error.message });
    }
    console.error('Login controller error:', error);
    res.status(500).json({ error: 'An unexpected error occurred during login.' });
  }
};

// --- Controller لجلب بيانات الملف الشخصي ---
// ✅ استخدام النوع AuthenticatedRequest الذي عرفناه
export const profileController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id; // ✅ الآن الوصول آمن وبدون `any`

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token.' });
    }

    const userProfile = await authService.getProfile(userId);
    res.status(200).json(userProfile);
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Profile controller error:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};
