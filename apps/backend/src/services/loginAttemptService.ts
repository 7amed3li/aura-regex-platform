import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface LoginAttemptData {
  email: string;
  ip: string;
  success: boolean;
}

export const recordLoginAttempt = async (data: LoginAttemptData) => {
  return prisma.loginAttempt.create({
    data: {
      email: data.email,
      ip: data.ip,
      success: data.success,
    },
  });
};

export const getLoginAttempts = async (email: string) => {
  return prisma.loginAttempt.findMany({
    where: { email },
    orderBy: { createdAt: 'desc' },
    take: 10, // آخر 10 محاولات فقط
  });
};
