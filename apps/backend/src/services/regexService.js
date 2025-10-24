import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

// تهيئة Prisma Client
const prisma = new PrismaClient();

// تهيئة GoogleGenerativeAI باستخدام مفتاح API من متغيرات البيئة
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * توليد تعبير نمطي (Regex) من وصف باللغة الطبيعية باستخدام Gemini API.
 * @param {object} params
 * @param {string} params.naturalLang - الوصف باللغة الطبيعية.
 * @param {string} [params.language='English'] - لغة الوصف.
 * @param {string} params.userId - معرف المستخدم لتسجيل السجل.
 * @returns {Promise<{regex: string, logId: string}>} - التعبير النمطي ومعرف السجل.
 */
export const generateRegex = async ({ naturalLang, language = 'English', userId }) => {
  const modelName = 'gemini-pro'; 
  const model = genAI.getGenerativeModel({ model: modelName });
  const modelVersion = modelName;
  
  const prompt = `Convert this natural language condition to a regular expression (regex). The condition is in ${language}: "${naturalLang}". Provide only the regex string as output, no explanations.`;
  const startTime = Date.now();
  
  try {
    const result = await model.generateContent(prompt);
    const regex = result.response.text().trim();
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
 * @param {object} params
 * @param {string} params.regex - التعبير النمطي المراد اختباره.
 * @param {string} params.testText - النص الذي سيتم الاختبار عليه.
 * @param {string} [params.testName] - اسم حالة الاختبار.
 * @param {string} [params.ruleId] - معرف القاعدة المرتبطة (اختياري).
 * @param {string} params.userId - معرف المستخدم لتسجيل حالة الاختبار.
 * @returns {Promise<{matches: string[], testCaseId: string}>} - النتائج ومعرف حالة الاختبار.
 */
export const testRegex = async ({ regex, testText, testName, ruleId, userId }) => {
  const re = new RegExp(regex, 'g'); 
  const matches = testText.match(re) || []; 
  
  // ⭐️ الحل: بناء كائن البيانات بشكل ديناميكي واستخدام 'connect' للعلاقات
  
  // 1. البيانات الأساسية المطلوبة دائمًا
  const data = {
    name: testName || 'Unnamed Test',
    testText,
    shouldMatch: matches.length > 0,
    user: { // ربط المستخدم الذي قام بالاختبار
      connect: { id: userId }
    }
  };

  // 2. إذا تم توفير ruleId، قم بربط حالة الاختبار بالقاعدة
  if (ruleId) {
    data.rule = {
      connect: { id: ruleId },
    };
  }

  // 3. إنشاء حالة الاختبار باستخدام كائن البيانات المجمع
  const testCase = await prisma.testCase.create({
    data: data,
  });
  
  return { matches, testCaseId: testCase.id };
};
