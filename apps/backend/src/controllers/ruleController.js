import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRuleController = async (req, res) => {
  const { name, description, naturalLang, regex, folderId, isPublic } = req.body;
  if (!name || !naturalLang || !regex) return res.status(400).json({ error: 'Name, naturalLang, and regex required' });

  try {
    const rule = await prisma.rule.create({
      data: {
        name,
        description,
        naturalLang,
        regex,
        isPublic: isPublic || false,
        userId: req.user.id,
        folderId,
        safetyStatus: 'UNKNOWN',
      },
    });

    await prisma.ruleVersion.create({
      data: { naturalLang, regex, ruleId: rule.id },
    });

    res.status(201).json(rule);
  } catch (error) {
    console.error('Create rule error:', error);
    res.status(500).json({ error: 'Failed to create rule' });
  }
};

export const listRulesController = async (req, res) => {
  try {
    const rules = await prisma.rule.findMany({
      where: { userId: req.user.id },
      include: { folder: true, versions: true, testCases: true },
    });
    res.json(rules);
  } catch (error) {
    console.error('List rules error:', error);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
};

export const updateRuleController = async (req, res) => {
  const { id } = req.params;
  const { name, description, naturalLang, regex, folderId, isPublic } = req.body;

  try {
    const rule = await prisma.rule.findUnique({ where: { id } });
    if (!rule || rule.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized or rule not found' });

    const updatedRule = await prisma.rule.update({
      where: { id },
      data: { name, description, naturalLang, regex, folderId, isPublic },
    });

    if (naturalLang || regex) {
      await prisma.ruleVersion.create({
        data: { naturalLang: naturalLang || rule.naturalLang, regex: regex || rule.regex, ruleId: id },
      });
    }

    res.json(updatedRule);
  } catch (error) {
    console.error('Update rule error:', error);
    res.status(500).json({ error: 'Failed to update rule' });
  }
};

export const deleteRuleController = async (req, res) => {
  const { id } = req.params;

  try {
    const rule = await prisma.rule.findUnique({ where: { id } });
    if (!rule || rule.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized or rule not found' });

    await prisma.rule.delete({ where: { id } });
    res.json({ message: 'Rule deleted' });
  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
};

export const likeRuleController = async (req, res) => {
  const { id } = req.params;

  try {
    const rule = await prisma.rule.findUnique({ where: { id } });
    if (!rule) return res.status(404).json({ error: 'Rule not found' });

    const existingLike = await prisma.ruleLike.findUnique({
      where: { userId_ruleId: { userId: req.user.id, ruleId: id } },
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