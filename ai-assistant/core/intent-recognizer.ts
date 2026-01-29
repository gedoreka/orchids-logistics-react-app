import { knowledgeBase } from './knowledge-base';

export interface IntentAnalysis {
  intent: string;
  mood: 'neutral' | 'happy' | 'angry';
  urgency: 'normal' | 'urgent';
  language: 'ar' | 'en';
  confidence: number;
}

export function analyzeIntent(message: string): IntentAnalysis {
  const msg = message.toLowerCase();
  
  // 1. Language Detection (Simple)
  const isEnglish = /[a-zA-Z]/.test(msg);
  const language = isEnglish ? 'en' : 'ar';

  // 2. Mood Detection
  let mood: 'neutral' | 'happy' | 'angry' = 'neutral';
  if (knowledgeBase.moodDetection.angry.some(word => msg.includes(word))) {
    mood = 'angry';
  } else if (knowledgeBase.moodDetection.happy.some(word => msg.includes(word))) {
    mood = 'happy';
  }

  // 3. Urgency Detection
  let urgency: 'normal' | 'urgent' = 'normal';
  if (knowledgeBase.moodDetection.urgent.some(word => msg.includes(word))) {
    urgency = 'urgent';
  }

  // 4. Intent Recognition
  let intent = 'general';
  let confidence = 0.5;

  if (knowledgeBase.greetings.arabic.some(g => msg.includes(g)) || 
      knowledgeBase.greetings.english.some(g => msg.includes(g))) {
    intent = 'greeting';
    confidence = 0.9;
  } else if (msg.includes('فاتورة') || msg.includes('invoice') || msg.includes('دفع')) {
    intent = 'invoice';
    confidence = 0.8;
  } else if (msg.includes('راتب') || msg.includes('payroll') || msg.includes('موظف')) {
    intent = 'payroll';
    confidence = 0.8;
  } else if (msg.includes('تقرير') || msg.includes('report') || msg.includes('كشف')) {
    intent = 'report';
    confidence = 0.8;
  } else if (msg.includes('مشكلة') || msg.includes('خطأ') || msg.includes('error') || msg.includes('help')) {
    intent = 'technical_help';
    confidence = 0.7;
  }

  return { intent, mood, urgency, language, confidence };
}
