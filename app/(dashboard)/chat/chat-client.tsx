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
  Mic,
  MicOff,
  MoreVertical,
  ArrowDown,
  RefreshCw,
  X,
  FileIcon,
  Play,
  Pause,
  Download,
  Trash2,
  Copy,
  Key,
  Bell,
  MessageCircle,
  Ticket,
  Plus,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Hash,
  Sparkles,
  Bot
} from "lucide-react";
import { toast } from "sonner";
import { sendMessage, getMessages } from "@/lib/actions/chat";
import AIAssistantService from "@/lib/ai-assistant/config";

interface ChatClientProps {
  initialMessages: any[];
  companyId: number;
  senderRole: string;
  companyToken?: string;
  companyName?: string;
}

const EMOJI_LIST = ["😊", "👍", "❤️", "😂", "🙏", "👏", "🎉", "✅", "⭐", "🔥", "💯", "😍", "🤝", "👋", "💪", "🙌", "😎", "🤔", "😢", "🥳"];

export function ChatClient({ initialMessages, companyId, senderRole, companyToken, companyName }: ChatClientProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [newMessagePreview, setNewMessagePreview] = useState("");
  const [showTokenCard, setShowTokenCard] = useState(false);
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [showTicketSelector, setShowTicketSelector] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMessageCountRef = useRef(messages.length);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // التحكم في التمرير الذكي - يسمح للمستخدم بالتوقف في أي مكان
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // نحدد ما إذا كان المستخدم قريباً من القاع (بمنطقة 150 بكسل)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    
    // الرسالة الأخيرة
    const lastMessage = messages[messages.length - 1];
    // هل الرسالة مرسلة من قبل المستخدم الحالي؟
    const sentByMe = lastMessage?.sender_role === senderRole;
    // هل هذه أول عملية تحميل للرسائل؟
    const isInitialLoad = messages.length === initialMessages.length;

    // نقوم بالتمرير تلقائياً فقط في هذه الحالات:
    // 1. عند التحميل الأول
    // 2. إذا كان المستخدم أصلاً في القاع
    // 3. إذا كان المستخدم هو من أرسل الرسالة الأخيرة
    if (isInitialLoad || isNearBottom || sentByMe) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom, senderRole, initialMessages.length]);

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
    const pollMessages = async () => {
      try {
        const res = await getMessages(companyId);
        if (res.success && res.data) {
          const newMessages = res.data;
          
          if (newMessages.length > lastMessageCountRef.current) {
            const latestMsg = newMessages[newMessages.length - 1];
            if (latestMsg.sender_role !== senderRole) {
              setUnreadCount(prev => prev + (newMessages.length - lastMessageCountRef.current));
              setNewMessagePreview(latestMsg.message?.substring(0, 50) || "رسالة جديدة");
              setShowNewMessageAlert(true);
              setTimeout(() => setShowNewMessageAlert(false), 5000);
              
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("رسالة جديدة من الدعم الفني", {
                  body: latestMsg.message?.substring(0, 100),
                  icon: "/favicon.ico"
                });
              }
            }
          }
          
          lastMessageCountRef.current = newMessages.length;
          setMessages(newMessages);
          
          const uniqueTickets = [...new Set(newMessages.filter((m: any) => m.ticket_id).map((m: any) => m.ticket_id))];
          setTickets(uniqueTickets.map(id => ({ id, status: 'open' })));
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    pollIntervalRef.current = setInterval(pollMessages, 3000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [companyId, senderRole]);

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

  const generateTicketId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  };

  const createNewTicket = () => {
    const newTicketId = generateTicketId();
    setCurrentTicketId(newTicketId);
    setTickets(prev => [...prev, { id: newTicketId, status: 'open' }]);
    setShowTicketSelector(false);
    toast.success(`تم إنشاء تذكرة جديدة: ${newTicketId}`);
  };

  const handleSend = async (e?: React.FormEvent, customData?: any) => {
    if (e) e.preventDefault();
    
    const messageText = customData?.message || inputValue.trim();
    if (!messageText && !selectedFile && !customData) return;
    if (isLoading || isUploading) return;

    setIsLoading(true);
    let filePath = customData?.file_path || "";
    let messageType: any = customData?.message_type || "text";

    const ticketId = currentTicketId || generateTicketId();
    if (!currentTicketId) {
      setCurrentTicketId(ticketId);
      setTickets(prev => [...prev, { id: ticketId, status: 'open' }]);
    }

    try {
      if (selectedFile && !customData) {
        setIsUploading(true);
        const uploadRes = await uploadFile(selectedFile);
        filePath = uploadRes.url;
        messageType = getMessageType(selectedFile.type);
        setSelectedFile(null);
      }

      const tempId = `temp_${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        company_id: companyId,
        sender_role: senderRole,
        message: messageText,
        file_path: filePath,
        message_type: messageType,
        ticket_id: ticketId,
        created_at: new Date().toISOString(),
        is_read: 0,
        _pending: true
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setInputValue("");
      setShowEmojis(false);

      const result = await sendMessage({
        company_id: companyId,
        sender_role: senderRole,
        message: messageText,
        file_path: filePath,
        message_type: messageType,
        ticket_id: ticketId
      });

      if (!result.success) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        toast.error("فشل في إرسال الرسالة");
      } else {
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, id: result.insertId, _pending: false } : m
        ));

        // AI Response Logic
        if (isAiEnabled && messageType === "text" && senderRole === "client") {
          setTimeout(async () => {
            const aiResponse = AIAssistantService.generateInteractiveResponse(messageText);
            if (aiResponse && aiResponse.text) {
              await sendMessage({
                company_id: companyId,
                sender_role: "support",
                message: aiResponse.text,
                message_type: "text",
                ticket_id: ticketId
              });
              // Polling will catch this message
            }
          }, 1000);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الإرسال");
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const getMessageType = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("audio/")) return "audio";
    if (mimeType.startsWith("video/")) return "video";
    return "file";
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
          await handleSend(undefined, {
            message: "🎤 رسالة صوتية",
            file_path: uploadRes.url,
            message_type: "audio"
          });
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
      toast.error("حدث خطأ في الوصول للميكروفون");
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

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const copyToken = () => {
    if (companyToken) {
      navigator.clipboard.writeText(companyToken);
      toast.success("تم نسخ رمز الاشتراك");
    }
  };

  const groupMessagesByDate = () => {
    const groups: { [key: string]: any[] } = {};
    messages.forEach(msg => {
      const date = formatDate(msg.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div className="flex flex-col h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative" style={{ borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%) 1' }}>
      
      {/* New Message Alert - Center Screen */}
      <AnimatePresence>
        {showNewMessageAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <Bell size={28} className="animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-lg">رسالة جديدة من الدعم!</p>
                <p className="text-white/80 text-sm truncate max-w-[250px]">{newMessagePreview}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Full Gradient */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-5 flex items-center justify-between shrink-0 z-10 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/30">
              <Headset size={28} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-bold text-xl drop-shadow-lg">مركز الدعم الفني</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-white/90 text-sm font-medium">متصل الآن • استجابة فورية</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* AI Toggle */}
          <button 
            onClick={() => {
              setIsAiEnabled(!isAiEnabled);
              toast.success(isAiEnabled ? "تم إيقاف المساعد الذكي" : "تم تفعيل المساعد الذكي");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              isAiEnabled 
                ? 'bg-white/30 text-white border-white/40 shadow-inner' 
                : 'bg-white/10 text-white/60 border-white/10'
            }`}
          >
            <Bot size={18} className={isAiEnabled ? 'animate-bounce' : ''} />
            <span className="text-sm font-bold hidden sm:inline">مساعد سام</span>
            {isAiEnabled && <Sparkles size={14} className="text-yellow-300" />}
          </button>

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse flex items-center gap-1">
                <Bell size={14} />
                <span>{unreadCount} جديدة</span>
              </div>
            </motion.div>
          )}
          
          {/* Ticket Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowTicketSelector(!showTicketSelector)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all border border-white/20"
            >
                <Ticket size={18} />
                <span className="text-sm font-bold hidden sm:inline">
                  {currentTicketId ? `#${String(currentTicketId).slice(-8)}` : 'تذكرة جديدة'}
                </span>
                <ChevronDown size={16} />
              </button>
            
            <AnimatePresence>
              {showTicketSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden min-w-[250px] z-50"
                >
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-bold text-gray-600">تذاكر الدعم</p>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {tickets.map(ticket => (
                      <button
                        key={ticket.id}
                        onClick={() => {
                          setCurrentTicketId(ticket.id);
                          setShowTicketSelector(false);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-all ${currentTicketId === ticket.id ? 'bg-indigo-50' : ''}`}
                      >
                        <Hash size={16} className="text-indigo-500" />
                        <span className="text-sm font-medium text-gray-700">{String(ticket.id).slice(-8)}</span>
                        {ticket.status === 'open' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">مفتوحة</span>}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={createNewTicket}
                    className="w-full px-4 py-3 flex items-center gap-3 bg-indigo-50 hover:bg-indigo-100 transition-all border-t border-gray-100"
                  >
                    <Plus size={16} className="text-indigo-600" />
                    <span className="text-sm font-bold text-indigo-600">تذكرة جديدة</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Token Card Button */}
          <button 
            onClick={() => setShowTokenCard(!showTokenCard)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/20"
          >
            <Key size={20} className="text-white" />
          </button>
          
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl border border-white/20">
            <RefreshCw size={16} className={`text-white ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-xs text-white font-medium">مزامنة</span>
          </div>
        </div>
      </div>

      {/* Token Card Popup */}
      <AnimatePresence>
        {showTokenCard && companyToken && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key size={18} className="text-white" />
                    <span className="text-white font-bold">رمز الاشتراك</span>
                  </div>
                  <button onClick={() => setShowTokenCard(false)} className="text-white/70 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-2">رمز الاشتراك الخاص بك:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 px-4 py-3 rounded-xl text-sm font-mono text-gray-800 select-all overflow-x-auto">
                    {companyToken}
                  </code>
                  <button 
                    onClick={copyToken}
                    className="p-3 bg-indigo-100 hover:bg-indigo-200 rounded-xl transition-all"
                  >
                    <Copy size={18} className="text-indigo-600" />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-3 text-center">
                  أرسل هذا الرمز للدعم الفني عند الطلب
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area with Premium Background */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-8 relative scroll-smooth"
        style={{ 
          background: `
            linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          `,
        }}
      >
        {/* Current Ticket Badge */}
        {currentTicketId && (
          <div className="flex justify-center mb-4">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200 flex items-center gap-2">
              <Ticket size={14} className="text-indigo-600" />
              <span className="text-xs font-bold text-gray-700">تذكرة رقم: {currentTicketId}</span>
            </div>
          </div>
        )}
        
        <div className="max-w-4xl mx-auto space-y-6">
          {Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-center sticky top-2 z-10">
                <span className="bg-white/95 backdrop-blur-md text-gray-600 text-xs font-bold px-5 py-2 rounded-full shadow-lg border border-gray-200">
                  {date}
                </span>
              </div>

              {msgs.map((msg) => {
                const isMe = msg.sender_role === senderRole;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: isMe ? -20 : 20, scale: 0.95 }}
                    animate={{ opacity: msg._pending ? 0.7 : 1, x: 0, scale: 1 }}
                    className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? 'items-start' : 'items-end'}`}>
                      <div 
                        className={`relative p-4 rounded-2xl shadow-lg ${
                          isMe 
                            ? 'bg-white text-gray-800 border border-gray-100 rounded-tr-sm' 
                            : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tl-sm'
                        }`}
                      >
                        <MessageContent msg={msg} isMe={isMe} />
                        
                        <div className={`flex items-center gap-2 mt-2 ${isMe ? 'justify-start' : 'justify-end'}`}>
                          <span className={`text-[10px] font-medium ${isMe ? 'text-gray-400' : 'text-white/70'}`}>
                            {formatTime(msg.created_at)}
                          </span>
                          {!isMe && (
                            msg._pending ? (
                              <Clock size={12} className="text-white/50" />
                            ) : msg.is_read ? (
                              <CheckCheck size={14} className="text-white" />
                            ) : (
                              <Check size={14} className="text-white/70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <MessageCircle size={40} className="text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">مرحباً بك في الدعم الفني</h3>
              <p className="text-gray-500 max-w-sm mx-auto">أرسل رسالتك وسيقوم فريق الدعم بالرد عليك في أقرب وقت ممكن</p>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => {
              scrollToBottom();
              setUnreadCount(0);
            }}
            className="absolute bottom-36 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-20"
          >
            <ArrowDown size={24} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

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
                <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • جاهز للرفع</p>
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

      {/* Input Area */}
      <div className="bg-white px-6 py-5 border-t border-gray-200 shrink-0 shadow-inner">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3">
          {/* Emoji Button */}
          <div className="relative">
            <button 
              type="button" 
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
                      type="button"
                      onClick={() => {
                        setInputValue(prev => prev + emoji);
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
            type="button" 
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
                    type="button" 
                    onClick={cancelRecording}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-300 transition-all"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="button" 
                    onClick={stopRecording}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg"
                  >
                    إرسال
                  </button>
                </div>
              </div>
            ) : (
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="اكتب رسالتك هنا..."
                rows={1}
                className="w-full text-base resize-none focus:outline-none max-h-32 bg-transparent leading-relaxed text-gray-800"
                style={{ minHeight: '28px' }}
              />
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Mic Button */}
            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isUploading}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                isRecording 
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90'
              }`}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            {/* Send Button - Always Visible */}
            <button
              type="submit"
              disabled={isLoading || isUploading || (!inputValue.trim() && !selectedFile)}
              className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shrink-0"
            >
              {isLoading || isUploading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={26} className="rotate-180" />
              )}
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-400 text-center mt-4 font-medium">نظام الدعم الفني • Logistics Pro</p>
      </div>
      <style jsx global>{`
        .chat-client {
          direction: rtl;
        }
      `}</style>
    </div>
  );
}

function MessageContent({ msg, isMe }: { msg: any; isMe: boolean }) {
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
          src={msg.file_path} 
          alt="صورة" 
          className="rounded-xl max-w-full max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity shadow-md"
          onClick={() => window.open(msg.file_path, '_blank')}
        />
        {msg.message && !msg.message.includes("أرسل") && <p className="text-sm leading-relaxed break-words">{msg.message}</p>}
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
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
            isMe ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-white/30 text-white hover:bg-white/40'
          }`}
        >
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>
        <div className="flex-1">
          <div className={`h-2 rounded-full overflow-hidden ${isMe ? 'bg-gray-200' : 'bg-white/20'}`}>
            <div 
              className={`h-full rounded-full transition-all ${isMe ? 'bg-indigo-500' : 'bg-white'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <p className={`text-xs mt-1.5 font-bold ${isMe ? 'text-gray-500' : 'text-white/80'}`}>🎤 رسالة صوتية</p>
        </div>
        <audio 
          ref={audioRef} 
          src={msg.file_path} 
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
          src={msg.file_path} 
          controls 
          className="rounded-xl max-w-full max-h-[300px] shadow-md"
        />
        {msg.message && !msg.message.includes("أرسل") && <p className="text-sm leading-relaxed break-words">{msg.message}</p>}
      </div>
    );
  }

  if (msg.message_type === "file") {
    return (
      <div className={`flex items-center gap-4 p-3 rounded-xl ${isMe ? 'bg-gray-100' : 'bg-white/10'}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${isMe ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}>
          <FileIcon size={24} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold truncate">{msg.message}</p>
          <a 
            href={msg.file_path} 
            target="_blank" 
            download
            className={`text-xs flex items-center gap-1 mt-1 hover:underline ${isMe ? 'text-indigo-600' : 'text-white/80'}`}
          >
            <Download size={12} /> تحميل الملف
          </a>
        </div>
      </div>
    );
  }

  return <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>;
}
