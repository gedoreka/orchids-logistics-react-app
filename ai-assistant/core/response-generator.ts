import { knowledgeBase, smartResponses } from './knowledge-base';
import { analyzeIntent } from './intent-recognizer';
import { getContext, updateContext } from './context-manager';

export async function generateResponse(userId: string, userName: string, message: string) {
  const analysis = analyzeIntent(message);
  const context = getContext(userId, userName);
  
  // Update context mood
  updateContext(userId, { userMood: analysis.mood });

  let responseText = '';
  let buttons: any[] = [];

  // 1. Direct Smart Responses
  if (smartResponses.whenUserAsks[message]) {
    responseText = smartResponses.whenUserAsks[message].replace('{userName}', userName);
  } else if (smartResponses.vagueQuestions[message]) {
    responseText = smartResponses.vagueQuestions[message];
  }

  // 2. Intent Based Responses
  if (!responseText) {
    if (analysis.intent === 'greeting') {
      const greetingKey = Object.keys(knowledgeBase.greetings.responses).find(k => message.includes(k)) || 'مرحبا';
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
    } else if (analysis.intent === 'technical_help') {
      responseText = `أفهم أنك تواجه مشكلة. 🧐 أنا هنا للمساعدة! هل المشكلة تتعلق بـ: ${knowledgeBase.systemKnowledge.services.invoices.common_issues.join(' أم ')}؟`;
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
    analysis
  };
}
