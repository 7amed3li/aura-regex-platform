import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/auth.js'; // ✅ نستورد النوع الجاهز

// النوع اللي يمثل محتوى التوكن
type JwtPayload = { id: string; role: 'USER' | 'ADMIN' };

// ✅ Middleware للمصادقة والتحقق من الـ JWT
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // ✅ إضافة بيانات المستخدم داخل req.user
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
