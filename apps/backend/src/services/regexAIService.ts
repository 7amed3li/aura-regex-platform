import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

/**
 * ⚙️ إعداد عميل Gemini 2.5 Flash
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * 🧠 وظيفة توليد التعبير المنتظم (Regex) من وصف المستخدم
 */
export const generateRegexWithAI = async (prompt: string) => {
  try {
    // ✅ قبل ما نبدأ، نتحقق هل فيه نتيجة مخزنة سابقًا في قاعدة البيانات (Cache)
    const cached = await prisma.generationLog.findFirst({
      where: { input: prompt, isSuccess: true },
      orderBy: { createdAt: "desc" },
    });

    if (cached) {
      console.log("⚡ Cache hit — returning stored regex result.");
      return {
        regexResult: cached.output,
        explanation: cached.explanation ?? "Açıklama mevcut değil.",
        mode: "cached",
        modelVersion: cached.modelVersion ?? "gemini-2.5-flash",
      };
    }

    // ✅ تحديد نوع الجملة (Formal أو Natural)
    const isFormalLanguage = /(\{0,1\}|düzenli ifade|regular|dil|0 ve 1)/i.test(prompt);

    // ✅ إعداد system prompt الأكاديمي
    const systemPrompt = isFormalLanguage
      ? `Sen bir Otomata Teorisi ve Düzenli Diller uzmanısın.
        Kullanıcının verdiği dil tanımına göre, SADECE akademik olarak GEÇERLİ düzenli ifadeleri (regular expressions) üret.
        Sadece şu semboller kullanılabilir: +, *, (), a, b, 0, 1.
        Yanlış veya kabul edilmeyen sembolleri kullanma.
        Her regex satır satır listelensin ve her birinin altında kısa açıklama ver.
        Son satırda en doğru regex'i belirt.
        Şimdi şu ifadeye göre düzenli ifade üret:
        ${prompt}`
      : `Kullanıcının doğal açıklamasına uygun TEK regex oluştur.
        Regex'i açıkla ve kısa kullanım örneği ver.`;

    // 🕒 نحسب الوقت قبل وبعد تشغيل الذكاء الاصطناعي
    const startTime = Date.now();

    // ✅ إرسال الطلب لـ Gemini
    const result = await model.generateContent(`${systemPrompt}\n\nKullanıcı Girişi:\n${prompt}`);

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // ✅ استخراج النص الناتج
    const output = result.response.text().trim();

    // ✅ تحليل ذكي للـ regex والشرح
    let regexResult = "";
    let explanation = "";

    const lines = output.split("\n").map((l) => l.trim()).filter((l) => l);

    if (/regex/i.test(output) || /açıklama/i.test(output)) {
      const regexMatch =
        output.match(/regex[:：]?\s*([^\n]+)/i) ||
        output.match(/1️⃣\s*regex[:：]?\s*([^\n]+)/i) ||
        output.match(/düzenli ifade[:：]?\s*([^\n]+)/i);

      const explMatch =
        output.match(/açıklama[:：]?\s*([\s\S]*)/i) ||
        output.match(/🟢\s*açıklama[:：]?\s*([\s\S]*)/i) ||
        output.match(/(?:Açıklama|AÇIKLAMA)[:：]?\s*([\s\S]*)/i);

      regexResult = regexMatch?.[1]?.trim() ?? lines[0] ?? "⚠️ No regex detected";
      explanation =
        explMatch?.[1]?.trim() ||
        lines.slice(1).join("\n").trim() ||
        "Açıklama bulunamadı.";
    } else {
      regexResult = lines[0] ?? "⚠️ No regex detected";
      explanation = lines.slice(1).join("\n").trim() || "Açıklama bulunamadı.";
    }

    // ✅ تأكيد أن القيم غير فارغة نهائيًا
    regexResult = regexResult || "⚠️ No regex detected";
    explanation = explanation || "Açıklama bulunamadı.";

    console.log("🧠 Regex Result:", regexResult);
    console.log("📝 Explanation:", explanation);

    // ✅ نرجع النتيجة للـ Controller
    return {
      regexResult,
      explanation,
      mode: isFormalLanguage ? "formal" : "natural",
      modelVersion: "gemini-2.5-flash",
      executionTime,
    };
  } catch (error: any) {
    console.error("❌ generateRegexWithAI hata:", error);
    throw new Error("AI generation failed: " + error.message);
  }
};
