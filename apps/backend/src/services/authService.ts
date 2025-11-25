// src/services/authService.ts

import bcrypt from 'bcryptjs';
import { PrismaClient, User, Prisma } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';

const prisma = new PrismaClient();

// =============================================================================
// 1. Helper Functions & Configuration
// =============================================================================

/**
 * إنشاء JWT Token باستخدام المفاتيح من ملف .env
 * @param payload البيانات التي سيتم تشفيرها داخل التوكن (User ID, Role)
 */
function signJwt(payload: object): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRATION;

  if (!secret || !expiresIn) {
    throw new Error('SERVER CONFIG ERROR: JWT_SECRET or JWT_EXPIRATION is missing.');
  }

  // ✅ Fix 1: حل مشكلة النوع بذكاء (Type Casting)
  // نستخدم 'as any' لنتجاوز تعقيدات مكتبة jsonwebtoken مع الأنواع النصية
  const options: SignOptions = { expiresIn: expiresIn as any }; 
  
  return jwt.sign(payload, secret, options);
}

/**
 * تسجيل محاولة دخول فاشلة لحماية النظام من Brute Force
 */
async function recordFailedLoginAttempt(email: string, ip: string) {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const ip_email: Prisma.LoginAttemptIpEmailCompoundUniqueInput = { ip, email };

    const attempt = await prisma.loginAttempt.findUnique({ where: { ip_email } });

    if (attempt) {
      await prisma.loginAttempt.update({
        where: { ip_email },
        data: {
          attempts: attempt.updatedAt < fifteenMinutesAgo ? 1 : { increment: 1 },
          success: false,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.loginAttempt.create({
        data: { ip, email, attempts: 1, success: false },
      });
    }
  } catch (error) {
    console.error('⚠️ Failed to record login attempt (Metrics Error):', error);
  }
}

// =============================================================================
// 2. Core Services
// =============================================================================

// --- خدمة إنشاء حساب جديد ---
export const signup = async (
  { email, username, password }: Pick<User, 'email' | 'username' | 'password'>
) => {
  const existingUser = await prisma.user.findFirst({
    where: { 
      OR: [
        { email }, 
        { username: username || undefined } 
      ] 
    },
  });

  if (existingUser) {
    throw new Error('Email or username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  // إنشاء المستخدم (lastSignedIn سيكون null افتراضياً)
  const user = await prisma.user.create({
    data: { email, username, password: hashedPassword },
  });

  const token = signJwt({ id: user.id, role: user.role });
  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};

// --- خدمة تسجيل الدخول ---
export const login = async (
  { email, password }: Pick<User, 'email' | 'password'>,
  ip: string
) => {
  const user = await prisma.user.findUnique({ where: { email } });
  const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || user.status !== 'ACTIVE' || !isPasswordValid) {
    await recordFailedLoginAttempt(email, ip);
    throw new Error('Invalid credentials or inactive account');
  }

  // ✅ Fix 2: استخدام Transaction لتحديث lastSignedIn وتصفير المحاولات
  // (يعمل الآن لأنك أضفت الحقل للسكيما)
  try {
    await prisma.$transaction([
      // أ: تحديث سجل المحاولات ليكون ناجحاً
      prisma.loginAttempt.upsert({
        where: { ip_email: { ip, email } },
        update: { attempts: 0, success: true, updatedAt: new Date() },
        create: { ip, email, attempts: 0, success: true },
      }),
      // ب: تحديث وقت آخر ظهور للمستخدم
      prisma.user.update({
        where: { id: user.id },
        data: { lastSignedIn: new Date() }, // ✅ الآن هذا السطر صحيح 100%
      }),
    ]);
  } catch (err) {
    console.error('⚠️ Audit log update failed during login, but allowing user access.', err);
  }

  const token = signJwt({ id: user.id, role: user.role });
  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};

// --- خدمة جلب الملف الشخصي ---
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      status: true,
      createdAt: true,
      lastSignedIn: true, // ✅ ونسترجع الحقل هنا أيضاً للعرض في الفرونت إند
    },
  });

  if (!user) {
    throw new Error('User not found');
  }
  return user;
};