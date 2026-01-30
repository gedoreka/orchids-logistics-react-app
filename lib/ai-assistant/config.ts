/**
 * تكوين شامل لمساعد الذكاء الاصطناعي لـ Logistics Pro المتكامل مع OpenAI
 */

import { KNOWLEDGE_BASE } from "@/ai-assistant/data/knowledge-base";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UniversalKnowledgeEngine } from "./knowledge-engine";

// ==================== إعداد OpenAI ====================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

// ==================== إعداد Universal Engine ====================
const globalKnowledgeEngine = new UniversalKnowledgeEngine({
  cacheEnabled: true,
  realtimeUpdates: true,
  language: "ar",
  detailLevel: "comprehensive",
  visualMode: true,
  learningEnabled: true
});

// ==================== إعداد DeepSeek ====================
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: "https://api.deepseek.com",
  dangerouslyAllowBrowser: true,
});

// ==================== إعداد Gemini ====================
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// ==================== أنواع TypeScript ====================
export interface AIResponse {
  id: string;
  text: string;
  category: ResponseCategory;
  keywords: string[];
  relatedServices?: string[];
  action?: string;
  requiresFollowup?: boolean;
  confidenceScore?: number;
}

export interface AIPersonality {
  name: string;
  title: string;
  personality: string;
  tone: string;
  greeting: string;
  farewell: string;
  emojis: string[];
  rules: string[];
}

export type ResponseCategory = 
  | 'greeting' 
  | 'farewell' 
  | 'identity' 
  | 'general' 
  | 'hr' 
  | 'finance' 
  | 'operations' 
  | 'support' 
  | 'error'
  | 'delivery-apps'
  | 'hr-search'
  | 'invoice-search'
  | 'invoice-creation'
  | 'payroll'
  | 'fleet'
  | 'letters'
  | 'financial-bonds'
  | 'company-info'
  | 'subscriptions'
  | 'reports'
  | 'dashboard'
  | 'customers'
  | 'tasks'
  | 'vacations'
  | 'violations'
  | 'settings'
  | 'integration'
  | 'accounting'
  | 'analytics'
  | 'mobile'
  | 'import-export'
  | 'notifications'
  | 'surveys'
  | 'occasions'
  | 'pharmacy'
  | 'training'
  | 'sustainability'
  | 'archiving'
  | 'self-service'
  | 'networking';

export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  features: string[];
  keywords: string[];
  relatedServices: string[];
  actionSteps?: string[];
}

// ==================== شخصية المساعد ====================
export const AI_PERSONALITY: AIPersonality = {
  name: "سام (مساعد لوجستك برو)",
  title: "مساعد الذكاء الاصطناعي المتكامل",
  personality: "مساعد محترف، دافئ، حريص على النجاح، يتمتع بذهن سريع الاسترجاع وفهم السياق. لا يكتفي بالإجابة المباشرة بل يقدم القيمة المضافة، يتعاطف مع المستخدم، ويوجهه بسلاسة. هو نموذج AI متطور مرتبط بقاعدة معرفة ضخمة وبحث مباشر في الإنترنت.",
  tone: "ودودة، واثقة، واضحة، محفزة. تستخدم الرموز التعبيرية 🌟🔐📊💼 باعتدال لتحسين التجربة. تتحدث بلسان 'شريك النجاح' وليس مجرد رد آلي.",
  greeting: "نحو أعمال أكثر سلاسة وذكاءً.",
  farewell: "إلى اللقاء! 👋 لا تنسَ أنني هنا في انتظارك عندما تحتاجني. أتمنى لك يوماً منتجاً ومليئاً بالإنجازات. سلامتك!",
  emojis: ["🌟", "🔐", "📊", "💼", "🌼", "🔥", "👋", "🤔", "👨‍💼", "👩‍💼", "🛠️", "📚", "🛡️", "📋", "✍️", "🤝", "💸", "📜", "📨", "💰", "🧮", "🏢", "🔄", "🚗", "📉", "📈", "⚖️", "🗺️", "👨‍💻", "⚙️", "✅", "⚠️", "❌"],
  rules: [
    "كن مساعداً ذكياً متفاعلاً واحترافياً",
    "استخدم قاعدة المعرفة أولاً للإجابة عن أسئلة نظام لوجستك برو",
    "قدم إجابات شاملة ودقيقة بناءً على السياق المتاح",
    "قدم اقتراحات 'هل تقصد؟' إذا كان السؤال غامضاً",
    "حافظ على نبرة احترافية، ودودة، ومحفزة"
  ]
};

