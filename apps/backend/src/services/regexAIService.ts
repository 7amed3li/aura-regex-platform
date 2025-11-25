import { GoogleGenerativeAI, SchemaType, type Schema } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * ⚙️ إعداد عميل Gemini 2.5 Flash
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// 💡 تعريف الـ Schema
const RegexGenerationSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    regex: {
      type: SchemaType.STRING,
      description:
        "The final Regular Expression string. For ACADEMIC mode, use theoretical notation (e.g., (a+b)*). For DAILY mode, use standard regex (e.g., [a-z]+).",
    },
    explanation: {
      type: SchemaType.STRING,
      description: "A detailed explanation written ONLY in Turkish.",
    },
    pythonExampleCode: {
      type: SchemaType.STRING,
      description:
        "A Python code snippet using 're' module. Note: If ACADEMIC mode uses '+', translate it to '|' for valid Python code here.",
    },
  },
  required: ["regex", "explanation", "pythonExampleCode"],
};

/**
 * 🧠 وظيفة توليد التعبير المنتظم (Regex) من وصف المستخدم
 */
export const generateRegexWithAI = async (
  prompt: string,
  generationType: "ACADEMIC" | "DAILY" = "DAILY"
) => {
  try {
    // ✅ التحقق من الـ Cache (Professional Caching)
    // Now includes generationType to distinguish between ACADEMIC and DAILY modes.
    const cached = await prisma.generationLog.findFirst({
      where: {
        input: prompt,
        isSuccess: true,
        generationType: generationType // ✅ Cache key now includes mode
      },
      orderBy: { createdAt: "desc" },
    });

    if (cached) {
      console.log(`⚡ Cache hit (${generationType}) — returning stored regex result.`);
      return {
        regexResult: cached.output,
        explanation: cached.explanation ?? "Açıklama mevcut değil.",
        pythonExampleCode: cached.pythonExampleCode ?? "# Örnek kod cache verisinde bulunamadı.",
        mode: "cached",
        modelVersion: cached.modelVersion ?? "gemini-2.5-flash",
        executionTime: 0,
      };
    }

    // ✅✅✅ التعديل الجوهري هنا بناءً على ملفات PDF ✅✅✅
    let typeInstruction = "";

    if (generationType === "ACADEMIC") {
      // 🎓 تعليمات الوضع الأكاديمي
      typeInstruction = `
            ROLE: Professor of Automata Theory and Formal Languages.
            SOURCE MATERIAL STYLE: Follow the notation found in "DERS 2.pdf" and "DERS 3.pdf".
            
            CRITICAL NOTATION RULES FOR ACADEMIC MODE:
            1. **REGEX FIELD**: Use the plus sign '+' for OR/Union. NEVER use '|'. (Example: Write '(a+b)*' instead of '(a|b)*').
            2. **FORMAT**: The output regex should look like a formula: L = ... (Example: L = a(a+b)*).
            3. **ALPHABET**: Assume Σ={a,b} or Σ={0,1} unless specified otherwise.
            4. **PYTHON CODE**: Since Python doesn't understand '+' as OR, translate the theoretical regex to valid Python regex (replace '+' with '|') ONLY inside the 'pythonExampleCode' field.
        `;
    } else {
      // ☕ تعليمات الوضع اليومي
      typeInstruction = `
            ROLE: Senior Software Engineer.
            GOAL: Generate a practical, ready-to-copy Regex for programming (JavaScript/Python/PCRE).
            NOTATION RULES:
            1. Use standard regex syntax (e.g., [a-z]+, \\d{4}, (a|b)).
            2. Use slashes and flags if necessary (e.g., /pattern/g).
            3. Explanation should focus on matching logic and edge cases.
        `;
    }

    const systemInstruction = `
        You are an expert Regular Expression generator for a Turkish audience.
        
        ${typeInstruction}

        GENERAL RULES:
        1. Output MUST be a valid JSON object matching the schema.
        2. 'explanation' MUST be in Turkish.
        3. Do NOT include markdown formatting (like \`\`\`json) in the JSON values.
    `;

    const startTime = Date.now();

    // ✅ إرسال الطلب لـ Gemini
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `User Request: ${prompt}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RegexGenerationSchema,
      },
      systemInstruction: {
        role: "system", // ✅ مهم
        parts: [{ text: systemInstruction }],
      },
    });

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // ✅ استخراج وتحليل الـ JSON
    const responseText = result.response.text();
    let jsonOutput: any;

    try {
      const cleanJson = responseText
        .trim()
        .replace(/^```json/, "")
        .replace(/```$/, "");
      jsonOutput = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse AI JSON:", responseText);
      throw new Error("AI response was not valid JSON.");
    }

    const regexResult = jsonOutput.regex || "⚠️ No regex detected";
    const explanation = jsonOutput.explanation || "Açıklama bulunamadı.";
    const pythonExampleCode =
      jsonOutput.pythonExampleCode || "# Kod üretilemedi.";

    console.log("🧠 AI Output Mode:", generationType);
    console.log("📝 Generated Regex:", regexResult);

    return {
      regexResult,
      explanation,
      pythonExampleCode,
      mode: generationType,
      modelVersion: "gemini-2.5-flash",
      executionTime,
    };
  } catch (error: any) {
    console.error("❌ generateRegexWithAI hata:", error);
    throw new Error("AI generation failed: " + error.message);
  }
};
