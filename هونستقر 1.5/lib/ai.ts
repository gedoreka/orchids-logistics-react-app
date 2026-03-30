import { GoogleGenerativeAI } from "@google/generative-ai";
import { knowledgeBase } from "@/lib/ai-assistant/core/knowledge-base";
import { getSystemStats } from "@/lib/ai-assistant/data/system-data";
import { generateResponse as generateSamLocalResponse } from "@/lib/ai-assistant/core/response-generator";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function generateAIResponse(message: string, context: any = {}) {
  const userName = context.user_name || "العميل";
  const userId = context.company_id?.toString() || "default";

  // 1. Try local Sam Engine first for speed and quota saving
  const localResponse = await generateSamLocalResponse(userId, userName, message);
  
  // If local engine is highly confident (greeting or direct match), return it
  if (localResponse.analysis.confidence > 0.8) {
    return {
      text: localResponse.text,
      confidence: localResponse.analysis.confidence,
      buttons: localResponse.buttons || []
    };
  }

  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    return {
      text: localResponse.text,
      confidence: 0.5,
      buttons: localResponse.buttons
    };
  }

  try {
    const stats = context.company_id ? await getSystemStats(context.company_id) : null;
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.8,
      }
    });

    const systemPrompt = `
أنت "سام" (Sam)، المساعد الذكي والخبير المحاسبي في نظام المحاسب الذكي (Smart Accountant System).
أنت لست مجرد روبوت، بل شريك ذكي، دافئ، ومتفاعل يفهم السياق والمزاج.

قواعدك الذهبية:
1. الشخصية: كن ودوداً للغاية، استخدم الرموز التعبيرية (Emojis) بشكل ذكي، ونادِ المستخدم باسمه: ${userName}.
2. المعرفة الحية: استخدم الإحصائيات الحالية للنظام إذا تم تزويدك بها.
3. الذكاء السياقي: افهم مزاج المستخدم. إذا كان غاضباً، كن متعاطفاً جداً. إذا كان سعيداً، شاركه الفرحة.
4. قاعدة المعرفة: استند إلى هذه البيانات الأساسية:
${JSON.stringify(knowledgeBase, null, 2)}

إحصائيات حية للشركة الحالية:
${JSON.stringify(stats, null, 2)}

تاريخ المحادثة:
${JSON.stringify(context.conversation_history || [], null, 2)}

مهم جداً:
- لا تستخدم مقدمات مكررة مثل "بصفتي مساعد ذكي".
- اجعل ردودك تفاعلية، واقترح خطوات قادمة.
- إذا سألك المستخدم "من أنت؟" أو "ما اسمك؟"، أجب بأنك "سام"، مساعدهم الذكي.
- استخدم التنسيق الغني (Markdown) لجعل الردود جميلة (جداول، قوائم، خط عريض).
- إذا كنت غير متأكد، استخدم المعلومات من قاعدة المعرفة المحلية المرفقة أعلاه.
`;

    let result;
    try {
      result = await model.generateContent([systemPrompt, message]);
    } catch (genError: any) {
      console.error("Gemini model failed, falling back to Sam Engine:", genError.message);
      return {
        text: localResponse.text,
        confidence: 0.6,
        buttons: localResponse.buttons
      };
    }

    const response = await result.response;
    let text = response.text().trim();

    text = text.replace(/^🤖 سام:\s*/, "");
    text = text.replace(/^سام:\s*/, "");

    let confidence = 0.9;
    if (text.includes("تحويلك لممثل بشري") || text.includes("لا أملك معلومات") || text.includes("غير متأكد")) {
      confidence = 0.4;
    }

    return { 
      text, 
      confidence, 
      buttons: localResponse.buttons.length > 0 ? localResponse.buttons : (context.buttons || []) 
    };
  } catch (error: any) {
    console.error("Gemini API Error, using Sam fallback with KB:", error.message);
    
    // Improved fallback: If KB results exist, mention them even if Gemini failed
    let fallbackText = localResponse.text;
    if (context.knowledge_base && context.knowledge_base.length > 0) {
      const bestArticle = context.knowledge_base[0];
      fallbackText = `أهلاً بك يا ${userName}! 🌟 أعتذر، هناك ضغط تقني بسيط، ولكن وجدت لك هذه المعلومة من قاعدة معرفتنا:\n\n**${bestArticle.title}**\n${bestArticle.content.substring(0, 200)}...\n\nهل هذا هو ما تبحث عنه؟`;
    }

    return {
      text: fallbackText,
      confidence: 0.6,
      buttons: localResponse.buttons
    };
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
