import express from 'express';
import { generateRegexController, testRegexController } from '../controllers/regexController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/generate', authenticateToken, generateRegexController);
router.post('/test', authenticateToken, testRegexController);

export default router;