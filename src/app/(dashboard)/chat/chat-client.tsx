"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Paperclip, 
  User, 
  ShieldCheck, 
  Clock, 
  Headset,
  Smile,
  MoreVertical,
  CheckCheck,
  FileText,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { sendMessage, markMessagesAsRead } from "@/lib/actions/chat";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ChatClientProps {
  initialMessages: any[];
  companyId: number;
  senderRole: string;
}

export function ChatClient({ initialMessages, companyId, senderRole }: ChatClientProps) {
  const [messages, setAccounts] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Subscribe to Realtime messages
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
          setAccounts((prev) => [...prev, payload.new]);
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
    setInputValue("");
    setIsLoading(true);

    try {
      const result = await sendMessage({
        company_id: companyId,
        sender_role: senderRole,
        message: messageContent,
      });

      if (!result.success) {
        toast.error("فشل في إرسال الرسالة");
        setInputValue(messageContent);
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white/80 backdrop-blur-md rounded-[2.5rem] border-2 border-gray-100 shadow-2xl overflow-hidden relative">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] p-6 text-white flex items-center justify-between shadow-lg relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            {senderRole === 'admin' ? <Building2 size={28} /> : <Headset size={28} />}
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">الدعم الفني المباشر</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">متصل الآن</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
        <AnimatePresence mode="popLayout">
          {messages.map((msg, index) => {
            const isMe = msg.sender_role === senderRole;
            return (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "mr-auto items-end" : "ml-auto items-start text-right"
                )}
              >
                <div className={cn(
                  "relative p-5 rounded-3xl shadow-xl font-bold leading-relaxed transition-all hover:scale-[1.02]",
                  isMe 
                    ? "bg-gradient-to-br from-[#3498db] to-[#2980b9] text-white rounded-tr-none border-b-4 border-[#2171a9]" 
                    : "bg-white text-gray-800 rounded-tl-none border-b-4 border-gray-100"
                )}>
                  {msg.message}
                  
                  {msg.file_path && (
                    <a 
                      href={msg.file_path} 
                      target="_blank" 
                      className={cn(
                        "mt-3 flex items-center gap-3 p-3 rounded-2xl text-sm transition-all",
                        isMe ? "bg-white/10 hover:bg-white/20" : "bg-gray-50 hover:bg-gray-100"
                      )}
                    >
                      <Paperclip size={16} />
                      <span>مرفق ملف</span>
                    </a>
                  )}
                </div>
                
                <div className="flex items-center gap-3 mt-2 px-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-gray-300" />
                  <span className="flex items-center gap-1">
                    {isMe ? <ShieldCheck size={10} className="text-[#3498db]" /> : <User size={10} />}
                    {isMe ? "أنا" : "الدعم"}
                  </span>
                  {isMe && msg.is_read && (
                    <CheckCheck size={12} className="text-green-500" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-6 bg-gray-50 border-t-2 border-gray-100 relative z-10">
        <form onSubmit={handleSend} className="flex gap-4 items-end">
          <div className="flex-1 bg-white rounded-[2rem] border-2 border-gray-200 shadow-sm focus-within:border-[#3498db] focus-within:ring-4 focus-within:ring-[#3498db]/5 transition-all p-2 flex flex-col gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="✍️ اكتب رسالتك هنا..."
              className="w-full bg-transparent border-none focus:ring-0 resize-none font-bold text-gray-700 py-3 px-4 min-h-[50px] max-h-[150px] outline-none"
            />
            <div className="flex items-center justify-between border-t border-gray-100 pt-2 px-2 pb-1">
              <div className="flex gap-1">
                <button type="button" className="h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-[#3498db] transition-all flex items-center justify-center">
                  <Smile size={20} />
                </button>
                <button type="button" className="h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-[#3498db] transition-all flex items-center justify-center">
                  <Paperclip size={20} />
                </button>
              </div>
              <div className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">
                Enter للإرسال • Shift + Enter لسطر جديد
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, rotate: -10 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="h-[68px] w-[68px] rounded-[2rem] bg-gradient-to-br from-[#3498db] to-[#2980b9] text-white flex items-center justify-center shadow-xl shadow-[#3498db]/30 disabled:opacity-50 disabled:grayscale transition-all"
          >
            {isLoading ? (
              <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={28} className="-mr-1 rotate-[180deg]" />
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
