import express from 'express';
import { recordLoginAttempt, getLoginAttempts } from '../controllers/loginAttemptController.js';

const router = express.Router();

router.post('/', recordLoginAttempt);
router.get('/:email', getLoginAttempts);

export default router;
