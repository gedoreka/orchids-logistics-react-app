import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function generateAIResponse(message: string, context: any = {}) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
أنت مساعد دعم فني في نظام Logistics Systems Pro.
مهمتك:
1. فهم مشكلة العميل
2. البحث في قاعدة المعرفة (المزودة لك في السياق)
3. تقديم حلول عملية
4. إذا كانت المشكلة معقدة، اطلب من العميل الانتظار ليتصل به ممثل بشري

القواعد:
- تحدث بنفس لغة العميل (عربي/إنجليزي)
- كن محترفاً ولطيفاً
- لا تختلق إجابات
- إذا لم تعرف، قل: "سأحولك لممثل بشري"
- اسأل أسئلة توضيحية عند الحاجة

أنت تعرف كل شيء عن:
- النظام المحاسبي (الفواتير، المدفوعات، التقارير)
- الخدمات المقدمة (كافة التفاصيل)
- سياسات الشركة
- إجراءات الدعم الفني

دائماً ابدأ بالترحيب واختتم بسؤال: "هل هذا يحل مشكلتك؟"

السياق الحالي:
${JSON.stringify(context, null, 2)}
`;

    const result = await model.generateContent([systemPrompt, message]);
    const response = await result.response;
    const text = response.text();

    // Simple confidence estimation based on text content (optional/simulated)
    let confidence = 0.9;
    if (text.includes("سأحولك لممثل بشري") || text.includes("لا أعرف") || text.includes("غير متأكد")) {
      confidence = 0.4;
    }

    return {
      text,
      confidence
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "عذراً، أواجه مشكلة تقنية حالياً. سأقوم بتحويلك لممثل بشري.",
      confidence: 0
    };
  }
}

export async function analyzeMessage(message: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
حلل الرسالة التالية من العميل وحدد:
1. اللغة (ar/en)
2. نوع المشكلة (technical/financial/service/general)
3. مستوى الاستعجال (normal/urgent/critical)
4. هل يطلب صراحة التحدث مع موظف بشري؟ (true/false)

الرسالة: "${message}"

أجب بتنسيق JSON فقط.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response (handling potential markdown formatting)
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      language: "ar",
      category: "general",
      urgency: "normal",
      request_human: false
    };
  }
}
