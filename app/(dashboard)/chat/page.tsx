'use client';

import { useState } from 'react';
import { ChatInterface, ServiceExplorer, ServiceDetails } from '@/components/ai-assistant';

export default function ChatPage() {
  const [activeView, setActiveView] = useState<'chat' | 'services' | 'service-details'>('chat');
  const [selectedService, setSelectedService] = useState<string>('');
  
  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setActiveView('service-details');
  };
  
  const handleBackToServices = () => {
    setActiveView('services');
  };
  
  const handleAction = (action: string, data?: any) => {
    console.log('Action triggered:', action, data);
    // هنا يمكنك تنفيذ الإجراءات في تطبيقك
    // مثل فتح نموذج إضافة موظف، أو إنشاء فاتورة، الخ
  };
  
  return (
    <div className="chat-page container mx-auto p-4">
      <header className="page-header text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">🤖 مساعد لوجستك برو الذكي</h1>
        <p className="text-gray-600">مساعدك الشخصي لإدارة أعمالك بكل سهولة وذكاء</p>
      </header>
      
      <div className="view-switcher flex justify-center gap-4 mb-8">
        <button 
          className={`px-6 py-2 rounded-full font-semibold transition-all ${activeView === 'chat' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setActiveView('chat')}
        >
          💬 المحادثة
        </button>
        <button 
          className={`px-6 py-2 rounded-full font-semibold transition-all ${activeView === 'services' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={() => setActiveView('services')}
        >
          📊 الخدمات
        </button>
      </div>
      
      <div className="content-area max-w-5xl mx-auto">
        {activeView === 'chat' && (
          <div className="chat-container h-[600px]">
            <ChatInterface 
              initialMessage="مرحباً بك في نظام لوجستك برو"
              onAction={handleAction}
            />
          </div>
        )}
        
        {activeView === 'services' && (
          <ServiceExplorer onServiceSelect={handleServiceSelect} />
        )}
        
        {activeView === 'service-details' && (
          <ServiceDetails 
            serviceId={selectedService}
            onBack={handleBackToServices}
            onRelatedServiceSelect={handleServiceSelect}
          />
        )}
      </div>

      <style jsx>{`
        .chat-page {
          direction: rtl;
        }
      `}</style>
    </div>
  );
}
