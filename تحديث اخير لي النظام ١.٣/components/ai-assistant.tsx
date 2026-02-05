'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  AI_PERSONALITY, 
  SERVICE_DEFINITIONS, 
  SERVICE_CONNECTIONS, 
  AIAssistantService,
  ServiceDefinition 
} from '@/lib/ai-assistant/config';

// ==================== هوك React للاستخدام في المكونات ====================
export function useAIAssistant() {
  const [conversation, setConversation] = useState<{role: 'user' | 'assistant', message: string}[]>([]);
  const [context, setContext] = useState<string[]>([]);
  
  const sendMessage = useCallback((userMessage: string) => {
    // تحديث المحادثة
    setConversation(prev => [...prev, { role: 'user', message: userMessage }]);
    
    // توليد رد
    const response = AIAssistantService.generateInteractiveResponse(userMessage, context);
    
    // تحديث السياق
    setContext(prev => [...prev.slice(-5), userMessage]); // حفظ آخر 5 رسائل كسياق
    
    // إضافة رد المساعد للمحادثة
    setTimeout(() => {
      setConversation(prev => [...prev, { role: 'assistant', message: response.text }]);
    }, 500);
    
    return response;
  }, [context]);
  
  const getServiceInfo = useCallback((serviceId: string) => {
    return SERVICE_DEFINITIONS.find(service => service.id === serviceId);
  }, []);
  
  const getQuickActions = useCallback(() => {
    return [
      { label: "إنشاء فاتورة", action: "create-invoice", service: "invoices" },
      { label: "إضافة موظف", action: "add-employee", service: "hr-employees" },
      { label: "تسجيل مصروف", action: "add-expense", service: "expenses" },
      { label: "إنشاء مهمة", action: "create-task", service: "hr-tasks" },
      { label: "عرض التقارير", action: "view-reports", service: "profit-loss" }
    ];
  }, []);
  
  return {
    conversation,
    sendMessage,
    getServiceInfo,
    getQuickActions,
    personality: AIAssistantService.getPersonality(),
    services: AIAssistantService.getAllServices()
  };
}

// ==================== مكون Chat Interface ====================
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  initialMessage?: string;
  onAction?: (action: string, data?: any) => void;
}

