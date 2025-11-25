import { Request, Response } from 'express';
// تأكد أن هذا المسار صحيح لملف الخدمة
import { generateRegexWithAI } from '../services/regexAIService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ الذكاء الاصطناعي لتوليد الـ Regex من النص
export const generateRegexController = async (req: Request, res: Response) => {
  try {
    // 💡 التعديل: استقبال generationType من الـ Body
    // generationType يمكن أن يكون 'ACADEMIC' أو 'DAILY'
    const { prompt, generationType } = req.body;
    const userId = (req as any).user?.id;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ success: false, message: '⚠️ prompt alanı boş olamaz.' });
    }

    // 🧠 استدعاء خدمة الذكاء الاصطناعي مع تمرير النوع الجديد
    const startTime = Date.now();

    const {
      regexResult,
      explanation,
      pythonExampleCode, // ✅ حقل جديد نستقبله من الخدمة
      mode,
      modelVersion,
      executionTime
    } = await generateRegexWithAI(
      prompt,
      generationType // تمرير نوع التوليد
    );
    const endTime = Date.now();

    // 🧾 حفظ السجل في قاعدة البيانات
    const log = await prisma.generationLog.create({
      data: {
        userId: userId ?? null,
        input: prompt,
        output: regexResult,
        explanation, 
        // ✅ تم تفعيل الحقول لتخزين البيانات بشكل صحيح
        pythonExampleCode: pythonExampleCode, 
        generationType: generationType,
        isSuccess: true,
        executionTime: executionTime ?? endTime - startTime,
        modelVersion,
      },
    });

    return res.status(200).json({
      success: true,
      message: '✅ Regex başarıyla üretildi.',
      id: log.id,
      regex: regexResult,
      explanation,
      pythonExampleCode, // ✅ إرسال كود بايثون نظيف للفرونت إند
      mode,
      modelVersion,
      executionTime: executionTime ?? endTime - startTime,
    });

  } catch (error: any) {
    console.error('=======================================');
    console.error('=== GOOGLE GEMINI API ERROR DETAILS ===');
    console.error('=======================================');
    console.error(error);
    console.error('=======================================');

    // محاولة تسجيل الخطأ في القاعدة
    try {
      await prisma.generationLog.create({
        data: {
          input: req.body?.prompt || '',
          output: error.message,
          isSuccess: false,
          executionTime: 0,
          modelVersion: 'gemini-2.5-flash',
        },
      });
    } catch (dbError) {
      console.error("Failed to log error to DB", dbError);
    }

    res.status(500).json({
      success: false,
      message: '🚨 Regex üretilemedi.',
      error: error.message || 'An internal error occurred.',
    });
  }
};

// ✅ عرض كل السجلات
export const getAllRegexes = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.generationLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Veritabanı hatası', error });
  }
};

// 🔍 البحث عن regex
export const searchRegex = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ success: false, message: 'Arama kelimesi gerekli.' });
    }

    const logs = await prisma.generationLog.findMany({
      where: {
        OR: [
          { input: { contains: q, mode: 'insensitive' } },
          { output: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Arama sırasında hata oluştu.', error });
  }
};

// ✏️ تحديث regex
export const updateRegex = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { output, explanation } = req.body;

    const updated = await prisma.generationLog.update({
      where: { id },
      data: { output, explanation },
    });

    res.status(200).json({ success: true, message: 'Regex güncellendi.', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Güncelleme hatası.', error });
  }
};

// 🗑️ حذف regex
export const deleteRegex = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.generationLog.delete({ where: { id } });

    res.status(200).json({ success: true, message: 'Regex silindi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Silme hatası.', error });
  }
};