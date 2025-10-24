import { generateRegex, testRegex } from '../services/regexService.js';

export const generateRegexController = async (req, res) => {
  const { naturalLang, language } = req.body;
  if (!naturalLang) return res.status(400).json({ error: 'Natural language condition required' });

  try {
    const result = await generateRegex({ naturalLang, language, userId: req.user.id });
    res.json(result);
  } catch (error) {
    // التعديل هنا لطباعة الخطأ المفصل
    console.error('================================================');
    console.error('=== DETAILED ERROR FROM GOOGLE GEMINI API ===');
    console.error('================================================');
    console.error(error); // هذا هو أهم سطر، سيطبع الخطأ الكامل
    console.error('================================================');
    res.status(500).json({ error: 'Regex generation failed' });
  }
};

export const testRegexController = async (req, res) => {
  const { regex, testText, testName, ruleId } = req.body;
  if (!regex || !testText) return res.status(400).json({ error: 'Regex and test text required' });

  try {
    const result = await testRegex({ regex, testText, testName, ruleId, userId: req.user.id });
    res.json(result);
  } catch (error) {
    console.error('Regex test error:', error);
    res.status(400).json({ error: 'Invalid regex or test failed' });
  }
};
