import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.js';

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};
