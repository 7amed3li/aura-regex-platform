import express, { RequestHandler } from 'express';
import {
  createRule,
  listRulesController,
  getRuleByIdController,
  updateRuleController,
  deleteRuleController,
  likeRuleController,
} from '../controllers/ruleController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

router.post('/', authenticateToken as RequestHandler, createRule as unknown as RequestHandler);
router.get('/', authenticateToken as RequestHandler, listRulesController as unknown as RequestHandler);
router.put('/:id', authenticateToken as RequestHandler, updateRuleController as unknown as RequestHandler);
router.get('/:id', authenticateToken as RequestHandler, getRuleByIdController as unknown as RequestHandler);
router.post('/:id/like', authenticateToken as RequestHandler, likeRuleController as unknown as RequestHandler);

export default router;
