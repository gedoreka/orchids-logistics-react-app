import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function generateAIResponse(message: string, context: any = {}) {
  try {
    // Using a more stable model name or latest
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    });

    const systemPrompt = `
أنت "مساعد الدعم الذكي" في نظام Logistics Systems Pro.
يجب أن تبدأ ردك دائماً بعبارة "🤖 مساعد الدعم الذكي:" ليعرف العميل أنه يتحدث مع ذكاء اصطناعي.

مهمتك:
1. فهم مشكلة العميل بدقة.
2. البحث في قاعدة المعرفة المزودة لك أدناه والرد بناءً عليها فقط.
3. إذا وجدت الإجابة في قاعدة المعرفة، قدم حلاً خطوة بخطوة.
4. إذا لم تجد الإجابة أو كانت المشكلة معقدة (مثل مشاكل برمجية عميقة أو طلبات مالية حساسة)، قل للعميل: "عذراً، سأقوم بتحويلك لممثل بشري لمساعدتك بشكل أفضل في هذه المشكلة المعقدة".
5. لا تختلق معلومات أبداً.

القواعد:
- تحدث بنفس لغة العميل (عربي غالباً).
- كن مهنياً، ودوداً، ومختصراً.
- اسأل أسئلة توضيحية إذا كانت رسالة العميل غير واضحة.

معلومات عن النظام:
- الاسم: Logistics Systems Pro.
- التخصص: نظام إدارة لوجستيات، محاسبة، شحن، وموارد بشرية.

سياق قاعدة المعرفة المتاح حالياً:
${JSON.stringify(context.knowledge_base || [], null, 2)}

تاريخ المحادثة الأخير:
${JSON.stringify(context.conversation_history || [], null, 2)}
`;

    const result = await model.generateContent([systemPrompt, message]);
    const response = await result.response;
    let text = response.text().trim();

    // Ensure it starts with the identity if it doesn't
    if (!text.includes("مساعد الدعم الذكي")) {
      text = "🤖 مساعد الدعم الذكي: " + text;
    }

    // Simple confidence estimation
    let confidence = 0.9;
    if (text.includes("تحويلك لممثل بشري") || text.includes("لا أملك معلومات") || text.includes("غير متأكد")) {
      confidence = 0.4;
    }

    return {
      text,
      confidence
    };
  } catch (error: any) {
    console.error("Gemini API Error Details:", {
      message: error.message,
      status: error.status,
      details: error.errorDetails
    });
    
    return {
      text: "🤖 مساعد الدعم الذكي: عذراً، أواجه صعوبة في معالجة طلبك حالياً. سأقوم بتحويلك لممثل بشري فوراً لمساعدتك.",
      confidence: 0
    };
  }
}

export async function analyzeMessage(message: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
حلل رسالة العميل التالية وأجب بتنسيق JSON فقط:
{
  "language": "ar" أو "en",
  "category": "technical" أو "financial" أو "service" أو "general",
  "urgency": "normal" أو "urgent" أو "critical",
  "request_human": true إذا طلب صراحة موظف أو إنسان، وإلا false
}

الرسالة: "${message}"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
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
