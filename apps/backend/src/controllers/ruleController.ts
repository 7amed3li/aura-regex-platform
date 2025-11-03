import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import * as ruleService from '../services/ruleService.js';
// نوع مريح للطلبات الموثقة
type AuthenticatedRequest = Request & { user: { id: string; role?: string } };

// 🟢 Create Rule
export const createRule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, naturalLang, regex, isPublic, folderId } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ success: false, message: '❌ Yetkisiz erişim.' });

    if (!name || !description || !naturalLang || !regex)
      return res.status(400).json({
        success: false,
        message: '⚠️ "name", "description", "naturalLang" ve "regex" alanları zorunludur.',
      });

    // ✅ تم التعديل هنا — تمرير باراميترين بدل واحد
    const rule = await ruleService.createRule(
      {
        name,
        description,
        naturalLang,
        regex,
        isPublic,
        folderId,
      },
      userId
    );

    res.status(201).json({
      success: true,
      message: '✅ Yeni bir kural başarıyla oluşturuldu!',
      rule: {
        id: rule.id,
        name: rule.name,
        description: rule.description,
        regex: rule.regex,
        naturalLang: rule.naturalLang,
        isPublic: rule.isPublic,
        createdAt: rule.createdAt,
      },
    });
  } catch (error: any) {
    console.error('❌ createRule error:', error);
    res.status(500).json({ success: false, message: 'Kural oluşturulamadı.', error: error.message });
  }
};

// 📜 Get All Rules (خاصة بالمستخدم)
export const listRulesController = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const rules = await prisma.rule.findMany({
      where: { userId: req.user.id },
      include: { folder: true, versions: true, testCases: true, likes: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rules);
  } catch (error) {
    console.error('List rules error:', error);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

// 🔍 Get Rule by ID
export const getRuleByIdController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const rule = await prisma.rule.findUnique({
      where: { id },
      include: { folder: true, versions: true, testCases: true, likes: true },
    });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });
    if (rule.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    res.json(rule);
  } catch (error) {
    console.error('Get rule by id error:', error);
    res.status(500).json({ error: 'Failed to fetch rule' });
  }
};

// ✏️ Update Rule
export const updateRuleController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { name, description, naturalLang, regex, folderId, isPublic } = req.body;

  if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const rule = await prisma.rule.findUnique({ where: { id } });
    if (!rule || rule.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized or rule not found' });
    }

    const updatedRule = await prisma.rule.update({
      where: { id },
      data: {
        name,
        description,
        naturalLang,
        regex,
        isPublic: typeof isPublic === 'boolean' ? isPublic : rule.isPublic,
        ...(folderId ? { folder: { connect: { id: folderId as string } } } : {}),
      },
      include: { folder: true, versions: true, testCases: true, likes: true },
    });

    // إنشاء نسخة جديدة إذا تغير النص/الريجيكس
    if (naturalLang || regex) {
      await prisma.ruleVersion.create({
        data: {
          naturalLang: naturalLang ?? rule.naturalLang,
          regex: regex ?? rule.regex,
          ruleId: id,
        },
      });
    }

    res.json(updatedRule);
  } catch (error) {
    console.error('Update rule error:', error);
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

// ❌ Delete Rule
export const deleteRuleController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const rule = await prisma.rule.findUnique({ where: { id } });
    if (!rule || rule.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized or rule not found' });
    }

    await prisma.rule.delete({ where: { id } });
    res.json({ message: 'Rule deleted' });
  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};

// 💙 Like Rule
export const likeRuleController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const rule = await prisma.rule.findUnique({ where: { id } });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });

    const existingLike = await prisma.ruleLike.findUnique({
      where: { userId_ruleId: { userId: req.user.id, ruleId: id } }, // ✅ id مصرح إنه string
    });
    if (existingLike) return res.status(400).json({ error: 'Already liked' });

    const like = await prisma.ruleLike.create({
      data: { userId: req.user.id, ruleId: id },
    });

    res.status(201).json(like);
  } catch (error) {
    console.error('Like rule error:', error);
    res.status(500).json({ error: 'Failed to like rule' });
  }
};
