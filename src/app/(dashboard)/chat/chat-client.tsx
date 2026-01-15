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
  MoreVertical,
  Phone,
  Video,
  ArrowDown,
  RefreshCw,
  X,
  FileIcon,
  Play,
  Pause,
  Volume2,
  Download,
  FileText,
  FileArchive,
  Image as ImageIcon,
  Film,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { sendMessage, getMessages } from "@/lib/actions/chat";

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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setMessages(res.data);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    pollIntervalRef.current = setInterval(pollMessages, 3000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [companyId]);

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

  const handleSend = async (e?: React.FormEvent, customData?: any) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim() && !selectedFile && !customData) return;
    if (isLoading || isUploading) return;

    setIsLoading(true);
    let filePath = customData?.file_path || "";
    let messageType: any = customData?.message_type || "text";
    let messageText = customData?.message || inputValue.trim();

    try {
      if (selectedFile && !customData) {
        setIsUploading(true);
        const uploadRes = await uploadFile(selectedFile);
        filePath = uploadRes.url;
        messageType = getMessageType(selectedFile.type);
        if (!messageText) messageText = `أرسل ${getFileTypeName(selectedFile.type)}`;
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
        created_at: new Date().toISOString(),
        is_read: 0,
        _pending: true
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setInputValue("");

      const result = await sendMessage({
        company_id: companyId,
        sender_role: senderRole,
        message: messageText,
        file_path: filePath,
        message_type: messageType
      });

      if (!result.success) {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        toast.error("فشل في إرسال الرسالة");
      } else {
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, id: result.insertId, _pending: false } : m
        ));
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

  const getFileTypeName = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return "صورة";
    if (mimeType.startsWith("audio/")) return "ملف صوتي";
    if (mimeType.startsWith("video/")) return "مقطع فيديو";
    return "ملف";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], `voice_message_${Date.now()}.webm`, { type: "audio/webm" });
        
        setIsUploading(true);
        try {
          const uploadRes = await uploadFile(file);
          handleSend(undefined, {
            message: "رسالة صوتية",
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

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("لا يمكن الوصول للميكروفون");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
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
    <div className="flex flex-col h-[80vh] bg-[#fdfdfd] rounded-3xl overflow-hidden shadow-2xl border border-gray-100 relative">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-bottom border-gray-100 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Headset size={24} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
          </div>
          <div>
            <h3 className="text-gray-900 font-bold text-lg">مركز الدعم الفني</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-emerald-600 text-xs font-medium">متصل الآن - استجابة فورية</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
            <RefreshCw size={14} className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-[10px] text-gray-500 font-medium">مزامنة تلقائية</span>
          </div>
          <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <MoreVertical size={22} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-8 relative scroll-smooth"
        style={{ 
          background: "linear-gradient(to bottom, #fdfdfd, #f9fafb)",
        }}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date} className="space-y-4">
              <div className="flex justify-center sticky top-2 z-10">
                <span className="bg-white/90 backdrop-blur-sm text-gray-500 text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                  {date}
                </span>
              </div>

              {msgs.map((msg, index) => {
                const isMe = msg.sender_role === senderRole;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: isMe ? -20 : 20, scale: 0.95 }}
                    animate={{ opacity: msg._pending ? 0.7 : 1, x: 0, scale: 1 }}
                    className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex flex-col max-w-[80%] md:max-w-[70%] ${isMe ? 'items-start' : 'items-end'}`}>
                      <div 
                        className={`relative p-4 rounded-2xl shadow-sm border ${
                          isMe 
                            ? 'bg-white text-gray-800 border-gray-100' 
                            : 'bg-indigo-600 text-white border-indigo-500'
                        } ${isMe ? 'rounded-tl-none shadow-indigo-100/20' : 'rounded-tr-none shadow-indigo-200/40'}`}
                      >
                        {/* Render Message Content based on type */}
                        <MessageContent msg={msg} isMe={isMe} />
                        
                        <div className={`flex items-center gap-2 mt-2 ${isMe ? 'justify-start' : 'justify-end'}`}>
                          <span className={`text-[10px] ${isMe ? 'text-gray-400' : 'text-indigo-100'}`}>
                            {formatTime(msg.created_at)}
                          </span>
                          {!isMe && (
                            msg._pending ? (
                              <Check size={14} className="text-indigo-200" />
                            ) : msg.is_read ? (
                              <CheckCheck size={14} className="text-white" />
                            ) : (
                              <Check size={14} className="text-indigo-200" />
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

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToBottom}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all border border-gray-100 z-20"
          >
            <ArrowDown size={20} className="text-indigo-600" />
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
            className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-sm">
                <FileIcon className="text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 line-clamp-1">{selectedFile.name}</p>
                <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • جاهز للرفع</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedFile(null)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <Trash2 size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="bg-white px-6 py-6 border-t border-gray-100 shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex items-center gap-1">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <Paperclip size={24} />
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
          </div>
          
          <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-indigo-500 focus-within:bg-white transition-all overflow-hidden flex flex-col px-4 py-3">
            {isRecording ? (
              <div className="flex items-center justify-between gap-4 py-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold text-gray-900">{formatDuration(recordingTime)}</span>
                </div>
                <div className="flex-1 flex justify-center">
                  <p className="text-xs text-gray-500 font-medium animate-pulse">جاري تسجيل رسالة صوتية...</p>
                </div>
                <button 
                  type="button" 
                  onClick={stopRecording}
                  className="px-4 py-1.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-md shadow-red-100"
                >
                  إيقاف وإرسال
                </button>
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
                placeholder="اكتب استفسارك هنا..."
                rows={1}
                className="w-full text-sm resize-none focus:outline-none max-h-32 bg-transparent leading-relaxed text-gray-800"
                style={{ minHeight: '24px' }}
              />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!inputValue.trim() && !selectedFile && !isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-all shadow-sm"
              >
                <Mic size={24} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={(isLoading || isUploading)}
                className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 shrink-0"
              >
                {isLoading || isUploading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={24} className="rotate-180 -mr-1" />
                )}
              </button>
            )}
          </div>
        </form>
        <p className="text-[10px] text-gray-400 text-center mt-4 font-medium">نظام الدعم الفني الموحد • Logistics Pro</p>
      </div>
    </div>
  );
}

function MessageContent({ msg, isMe }: { msg: any; isMe: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (msg.message_type === "image") {
    return (
      <div className="space-y-2">
        <img 
          src={msg.file_path} 
          alt="صورة مرسلة" 
          className="rounded-xl max-w-full h-auto cursor-pointer hover:opacity-95 transition-opacity shadow-sm"
          onClick={() => window.open(msg.file_path, '_blank')}
        />
        {msg.message !== "رسالة صورة" && <p className="text-[13px] leading-relaxed break-words">{msg.message}</p>}
      </div>
    );
  }

  if (msg.message_type === "audio") {
    return (
      <div className="flex items-center gap-3 py-1 min-w-[200px]">
        <button 
          onClick={() => {
            if (audioRef.current) {
              if (isPlaying) audioRef.current.pause();
              else audioRef.current.play();
              setIsPlaying(!isPlaying);
            }
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            isMe ? 'bg-indigo-50 text-indigo-600' : 'bg-white/20 text-white'
          }`}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
        </button>
        <div className="flex-1">
          <div className={`h-1 rounded-full ${isMe ? 'bg-gray-100' : 'bg-white/20'}`}>
            <div className={`h-full rounded-full transition-all duration-300 ${isMe ? 'bg-indigo-500' : 'bg-white'}`} style={{ width: isPlaying ? '100%' : '0%' }} />
          </div>
          <p className={`text-[10px] mt-1 font-bold ${isMe ? 'text-gray-400' : 'text-indigo-100'}`}>رسالة صوتية</p>
        </div>
        <audio 
          ref={audioRef} 
          src={msg.file_path} 
          onEnded={() => setIsPlaying(false)}
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
          className="rounded-xl max-w-full h-auto shadow-sm"
        />
        {msg.message !== "رسالة فيديو" && <p className="text-[13px] leading-relaxed break-words">{msg.message}</p>}
      </div>
    );
  }

  if (msg.message_type === "file") {
    return (
      <div className={`flex items-center gap-3 p-2 rounded-xl border ${isMe ? 'bg-gray-50 border-gray-100' : 'bg-white/10 border-white/20'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isMe ? 'bg-white text-indigo-600' : 'bg-white/20 text-white'}`}>
          <FileIcon size={20} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-bold truncate">{msg.message}</p>
          <a 
            href={msg.file_path} 
            target="_blank" 
            download
            className={`text-[10px] flex items-center gap-1 mt-0.5 hover:underline ${isMe ? 'text-indigo-600' : 'text-indigo-100'}`}
          >
            <Download size={10} /> تحميل الملف
          </a>
        </div>
      </div>
    );
  }

  return <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>;
}
