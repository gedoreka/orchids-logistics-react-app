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
      Volume1,
      VolumeX,
      BookOpen,
    Building2,
    Package,
    RefreshCw,
    Zap,
    Upload,
    Landmark,
    Star,
    Shield,
    CheckCircle2,
    Mail,
    Send,
    AtSign,
    Loader2,
      Trash2,
      Eye,
      Maximize2,
      Minimize2,
      Inbox,
      AlertTriangle,
      Plus,
      PlusCircle
      } from "lucide-react";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from '@/lib/locale-context';
import { LanguageSwitcher } from "./language-switcher";

interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  is_active: boolean;
  last_sync_at: string | null;
}

interface EmailMessage {
  id: number;
  uid: number;
  subject: string;
  from: string;
  fromEmail: string;
  to: string;
  date: string;
  snippet: string;
  body: string;
  isRead: boolean;
  hasAttachments: boolean;
  folder: string;
}

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

interface Plan {
  id: number;
  name: string;
  name_en?: string;
  description?: string;
  price: number;
  duration_value: number;
  duration_unit: string;
  features?: string;
}

interface BankAccount {
  id: number;
  bank_name: string;
  account_holder: string;
  account_number?: string;
  iban: string;
}

const SURAHS: Surah[] = [
  { number: 1, name: "الفاتحة", englishName: "Al-Fatiha" },
  { number: 2, name: "البقرة", englishName: "Al-Baqarah" },
  { number: 3, name: "آل عمران", englishName: "Aal-Imran" },
  { number: 4, name: "النساء", englishName: "An-Nisa" },
  { number: 5, name: "المائدة", englishName: "Al-Ma'idah" },
  { number: 6, name: "الأنعام", englishName: "Al-An'am" },
  { number: 7, name: "الأعراف", englishName: "Al-A'raf" },
  { number: 8, name: "الأنفال", englishName: "Al-Anfal" },
  { number: 9, name: "التوبة", englishName: "At-Tawbah" },
  { number: 10, name: "يونس", englishName: "Yunus" },
  { number: 11, name: "هود", englishName: "Hud" },
  { number: 12, name: "يوسف", englishName: "Yusuf" },
  { number: 13, name: "الرعد", englishName: "Ar-Ra'd" },
  { number: 14, name: "إبراهيم", englishName: "Ibrahim" },
  { number: 15, name: "الحجر", englishName: "Al-Hijr" },
  { number: 16, name: "النحل", englishName: "An-Nahl" },
  { number: 17, name: "الإسراء", englishName: "Al-Isra" },
  { number: 18, name: "الكهف", englishName: "Al-Kahf" },
  { number: 19, name: "مريم", englishName: "Maryam" },
  { number: 20, name: "طه", englishName: "Ta-Ha" },
  { number: 21, name: "الأنبياء", englishName: "Al-Anbiya" },
  { number: 22, name: "الحج", englishName: "Al-Hajj" },
  { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun" },
  { number: 24, name: "النور", englishName: "An-Nur" },
  { number: 25, name: "الفرقان", englishName: "Al-Furqan" },
  { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara" },
  { number: 27, name: "النمل", englishName: "An-Naml" },
  { number: 28, name: "القصص", englishName: "Al-Qasas" },
  { number: 29, name: "العنكبوت", englishName: "Al-Ankabut" },
  { number: 30, name: "الروم", englishName: "Ar-Rum" },
  { number: 31, name: "لقمان", englishName: "Luqman" },
  { number: 32, name: "السجدة", englishName: "As-Sajdah" },
  { number: 33, name: "الأحزاب", englishName: "Al-Ahzab" },
  { number: 34, name: "سبأ", englishName: "Saba" },
  { number: 35, name: "فاطر", englishName: "Fatir" },
  { number: 36, name: "يس", englishName: "Ya-Sin" },
  { number: 37, name: "الصافات", englishName: "As-Saffat" },
  { number: 38, name: "ص", englishName: "Sad" },
  { number: 39, name: "الزمر", englishName: "Az-Zumar" },
  { number: 40, name: "غافر", englishName: "Ghafir" },
  { number: 41, name: "فصلت", englishName: "Fussilat" },
  { number: 42, name: "الشورى", englishName: "Ash-Shura" },
  { number: 43, name: "الزخرف", englishName: "Az-Zukhruf" },
  { number: 44, name: "الدخان", englishName: "Ad-Dukhan" },
  { number: 45, name: "الجاثية", englishName: "Al-Jathiyah" },
  { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf" },
  { number: 47, name: "محمد", englishName: "Muhammad" },
  { number: 48, name: "الفتح", englishName: "Al-Fath" },
  { number: 49, name: "الحجرات", englishName: "Al-Hujurat" },
  { number: 50, name: "ق", englishName: "Qaf" },
  { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat" },
  { number: 52, name: "الطور", englishName: "At-Tur" },
  { number: 53, name: "النجم", englishName: "An-Najm" },
  { number: 54, name: "القمر", englishName: "Al-Qamar" },
  { number: 55, name: "الرحمن", englishName: "Ar-Rahman" },
  { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah" },
  { number: 57, name: "الحديد", englishName: "Al-Hadid" },
  { number: 58, name: "المجادلة", englishName: "Al-Mujadilah" },
  { number: 59, name: "الحشر", englishName: "Al-Hashr" },
  { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah" },
  { number: 61, name: "الصف", englishName: "As-Saff" },
  { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah" },
  { number: 63, name: "المنافقون", englishName: "Al-Munafiqun" },
  { number: 64, name: "التغابن", englishName: "At-Taghabun" },
  { number: 65, name: "الطلاق", englishName: "At-Talaq" },
  { number: 66, name: "التحريم", englishName: "At-Tahrim" },
  { number: 67, name: "الملك", englishName: "Al-Mulk" },
  { number: 68, name: "القلم", englishName: "Al-Qalam" },
  { number: 69, name: "الحاقة", englishName: "Al-Haqqah" },
  { number: 70, name: "المعارج", englishName: "Al-Ma'arij" },
  { number: 71, name: "نوح", englishName: "Nuh" },
  { number: 72, name: "الجن", englishName: "Al-Jinn" },
  { number: 73, name: "المزمل", englishName: "Al-Muzzammil" },
  { number: 74, name: "المدثر", englishName: "Al-Muddaththir" },
  { number: 75, name: "القيامة", englishName: "Al-Qiyamah" },
  { number: 76, name: "الإنسان", englishName: "Al-Insan" },
  { number: 77, name: "المرسلات", englishName: "Al-Mursalat" },
  { number: 78, name: "النبأ", englishName: "An-Naba" },
  { number: 79, name: "النازعات", englishName: "An-Nazi'at" },
  { number: 80, name: "عبس", englishName: "Abasa" },
  { number: 81, name: "التكوير", englishName: "At-Takwir" },
  { number: 82, name: "الانفطار", englishName: "Al-Infitar" },
  { number: 83, name: "المطففين", englishName: "Al-Mutaffifin" },
  { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq" },
  { number: 85, name: "البروج", englishName: "Al-Buruj" },
  { number: 86, name: "الطارق", englishName: "At-Tariq" },
  { number: 87, name: "الأعلى", englishName: "Al-A'la" },
  { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah" },
  { number: 89, name: "الفجر", englishName: "Al-Fajr" },
  { number: 90, name: "البلد", englishName: "Al-Balad" },
  { number: 91, name: "الشمس", englishName: "Ash-Shams" },
  { number: 92, name: "الليل", englishName: "Al-Layl" },
  { number: 93, name: "الضحى", englishName: "Ad-Duha" },
  { number: 94, name: "الشرح", englishName: "Ash-Sharh" },
  { number: 95, name: "التين", englishName: "At-Tin" },
  { number: 96, name: "العلق", englishName: "Al-Alaq" },
  { number: 97, name: "القدر", englishName: "Al-Qadr" },
  { number: 98, name: "البينة", englishName: "Al-Bayyinah" },
  { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah" },
  { number: 100, name: "العاديات", englishName: "Al-Adiyat" },
  { number: 101, name: "القارعة", englishName: "Al-Qari'ah" },
  { number: 102, name: "التكاثر", englishName: "At-Takathur" },
  { number: 103, name: "العصر", englishName: "Al-Asr" },
  { number: 104, name: "الهمزة", englishName: "Al-Humazah" },
  { number: 105, name: "الفيل", englishName: "Al-Fil" },
  { number: 106, name: "قريش", englishName: "Quraysh" },
  { number: 107, name: "الماعون", englishName: "Al-Ma'un" },
  { number: 108, name: "الكوثر", englishName: "Al-Kawthar" },
  { number: 109, name: "الكافرون", englishName: "Al-Kafirun" },
  { number: 110, name: "النصر", englishName: "An-Nasr" },
  { number: 111, name: "المسد", englishName: "Al-Masad" },
  { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas" },
  { number: 113, name: "الفلق", englishName: "Al-Falaq" },
  { number: 114, name: "الناس", englishName: "An-Nas" },
];

interface IslamicEvent {
  name: string;
  nameEn: string;
  hijriMonth: number;
  hijriDay: number;
  icon: string;
}

const ISLAMIC_EVENTS: IslamicEvent[] = [
  { name: "رأس السنة الهجرية", nameEn: "Islamic New Year", hijriMonth: 1, hijriDay: 1, icon: "🌙" },
  { name: "عاشوراء", nameEn: "Ashura", hijriMonth: 1, hijriDay: 10, icon: "📿" },
  { name: "المولد النبوي", nameEn: "Prophet's Birthday", hijriMonth: 3, hijriDay: 12, icon: "🕌" },
  { name: "الإسراء والمعراج", nameEn: "Isra & Mi'raj", hijriMonth: 7, hijriDay: 27, icon: "✨" },
  { name: "ليلة النصف من شعبان", nameEn: "Mid-Sha'ban", hijriMonth: 8, hijriDay: 15, icon: "🌕" },
  { name: "بداية رمضان", nameEn: "Ramadan Start", hijriMonth: 9, hijriDay: 1, icon: "🌙" },
  { name: "ليلة القدر", nameEn: "Laylat al-Qadr", hijriMonth: 9, hijriDay: 27, icon: "⭐" },
  { name: "عيد الفطر", nameEn: "Eid al-Fitr", hijriMonth: 10, hijriDay: 1, icon: "🎉" },
  { name: "يوم عرفة", nameEn: "Day of Arafah", hijriMonth: 12, hijriDay: 9, icon: "🕋" },
  { name: "عيد الأضحى", nameEn: "Eid al-Adha", hijriMonth: 12, hijriDay: 10, icon: "🐑" },
];

export function Header({ user, onToggleSidebar, unreadChatCount = 0, subscriptionData }: { user?: { name: string; role: string; email: string; company_id?: number }, onToggleSidebar?: () => void, unreadChatCount?: number, subscriptionData?: { isActive: boolean; endDate: string | null; daysRemaining: number } }) {
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
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<{ plan: Plan; type: 'new' | 'renewal' | 'upgrade' } | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [currentPlanDetails, setCurrentPlanDetails] = useState<any>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [volume, setVolume] = useState(1);
    const [prevVolume, setPrevVolume] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Email states
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [isEmailMaximized, setIsEmailMaximized] = useState(false);
    const [activeEmailFolder, setActiveEmailFolder] = useState("INBOX");
    const [showEmailSettings, setShowEmailSettings] = useState(false);
    const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
    const [selectedEmailAccount, setSelectedEmailAccount] = useState<EmailAccount | null>(null);
    const [emails, setEmails] = useState<EmailMessage[]>([]);
    const [loadingEmails, setLoadingEmails] = useState(false);
    const [unreadEmailCount, setUnreadEmailCount] = useState(0);
    const [fetchingUnread, setFetchingUnread] = useState(false);
    const [isAddingAccount, setIsAddingAccount] = useState(false);

    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  const pathname = usePathname();
  const router = useRouter();

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

      const fetchEmailData = async () => {
        if (!user?.company_id || fetchingUnread) return;
        setFetchingUnread(true);
        try {
          const res = await fetch(`/api/email/accounts?company_id=${user.company_id}`);
          const data = await res.json();
          
          if (data.accounts) {
            setEmailAccounts(data.accounts);
            if (data.accounts.length > 0 && !selectedEmailAccount) {
              setSelectedEmailAccount(data.accounts[0]);
            }

              // Fetch unread counts more reliably
              const unreadResults = [];
              for (const account of data.accounts) {
                try {
                  const res = await fetch(`/api/email/fetch?accountId=${account.id}&company_id=${user.company_id}&action=unread`);
                  if (res.ok) {
                    const data = await res.json();
                    unreadResults.push(data.unreadCount || 0);
                  } else {
                    unreadResults.push(0);
                  }
                  } catch (e: any) {
                    if (e.name === 'TypeError' && e.message.includes('fetch')) {
                      unreadResults.push(0);
                      continue;
                    }
                    console.error(`Error fetching unread for ${account.email}:`, e);
                    unreadResults.push(0);
                  }
              }
            
            const totalUnread = unreadResults.reduce((sum, count) => sum + count, 0);
            setUnreadEmailCount(totalUnread);
          }
        } catch (error) {
          console.error("Error fetching email data:", error);
        } finally {
          setFetchingUnread(false);
        }
      };

      fetchAdminNotifications();
      fetchEmailData();
      
      const interval = setInterval(() => {
        fetchAdminNotifications();
        fetchEmailData();
      }, 60000); 
      return () => clearInterval(interval);
    }, [user?.company_id]);

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

  useEffect(() => {
    const savedSurah = localStorage.getItem('quran_last_surah');
    if (savedSurah) {
      setCurrentSurahIndex(parseInt(savedSurah));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quran_last_surah', currentSurahIndex.toString());
  }, [currentSurahIndex]);

  const playSurah = (index: number) => {
    const surah = SURAHS[index];
    const surahNum = surah.number.toString().padStart(3, "0");
    const url = `https://server8.mp3quran.net/afs/${surahNum}.mp3`;
    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.play();
      setIsPlaying(true);
      setCurrentSurahIndex(index);
    }
  };

    const fetchEmails = async (accountId: string, folder: string = "INBOX") => {
      if (!user?.company_id) return;
      setLoadingEmails(true);
      setActiveEmailFolder(folder);
      try {
        const res = await fetch(`/api/email/fetch?accountId=${accountId}&company_id=${user.company_id}&folder=${folder}&limit=30`);
        const data = await res.json();
        if (data.emails) {
          setEmails(data.emails);
        } else if (data.error) {
          toast.error(data.error);
          setEmails([]);
        }
      } catch (error) {
        console.error("Error fetching emails:", error);
        toast.error(isRTL ? "خطأ في جلب الرسائل" : "Error fetching emails");
        setEmails([]);
      } finally {
        setLoadingEmails(false);
      }
    };


    const handleSelectAccount = (account: EmailAccount) => {
      setSelectedEmailAccount(account);
      fetchEmails(account.id, "INBOX");
    };

    const handleAddAccount = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!user?.company_id) return;
      setIsAddingAccount(true);
      const formData = new FormData(e.currentTarget);
      const accountData = {
        company_id: user.company_id,
        email: formData.get("email"),
        password: formData.get("password"),
        provider: formData.get("provider"),
        imap_host: formData.get("imap_host"),
        imap_port: parseInt(formData.get("imap_port") as string || "993"),
        smtp_host: formData.get("smtp_host"),
        smtp_port: parseInt(formData.get("smtp_port") as string || "465"),
      };

      try {
        const res = await fetch("/api/email/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(accountData),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(isRTL ? "تم إضافة الحساب بنجاح" : "Account added successfully");
          setEmailAccounts([...emailAccounts, data.account]);
          setShowEmailSettings(false);
        } else {
          toast.error(data.error || (isRTL ? "حدث خطأ" : "An error occurred"));
        }
      } catch (error) {
        toast.error(isRTL ? "خطأ في الاتصال" : "Connection error");
      } finally {
        setIsAddingAccount(false);
      }
    };

    const handleDeleteAccount = async (id: string) => {
      if (!user?.company_id || !confirm(isRTL ? "هل أنت متأكد من حذف هذا الحساب؟" : "Are you sure you want to delete this account?")) return;
      try {
        const res = await fetch(`/api/email/accounts?id=${id}&company_id=${user.company_id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          toast.success(isRTL ? "تم حذف الحساب" : "Account deleted");
          setEmailAccounts(emailAccounts.filter(a => a.id !== id));
          if (selectedEmailAccount?.id === id) {
            setSelectedEmailAccount(emailAccounts.find(a => a.id !== id) || null);
            setEmails([]);
          }
        } else {
          toast.error(data.error);
        }
      } catch (error) {
        toast.error(isRTL ? "خطأ في الحذف" : "Error deleting account");
      }
    };

    useEffect(() => {
      if (showEmailModal && selectedEmailAccount && emails.length === 0) {
        fetchEmails(selectedEmailAccount.id);
      }
    }, [showEmailModal, selectedEmailAccount]);

    const handleSurahEnded = () => {
    const newIndex = (currentSurahIndex + 1) % SURAHS.length;
    setCurrentSurahIndex(newIndex);
    playSurah(newIndex);
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

  const resetAndStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentSurahIndex(0);
      localStorage.setItem('quran_last_surah', '0');
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
      const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn-nu-latn', {
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
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL}/driver/`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const fetchSubscriptionData = async () => {
    try {
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      if (data.success) {
        setAvailablePlans(data.plans);
        setBankAccounts(data.bankAccounts);
        setCurrentPlanDetails(data.currentSubscription);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showPaymentModal) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/subscriptions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: showPaymentModal.plan.id,
          bank_account_id: formData.get('bank_account_id'),
          receipt_image: receiptImage,
          request_type: showPaymentModal.type,
          notes: formData.get('notes')
        })
      });

      const result = await res.json();
      if (result.success) {
        toast.success(isRTL ? 'تم إرسال طلب الدفع بنجاح' : 'Payment request sent successfully');
        setShowPaymentModal(null);
        setReceiptImage(null);
        setShowUpgradeModal(false);
        setShowSubscriptionModal(false);
      } else {
        toast.error(result.error || (isRTL ? 'حدث خطأ' : 'Error occurred'));
      }
    } catch (error) {
      toast.error(isRTL ? 'حدث خطأ في الاتصال' : 'Connection error');
    }
    setIsSubmitting(false);
  };

  const openSubscriptionModal = () => {
    fetchSubscriptionData();
    setShowSubscriptionModal(true);
    setShowUserDropdown(false);
  };

  const openUpgradeModal = () => {
      fetchSubscriptionData();
      setShowUpgradeModal(true);
      setShowSubscriptionModal(false);
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
          <div className="absolute inset-0 bg-transparent" />
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
                      </div>
                    )}

              </div>

                  <AnimatePresence>
                    {isSearchFocused ? (
                      <motion.div 
                        initial={{ width: 40, opacity: 0 }}
                        animate={{ width: "100%", opacity: 1 }}
                        exit={{ width: 40, opacity: 0 }}
                        className="flex-1"
                      >
                        <div className={cn(
                          "relative flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-300",
                          "bg-white/10 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                        )}>
                          <Search size={16} className="text-blue-400" />
                          <input
                            autoFocus
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={() => {
                              if (searchQuery === "") setIsSearchFocused(false);
                            }}
                            className="flex-1 !bg-transparent border-none text-white/90 text-[12px] font-medium placeholder:text-white/30 outline-none"
                          />
                          <button 
                            onClick={() => {
                              setSearchQuery("");
                              setIsSearchFocused(false);
                            }}
                            className="p-1 hover:bg-white/10 rounded-lg text-white/40"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                          {searchQuery && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute top-full mt-2 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[1000] max-h-[400px] overflow-y-auto custom-scrollbar"
                            >
                              <div className="p-2 space-y-1">
                                {(() => {
                                  const navItems = [
                                    { title: isRTL ? "لوحة التحكم" : "Dashboard", href: "/dashboard", icon: Home },
                                    { title: isRTL ? "إدارة الموظفين" : "HR Management", href: "/hr", icon: Users },
                                    { title: isRTL ? "قائمة العملاء" : "Customers List", href: "/customers", icon: Users },
                                    { title: isRTL ? "السندات المالية" : "Financial Vouchers", href: "/financial-vouchers", icon: Receipt },
                                    { title: isRTL ? "مسيرات الرواتب" : "Salary Payrolls", href: "/salary-payrolls", icon: BadgeDollarSign },
                                    { title: isRTL ? "الفواتير الضريبية" : "Tax Invoices", href: "/sales-invoices", icon: FileText },
                                    { title: isRTL ? "إدارة الأسطول" : "Fleet Management", href: "/fleet", icon: Car },
                                    { title: isRTL ? "التجارة الإلكترونية" : "E-commerce", href: "/ecommerce", icon: Store },
                                    { title: isRTL ? "العمولات الشهرية" : "Monthly Commissions", href: "/hr/commissions", icon: HandCoins },
                                    { title: isRTL ? "مركز المصروفات" : "Expenses Center", href: "/expenses", icon: BarChart3 },
                                    { title: isRTL ? "القيود اليومية" : "Journal Entries", href: "/journal-entries", icon: FileEdit },
                                    { title: isRTL ? "ملخص الأرباح والخسائر" : "Profit & Loss", href: "/profit-loss", icon: PieChart },
                                    { title: isRTL ? "مركز الحسابات" : "Accounts Center", href: "/accounts", icon: BookOpen },
                                    { title: isRTL ? "مراكز التكلفة" : "Cost Centers", href: "/cost-centers", icon: Landmark },
                                    { title: isRTL ? "إعدادات النظام" : "System Settings", href: "/settings", icon: Settings },
                                    { title: isRTL ? "الملف الشخصي" : "User Profile", href: "/user_profile", icon: UserCircle },
                                  ];

                                  const filteredResults = navItems.filter(item => 
                                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    item.href.toLowerCase().includes(searchQuery.toLowerCase())
                                  );

                                  if (filteredResults.length === 0) {
                                    return (
                                      <div className="p-8 text-center">
                                        <Search size={32} className="mx-auto mb-2 text-white/10" />
                                        <p className="text-sm text-white/30">{isRTL ? "لا توجد نتائج" : "No results found"}</p>
                                      </div>
                                    );
                                  }

                                  return filteredResults.map((item, idx) => (
                                    <motion.button
                                      key={item.href}
                                      whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                      onClick={() => {
                                        router.push(item.href);
                                        setSearchQuery("");
                                        setIsSearchFocused(false);
                                      }}
                                      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                                    >
                                      <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                        <item.icon size={16} />
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm font-bold text-white/90">{item.title}</p>
                                        <p className="text-[10px] text-white/30 font-mono">{item.href}</p>
                                      </div>
                                    </motion.button>
                                  ));
                                })()}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setIsSearchFocused(true)}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 text-white/40 hover:text-blue-400"
                      >
                        <Search size={20} />
                      </motion.button>
                    )}
                  </AnimatePresence>


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
                      <LanguageSwitcher />

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative hidden sm:flex items-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10"
                      >
                        <Bell size={18} className="text-white/60" />
                        <span className="text-[11px] font-bold text-white/60">{isRTL ? 'الإشعارات' : 'Notifications'}</span>
                        {unreadAdminCount > 0 && (
                          <motion.span 
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="min-w-[18px] h-[18px] bg-gradient-to-r from-rose-500 to-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/50"
                          >
                            {unreadAdminCount > 9 ? '9+' : unreadAdminCount}
                          </motion.span>
                          )}
                        </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPrayerModal(!showPrayerModal)}
                      className="relative hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 rounded-xl transition-all border border-emerald-500/20"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                        <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm.5-11H11v5l4.28 2.54.72-1.21-3.5-2.08V8z" fill="currentColor"/>
                      </svg>
                      <span className="text-[11px] font-bold text-emerald-400">{isRTL ? 'أوقات الصلاة' : 'Prayer Times'}</span>
                      {nextPrayer && (
                        <span className="min-w-[20px] h-[20px] bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {nextPrayer.remaining.replace(/[سد]/g, '').trim().split(' ')[0]}
                        </span>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowQuranPlayer(!showQuranPlayer)}
                      className={cn(
                        "relative hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border",
                        isPlaying 
                          ? "bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-500/30"
                          : "bg-gradient-to-br from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border-amber-500/20"
                      )}
                    >
                      <BookOpen size={18} className="text-amber-400" />
                      <span className="text-[11px] font-bold text-amber-400">{isRTL ? 'المصحف الشريف' : 'Holy Quran'}</span>
                      {isPlaying && (
                        <motion.span 
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="w-3 h-3 bg-amber-500 rounded-full"
                        />
                      )}
                    </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowEmailModal(true)}
                        className="relative hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 rounded-xl transition-all border border-blue-500/20"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-400">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                        </svg>
                        <span className="text-[11px] font-bold text-blue-400">{isRTL ? 'البريد' : 'Email'}</span>
                        {unreadEmailCount > 0 && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg border border-white/20"
                          >
                            {unreadEmailCount > 9 ? '9+' : unreadEmailCount}
                          </motion.span>
                        )}
                      </motion.button>

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
                            <p className="text-[11px] font-bold text-white/90">{user?.role === "admin" ? (isRTL ? "مدير النظام" : "System Admin") : (isRTL ? "مدير منشأة" : "Manager")}</p>
                          </div>

                      <ChevronDown size={14} className={cn(
                        "text-white/40 transition-transform",
                        showUserDropdown && "rotate-180"
                      )} />
                    </motion.button>
                    
                    <audio ref={audioRef} onEnded={handleSurahEnded} />
                  </div>
              </div>
            </div>
          </div>
        </header>

        {/* Prayer Times Modal */}
        <AnimatePresence>
          {showPrayerModal && prayerTimes && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPrayerModal(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/20"
              >
                <button 
                  onClick={() => setShowPrayerModal(false)}
                  className="absolute top-4 left-4 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all z-10"
                >
                  <X size={20} />
                </button>
                
                <div className="p-6 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-emerald-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/30">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">{isRTL ? 'أوقات الصلاة' : 'Prayer Times'}</h3>
                      <p className="text-sm text-emerald-400">{location}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
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
                        "flex items-center justify-between p-4 rounded-2xl transition-all",
                        nextPrayer?.name === prayer.name 
                          ? "bg-emerald-500/20 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/20" 
                          : "bg-white/5 hover:bg-white/10 border border-white/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{prayer.icon}</span>
                        <span className="text-sm font-bold text-white">{prayer.name}</span>
                      </div>
                      <span className={cn(
                        "text-lg font-bold",
                        nextPrayer?.name === prayer.name ? "text-emerald-400" : "text-white/60"
                      )}>{prayer.time}</span>
                    </div>
                  ))}
                </div>
                {nextPrayer && (
                  <div className="p-4 border-t border-white/10 bg-emerald-500/10">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">{isRTL ? 'الصلاة القادمة' : 'Next Prayer'}</span>
                      <span className="text-sm font-bold text-emerald-400">{nextPrayer.name} - {isRTL ? `بعد ${nextPrayer.remaining}` : `in ${nextPrayer.remaining}`}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Quran Player Modal */}
        <AnimatePresence>
          {showQuranPlayer && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowQuranPlayer(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-amber-500/20"
              >
                <button 
                  onClick={() => setShowQuranPlayer(false)}
                  className="absolute top-4 left-4 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all z-10"
                >
                  <X size={20} />
                </button>
                
                <div className="p-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/30">
                      <BookOpen size={28} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">{isRTL ? 'القرآن الكريم' : 'Holy Quran'}</h3>
                      <p className="text-sm text-amber-400">{isRTL ? 'مشاري العفاسي' : 'Mishary Alafasy'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-center mb-6">
                    <p className="text-2xl font-bold text-white mb-1">{SURAHS[currentSurahIndex].name}</p>
                    <p className="text-sm text-white/50">{SURAHS[currentSurahIndex].englishName}</p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={prevSurah}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                    >
                      <SkipBack size={24} className="text-white/70" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={togglePlay}
                      className="p-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-xl shadow-amber-500/40"
                    >
                      {isPlaying ? <Pause size={32} className="text-white" /> : <Play size={32} className="text-white" />}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={nextSurah}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                    >
                      <SkipForward size={24} className="text-white/70" />
                    </motion.button>
                    </div>
                    
                    {/* Volume Control */}
                    <div className="flex items-center gap-3 mb-6 px-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (volume > 0) {
                            setPrevVolume(volume);
                            setVolume(0);
                          } else {
                            setVolume(prevVolume || 0.5);
                          }
                        }}
                        className="text-amber-400 p-1 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
                      </motion.button>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full relative group cursor-pointer">
                        <motion.div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                          style={{ width: `${volume * 100}%` }}
                        />
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.01" 
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <motion.div 
                          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] border-2 border-amber-500"
                          style={{ left: `${volume * 100}%`, x: '-50%' }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-white/40 w-8">{Math.round(volume * 100)}%</span>
                    </div>
                    
                    <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetAndStop}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-2xl transition-all text-red-400 hover:text-red-300 border border-red-500/20"
                  >
                    <Square size={18} />
                    <span className="text-sm font-bold">{isRTL ? 'إيقاف والبدء من جديد' : 'Stop & Reset'}</span>
                  </motion.button>
                </div>
                
                <div className="p-4 border-t border-white/10 max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-white/40">{isRTL ? 'سور القرآن الكريم (114 سورة)' : 'Quran Surahs (114)'}</p>
                    <p className="text-xs text-amber-400">{currentSurahIndex + 1}/114</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {SURAHS.map((surah, i) => (
                      <button
                        key={surah.number}
                        onClick={() => { setCurrentSurahIndex(i); playSurah(i); }}
                        className={cn(
                          "text-right p-2 rounded-xl transition-all text-xs",
                          currentSurahIndex === i 
                            ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30" 
                            : "bg-white/5 hover:bg-white/10 text-white/60 border border-white/5"
                        )}
                      >
                        <span className="text-white/30 text-[10px]">{surah.number}.</span> {surah.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Notifications Modal */}
        <AnimatePresence>
          {showNotifications && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowNotifications(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
              >
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="absolute top-4 left-4 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all z-10"
                >
                  <X size={20} />
                </button>
                
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-blue-500/30">
                      <Bell size={28} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">{isRTL ? 'تنبيهات النظام' : 'System Alerts'}</h3>
                      <p className="text-sm text-white/40">{isRTL ? `لديك ${unreadAdminCount} تنبيهات جديدة` : `You have ${unreadAdminCount} new alerts`}</p>
                    </div>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
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
                          
                          // Trigger the detailed notification view
                          window.dispatchEvent(new CustomEvent("open-admin-notification", { 
                            detail: { notification: notif } 
                          }));
                          
                          setShowNotifications(false);
                        }}
                      >

                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/20">
                          <Bell size={16} className="text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white/90">{notif.title}</p>
                            <p className="text-xs text-white/40">{new Date(notif.created_at).toLocaleDateString('en-US')}</p>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="p-16 text-center">
                      <Bell size={48} className="mx-auto mb-3 text-white/20" />
                      <p className="text-sm font-bold text-white/30">{isRTL ? 'لا توجد تنبيهات' : 'No alerts'}</p>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-white/10">
                  <button 
                    onClick={() => {
                      if (user?.role === 'admin') router.push('/admin/notifications');
                      setShowNotifications(false);
                    }}
                    className="w-full py-3 text-center text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 rounded-xl hover:bg-blue-500/20"
                  >
                    {isRTL ? 'عرض جميع التنبيهات' : 'View All Alerts'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* User Dropdown Modal */}
        <AnimatePresence>
          {showUserDropdown && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowUserDropdown(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-white/10 max-h-[90vh] overflow-y-auto"
              >
                <button 
                  onClick={() => setShowUserDropdown(false)}
                  className="absolute top-4 left-4 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all z-10"
                >
                  <X size={20} />
                </button>
                
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                      <User size={32} className="text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{user?.name}</p>
                      <p className="text-sm text-white/40">{user?.email}</p>
                      <p className="text-xs text-white/30 mt-1">
                        {user?.role === "admin" ? (isRTL ? "مدير النظام" : "System Admin") : (isRTL ? "مدير منشأة" : "Facility Manager")}
                      </p>
                    </div>
                  </div>
                </div>
                  
                {user?.role !== 'admin' && subscriptionData && (
                  <div className="p-4 border-b border-white/10">
                    <div className={cn(
                      "p-4 rounded-2xl",
                      subscriptionData.isActive && subscriptionData.daysRemaining > 7
                        ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
                        : subscriptionData.isActive && subscriptionData.daysRemaining > 0
                        ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                        : "bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20"
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Package size={18} className="text-amber-400" />
                          <span className="text-sm font-bold text-white">{isRTL ? 'باقتك الحالية' : 'Your Plan'}</span>
                        </div>
                        <Crown size={20} className={cn(
                          subscriptionData.isActive ? "text-amber-400" : "text-red-400"
                        )} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={cn(
                            "text-lg font-bold",
                            subscriptionData.isActive ? "text-emerald-400" : "text-red-400"
                          )}>
                            {subscriptionData.isActive 
                              ? `${subscriptionData.daysRemaining} ${isRTL ? 'يوم متبقي' : 'days left'}`
                              : isRTL ? 'غير مشترك' : 'Not Subscribed'}
                          </p>
                          {subscriptionData.endDate && (
                            <p className="text-xs text-white/40 mt-1">
                              {isRTL ? 'تنتهي في: ' : 'Expires: '}{new Date(subscriptionData.endDate).toLocaleDateString( 'en-US' )}
                            </p>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={openSubscriptionModal}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                        >
                          <Info size={16} className="text-white/60" />
                        </motion.button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openUpgradeModal}
                        className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-xl text-purple-400 text-sm font-bold border border-purple-500/20 transition-all"
                      >
                        <Zap size={16} />
                        {isRTL ? 'ترقية الباقة' : 'Upgrade'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={openSubscriptionModal}
                        className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 rounded-xl text-emerald-400 text-sm font-bold border border-emerald-500/20 transition-all"
                      >
                        <RefreshCw size={16} />
                        {isRTL ? 'تجديد' : 'Renew'}
                      </motion.button>
                    </div>
                  </div>
                )}

                    <div className="p-3 space-y-1">
                        <motion.button
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                          onClick={() => { router.push("/user_profile"); setShowUserDropdown(false); }}
                          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/70 hover:text-white transition-colors"
                        >
                          <div className="p-2 rounded-xl bg-blue-500/20">
                            <Building2 size={18} className="text-blue-400" />
                          </div>
                          <span className="text-sm font-bold">{t('userProfile')}</span>
                        </motion.button>

                      {user?.role !== 'admin' && (
                          <motion.button
                            whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                            onClick={() => { router.push("/subscriptions"); setShowUserDropdown(false); }}
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/70 hover:text-white transition-colors"
                          >
                            <div className="p-2 rounded-xl bg-amber-500/20">
                              <Package size={18} className="text-amber-400" />
                            </div>
                            <span className="text-sm font-bold">{t('mySubscription')}</span>
                          </motion.button>
                        )}
                      
                        <motion.button
                          whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                          onClick={() => { router.push("/settings"); setShowUserDropdown(false); }}
                          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-white/70 hover:text-white transition-colors"
                        >
                        <div className="p-2 rounded-xl bg-slate-500/20">
                          <Settings size={18} className="text-slate-400" />
                        </div>
                        <span className="text-sm font-bold">{isRTL ? 'إعدادات النظام' : 'System Settings'}</span>
                      </motion.button>
                    </div>
                
                <div className="p-3 border-t border-white/10">
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl bg-red-500/10 text-rose-400 hover:text-rose-300 transition-all border border-red-500/20"
                  >
                    <LogOut size={20} />
                    <span className="text-sm font-bold">{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Subscription Details Modal */}
        <AnimatePresence>
          {showSubscriptionModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSubscriptionModal(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-amber-500/20 max-h-[90vh] overflow-y-auto"
              >
                <button 
                  onClick={() => setShowSubscriptionModal(false)}
                  className="absolute top-4 left-4 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all z-10"
                >
                  <X size={20} />
                </button>
                
                <div className="p-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/30">
                      <Crown size={32} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">{isRTL ? 'تفاصيل الاشتراك' : 'Subscription Details'}</h3>
                      <p className="text-sm text-amber-400">{isRTL ? 'إدارة باقتك وتجديدها' : 'Manage and renew your plan'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {subscriptionData && (
                    <div className={cn(
                      "p-5 rounded-2xl",
                      subscriptionData.isActive 
                        ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
                        : "bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20"
                    )}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-3 rounded-xl",
                            subscriptionData.isActive ? "bg-emerald-500/20" : "bg-red-500/20"
                          )}>
                            <Shield size={24} className={subscriptionData.isActive ? "text-emerald-400" : "text-red-400"} />
                          </div>
                          <div>
                            <p className="font-bold text-white">{isRTL ? 'حالة الاشتراك' : 'Status'}</p>
                            <p className={cn(
                              "text-sm font-bold",
                              subscriptionData.isActive ? "text-emerald-400" : "text-red-400"
                            )}>
                              {subscriptionData.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                            </p>
                          </div>
                        </div>
                        {subscriptionData.isActive && (
                          <div className="text-left">
                            <p className="text-3xl font-black text-white">{subscriptionData.daysRemaining}</p>
                            <p className="text-xs text-white/40">{isRTL ? 'يوم متبقي' : 'days left'}</p>
                          </div>
                        )}
                      </div>
                      
                      {currentPlanDetails && (
                        <div className="space-y-3 pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/50">{isRTL ? 'اسم الباقة' : 'Plan Name'}</span>
                            <span className="text-sm font-bold text-white">{currentPlanDetails.plan_name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/50">{isRTL ? 'السعر' : 'Price'}</span>
                            <span className="text-sm font-bold text-amber-400">{currentPlanDetails.plan_price} {isRTL ? 'ر.س' : 'SAR'}</span>
                          </div>
                          {subscriptionData.endDate && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/50">{isRTL ? 'تاريخ الانتهاء' : 'End Date'}</span>
                              <span className="text-sm font-bold text-white">{new Date(subscriptionData.endDate).toLocaleDateString( 'en-US' )}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {currentPlanDetails?.features && (
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Star size={20} className="text-amber-400" />
                        <p className="font-bold text-white">{isRTL ? 'مميزات الباقة' : 'Plan Features'}</p>
                      </div>
                      <div className="space-y-2">
                        {(currentPlanDetails.features || '').split(',').map((feature: string, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            <span className="text-sm text-white/70">{feature.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (currentPlanDetails) {
                          setShowPaymentModal({ 
                            plan: { 
                              id: currentPlanDetails.plan_id, 
                              name: currentPlanDetails.plan_name,
                              price: currentPlanDetails.plan_price,
                              duration_value: currentPlanDetails.duration_value || 30,
                              duration_unit: currentPlanDetails.duration_unit || 'day'
                            }, 
                            type: 'renewal' 
                          });
                        }
                      }}
                      className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all"
                    >
                      <RefreshCw size={18} />
                      {isRTL ? 'تجديد الباقة' : 'Renew Plan'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openUpgradeModal}
                      className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white text-sm font-bold shadow-lg shadow-purple-500/30 transition-all"
                    >
                      <Zap size={18} />
                      {isRTL ? 'ترقية الباقة' : 'Upgrade Plan'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Upgrade Plans Modal */}
        <AnimatePresence>
          {showUpgradeModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowUpgradeModal(false)}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-purple-500/20 max-h-[90vh] overflow-y-auto"
              >
                <button 
                  onClick={() => setShowUpgradeModal(false)}
                  className="absolute top-4 left-4 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all z-10"
                >
                  <X size={20} />
                </button>
                
                <div className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30">
                      <Zap size={32} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">{isRTL ? 'ترقية الباقة' : 'Upgrade Plan'}</h3>
                      <p className="text-sm text-purple-400">{isRTL ? 'اختر الباقة المناسبة لاحتياجاتك' : 'Choose the plan that fits your needs'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid gap-4">
                    {availablePlans.map((plan, index) => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "p-5 rounded-2xl border transition-all cursor-pointer",
                          index === 1 
                            ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 ring-2 ring-amber-500/20"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-3 rounded-xl",
                              index === 1 ? "bg-amber-500/20" : "bg-white/10"
                            )}>
                              <Package size={24} className={index === 1 ? "text-amber-400" : "text-white/60"} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-white text-lg">{plan.name}</p>
                                {index === 1 && (
                                  <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                                    {isRTL ? 'الأكثر طلباً' : 'Popular'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-white/40">
                                {plan.duration_value} {plan.duration_unit === 'day' ? (isRTL ? 'يوم' : 'days') : plan.duration_unit === 'month' ? (isRTL ? 'شهر' : 'months') : (isRTL ? 'سنة' : 'years')}
                              </p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-2xl font-black text-white">{plan.price}</p>
                            <p className="text-xs text-white/40">{isRTL ? 'ر.س' : 'SAR'}</p>
                          </div>
                        </div>
                        
                        {plan.description && (
                          <p className="text-sm text-white/50 mb-4">{plan.description}</p>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowPaymentModal({ plan, type: 'upgrade' })}
                          className={cn(
                            "w-full py-3 rounded-xl font-bold text-sm transition-all",
                            index === 1
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                              : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                          )}
                        >
                          {isRTL ? 'اختيار هذه الباقة' : 'Choose This Plan'}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => { setShowPaymentModal(null); setReceiptImage(null); }}
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/20 max-h-[90vh] overflow-y-auto"
              >
                <button 
                  onClick={() => { setShowPaymentModal(null); setReceiptImage(null); }}
                  className="absolute top-4 left-4 p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all z-10"
                >
                  <X size={20} />
                </button>
                
                <div className="p-6 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-emerald-500/20">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30">
                      <Landmark size={32} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-xl">{isRTL ? 'إتمام الدفع' : 'Complete Payment'}</h3>
                      <p className="text-sm text-emerald-400">
                        {showPaymentModal.type === 'renewal' ? (isRTL ? 'تجديد الباقة' : 'Plan Renewal') : 
                         showPaymentModal.type === 'upgrade' ? (isRTL ? 'ترقية الباقة' : 'Plan Upgrade') : 
                         (isRTL ? 'اشتراك جديد' : 'New Subscription')}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmitPayment} className="p-6 space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package size={20} className="text-amber-400" />
                        <span className="font-bold text-white">{showPaymentModal.plan.name}</span>
                      </div>
                      <span className="text-lg font-black text-amber-400">{showPaymentModal.plan.price} {isRTL ? 'ر.س' : 'SAR'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-3">{isRTL ? 'اختر الحساب البنكي للتحويل' : 'Select Bank Account'}</label>
                    <div className="space-y-2">
                      {bankAccounts.map((bank) => (
                        <label key={bank.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-all">
                          <input type="radio" name="bank_account_id" value={bank.id} required className="w-4 h-4 accent-emerald-500" />
                          <div className="flex-1">
                            <p className="font-bold text-white text-sm">{bank.bank_name}</p>
                            <p className="text-xs text-white/40">{bank.account_holder}</p>
                            <p className="text-xs text-emerald-400 font-mono mt-1">{bank.iban}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-3">{isRTL ? 'إرفاق إيصال الدفع' : 'Upload Receipt'}</label>
                    <div className={cn(
                      "relative p-6 rounded-2xl border-2 border-dashed transition-all text-center",
                      receiptImage ? "border-emerald-500/50 bg-emerald-500/10" : "border-white/20 bg-white/5 hover:border-white/30"
                    )}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      {receiptImage ? (
                        <div className="space-y-3">
                          <img src={receiptImage} alt="Receipt" className="max-h-32 mx-auto rounded-lg" />
                          <p className="text-sm text-emerald-400 font-bold">{isRTL ? 'تم رفع الإيصال بنجاح' : 'Receipt uploaded'}</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Upload size={32} className="mx-auto text-white/30" />
                          <p className="text-sm text-white/50">{isRTL ? 'اضغط لرفع صورة الإيصال' : 'Click to upload receipt'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">{isRTL ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}</label>
                    <textarea 
                      name="notes"
                      rows={2}
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-emerald-500/50 focus:ring-0 outline-none resize-none"
                      placeholder={isRTL ? 'أي ملاحظات إضافية...' : 'Any additional notes...'}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="text-blue-400 mt-0.5" />
                      <p className="text-xs text-blue-400/80">
                        {isRTL 
                          ? 'سيتم مراجعة طلبك وتفعيل الاشتراك خلال 24 ساعة من التحقق من الدفع'
                          : 'Your request will be reviewed and activated within 24 hours of payment verification'}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl text-white font-bold shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        {isRTL ? 'جاري الإرسال...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={20} />
                        {isRTL ? 'إرسال طلب الدفع' : 'Submit Payment Request'}
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}
          </AnimatePresence>
  
            {/* Email Modal */}
            <AnimatePresence>
              {showEmailModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowEmailModal(false)}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md"
                  />
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1, 
                      y: 0,
                      width: isEmailMaximized ? "98vw" : "100%",
                      height: isEmailMaximized ? "95vh" : "80vh",
                      maxWidth: isEmailMaximized ? "none" : "1024px"
                    }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-blue-500/20 flex flex-col transition-all duration-300"
                  >
                    {/* Modal Header */}
                    <div className="p-4 md:p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-white/10 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-blue-500/20">
                          <Mail size={24} className="text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg md:text-xl">
                            {showEmailSettings ? (isRTL ? 'إعدادات البريد' : 'Email Settings') : (isRTL ? 'بريد الشركة' : 'Company Email')}
                          </h3>
                          <p className="text-sm text-blue-400 truncate max-w-[200px]">
                            {showEmailSettings ? (isRTL ? 'إدارة الحسابات' : 'Manage Accounts') : (selectedEmailAccount?.email || (isRTL ? 'اختر حساباً' : 'Select an account'))}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowEmailSettings(!showEmailSettings)}
                          className={cn(
                            "p-2.5 rounded-xl transition-all border",
                            showEmailSettings 
                              ? "bg-blue-500 text-white border-blue-400" 
                              : "bg-white/5 text-white/40 hover:text-white border-white/10"
                          )}
                          title={isRTL ? "الإعدادات" : "Settings"}
                        >
                          <Settings size={20} />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEmailMaximized(!isEmailMaximized)}
                          className="p-2.5 bg-white/5 text-white/40 hover:text-white rounded-xl transition-all border border-white/10"
                        >
                          {isEmailMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </motion.button>

                        {!showEmailSettings && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => selectedEmailAccount && fetchEmails(selectedEmailAccount.id, activeEmailFolder)}
                            className="p-2.5 bg-white/5 text-white/40 hover:text-white rounded-xl transition-all border border-white/10"
                          >
                            <RefreshCw size={20} className={loadingEmails ? "animate-spin" : ""} />
                          </motion.button>
                        )}
                        
                        <button 
                          onClick={() => setShowEmailModal(false)}
                          className="p-2.5 bg-white/5 text-white/30 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/10"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
    
                    <div className="flex-1 flex overflow-hidden">
                      {/* Left Sidebar: Folders & Accounts */}
                      <div className="w-20 md:w-64 border-l border-white/5 bg-black/20 flex flex-col shrink-0">
                        {/* Accounts Section */}
                        <div className="p-4 border-b border-white/5">
                          <p className="hidden md:block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-2">
                            {isRTL ? 'الحسابات' : 'Accounts'}
                          </p>
                          <div className="space-y-2">
                            {emailAccounts.map((account) => (
                              <button
                                key={account.id}
                                onClick={() => handleSelectAccount(account)}
                                className={cn(
                                  "w-full flex items-center gap-3 p-2 md:p-3 rounded-xl transition-all",
                                  selectedEmailAccount?.id === account.id 
                                    ? "bg-blue-500/20 border border-blue-500/30 text-white" 
                                    : "hover:bg-white/5 text-white/40 border border-transparent"
                                )}
                              >
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                  selectedEmailAccount?.id === account.id ? "bg-blue-500 text-white" : "bg-white/10"
                                )}>
                                  <AtSign size={14} />
                                </div>
                                <div className="hidden md:block flex-1 min-w-0 text-right">
                                  <p className="text-xs font-bold truncate">{account.email}</p>
                                  <p className="text-[10px] opacity-40 uppercase">{account.provider}</p>
                                </div>
                              </button>
                            ))}
                            {emailAccounts.length === 0 && (
                              <button 
                                onClick={() => setShowEmailSettings(true)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                              >
                                <Plus size={16} className="mx-auto md:mx-0" />
                                <span className="hidden md:block text-xs font-bold">{isRTL ? 'أضف حساب' : 'Add Account'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Folders Section */}
                        {!showEmailSettings && selectedEmailAccount && (
                          <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                            <p className="hidden md:block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-2">
                              {isRTL ? 'المجلدات' : 'Folders'}
                            </p>
                            {[
                              { id: "INBOX", name: isRTL ? "صندوق الوارد" : "Inbox", icon: Inbox, color: "text-blue-400" },
                              { id: "Sent", name: isRTL ? "المرسل" : "Sent", icon: Send, color: "text-emerald-400" },
                              { id: "Trash", name: isRTL ? "المحذوفات" : "Trash", icon: Trash2, color: "text-rose-400" },
                              { id: "Spam", name: isRTL ? "الرسائل المزعجة" : "Spam", icon: AlertTriangle, color: "text-amber-400" },
                            ].map((folder) => (
                              <button
                                key={folder.id}
                                onClick={() => fetchEmails(selectedEmailAccount.id, folder.id)}
                                className={cn(
                                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                                  activeEmailFolder === folder.id 
                                    ? "bg-white/10 text-white shadow-sm" 
                                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                )}
                              >
                                <folder.icon size={18} className={cn(activeEmailFolder === folder.id ? folder.color : "text-inherit")} />
                                <span className="hidden md:block text-sm font-medium">{folder.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
    
                      {/* Main Content Area */}
                      <div className="flex-1 flex flex-col min-w-0 bg-white/[0.02]">
                        {showEmailSettings ? (
                          /* Settings View */
                          <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-2xl mx-auto space-y-8">
                              {/* Account Management */}
                              <section>
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                  <Settings size={20} className="text-blue-400" />
                                  {isRTL ? 'إدارة الحسابات' : 'Account Management'}
                                </h4>
                                <div className="grid gap-3">
                                  {emailAccounts.map(account => (
                                    <div key={account.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl group">
                                      <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                          <Mail size={20} className="text-blue-400" />
                                        </div>
                                        <div>
                                          <p className="font-bold text-white text-sm">{account.email}</p>
                                          <p className="text-xs text-white/40">{account.provider} • IMAP: {account.is_active ? (isRTL ? 'متصل' : 'Connected') : (isRTL ? 'فشل الاتصال' : 'Connection Failed')}</p>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => handleDeleteAccount(account.id)}
                                        className="p-2 text-white/20 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </section>

                              {/* Add New Account Form */}
                              <section className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                                <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                  <PlusCircle size={20} className="text-emerald-400" />
                                  {isRTL ? 'إضافة حساب جديد' : 'Add New Account'}
                                </h4>
                                <form onSubmit={handleAddAccount} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold text-white/50 px-1">{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</label>
                                      <input 
                                        name="email" 
                                        type="email" 
                                        required 
                                        placeholder="user@example.com"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold text-white/50 px-1">{isRTL ? 'كلمة المرور' : 'Password'}</label>
                                      <input 
                                        name="password" 
                                        type="password" 
                                        required 
                                        placeholder="••••••••"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-bold text-white/50 px-1">{isRTL ? 'مزود الخدمة' : 'Provider'}</label>
                                      <select 
                                        name="provider" 
                                        defaultValue="hostinger"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
                                      >
                                        <option value="hostinger">Hostinger</option>
                                        <option value="gmail">Gmail</option>
                                        <option value="outlook">Outlook</option>
                                        <option value="custom">Custom IMAP/SMTP</option>
                                      </select>
                                    </div>
                                    <div className="flex items-end">
                                      <button 
                                        type="submit" 
                                        disabled={isAddingAccount}
                                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                                      >
                                        {isAddingAccount ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} />}
                                        {isRTL ? 'حفظ الحساب' : 'Save Account'}
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              </section>
                            </div>
                          </div>
                        ) : (
                          /* Messages List View */
                          <div className="flex-1 flex flex-col min-w-0">
                            {loadingEmails ? (
                              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                <Loader2 size={40} className="text-blue-500 animate-spin" />
                                <p className="text-sm text-white/40">{isRTL ? 'جاري جلب الرسائل...' : 'Fetching emails...'}</p>
                              </div>
                            ) : emails.length > 0 ? (
                              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                <div className="flex items-center justify-between mb-4 px-2">
                                  <h4 className="text-sm font-bold text-white/60">
                                    {activeEmailFolder === "INBOX" ? (isRTL ? 'صندوق الوارد' : 'Inbox') : 
                                     activeEmailFolder === "Sent" ? (isRTL ? 'المرسل' : 'Sent') :
                                     activeEmailFolder === "Trash" ? (isRTL ? 'المحذوفات' : 'Trash') : (isRTL ? 'الرسائل المزعجة' : 'Spam')}
                                  </h4>
                                  <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg font-bold">
                                    {emails.length} {isRTL ? 'رسالة' : 'messages'}
                                  </span>
                                </div>
                                {emails.map((email) => (
                                  <motion.div
                                    key={email.uid}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                      "group relative p-4 rounded-2xl border transition-all cursor-pointer",
                                      !email.isRead 
                                        ? "bg-white/5 border-blue-500/30 shadow-lg shadow-blue-500/5" 
                                        : "bg-transparent border-white/5 hover:bg-white/5"
                                    )}
                                  >
                                    <div className="flex justify-between items-start gap-4 mb-1">
                                      <div className="flex items-center gap-3 min-w-0">
                                        {!email.isRead && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                        <span className="font-bold text-sm text-white/90 truncate">{email.from}</span>
                                      </div>
                                      <span className="text-[10px] text-white/30 whitespace-nowrap">
                                        {new Date(email.date).toLocaleDateString( 'en-US' )}
                                      </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-blue-400 mb-1 truncate">{email.subject}</h4>
                                    <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">{email.snippet}</p>
                                    
                                    <div className="absolute left-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white/60">
                                        <Eye size={14} />
                                      </button>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                  <Mail size={40} className="text-white/10" />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">{isRTL ? 'لا توجد رسائل' : 'No messages'}</h4>
                                <p className="text-sm text-white/30 max-w-xs">{isRTL ? 'هذا المجلد فارغ حالياً أو لم يتم جلب الرسائل بعد.' : 'This folder is currently empty or messages haven\'t been fetched yet.'}</p>
                                {!selectedEmailAccount && (
                                  <button 
                                    onClick={() => setShowEmailSettings(true)}
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-500 transition-all"
                                  >
                                    {isRTL ? 'أضف حساب بريد الآن' : 'Add Email Account Now'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

  
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
                  href={`${process.env.NEXT_PUBLIC_APP_URL}/driver/`} 
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
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${process.env.NEXT_PUBLIC_APP_URL}/driver/`} 
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
