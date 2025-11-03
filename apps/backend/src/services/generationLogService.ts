import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface LogData {
  input: string;
  output: string;
  isSuccess: boolean;
  executionTime?: number;
  modelVersion?: string;
  cost?: number;
  rating?: number;
  wasCorrect?: boolean;
  userId?: string;
}

export const createLog = async (data: LogData) => {
  return prisma.generationLog.create({
    data: {
      input: data.input, // ✅ هذا هو العمود الصحيح
      output: data.output,
      isSuccess: data.isSuccess ?? false,
      executionTime: data.executionTime ?? 0,
      modelVersion: data.modelVersion ?? null,
      cost: data.cost ?? null,
      rating: data.rating ?? null,
      wasCorrect: data.wasCorrect ?? null,
      user: data.userId
        ? {
            connect: {
              id: data.userId,
            },
          }
        : undefined,
    },
  });
};

export const listLogs = async (userId: string) => {
  return prisma.generationLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};
