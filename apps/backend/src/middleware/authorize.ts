// src/middleware/authorize.ts

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Middleware للتحقق من صلاحيات المستخدم (RBAC - Role Based Access Control).
 * يعمل كحاجز أمان لمنع المستخدمين غير المصرح لهم من الوصول إلى Endpoints حساسة.
 * * @param allowedRoles - مصفوفة تحتوي على الأدوار المسموح لها بالدخول (مثلاً [UserRole.ADMIN])
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    // 1. Safety Check: التحقق من وجود بيانات المستخدم (يجب أن يسبقه authenticateToken)
    if (!req.user) {
      console.error('[Authorization Error] No user context found. Did you forget "authenticateToken" middleware?');
      return res.status(401).json({ 
        error: 'Unauthorized: User context is missing.' 
      });
    }

    // 2. Role Check: التحقق مما إذا كان دور المستخدم ضمن القائمة المسموحة
    if (!allowedRoles.includes(req.user.role)) {
      
      // تسجيل محاولة الاختراق أو الوصول المرفوض (Security Audit Log)
      console.warn(
        `[Security Warning] Access Denied. User: ${req.user.id} (Role: ${req.user.role}) tried to access ${req.originalUrl}`
      );

      return res.status(403).json({ 
        error: 'Forbidden: You do not have permission to perform this action.' 
      });
    }

    // 3. Success: السماح بالمرور
    next();
  };
};