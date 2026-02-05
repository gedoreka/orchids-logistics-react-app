import { knowledgeBase, smartResponses } from './knowledge-base';
import { analyzeIntent } from './intent-recognizer';
import { getContext, updateContext } from './context-manager';

export async function generateResponse(userId: string, userName: string, message: string) {
  const analysis = analyzeIntent(message);
  const context = getContext(userId, userName);
  const msg = message.toLowerCase().trim();
  const cleanMsg = msg.replace(/[؟?.,!]/g, '').trim();
  
  // Update context mood
  updateContext(userId, { userMood: analysis.mood });

  let responseText = '';
  let buttons: any[] = [];

  // 1. Direct Smart Responses (with normalization)
  const matchesSmart = (input: string) => {
    const cleanInput = input.replace(/[؟?.,!]/g, '').trim();
    return cleanInput === cleanMsg;
  };

  const smartKey = Object.keys(smartResponses.whenUserAsks).find(k => matchesSmart(k));
  const vagueKey = Object.keys(smartResponses.vagueQuestions).find(k => matchesSmart(k));

  let confidence = analysis.confidence;

  if (smartKey) {
    responseText = smartResponses.whenUserAsks[smartKey as keyof typeof smartResponses.whenUserAsks].replace('{userName}', userName);
    confidence = 1.0; // High confidence for direct matches
  } else if (vagueKey) {
    responseText = smartResponses.vagueQuestions[vagueKey as keyof typeof smartResponses.vagueQuestions];
    confidence = 0.9;
  }

  // 2. Intent Based Responses
  if (!responseText) {
    if (analysis.intent === 'greeting') {
      const greetingKey = Object.keys(knowledgeBase.greetings.responses).find(k => cleanMsg.includes(k)) || 'مرحبا';
      responseText = (knowledgeBase.greetings.responses as any)[greetingKey]?.replace('{userName}', userName) || `أهلاً بك يا ${userName}! كيف أساعدك اليوم؟`;
      buttons = [
        { text: "🧾 الفواتير", action: "showInvoices", emoji: "🧾" },
        { text: "👥 الموظفين", action: "showEmployees", emoji: "👥" },
        { text: "📊 التقارير", action: "showReports", emoji: "📊" }
      ];
    } else if (analysis.intent === 'invoice') {
      responseText = `بخصوص ${knowledgeBase.systemKnowledge.services.invoices.name_ar}، يمكنني مساعدتك في: ${knowledgeBase.systemKnowledge.services.invoices.functions.join('، ')}. ما الذي تبحث عنه؟`;
      buttons = [
        { text: "➕ فاتورة جديدة", action: "newInvoice", emoji: "➕" },
        { text: "📋 قائمة الفواتير", action: "invoiceList", emoji: "📋" }
      ];
    } else if (analysis.intent === 'payroll') {
      responseText = `أهلاً بك! في قسم ${knowledgeBase.systemKnowledge.services.payroll.name_ar}، يمكنني مساعدتك في ${knowledgeBase.systemKnowledge.services.payroll.functions.join(' و')}. هل تريد إصدار مسير رواتب جديد؟`;
      buttons = [
        { text: "📑 مسيرات الرواتب", action: "payrollList", emoji: "📑" },
        { text: "➕ مسير جديد", action: "newPayroll", emoji: "➕" }
      ];
    } else if (analysis.intent === 'auth_help') {
      responseText = `نسيان كلمة المرور أمر وارد جداً! 🔐 لا تقلق يا ${userName}. يمكنك إعادة تعيينها من خلال صفحة تسجيل الدخول بالضغط على "نسيت كلمة المرور"، أو يمكنني مساعدتك في الوصول للرابط. هل تود أن أرسل لك رابط استعادة كلمة المرور؟`;
      buttons = [
        { text: "🔗 استعادة كلمة المرور", action: "resetPassword", emoji: "🔗" },
        { text: "📞 تواصل مع الدعم", action: "contactSupport", emoji: "📞" }
      ];
    } else if (analysis.intent === 'technical_help') {
      responseText = `أفهم أنك تواجه مشكلة. 🧐 أنا هنا للمساعدة! هل المشكلة تتعلق بـ: ${knowledgeBase.systemKnowledge.services.invoices.common_issues.join(' أم ')}؟ أو ربما شيء آخر؟`;
    }
  }

  // 3. Mood/Urgency Adjustment
  if (analysis.mood === 'angry') {
    responseText = `أعتذر جداً عن أي إزعاج! 😔 دعنا نحل هذا الأمر فوراً. ${responseText}`;
  } else if (analysis.urgency === 'urgent') {
    responseText = `فهمت أن الأمر عاجل! 🚀 سأعطيك الأولوية. ${responseText}`;
  }

  // 4. Default Fallback
  if (!responseText) {
    responseText = "لم أفهم طلبك تماماً، ولكنني خبير في الأنظمة المحاسبية. هل تود الاستفسار عن الفواتير، الرواتب، أم التقارير؟";
  }

  return {
    text: responseText,
    buttons,
    analysis: { ...analysis, confidence }
  };
}