export function ChatInterface({ initialMessage, onAction }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: initialMessage || AI_PERSONALITY.greeting,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { sendMessage, getQuickActions } = useAIAssistant();
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // إضافة رسالة المستخدم
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    
    setIsLoading(true);
    
    try {
      // الحصول على الرد
      const response = sendMessage(userMessage);
      
      // إضافة رسالة المساعد
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, assistantMsg]);
        setIsLoading(false);
        
        // إذا كان هناك إجراء مقترح
        if (response.action && onAction) {
          onAction(response.action, { service: response.relatedServices?.[0] });
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsLoading(false);
    }
  };
  
  const handleQuickAction = (action: string) => {
    const actions = getQuickActions();
    const foundAction = actions.find(a => a.action === action);
    
    if (foundAction) {
      setInput(`أريد ${foundAction.label.toLowerCase()}`);
    }
  };
  
  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="assistant-info">
          <h3>{AI_PERSONALITY.name}</h3>
          <p className="personality-tag">{AI_PERSONALITY.title}</p>
        </div>
        <div className="quick-actions">
          {getQuickActions().slice(0, 3).map(action => (
            <button
              key={action.action}
              onClick={() => handleQuickAction(action.action)}
              className="quick-action-btn"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-content">
              {msg.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="message-time">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="اكتب رسالتك هنا..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? 'جاري الرد...' : 'إرسال'}
        </button>
      </div>
      
      <div className="chat-footer">
        <small>مساعد لوجستك برو - نظام متكامل لإدارة الأعمال</small>
      </div>
    </div>
  );
}

// ==================== مكون Service Explorer ====================
interface ServiceExplorerProps {
  onServiceSelect?: (serviceId: string) => void;
}

export function ServiceExplorer({ onServiceSelect }: ServiceExplorerProps) {
  const services = AIAssistantService.getAllServices();
  const categories = [
    { id: 'hr', name: 'الموارد البشرية', icon: '👥' },
    { id: 'finance', name: 'المالية والمحاسبة', icon: '💰' },
    { id: 'operations', name: 'العمليات', icon: '⚙️' },
    { id: 'management', name: 'الإدارة', icon: '🎯' }
  ];
  
  return (
    <div className="service-explorer">
      <div className="explorer-header">
        <h2>🚀 خدمات نظام لوجستك برو</h2>
        <p>اختر الخدمة التي تريد معرفة المزيد عنها</p>
      </div>
      
      <div className="categories-grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-icon">{category.icon}</div>
            <h3>{category.name}</h3>
            <div className="services-list">
              {services
                .filter(s => s.id.startsWith(category.id))
                .slice(0, 4)
                .map(service => (
                  <button
                    key={service.id}
                    className="service-item"
                    onClick={() => onServiceSelect?.(service.id)}
                  >
                    {service.name}
                  </button>
                ))
              }
            </div>
          </div>
        ))}
      </div>
      
      <div className="all-services">
        <h3>📋 جميع الخدمات المتاحة</h3>
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <h4>{service.name}</h4>
              <p>{service.description.substring(0, 100)}...</p>
              <div className="service-keywords">
                {service.keywords.slice(0, 3).map(keyword => (
                  <span key={keyword} className="keyword-tag">{keyword}</span>
                ))}
              </div>
              <button 
                className="service-details-btn"
                onClick={() => onServiceSelect?.(service.id)}
              >
                عرض التفاصيل
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== مكون Service Details ====================
interface ServiceDetailsProps {
  serviceId: string;
  onBack?: () => void;
  onRelatedServiceSelect?: (serviceId: string) => void;
}

export function ServiceDetails({ serviceId, onBack, onRelatedServiceSelect }: ServiceDetailsProps) {
  const service = AIAssistantService.getAllServices().find(s => s.id === serviceId);
  const relatedServices = service ? (SERVICE_CONNECTIONS[service.id] || []) : [];
  const relatedServiceDetails = relatedServices
    .map(id => AIAssistantService.getAllServices().find(s => s.id === id))
    .filter(Boolean);
  
  if (!service) {
    return (
      <div className="service-details">
        <button onClick={onBack} className="back-btn">← العودة</button>
        <div className="error-state">
          <p>الخدمة غير موجودة</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="service-details">
      <div className="details-header">
        <button onClick={onBack} className="back-btn">← العودة للقائمة</button>
        <h2>{service.name}</h2>
      </div>
      
      <div className="details-content">
        <div className="description-section">
          <h3>📝 الوصف</h3>
          <p>{service.description}</p>
        </div>
        
        <div className="features-section">
          <h3>✨ المميزات الرئيسية</h3>
          <ul>
            {service.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        
        {service.actionSteps && service.actionSteps.length > 0 && (
          <div className="actions-section">
            <h3>🎯 خطوات التنفيذ</h3>
            <ol>
              {service.actionSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}
        
        <div className="keywords-section">
          <h3>🔍 كلمات البحث المرتبطة</h3>
          <div className="keywords-tags">
            {service.keywords.map(keyword => (
              <span key={keyword} className="keyword-tag">{keyword}</span>
            ))}
          </div>
        </div>
        
        {relatedServiceDetails.length > 0 && (
          <div className="related-section">
            <h3>🔗 خدمات مرتبطة</h3>
            <div className="related-services">
              {relatedServiceDetails.map(related => (
                <button
                  key={related.id}
                  className="related-service-card"
                  onClick={() => onRelatedServiceSelect?.(related.id)}
                >
                  <h4>{related.name}</h4>
                  <p>{related.description.substring(0, 80)}...</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
