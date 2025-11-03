import express from 'express';
import { createLog, listLogs } from '../controllers/generationLogController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/', authenticateToken, createLog);
router.get('/', authenticateToken, listLogs);

export default router;
