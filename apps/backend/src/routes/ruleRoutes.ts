import express, { RequestHandler } from 'express';
import {
    createRule,
    listRulesController,
    getRuleByIdController,
    updateRuleController,
    deleteRuleController,
    likeRuleController,
    unlikeRuleController,
    getPublicRulesController,
    addCommentController,
    getCommentsController,
    updateRuleVisibilityController
} from '../controllers/ruleController.js';
import { authenticateToken } from '../middleware/authenticateToken.js';

const router = express.Router();

// Public & Social Routes
router.get('/public', authenticateToken as RequestHandler, getPublicRulesController as unknown as RequestHandler);
router.post('/:id/like', authenticateToken as RequestHandler, likeRuleController as unknown as RequestHandler);
router.delete('/:id/like', authenticateToken as RequestHandler, unlikeRuleController as unknown as RequestHandler);

// Comments
router.post('/:id/comments', authenticateToken as RequestHandler, addCommentController as unknown as RequestHandler);
router.get('/:id/comments', authenticateToken as RequestHandler, getCommentsController as unknown as RequestHandler);

// Visibility
router.put('/:id/visibility', authenticateToken as RequestHandler, updateRuleVisibilityController as unknown as RequestHandler);

// Standard CRUD Routes
router.post('/', authenticateToken as RequestHandler, createRule as unknown as RequestHandler);
router.get('/', authenticateToken as RequestHandler, listRulesController as unknown as RequestHandler);
router.get('/:id', authenticateToken as RequestHandler, getRuleByIdController as unknown as RequestHandler);
router.put('/:id', authenticateToken as RequestHandler, updateRuleController as unknown as RequestHandler);
router.delete('/:id', authenticateToken as RequestHandler, deleteRuleController as unknown as RequestHandler);

export default router;