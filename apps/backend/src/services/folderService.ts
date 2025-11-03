// src/services/folderService.ts
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../types/auth.js'; // افترضت وجود هذا الملف

const prisma = new PrismaClient();

/**
 * إنشاء مجلد جديد لمستخدم معين.
 */
export const createFolder = async (name: string, userId: string) => {
  if (!name) {
    throw new Error('Folder name is required');
  }
  const folder = await prisma.folder.create({
    data: { name, userId },
  });
  return folder;
};

/**
 * جلب كل المجلدات الخاصة بمستخدم.
 */
export const getAllFolders = async (userId: string) => {
  const folders = await prisma.folder.findMany({
    where: { userId },
    include: { rules: true }, // جلب القواعد المرتبطة
    orderBy: { createdAt: 'desc' },
  });
  return folders;
};

/**
 * تحديث اسم مجلد.
 */
export const updateFolder = async (folderId: string, name: string, userId: string) => {
  // التحقق من ملكية المجلد قبل التحديث
  const owner = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!owner || owner.userId !== userId) {
    throw new Error('Forbidden: You do not own this folder');
  }

  const folder = await prisma.folder.update({
    where: { id: folderId },
    data: { name },
  });
  return folder;
};

/**
 * حذف مجلد.
 */
export const deleteFolder = async (folderId: string, userId: string) => {
  // التحقق من ملكية المجلد قبل الحذف
  const owner = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!owner || owner.userId !== userId) {
    throw new Error('Forbidden: You do not own this folder');
  }

  // سيقوم Prisma بحذف السجلات المرتبطة تلقائياً إذا تم ضبط (onDelete: Cascade) في السكيما
  await prisma.folder.delete({ where: { id: folderId } });
  return { message: 'Folder deleted successfully' };
};
