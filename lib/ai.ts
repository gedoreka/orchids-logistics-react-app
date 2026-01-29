import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function generateAIResponse(message: string, context: any = {}) {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    console.error("CRITICAL: GOOGLE_GEMINI_API_KEY is missing from environment variables");
    return {
      text: "🤖 مساعد الدعم الذكي: عذراً، لم يتم تكوين مفتاح الـ AI بشكل صحيح. يرجى التواصل مع المدير.",
      confidence: 0
    };
  }

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      });


    const systemPrompt = `
أنت "مساعد الدعم الذكي" المتميز في نظام Logistics Systems Pro. 

مهمتك هي تقديم دعم استثنائي وذكي للعملاء.
القواعد الذهبية لردودك:
1. الشخصية: كن ودوداً، مهنياً، ومتميزاً في أسلوبك. تجنب الردود الآلية الجافة.
2. الدقة: استند فقط إلى قاعدة المعرفة المزودة لك. لا تخترع حقائق.
3. التفاعل: إذا كان السؤال غير واضح، اطلب توضيحاً بلباقة.
4. الصدق: إذا لم تجد الإجابة في قاعدة المعرفة، لا تحاول التخمين. بدلاً من ذلك، أخبر العميل بلباقة أنك ستحيله للدعم البشري.

قاعدة المعرفة المتاحة:
${JSON.stringify(context.knowledge_base || [], null, 2)}

تاريخ المحادثة:
${JSON.stringify(context.conversation_history || [], null, 2)}

ملاحظة هامة: ابدأ ردك مباشرة بالحل أو التحية، ولا تستخدم أي بادئة ثابتة مكررة مثل "🤖 مساعد الدعم الذكي:". دع ردك يكون طبيعياً كأنك إنسان خبير.
`;

    let result;
      try {
        result = await model.generateContent([systemPrompt, message]);
      } catch (genError: any) {
        console.error("Primary model failed, trying fallback...", genError.message);
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        result = await fallbackModel.generateContent([systemPrompt, message]);
      }


    const response = await result.response;
    let text = response.text().trim();

    // Remove any forced prefixes if the model still adds them
    text = text.replace(/^🤖 مساعد الدعم الذكي:\s*/, "");
    text = text.replace(/^مساعد الدعم الذكي:\s*/, "");

    let confidence = 0.9;
    if (text.includes("تحويلك لممثل بشري") || text.includes("لا أملك معلومات") || text.includes("غير متأكد")) {
      confidence = 0.4;
    }

    return { text, confidence };
  } catch (error: any) {
    console.error("Gemini API Error Details:", error.message);
    throw error; // Let the caller handle the fallback
  }
}

  export async function analyzeMessage(message: string) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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

      let result;
      try {
        result = await model.generateContent(prompt);
      } catch (genError: any) {
        console.error("Analysis Primary model failed, trying fallback...", genError.message);
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        result = await fallbackModel.generateContent(prompt);
      }

    
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
