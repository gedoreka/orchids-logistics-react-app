"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Search, Send, Building2, Phone, Calendar, Key,
  Clock, CheckCircle, XCircle, Infinity, AlertCircle, RefreshCw,
  Paperclip, Info, User, Shield, ChevronLeft, Bell, X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Company {
  id: number;
  name: string;
  phone: string;
  access_token: string;
  token_expiry: string | null;
  is_active: number;
  company_created_at: string;
  unread_count: number;
  last_message_date: string | null;
  last_message: string | null;
}

interface Message {
  id: number;
  company_id: number;
  sender_role: "admin" | "client";
  message: string;
  file_path: string | null;
  is_read: number;
  created_at: string;
}

export default function AdminChatPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [showCompanyInfo, setShowCompanyInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/chat");
      const data = await response.json();
      if (data.companies) {
        setCompanies(data.companies);
        setTotalUnread(data.total_unread || 0);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (companyId: number) => {
    try {
      const response = await fetch(`/api/admin/chat?company_id=${companyId}`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
    const interval = setInterval(fetchCompanies, 5000);
    return () => clearInterval(interval);
  }, [fetchCompanies]);

  useEffect(() => {
    if (selectedCompany) {
      fetchMessages(selectedCompany.id);
      const interval = setInterval(() => fetchMessages(selectedCompany.id), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedCompany, fetchMessages]);

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowCompanyInfo(false);
    fetchMessages(company.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCompany) return;

    setSending(true);
    try {
      const response = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: selectedCompany.id,
          message: newMessage,
          sender_role: "admin"
        })
      });

      if (response.ok) {
        setNewMessage("");
        fetchMessages(selectedCompany.id);
        toast.success("تم إرسال الرسالة");
      } else {
        toast.error("فشل إرسال الرسالة");
      }
    } catch (error) {
      toast.error("حدث خطأ");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  const getSubscriptionStatus = (company: Company) => {
    if (!company.token_expiry) {
      return { text: "دائم", color: "text-indigo-600 bg-indigo-100", icon: Infinity };
    }
    const remaining = (new Date(company.token_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (remaining > 30) return { text: `${Math.floor(remaining)} يوم`, color: "text-emerald-600 bg-emerald-100", icon: CheckCircle };
    if (remaining > 0) return { text: `${Math.floor(remaining)} يوم`, color: "text-amber-600 bg-amber-100", icon: Clock };
    return { text: "منتهي", color: "text-red-600 bg-red-100", icon: XCircle };
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "أمس";
    if (diffDays < 7) return d.toLocaleDateString("ar-SA", { weekday: "short" });
    return d.toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
  };

  return (
    <div className="h-[calc(100vh-80px)] flex bg-slate-100">
      {/* Sidebar - Companies List */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <MessageSquare className="text-indigo-400" size={20} />
              </div>
              <div>
                <h1 className="text-white font-bold">الدعم الفني</h1>
                <p className="text-slate-400 text-xs">{companies.length} محادثة</p>
              </div>
            </div>
            {totalUnread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                {totalUnread} جديدة
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن شركة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 text-white placeholder-white/50 rounded-xl px-4 py-3 pr-10 text-sm border border-white/10 focus:border-indigo-400 focus:outline-none"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50" size={18} />
          </div>
        </div>

        {/* Companies List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="animate-spin text-slate-400" size={24} />
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>لا توجد محادثات</p>
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => handleSelectCompany(company)}
                className={cn(
                  "p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50",
                  selectedCompany?.id === company.id && "bg-indigo-50 border-r-4 border-r-indigo-500",
                  company.unread_count > 0 && "bg-red-50/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold",
                    company.unread_count > 0 
                      ? "bg-gradient-to-br from-red-500 to-red-600" 
                      : "bg-gradient-to-br from-indigo-500 to-blue-600"
                  )}>
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{company.name}</h3>
                      {company.unread_count > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {company.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mb-1">
                      {company.last_message || "لا توجد رسائل"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full",
                        company.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {company.is_active ? "نشط" : "موقوف"}
                      </span>
                      {company.last_message_date && (
                        <span className="text-[10px] text-slate-400">
                          {formatTime(company.last_message_date)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedCompany ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {selectedCompany.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">{selectedCompany.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    متصل الآن
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowCompanyInfo(!showCompanyInfo)}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  showCompanyInfo ? "bg-indigo-100 text-indigo-600" : "hover:bg-slate-100 text-slate-500"
                )}
              >
                <Info size={20} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Messages */}
              <div className={cn(
                "flex-1 flex flex-col transition-all",
                showCompanyInfo && "mr-80"
              )}>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                  {messages.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                      <p>لا توجد رسائل بعد</p>
                      <p className="text-sm">ابدأ المحادثة مع هذه الشركة</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex",
                          msg.sender_role === "admin" ? "justify-start" : "justify-end"
                        )}
                      >
                        <div className={cn(
                          "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
                          msg.sender_role === "admin"
                            ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-br-sm"
                            : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
                        )}>
                          <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          <div className={cn(
                            "text-[10px] mt-1 flex items-center gap-1",
                            msg.sender_role === "admin" ? "text-white/70" : "text-slate-400"
                          )}>
                            {msg.sender_role === "admin" ? (
                              <Shield size={10} />
                            ) : (
                              <User size={10} />
                            )}
                            <span>{msg.sender_role === "admin" ? "أنت" : selectedCompany.name}</span>
                            <span>•</span>
                            <span>{new Date(msg.created_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="bg-white border-t border-slate-200 p-4">
                  <div className="flex items-end gap-3">
                    <div className="flex-1 bg-slate-100 rounded-2xl p-3">
                      <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="اكتب رسالتك..."
                        rows={1}
                        className="w-full bg-transparent resize-none focus:outline-none text-sm"
                        style={{ maxHeight: "120px" }}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                        newMessage.trim()
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/30"
                          : "bg-slate-200 text-slate-400"
                      )}
                    >
                      {sending ? (
                        <RefreshCw className="animate-spin" size={20} />
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Info Panel */}
              <AnimatePresence>
                {showCompanyInfo && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 320, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="bg-white border-r border-slate-200 overflow-hidden"
                  >
                    <div className="p-6 h-full overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-800">معلومات الشركة</h3>
                        <button
                          onClick={() => setShowCompanyInfo(false)}
                          className="p-1 hover:bg-slate-100 rounded"
                        >
                          <X size={18} className="text-slate-400" />
                        </button>
                      </div>

                      <div className="text-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                          {selectedCompany.name.charAt(0)}
                        </div>
                        <h4 className="font-bold text-slate-800">{selectedCompany.name}</h4>
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full inline-block mt-2",
                          selectedCompany.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                        )}>
                          {selectedCompany.is_active ? "نشط" : "موقوف"}
                        </span>
                      </div>

                      <div className="space-y-4">
                        <InfoItem
                          icon={Phone}
                          label="الهاتف"
                          value={selectedCompany.phone || "غير متوفر"}
                        />
                        <InfoItem
                          icon={Key}
                          label="رمز الاشتراك"
                          value={selectedCompany.access_token}
                          mono
                        />
                        <InfoItem
                          icon={Calendar}
                          label="انتهاء الاشتراك"
                          value={selectedCompany.token_expiry || "دائم"}
                        />
                        <InfoItem
                          icon={Calendar}
                          label="تاريخ التسجيل"
                          value={new Date(selectedCompany.company_created_at).toLocaleDateString("ar-SA")}
                        />
                      </div>

                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">حالة الاشتراك</span>
                          {(() => {
                            const status = getSubscriptionStatus(selectedCompany);
                            return (
                              <span className={cn("px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1", status.color)}>
                                <status.icon size={12} />
                                {status.text}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={40} className="text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">مركز الدعم الفني</h2>
              <p className="text-slate-500 max-w-sm">
                اختر شركة من القائمة لبدء المحادثة أو الاطلاع على الرسائل السابقة
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className={cn("text-sm font-medium text-slate-700 truncate", mono && "font-mono text-xs")}>{value}</p>
      </div>
    </div>
  );
}
