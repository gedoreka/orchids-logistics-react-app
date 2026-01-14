"use client";

import React, { useState, useEffect } from "react";
import { 
  Menu,
  ArrowRight, 
  Home, 
  Calendar, 
  History, 
  MapPin, 
  Globe, 
  Truck, 
  MessageSquare, 
  UserCircle,
  X,
  ExternalLink,
  Copy,
  QrCode,
  Check,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

export function Header({ user, onToggleSidebar }: { user?: { name: string; role: string; email: string }, onToggleSidebar?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState("جاري تحديث الموقع...");
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&accept-language=ar`
            );
            const data = await response.json();
            setLocation(data.display_name.split(",").slice(0, 2).join(",") || "الموقع غير معروف");
          } catch (error) {
            setLocation("السعودية، الرياض");
          }
        },
        () => setLocation("السعودية، الرياض")
      );
    } else {
      setLocation("الموقع غير مدعوم");
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatHijriDate = (date: Date) => {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const copyDriverLink = () => {
    navigator.clipboard.writeText("https://accounts.zoolspeed.com/driver-input.php");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="z-40 w-full bg-white/80 backdrop-blur-md border-b-2 border-gray-100 shadow-xl no-print sticky top-0">
        <div className="max-w-[1900px] mx-auto px-6 md:px-10 py-3 flex flex-col lg:flex-row items-center justify-between gap-5">
          
            {/* Logo & Basic Nav */}
            <div className="flex items-center justify-between w-full lg:w-auto gap-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={onToggleSidebar}
                  className="lg:hidden p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-600 shadow-sm"
                >
                  <Menu size={22} />
                </button>
              </div>
              
              {pathname !== "/dashboard" && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-sm font-black text-gray-700 hover:bg-gray-100 rounded-xl transition-all shadow-sm group"
                  >
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    <span>رجوع</span>
                  </button>
                  
                  <button 
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-sm font-black text-gray-700 hover:bg-gray-100 rounded-xl transition-all shadow-sm group"
                  >
                    <Home size={16} className="group-hover:scale-110 transition-transform" />
                    <span>الرئيسية</span>
                  </button>
                </div>
              )}
            </div>

            {/* Time & Location */}
            <div className="hidden xl:flex items-center gap-6 bg-white/50 px-6 py-2.5 rounded-2xl border-2 border-gray-50 shadow-inner">
              {mounted && (
                <>
                  <div className="flex items-center gap-4 text-[11px] font-black text-gray-600 uppercase tracking-tight">
                    <div className="flex items-center gap-2 group">
                      <div className="w-8 h-8 bg-[#3498db]/10 rounded-lg flex items-center justify-center text-[#3498db] group-hover:bg-[#3498db] group-hover:text-white transition-all">
                        <Calendar size={14} />
                      </div>
                      <span className="whitespace-nowrap">{formatDate(currentTime)}</span>
                    </div>
                    <div className="w-[2px] h-4 bg-gray-200" />
                    <div className="flex items-center gap-2 group">
                      <div className="w-8 h-8 bg-[#e67e22]/10 rounded-lg flex items-center justify-center text-[#e67e22] group-hover:bg-[#e67e22] group-hover:text-white transition-all">
                        <History size={14} />
                      </div>
                      <span className="whitespace-nowrap">{formatHijriDate(currentTime)}</span>
                    </div>
                  </div>
                  <div className="w-[2px] h-4 bg-gray-200" />
                </>
              )}
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black tracking-tighter group cursor-help">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-[#e74c3c]/10 group-hover:text-[#e74c3c] transition-all">
                  <MapPin size={12} className="animate-bounce" />
                </div>
                <span className="truncate max-w-[200px]">{location}</span>
              </div>
            </div>

          {/* User Actions */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-center lg:justify-end pb-2 lg:pb-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-gray-50 p-1 rounded-xl shrink-0 border border-gray-100 shadow-inner">
              <button className="flex items-center gap-2 px-4 py-1.5 text-[11px] font-black bg-white text-[#3498db] rounded-lg shadow-sm border border-gray-100 transition-all hover:scale-105">
                <Globe size={14} />
                <span>العربية</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-1.5 text-[11px] font-black text-gray-500 hover:text-gray-800 transition-all hover:bg-white/50 rounded-lg">
                <Globe size={14} />
                <span>English</span>
              </button>
            </div>

            <button 
              onClick={() => setIsDriverModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] text-white text-[11px] font-black rounded-xl hover:bg-black transition-all hover:shadow-lg hover:scale-105 shrink-0 border-b-4 border-gray-800"
            >
              <Truck size={14} className="animate-pulse" />
              <span>تطبيق السائقين</span>
            </button>

            <button 
              onClick={() => router.push("/chat")}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2ecc71] text-white text-[11px] font-black rounded-xl hover:bg-[#27ae60] transition-all hover:shadow-lg hover:scale-105 shrink-0 border-b-4 border-[#1e8449]"
            >
              <MessageSquare size={14} />
              <span>الدعم الفني</span>
            </button>

            <button 
              onClick={() => router.push("/user_profile")}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3498db] text-white text-[11px] font-black rounded-xl hover:bg-[#2980b9] transition-all hover:shadow-lg hover:scale-105 shrink-0 border-b-4 border-[#2171a9]"
            >
              <UserCircle size={14} />
              <span>بياناتي</span>
            </button>
          </div>
        </div>
      </header>

      {/* Driver App Modal */}
      <AnimatePresence>
        {isDriverModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDriverModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#2c3e50] text-white rounded-[2rem] p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setIsDriverModalOpen(false)}
                className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col items-center text-center gap-4 mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-[#3498db]">
                  <Truck size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black mb-1">تطبيق السائقين</h3>
                  <p className="text-white/60 text-sm">نظام إدخال البيانات للسائقين الميدانيين</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mb-6">
                <a 
                  href="https://accounts.zoolspeed.com/driver-input.php" 
                  target="_blank"
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <ExternalLink size={20} className="text-[#3498db]" />
                    <span className="font-bold text-sm">فتح رابط التطبيق</span>
                  </div>
                  <ArrowRight size={18} className="text-white/30 group-hover:translate-x-[-4px] transition-transform" />
                </a>

                <button 
                  onClick={copyDriverLink}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group text-right"
                >
                  <div className="flex items-center gap-3">
                    {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="text-[#f1c40f]" />}
                    <span className="font-bold text-sm">{copied ? "تم النسخ بنجاح" : "نسخ رابط التطبيق"}</span>
                  </div>
                </button>

                <button 
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group text-right"
                >
                  <div className="flex items-center gap-3">
                    <QrCode size={20} className="text-[#e67e22]" />
                    <span className="font-bold text-sm">عرض رمز QR</span>
                  </div>
                </button>
              </div>

              {showQR && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="flex flex-col items-center gap-4 p-6 bg-white rounded-3xl mb-6"
                >
                  <div className="bg-gray-100 p-4 rounded-2xl">
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://accounts.zoolspeed.com/driver-input.php" 
                      alt="QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-[#2c3e50] text-xs font-black">امسح الكود لفتح التطبيق فوراً</p>
                </motion.div>
              )}

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-2 text-[#3498db]">
                  <Info size={16} />
                  <h6 className="text-xs font-black">معلومات عن التطبيق</h6>
                </div>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  هذا التطبيق مخصص للسائقين لتسجيل عمليات الشحن والتسليم بشكل فوري، ويتيح للمديرين متابعة سير العمليات من لوحة التحكم.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
