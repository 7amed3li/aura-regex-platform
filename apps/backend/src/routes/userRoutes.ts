import { Router } from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { listUsers, banUser, unbanUser, getSystemStats } from '../controllers/userController.js';

const router = Router();

router.get('/stats', authenticateToken, requireAdmin, getSystemStats); // ✅ Stats route
router.get('/', authenticateToken, requireAdmin, listUsers);
router.put('/:userId/ban', authenticateToken, requireAdmin, banUser);
router.put('/:userId/unban', authenticateToken, requireAdmin, unbanUser);

export default router;
