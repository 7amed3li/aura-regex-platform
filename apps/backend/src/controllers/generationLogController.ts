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
export const listLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const logs = await logService.listLogs(userId!);
    res.status(200).json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
