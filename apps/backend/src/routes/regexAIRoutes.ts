import express from 'express';
import {
  generateRegexController,
  getAllRegexes,
  searchRegex,
  updateRegex,
  deleteRegex,
} from '../controllers/regexAIController.js';import { authenticateToken } from '../middleware/authenticateToken.js';


const router = express.Router();

// 🔹 POST /api/ai/regex
router.post('/', authenticateToken, generateRegexController);
// 📜 GET كل الـ Regex
router.get('/', authenticateToken, getAllRegexes);

// 🔍 بحث
router.get('/search', authenticateToken, searchRegex);

// ✏️ تحديث
router.put('/:id', authenticateToken, updateRegex);

// 🗑️ حذف
router.delete('/:id', authenticateToken, deleteRegex);

export default router;
