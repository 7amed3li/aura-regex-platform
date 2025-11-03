import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient, User } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';

const prisma = new PrismaClient();

// دالة موحّدة لتوقيع الـ JWT مع فحص القيم من .env وضبط الأنواع
function signJwt(payload: object) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRATION;

  if (!secret || !expiresIn) {
    throw new Error('JWT secret or expiration is not defined in .env file.');
  }

  const options: SignOptions = { expiresIn }; // مثال: "2h" أو "1d" أو رقم بالثواني
  return jwt.sign(payload, secret, options);
}

// --- دالة مساعدة لتسجيل المحاولات الفاشلة ---
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
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.loginAttempt.create({
        data: { ip, email, attempts: 1 },
      });
    }
  } catch (error) {
    console.error('Failed to record login attempt:', error);
  }
}

// --- دالة إنشاء حساب جديد ---
export const signup = async (
  { email, username, password }: Pick<User, 'email' | 'username' | 'password'>
) => {
  // تأكيد وجود مفاتيح JWT (فقط للأمان؛ signJwt بيفحصها بعد)
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRATION) {
    throw new Error('JWT secret or expiration is not defined in .env file.');
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username: username || undefined }] },
  });
  if (existingUser) {
    throw new Error('Email or username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, username, password: hashedPassword },
  });

  const token = signJwt({ id: user.id, role: user.role });

  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};

// --- دالة تسجيل الدخول ---
export const login = async (
  { email, password }: Pick<User, 'email' | 'password'>,
  ip: string
) => {
  // تأكيد وجود مفاتيح JWT (فقط للأمان؛ signJwt بيفحصها بعد)
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRATION) {
    throw new Error('JWT secret or expiration is not defined in .env file.');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;

  if (!user || user.status !== 'ACTIVE' || !isPasswordValid) {
    await recordFailedLoginAttempt(email, ip);
    throw new Error('Invalid credentials or inactive account');
  }

  const ip_email: Prisma.LoginAttemptIpEmailCompoundUniqueInput = { ip, email };
  const existingAttempt = await prisma.loginAttempt.findUnique({ where: { ip_email } });
  if (existingAttempt && existingAttempt.attempts > 0) {
    await prisma.loginAttempt.update({
      where: { ip_email },
      data: { attempts: 0 },
    });
  }

  const token = signJwt({ id: user.id, role: user.role });

  const { password: _, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
};

// --- دالة جلب بيانات الملف الشخصي ---
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
    },
  });

  if (!user) {
    throw new Error('User not found');
  }
  return user;
};
