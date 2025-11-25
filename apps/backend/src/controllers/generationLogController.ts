import { Request, Response } from 'express';
import * as logService from '../services/generationLogService.js';
import { AuthenticatedRequest } from '../types/express.js';

/**
 * 🧠 إنشاء سجل جديد
 */
export const createLog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { input, output, isSuccess, executionTime, modelVersion } = req.body;

    const log = await logService.createLog({
      input,
      output,
      isSuccess,
      executionTime,
      modelVersion,
      userId,
    });

    res.status(201).json(log);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * 📜 جلب السجلات الخاصة بالمستخدم
 */
/**
 * 📜 جلب السجلات الخاصة بالمستخدم
 */
export const listLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // ✅ 1. التحقق من وجود الـ userId قبل الاستخدام
    if (!userId) {
      // يمكنك إرسال 401 هنا بدلاً من الانتظار حتى يفشل Service
      return res.status(401).json({ error: 'Unauthorized: User ID not found in token' });
    }

    // ✅ 2. استخدام الـ userId الآمن بدون المعامل !
    const logs = await logService.listLogs(userId);

    res.status(200).json(logs);
  } catch (error: any) {
    console.error("API Error in listLogs:", error); // 💡 إضافة هذا السطر لرؤية خطأ Prisma في Terminal
    res.status(500).json({ error: 'Internal Server Error fetching logs.' });
  }
};
