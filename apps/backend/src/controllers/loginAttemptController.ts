import { Request, Response } from 'express';
import * as attemptService from '../services/loginAttemptService.js';

/**
 * 🔹 تسجيل محاولة دخول جديدة
 */
export const recordLoginAttempt = async (req: Request, res: Response) => {
  try {
    const { email, ip, success } = req.body;
    const attempt = await attemptService.recordLoginAttempt({ email, ip, success });
    res.status(201).json(attempt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 📜 جلب المحاولات حسب البريد
 */
export const getLoginAttempts = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ error: 'Email parameter is required' });
    const attempts = await attemptService.getLoginAttempts(email);
    res.status(200).json(attempts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
