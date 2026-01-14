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
  Info,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || addr.state || "";
            const country = addr.country || "السعودية";
            setLocation(`${country}، ${city}`);
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

  const PremiumButton = ({ 
    onClick, 
    icon: Icon, 
    label, 
    colorClass, 
    borderClass,
    animate = false 
  }: { 
    onClick: () => void; 
    icon: any; 
    label: string; 
    colorClass: string; 
    borderClass: string;
    animate?: boolean;
  }) => (
    <motion.button
      whileHover={{ scale: 1.05, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 px-6 py-2.5 text-[12px] font-black text-white rounded-2xl transition-all shadow-lg overflow-hidden group border-b-4",
        colorClass,
        borderClass
      )}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      <Icon size={16} className={cn("relative z-10", animate && "animate-pulse")} />
      <span className="relative z-10 whitespace-nowrap">{label}</span>
      <Sparkles size={12} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-white/50" />
    </motion.button>
  );

  return (
    <>
      <header className="z-40 w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-2xl no-print sticky top-0">
        <div className="w-full mx-auto px-6 md:px-12 py-3 flex flex-col xl:flex-row items-center justify-between gap-6">
          
            {/* Logo & Basic Nav */}
            <div className="flex items-center justify-between w-full xl:w-auto gap-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={onToggleSidebar}
                  className="lg:hidden p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all text-gray-600 shadow-inner border border-gray-100"
                >
                  <Menu size={24} />
                </button>
              </div>
              
              {pathname !== "/dashboard" && (
                <div className="flex items-center gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.02, x: 5 }}
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-[12px] font-black text-gray-700 hover:bg-gray-100 rounded-2xl transition-all shadow-sm border border-gray-200/50 group"
                  >
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span>رجوع</span>
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-[12px] font-black text-gray-700 hover:bg-gray-100 rounded-2xl transition-all shadow-sm border border-gray-200/50 group"
                  >
                    <Home size={18} className="group-hover:scale-110 transition-transform" />
                    <span>الرئيسية</span>
                  </motion.button>
                </div>
              )}
            </div>

            {/* Time & Location - Centered & Compact */}
            <div className="hidden xl:flex items-center gap-8 bg-white/60 px-8 py-2 rounded-[2rem] border border-gray-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
              {mounted && (
                <>
                  <div className="flex items-center gap-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <div className="flex items-center gap-3 group">
                      <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                        <Calendar size={14} />
                      </div>
                      <span className="whitespace-nowrap leading-none">{formatDate(currentTime)}</span>
                    </div>
                    
                    <div className="w-px h-6 bg-gray-200" />
                    
                    <div className="flex items-center gap-3 group">
                      <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                        <History size={14} />
                      </div>
                      <span className="whitespace-nowrap leading-none">{formatHijriDate(currentTime)}</span>
                    </div>
                  </div>
                  
                  <div className="w-px h-6 bg-gray-200" />
                </>
              )}
              
              <div className="flex items-center gap-3 text-[10px] text-gray-400 font-black tracking-widest group cursor-help">
                <div className="w-7 h-7 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                  <MapPin size={12} className="animate-bounce" />
                </div>
                <span className="truncate max-w-[250px] uppercase">{location}</span>
              </div>
            </div>

          {/* User Actions - Premium Style */}
          <div className="flex items-center gap-4 w-full xl:w-auto justify-center xl:justify-end">
            {/* Language Switcher */}
            <div className="flex items-center bg-gray-50 p-1.5 rounded-2xl shrink-0 border border-gray-100 shadow-inner mr-2">
              <button className="flex items-center gap-2 px-5 py-2 text-[10px] font-black bg-white text-blue-600 rounded-xl shadow-md border border-gray-100 transition-all hover:scale-105">
                <Globe size={14} />
                <span>العربية</span>
              </button>
              <button className="flex items-center gap-2 px-5 py-2 text-[10px] font-black text-gray-400 hover:text-gray-800 transition-all hover:bg-white/50 rounded-xl">
                <Globe size={14} />
                <span>English</span>
              </button>
            </div>

            <PremiumButton 
              onClick={() => setIsDriverModalOpen(true)}
              icon={Truck}
              label="تطبيق السائقين"
              colorClass="bg-[#1a1a1a] hover:bg-black"
              borderClass="border-gray-800"
              animate={true}
            />

            <PremiumButton 
              onClick={() => router.push("/chat")}
              icon={MessageSquare}
              label="الدعم الفني"
              colorClass="bg-gradient-to-r from-[#2ecc71] to-[#27ae60]"
              borderClass="border-[#1e8449]"
            />

            <PremiumButton 
              onClick={() => router.push("/user_profile")}
              icon={UserCircle}
              label="بياناتي"
              colorClass="bg-gradient-to-r from-[#3498db] to-[#2980b9]"
              borderClass="border-[#2171a9]"
            />
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
              className="relative w-full max-w-md bg-[#2c3e50] text-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
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
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group text-right w-full"
                >
                  <div className="flex items-center gap-3">
                    {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} className="text-[#f1c40f]" />}
                    <span className="font-bold text-sm">{copied ? "تم النسخ بنجاح" : "نسخ رابط التطبيق"}</span>
                  </div>
                </button>

                <button 
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group text-right w-full"
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
