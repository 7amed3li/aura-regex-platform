import { Request } from 'express';

// ✅ تعريف شكل بيانات المستخدم اللي جاي من التوكن
export interface UserPayload {
  id: string;
  role: 'USER' | 'ADMIN';
}

// ✅ الطلب الموثق اللي يستخدم في الكنترولرز
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
