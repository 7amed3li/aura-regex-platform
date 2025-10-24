import express from 'express';
import { createRuleController, listRulesController, updateRuleController, deleteRuleController, likeRuleController } from '../controllers/ruleController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/', authenticateToken, createRuleController);
router.get('/', authenticateToken, listRulesController);
router.put('/:id', authenticateToken, updateRuleController);
router.delete('/:id', authenticateToken, deleteRuleController);
router.post('/:id/like', authenticateToken, likeRuleController);

export default router;