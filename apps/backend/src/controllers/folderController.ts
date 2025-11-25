import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '../types/express.js'; // Adjusted path based on file list
const prisma = new PrismaClient();

// 🟢 Create Folder
export const createFolderController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Folder name required' });
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const folder = await prisma.folder.create({
      data: {
        name,
        userId: req.user.id,
      },
    });

    res.status(201).json(folder);
  } catch (error: any) {
    console.error('Create folder error:', error);
    // ✅ Handle Unique Constraint Violation (P2002)
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Bu isimde bir klasör zaten var.' });
    }
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

// 🟡 Get All Folders
export const getAllFoldersController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { rules: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(folders);
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
};

// ✏️ Update Folder
export const updateFolderController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { folderId } = req.params as { folderId: string };
    const { name } = req.body;

    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
    if (!folderId || !name) return res.status(400).json({ error: 'Folder ID and name are required' });

    // تأكد الملكية لو حاب
    const owner = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!owner || owner.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const folder = await prisma.folder.update({
      where: { id: folderId },
      data: { name },
    });

    res.json({ message: 'Folder updated successfully', folder });
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
};

// ❌ Delete Folder
export const deleteFolderController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { folderId } = req.params as { folderId: string };
    if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

    const owner = await prisma.folder.findUnique({ where: { id: folderId } });
    if (!owner || owner.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await prisma.folder.delete({ where: { id: folderId } });

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};
