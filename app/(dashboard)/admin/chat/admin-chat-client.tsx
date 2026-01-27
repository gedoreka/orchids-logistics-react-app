"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Send,
  Building2,
  Phone,
  Calendar,
  Key,
  Clock,
  CheckCircle,
  XCircle,
  Infinity,
  RefreshCw,
  Paperclip,
  Info,
  User,
  Shield,
  X,
  Mic,
  MicOff,
  Smile,
  Play,
  Pause,
  Download,
  FileIcon,
  Trash2,
  CheckCheck,
  Check,
  Bell,
  Eye,
  Copy,
  Hash,
  Mail,
  MapPin,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Company {
  id: number;
  name: string;
  phone: string;
  email?: string;
  commercial_number?: string;
  access_token: string;
  token_expiry: string | null;
  is_active: number;
  company_created_at: string;
  unread_count: number;
  last_message_date: string | null;
  last_message: string | null;
  replied?: boolean;
}

interface Message {
  id: number;
  company_id: number;
  sender_role: "admin" | "client";
  message: string;
  file_path: string | null;
  message_type: string;
  is_read: number;
  created_at: string;
  ticket_id?: string;
}

const EMOJI_LIST = ["😊", "👍", "❤️", "😂", "🙏", "👏", "🎉", "✅", "⭐", "🔥", "💯", "😍", "🤝", "👋", "💪", "🙌", "😎", "🤔", "😢", "🥳"];

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
  const [showEmojis, setShowEmojis] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/chat");
      const data = await response.json();
      if (data.companies) {
        const sortedCompanies = data.companies.sort((a: Company, b: Company) => {
          if (a.unread_count > 0 && b.unread_count === 0) return -1;
          if (b.unread_count > 0 && a.unread_count === 0) return 1;
          if (a.last_message_date && b.last_message_date) {
            return new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime();
          }
          return 0;
        });
        setCompanies(sortedCompanies);
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
    const interval = setInterval(fetchCompanies, 3000);
    return () => clearInterval(interval);
  }, [fetchCompanies]);

  useEffect(() => {
    if (selectedCompany) {
      fetchMessages(selectedCompany.id);
      const interval = setInterval(() => fetchMessages(selectedCompany.id), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedCompany, fetchMessages]);

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setShowCompanyInfo(false);
    fetchMessages(company.id);
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload file");
    }
    
    return await response.json();
  };

  const getMessageType = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
    return "file";
  };

  const handleSendMessage = async (customData?: any) => {
    if (!newMessage.trim() && !selectedFile && !customData) return;
    if (!selectedCompany) return;

    setSending(true);
    let filePath = customData?.file_path || "";
    let messageType = customData?.message_type || "text";
    let messageText = customData?.message || newMessage.trim();

    try {
      if (selectedFile && !customData) {
        setIsUploading(true);
        const uploadRes = await uploadFile(selectedFile);
        filePath = uploadRes.url;
        messageType = getMessageType(selectedFile.type);
        if (!messageText) messageText = selectedFile.name;
        setSelectedFile(null);
      }

      const response = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: selectedCompany.id,
          message: messageText,
          sender_role: "admin",
          attachment: filePath,
          message_type: messageType
        })
      });

      if (response.ok) {
        setNewMessage("");
        setShowEmojis(false);
        fetchMessages(selectedCompany.id);
        fetchCompanies();
        toast.success("تم إرسال الرسالة");
      } else {
        toast.error("فشل إرسال الرسالة");
      }
    } catch (error) {
      toast.error("حدث خطأ");
    } finally {
      setSending(false);
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        toast.error("متصفحك لا يدعم تسجيل الصوت أو أن الموقع غير آمن (HTTPS)");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus' 
        : MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm'
          : 'audio/mp4';
      
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const extension = mimeType.includes('webm') ? 'webm' : 'mp4';
        const file = new File([audioBlob], `voice_${Date.now()}.${extension}`, { type: mimeType });
        
        setIsUploading(true);
        try {
          const uploadRes = await uploadFile(file);
          await handleSendMessage({
            message: "🎤 رسالة صوتية",
            file_path: uploadRes.url,
            message_type: "audio"
          });
          toast.success("تم إرسال الرسالة الصوتية");
        } catch (error) {
          toast.error("فشل رفع الرسالة الصوتية");
        } finally {
          setIsUploading(false);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      toast.success("جاري التسجيل...");
    } catch (error: any) {
      console.error("Microphone error:", error);
      if (error.name === 'NotAllowedError') {
        toast.error("يرجى السماح بالوصول للميكروفون من إعدادات المتصفح");
      } else if (error.name === 'NotFoundError') {
        toast.error("لم يتم العثور على ميكروفون");
      } else {
        toast.error("حدث خطأ في الوصول للميكروفون");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      audioChunksRef.current = [];
      toast.info("تم إلغاء التسجيل");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.access_token?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.commercial_number?.includes(searchQuery)
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
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatDateShort = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return d.toLocaleDateString("en-GB", { weekday: "short" });
    return d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ");
  };

  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(msg => {
      const date = formatDate(msg.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();
  
  const answeredCount = companies.filter(c => c.unread_count === 0 && c.last_message).length;
  const pendingCount = companies.filter(c => c.unread_count > 0).length;

  return (
    <div className="flex justify-center items-center p-4 md:p-6">
      <div className="w-full md:w-[90%] max-w-[1800px]">
        <div className="h-[calc(100vh-8rem)] flex bg-white rounded-3xl overflow-hidden shadow-2xl border-4" style={{ borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%) 1' }}>
          
          {/* Sidebar - Companies List */}
          <div className="w-[380px] bg-white border-l border-gray-200 flex flex-col shrink-0">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-5 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <MessageSquare className="text-white" size={24} />
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-xl">دعم العملاء</h1>
                    <p className="text-white/80 text-xs font-medium">{companies.length} شركة</p>
                  </div>
                </div>
                {totalUnread > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse"
                  >
                    {totalUnread} جديدة
                  </motion.span>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                  <p className="text-2xl font-bold text-white">{pendingCount}</p>
                  <p className="text-[10px] text-white/70 font-medium">معلقة</p>
                </div>
                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                  <p className="text-2xl font-bold text-white">{answeredCount}</p>
                  <p className="text-[10px] text-white/70 font-medium">مردود عليها</p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث بالاسم، السجل، أو رمز الاشتراك..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/20 text-white placeholder-white/60 rounded-2xl px-4 py-3.5 pr-12 text-sm border border-white/20 focus:border-white/50 focus:outline-none focus:bg-white/25 transition-all"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60" size={20} />
              </div>
            </div>

            {/* Companies List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="animate-spin text-indigo-400" size={32} />
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold">لا توجد نتائج</p>
                </div>
              ) : (
                filteredCompanies.map((company) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleSelectCompany(company)}
                    className={cn(
                      "p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50",
                      selectedCompany?.id === company.id && "bg-gradient-to-r from-indigo-50 to-purple-50 border-r-4 border-r-indigo-500",
                      company.unread_count > 0 && "bg-red-50/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg",
                        company.unread_count > 0 
                          ? "bg-gradient-to-br from-red-500 to-pink-600" 
                          : company.is_active
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                            : "bg-gradient-to-br from-gray-400 to-gray-500"
                      )}>
                        {company.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-800 text-sm truncate">{company.name}</h3>
                          {company.unread_count > 0 && (
                            <motion.span 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-red-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                            >
                              {company.unread_count}
                            </motion.span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-2">
                          {company.last_message || "لا توجد رسائل"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-[10px] px-2 py-1 rounded-full font-bold",
                            company.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          )}>
                            {company.is_active ? "نشط" : "موقوف"}
                          </span>
                          {company.last_message_date && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              {formatDateShort(company.last_message_date)}
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
          <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
            {selectedCompany ? (
              <>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between shrink-0 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/30">
                      {selectedCompany.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-lg">{selectedCompany.name}</h2>
                      <div className="flex items-center gap-2 text-sm text-white/80">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        متصل الآن
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCompanyInfo(!showCompanyInfo)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-bold text-sm",
                      showCompanyInfo 
                        ? "bg-white text-indigo-600 shadow-lg" 
                        : "bg-white/20 text-white hover:bg-white/30 border border-white/20"
                    )}
                  >
                    <Eye size={18} />
                    تفاصيل الشركة
                  </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {/* Messages */}
                  <div className={cn("flex-1 flex flex-col transition-all", showCompanyInfo && "ml-80")}>
                    <div 
                      ref={containerRef}
                      className="flex-1 overflow-y-auto p-6"
                      style={{ 
                        background: `
                          linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%),
                          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
                        `,
                      }}
                    >
                      <div className="max-w-4xl mx-auto space-y-6">
                        {messages.length === 0 ? (
                          <div className="text-center py-20 text-gray-400">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
                              <MessageSquare size={40} className="text-indigo-400" />
                            </div>
                            <p className="font-bold text-xl text-gray-600 mb-2">لا توجد رسائل بعد</p>
                            <p className="text-gray-400">ابدأ المحادثة مع هذه الشركة</p>
                          </div>
                        ) : (
                          Object.entries(messageGroups).map(([date, msgs]) => (
                            <div key={date} className="space-y-4">
                              <div className="flex justify-center sticky top-2 z-10">
                                <span className="bg-white/95 backdrop-blur-md text-gray-600 text-xs font-bold px-5 py-2 rounded-full shadow-lg border border-gray-200">
                                  {date}
                                </span>
                              </div>

                              {msgs.map((msg) => (
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
                                    "max-w-[75%] rounded-2xl px-5 py-4 shadow-lg",
                                    msg.sender_role === "admin"
                                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm"
                                      : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                                  )}>
                                    <MessageContent msg={msg} isAdmin={msg.sender_role === "admin"} />
                                    <div className={cn(
                                      "text-[10px] mt-2 flex items-center gap-2",
                                      msg.sender_role === "admin" ? "text-white/70" : "text-gray-400"
                                    )}>
                                      {msg.sender_role === "admin" ? (
                                        <Shield size={12} />
                                      ) : (
                                        <User size={12} />
                                      )}
                                      <span>{msg.sender_role === "admin" ? "أنت" : selectedCompany.name}</span>
                                      <span>•</span>
                                      <span>{formatTime(msg.created_at)}</span>
                                      {msg.sender_role === "admin" && (
                                        <CheckCheck size={14} className="mr-1" />
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>

                    {/* File Preview */}
                    <AnimatePresence>
                      {selectedFile && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-6 py-4 flex items-center justify-between overflow-hidden"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center border-2 border-indigo-200 shadow-lg">
                              <FileIcon size={24} className="text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 line-clamp-1">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setSelectedFile(null)}
                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={22} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Input */}
                    <div className="bg-white border-t border-gray-200 p-5 shrink-0">
                      <div className="max-w-4xl mx-auto flex items-end gap-3">
                        {/* Emoji */}
                        <div className="relative">
                          <button 
                            onClick={() => setShowEmojis(!showEmojis)}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-all"
                          >
                            <Smile size={26} />
                          </button>
                          
                          <AnimatePresence>
                            {showEmojis && (
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 grid grid-cols-5 gap-2 z-50"
                              >
                                {EMOJI_LIST.map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => {
                                      setNewMessage(prev => prev + emoji);
                                      setShowEmojis(false);
                                    }}
                                    className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-gray-100 rounded-xl transition-all hover:scale-125"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Attachment */}
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          <Paperclip size={26} />
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.zip,.rar"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setSelectedFile(file);
                          }}
                        />

                        {/* Input Field */}
                        <div className="flex-1 bg-gray-100 rounded-2xl border-2 border-gray-200 focus-within:border-indigo-500 focus-within:bg-white transition-all overflow-hidden px-5 py-3">
                          {isRecording ? (
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-lg font-bold text-gray-900">{formatDuration(recordingTime)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={cancelRecording}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 transition-all"
                                >
                                  إلغاء
                                </button>
                                <button 
                                  onClick={stopRecording}
                                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg"
                                >
                                  إرسال
                                </button>
                              </div>
                            </div>
                          ) : (
                            <textarea
                              ref={inputRef}
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={handleKeyPress}
                              placeholder="اكتب رسالتك هنا..."
                              rows={1}
                              className="w-full text-base resize-none focus:outline-none max-h-32 bg-transparent leading-relaxed text-gray-800"
                              style={{ minHeight: '28px' }}
                            />
                          )}
                        </div>

                        {/* Mic Button */}
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          disabled={isUploading}
                          className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                            isRecording 
                              ? "bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse" 
                              : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
                          )}
                        >
                          {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        {/* Send Button */}
                        <button
                          onClick={() => handleSendMessage()}
                          disabled={(!newMessage.trim() && !selectedFile) || sending || isUploading}
                          className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shrink-0"
                        >
                          {sending || isUploading ? (
                            <RefreshCw className="animate-spin" size={24} />
                          ) : (
                            <Send size={24} className="rotate-180" />
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
                        className="bg-white border-r border-gray-200 overflow-hidden shrink-0"
                      >
                        <div className="p-6 h-full overflow-y-auto">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-800 text-lg">معلومات الشركة</h3>
                            <button
                              onClick={() => setShowCompanyInfo(false)}
                              className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                            >
                              <X size={20} className="text-gray-400" />
                            </button>
                          </div>

                          <div className="text-center mb-8">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 shadow-xl">
                              {selectedCompany.name.charAt(0)}
                            </div>
                            <h4 className="font-bold text-gray-800 text-lg">{selectedCompany.name}</h4>
                            <span className={cn(
                              "text-xs px-3 py-1.5 rounded-full inline-block mt-3 font-bold",
                              selectedCompany.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            )}>
                              {selectedCompany.is_active ? "✓ نشط" : "✗ موقوف"}
                            </span>
                          </div>

                          <div className="space-y-4">
                            <InfoItem
                              icon={Phone}
                              label="الهاتف"
                              value={selectedCompany.phone || "غير متوفر"}
                              copyable
                              onCopy={() => copyToClipboard(selectedCompany.phone)}
                            />
                            <InfoItem
                              icon={Mail}
                              label="البريد"
                              value={selectedCompany.email || "غير متوفر"}
                              copyable
                              onCopy={() => copyToClipboard(selectedCompany.email || "")}
                            />
                            <InfoItem
                              icon={Hash}
                              label="السجل التجاري"
                              value={selectedCompany.commercial_number || "غير متوفر"}
                              copyable
                              onCopy={() => copyToClipboard(selectedCompany.commercial_number || "")}
                            />
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-500 font-medium">رمز الاشتراك</span>
                                <button 
                                  onClick={() => copyToClipboard(selectedCompany.access_token)}
                                  className="p-1.5 hover:bg-white rounded-lg transition-all"
                                >
                                  <Copy size={14} className="text-indigo-600" />
                                </button>
                              </div>
                              <code className="text-sm font-mono text-indigo-700 break-all select-all">{selectedCompany.access_token}</code>
                            </div>
                            <InfoItem
                              icon={Calendar}
                              label="انتهاء الاشتراك"
                              value={selectedCompany.token_expiry 
                                ? formatDate(selectedCompany.token_expiry)
                                : "دائم ∞"}
                            />
                            <InfoItem
                              icon={Calendar}
                              label="تاريخ التسجيل"
                              value={formatDate(selectedCompany.company_created_at)}
                            />
                          </div>

                          <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500 text-sm font-medium">حالة الاشتراك</span>
                              {(() => {
                                const status = getSubscriptionStatus(selectedCompany);
                                return (
                                  <span className={cn("px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5", status.color)}>
                                    <status.icon size={14} />
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
              <div className="flex-1 flex items-center justify-center">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-8 shadow-xl">
                    <MessageSquare size={56} className="text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-700 mb-3">مركز دعم العملاء</h2>
                  <p className="text-gray-500 max-w-sm">
                    اختر شركة من القائمة لبدء المحادثة أو الاطلاع على الرسائل السابقة
                  </p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageContent({ msg, isAdmin }: { msg: Message; isAdmin: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };
    
    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, []);

  if (msg.message_type === "image") {
    return (
      <div className="space-y-2">
        <img 
          src={msg.file_path || ""} 
          alt="صورة" 
          className="rounded-xl max-w-full max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity shadow-md"
          onClick={() => window.open(msg.file_path || "", '_blank')}
        />
        {msg.message && !msg.message.includes("أرسل") && <p className="text-sm leading-relaxed">{msg.message}</p>}
      </div>
    );
  }

  if (msg.message_type === "audio") {
    return (
      <div className="flex items-center gap-4 py-2 min-w-[220px]">
        <button 
          onClick={() => {
            if (audioRef.current) {
              if (isPlaying) {
                audioRef.current.pause();
              } else {
                audioRef.current.play();
              }
              setIsPlaying(!isPlaying);
            }
          }}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md",
            isAdmin ? "bg-white/30 text-white hover:bg-white/40" : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
          )}
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        <div className="flex-1">
          <div className={cn("h-2 rounded-full overflow-hidden", isAdmin ? "bg-white/20" : "bg-gray-200")}>
            <div 
              className={cn("h-full rounded-full transition-all", isAdmin ? "bg-white" : "bg-indigo-500")} 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <p className={cn("text-xs mt-1.5 font-bold", isAdmin ? "text-white/80" : "text-gray-500")}>🎤 رسالة صوتية</p>
        </div>
        <audio 
          ref={audioRef} 
          src={msg.file_path || ""} 
          onEnded={() => {
            setIsPlaying(false);
            setProgress(0);
          }}
          className="hidden"
        />
      </div>
    );
  }

  if (msg.message_type === "video") {
    return (
      <div className="space-y-2">
        <video 
          src={msg.file_path || ""} 
          controls 
          className="rounded-xl max-w-full max-h-[300px] shadow-md"
        />
        {msg.message && !msg.message.includes("أرسل") && <p className="text-sm leading-relaxed">{msg.message}</p>}
      </div>
    );
  }

  if (msg.message_type === "file") {
    return (
      <div className={cn("flex items-center gap-4 p-3 rounded-xl", isAdmin ? "bg-white/10" : "bg-gray-100")}>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md", isAdmin ? "bg-white/20 text-white" : "bg-white text-indigo-600")}>
          <FileIcon size={24} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold truncate">{msg.message}</p>
          <a 
            href={msg.file_path || ""} 
            target="_blank" 
            download
            className={cn("text-xs flex items-center gap-1 mt-1 hover:underline", isAdmin ? "text-white/80" : "text-indigo-600")}
          >
            <Download size={12} /> تحميل الملف
          </a>
        </div>
      </div>
    );
  }

  return <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>;
}

function InfoItem({ icon: Icon, label, value, copyable, onCopy }: { icon: any; label: string; value: string; copyable?: boolean; onCopy?: () => void }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
        <Icon size={18} className="text-indigo-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-gray-700 truncate">{value}</p>
          {copyable && onCopy && (
            <button onClick={onCopy} className="p-1 hover:bg-white rounded transition-all">
              <Copy size={12} className="text-gray-400 hover:text-indigo-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
