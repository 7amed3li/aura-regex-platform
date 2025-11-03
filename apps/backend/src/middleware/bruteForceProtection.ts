import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ التصدير الصحيح بنفس الاسم
export const loginLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const { email } = req.body;

  if (!email) return next();

  try {
    const attemptsRecord = await prisma.loginAttempt.findFirst({ where: { email, ip } });
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    if (
      attemptsRecord &&
      attemptsRecord.updatedAt > fifteenMinutesAgo &&
      attemptsRecord.attempts >= 5
    ) {
      return res.status(429).json({
        message: 'Too many failed login attempts. Please try again in 15 minutes.',
      });
    }

    next();
  } catch (error) {
    console.error('Brute force protection error:', error);
    next();
  }
};