// ==================== مكتبة الردود التفاعلية ====================
export const RESPONSE_LIBRARY: AIResponse[] = [
  {
    id: "greeting-001",
    text: "مرحباً وسهلاً بك في عالم Logistics Pro! 🌼 يومك سعيد ومثمر. أنا 'سام'، مساعدك الذكي هنا لخدمتك في إدارة أعمالك. كيف يمكنني مساعدتك اليوم؟",
    category: "greeting",
    keywords: ["مرحبا", "السلام عليكم", "أهلا", "hello", "hi", "صباح الخير", "مساء الخير"],
    confidenceScore: 1.0
  },
  {
    id: "unclear-001",
    text: "أعتقد أنني لم ألتقط فكرتك بشكل تام، لكن دعني أحاول مساعدتك! 🤔 هل تقصد شيئاً متعلقاً بالموظفين، الفواتير، أم الدعم الفني؟",
    category: "error",
    keywords: [],
    requiresFollowup: true,
    confidenceScore: 0.3
  }
];

// ==================== مكتبة الخدمات التفصيلية ====================
export const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  {
    id: "hr-overview",
    name: "إدارة الموارد البشرية",
    description: "نظام ذكي لإدارة فريقك، الرواتب، المهام، والخطابات الرسمية.",
    features: ["باقات الموظفين", "مسيرات الرواتب", "إدارة المهام", "تقرير الهويات"],
    keywords: ["الموارد البشرية", "HR", "موارد بشرية", "إدارة الموظفين"],
    relatedServices: ["hr-packages", "hr-employees"]
  },
  {
    id: "finance-overview",
    name: "الإدارة المالية",
    description: "نظام محاسبي متكامل يشمل الفواتير الضريبية، السندات، والتقارير المالية.",
    features: ["الفواتير الضريبية", "سندات القبض والصرف", "الأرباح والخسائر"],
    keywords: ["مالية", "محاسبة", "فواتير", "سندات"],
    relatedServices: ["invoices", "accounting"]
  }
];

// ==================== نظام الربط والخدمات ====================
export class AIAssistantService {
  /**
   * تنظيف وتجهيز النص للبحث
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[^\w\s\u0600-\u06FF]/g, '')
      .trim();
  }

    /**
     * حساب نسبة التشابه بشكل أكثر مرونة واحترافية
     */
    private static calculateSimilarity(str1: string, str2: string): number {
      const s1 = this.normalizeText(str1);
      const s2 = this.normalizeText(str2);
      
      if (s1 === s2) return 1.0;
      if (s1.includes(s2) || s2.includes(s1)) return 0.90;

      // تقسيم الكلمات للبحث عن تقاطعات
      const words1 = s1.split(/\s+/).filter(w => w.length > 1);
      const words2 = s2.split(/\s+/).filter(w => w.length > 1);
      
      const intersection = words1.filter(w => words2.includes(w));
      
      if (intersection.length > 0) {
        // حساب النسبة بناءً على الكلمات المشتركة مقارنة بالكلمات المهمة في السؤال أو الكلمات المفتاحية
        const matchRatio = intersection.length / Math.min(words1.length, words2.length);
        const overlapRatio = intersection.length / Math.max(words1.length, words2.length);
        
        // إذا كانت جميع كلمات الكلمات المفتاحية موجودة في رسالة المستخدم، فهذا تطابق قوي جداً
        if (intersection.length === words2.length) return 0.95;
        
        return (matchRatio * 0.7) + (overlapRatio * 0.3);
      }
      
      return 0;
    }

  /**
   * البحث في قاعدة المعرفة المحلية
   */
  static async findInKnowledgeBase(userMessage: string): Promise<AIResponse | null> {
    const message = this.normalizeText(userMessage);
    const allEntries = [...KNOWLEDGE_BASE, ...RESPONSE_LIBRARY];
    
    let bestMatch: AIResponse | null = null;
    let maxScore = 0;

    for (const entry of allEntries) {
      for (const keyword of entry.keywords) {
        const score = this.calculateSimilarity(message, keyword);
        if (score > maxScore) {
          maxScore = score;
          bestMatch = entry;
        }
      }
    }

    if (maxScore > 0.6) {
      return { ...bestMatch!, confidenceScore: maxScore };
    }

    return null;
  }

