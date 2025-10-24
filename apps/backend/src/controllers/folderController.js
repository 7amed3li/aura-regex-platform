import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createFolderController = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Folder name required' });

  try {
    const folder = await prisma.folder.create({
      data: { name, userId: req.user.id },
    });
    res.status(201).json(folder);
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

export const listFoldersController = async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
      include: { rules: true },
    });
    res.json(folders);
  } catch (error) {
    console.error('List folders error:', error);
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
};