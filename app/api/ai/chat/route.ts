import { NextRequest, NextResponse } from 'next/server';
import { AIAssistantService } from '@/lib/ai-assistant/config';

export async function POST(request: NextRequest) {
  try {
    const { message, context = [] } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'الرسالة مطلوبة' },
        { status: 400 }
      );
    }
    
    // توليد الرد باستخدام نظام الذكاء الاصطناعي
    const response = AIAssistantService.generateInteractiveResponse(message, context);
    
    return NextResponse.json({
      success: true,
      response: response.text,
      action: response.action,
      relatedServices: response.relatedServices,
      confidenceScore: response.confidenceScore,
      requiresFollowup: response.requiresFollowup
    });
    
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة الطلب' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const services = AIAssistantService.getAllServices();
    const personality = AIAssistantService.getPersonality();
    
    return NextResponse.json({
      success: true,
      personality,
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        features: s.features.slice(0, 3)
      }))
    });
    
  } catch (error) {
    console.error('AI Services API Error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب البيانات' },
      { status: 500 }
    );
  }
}
