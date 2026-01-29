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
    <div className="flex flex-col h-[88vh] bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-indigo-500/20 relative">
      
      {/* Header */}
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
          
          <button 
            onClick={() => setShowTokenCard(!showTokenCard)}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/20"
          >
            <Key size={20} className="text-white" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-8 relative scroll-smooth bg-[#f5f7fa]"
      >
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
                              <CheckCircle2 size={14} className="text-white" />
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
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white px-6 py-5 border-t border-gray-200 shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3">
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setSelectedFile(file);
            }}
          />
          
          <div className="flex-1 bg-gray-100 rounded-2xl border-2 border-gray-200 focus-within:border-indigo-500 focus-within:bg-white transition-all overflow-hidden px-5 py-3">
            {isRecording ? (
              <div className="flex items-center justify-between gap-4">
                <span className="text-lg font-bold text-red-500 animate-pulse">{formatDuration(recordingTime)}</span>
                <div className="flex gap-2">
                  <button type="button" onClick={cancelRecording} className="text-sm text-gray-500">إلغاء</button>
                  <button type="button" onClick={stopRecording} className="text-sm font-bold text-red-600">إيقاف</button>
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
                className="w-full text-base resize-none focus:outline-none bg-transparent text-gray-800"
              />
            )}
          </div>
          
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'
            }`}
          >
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button
            type="submit"
            disabled={isLoading || isUploading || (!inputValue.trim() && !selectedFile)}
            className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all shadow-xl"
          >
            <Send size={26} className="rotate-180" />
          </button>
        </form>
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
  const audioRef = useRef<HTMLAudioElement>(null);

  if (msg.message_type === "image") {
    return <img src={msg.file_path} alt="صورة" className="rounded-xl max-w-full max-h-[300px] shadow-md" />;
  }

  if (msg.message_type === "audio") {
    return (
      <div className="flex items-center gap-4 py-2 min-w-[200px]">
        <button 
          onClick={() => {
            if (audioRef.current) {
              if (isPlaying) audioRef.current.pause();
              else audioRef.current.play();
              setIsPlaying(!isPlaying);
            }
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${isMe ? 'bg-indigo-100 text-indigo-600' : 'bg-white/20 text-white'}`}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        <span className="text-xs font-bold">رسالة صوتية</span>
        <audio ref={audioRef} src={msg.file_path} onEnded={() => setIsPlaying(false)} className="hidden" />
      </div>
    );
  }

  if (msg.message_type === "file") {
    return (
      <div className="flex items-center gap-3">
        <FileIcon size={24} />
        <div className="flex flex-col">
          <span className="text-sm font-bold truncate max-w-[150px]">{msg.message}</span>
          <a href={msg.file_path} download className="text-xs underline opacity-80">تحميل</a>
        </div>
      </div>
    );
  }

  return <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>;
}
