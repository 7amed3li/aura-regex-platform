import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface TestcaseData {
  name: string;
  testText: string;         // ✅ متطابق مع Prisma
  shouldMatch: boolean;     // ✅ متطابق مع Prisma
  ruleId?: string;
  userId: string;
}

/**
 * 🧠 إنشاء test case جديدة
 */
export const createTestcase = async (data: TestcaseData) => {
  return prisma.testCase.create({
    data: {
      name: data.name,
      testText: data.testText,
      shouldMatch: data.shouldMatch,
      rule: data.ruleId ? { connect: { id: data.ruleId } } : undefined,
      user: { connect: { id: data.userId } },
    },
  });
};

/**
 * 📜 جلب test cases خاصة بالمستخدم
 */
export const listTestcases = async (userId: string) => {
  return prisma.testCase.findMany({
    where: { userId },
    include: { rule: true },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * 🗑️ حذف test case مع التحقق من الملكية
 */
export const deleteTestcase = async (id: string, userId: string) => {
  const testcase = await prisma.testCase.findUnique({ where: { id } });
  if (!testcase) throw new Error('Testcase not found');
  if (testcase.userId !== userId) throw new Error('Forbidden');

  await prisma.testCase.delete({ where: { id } });
  return { message: 'Testcase deleted successfully' };
};
