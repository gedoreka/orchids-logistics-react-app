"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Paperclip, 
  Headset,
  Smile,
  CheckCheck,
  Check,
  Image as ImageIcon,
  Mic,
  MoreVertical,
  Phone,
  Video,
  Search,
  ArrowDown
} from "lucide-react";
import { toast } from "sonner";
import { sendMessage, markMessagesAsRead } from "@/lib/actions/chat";
import { supabase } from "@/lib/supabase";

interface ChatClientProps {
  initialMessages: any[];
  companyId: number;
  senderRole: string;
}

export function ChatClient({ initialMessages, companyId, senderRole }: ChatClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`chat_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some(m => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new];
          });
          if (payload.new.sender_role !== senderRole) {
            markMessagesAsRead(companyId, senderRole);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, senderRole]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue.trim();
    const tempId = `temp_${Date.now()}`;
    
    const optimisticMessage = {
      id: tempId,
      company_id: companyId,
      sender_role: senderRole,
      message: messageContent,
      created_at: new Date().toISOString(),
      is_read: false,
      _pending: true
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const result = await sendMessage({
        company_id: companyId,
        sender_role: senderRole,
        message: messageContent,
      });

      if (!result.success) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        toast.error("فشل في إرسال الرسالة");
        setInputValue(messageContent);
      } else {
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, _pending: false } : m
        ));
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      toast.error("حدث خطأ غير متوقع");
      setInputValue(messageContent);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = () => {
    const groups: { [key: string]: any[] } = {};
    messages.forEach(msg => {
      const date = new Date(msg.created_at).toLocaleDateString('ar-SA');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col bg-[#efeae2] rounded-2xl overflow-hidden shadow-xl border border-gray-200">
      {/* Header - WhatsApp Style */}
      <div className="bg-[#075e54] px-4 py-2.5 flex items-center gap-3 shrink-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-[#128c7e] flex items-center justify-center">
            <Headset size={20} className="text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#25d366] rounded-full border-2 border-[#075e54]" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm">الدعم الفني</h3>
          <p className="text-[#8ae4d8] text-[10px]">متصل الآن</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-white/80 hover:text-white transition-colors">
            <Video size={20} />
          </button>
          <button className="text-white/80 hover:text-white transition-colors">
            <Phone size={20} />
          </button>
          <button className="text-white/80 hover:text-white transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-3 py-2 relative"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c5beb4' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#efeae2'
        }}
      >
        {Object.entries(messageGroups).map(([date, msgs]) => (
          <div key={date}>
            {/* Date Badge */}
            <div className="flex justify-center my-2">
              <span className="bg-[#e1f2fb] text-[#54656f] text-[10px] font-bold px-3 py-1 rounded-lg shadow-sm">
                {date === new Date().toLocaleDateString('ar-SA') ? 'اليوم' : date}
              </span>
            </div>

            {/* Messages */}
            {msgs.map((msg, index) => {
              const isMe = msg.sender_role === senderRole;
              const showTail = index === 0 || msgs[index - 1]?.sender_role !== msg.sender_role;
              
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: msg._pending ? 0.7 : 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`flex mb-0.5 ${isMe ? 'justify-start' : 'justify-end'}`}
                >
                  <div 
                    className={`relative max-w-[75%] px-2.5 py-1.5 rounded-lg shadow-sm ${
                      isMe 
                        ? 'bg-[#d9fdd3] text-gray-800' 
                        : 'bg-white text-gray-800'
                    } ${showTail ? (isMe ? 'rounded-tl-none' : 'rounded-tr-none') : ''}`}
                  >
                    {showTail && (
                      <div 
                        className={`absolute top-0 w-2 h-2 ${
                          isMe 
                            ? '-left-2 border-l-8 border-l-transparent border-t-8 border-t-[#d9fdd3]' 
                            : '-right-2 border-r-8 border-r-transparent border-t-8 border-t-white'
                        }`}
                        style={{
                          width: 0,
                          height: 0,
                          borderStyle: 'solid'
                        }}
                      />
                    )}
                    
                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                    
                    {msg.file_path && (
                      <a 
                        href={msg.file_path} 
                        target="_blank"
                        className="mt-1 flex items-center gap-1.5 text-[11px] text-[#128c7e] hover:underline"
                      >
                        <Paperclip size={12} />
                        مرفق
                      </a>
                    )}
                    
                    <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] text-[#667781]">{formatTime(msg.created_at)}</span>
                      {isMe && (
                        msg._pending ? (
                          <Check size={14} className="text-[#667781]" />
                        ) : msg.is_read ? (
                          <CheckCheck size={14} className="text-[#53bdeb]" />
                        ) : (
                          <CheckCheck size={14} className="text-[#667781]" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={scrollToBottom}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
            >
              <ArrowDown size={20} className="text-[#54656f]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area - WhatsApp Style */}
      <div className="bg-[#f0f2f5] px-3 py-2 shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <div className="flex items-center gap-1">
            <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-[#54656f] hover:bg-[#e9edef] transition-colors">
              <Smile size={24} />
            </button>
            <button type="button" className="w-10 h-10 rounded-full flex items-center justify-center text-[#54656f] hover:bg-[#e9edef] transition-colors">
              <Paperclip size={24} />
            </button>
          </div>
          
          <div className="flex-1 bg-white rounded-3xl border border-gray-200 overflow-hidden">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="اكتب رسالة..."
              rows={1}
              className="w-full px-4 py-2.5 text-sm resize-none focus:outline-none max-h-28 bg-transparent"
              style={{ minHeight: '42px' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#008f72] disabled:bg-[#8696a0] disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : inputValue.trim() ? (
              <Send size={20} className="rotate-180 -mr-0.5" />
            ) : (
              <Mic size={20} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
