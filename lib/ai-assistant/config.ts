/**
 * تكوين شامل لمساعد الذكاء الاصطناعي لـ Logistics Pro المتكامل مع OpenAI
 */

import { KNOWLEDGE_BASE } from "@/ai-assistant/data/knowledge-base";
import OpenAI from "openai";

// ==================== إعداد OpenAI ====================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

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
  | 'error';

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
    "كن نموذج AI متفاعل وليس مجرد ردود جاهزة",
    "استخدم قاعدة المعرفة أولاً للإجابة عن أسئلة نظام لوجستك برو",
    "إذا كان السؤال خارج نطاق النظام، استخدم قدراتك في البحث العام (OpenAI)",
    "قدم اقتراحات 'هل تقصد؟' إذا كان السؤال غامضاً",
    "حافظ على نبرة احترافية ومحفزة"
  ]
};

// ==================== مكتبة الردود التفاعلية ====================
export const RESPONSE_LIBRARY: AIResponse[] = [
  {
    id: "greeting-001",
    text: "مرحباً وسهلاً بك في عالم Logistics Pro! 🌼 يومك سعيد ومثمر. أنا 'سام'، مساعدك الذكي المعتمد على OpenAI. كيف يمكنني خدمتك اليوم في إدارة أعمالك؟",
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
    keywords: ["الموارد البشرية", "HR", "موظفين", "رواتب"],
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
   * حساب نسبة التشابه
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    const s1 = this.normalizeText(str1);
    const s2 = this.normalizeText(str2);
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
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
  static async generateOpenAIResponse(userMessage: string, context: string[] = []): Promise<string> {
    try {
      // جلب بعض السياق من قاعدة المعرفة لتعزيز الرد
      const localContext = KNOWLEDGE_BASE.slice(0, 10).map(e => `س: ${e.keywords[0]} ج: ${e.text}`).join('\n');
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `أنت "سام"، مساعد ذكاء اصطناعي متطور لنظام Logistics Pro. 
            أنت مرتبط بقاعدة معرفة ضخمة للنظام ولديك القدرة على البحث في الإنترنت وتقديم إجابات دقيقة وشاملة.
            
            قواعد الرد:
            1. إذا كان السؤال عن نظام Logistics Pro، استخدم المعلومات التالية كمرجع:
            ${localContext}
            
            2. إذا كان السؤال عاماً أو يحتاج لمعلومات من الإنترنت، قدم إجابة دقيقة بناءً على معلوماتك المحدثة.
            3. كن ودوداً، احترافياً، واستخدم الرموز التعبيرية بشكل مناسب.
            4. تحدث دائماً باللغة العربية بلهجة مهذبة ومحترفة.
            5. إذا لم يكن السؤال واضحاً، قدم اقتراحات (هل تقصد كذا؟) مرتبطة بمحتوى النظام.`
          },
          ...context.map(m => ({ role: "user" as const, content: m })),
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || "عذراً، لم أستطع توليد رد حالياً.";
    } catch (error) {
      console.error("OpenAI Error:", error);
      return "عذراً، أواجه مشكلة في الاتصال بمحرك OpenAI حالياً.";
    }
  }

  /**
   * الرد التفاعلي الرئيسي (Hybrid AI)
   */
  static async generateInteractiveResponse(userMessage: string, context: string[] = []): Promise<AIResponse> {
    // 1. محاولة البحث المحلي أولاً لضمان الدقة في معلومات النظام
    const localMatch = await this.findInKnowledgeBase(userMessage);
    
    // 2. إذا وجدنا تطابقاً قوياً جداً (أكثر من 90%) نستخدمه مباشرة لسرعة الاستجابة
    if (localMatch && localMatch.confidenceScore! > 0.9) {
      return localMatch;
    }

    // 3. استخدام OpenAI للردود الأكثر تعقيداً أو إذا لم نجد تطابقاً قوياً
    const aiText = await this.generateOpenAIResponse(userMessage, context);
    
    return {
      id: `ai-${Date.now()}`,
      text: aiText,
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
