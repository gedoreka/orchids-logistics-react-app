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
    ShieldAlert,
    ShieldX,
    ShieldCheck,
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
    PlusCircle,
    Moon,
    Sun,
    Users,
    FileWarning,
    ChevronRight,
    ChevronLeft,
    Edit3
    } from "lucide-react";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from '@/lib/locale-context';
import { LanguageSwitcher } from "./language-switcher";
import { usePrayer } from "./prayer-provider";
import { useTheme } from "next-themes";
import { applyAccentTheme } from "@/components/theme-customizer";

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

interface HrIdentityEmployee {
  id: number;
  name: string;
  name_en?: string;
  iqama_expiry: string;
  iqama_number?: string;
  package_id: number;
  package_name?: string;
  days_remaining: number;
  status: 'expired' | 'expiring_soon';
}

interface HrIncompletePackage {
  package_id: number;
  package_name: string;
  employees: { id: number; name: string; missing_fields: string[]; missing_count: number }[];
}

interface HrNotificationData {
  identity: {
    expired: HrIdentityEmployee[];
    expiring_soon: HrIdentityEmployee[];
    total_expired: number;
    total_expiring_soon: number;
  };
  incomplete: {
    packages: HrIncompletePackage[];
    total_incomplete: number;
  };
}

export function Header({ user, onToggleSidebar, unreadChatCount = 0, subscriptionData }: { user?: { name: string; role: string; email: string; company_id?: number }, onToggleSidebar?: () => void, unreadChatCount?: number, subscriptionData?: { isActive: boolean; endDate: string | null; daysRemaining: number } }) {
  const t = useTranslations('header');
  const tCommon = useTranslations('common');
  const { locale, isRTL } = useLocale();
  const { times: prayerTimesData, nextPrayer: prayerContextNext, currentTime: prayerContextTime, locationName: prayerLocation, hijriDate: prayerHijri, islamicEvent: prayerEvent, isFriday: prayerIsFriday, triggerTestAlert } = usePrayer();
  
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
  const [showPrayerModal, setShowPrayerModal] = useState(false);
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
    const [viewingEmail, setViewingEmail] = useState<EmailMessage | null>(null);
    const [loadingEmailBody, setLoadingEmailBody] = useState(false);
    
    // Compose email states
    const [showCompose, setShowCompose] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
    
    // New email notification states
    const [lastEmailCount, setLastEmailCount] = useState(0);
    const [newEmailAlert, setNewEmailAlert] = useState<{ show: boolean; count: number }>({ show: false, count: 0 });

    // HR notification states
    const [hrNotifications, setHrNotifications] = useState<HrNotificationData | null>(null);
    const [hrNotifLoading, setHrNotifLoading] = useState(false);
    const [showIdentityExpiryDetail, setShowIdentityExpiryDetail] = useState(false);
    const [showIncompleteDetail, setShowIncompleteDetail] = useState(false);
      const [showLoginSplash, setShowLoginSplash] = useState(false);
    const [activeNotifTab, setActiveNotifTab] = useState<'system' | 'identity' | 'incomplete'>('system');
        const { resolvedTheme, setTheme: setNextTheme } = useTheme();
      const isDarkMode = resolvedTheme === "dark";

    
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
            if (!response.ok) {
              return;
            }
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              return;
            }
            const data = await response.json();
            if (data.success) {
              setAdminNotifications(data.notifications);
              
              const lastSeenId = parseInt(localStorage.getItem("last_admin_notification_id") || "0");
              const unread = data.notifications.filter((n: any) => n.id > lastSeenId).length;
              setUnreadAdminCount(unread);
            }
          } catch (error: any) {
            // Silently fail for expected errors during logout or network issues
          }
        };

        const fetchEmailData = async () => {
          if (!user?.company_id || fetchingUnread) return;
          setFetchingUnread(true);
          try {
            const res = await fetch(`/api/email/accounts?company_id=${user.company_id}`);
            if (!res.ok) {
              setFetchingUnread(false);
              return;
            }
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
              setFetchingUnread(false);
              return;
            }
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
                      const contentType = res.headers.get("content-type");
                      if (contentType && contentType.includes("application/json")) {
                        const data = await res.json();
                        unreadResults.push(data.unreadCount || 0);
                      } else {
                        unreadResults.push(0);
                      }
                    } else {
                      unreadResults.push(0);
                    }
                    } catch (e: any) {
                      unreadResults.push(0);
                      continue;
                    }
                }
              
              const totalUnread = unreadResults.reduce((sum, count) => sum + count, 0);
              setUnreadEmailCount(totalUnread);
            }
          } catch (error: any) {
            // Silently fail for expected errors during logout or network issues
          } finally {
            setFetchingUnread(false);
          }
        };

      fetchAdminNotifications();
      fetchEmailData();

      // Fetch HR notifications
      const fetchHrNotifications = async () => {
        if (!user?.company_id) return;
        try {
          const res = await fetch(`/api/hr/notifications?company_id=${user.company_id}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data.success) {
            setHrNotifications(data);
            // Show login splash if there are expired/expiring IDs and hasn't been shown this session
            const splashKey = `hr_splash_shown_${new Date().toDateString()}`;
            if (!sessionStorage.getItem(splashKey) && (data.identity.total_expired > 0 || data.identity.total_expiring_soon > 0)) {
              setTimeout(() => {
                setShowLoginSplash(true);
                sessionStorage.setItem(splashKey, 'true');
              }, 1500);
            }
          }
        } catch (error: any) {
          // Silently fail
        }
      };
      fetchHrNotifications();
      
      const interval = setInterval(() => {
        fetchAdminNotifications();
        fetchEmailData();
        fetchHrNotifications();
      }, 60000); 
      return () => clearInterval(interval);
    }, [user?.company_id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setNextTheme(isDarkMode ? "light" : "dark");
    setTimeout(applyAccentTheme, 150);
  };

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

    const handleViewEmail = async (email: EmailMessage) => {
      setViewingEmail(email);
      if (!selectedEmailAccount || !user?.company_id) return;

      // Mark as read on the server and update local state
      if (!email.isRead) {
        const markedEmail = { ...email, isRead: true };
        setViewingEmail(markedEmail);
        setEmails((prev) => prev.map((e) => (e.uid === email.uid ? { ...e, isRead: true } : e)));
        setUnreadEmailCount((prev) => Math.max(0, prev - 1));
        fetch(
          `/api/email/fetch?accountId=${selectedEmailAccount.id}&company_id=${user.company_id}&action=markread&uid=${email.uid}&folder=${email.folder}`
        ).catch(() => {});
      }

      if (email.body) return; // Already loaded
      setLoadingEmailBody(true);
      try {
        const res = await fetch(
          `/api/email/fetch?accountId=${selectedEmailAccount.id}&company_id=${user.company_id}&action=body&uid=${email.uid}&folder=${email.folder}`
        );
        const data = await res.json();
        if (data.body) {
          const updated = { ...email, body: data.body, snippet: data.snippet || "", isRead: true };
          setViewingEmail(updated);
          setEmails((prev) => prev.map((e) => (e.uid === email.uid ? updated : e)));
        }
      } catch (error) {
        console.error("Error fetching email body:", error);
      } finally {
        setLoadingEmailBody(false);
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

    // Polling for new emails when modal is open
    useEffect(() => {
      if (!showEmailModal || !selectedEmailAccount || !user?.company_id) return;

      const checkNewEmails = async () => {
        try {
          const res = await fetch(`/api/email/fetch?accountId=${selectedEmailAccount.id}&company_id=${user.company_id}&action=unread`);
          if (!res.ok) return;
          const data = await res.json();
          const newCount = data.unreadCount || 0;

          if (lastEmailCount > 0 && newCount > lastEmailCount) {
            const diff = newCount - lastEmailCount;
            setNewEmailAlert({ show: true, count: diff });

            // Play notification sound
            try {
              const audioCtx = new AudioContext();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.setValueAtTime(880, audioCtx.currentTime);
              osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);
              gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
              osc.start(audioCtx.currentTime);
              osc.stop(audioCtx.currentTime + 0.4);
            } catch {}

            setTimeout(() => setNewEmailAlert({ show: false, count: 0 }), 5000);
            fetchEmails(selectedEmailAccount.id, activeEmailFolder);
          }
          setLastEmailCount(newCount);
        } catch {}
      };

      checkNewEmails();
      const interval = setInterval(checkNewEmails, 30000);
      return () => clearInterval(interval);
    }, [showEmailModal, selectedEmailAccount, lastEmailCount]);

    const handleSendEmail = async () => {
      if (!selectedEmailAccount || !composeData.to || !composeData.subject || !user?.company_id) return;
      setSendingEmail(true);
      try {
        const res = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: selectedEmailAccount.id,
            company_id: user.company_id,
            to: composeData.to,
            subject: composeData.subject,
            body: composeData.body,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(isRTL ? 'تم إرسال البريد بنجاح' : 'Email sent successfully');
          setShowCompose(false);
          setComposeData({ to: '', subject: '', body: '' });
        } else {
          toast.error(data.error || (isRTL ? 'خطأ في الإرسال' : 'Send error'));
        }
      } catch {
        toast.error(isRTL ? 'خطأ في إرسال البريد' : 'Error sending email');
      } finally {
        setSendingEmail(false);
      }
    };

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

    const copyDriverLink = () => {
    navigator.clipboard.writeText(`https://driver.accounts.iw-om.com`);
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
    { id: 3, title: isRTL ? "تنبيه: هوية منتهية" : "Alert: Expired ID", time: isRTL ? "منذ ساعتين" : "2 hours ago", type: "warning" },
  ];

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <>
      <header className={cn(
        "sticky top-0 z-[100] w-full no-print",
        !isDarkMode && "bg-gradient-to-r from-[#dbe4ff] via-[#c7d2f8] to-[#d0d0f0]"
      )}>
          <div className="relative overflow-hidden">
            {/* Glass effect - dark mode only */}
            {isDarkMode && <div className="absolute inset-0 backdrop-blur-2xl bg-white/[0.03]" />}
            {isDarkMode && <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] via-transparent to-white/[0.04]" />}
            <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${isDarkMode ? 'bg-gradient-to-r from-transparent via-white/[0.15] to-transparent' : 'bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent'}`} />
          
          <div className="relative z-10 w-full mx-auto px-4 md:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              
              <div className="flex items-center gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onToggleSidebar}
                    className={cn("lg:hidden p-2.5 rounded-xl transition-all border", isDarkMode ? "bg-white/5 hover:bg-white/10 text-white/70 border-white/10" : "bg-white/30 hover:bg-white/50 text-indigo-700 border-indigo-200/30")}
                  >
                    <Menu size={20} />
                  </motion.button>

                    {pathname !== "/dashboard" && (
                      <div className="hidden sm:flex items-center gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.02, x: isRTL ? 3 : -3 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => router.back()}
                          className={cn("flex items-center gap-2 px-4 py-2 rounded-xl transition-all border group", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-white/30 hover:bg-white/50 border-indigo-200/30")}
                        >
                          <BackIcon size={16} className={cn("transition-transform", isDarkMode ? "text-white/60" : "text-indigo-500", isRTL ? "group-hover:translate-x-1" : "group-hover:-translate-x-1")} />
                            <span className={cn("text-[14px] font-extrabold", isDarkMode ? "text-white/60" : "text-black")}>{tCommon('back')}</span>
                        </motion.button>
                      </div>
                    )}

              </div>

<div className="flex items-center gap-2">
                      <AnimatePresence>
                        {isSearchFocused ? (
                          <motion.div
                            initial={{ width: 40, opacity: 0 }}
                            animate={{ width: 220, opacity: 1 }}
                            exit={{ width: 40, opacity: 0 }}
                            className="relative"
                          >
                            <div className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-2xl transition-all duration-300",
                              "bg-white/10 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                            )}>
                              <Search size={14} className="text-blue-400 flex-shrink-0" />
                              <input
                                autoFocus
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onBlur={() => {
                                  if (searchQuery === "") setIsSearchFocused(false);
                                }}
                                className={cn("flex-1 min-w-0 !bg-transparent border-none text-[12px] font-medium outline-none", isDarkMode ? "text-white/90 placeholder:text-white/30" : "text-black/90 placeholder:text-black/30")}
                              />
                              <button
                                onClick={() => {
                                  setSearchQuery("");
                                  setIsSearchFocused(false);
                                }}
                                className={cn("p-0.5 rounded-lg flex-shrink-0", isDarkMode ? "hover:bg-white/10 text-white/40" : "hover:bg-black/10 text-black/40")}
                              >
                                <X size={13} />
                              </button>
                            </div>

                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                              {searchQuery && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  className={cn("absolute top-full mt-2 right-0 w-72 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden z-[1000] max-h-[400px] overflow-y-auto custom-scrollbar border", isDarkMode ? "bg-slate-900/95 border-white/10" : "bg-white/95 border-violet-200/60")}
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
                                            <Search size={32} className={cn("mx-auto mb-2", isDarkMode ? "text-white/10" : "text-violet-300/40")} />
                                            <p className={cn("text-sm", isDarkMode ? "text-white/30" : "text-black/30")}>{isRTL ? "لا توجد نتائج" : "No results found"}</p>
                                          </div>
                                        );
                                      }

                                      return filteredResults.map((item) => (
                                        <motion.button
                                          key={item.href}
                                          whileHover={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(139,92,246,0.08)" }}
                                          onClick={() => {
                                            router.push(item.href);
                                            setSearchQuery("");
                                            setIsSearchFocused(false);
                                          }}
                                          className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                                        >
                                          <div className={cn("p-2 rounded-lg", isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-violet-500/15 text-violet-600")}>
                                            <item.icon size={16} />
                                          </div>
                                          <div className="text-right">
                                            <p className={cn("text-sm font-bold", isDarkMode ? "text-white/90" : "text-black/90")}>{item.title}</p>
                                            <p className={cn("text-[10px] font-mono", isDarkMode ? "text-white/30" : "text-black/30")}>{item.href}</p>
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
                            className={cn("p-2.5 rounded-2xl transition-all border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 text-white/40 hover:text-blue-400" : "bg-white/30 hover:bg-white/50 border-indigo-200/30 text-indigo-400 hover:text-indigo-600")}
                          >
                            <Search size={18} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                      <LanguageSwitcher />


                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={cn("relative hidden sm:flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-white/30 hover:bg-white/50 border-indigo-200/30")}
                      >
                      <Bell size={18} className={isDarkMode ? "text-white/60" : "text-yellow-500"} />
                              <span className={cn("text-[14px] font-extrabold", isDarkMode ? "text-white/60" : "text-black")}>{isRTL ? 'الإشعارات' : 'Notifications'}</span>
                          {(unreadAdminCount + (hrNotifications?.identity.total_expired || 0) + (hrNotifications?.identity.total_expiring_soon || 0) + (hrNotifications?.incomplete.total_incomplete || 0)) > 0 && (
                            <motion.span 
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="min-w-[18px] h-[18px] bg-gradient-to-r from-rose-500 to-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-500/50"
                            >
                              {(() => {
                                const total = unreadAdminCount + (hrNotifications?.identity.total_expired || 0) + (hrNotifications?.identity.total_expiring_soon || 0) + (hrNotifications?.incomplete.total_incomplete || 0);
                                return total > 99 ? '99+' : total;
                              })()}
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
                      <span className={cn("text-[14px] font-extrabold", isDarkMode ? "text-emerald-400" : "text-black")}>{isRTL ? 'أوقات الصلاة' : 'Prayer Times'}</span>
                      {prayerContextNext && (
                        <span className="min-w-[20px] h-[20px] bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {prayerContextNext.remaining.replace(/[سد]/g, '').trim().split(' ')[0]}
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
                        <span className={cn("text-[14px] font-extrabold", isDarkMode ? "text-amber-400" : "text-black")}>{isRTL ? 'المصحف الشريف' : 'Holy Quran'}</span>
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
                          <span className={cn("text-[14px] font-extrabold", isDarkMode ? "text-blue-400" : "text-black")}>{isRTL ? 'بريد شركتك' : 'Company Email'}</span>
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
                        <span className="text-[14px] font-extrabold text-white">{t('driverApp')}</span>
                    </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push("/chat")}
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl transition-all shadow-lg shadow-emerald-500/20 border border-emerald-400/20 relative"
                  >
                    <MessageSquare size={16} className="text-white" />
                      <span className="text-[14px] font-extrabold text-white">{t('support')}</span>
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
                      className={cn("flex items-center gap-3 px-3 py-2 rounded-xl transition-all border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10" : "bg-white/30 hover:bg-white/50 border-indigo-200/30")}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <User size={16} className="text-white" />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
                      </div>
                          <div className="hidden md:block text-right">
                            <p className={cn("text-[14px] font-extrabold", isDarkMode ? "text-white/90" : "text-black")}>{user?.role === "admin" ? (isRTL ? "مدير النظام" : "System Admin") : (isRTL ? "مدير منشأة" : "Manager")}</p>
                          </div>

                        <ChevronDown size={14} className={cn(
                          isDarkMode ? "text-white/40" : "text-black/40", "transition-transform",
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
          {showPrayerModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPrayerModal(false)}
                className={cn("absolute inset-0 backdrop-blur-md", isDarkMode ? "bg-black/70" : "bg-black/30")}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={cn(
                  "relative w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden",
                  isDarkMode 
                    ? "bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20" 
                    : "bg-gradient-to-b from-white via-violet-50/50 to-indigo-50/80 border-2 border-violet-200/60"
                )}
              >
                {/* Decorative circles - light mode */}
                {!isDarkMode && (
                  <>
                    <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-16 -translate-x-16" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full translate-y-12 -translate-x-12" />
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 rounded-full translate-y-12 translate-x-12" />
                  </>
                )}
                {!prayerTimesData ? (
                  <div className="p-12 text-center relative z-10">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className={isDarkMode ? "text-white/60" : "text-black/60"}>{isRTL ? "جاري جلب الأوقات..." : "Fetching times..."}</p>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowPrayerModal(false)}
                      className={cn("absolute top-6 left-6 p-2 rounded-full transition-all z-10", isDarkMode ? "text-white/30 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/5")}
                    >
                      <X size={20} />
                    </button>
                    
                    <div className={cn("relative z-10 p-8 border-b", isDarkMode ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/10" : "bg-gradient-to-br from-violet-100/60 to-indigo-100/60 border-violet-200/40")}>
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className={cn("absolute inset-0 rounded-full blur-xl", isDarkMode ? "bg-emerald-500" : "bg-violet-500")}
                          />
                          <div className={cn("relative p-4 rounded-3xl border", isDarkMode ? "bg-emerald-500/30 border-emerald-500/20" : "bg-violet-500/20 border-violet-300/40")}>
                            <Moon size={32} className={isDarkMode ? "text-emerald-400" : "text-violet-600"} />
                          </div>
                        </div>
                        <div>
                          <h3 className={cn("font-black text-2xl tracking-tight mb-1", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'أوقات الصلاة' : 'Prayer Times'}</h3>
                          <div className={cn("flex items-center justify-center gap-2", isDarkMode ? "text-emerald-400/80" : "text-violet-600/80")}>
                            <MapPin size={14} />
                            <span className="text-sm font-bold">{prayerLocation}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 p-6 space-y-2">
                      <div className={cn("flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b mb-2", isDarkMode ? "text-white/30 border-white/5" : "text-black/30 border-black/5")}>
                        <span>{isRTL ? 'الصلاة' : 'Prayer'}</span>
                        <span>{isRTL ? 'الوقت' : 'Time'}</span>
                      </div>
                      
                      {[
                        { id: 'fajr', name: isRTL ? "الفجر" : "Fajr", time: prayerTimesData.fajr, icon: <Moon size={18} /> },
                        { id: 'sunrise', name: isRTL ? "الشروق" : "Sunrise", time: prayerTimesData.sunrise, icon: <Sun size={18} /> },
                        { id: 'dhuhr', name: isRTL ? "الظهر" : "Dhuhr", time: prayerTimesData.dhuhr, icon: <Sun size={18} /> },
                        { id: 'asr', name: isRTL ? "العصر" : "Asr", time: prayerTimesData.asr, icon: <Sun size={18} /> },
                        { id: 'maghrib', name: isRTL ? "المغرب" : "Maghrib", time: prayerTimesData.maghrib, icon: <Moon size={18} /> },
                        { id: 'isha', name: isRTL ? "العشاء" : "Isha", time: prayerTimesData.isha, icon: <Moon size={18} /> },
                      ].map((prayer, i) => {
                        const isNext = prayerContextNext?.name === prayer.name;
                        const timeStr = prayer.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                        
                        return (
                          <motion.div 
                            key={i}
                            whileHover={{ x: isRTL ? -4 : 4 }}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-2xl transition-all border",
                              isNext 
                                ? isDarkMode 
                                  ? "bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)] scale-[1.02]"
                                  : "bg-violet-500/15 border-violet-400/40 shadow-[0_0_20px_rgba(139,92,246,0.1)] scale-[1.02]"
                                : isDarkMode 
                                  ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.05]"
                                  : "bg-white/40 border-violet-100/60 hover:bg-white/60"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "p-2 rounded-xl transition-colors",
                                isNext 
                                  ? isDarkMode ? "bg-emerald-500 text-white" : "bg-violet-500 text-white"
                                  : isDarkMode ? "bg-white/5 text-white/40" : "bg-violet-100 text-violet-500"
                              )}>
                                {prayer.icon}
                              </div>
                              <span className={cn(
                                "text-sm font-black",
                                isNext 
                                  ? isDarkMode ? "text-white" : "text-black"
                                  : isDarkMode ? "text-white/60" : "text-black/70"
                              )}>{prayer.name}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={cn(
                                "text-lg font-black tracking-tighter",
                                isNext 
                                  ? isDarkMode ? "text-emerald-400" : "text-violet-600"
                                  : isDarkMode ? "text-white/80" : "text-black/80"
                              )}>{timeStr}</span>
                              {isNext && (
                                <span className={cn("text-[10px] font-bold uppercase", isDarkMode ? "text-emerald-500/60" : "text-violet-500/70")}>
                                  {isRTL ? `بعد ${prayerContextNext.remaining}` : `in ${prayerContextNext.remaining}`}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="relative z-10 p-6 pt-0 space-y-4">
                      <div className={cn("p-4 rounded-3xl border space-y-3", isDarkMode ? "bg-white/5 border-white/10" : "bg-white/50 border-violet-200/40")}>
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className={isDarkMode ? "text-white/40" : "text-black/40"}>{isRTL ? 'التاريخ الهجري' : 'Hijri Date'}</span>
                          <span className={isDarkMode ? "text-emerald-400" : "text-violet-600"}>{prayerHijri}</span>
                        </div>
                        {prayerEvent && (
                          <div className={cn("flex items-center gap-2 p-2 rounded-xl border", isDarkMode ? "bg-emerald-500/10 border-emerald-500/20" : "bg-violet-500/10 border-violet-300/20")}>
                            <Star size={14} className={isDarkMode ? "text-emerald-400 fill-emerald-400" : "text-violet-500 fill-violet-500"} />
                            <span className={cn("text-[11px] font-black", isDarkMode ? "text-emerald-400" : "text-violet-600")}>{prayerEvent}</span>
                          </div>
                        )}
                        {prayerIsFriday && (
                          <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Clock size={14} className="text-blue-400" />
                            <span className="text-[11px] font-black text-blue-400">{isRTL ? 'جمعة مباركة - وقت الصلاة قريب' : 'Jumuah Mubarak'}</span>
                          </div>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          triggerTestAlert();
                          setShowPrayerModal(false);
                          toast.success(isRTL ? "بدء الإشعار التجريبي الفاخر" : "Starting luxury test alert");
                        }}
                        className={cn("w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-black text-sm shadow-xl transition-all", isDarkMode ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20" : "bg-gradient-to-r from-violet-500 to-indigo-600 shadow-violet-500/20")}
                      >
                        <Bell size={18} />
                        <span>{isRTL ? 'عرض الإشعار الفاخر (تجربة)' : 'Show Luxury Alert (Test)'}</span>
                      </motion.button>
                    </div>
                  </>
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
                  className={cn("absolute inset-0 backdrop-blur-md", isDarkMode ? "bg-black/70" : "bg-black/30")}
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className={cn(
                    "relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden",
                    isDarkMode 
                      ? "bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20"
                      : "bg-gradient-to-b from-white via-violet-50/50 to-indigo-50/80 border-2 border-violet-200/60"
                  )}
                >
                  {!isDarkMode && (
                    <>
                      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-16 -translate-x-16" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full translate-y-12 -translate-x-12" />
                      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 rounded-full translate-y-12 translate-x-12" />
                    </>
                  )}
                  <button 
                    onClick={() => setShowQuranPlayer(false)}
                    className={cn("absolute top-4 left-4 p-2 rounded-xl transition-all z-10", isDarkMode ? "text-white/30 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/5")}
                  >
                    <X size={20} />
                  </button>
                  
                  <div className={cn("relative z-10 p-6 border-b", isDarkMode ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/20" : "bg-gradient-to-r from-violet-100/60 to-indigo-100/60 border-violet-200/40")}>
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-2xl", isDarkMode ? "bg-amber-500/30" : "bg-violet-500/20")}>
                        <BookOpen size={28} className={isDarkMode ? "text-amber-400" : "text-violet-600"} />
                      </div>
                      <div>
                        <h3 className={cn("font-bold text-xl", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'القرآن الكريم' : 'Holy Quran'}</h3>
                        <p className={cn("text-sm", isDarkMode ? "text-amber-400" : "text-violet-600")}>{isRTL ? 'مشاري العفاسي' : 'Mishary Alafasy'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative z-10 p-6">
                    <div className="text-center mb-6">
                      <p className={cn("text-2xl font-bold mb-1", isDarkMode ? "text-white" : "text-black")}>{SURAHS[currentSurahIndex].name}</p>
                      <p className={cn("text-sm", isDarkMode ? "text-white/50" : "text-black/50")}>{SURAHS[currentSurahIndex].englishName}</p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevSurah}
                        className={cn("p-3 rounded-2xl transition-all", isDarkMode ? "bg-white/10 hover:bg-white/20" : "bg-violet-100 hover:bg-violet-200")}
                      >
                        <SkipBack size={24} className={isDarkMode ? "text-white/70" : "text-violet-600"} />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={togglePlay}
                        className={cn("p-5 rounded-full shadow-xl", isDarkMode ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/40" : "bg-gradient-to-r from-violet-500 to-indigo-600 shadow-violet-500/40")}
                      >
                        {isPlaying ? <Pause size={32} className="text-white" /> : <Play size={32} className="text-white" />}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextSurah}
                        className={cn("p-3 rounded-2xl transition-all", isDarkMode ? "bg-white/10 hover:bg-white/20" : "bg-violet-100 hover:bg-violet-200")}
                      >
                        <SkipForward size={24} className={isDarkMode ? "text-white/70" : "text-violet-600"} />
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
                          className={cn("p-1 rounded-lg transition-colors", isDarkMode ? "text-amber-400 hover:bg-white/5" : "text-violet-600 hover:bg-violet-100")}
                        >
                          {volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
                        </motion.button>
                        <div className={cn("flex-1 h-1.5 rounded-full relative group cursor-pointer", isDarkMode ? "bg-white/10" : "bg-violet-200/50")}>
                          <motion.div 
                            className={cn("absolute inset-y-0 left-0 rounded-full", isDarkMode ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]")}
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
                            className={cn("absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full border-2", isDarkMode ? "shadow-[0_0_8px_rgba(255,255,255,0.8)] border-amber-500" : "shadow-[0_0_8px_rgba(139,92,246,0.5)] border-violet-500")}
                            style={{ left: `${volume * 100}%`, x: '-50%' }}
                          />
                        </div>
                        <span className={cn("text-[10px] font-bold w-8", isDarkMode ? "text-white/40" : "text-black/40")}>{Math.round(volume * 100)}%</span>
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
                  
                  <div className={cn("relative z-10 p-4 border-t max-h-60 overflow-y-auto", isDarkMode ? "border-white/10" : "border-violet-200/40")}>
                    <div className="flex items-center justify-between mb-3">
                      <p className={cn("text-xs", isDarkMode ? "text-white/40" : "text-black/40")}>{isRTL ? 'سور القرآن الكريم (114 سورة)' : 'Quran Surahs (114)'}</p>
                      <p className={cn("text-xs", isDarkMode ? "text-amber-400" : "text-violet-600")}>{currentSurahIndex + 1}/114</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {SURAHS.map((surah, i) => (
                        <button
                          key={surah.number}
                          onClick={() => { setCurrentSurahIndex(i); playSurah(i); }}
                          className={cn(
                            "text-right p-2 rounded-xl transition-all text-xs",
                            currentSurahIndex === i 
                              ? isDarkMode 
                                ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30"
                                : "bg-violet-500/20 text-violet-600 font-bold border border-violet-400/30"
                              : isDarkMode 
                                ? "bg-white/5 hover:bg-white/10 text-white/60 border border-white/5"
                                : "bg-white/40 hover:bg-white/60 text-black/60 border border-violet-100/60"
                          )}
                        >
                          <span className={isDarkMode ? "text-white/30 text-[10px]" : "text-black/30 text-[10px]"}>{surah.number}.</span> {surah.name}
                        </button>
                      ))}
                    </div>
                  </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

          {/* Notifications Modal - Premium Tabbed */}
          <AnimatePresence>
            {showNotifications && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => { setShowNotifications(false); setActiveNotifTab('system'); }}
                  className={cn("absolute inset-0 backdrop-blur-md", isDarkMode ? "bg-black/70" : "bg-black/30")}
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className={cn("relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col", isDarkMode ? "bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10" : "bg-gradient-to-b from-white via-violet-50/50 to-indigo-50/80 border-2 border-violet-200/60")}
                >
                  <button 
                    onClick={() => { setShowNotifications(false); setActiveNotifTab('system'); }}
                    className={cn("absolute top-4 left-4 p-2 rounded-xl transition-all z-10", isDarkMode ? "text-white/30 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/5")}
                  >
                    <X size={20} />
                  </button>
                  
                  {/* Header */}
                  <div className={cn("p-6 border-b", isDarkMode ? "border-white/10" : "border-violet-200/40")}>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="relative">
                        <motion.div
                          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className={cn("absolute inset-0 rounded-2xl blur-xl", isDarkMode ? "bg-blue-500" : "bg-violet-500")}
                        />
                        <div className={cn("relative p-3 rounded-2xl border", isDarkMode ? "bg-gradient-to-br from-blue-500/30 to-indigo-500/30 border-blue-500/20" : "bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border-violet-300/40")}>
                          <Bell size={28} className={isDarkMode ? "text-blue-400" : "text-violet-600"} />
                        </div>
                      </div>
                      <div>
                        <h3 className={cn("font-black text-xl", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'مركز الإشعارات' : 'Notification Center'}</h3>
                        <p className={cn("text-sm", isDarkMode ? "text-white/40" : "text-black/40")}>{isRTL ? 'جميع التنبيهات والتحديثات' : 'All alerts and updates'}</p>
                      </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className={cn("flex items-center gap-1 p-1 rounded-xl", isDarkMode ? "bg-white/5" : "bg-violet-100/50")}>
                      <button
                        onClick={() => setActiveNotifTab('system')}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[11px] font-black transition-all",
                          activeNotifTab === 'system' 
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                            : isDarkMode ? "text-white/40 hover:text-white/70" : "text-black/40 hover:text-black/70"
                        )}
                      >
                        <Bell size={13} />
                        <span>{isRTL ? 'النظام' : 'System'}</span>
                        {unreadAdminCount > 0 && <span className="min-w-[16px] h-[16px] bg-white/20 rounded-full text-[9px] flex items-center justify-center">{unreadAdminCount}</span>}
                      </button>
                      <button
                        onClick={() => setActiveNotifTab('identity')}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[11px] font-black transition-all",
                          activeNotifTab === 'identity' 
                            ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30" 
                            : isDarkMode ? "text-white/40 hover:text-white/70" : "text-black/40 hover:text-black/70"
                        )}
                      >
                        <ShieldAlert size={13} />
                        <span>{isRTL ? 'الهويات' : 'IDs'}</span>
                        {((hrNotifications?.identity.total_expired || 0) + (hrNotifications?.identity.total_expiring_soon || 0)) > 0 && (
                          <span className="min-w-[16px] h-[16px] bg-white/20 rounded-full text-[9px] flex items-center justify-center">
                            {(hrNotifications?.identity.total_expired || 0) + (hrNotifications?.identity.total_expiring_soon || 0)}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveNotifTab('incomplete')}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-[11px] font-black transition-all",
                            activeNotifTab === 'incomplete' 
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30" 
                              : isDarkMode ? "text-white/40 hover:text-white/70" : "text-black/40 hover:text-black/70"
                        )}
                      >
                        <FileWarning size={13} />
                        <span>{isRTL ? 'بيانات ناقصة' : 'Incomplete'}</span>
                        {(hrNotifications?.incomplete.total_incomplete || 0) > 0 && (
                          <span className="min-w-[16px] h-[16px] bg-white/20 rounded-full text-[9px] flex items-center justify-center">
                            {hrNotifications?.incomplete.total_incomplete}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto">
                    {/* System Tab */}
                    {activeNotifTab === 'system' && (
                      <div>
                        {adminNotifications.length > 0 ? adminNotifications.map((notif) => (
                          <motion.div
                            key={notif.id}
                              whileHover={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(139,92,246,0.05)" }}
                              className={cn("p-4 border-b cursor-pointer", isDarkMode ? "border-white/5" : "border-violet-100/60")}
                            onClick={() => {
                              const currentLastSeen = parseInt(localStorage.getItem("last_admin_notification_id") || "0");
                              if (notif.id > currentLastSeen) {
                                localStorage.setItem("last_admin_notification_id", notif.id.toString());
                                setUnreadAdminCount(prev => Math.max(0, prev - 1));
                              }
                              window.dispatchEvent(new CustomEvent("open-admin-notification", { detail: { notification: notif } }));
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-start gap-3">
                                <div className={cn("p-2 rounded-xl", isDarkMode ? "bg-blue-500/20" : "bg-violet-500/15")}>
                                  <Bell size={16} className={isDarkMode ? "text-blue-400" : "text-violet-600"} />
                                </div>
                                <div className="flex-1">
                                  <p className={cn("text-sm font-bold", isDarkMode ? "text-white/90" : "text-black/90")}>{notif.title}</p>
                                  <p className={cn("text-xs", isDarkMode ? "text-white/40" : "text-black/40")}>{new Date(notif.created_at).toLocaleDateString('en-US')}</p>
                              </div>
                            </div>
                          </motion.div>
                        )) : (
                          <div className="p-16 text-center">
                              <Bell size={48} className={cn("mx-auto mb-3", isDarkMode ? "text-white/10" : "text-violet-300/40")} />
                              <p className={cn("text-sm font-bold", isDarkMode ? "text-white/30" : "text-black/30")}>{isRTL ? 'لا توجد تنبيهات' : 'No alerts'}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Identity Tab */}
                    {activeNotifTab === 'identity' && (
                      <div className="p-4 space-y-3">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <ShieldX size={18} className="text-red-400" />
                              <span className="text-[10px] font-black text-red-400 uppercase">{isRTL ? 'منتهية' : 'Expired'}</span>
                            </div>
                            <p className="text-3xl font-black text-red-400">{hrNotifications?.identity.total_expired || 0}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <ShieldAlert size={18} className="text-amber-400" />
                              <span className="text-[10px] font-black text-amber-400 uppercase">{isRTL ? 'تنتهي قريبا' : 'Expiring'}</span>
                            </div>
                            <p className="text-3xl font-black text-amber-400">{hrNotifications?.identity.total_expiring_soon || 0}</p>
                          </div>
                        </div>

                        {/* Expired List */}
                        {(hrNotifications?.identity.expired || []).length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2 px-1">
                              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-[11px] font-black text-red-400">{isRTL ? 'هويات منتهية الصلاحية' : 'Expired IDs'}</span>
                            </div>
                            <div className="space-y-2">
                              {hrNotifications?.identity.expired.slice(0, 10).map((emp) => (
                                <motion.div
                                  key={emp.id}
                                  whileHover={{ x: isRTL ? -4 : 4 }}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-all cursor-pointer"
                                  onClick={() => {
                                    router.push(`/hr/employees/${emp.id}`);
                                    setShowNotifications(false);
                                  }}
                                >
                                  <div className="p-2 rounded-lg bg-red-500/20">
                                    <ShieldX size={14} className="text-red-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className={cn("text-xs font-black truncate", isDarkMode ? "text-white/90" : "text-black/90")}>{emp.name}</p>
                                      <p className={cn("text-[10px]", isDarkMode ? "text-white/40" : "text-black/40")}>{emp.package_name}</p>
                                    </div>
                                    <div className="text-left shrink-0">
                                      <span className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-[10px] font-black">
                                        {isRTL ? `منتهية منذ ${Math.abs(emp.days_remaining)} يوم` : `${Math.abs(emp.days_remaining)}d ago`}
                                      </span>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Expiring Soon List */}
                          {(hrNotifications?.identity.expiring_soon || []).length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2 px-1">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span className="text-[11px] font-black text-amber-400">{isRTL ? 'هويات تنتهي قريبا' : 'Expiring Soon'}</span>
                              </div>
                              <div className="space-y-2">
                                {hrNotifications?.identity.expiring_soon.slice(0, 10).map((emp) => (
                                  <motion.div
                                    key={emp.id}
                                    whileHover={{ x: isRTL ? -4 : 4 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/30 transition-all cursor-pointer"
                                    onClick={() => {
                                      router.push(`/hr/employees/${emp.id}`);
                                      setShowNotifications(false);
                                    }}
                                  >
                                    <div className="p-2 rounded-lg bg-amber-500/20">
                                      <ShieldAlert size={14} className="text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={cn("text-xs font-black truncate", isDarkMode ? "text-white/90" : "text-black/90")}>{emp.name}</p>
                                      <p className={cn("text-[10px]", isDarkMode ? "text-white/40" : "text-black/40")}>{emp.package_name}</p>
                                  </div>
                                  <div className="text-left shrink-0">
                                    <span className={cn(
                                      "px-2 py-1 rounded-lg text-[10px] font-black",
                                      emp.days_remaining <= 7 ? "bg-red-500/20 text-red-400" :
                                      emp.days_remaining <= 30 ? "bg-amber-500/20 text-amber-400" :
                                      "bg-yellow-500/20 text-yellow-400"
                                    )}>
                                      {emp.days_remaining === 0 ? (isRTL ? 'اليوم' : 'Today') : 
                                       isRTL ? `${emp.days_remaining} يوم` : `${emp.days_remaining}d`}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(hrNotifications?.identity.total_expired === 0 && hrNotifications?.identity.total_expiring_soon === 0) && (
                          <div className="p-12 text-center">
                            <ShieldCheck size={48} className="mx-auto mb-3 text-emerald-500/30" />
                            <p className="text-sm font-bold text-emerald-400">{isRTL ? 'جميع الهويات سارية المفعول' : 'All IDs are valid'}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Incomplete Data Tab */}
                    {activeNotifTab === 'incomplete' && (
                      <div className="p-4 space-y-3">
                        {/* Summary */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-xl bg-amber-500/20">
                                <FileWarning size={20} className="text-amber-400" />
                              </div>
                              <div>
                                  <p className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'بيانات غير مكتملة' : 'Incomplete Data'}</p>
                                  <p className={cn("text-[10px]", isDarkMode ? "text-white/40" : "text-black/40")}>{isRTL ? 'موظفون يحتاجون استكمال بياناتهم' : 'Employees need data completion'}</p>
                              </div>
                            </div>
                            <p className="text-2xl font-black text-amber-400">{hrNotifications?.incomplete.total_incomplete || 0}</p>
                          </div>
                        </div>

                        {/* Packages */}
                        {(hrNotifications?.incomplete.packages || []).map((pkg) => (
                            <div key={pkg.package_id} className={cn("rounded-2xl border overflow-hidden", isDarkMode ? "border-white/10" : "border-violet-200/40")}>
                              <motion.button
                                whileHover={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(139,92,246,0.03)" }}
                              onClick={() => {
                                router.push(`/hr/employees?package=${pkg.package_id}`);
                                setShowNotifications(false);
                              }}
                              className="w-full flex items-center justify-between p-4 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-purple-500/20">
                                  <Package size={16} className="text-purple-400" />
                                </div>
                                <div className="text-right">
                                    <p className={cn("text-sm font-black", isDarkMode ? "text-white" : "text-black")}>{pkg.package_name}</p>
                                    <p className={cn("text-[10px]", isDarkMode ? "text-white/40" : "text-black/40")}>{pkg.employees.length} {isRTL ? 'موظف' : 'employees'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-[10px] font-black">
                                  {pkg.employees.length} {isRTL ? 'ناقص' : 'incomplete'}
                                </span>
                                <ChevronRight size={16} className={cn(isDarkMode ? "text-white/30" : "text-black/30", isRTL && "rotate-180")} />
                              </div>
                            </motion.button>
                            
                            {/* Employee list preview */}
                            <div className={cn("border-t px-4 py-2 space-y-1 max-h-32 overflow-y-auto", isDarkMode ? "border-white/5" : "border-violet-100/40")}>
                              {pkg.employees.slice(0, 5).map((emp) => {
                                const fieldLabels: Record<string, string> = isRTL ? {
                                  name: 'الاسم', iqama_number: 'رقم الهوية', phone: 'الهاتف',
                                  basic_salary: 'الراتب', iqama_expiry: 'انتهاء الهوية', nationality: 'الجنسية'
                                } : {
                                  name: 'Name', iqama_number: 'ID No.', phone: 'Phone',
                                  basic_salary: 'Salary', iqama_expiry: 'ID Expiry', nationality: 'Nationality'
                                };
                                return (
                                  <div key={emp.id} className="flex items-center justify-between py-1.5">
                                      <span className={cn("text-[11px] font-bold", isDarkMode ? "text-white/60" : "text-black/60")}>{emp.name}</span>
                                    <div className="flex items-center gap-1">
                                      {emp.missing_fields.slice(0, 3).map(f => (
                                        <span key={f} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400/80 text-[9px] font-bold">
                                          {fieldLabels[f] || f}
                                        </span>
                                      ))}
                                      {emp.missing_fields.length > 3 && (
                                          <span className={cn("text-[9px]", isDarkMode ? "text-white/30" : "text-black/30")}>+{emp.missing_fields.length - 3}</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              {pkg.employees.length > 5 && (
                                  <p className={cn("text-[10px] text-center py-1", isDarkMode ? "text-white/30" : "text-black/30")}>+{pkg.employees.length - 5} {isRTL ? 'موظف آخر' : 'more'}</p>
                              )}
                            </div>
                          </div>
                        ))}

                        {(hrNotifications?.incomplete.total_incomplete === 0) && (
                          <div className="p-12 text-center">
                            <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-500/30" />
                            <p className="text-sm font-bold text-emerald-400">{isRTL ? 'جميع بيانات الموظفين مكتملة' : 'All employee data is complete'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                    <div className={cn("p-4 border-t shrink-0", isDarkMode ? "border-white/10" : "border-violet-200/40")}>
                    {activeNotifTab === 'system' && (
                      <button 
                        onClick={() => {
                          if (user?.role === 'admin') router.push('/admin/notifications');
                          setShowNotifications(false);
                        }}
                        className="w-full py-3 text-center text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 rounded-xl hover:bg-blue-500/20"
                      >
                        {isRTL ? 'عرض جميع التنبيهات' : 'View All Alerts'}
                      </button>
                    )}
                    {activeNotifTab === 'identity' && (
                      <button 
                        onClick={() => {
                          router.push('/hr/reports/iqama?filter=expired');
                          setShowNotifications(false);
                        }}
                        className="w-full py-3 text-center text-sm font-bold text-red-400 hover:text-red-300 transition-colors bg-red-500/10 rounded-xl hover:bg-red-500/20 flex items-center justify-center gap-2"
                      >
                        <Shield size={16} />
                        {isRTL ? 'فتح تقرير سريان الهويات' : 'Open ID Validity Report'}
                      </button>
                    )}
                    {activeNotifTab === 'incomplete' && (
                      <button 
                        onClick={() => {
                          router.push('/hr');
                          setShowNotifications(false);
                        }}
                        className="w-full py-3 text-center text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 rounded-xl hover:bg-amber-500/20 flex items-center justify-center gap-2"
                      >
                        <Users size={16} />
                        {isRTL ? 'فتح إدارة الموارد البشرية' : 'Open HR Management'}
                      </button>
                    )}
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
                  className={cn("absolute inset-0 backdrop-blur-md", isDarkMode ? "bg-black/70" : "bg-black/30")}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={cn("relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto", isDarkMode ? "bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10" : "bg-gradient-to-b from-white via-violet-50/50 to-indigo-50/80 border-2 border-violet-200/60")}
              >
                <button 
                    onClick={() => setShowUserDropdown(false)}
                    className={cn("absolute top-4 left-4 p-2 rounded-xl transition-all z-10", isDarkMode ? "text-white/30 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/5")}
                  >
                    <X size={20} />
                  </button>
                  
                  <div className={cn("p-6 border-b", isDarkMode ? "border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10" : "border-violet-200/40 bg-gradient-to-r from-violet-100/60 to-indigo-100/60")}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                        <User size={32} className="text-white" />
                      </div>
                      <div>
                        <p className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-black")}>{user?.name}</p>
                        <p className={cn("text-sm", isDarkMode ? "text-white/40" : "text-black/40")}>{user?.email}</p>
                        <p className={cn("text-xs mt-1", isDarkMode ? "text-white/30" : "text-black/30")}>
                        {user?.role === "admin" ? (isRTL ? "مدير النظام" : "System Admin") : (isRTL ? "مدير منشأة" : "Facility Manager")}
                      </p>
                    </div>
                  </div>
                </div>
                  
                  {user?.role !== 'admin' && subscriptionData && (
                    <div className={cn("p-4 border-b", isDarkMode ? "border-white/10" : "border-violet-200/40")}>
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
                            <span className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'باقتك الحالية' : 'Your Plan'}</span>
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
                            <p className={cn("text-xs mt-1", isDarkMode ? "text-white/40" : "text-black/40")}>
                                {isRTL ? 'تنتهي في: ' : 'Expires: '}{new Date(subscriptionData.endDate).toLocaleDateString( 'en-US' )}
                              </p>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={openSubscriptionModal}
                            className={cn("p-2 rounded-xl transition-all", isDarkMode ? "bg-white/10 hover:bg-white/20" : "bg-violet-100 hover:bg-violet-200")}
                          >
                            <Info size={16} className={isDarkMode ? "text-white/60" : "text-violet-600"} />
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
                          whileHover={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(139,92,246,0.05)" }}
                            onClick={() => { router.push("/user_profile"); setShowUserDropdown(false); }}
                            className={cn("w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors", isDarkMode ? "text-white/70 hover:text-white" : "text-black/70 hover:text-black")}
                          >
                            <div className={cn("p-2 rounded-xl", isDarkMode ? "bg-blue-500/20" : "bg-violet-500/15")}>
                              <Building2 size={18} className={isDarkMode ? "text-blue-400" : "text-violet-600"} />
                          </div>
                          <span className="text-sm font-bold">{t('userProfile')}</span>
                        </motion.button>

                      {user?.role !== 'admin' && (
                            <motion.button
                              whileHover={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(139,92,246,0.05)" }}
                              onClick={() => { router.push("/subscriptions"); setShowUserDropdown(false); }}
                              className={cn("w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors", isDarkMode ? "text-white/70 hover:text-white" : "text-black/70 hover:text-black")}
                          >
                            <div className="p-2 rounded-xl bg-amber-500/20">
                              <Package size={18} className="text-amber-400" />
                            </div>
                            <span className="text-sm font-bold">{t('mySubscription')}</span>
                          </motion.button>
                        )}
                      
                        <motion.button
                          whileHover={{ backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(139,92,246,0.05)" }}
                            onClick={() => { router.push("/settings"); setShowUserDropdown(false); }}
                            className={cn("w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors", isDarkMode ? "text-white/70 hover:text-white" : "text-black/70 hover:text-black")}
                          >
                        <div className={cn("p-2 rounded-xl", isDarkMode ? "bg-slate-500/20" : "bg-violet-100")}>
                          <Settings size={18} className={isDarkMode ? "text-slate-400" : "text-violet-600"} />
                        </div>
                        <span className="text-sm font-bold">{isRTL ? 'إعدادات النظام' : 'System Settings'}</span>
                      </motion.button>
                    </div>
                
                  <div className={cn("p-3 border-t", isDarkMode ? "border-white/10" : "border-violet-200/40")}>
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
                  className={cn("absolute inset-0 backdrop-blur-md", isDarkMode ? "bg-black/70" : "bg-black/30")}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={cn("relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto", isDarkMode ? "bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20" : "bg-gradient-to-b from-white via-violet-50/50 to-indigo-50/80 border-2 border-violet-200/60")}
              >
                <button 
                    onClick={() => setShowSubscriptionModal(false)}
                    className={cn("absolute top-4 left-4 p-2 rounded-xl transition-all z-10", isDarkMode ? "text-white/30 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/5")}
                  >
                    <X size={20} />
                  </button>
                  
                  <div className={cn("p-6 border-b", isDarkMode ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/20" : "bg-gradient-to-r from-violet-100/60 to-indigo-100/60 border-violet-200/40")}>
                    <div className="flex items-center gap-4">
                      <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-gradient-to-br from-amber-500/30 to-orange-500/30" : "bg-gradient-to-br from-violet-500/20 to-indigo-500/20")}>
                        <Crown size={32} className={isDarkMode ? "text-amber-400" : "text-violet-600"} />
                      </div>
                      <div>
                        <h3 className={cn("font-bold text-xl", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'تفاصيل الاشتراك' : 'Subscription Details'}</h3>
                        <p className={cn("text-sm", isDarkMode ? "text-amber-400" : "text-violet-600")}>{isRTL ? 'إدارة باقتك وتجديدها' : 'Manage and renew your plan'}</p>
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
                              <p className={cn("font-bold", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'حالة الاشتراك' : 'Status'}</p>
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
                              <p className={cn("text-3xl font-black", isDarkMode ? "text-white" : "text-black")}>{subscriptionData.daysRemaining}</p>
                              <p className={cn("text-xs", isDarkMode ? "text-white/40" : "text-black/40")}>{isRTL ? 'يوم متبقي' : 'days left'}</p>
                          </div>
                        )}
                      </div>
                      
                      {currentPlanDetails && (
                          <div className={cn("space-y-3 pt-4 border-t", isDarkMode ? "border-white/10" : "border-violet-200/40")}>
                            <div className="flex items-center justify-between">
                              <span className={cn("text-sm", isDarkMode ? "text-white/50" : "text-black/50")}>{isRTL ? 'اسم الباقة' : 'Plan Name'}</span>
                              <span className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-black")}>{currentPlanDetails.plan_name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={cn("text-sm", isDarkMode ? "text-white/50" : "text-black/50")}>{isRTL ? 'السعر' : 'Price'}</span>
                            <span className="text-sm font-bold text-amber-400">{currentPlanDetails.plan_price} {isRTL ? 'ر.س' : 'SAR'}</span>
                          </div>
                          {subscriptionData.endDate && (
                            <div className="flex items-center justify-between">
                              <span className={cn("text-sm", isDarkMode ? "text-white/50" : "text-black/50")}>{isRTL ? 'تاريخ الانتهاء' : 'End Date'}</span>
                              <span className={cn("text-sm font-bold", isDarkMode ? "text-white" : "text-black")}>{new Date(subscriptionData.endDate).toLocaleDateString( 'en-US' )}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {currentPlanDetails?.features && (
                      <div className={cn("p-5 rounded-2xl border", isDarkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-violet-200/40")}>
                        <div className="flex items-center gap-3 mb-4">
                          <Star size={20} className="text-amber-400" />
                          <p className={cn("font-bold", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'مميزات الباقة' : 'Plan Features'}</p>
                        </div>
                        <div className="space-y-2">
                          {(currentPlanDetails.features || '').split(',').map((feature: string, i: number) => (
                            <div key={i} className="flex items-center gap-3">
                              <CheckCircle2 size={16} className="text-emerald-400" />
                              <span className={cn("text-sm", isDarkMode ? "text-white/70" : "text-black/70")}>{feature.trim()}</span>
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
                  className={cn("absolute inset-0 backdrop-blur-md", isDarkMode ? "bg-black/70" : "bg-black/30")}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={cn("relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto", isDarkMode ? "bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/20" : "bg-gradient-to-b from-white via-violet-50/50 to-indigo-50/80 border-2 border-violet-200/60")}
              >
                <button 
                    onClick={() => setShowUpgradeModal(false)}
                    className={cn("absolute top-4 left-4 p-2 rounded-xl transition-all z-10", isDarkMode ? "text-white/30 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/5")}
                  >
                    <X size={20} />
                  </button>
                  
                  <div className={cn("p-6 border-b", isDarkMode ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/20" : "bg-gradient-to-r from-violet-100/60 to-indigo-100/60 border-violet-200/40")}>
                    <div className="flex items-center gap-4">
                      <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-gradient-to-br from-purple-500/30 to-pink-500/30" : "bg-gradient-to-br from-violet-500/20 to-indigo-500/20")}>
                        <Zap size={32} className={isDarkMode ? "text-purple-400" : "text-violet-600"} />
                      </div>
                      <div>
                        <h3 className={cn("font-bold text-xl", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'ترقية الباقة' : 'Upgrade Plan'}</h3>
                        <p className={cn("text-sm", isDarkMode ? "text-purple-400" : "text-violet-600")}>{isRTL ? 'اختر الباقة المناسبة لاحتياجاتك' : 'Choose the plan that fits your needs'}</p>
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
                              : isDarkMode ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-white/60 border-violet-200/40 hover:border-violet-300/60"
                        )}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "p-3 rounded-xl",
                                index === 1 ? "bg-amber-500/20" : isDarkMode ? "bg-white/10" : "bg-violet-100"
                              )}>
                                <Package size={24} className={index === 1 ? "text-amber-400" : isDarkMode ? "text-white/60" : "text-violet-600"} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-black")}>{plan.name}</p>
                                {index === 1 && (
                                  <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                                    {isRTL ? 'الأكثر طلباً' : 'Popular'}
                                  </span>
                                )}
                              </div>
                                <p className={cn("text-sm", isDarkMode ? "text-white/40" : "text-black/40")}>
                                  {plan.duration_value} {plan.duration_unit === 'day' ? (isRTL ? 'يوم' : 'days') : plan.duration_unit === 'month' ? (isRTL ? 'شهر' : 'months') : (isRTL ? 'سنة' : 'years')}
                                </p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className={cn("text-2xl font-black", isDarkMode ? "text-white" : "text-black")}>{plan.price}</p>
                            <p className={cn("text-xs", isDarkMode ? "text-white/40" : "text-black/40")}>{isRTL ? 'ر.س' : 'SAR'}</p>
                          </div>
                        </div>
                        
                        {plan.description && (
                          <p className={cn("text-sm mb-4", isDarkMode ? "text-white/50" : "text-black/50")}>{plan.description}</p>
                        )}
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowPaymentModal({ plan, type: 'upgrade' })}
                          className={cn(
                            "w-full py-3 rounded-xl font-bold text-sm transition-all",
                              index === 1
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                                : isDarkMode ? "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white" : "bg-violet-100 text-violet-700 hover:bg-violet-200 hover:text-violet-800"
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
                  className={cn("absolute inset-0 backdrop-blur-md", isDarkMode ? "bg-black/70" : "bg-black/30")}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className={cn("relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto", isDarkMode ? "bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20" : "bg-gradient-to-b from-white via-violet-50/50 to-indigo-50/80 border-2 border-violet-200/60")}
              >
                <button 
                    onClick={() => { setShowPaymentModal(null); setReceiptImage(null); }}
                    className={cn("absolute top-4 left-4 p-2 rounded-xl transition-all z-10", isDarkMode ? "text-white/30 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/5")}
                  >
                    <X size={20} />
                  </button>
                  
                  <div className={cn("p-6 border-b", isDarkMode ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/20" : "bg-gradient-to-r from-violet-100/60 to-indigo-100/60 border-violet-200/40")}>
                    <div className="flex items-center gap-4">
                      <div className={cn("p-4 rounded-2xl", isDarkMode ? "bg-gradient-to-br from-emerald-500/30 to-teal-500/30" : "bg-gradient-to-br from-violet-500/20 to-indigo-500/20")}>
                        <Landmark size={32} className={isDarkMode ? "text-emerald-400" : "text-violet-600"} />
                      </div>
                      <div>
                        <h3 className={cn("font-bold text-xl", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'إتمام الدفع' : 'Complete Payment'}</h3>
                        <p className={cn("text-sm", isDarkMode ? "text-emerald-400" : "text-violet-600")}>
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
                          <span className={cn("font-bold", isDarkMode ? "text-white" : "text-black")}>{showPaymentModal.plan.name}</span>
                      </div>
                      <span className="text-lg font-black text-amber-400">{showPaymentModal.plan.price} {isRTL ? 'ر.س' : 'SAR'}</span>
                    </div>
                  </div>

                  <div>
                      <label className={cn("block text-sm font-bold mb-3", isDarkMode ? "text-white/70" : "text-black/70")}>{isRTL ? 'اختر الحساب البنكي للتحويل' : 'Select Bank Account'}</label>
                      <div className="space-y-2">
                        {bankAccounts.map((bank) => (
                          <label key={bank.id} className={cn("flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all", isDarkMode ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-white/60 border-violet-200/40 hover:border-violet-300/60")}>
                            <input type="radio" name="bank_account_id" value={bank.id} required className="w-4 h-4 accent-emerald-500" />
                            <div className="flex-1">
                              <p className={cn("font-bold text-sm", isDarkMode ? "text-white" : "text-black")}>{bank.bank_name}</p>
                              <p className={cn("text-xs", isDarkMode ? "text-white/40" : "text-black/40")}>{bank.account_holder}</p>
                            <p className="text-xs text-emerald-400 font-mono mt-1">{bank.iban}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                      <label className={cn("block text-sm font-bold mb-3", isDarkMode ? "text-white/70" : "text-black/70")}>{isRTL ? 'إرفاق إيصال الدفع' : 'Upload Receipt'}</label>
                      <div className={cn(
                        "relative p-6 rounded-2xl border-2 border-dashed transition-all text-center",
                        receiptImage 
                          ? "border-emerald-500/50 bg-emerald-500/10" 
                          : isDarkMode ? "border-white/20 bg-white/5 hover:border-white/30" : "border-violet-200/40 bg-white/40 hover:border-violet-300/60"
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
                            <Upload size={32} className={isDarkMode ? "mx-auto text-white/30" : "mx-auto text-violet-300"} />
                            <p className={cn("text-sm", isDarkMode ? "text-white/50" : "text-black/50")}>{isRTL ? 'اضغط لرفع صورة الإيصال' : 'Click to upload receipt'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                      <label className={cn("block text-sm font-bold mb-2", isDarkMode ? "text-white/70" : "text-black/70")}>{isRTL ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}</label>
                      <textarea 
                        name="notes"
                        rows={2}
                        className={cn("w-full p-3 rounded-xl border text-sm focus:ring-0 outline-none resize-none", isDarkMode ? "bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50" : "bg-white/60 border-violet-200/40 text-black placeholder:text-black/30 focus:border-violet-400/60")}
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
                    className={cn("absolute inset-0 backdrop-blur-md", isDarkMode ? "bg-black/70" : "bg-black/30")}
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
                    className={cn("relative rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300", isDarkMode ? "bg-gradient-to-b from-slate-900 to-slate-950 border border-blue-500/20" : "bg-gradient-to-b from-white via-violet-50/50 to-indigo-50/80 border-2 border-violet-200/60")}
                  >
                    {/* Modal Header */}
                      <div className={cn("p-4 md:p-6 border-b flex items-center justify-between shrink-0", isDarkMode ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-white/10" : "bg-gradient-to-r from-violet-100/60 to-indigo-100/60 border-violet-200/40")}>
                        <div className="flex items-center gap-4">
                          <div className={cn("p-3 rounded-2xl", isDarkMode ? "bg-blue-500/20" : "bg-violet-500/15")}>
                            <Mail size={24} className={isDarkMode ? "text-blue-400" : "text-violet-600"} />
                          </div>
                          <div>
                            <h3 className={cn("font-bold text-lg md:text-xl", isDarkMode ? "text-white" : "text-black")}>
                              {showEmailSettings ? (isRTL ? 'إعدادات البريد' : 'Email Settings') : (isRTL ? 'بريد الشركة' : 'Company Email')}
                            </h3>
                            <p className={cn("text-sm truncate max-w-[200px]", isDarkMode ? "text-blue-400" : "text-violet-600")}>
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
                                : isDarkMode ? "bg-white/5 text-white/40 hover:text-white border-white/10" : "bg-white/40 text-black/40 hover:text-black border-violet-200/40"
                          )}
                          title={isRTL ? "الإعدادات" : "Settings"}
                        >
                          <Settings size={20} />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                            onClick={() => setIsEmailMaximized(!isEmailMaximized)}
                            className={cn("p-2.5 rounded-xl transition-all border", isDarkMode ? "bg-white/5 text-white/40 hover:text-white border-white/10" : "bg-white/40 text-black/40 hover:text-black border-violet-200/40")}
                        >
                          {isEmailMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </motion.button>

                        {!showEmailSettings && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                  onClick={() => selectedEmailAccount && fetchEmails(selectedEmailAccount.id, activeEmailFolder)}
                                  className={cn("p-2.5 rounded-xl transition-all border", isDarkMode ? "bg-white/5 text-white/40 hover:text-white border-white/10" : "bg-white/40 text-black/40 hover:text-black border-violet-200/40")}
                              >
                                <RefreshCw size={20} className={loadingEmails ? "animate-spin" : ""} />
                              </motion.button>
                            </>
                          )}
                        
                        <button 
                            onClick={() => setShowEmailModal(false)}
                            className={cn("p-2.5 rounded-xl transition-all border", isDarkMode ? "bg-white/5 text-white/30 hover:text-white hover:bg-white/10 border-white/10" : "bg-white/40 text-black/30 hover:text-black hover:bg-black/5 border-violet-200/40")}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
    
                    <div className="flex-1 flex overflow-hidden min-h-0">
                      {/* Left Sidebar: Folders & Accounts */}
                        <div className={cn("w-20 md:w-64 border-l flex flex-col shrink-0 min-h-0", isDarkMode ? "border-white/5 bg-black/20" : "border-violet-200/30 bg-violet-50/30")}>
                          {/* Accounts Section */}
                          <div className={cn("p-4 border-b", isDarkMode ? "border-white/5" : "border-violet-200/30")}>
                            <p className={cn("hidden md:block text-[10px] font-bold uppercase tracking-widest mb-3 px-2", isDarkMode ? "text-white/30" : "text-black/30")}>
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
                                      : isDarkMode ? "hover:bg-white/5 text-white/40 border border-transparent" : "hover:bg-violet-100 text-black/40 border border-transparent"
                                )}
                              >
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    selectedEmailAccount?.id === account.id ? "bg-blue-500 text-white" : isDarkMode ? "bg-white/10" : "bg-violet-100"
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
                          <div className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto">
                              <p className={cn("hidden md:block text-[10px] font-bold uppercase tracking-widest mb-3 px-2", isDarkMode ? "text-white/30" : "text-black/30")}>
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
                                      ? isDarkMode ? "bg-white/10 text-white shadow-sm" : "bg-violet-100 text-black shadow-sm"
                                      : isDarkMode ? "text-white/40 hover:text-white/70 hover:bg-white/5" : "text-black/40 hover:text-black/70 hover:bg-violet-50"
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
                        <div className={cn("flex-1 flex flex-col min-w-0 min-h-0", isDarkMode ? "bg-white/[0.02]" : "bg-white/30")}>
                        {showEmailSettings ? (
                          /* Settings View */
                          <div className="flex-1 overflow-y-auto p-6">
                            <div className="max-w-2xl mx-auto space-y-8">
                              {/* Account Management */}
                              <section>
                                  <h4 className={cn("text-lg font-bold mb-4 flex items-center gap-2", isDarkMode ? "text-white" : "text-black")}>
                                  <Settings size={20} className="text-blue-400" />
                                  {isRTL ? 'إدارة الحسابات' : 'Account Management'}
                                </h4>
                                <div className="grid gap-3">
                                  {emailAccounts.map(account => (
                                      <div key={account.id} className={cn("flex items-center justify-between p-4 border rounded-2xl group", isDarkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-violet-200/40")}>
                                        <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <Mail size={20} className="text-blue-400" />
                                          </div>
                                          <div>
                                            <p className={cn("font-bold text-sm", isDarkMode ? "text-white" : "text-black")}>{account.email}</p>
                                            <p className={cn("text-xs", isDarkMode ? "text-white/40" : "text-black/40")}>{account.provider} • IMAP: {account.is_active ? (isRTL ? 'متصل' : 'Connected') : (isRTL ? 'فشل الاتصال' : 'Connection Failed')}</p>
                                        </div>
                                      </div>
                                      <button 
                                        onClick={() => handleDeleteAccount(account.id)}
                                        className={cn("p-2 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all", isDarkMode ? "text-white/20" : "text-black/20")}
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </section>

                              {/* Add New Account Form */}
                                <section className={cn("p-6 border rounded-3xl", isDarkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-violet-200/40")}>
                                  <h4 className={cn("text-lg font-bold mb-6 flex items-center gap-2", isDarkMode ? "text-white" : "text-black")}>
                                  <PlusCircle size={20} className="text-emerald-400" />
                                  {isRTL ? 'إضافة حساب جديد' : 'Add New Account'}
                                </h4>
                                <form onSubmit={handleAddAccount} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={cn("text-xs font-bold px-1", isDarkMode ? "text-white/50" : "text-black/50")}>{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</label>
                                        <input 
                                          name="email" 
                                          type="email" 
                                          required 
                                          placeholder="user@example.com"
                                          className={cn("w-full border rounded-xl p-3 text-sm focus:border-blue-500/50 outline-none transition-all", isDarkMode ? "bg-black/40 border-white/10 text-white" : "bg-white/80 border-violet-200/40 text-black")}
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={cn("text-xs font-bold px-1", isDarkMode ? "text-white/50" : "text-black/50")}>{isRTL ? 'كلمة المرور' : 'Password'}</label>
                                        <input 
                                          name="password" 
                                          type="password" 
                                          required 
                                          placeholder="••••••••"
                                          className={cn("w-full border rounded-xl p-3 text-sm focus:border-blue-500/50 outline-none transition-all", isDarkMode ? "bg-black/40 border-white/10 text-white" : "bg-white/80 border-violet-200/40 text-black")}
                                        />
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className={cn("text-xs font-bold px-1", isDarkMode ? "text-white/50" : "text-black/50")}>{isRTL ? 'مزود الخدمة' : 'Provider'}</label>
                                        <select 
                                          name="provider" 
                                          defaultValue="hostinger"
                                          className={cn("w-full border rounded-xl p-3 text-sm focus:border-blue-500/50 outline-none transition-all", isDarkMode ? "bg-black/40 border-white/10 text-white" : "bg-white/80 border-violet-200/40 text-black")}
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
                          <div className="flex-1 flex flex-col min-w-0 min-h-0">
                              {viewingEmail ? (
                                /* Single Email Detail View */
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className={cn("flex items-center gap-3 p-4 border-b", isDarkMode ? "border-white/5" : "border-violet-200/30")}>
                                      <button
                                        onClick={() => setViewingEmail(null)}
                                        className={cn("p-2 rounded-xl transition-all", isDarkMode ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-violet-100 text-black/60 hover:text-black")}
                                      >
                                        <ChevronLeft size={18} className={isRTL ? "rotate-180" : ""} />
                                      </button>
                                      <div className="min-w-0 flex-1">
                                        <h4 className={cn("text-sm font-bold truncate", isDarkMode ? "text-white" : "text-black")}>{viewingEmail.subject}</h4>
                                        <p className={cn("text-[11px]", isDarkMode ? "text-white/40" : "text-black/40")}>{viewingEmail.from} &lt;{viewingEmail.fromEmail}&gt;</p>
                                      </div>
                                      <span className={cn("text-[10px]", isDarkMode ? "text-white/30" : "text-black/30")}>{new Date(viewingEmail.date).toLocaleString('en-US')}</span>
                                  </div>
                                  <div className="flex-1 overflow-y-auto p-4">
                                    {loadingEmailBody ? (
                                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <Loader2 size={28} className="text-blue-500 animate-spin" />
                                        <p className={cn("text-xs", isDarkMode ? "text-white/40" : "text-black/40")}>{isRTL ? 'جاري تحميل الرسالة...' : 'Loading message...'}</p>
                                      </div>
                                    ) : viewingEmail.body ? (
                                      <div
                                        className={cn("prose prose-sm max-w-none [&_a]:text-blue-400 [&_img]:max-w-full [&_img]:rounded-lg", isDarkMode ? "prose-invert text-white/80" : "text-black/80")}
                                        style={{ fontSize: '13px', lineHeight: '1.6' }}
                                        dangerouslySetInnerHTML={{ __html: viewingEmail.body }}
                                      />
                                    ) : (
                                      <p className={cn("text-sm text-center py-8", isDarkMode ? "text-white/40" : "text-black/40")}>{isRTL ? 'لا يوجد محتوى للرسالة' : 'No message content'}</p>
                                    )}
                                  </div>
                                </div>
                              ) : loadingEmails ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                  <Loader2 size={40} className="text-blue-500 animate-spin" />
                                    <p className={cn("text-sm", isDarkMode ? "text-white/40" : "text-black/40")}>{isRTL ? 'جاري جلب الرسائل...' : 'Fetching emails...'}</p>
                                </div>
                              ) : emails.length > 0 ? (
                                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {/* Compose New Email Button */}
                                    {selectedEmailAccount && (
                                      <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => setShowCompose(true)}
                                        className="w-full flex items-center justify-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20 border border-blue-400/20"
                                      >
                                        <Send size={18} />
                                        <span>{isRTL ? 'ارسال رسالة جديدة' : 'Send New Message'}</span>
                                      </motion.button>
                                    )}
                                    <div className="flex items-center justify-between mb-4 px-2">
                                      <h4 className={cn("text-sm font-bold", isDarkMode ? "text-white/60" : "text-black/60")}>
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
                                      onClick={() => handleViewEmail(email)}
                                      className={cn(
                                        "group relative p-4 rounded-2xl border transition-all cursor-pointer",
                                          !email.isRead 
                                            ? isDarkMode ? "bg-white/5 border-blue-500/30 shadow-lg shadow-blue-500/5" : "bg-violet-50 border-blue-400/30 shadow-lg shadow-blue-500/5"
                                            : isDarkMode ? "bg-transparent border-white/5 hover:bg-white/5" : "bg-transparent border-violet-200/30 hover:bg-violet-50"
                                      )}
                                    >
                                      <div className="flex justify-between items-start gap-4 mb-1">
                                        <div className="flex items-center gap-3 min-w-0">
                                          {!email.isRead && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                                            <span className={cn("font-bold text-sm truncate", isDarkMode ? "text-white/90" : "text-black/90")}>{email.from}</span>
                                        </div>
                                        <span className={cn("text-[10px] whitespace-nowrap", isDarkMode ? "text-white/30" : "text-black/30")}>
                                          {new Date(email.date).toLocaleString('ar-SA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <h4 className="text-xs font-bold text-blue-400 mb-1 truncate">{email.subject}</h4>
                                      <p className={cn("text-[11px] line-clamp-2 leading-relaxed", isDarkMode ? "text-white/40" : "text-black/40")}>{email.snippet || (isRTL ? 'اضغط لعرض الرسالة' : 'Click to view message')}</p>
                                    </motion.div>
                                  ))}
                                </div>
                              ) : (
                                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                    {selectedEmailAccount && (
                                      <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => setShowCompose(true)}
                                        className="w-full max-w-xs flex items-center justify-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20 border border-blue-400/20 mb-6"
                                      >
                                        <Send size={18} />
                                        <span>{isRTL ? 'ارسال رسالة جديدة' : 'Send New Message'}</span>
                                      </motion.button>
                                    )}
                                      <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6", isDarkMode ? "bg-white/5" : "bg-violet-100")}>
                                      <Mail size={40} className={isDarkMode ? "text-white/10" : "text-violet-300"} />
                                    </div>
                                    <h4 className={cn("text-lg font-bold mb-2", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'لا توجد رسائل' : 'No messages'}</h4>
                                    <p className={cn("text-sm max-w-xs", isDarkMode ? "text-white/30" : "text-black/30")}>{isRTL ? 'هذا المجلد فارغ حالياً أو لم يتم جلب الرسائل بعد.' : 'This folder is currently empty or messages haven\'t been fetched yet.'}</p>
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

                    {/* New Email Notification Popup */}
                    <AnimatePresence>
                      {newEmailAlert.show && (
                        <motion.div
                          initial={{ opacity: 0, y: -20, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                          className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
                        >
                          <Bell size={20} />
                          <span className="font-bold">
                            {newEmailAlert.count} {isRTL ? 'رسالة جديدة!' : 'new email(s)!'}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Compose Email Modal */}
                    <AnimatePresence>
                      {showCompose && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                            className={cn("absolute inset-0 z-50 backdrop-blur-sm flex flex-col rounded-3xl", isDarkMode ? "bg-slate-900/98" : "bg-white/98")}
                          >
                            <div className={cn("p-4 md:p-6 border-b flex items-center justify-between shrink-0", isDarkMode ? "border-white/10" : "border-violet-200/30")}>
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-blue-500/20">
                                  <Edit3 size={20} className="text-blue-400" />
                                </div>
                                <h3 className={cn("font-bold text-lg", isDarkMode ? "text-white" : "text-black")}>{isRTL ? 'رسالة جديدة' : 'New Message'}</h3>
                              </div>
                              <button
                                onClick={() => { setShowCompose(false); setComposeData({ to: '', subject: '', body: '' }); }}
                                className={cn("p-2.5 rounded-xl transition-all border", isDarkMode ? "bg-white/5 text-white/30 hover:text-white hover:bg-white/10 border-white/10" : "bg-black/5 text-black/30 hover:text-black hover:bg-black/10 border-violet-200/30")}
                              >
                              <X size={20} />
                            </button>
                          </div>
                          <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 overflow-y-auto min-h-0">
                            <div className="space-y-1.5">
                                <label className={cn("text-xs font-bold px-1", isDarkMode ? "text-white/50" : "text-black/50")}>{isRTL ? 'إلى' : 'To'}</label>
                                <input
                                  type="email"
                                  value={composeData.to}
                                  onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                                  placeholder={isRTL ? 'البريد الإلكتروني للمستلم' : 'Recipient email address'}
                                  className={cn("w-full border rounded-xl p-3 text-sm focus:border-blue-500/50 outline-none transition-all", isDarkMode ? "bg-black/40 border-white/10 text-white" : "bg-white/80 border-violet-200/40 text-black")}
                                  dir="ltr"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className={cn("text-xs font-bold px-1", isDarkMode ? "text-white/50" : "text-black/50")}>{isRTL ? 'الموضوع' : 'Subject'}</label>
                                <input
                                  type="text"
                                  value={composeData.subject}
                                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                                  placeholder={isRTL ? 'موضوع الرسالة' : 'Email subject'}
                                  className={cn("w-full border rounded-xl p-3 text-sm focus:border-blue-500/50 outline-none transition-all", isDarkMode ? "bg-black/40 border-white/10 text-white" : "bg-white/80 border-violet-200/40 text-black")}
                                />
                              </div>
                              <div className="flex-1 space-y-1.5 flex flex-col min-h-0">
                                <label className={cn("text-xs font-bold px-1", isDarkMode ? "text-white/50" : "text-black/50")}>{isRTL ? 'نص الرسالة' : 'Message'}</label>
                                <textarea
                                  value={composeData.body}
                                  onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                                  placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                                  className={cn("flex-1 min-h-[200px] w-full border rounded-xl p-3 text-sm focus:border-blue-500/50 outline-none transition-all resize-none", isDarkMode ? "bg-black/40 border-white/10 text-white" : "bg-white/80 border-violet-200/40 text-black")}
                                />
                            </div>
                          </div>
                          <div className={cn("p-4 md:p-6 border-t flex items-center justify-between shrink-0", isDarkMode ? "border-white/10" : "border-violet-200/30")}>
                            <p className={cn("text-xs", isDarkMode ? "text-white/30" : "text-black/30")}>
                              {isRTL ? `الإرسال من: ${selectedEmailAccount?.email || ''}` : `Sending from: ${selectedEmailAccount?.email || ''}`}
                            </p>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => { setShowCompose(false); setComposeData({ to: '', subject: '', body: '' }); }}
                                className={cn("px-4 py-2.5 text-sm font-medium transition-all", isDarkMode ? "text-white/40 hover:text-white" : "text-black/40 hover:text-black")}
                              >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                              </button>
                              <button
                                onClick={handleSendEmail}
                                disabled={sendingEmail || !composeData.to || !composeData.subject}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                              >
                                {sendingEmail ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {isRTL ? 'إرسال' : 'Send'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Login Splash - Identity Expiry Alert */}
            <AnimatePresence>
              {showLoginSplash && hrNotifications && (hrNotifications.identity.total_expired > 0 || hrNotifications.identity.total_expiring_soon > 0) && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" data-identity-alert>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "absolute inset-0",
                        isDarkMode ? "backdrop-blur-2xl bg-black/90" : "backdrop-blur-xl bg-black/60"
                    )}
                  />
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 30 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className={cn(
                      "relative w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col",
                        isDarkMode 
                          ? "bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-red-500/20" 
                          : "bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_25px_60px_rgba(0,0,0,0.12)]"
                    )}
                  >
                    {/* Animated background effects */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <motion.div
                        animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className={cn(
                          "absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl",
                          isDarkMode ? "bg-red-500/10" : "bg-red-500/8"
                        )}
                      />
                      <motion.div
                        animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1.1, 0.9, 1.1] }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className={cn(
                          "absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl",
                          isDarkMode ? "bg-amber-500/10" : "bg-amber-500/8"
                        )}
                      />
                    </div>

                    {/* Close */}
                    <button 
                      onClick={() => setShowLoginSplash(false)}
                      className={cn(
                        "absolute top-5 left-5 p-2 rounded-xl transition-all z-10",
                        isDarkMode 
                          ? "text-white/20 hover:text-white hover:bg-white/10" 
                          : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <X size={20} />
                    </button>

                    {/* Header with animated shield */}
                    <div className="relative p-8 pb-4 text-center">
                        <div className="relative inline-block mb-5">
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.4, 0.15] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-red-500 rounded-full blur-2xl"
                          />
                          <motion.div
                            animate={{ 
                              rotate: [0, -8, 8, -5, 5, 0],
                              scale: [1, 1.05, 0.95, 1.03, 0.97, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="relative"
                        >
                          <div className={cn(
                            "p-5 rounded-3xl border shadow-2xl",
                            isDarkMode
                              ? "bg-gradient-to-br from-red-500/30 to-rose-500/30 border-red-500/30 shadow-red-500/20"
                              : "bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-red-200/40"
                          )}>
                            <ShieldAlert size={40} className={isDarkMode ? "text-red-400" : "text-red-500"} />
                          </div>
                        </motion.div>
                      </div>
                      <h2 className={cn(
                        "text-2xl font-black mb-2",
                        isDarkMode ? "text-white" : "text-slate-800"
                      )}>
                        {isRTL ? 'تنبيه سريان الهويات' : 'ID Validity Alert'}
                      </h2>
                      <p className={cn(
                        "text-sm max-w-xs mx-auto",
                        isDarkMode ? "text-white/50" : "text-slate-500"
                      )}>
                        {isRTL ? 'يوجد موظفون تحتاج هوياتهم إلى تجديد أو مراجعة فورية' : 'Some employees need immediate ID renewal or review'}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="px-6 pb-4">
                      <div className="grid grid-cols-2 gap-3">
                        {hrNotifications.identity.total_expired > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className={cn(
                              "p-4 rounded-2xl border",
                              isDarkMode
                                ? "bg-gradient-to-br from-red-500/15 to-rose-500/15 border-red-500/30"
                                : "bg-gradient-to-br from-red-50 to-rose-50 border-red-200/60"
                            )}
                          >
                            <ShieldX size={22} className={cn("mb-2", isDarkMode ? "text-red-400" : "text-red-500")} />
                            <p className={cn("text-3xl font-black", isDarkMode ? "text-red-400" : "text-red-600")}>{hrNotifications.identity.total_expired}</p>
                            <p className={cn("text-[10px] font-black uppercase mt-1", isDarkMode ? "text-red-400/60" : "text-red-500/70")}>{isRTL ? 'هوية منتهية' : 'Expired'}</p>
                          </motion.div>
                        )}
                        {hrNotifications.identity.total_expiring_soon > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={cn(
                              "p-4 rounded-2xl border",
                              isDarkMode
                                ? "bg-gradient-to-br from-amber-500/15 to-orange-500/15 border-amber-500/30"
                                : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60"
                            )}
                          >
                            <ShieldAlert size={22} className={cn("mb-2", isDarkMode ? "text-amber-400" : "text-amber-500")} />
                            <p className={cn("text-3xl font-black", isDarkMode ? "text-amber-400" : "text-amber-600")}>{hrNotifications.identity.total_expiring_soon}</p>
                            <p className={cn("text-[10px] font-black uppercase mt-1", isDarkMode ? "text-amber-400/60" : "text-amber-500/70")}>{isRTL ? 'تنتهي قريبا' : 'Expiring'}</p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Employee list */}
                    <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2 max-h-48">
                      {[...(hrNotifications.identity.expired || []), ...(hrNotifications.identity.expiring_soon || [])].slice(0, 8).map((emp, i) => (
                        <motion.div
                          key={emp.id}
                          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all",
                            emp.status === 'expired' 
                              ? isDarkMode ? "bg-red-500/5 border-red-500/15" : "bg-red-50/80 border-red-200/40"
                              : isDarkMode ? "bg-amber-500/5 border-amber-500/15" : "bg-amber-50/80 border-amber-200/40"
                          )}
                        >
                          <div className={cn(
                            "p-1.5 rounded-lg",
                            emp.status === 'expired' 
                              ? isDarkMode ? "bg-red-500/20" : "bg-red-100" 
                              : isDarkMode ? "bg-amber-500/20" : "bg-amber-100"
                          )}>
                            {emp.status === 'expired' 
                              ? <ShieldX size={14} className={isDarkMode ? "text-red-400" : "text-red-500"} />
                              : <ShieldAlert size={14} className={isDarkMode ? "text-amber-400" : "text-amber-500"} />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-black truncate", isDarkMode ? "text-white/90" : "text-slate-700")}>{emp.name}</p>
                            <p className={cn("text-[10px]", isDarkMode ? "text-white/30" : "text-slate-400")}>{emp.package_name}</p>
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded-lg text-[9px] font-black shrink-0",
                            emp.status === 'expired' 
                              ? isDarkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"
                              : emp.days_remaining <= 7 
                                ? isDarkMode ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-600"
                                : isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-600"
                          )}>
                            {emp.status === 'expired' 
                              ? (isRTL ? `منتهية ${Math.abs(emp.days_remaining)}ي` : `${Math.abs(emp.days_remaining)}d ago`)
                              : emp.days_remaining === 0 ? (isRTL ? 'اليوم' : 'Today')
                              : (isRTL ? `${emp.days_remaining} يوم` : `${emp.days_remaining}d`)
                            }
                          </span>
                        </motion.div>
                      ))}
                      {(hrNotifications.identity.total_expired + hrNotifications.identity.total_expiring_soon) > 8 && (
                        <p className={cn("text-[10px] text-center py-2", isDarkMode ? "text-white/30" : "text-slate-400")}>
                          +{(hrNotifications.identity.total_expired + hrNotifications.identity.total_expiring_soon) - 8} {isRTL ? 'موظف آخر' : 'more employees'}
                        </p>
                      )}
                    </div>

                      {/* Actions */}
                      <div className="p-6 pt-3 space-y-3 shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              router.push('/hr/reports/iqama?filter=expired');
                              setShowLoginSplash(false);
                            }}
                            className={cn(
                              "w-full py-4 rounded-2xl font-black text-base transition-all flex items-center justify-center gap-2.5",
                              isDarkMode
                                ? "bg-red-600 hover:bg-red-500 text-white shadow-[0_6px_24px_rgba(220,38,38,0.5)] hover:shadow-[0_8px_30px_rgba(220,38,38,0.6)]"
                                : "bg-red-600 hover:bg-red-700 text-white shadow-[0_6px_24px_rgba(220,38,38,0.45)] hover:shadow-[0_8px_30px_rgba(220,38,38,0.55)]"
                            )}
                          >
                            <Shield size={20} className="text-white" />
                            {isRTL ? 'فتح تقرير سريان الهويات' : 'Open ID Validity Report'}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowLoginSplash(false)}
                            className={cn(
                              "w-full py-3.5 text-center text-sm font-black transition-all rounded-2xl flex items-center justify-center gap-2",
                              isDarkMode 
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.5)]" 
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.45)]"
                            )}
                          >
                            {isRTL ? 'تذكيري لاحقا' : 'Remind me later'}
                          </motion.button>
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
                className={cn("absolute inset-0 backdrop-blur-md", isDarkMode ? "bg-black/70" : "bg-black/30")}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn("relative w-full max-w-md rounded-3xl p-8 shadow-2xl overflow-hidden", isDarkMode ? "bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10" : "bg-gradient-to-b from-white via-violet-50/50 to-indigo-50/80 border-2 border-violet-200/60")}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />
              
              <button 
                  onClick={() => setIsDriverModalOpen(false)}
                  className={cn("absolute top-6 left-6 p-2 rounded-xl transition-all", isDarkMode ? "text-white/30 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/5")}
                >
                  <X size={20} />
                </button>

                <div className="relative z-10 flex flex-col items-center text-center gap-4 mb-8">
                  <motion.div 
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="relative"
                  >
                    <div className={cn("absolute inset-0 rounded-2xl blur-xl opacity-40", isDarkMode ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-violet-500 to-indigo-500")} />
                    <div className={cn("relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl border", isDarkMode ? "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400/30" : "bg-gradient-to-br from-violet-500 to-indigo-600 border-violet-400/30")}>
                      <Truck size={32} className="text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <h3 className={cn("text-2xl font-black mb-1", isDarkMode ? "text-white" : "text-black")}>{t('driverApp')}</h3>
                    <p className={cn("text-sm", isDarkMode ? "text-white/40" : "text-black/40")}>{isRTL ? 'نظام إدخال البيانات للسائقين الميدانيين' : 'Data entry system for field drivers'}</p>
                  </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 gap-3 mb-6">
                  <a 
                    href="https://driver.accounts.iw-om.com"
                    target="_blank"
                    className={cn("flex items-center justify-between p-4 rounded-2xl transition-all group border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20" : "bg-white/60 hover:bg-white/80 border-violet-200/40 hover:border-violet-300/60")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl", isDarkMode ? "bg-blue-500/20" : "bg-violet-500/15")}>
                        <ExternalLink size={18} className={isDarkMode ? "text-blue-400" : "text-violet-600"} />
                      </div>
                      <span className={cn("font-bold text-sm", isDarkMode ? "text-white/90" : "text-black/90")}>{isRTL ? 'فتح رابط التطبيق' : 'Open App Link'}</span>
                    </div>
                    <ArrowRight size={18} className={cn("group-hover:-translate-x-1 transition-transform", isDarkMode ? "text-white/30" : "text-black/30")} />
                  </a>

                  <button 
                    onClick={copyDriverLink}
                    className={cn("flex items-center justify-between p-4 rounded-2xl transition-all group text-right w-full border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20" : "bg-white/60 hover:bg-white/80 border-violet-200/40 hover:border-violet-300/60")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl", copied ? "bg-emerald-500/20" : isDarkMode ? "bg-amber-500/20" : "bg-violet-500/15")}>
                        {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className={isDarkMode ? "text-amber-400" : "text-violet-600"} />}
                      </div>
                      <span className={cn("font-bold text-sm", isDarkMode ? "text-white/90" : "text-black/90")}>{copied ? (isRTL ? "تم النسخ بنجاح" : "Copied!") : (isRTL ? "نسخ رابط التطبيق" : "Copy App Link")}</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setShowQR(!showQR)}
                    className={cn("flex items-center justify-between p-4 rounded-2xl transition-all group text-right w-full border", isDarkMode ? "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20" : "bg-white/60 hover:bg-white/80 border-violet-200/40 hover:border-violet-300/60")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl", isDarkMode ? "bg-purple-500/20" : "bg-violet-500/15")}>
                        <QrCode size={18} className={isDarkMode ? "text-purple-400" : "text-violet-600"} />
                      </div>
                      <span className={cn("font-bold text-sm", isDarkMode ? "text-white/90" : "text-black/90")}>{isRTL ? 'عرض رمز QR' : 'Show QR Code'}</span>
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
                        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://driver.accounts.iw-om.com"
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
