"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
    Menu,
    ArrowRight, 
    ArrowLeft,
    Home, 
    Calendar, 
    MapPin, 
    Truck, 
    MessageSquare, 
    UserCircle,
    X,
    ExternalLink,
    Copy,
    QrCode,
    Check,
    Info,
    Bell,
    Search,
    ChevronDown,
    Settings,
    LogOut,
    User,
    Moon,
    Command,
    Crown,
    AlertCircle,
    Clock,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Square,
    Volume2,
    BookOpen
  } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from '@/lib/locale-context';
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
}

const SURAHS: Surah[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatiha" },
  { number: 2, name: "البقرة", englishName: "Al-Baqara" },
  { number: 36, name: "يس", englishName: "Ya-Sin" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman" },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'a" },
  { number: 67, name: "الملك", englishName: "Al-Mulk" },
  { number: 78, name: "النبأ", englishName: "An-Naba" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas" },
  { number: 113, name: "الفلق", englishName: "Al-Falaq" },
  { number: 114, name: "الناس", englishName: "An-Nas" },
];

export function Header({ user, onToggleSidebar, unreadChatCount = 0, subscriptionData }: { user?: { name: string; role: string; email: string }, onToggleSidebar?: () => void, unreadChatCount?: number, subscriptionData?: { isActive: boolean; endDate: string | null; daysRemaining: number } }) {
  const t = useTranslations('header');
  const tCommon = useTranslations('common');
  const { locale, isRTL } = useLocale();
  
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(isRTL ? "الرياض، السعودية" : "Riyadh, Saudi Arabia");
  const [cityName, setCityName] = useState("Riyadh");
  const [countryName, setCountryName] = useState("Saudi Arabia");
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [unreadAdminCount, setUnreadAdminCount] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [showQuranPlayer, setShowQuranPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurahIndex, setCurrentSurahIndex] = useState(0);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const prayerRef = useRef<HTMLDivElement>(null);
  const quranRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAdminNotifications = async () => {
      try {
        const response = await fetch("/api/admin/notifications?limit=5");
        const data = await response.json();
        if (data.success) {
          setAdminNotifications(data.notifications);
          
          const lastSeenId = parseInt(localStorage.getItem("last_admin_notification_id") || "0");
          const unread = data.notifications.filter((n: any) => n.id > lastSeenId).length;
          setUnreadAdminCount(unread);
        }
      } catch (error) {
        console.error("Error fetching header notifications:", error);
      }
    };

    fetchAdminNotifications();
    const interval = setInterval(fetchAdminNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (prayerRef.current && !prayerRef.current.contains(event.target as Node)) {
        setShowPrayerModal(false);
      }
      if (quranRef.current && !quranRef.current.contains(event.target as Node)) {
        setShowQuranPlayer(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
            );
            const data = await response.json();
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || addr.state || "";
            const country = addr.country || "السعودية";
            setCityName(city);
            setCountryName(country);
            setLocation(`${city}، ${country}`);
          } catch {
            setLocation("الرياض، السعودية");
          }
        },
        () => {
          setLocation("الرياض، السعودية");
          setCoords({ lat: 24.7136, lng: 46.6753 });
        }
      );
    } else {
      setCoords({ lat: 24.7136, lng: 46.6753 });
    }
  }, []);

  useEffect(() => {
    if (!coords) return;
    const fetchPrayerTimes = async () => {
      try {
        const today = new Date();
        const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        const response = await fetch(
          `https://api.aladhan.com/v1/timings/${date}?latitude=${coords.lat}&longitude=${coords.lng}&method=4`
        );
        const data = await response.json();
        if (data.code === 200) {
          setPrayerTimes(data.data.timings);
        }
      } catch (error) {
        console.error("Error fetching prayer times:", error);
      }
    };
    fetchPrayerTimes();
  }, [coords]);

  const calculateNextPrayer = useCallback(() => {
    if (!prayerTimes) return;
    const prayers = [
      { name: isRTL ? "الفجر" : "Fajr", time: prayerTimes.Fajr },
      { name: isRTL ? "الشروق" : "Sunrise", time: prayerTimes.Sunrise },
      { name: isRTL ? "الظهر" : "Dhuhr", time: prayerTimes.Dhuhr },
      { name: isRTL ? "العصر" : "Asr", time: prayerTimes.Asr },
      { name: isRTL ? "المغرب" : "Maghrib", time: prayerTimes.Maghrib },
      { name: isRTL ? "العشاء" : "Isha", time: prayerTimes.Isha },
    ];

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerMinutes = hours * 60 + minutes;
      if (prayerMinutes > currentMinutes) {
        const diff = prayerMinutes - currentMinutes;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        setNextPrayer({
          name: prayer.name,
          time: prayer.time,
          remaining: h > 0 ? `${h}س ${m}د` : `${m}د`,
        });
        return;
      }
    }
    setNextPrayer({
      name: prayers[0].name,
      time: prayers[0].time,
      remaining: isRTL ? "غداً" : "Tomorrow",
    });
  }, [prayerTimes, isRTL]);

  useEffect(() => {
    calculateNextPrayer();
    const interval = setInterval(calculateNextPrayer, 60000);
    return () => clearInterval(interval);
  }, [calculateNextPrayer]);

  const playSurah = (index: number) => {
    const surah = SURAHS[index];
    const surahNum = surah.number.toString().padStart(3, "0");
    const url = `https://server8.mp3quran.net/afs/${surahNum}.mp3`;
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src) {
        playSurah(currentSurahIndex);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const nextSurah = () => {
    const newIndex = (currentSurahIndex + 1) % SURAHS.length;
    setCurrentSurahIndex(newIndex);
    playSurah(newIndex);
  };

  const prevSurah = () => {
    const newIndex = currentSurahIndex === 0 ? SURAHS.length - 1 : currentSurahIndex - 1;
    setCurrentSurahIndex(newIndex);
    playSurah(newIndex);
  };

  const formatDate = (date: Date) => {
    if (isRTL) {
      const weekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const weekday = weekdays[date.getDay()];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${weekday}، ${day} ${month} - ${hours}:${minutes}:${seconds}`;
    } else {
      const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const weekday = weekdays[date.getDay()];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${weekday}, ${month} ${day} - ${hours}:${minutes}:${seconds}`;
    }
  };

  const getHijriDate = () => {
    try {
      const date = new Date();
      const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
      return hijri;
    } catch {
      return "";
    }
  };

  const copyDriverLink = () => {
    navigator.clipboard.writeText("https://accounts.zoolspeed.com/driver/");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const notifications = [
    { id: 1, title: isRTL ? "طلب شحن جديد" : "New shipping request", time: isRTL ? "منذ 5 دقائق" : "5 minutes ago", type: "info" },
    { id: 2, title: isRTL ? "تم تسليم الشحنة #1234" : "Shipment #1234 delivered", time: isRTL ? "منذ ساعة" : "1 hour ago", type: "success" },
    { id: 3, title: isRTL ? "تنبيه: إقامة منتهية" : "Alert: Expired Iqama", time: isRTL ? "منذ ساعتين" : "2 hours ago", type: "warning" },
  ];

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <>
      <header className="sticky top-0 z-[100] w-full no-print">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="relative z-10 w-full mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              
              <div className="flex items-center gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleSidebar}
                  className="lg:hidden p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/70 border border-white/10"
                >
                  <Menu size={20} />
                </motion.button>

                  {pathname !== "/dashboard" && (
                    <div className="hidden sm:flex items-center gap-2">
                      <motion.button 
                        whileHover={{ scale: 1.02, x: isRTL ? 3 : -3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 group"
                      >
                        <BackIcon size={16} className={cn("text-white/60 transition-transform", isRTL ? "group-hover:translate-x-1" : "group-hover:-translate-x-1")} />
                        <span className="text-[11px] font-bold text-white/60">{tCommon('back')}</span>
                      </motion.button>
                      
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 group"
                      >
                        <Home size={16} className="text-white/60 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-bold text-white/60">{isRTL ? 'الرئيسية' : 'Home'}</span>
                      </motion.button>
                    </div>
                  )}
              </div>

              <div className="flex-1 max-w-xl hidden md:block">
                <motion.div 
                  animate={{ 
                    boxShadow: isSearchFocused 
                      ? "0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 20px rgba(0, 0, 0, 0.3)" 
                      : "0 0 0 1px rgba(255, 255, 255, 0.05)"
                  }}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300",
                    "bg-white/5 border border-white/10",
                    isSearchFocused && "bg-white/10 border-blue-500/30"
                  )}
                >
                  <Search size={16} className={cn(
                    "transition-colors",
                    isSearchFocused ? "text-blue-400" : "text-white/30"
                  )} />
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                        className="flex-1 !bg-transparent border-none text-white/90 text-[12px] font-medium placeholder:text-white/30 outline-none"
                    />
                  <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg border border-white/10">
                    <Command size={10} className="text-white/30" />
                    <span className="text-[9px] font-bold text-white/30">K</span>
                  </div>
                </motion.div>
              </div>

              <div className="hidden xl:flex items-center gap-4 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
                  {mounted && (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/30 to-indigo-500/30">
                          <Clock size={12} className="text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-white/70">{formatDate(currentTime)}</span>
                          <span className="text-[9px] text-white/40">{getHijriDate()}</span>
                        </div>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500/30 to-pink-500/30">
                          <MapPin size={12} className="text-rose-400" />
                        </div>
                        <span className="text-[10px] font-bold text-white/50 max-w-[120px] truncate">{location}</span>
                      </div>
                    </>
                  )}
                </div>

<div className="flex items-center gap-2">
                      <ThemeToggle />
                      <LanguageSwitcher />

                  <div ref={prayerRef} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowPrayerModal(!showPrayerModal)}
                      className="relative p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 rounded-xl transition-all border border-emerald-500/20"
                      title={isRTL ? "أوقات الصلاة" : "Prayer Times"}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                        <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm.5-11H11v5l4.28 2.54.72-1.21-3.5-2.08V8z" fill="currentColor"/>
                      </svg>
                      {nextPrayer && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-emerald-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                          {nextPrayer.remaining.replace(/[سد]/g, '').trim().split(' ')[0]}
                        </span>
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {showPrayerModal && prayerTimes && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-2 w-72 bg-gradient-to-b from-slate-900/98 to-slate-950/98 backdrop-blur-xl rounded-2xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 overflow-hidden z-[9999]"
                        >
                          <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-emerald-500/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-emerald-500/30">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                                </svg>
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-sm">{isRTL ? 'أوقات الصلاة' : 'Prayer Times'}</h3>
                                <p className="text-[10px] text-emerald-400">{location}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 space-y-2">
                            {[
                              { name: isRTL ? "الفجر" : "Fajr", time: prayerTimes.Fajr, icon: "🌙" },
                              { name: isRTL ? "الشروق" : "Sunrise", time: prayerTimes.Sunrise, icon: "🌅" },
                              { name: isRTL ? "الظهر" : "Dhuhr", time: prayerTimes.Dhuhr, icon: "☀️" },
                              { name: isRTL ? "العصر" : "Asr", time: prayerTimes.Asr, icon: "🌤️" },
                              { name: isRTL ? "المغرب" : "Maghrib", time: prayerTimes.Maghrib, icon: "🌇" },
                              { name: isRTL ? "العشاء" : "Isha", time: prayerTimes.Isha, icon: "🌃" },
                            ].map((prayer, i) => (
                              <div 
                                key={i} 
                                className={cn(
                                  "flex items-center justify-between p-2.5 rounded-xl transition-all",
                                  nextPrayer?.name === prayer.name 
                                    ? "bg-emerald-500/20 border border-emerald-500/30" 
                                    : "bg-white/5 hover:bg-white/10"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{prayer.icon}</span>
                                  <span className="text-[11px] font-bold text-white/80">{prayer.name}</span>
                                </div>
                                <span className={cn(
                                  "text-[12px] font-bold",
                                  nextPrayer?.name === prayer.name ? "text-emerald-400" : "text-white/60"
                                )}>{prayer.time}</span>
                              </div>
                            ))}
                          </div>
                          {nextPrayer && (
                            <div className="p-3 border-t border-white/10 bg-emerald-500/10">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-white/50">{isRTL ? 'الصلاة القادمة' : 'Next Prayer'}</span>
                                <span className="text-[11px] font-bold text-emerald-400">{nextPrayer.name} - {isRTL ? `بعد ${nextPrayer.remaining}` : `in ${nextPrayer.remaining}`}</span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div ref={quranRef} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowQuranPlayer(!showQuranPlayer)}
                      className={cn(
                        "relative p-2.5 rounded-xl transition-all border",
                        isPlaying 
                          ? "bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-500/30"
                          : "bg-gradient-to-br from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-amber-500/20"
                      )}
                      title={isRTL ? "القرآن الكريم" : "Holy Quran"}
                    >
                      <BookOpen size={18} className="text-amber-400" />
                      {isPlaying && (
                        <motion.span 
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full"
                        />
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {showQuranPlayer && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-2 w-80 bg-gradient-to-b from-slate-900/98 to-slate-950/98 backdrop-blur-xl rounded-2xl border border-amber-500/20 shadow-2xl shadow-amber-500/10 overflow-hidden z-[9999]"
                        >
                          <div className="p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/20">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-amber-500/30">
                                <BookOpen size={20} className="text-amber-400" />
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-sm">{isRTL ? 'القرآن الكريم' : 'Holy Quran'}</h3>
                                <p className="text-[10px] text-amber-400">{isRTL ? 'مشاري العفاسي' : 'Mishary Alafasy'}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <div className="text-center mb-4">
                              <p className="text-lg font-bold text-white">{SURAHS[currentSurahIndex].name}</p>
                              <p className="text-[11px] text-white/50">{SURAHS[currentSurahIndex].englishName}</p>
                            </div>
                            
                            <div className="flex items-center justify-center gap-3 mb-4">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={prevSurah}
                                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                              >
                                <SkipBack size={18} className="text-white/70" />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={togglePlay}
                                className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg shadow-amber-500/30"
                              >
                                {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white" />}
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={nextSurah}
                                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                              >
                                <SkipForward size={18} className="text-white/70" />
                              </motion.button>
                            </div>
                            
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={stopAudio}
                              className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white/50 hover:text-white/70"
                            >
                              <Square size={14} />
                              <span className="text-[11px] font-bold">{isRTL ? 'إيقاف' : 'Stop'}</span>
                            </motion.button>
                          </div>
                          
                          <div className="p-3 border-t border-white/10 max-h-40 overflow-y-auto">
                            <p className="text-[10px] text-white/40 mb-2">{isRTL ? 'السور المتاحة' : 'Available Surahs'}</p>
                            <div className="grid grid-cols-2 gap-1">
                              {SURAHS.map((surah, i) => (
                                <button
                                  key={surah.number}
                                  onClick={() => { setCurrentSurahIndex(i); playSurah(i); }}
                                  className={cn(
                                    "text-right p-2 rounded-lg transition-all text-[10px]",
                                    currentSurahIndex === i 
                                      ? "bg-amber-500/20 text-amber-400 font-bold" 
                                      : "bg-white/5 hover:bg-white/10 text-white/60"
                                  )}
                                >
                                  {surah.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                    <div ref={notificationRef} className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                      >
                        <Bell size={18} className="text-white/60" />
                        {unreadAdminCount > 0 && (
                          <motion.span 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-rose-500 to-red-500 rounded-full shadow-lg shadow-rose-500/50"
                          />
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {showNotifications && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-[9999]"
                          >
                            <div className="p-4 border-b border-white/10">
                                <h3 className="font-bold text-white text-sm">{isRTL ? 'تنبيهات النظام' : 'System Alerts'}</h3>
                                <p className="text-[10px] text-white/40">{isRTL ? `لديك ${unreadAdminCount} تنبيهات جديدة` : `You have ${unreadAdminCount} new alerts`}</p>
                              </div>
                            <div className="max-h-64 overflow-y-auto">
                              {adminNotifications.length > 0 ? adminNotifications.map((notif) => (
                                <motion.div
                                  key={notif.id}
                                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                  className="p-4 border-b border-white/5 cursor-pointer"
                                  onClick={() => {
                                    const currentLastSeen = parseInt(localStorage.getItem("last_admin_notification_id") || "0");
                                    if (notif.id > currentLastSeen) {
                                      localStorage.setItem("last_admin_notification_id", notif.id.toString());
                                      setUnreadAdminCount(prev => Math.max(0, prev - 1));
                                    }
                                    setShowNotifications(false);
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/20">
                                      <Bell size={14} className="text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-[12px] font-bold text-white/90">{notif.title}</p>
                                      <p className="text-[10px] text-white/40">{new Date(notif.created_at).toLocaleDateString('ar-SA')}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )) : (
                                <div className="p-10 text-center opacity-20">
                                  <Bell size={40} className="mx-auto mb-2" />
                                  <p className="text-xs font-bold">{isRTL ? 'لا توجد تنبيهات' : 'No alerts'}</p>
                                </div>
                              )}
                            </div>
                              <div className="p-3 border-t border-white/10">
                                <button 
                                  onClick={() => {
                                    if (user?.role === 'admin') router.push('/admin/notifications');
                                    setShowNotifications(false);
                                  }}
                                  className="w-full text-center text-[11px] font-bold text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  {isRTL ? 'عرض جميع التنبيهات' : 'View All Alerts'}
                                </button>
                              </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>


                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsDriverModalOpen(true)}
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl transition-all shadow-lg shadow-amber-500/20 border border-amber-400/20"
                  >
                    <Truck size={16} className="text-white" />
                    <span className="text-[11px] font-bold text-white">{t('driverApp')}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/chat")}
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl transition-all shadow-lg shadow-emerald-500/20 border border-emerald-400/20 relative"
                  >
                    <MessageSquare size={16} className="text-white" />
                    <span className="text-[11px] font-bold text-white">{t('support')}</span>
                    {unreadChatCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 min-w-[22px] h-[22px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-white"
                      >
                        {unreadChatCount > 9 ? '9+' : unreadChatCount}
                      </motion.span>
                    )}
                  </motion.button>

                  <div ref={userDropdownRef} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-3 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <User size={16} className="text-white" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
                      </div>
                        <div className="hidden md:block text-right">
                          <p className="text-[11px] font-bold text-white/90">{user?.name || (isRTL ? "المستخدم" : "User")}</p>
                          <p className="text-[9px] text-white/40">{user?.role === "admin" ? (isRTL ? "مدير النظام" : "System Admin") : (isRTL ? "مدير منشأة" : "Manager")}</p>
                        </div>
                      <ChevronDown size={14} className={cn(
                        "text-white/40 transition-transform",
                        showUserDropdown && "rotate-180"
                      )} />
                    </motion.button>

                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-[9999]"
                        >
                          <div className="p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <User size={20} className="text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-white text-sm">{user?.name}</p>
                                <p className="text-[10px] text-white/40">{user?.email}</p>
                              </div>
                            </div>
                          </div>
                            
                            {user?.role !== 'admin' && subscriptionData && (
                              <div className="p-3 border-b border-white/10">
                                <div className={cn(
                                  "p-3 rounded-xl",
                                  subscriptionData.isActive && subscriptionData.daysRemaining > 7
                                    ? "bg-emerald-500/10 border border-emerald-500/20"
                                    : subscriptionData.isActive && subscriptionData.daysRemaining > 0
                                    ? "bg-amber-500/10 border border-amber-500/20"
                                    : "bg-red-500/10 border border-red-500/20"
                                )}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-white/50">{isRTL ? 'حالة الاشتراك' : 'Subscription'}</span>
                                    <Crown size={14} className={cn(
                                      subscriptionData.isActive ? "text-amber-400" : "text-red-400"
                                    )} />
                                  </div>
                                  <p className={cn(
                                    "text-[12px] font-bold",
                                    subscriptionData.isActive ? "text-emerald-400" : "text-red-400"
                                  )}>
                                    {subscriptionData.isActive 
                                      ? `${isRTL ? 'متبقي' : 'Remaining'}: ${subscriptionData.daysRemaining} ${isRTL ? 'يوم' : 'days'}`
                                      : isRTL ? 'غير مشترك' : 'Not Subscribed'}
                                  </p>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => { router.push("/subscriptions"); setShowUserDropdown(false); }}
                                  className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white text-[11px] font-bold"
                                >
                                  <Crown size={14} />
                                  {isRTL ? 'عرض الباقات' : 'View Plans'}
                                </motion.button>
                              </div>
                            )}

                            <div className="p-2">
                              <motion.button
                                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                onClick={() => { router.push("/user_profile"); setShowUserDropdown(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white transition-colors"
                              >
                                <UserCircle size={16} />
                                <span className="text-[12px] font-bold">{tCommon('profile')}</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                onClick={() => { router.push("/settings"); setShowUserDropdown(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:text-white transition-colors"
                              >
                                <Settings size={16} />
                                <span className="text-[12px] font-bold">{tCommon('settings')}</span>
                              </motion.button>
                            </div>
                            <div className="p-2 border-t border-white/10">
                              <motion.button
                                whileHover={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 transition-colors"
                              >
                                <LogOut size={16} />
                                <span className="text-[12px] font-bold">{tCommon('logout')}</span>
                              </motion.button>
                            </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
                </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isDriverModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDriverModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-8 shadow-2xl overflow-hidden border border-white/10"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />
              
              <button 
                onClick={() => setIsDriverModalOpen(false)}
                className="absolute top-6 left-6 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={20} />
              </button>

              <div className="relative z-10 flex flex-col items-center text-center gap-4 mb-8">
                <motion.div 
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur-xl opacity-40" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl border border-amber-400/30">
                    <Truck size={32} className="text-white" />
                  </div>
                </motion.div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">{t('driverApp')}</h3>
                  <p className="text-white/40 text-sm">{isRTL ? 'نظام إدخال البيانات للسائقين الميدانيين' : 'Data entry system for field drivers'}</p>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 gap-3 mb-6">
                <a 
                  href="https://accounts.zoolspeed.com/driver/" 
                  target="_blank"
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/10 hover:border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                      <ExternalLink size={18} className="text-blue-400" />
                    </div>
                    <span className="font-bold text-sm text-white/90">{isRTL ? 'فتح رابط التطبيق' : 'Open App Link'}</span>
                  </div>
                  <ArrowRight size={18} className="text-white/30 group-hover:-translate-x-1 transition-transform" />
                </a>

                <button 
                  onClick={copyDriverLink}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group text-right w-full border border-white/10 hover:border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", copied ? "bg-emerald-500/20" : "bg-amber-500/20")}>
                      {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-amber-400" />}
                    </div>
                    <span className="font-bold text-sm text-white/90">{copied ? (isRTL ? "تم النسخ بنجاح" : "Copied!") : (isRTL ? "نسخ رابط التطبيق" : "Copy App Link")}</span>
                  </div>
                </button>

                <button 
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group text-right w-full border border-white/10 hover:border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-xl">
                      <QrCode size={18} className="text-purple-400" />
                    </div>
                    <span className="font-bold text-sm text-white/90">{isRTL ? 'عرض رمز QR' : 'Show QR Code'}</span>
                  </div>
                </button>
              </div>

              <AnimatePresence>
                {showQR && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="relative z-10 flex flex-col items-center gap-4 p-6 bg-white rounded-2xl mb-6 overflow-hidden"
                  >
                    <div className="bg-slate-100 p-4 rounded-2xl">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://accounts.zoolspeed.com/driver/" 
                        alt="QR Code"
                        className="w-32 h-32"
                      />
                    </div>
                    <p className="text-slate-600 text-xs font-bold">{isRTL ? 'امسح الكود لفتح التطبيق فوراً' : 'Scan to open app instantly'}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative z-10 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Info size={14} />
                  <h6 className="text-xs font-bold">{isRTL ? 'معلومات عن التطبيق' : 'About the App'}</h6>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">
                  {isRTL 
                    ? 'هذا التطبيق مخصص للسائقين لتسجيل عمليات الشحن والتسليم بشكل فوري، ويتيح للمديرين متابعة سير العمليات من لوحة التحكم.'
                    : 'This app is designed for drivers to instantly record shipping and delivery operations, allowing managers to track operations from the dashboard.'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
