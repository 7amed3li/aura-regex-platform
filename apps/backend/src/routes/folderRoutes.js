import express from 'express';
import { createFolderController, listFoldersController } from '../controllers/folderController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/', authenticateToken, createFolderController);
router.get('/', authenticateToken, listFoldersController);

export default router;