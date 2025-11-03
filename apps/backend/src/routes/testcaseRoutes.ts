import express, { RequestHandler } from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import {
  createTestCase,
  listTestcases,
  deleteTestcase,
} from '../controllers/testcaseController.js';

const router = express.Router();

/**
 * 🧪 Test Case oluşturma (Regex test etme)
 */
router.post('/', authenticateToken as RequestHandler, createTestCase as unknown as RequestHandler);

/**
 * 📋 Kullanıcının tüm test case'lerini listeleme
 */
router.get('/', authenticateToken as RequestHandler, listTestcases as unknown as RequestHandler);

/**
 * ❌ Test Case silme
 */
router.delete('/:id', authenticateToken as RequestHandler, deleteTestcase as unknown as RequestHandler);

export default router;
