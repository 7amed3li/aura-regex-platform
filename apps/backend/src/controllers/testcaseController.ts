import { Request, Response } from 'express';
import * as testcaseService from '../services/testcaseService.js';
import { AuthenticatedRequest } from '../types/express.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * 🔹 إنشاء test case جديدة
 */
export const createTestCase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, testText, shouldMatch, ruleId } = req.body;
    const userId = req.user?.id;

    if (!userId)
      return res.status(401).json({ success: false, message: '❌ Yetkisiz erişim.' });

    if (!name || !testText || typeof shouldMatch === 'undefined' || !ruleId)
      return res.status(400).json({
        success: false,
        message:
          '⚠️ "name", "testText", "shouldMatch" ve "ruleId" alanları zorunludur.',
      });

    // 🔹 Rule bilgisi getir
    const rule = await prisma.rule.findUnique({ where: { id: ruleId } });
    if (!rule)
      return res.status(404).json({ success: false, message: '❌ Rule bulunamadı.' });

    // 🔹 Regex testi yap
    const regex = new RegExp(rule.regex);
    const matchResult = regex.test(testText);

    // 🔹 Beklenenle eşleşiyor mu kontrol et
    const testPassed = matchResult === shouldMatch;

    // 🔹 Test Case veritabanına kaydet
    const testCase = await prisma.testCase.create({
      data: {
        name,
        testText,
        shouldMatch,
        ruleId,
        userId,
      },
    });

    // 🔹 Kullanıcıya açıklayıcı cevap dön
    res.status(201).json({
      success: true,
      message: testPassed
        ? `✅ Test başarılı! "${rule.name}" ifadesi beklenildiği gibi eşleşti.`
        : `❌ Test başarısız. "${rule.name}" ifadesi beklenilen sonucu vermedi.`,
      details: {
        testCaseId: testCase.id,
        ruleName: rule.name,
        regex: rule.regex,
        testText,
        matchFound: matchResult,
        expected: shouldMatch,
        passed: testPassed,
        createdAt: testCase.createdAt,
      },
    });
  } catch (error: any) {
    console.error('❌ createTestCase error:', error);
    res.status(500).json({
      success: false,
      message: '🚨 Test oluşturulamadı.',
      error: error.message,
    });
  }
};

/**
 * 🔹 جلب كل test cases لمستخدم معيّن
 */
export const listTestcases = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const testcases = await testcaseService.listTestcases(userId);
    res.status(200).json(testcases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * 🔹 حذف test case
 */
export const deleteTestcase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) return res.status(400).json({ error: 'Missing testcase ID' });
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await testcaseService.deleteTestcase(id, userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
