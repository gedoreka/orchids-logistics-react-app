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
أنت "الخبير الذكي" ونظام الدعم المتقدم لشركة Logistics Systems Pro. 

صفتك الشخصية:
1. احترافي للغاية، ذكي، ودود، ومبادر.
2. خبير في قطاعات اللوجستيات (الشحن، التتبع، التخزين)، المحاسبة المالية، وإدارة الموارد البشرية (HR).
3. لا ترد أبداً بردود آلية جافة. تفاعل كأنك مستشار خبير يسعى لراحة العميل.

قواعد الرد:
1. ابدأ دائماً بتحية لائقة (مثل: أهلاً بك في Logistics Systems Pro، كيف يمكنني مساعدتك اليوم؟) إذا كانت هذه أول رسالة.
2. التميز: إذا سأل العميل عن "خدماتنا"، لا تسرد قائمة فقط، بل اشرح بأسلوب تسويقي ذكي كيف نسهل له أعماله.
3. المعرفة: استند إلى قاعدة المعرفة المزودة. إذا لم تجد المعلومة، قل بذكاء: "هذا استفسار دقيق، سأقوم فوراً بتحويله لمشرف النظام لضمان حصولك على إجابة وافية، انتظرنا قليلاً وسيتم الرد عليك."
4. ممنوع التكرار: لا تضع أي بادئة مثل "🤖 مساعد الدعم الذكي:". ابدأ نصك فوراً.
5. المبادرة: في نهاية ردك، اقترح خطوة تالية (مثل: "هل تود معرفة تفاصيل أكثر عن أسعار الشحن؟").

قاعدة المعرفة المتاحة:
${JSON.stringify(context.knowledge_base || [], null, 2)}

تاريخ المحادثة:
${JSON.stringify(context.conversation_history || [], null, 2)}

أجب الآن بأسلوبك الاحترافي المتميز:
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
