import rateLimit from 'express-rate-limit';

// ✅ التصدير الصحيح بنفس الاسم اللي تستورده
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // عدد الطلبات المسموح بها
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
