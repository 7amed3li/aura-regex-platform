// src/services/ruleService.ts
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../types/auth.js';

const prisma = new PrismaClient();

type RuleData = {
  name: string;
  description?: string;
  naturalLang: string;
  regex: string;
  folderId?: string;
  isPublic?: boolean;
};

/**
 * إنشاء قاعدة جديدة مع إصدارها الأول.
 */
export const createRule = async (data: RuleData, userId: string) => {
  const { name, description, naturalLang, regex, folderId, isPublic } = data;

  const rule = await prisma.rule.create({
    data: {
      name,
      description,
      naturalLang,
      regex,
      isPublic: Boolean(isPublic),
      safetyStatus: 'UNKNOWN',
      user: { connect: { id: userId } },
      ...(folderId ? { folder: { connect: { id: folderId } } } : {}),
    },
  });

  // إنشاء الإصدار الأول للقاعدة
  await prisma.ruleVersion.create({
    data: { naturalLang, regex, ruleId: rule.id },
  });

  return rule;
};

/**
 * جلب كل القواعد الخاصة بمستخدم.
 */
export const listRules = async (userId: string) => {
  return prisma.rule.findMany({
    where: { userId },
    include: { folder: true, versions: true, testCases: true, likes: true },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * جلب قاعدة محددة بالـ ID مع التحقق من الملكية.
 */
export const getRuleById = async (ruleId: string, userId:string) => {
  const rule = await prisma.rule.findUnique({
    where: { id: ruleId },
    include: { folder: true, versions: true, testCases: true, likes: true },
  });

  if (!rule) {
    throw new Error('Rule not found');
  }
  if (rule.userId !== userId) {
    throw new Error('Forbidden: You do not own this rule');
  }
  return rule;
};

/**
 * تحديث قاعدة وإنشاء إصدار جديد إذا لزم الأمر.
 */
export const updateRule = async (ruleId: string, data: Partial<RuleData>, userId: string) => {
  const rule = await prisma.rule.findUnique({ where: { id: ruleId } });
  if (!rule || rule.userId !== userId) {
    throw new Error('Forbidden or rule not found');
  }

  // تجهيز كائن التحديث بدون تعارض بين folderId و folder.connect
  const updateData: any = {
    ...data,
    isPublic: typeof data.isPublic === 'boolean' ? data.isPublic : rule.isPublic,
  };

  if (data.folderId) {
    updateData.folder = { connect: { id: data.folderId } };
    delete updateData.folderId; // نحذف الحقل عشان ما يصير تضارب في Prisma
  }

  const updatedRule = await prisma.rule.update({
    where: { id: ruleId },
    data: updateData,
    include: { folder: true, versions: true, testCases: true, likes: true },
  });

  // إنشاء نسخة جديدة إذا تغيّر النص أو التعبير النمطي
  if (data.naturalLang || data.regex) {
    await prisma.ruleVersion.create({
      data: {
        naturalLang: data.naturalLang ?? rule.naturalLang,
        regex: data.regex ?? rule.regex,
        ruleId: ruleId,
      },
    });
  }

  return updatedRule;
};


/**
 * حذف قاعدة.
 */
export const deleteRule = async (ruleId: string, userId: string) => {
  const rule = await prisma.rule.findUnique({ where: { id: ruleId } });
  if (!rule || rule.userId !== userId) {
    throw new Error('Forbidden or rule not found');
  }
  await prisma.rule.delete({ where: { id: ruleId } });
  return { message: 'Rule deleted successfully' };
};

/**
 * إضافة إعجاب لقاعدة.
 */
export const likeRule = async (ruleId: string, userId: string) => {
  const existingLike = await prisma.ruleLike.findUnique({
    where: { userId_ruleId: { userId, ruleId } },
  });
  if (existingLike) {
    throw new Error('Already liked');
  }
  return prisma.ruleLike.create({
    data: { userId, ruleId },
  });
};
