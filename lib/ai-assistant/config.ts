/**
 * تكوين شامل لمساعد الذكاء الاصطناعي لـ Logistics Pro المتكامل مع OpenAI
 */

import { KNOWLEDGE_BASE } from "@/lib/ai-assistant/data/knowledge-base";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UniversalKnowledgeEngine } from "./knowledge-engine";
import { 
    searchEmployee, 
    searchInvoice, 
    searchVehicle, 
    searchMaintenanceOrder,
    searchCreditNote, 
    searchVoucher, 
    searchPayroll,
    dbToolsDefinitions 
  } from "./db-tools";

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
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // تم تحديث الموديل لضمان التوافق

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
  personality: "مساعد محترف، دافئ، حريص على النجاح، يتمتع بذهن سريع الاسترجاع وفهم السياق. لا يكتفي بالإجابة المباشرة بل يقدم القيمة المضافة. هو نموذج AI متطور قادر على الإجابة على كل شيء (عام، خاص، عالمي، ومحلي) باستخدام أقوى محركات الذكاء الاصطناعي (OpenAI & DeepSeek).",
  tone: "ودودة، واثقة، واضحة، محفزة. تستخدم الرموز التعبيرية باعتدال. تتحدث بلسان 'شريك النجاح'.",
  greeting: "نحو أعمال أكثر سلاسة وذكاءً.",
  farewell: "إلى اللقاء! 👋",
  emojis: ["🌟", "🔐", "📊", "💼", "👋", "🤔", "✅"],
  rules: [
    "كن مساعداً ذكياً متفاعلاً واحترافياً",
    "استخدم قاعدة المعرفة أولاً للإجابة عن أسئلة نظام لوجستك برو",
    "أجب على كافة الأسئلة العامة والعالمية والمحلية بوضوح",
    "استخدم الأدوات (Tools) المتاحة للبحث في قاعدة البيانات الحقيقية عن الموظفين والفواتير والمركبات",
    "لا تقدم أبداً معلومات وهمية أو أمثلة إذا طلب المستخدم بيانات محددة، ابحث عنها في قاعدة البيانات أولاً",
    "حافظ على نبرة احترافية ودودة"
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
      const matchRatio = intersection.length / Math.min(words1.length, words2.length);
      const overlapRatio = intersection.length / Math.max(words1.length, words2.length);
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
   * تنفيذ وظائف قاعدة البيانات
   */
  private static async executeTool(name: string, args: any) {
    console.log(`Executing Tool: ${name}`, args);
    switch (name) {
      case "searchEmployee":
        return await searchEmployee(args.searchTerm);
      case "searchInvoice":
        return await searchInvoice(args.invoiceNumber);
      case "searchVehicle":
        return await searchVehicle(args.searchTerm);
      case "searchMaintenanceOrder":
        return await searchMaintenanceOrder(args.orderNumber);
      case "searchCreditNote":
        return await searchCreditNote(args.noteNumber);
      case "searchVoucher":
        return await searchVoucher(args.voucherNumber);
      case "searchPayroll":
        return await searchPayroll(args.payrollId, args.companyId);
      default:
        return { error: "Unknown tool" };
    }
  }

  /**
   * الكشف التلقائي عن الأرقام (هوية، فاتورة، إلخ) للبحث المباشر
   */
  private static async directDatabaseLookup(message: string): Promise<string | null> {
    // استخراج الأرقام الطويلة (مثل رقم الإقامة 10 خانات)
    const iqamaMatch = message.match(/\b(2|1)\d{9}\b/);
    if (iqamaMatch) {
      const results = await searchEmployee(iqamaMatch[0]);
      if (results && results.length > 0) {
        const emp = results[0];
        return `✅ **تم العثور على الموظف بنجاح!**
        
**البيانات الأساسية:**
• الاسم الكامل: ${emp.name}
• رقم الهوية/الإقامة: ${emp.iqama_number}
• الرقم الوظيفي: ${emp.user_code || 'غير مسجل'}
• الجنسية: ${emp.nationality}
• الباقة: ${emp.package_name || 'غير محددة'}
• الحالة الوظيفية: ${emp.is_active ? 'نشط ✅' : 'غير نشط ❌'}

**المعلومات المالية:**
• الراتب الأساسي: ${emp.basic_salary} ريال
• بدل السكن: ${emp.housing_allowance} ريال

**المستندات والعهد:**
• رقم اللوحة: ${emp.vehicle_plate || 'لا يوجد'}
• تاريخ انتهاء الإقامة: ${emp.iqama_expiry ? new Date(emp.iqama_expiry).toLocaleDateString('ar-SA') : 'غير مسجل'}

💡 يمكنك عرض الملف الكامل للموظف من قسم الموارد البشرية.`;
      }
    }

    // استخراج أرقام الفواتير (مثال: INV3 أو INV-2024-001)
    const invMatch = message.match(/INV-?\d+/i) || message.match(/\b\d{5,}\b/);
    if (invMatch) {
      const results = await searchInvoice(invMatch[0]);
      if (results && results.length > 0) {
        const inv = results[0];
        let itemsText = "";
        if (inv.items && inv.items.length > 0) {
          itemsText = "\n\n**تفاصيل الخدمات:**\n" + inv.items.map((item: any, index: number) => 
            `${index + 1}. ${item.product_name || item.product_desc || 'خدمة'} - ${item.quantity} × ${item.unit_price} ريال = ${item.total_with_vat} ريال`
          ).join('\n');
        }

        return `📄 **بيانات الفاتورة الضريبية:**
• رقم الفاتورة: ${inv.invoice_number}
• العميل: ${inv.client_name}
• السجل الضريبي: ${inv.client_vat || 'غير متوفر'}
• التاريخ: ${new Date(inv.issue_date).toLocaleDateString('ar-SA')}
• المبلغ الإجمالي: **${inv.total_amount} ريال** 💰
• الحالة: ${inv.status === 'paid' ? 'مدفوعة ✅' : 'مستحقة ⏳'}${itemsText}

💡 يمكنك عرض الفاتورة بالكامل من قسم الماليات → الفواتير الضريبية.`;
      }
    }

    // استخراج أرقام السندات
    const voucherMatch = message.match(/CRN\d+/i) || message.match(/REC\d+/i);
    if (voucherMatch) {
        if (voucherMatch[0].startsWith('CRN')) {
            const results = await searchCreditNote(voucherMatch[0]);
            if (results && results.length > 0) {
                const note = results[0];
                return `🧾 **بيانات إشعار الدائن:**
• رقم الإشعار: ${note.credit_note_number}
• رقم الفاتورة المرتبطة: ${note.invoice_number}
• العميل: ${note.client_name}
• السبب: ${note.reason}
• المبلغ الإجمالي: **${note.total_amount} ريال** 💰`;
            }
        }
    }

    // استخراج رقم اللوحة (أ ب 5606 أو AB5606)
    const plateMatch = message.match(/[أ-ي\s]{1,4}\s*\d{1,4}/) || message.match(/[A-Z\s]{1,4}\s*\d{1,4}/i);
    if (plateMatch && plateMatch[0].length >= 4) {
      const results = await searchVehicle(plateMatch[0]);
      if (results && results.length > 0) {
        const v = results[0];
        return `🚗 **بيانات المركبة:**
• لوحة السيارة (عربي): ${v.plate_number_ar}
• لوحة السيارة (إنجليزي): ${v.plate_number_en}
• النوع والموديل: ${v.make} ${v.model} (${v.manufacture_year})
• رقم الشاسيه: ${v.chassis_number}
• السائق الحالي: ${v.driver_name || 'غير محدد'}
• القراءة الحالية للعداد: ${v.current_km} كم
• الحالة: ${v.status === 'active' ? 'نشطة ✅' : 'خارج الخدمة ❌'}

💡 يمكنك عرض التفاصيل الكاملة من قسم أسطول المركبات.`;
      }
    }

    // استخراج رقم أمر الصيانة (6 أرقام مثل 000011)
    const orderMatch = message.match(/\b\d{5,6}\b/);
    if (orderMatch) {
      const results = await searchMaintenanceOrder(orderMatch[0]);
      if (results && results.length > 0) {
        const order = results[0];
        let detailsText = "";
        if (order.details && order.details.length > 0) {
          detailsText = "\n\n**قطع الغيار المستخدمة:**\n" + order.details.map((d: any) => 
            `• ${d.spare_name} (${d.spare_code}): ${d.quantity_used} قطعة`
          ).join('\n');
        }

        return `🔧 **تفاصيل أمر الصيانة رقم ${order.id}:**
• المركبة: ${order.make} ${order.model} (${order.plate_number_ar})
• التاريخ: ${new Date(order.maintenance_date).toLocaleDateString('ar-SA')}
• المسؤول: ${order.maintenance_person}
• القراءة عند الصيانة: ${order.current_km} كم
• التكلفة الإجمالية: **${order.total_cost} ريال** 💰
• الحالة: ${order.status === 'completed' ? 'مكتمل ✅' : 'قيد التنفيذ ⏳'}${detailsText}

💡 يمكنك مراجعة سجلات الصيانة من قسم أسطول المركبات.`;
      }
    }

    // استخراج رقم مسير الرواتب (رقم تسلسلي قصير مثل 50)
    const payrollMatch = message.match(/مسير\s*(\d+)/i) || (message.match(/\b\d+\b/) && (message.includes('مسير') || message.includes('رواتب')));
    if (payrollMatch) {
      const payrollId = payrollMatch[1] || payrollMatch[0];
      const results = await searchPayroll(payrollId);
      if (results && results.length > 0) {
        const payroll = results[0];
        let itemsText = "";
        if (payroll.items && payroll.items.length > 0) {
          itemsText = "\n\n**تفاصيل الموظفين في المسير:**\n" + payroll.items.slice(0, 10).map((item: any, index: number) => 
            `${index + 1}. ${item.employee_name} - صافي الراتب: ${item.net_salary} ريال`
          ).join('\n');
          if (payroll.items.length > 10) {
            itemsText += `\n... و ${payroll.items.length - 10} موظفين آخرين.`;
          }
        }

        return `📊 **تفاصيل مسير الرواتب رقم ${payroll.id}:**
        
**معلومات المسير:**
• الشركة: ${payroll.company_name}
• شهر المسير: ${payroll.payroll_month}
• عدد الموظفين: ${payroll.employee_count} موظف
• الإجمالي العام: **${payroll.total_amount} ريال** 💰
• الحالة: ${payroll.is_paid ? 'تم الصرف ✅' : 'قيد الانتظار ⏳'}
• نوع المسير: ${payroll.is_draft ? 'مسودة' : 'معتمد'}${itemsText}

💡 يمكنك مراجعة المسير بالكامل من قسم الموارد البشرية → مسيرات الرواتب.`;
      }
    }

    return null;
  }

  /**
   * توليد رد ذكي باستخدام النماذج المتوفرة
   */
  static async generateInteractiveResponse(userMessage: string, context: string[] = []): Promise<AIResponse> {
    // 1. محاولة البحث المباشر في قاعدة البيانات (لتجاوز أخطاء الكوتا وسرعة الاستجابة)
    const directResult = await this.directDatabaseLookup(userMessage);
    if (directResult) {
      return {
        id: `db-${Date.now()}`,
        text: directResult,
        category: 'operations',
        keywords: [],
        confidenceScore: 1.0
      };
    }

    // 2. محاولة البحث المحلي في قاعدة المعرفة
    const localMatch = await this.findInKnowledgeBase(userMessage);
    if (localMatch && localMatch.confidenceScore! > 0.98) {
      return localMatch;
    }

    // 3. محاولة استخدام OpenAI كخيار أول (لدعمه القوي للـ Function Calling)
    try {
      const systemPrompt = `أنت "سام"، مساعد ذكاء اصطناعي متطور لنظام Logistics Pro.
      لديك القدرة على الوصول إلى قاعدة بيانات النظام الحقيقية باستخدام الأدوات المتاحة.
      
      قواعد صارمة:
      1. إذا طلب المستخدم معلومات عن (موظف، فاتورة، مركبة، أمر صيانة، سند، إشعار دائن، مسير رواتب)، استخدم الأداة المناسبة فوراً.
      2. لا تقدم أبداً بيانات وهمية أو أمثلة إذا كانت هناك أداة يمكنها جلب البيانات الحقيقية.
      3. إذا لم تجد نتائج في قاعدة البيانات بعد البحث، أخبر المستخدم بوضوح أن البيانات غير موجودة.
      4. قدم النتائج بتنسيق جميل ومنظم باستخدام النقاط والرموز التعبيرية.
      5. أجب على كافة الأسئلة العامة والعالمية بذكاء ومباشرة.
      6. تحدث دائماً باللغة العربية بأسلوب احترافي وودود.
      7. إذا طلب المستخدم البحث عن "INV3" مثلاً، قم باستدعاء searchInvoice بالقيمة "INV3".
      8. للبحث عن مسير رواتب، استخدم searchPayroll.
      
      ${localMatch ? `سياق محلي: ${localMatch.text}` : ""}`;

      const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...context.map(m => ({ role: "user", content: m })),
        { role: "user", content: userMessage }
      ];

      let response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        tools: dbToolsDefinitions as any,
        tool_choice: "auto",
        temperature: 0.7,
      });

      let responseMessage = response.choices[0].message;

      if (responseMessage.tool_calls) {
        messages.push(responseMessage);
        
        for (const toolCall of responseMessage.tool_calls) {
          const result = await this.executeTool(
            toolCall.function.name, 
            JSON.parse(toolCall.function.arguments)
          );
          
          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolCall.function.name,
            content: JSON.stringify(result),
          });
        }

        response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages,
        });
        
        return {
          id: `ai-${Date.now()}`,
          text: response.choices[0].message.content || "",
          category: 'operations',
          keywords: [],
          confidenceScore: 0.99
        };
      }

      if (responseMessage.content) {
        return {
          id: `ai-${Date.now()}`,
          text: responseMessage.content,
          category: 'general',
          keywords: [],
          confidenceScore: 0.95
        };
      }
    } catch (error) {
      console.error("OpenAI Tool Calling Error:", error);
    }

    // 4. Fallback to Gemini (updated model name)
    try {
      const prompt = `أنت المساعد الذكي "سام" لنظام Logistics Pro.
      أجب على السؤال التالي بذكاء وباللغة العربية: ${userMessage}
      سياق إضافي: ${localMatch?.text || ""}`;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (text) {
        return {
          id: `ai-${Date.now()}`,
          text: text,
          category: 'general',
          keywords: [],
          confidenceScore: 0.85
        };
      }
    } catch (error) {
      console.error("Gemini Fallback Error:", error);
    }

    // 5. Last Fallback
    return {
      id: `ai-${Date.now()}`,
      text: localMatch?.text || "أعتذر، واجهت مشكلة في الاتصال بالخدمات الذكية حالياً. كيف يمكنني مساعدتك في وظائف النظام الأخرى؟",
      category: 'error',
      keywords: [],
      confidenceScore: 0.5
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
