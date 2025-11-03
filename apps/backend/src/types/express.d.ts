import { Request } from 'express';
import { Role } from '@prisma/client';

export interface UserPayload {
  id: string;
  role: Role | 'USER' | 'ADMIN';
}

// هنا نعرّف النوع الجديد اللي يمدد Request
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// نخليها global عشان TypeScript يقدر يشوفها في كل الملفات
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
