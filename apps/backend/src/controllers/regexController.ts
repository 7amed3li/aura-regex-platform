import { Request, Response } from 'express';
import { generateRegex, testRegex } from '../services/regexService.js';
import type { UserPayload } from '../types/auth.js'; // ✅ استيراد النوع الصحيح

// ✅ تعريف الطلب بعد إضافة المستخدم من middleware
export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

// 🎯 توليد Regex باستخدام Gemini
export const generateRegexController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { naturalLang, language } = req.body;
    const userId = req.user?.id;

    if (!naturalLang) {
      return res.status(400).json({ error: 'Natural language condition is required.' });
    }
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID is missing.' });
    }

    const result = await generateRegex({ naturalLang, language, userId });
    res.status(200).json(result);
  } catch (error: any) {
    console.error('=======================================');
    console.error('=== GOOGLE GEMINI API ERROR DETAILS ===');
    console.error('=======================================');
    console.error(error);
    console.error('=======================================');
    res.status(500).json({
      error: 'Regex generation failed.',
      details: error.message || 'An internal error occurred.',
    });
  }
};

// 🧪 اختبار Regex على النصوص
export const testRegexController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { regex, testText, testName, ruleId } = req.body;
    const userId = req.user?.id;

    if (!regex || typeof testText === 'undefined') {
      return res.status(400).json({ error: 'Regex and test text are required.' });
    }
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID is missing.' });
    }

    const result = await testRegex({ regex, testText, testName, ruleId, userId });

    const message =
      result.matches.length > 0
        ? '✅ Test başarıyla geçti! Regex metindeki uygun eşleşmeyi buldu.'
        : '❌ Test başarısız! Regex verilen metinde eşleşme bulamadı.';

    res.status(200).json({
      success: result.matches.length > 0,
      message,
      matches: result.matches,
      testCaseId: result.testCaseId,
      testName,
      regex,
      testText
    });
  } catch (error: any) {
    console.error('Regex test error:', error);
    res.status(400).json({ error: error.message || 'Invalid regex or test failed.' });
  }
};

