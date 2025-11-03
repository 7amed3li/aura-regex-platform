import { Request, Response } from 'express';
import { generateRegexWithAI } from '../services/regexAIService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ الذكاء الاصطناعي لتوليد الـ Regex من النص
// ✅ الذكاء الاصطناعي لتوليد الـ Regex من النص
export const generateRegexController = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const userId = (req as any).user?.id;

    if (!prompt || prompt.trim() === '') {
      return res.status(400).json({ success: false, message: '⚠️ prompt alanı boş olamaz.' });
    }

    // 🧠 استدعاء خدمة الذكاء الاصطناعي مباشرة بنص المستخدم
    const startTime = Date.now();
    const { regexResult, explanation, mode, modelVersion, executionTime } = await generateRegexWithAI(prompt);
    const endTime = Date.now();

    // 🧾 حفظ السجل في قاعدة البيانات
    const log = await prisma.generationLog.create({
      data: {
        userId: userId ?? null,
        input: prompt,
        output: regexResult,
        explanation, // ✅ نضيف الشرح هنا
        isSuccess: true,
        executionTime: executionTime ?? endTime - startTime,
        modelVersion,
      },
    });

    // ✅ الرد على العميل
    return res.status(200).json({
      success: true,
      message: '✅ Regex başarıyla üretildi.',
      mode,
      regex: regexResult,
      explanation,
      logId: log.id,
    });
  } catch (error: any) {
    console.error('❌ Regex AI Controller error:', error);

    await prisma.generationLog.create({
      data: {
        input: req.body?.prompt || '',
        output: error.message,
        isSuccess: false,
        executionTime: 0,
        modelVersion: 'gemini-2.5-flash',
      },
    });

    res.status(500).json({
      success: false,
      message: '🚨 Regex üretilemedi.',
      error: error.message,
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
