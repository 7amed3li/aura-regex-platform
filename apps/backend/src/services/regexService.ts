// src/services/regexService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- إعداد عميل Gemini ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is missing in .env');
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// خليه قابل للتعديل من .env وإلا الافتراضي gemini-2.5-flash
// أمثلة مدعومة حالياً: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash-001
// راجع قائمة الموديلات لو احتجت تغيير. 
const MODEL_NAME = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

/**
 * Helper: ينظّف مخرجات الموديل عشان يرجّع regex خام فقط.
 * - يشيل backticks أو أسوار الكود
 * - ياخذ أول سطر غير فاضي
 */
function extractRegexOnly(text: string): string {
  let t = text.trim();

  // لو رجع كتلة كود ثلاثية
  if (t.startsWith('```')) {
    // خذّ اللي بين الأسوار
    const m = t.match(/```(?:[\w-]+)?\s*([\s\S]*?)```/);
    if (m && m[1]) t = m[1].trim();
  }

  // خذ أول سطر غير فاضي
  const firstLine = t.split('\n').map(s => s.trim()).find(s => s.length > 0) ?? '';
  // شيل أي backticks منفردة
  return firstLine.replace(/^`+|`+$/g, '').trim();
}

/**
 * توليد تعبير نمطي (Regex) من وصف باللغة الطبيعية باستخدام Gemini API.
 */
export const generateRegex = async ({
  naturalLang,
  language = 'English',
  userId,
}: {
  naturalLang: string;
  language?: string;
  userId: string;
}): Promise<{ regex: string; logId: string }> => {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const modelVersion = MODEL_NAME;

  const prompt =
    `Convert this natural language condition to a regular expression (regex). ` +
    `The condition is in ${language}: "${naturalLang}". ` +
    `Return ONLY the regex string. No explanation, no quotes, no code fences.`;

  const startTime = Date.now();

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text() ?? '';
    const regex = extractRegexOnly(raw);
    const executionTime = Date.now() - startTime;

    const log = await prisma.generationLog.create({
      data: {
        input: naturalLang,
        output: regex,
        isSuccess: true,
        executionTime,
        modelVersion,
        userId,
        correlationId: `gen-${Date.now()}-${userId}`,
      },
    });

    return { regex, logId: log.id };
  } catch (error) {
    await prisma.generationLog.create({
      data: {
        input: naturalLang,
        output: '',
        isSuccess: false,
        executionTime: Date.now() - startTime,
        modelVersion,
        userId,
        correlationId: `gen-fail-${Date.now()}-${userId}`,
      },
    });
    throw error;
  }
};

/**
 * اختبار تعبير نمطي مقابل نص اختبار.
 */
export const testRegex = async ({
  regex,
  testText,
  testName,
  ruleId,
  userId,
}: {
  regex: string;
  testText: string;
  testName?: string;
  ruleId?: string;
  userId: string;
}): Promise<{ matches: string[]; testCaseId: string }> => {
  const re = new RegExp(regex, 'g');
  const matches = testText.match(re) || [];

  // نبني الداتا ديناميكياً مع العلاقات
  const data: any = {
    name: testName || 'Unnamed Test',
    testText,
    shouldMatch: matches.length > 0,
    user: { connect: { id: userId } },
  };

  if (ruleId) {
    data.rule = { connect: { id: ruleId } };
  }

  const testCase = await prisma.testCase.create({ data });
  return { matches, testCaseId: testCase.id };
};
