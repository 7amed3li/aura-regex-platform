// src/routes/folderRoutes.ts
import express, { RequestHandler } from 'express';
import {
  createFolderController,
  getAllFoldersController,
  updateFolderController,
  deleteFolderController,
} from '../controllers/folderController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

// 🔒 استخدام authenticateToken لحماية جميع المسارات
router.use(authenticateToken as RequestHandler);

// ✅ إضافة type casting لكل Controller عشان تتطابق مع نوع express
router.post('/', createFolderController as unknown as RequestHandler);
router.get('/', getAllFoldersController as unknown as RequestHandler);
router.put('/:folderId', updateFolderController as unknown as RequestHandler);
router.delete('/:folderId', deleteFolderController as unknown as RequestHandler);

export default router;