  /**
   * توليد رد باستخدام OpenAI
   */
  static async generateOpenAIResponse(userMessage: string, context: string[] = [], localMatch?: AIResponse | null): Promise<string> {
    try {
      const systemContext = localMatch ? `معلومات من قاعدة المعرفة: ${localMatch.text}` : "";
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `أنت "سام"، مساعد ذكاء اصطناعي متطور لنظام Logistics Pro. 
            أنت مرتبط بقاعدة معرفة ضخمة للنظام ولديك القدرة على تقديم إجابات دقيقة وشاملة.
            
            ${systemContext}
            
            قواعد الرد:
            1. استخدم معلومات قاعدة المعرفة الموفرة أعلاه إذا كانت ذات صلة.
            2. إذا كان السؤال عاماً، قدم إجابة دقيقة بناءً على معلوماتك المحدثة.
            3. كن ودوداً، احترافياً، ولا تذكر أسماء شركات الذكاء الاصطناعي.
            4. تحدث دائماً باللغة العربية.`
          },
          ...context.map(m => ({ role: "user" as const, content: m })),
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Primary Engine Error:", error);
      return "";
    }
  }

  /**
   * توليد رد باستخدام DeepSeek
   */
  static async generateDeepSeekResponse(userMessage: string, context: string[] = [], localMatch?: AIResponse | null): Promise<string> {
    try {
      const systemContext = localMatch ? `المرجع المحلي: ${localMatch.text}` : "";
      
      const response = await deepseek.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `أنت المساعد الذكي "سام" لنظام Logistics Pro.
            ${systemContext}
            كن دقيقاً جداً في المعلومات التقنية والبرمجية وباللغة العربية.`
          },
          ...context.map(m => ({ role: "user" as const, content: m })),
          { role: "user", content: userMessage }
        ],
        temperature: 0.5,
      });

      return response.choices[0].message.content || "";
    } catch (error) {
      console.error("Backup Engine Error:", error);
      return "";
    }
  }

  /**
   * توليد رد باستخدام Gemini
   */
  static async generateGeminiResponse(userMessage: string, context: string[] = [], localMatch?: AIResponse | null): Promise<string> {
    try {
      const systemContext = localMatch ? `المرجع المحلي: ${localMatch.text}` : "";
      
      const prompt = `أنت المساعد الذكي "سام" لنظام Logistics Pro.
      ${systemContext}
      سياق المحادثة: ${context.join(' | ')}
      المستخدم: ${userMessage}
      أجب باحترافية باللغة العربية دون ذكر جوجل أو Gemini.`;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text() || "";
    } catch (error) {
      console.error("Gemini Engine Error:", error);
      return "";
    }
  }

  /**
   * الرد التفاعلي الرئيسي (Hybrid AI - Multi Engine)
   */
  static async generateInteractiveResponse(userMessage: string, context: string[] = []): Promise<AIResponse> {
    // 1. محاولة البحث المحلي أولاً
    const localMatch = await this.findInKnowledgeBase(userMessage);
    
    // 2. إذا وجدنا تطابقاً قوياً جداً نستخدمه مباشرة
    if (localMatch && localMatch.confidenceScore! > 0.98) {
      return localMatch;
    }

    // 3. استخدام المحرك العالمي (Universal Knowledge Engine)
    try {
      const globalResult = await globalKnowledgeEngine.answerAnything(userMessage, { context });
      if (globalResult.metadata.confidence > 0.9) {
        return {
          id: globalResult.id,
          text: globalResult.mainContent.text,
          category: 'general',
          keywords: [],
          confidenceScore: globalResult.metadata.confidence
        };
      }
    } catch (error) {
      console.error("Global Engine Error:", error);
    }

    // 4. استخدام المحركات الخارجية التقليدية (OpenAI -> DeepSeek -> Gemini)
    let finalResponseText = "";

    finalResponseText = await this.generateOpenAIResponse(userMessage, context, localMatch);
    
    if (!finalResponseText || finalResponseText.length < 5) {
      finalResponseText = await this.generateDeepSeekResponse(userMessage, context, localMatch);
    }

    if (!finalResponseText || finalResponseText.length < 5) {
      finalResponseText = await this.generateGeminiResponse(userMessage, context, localMatch);
    }

    // 5. السقوط الأخير (Fallback)
    if (!finalResponseText || finalResponseText.length < 5) {
      finalResponseText = localMatch?.text || 
        "أهلاً بك! أنا 'سام'، مساعدك الذكي في Logistics Pro. أعتذر منك، لم أتمكن من العثور على إجابة دقيقة لهذا السؤال في قاعدة بياناتي حالياً. هل يمكنك سؤالي عن شيء آخر يخص النظام؟";
    }
    
    return {
      id: `ai-${Date.now()}`,
      text: finalResponseText,
      category: localMatch?.category || 'general',
      keywords: [],
      confidenceScore: 0.95
    };
  }

  static getPersonality(): AIPersonality {
    return AI_PERSONALITY;
  }

  static getAllServices(): ServiceDefinition[] {
    return SERVICE_DEFINITIONS;
  }
}

export default AIAssistantService;
