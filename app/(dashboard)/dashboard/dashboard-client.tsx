"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { 
  Users, 
  Package, 
  UserCheck, 
  AlertTriangle,
  Building2,
  Clock,
  Ban,
  CreditCard,
  Crown,
  User,
  Calendar,
  Copy,
  Eye,
  EyeOff,
  Bolt,
  FileText,
  Truck,
  Store,
  BadgeDollarSign,
  Receipt,
  BookOpen,
  TrendingUp,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface DashboardClientProps {
  user: {
    name: string;
    email: string;
    role: string;
    userType?: string;
    userTypeName?: { ar: string; en: string };
  };
  company: {
    name: string;
    logo?: string;
    commercial_number?: string;
    vat_number?: string;
    created_at?: string;
    is_active?: boolean;
    access_token?: string;
  } | null;
  subscription: {
    message: string;
    type: string;
    badge: string;
    remaining_days?: number;
  };
    stats: {
      users_count?: number;
      pending_requests?: number;
      stopped_companies?: number;
      total_employees?: number;
      total_invoices_amount?: number;
      yearly_expenses?: number;
      expired_iqama?: number;
      credit_notes_count?: number;
      credit_notes_total?: number;
    };
  permissions: Record<string, number>;
  isAdmin: boolean;
}

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString('en-US'));
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    const controls = animate(count, value, { duration });
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, count, rounded]);

  return <span className="font-latin">{displayValue}</span>;
}

export function DashboardClient({ 
  user, 
  company, 
  subscription, 
  stats, 
  permissions,
  isAdmin 
}: DashboardClientProps) {
  const [tokenVisible, setTokenVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [yearlyStats, setYearlyStats] = useState({
    total_invoices_amount: stats.total_invoices_amount || 0,
    yearly_expenses: stats.yearly_expenses || 0
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const { isRTL } = useLocale();
    const t = useTranslations('dashboard');
    const tCommon = useTranslations('common');
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    useEffect(() => {
    const controller = new AbortController();
    async function fetchYearlyStats() {
      setLoadingStats(true);
      try {
        const res = await fetch(`/api/dashboard/yearly-stats?year=${selectedYear}`, {
          signal: controller.signal
        });
        if (res.ok) {
          const data = await res.json();
          setYearlyStats({
            total_invoices_amount: data.total_invoices_amount || 0,
            yearly_expenses: data.yearly_expenses || 0
          });
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      } finally {
        setLoadingStats(false);
      }
    }
    fetchYearlyStats();
    return () => controller.abort();
  }, [selectedYear]);

  const copyToken = () => {
    if (company?.access_token) {
      navigator.clipboard.writeText(company.access_token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSubscriptionGradient = (badge: string) => {
    switch (badge) {
      case "success": return "from-emerald-500 to-teal-400";
      case "warning": return "from-amber-500 to-orange-400";
      case "danger": return "from-red-500 to-rose-400";
      case "primary": return "from-blue-500 to-indigo-400";
      default: return "from-slate-500 to-slate-400";
    }
  };

  const quickAccessItems = [
    { titleKey: "hrManagement", href: "/hr", icon: Users, gradient: "from-blue-600 to-indigo-600", bgGlow: "bg-blue-500/20", permission: "employees_module" },
    { titleKey: "taxInvoices", href: "/sales-invoices", icon: FileText, gradient: "from-emerald-600 to-teal-600", bgGlow: "bg-emerald-500/20", permission: "sales_module" },
    { titleKey: "ecommerce", href: "/ecommerce-orders", icon: Store, gradient: "from-violet-600 to-purple-600", bgGlow: "bg-violet-500/20", permission: "ecommerce_orders_module" },
    { titleKey: "shipments", href: "/personal-shipments", icon: Truck, gradient: "from-orange-600 to-amber-600", bgGlow: "bg-orange-500/20", permission: "personal_shipments_module" },
    { titleKey: "expenses", href: "/expenses", icon: BadgeDollarSign, gradient: "from-rose-600 to-pink-600", bgGlow: "bg-rose-500/20", permission: "expenses_module" },
    { titleKey: "receiptVouchers", href: "/receipt-vouchers", icon: Receipt, gradient: "from-teal-600 to-cyan-600", bgGlow: "bg-teal-500/20", permission: "receipt_vouchers_module" },
    { titleKey: "accountsCenter", href: "/accounts", icon: BookOpen, gradient: "from-indigo-600 to-blue-600", bgGlow: "bg-indigo-500/20", permission: "accounts_module" },
    { titleKey: "customersList", href: "/customers", icon: Users, gradient: "from-pink-600 to-rose-600", bgGlow: "bg-pink-500/20", permission: "clients_module" },
  ];

  const filteredQuickAccess = quickAccessItems.filter(item => 
    isAdmin || permissions[item.permission] === 1
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-full bg-transparent p-2 md:p-4 transition-colors duration-300">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-4"
      >
          {/* ===== HERO BANNER ===== */}
          <motion.div 
            variants={itemVariants}
                className={cn("relative overflow-hidden rounded-3xl", !isDark && "border border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30")}
            >
              <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900' : 'bg-[#edd3de]'}`} />
            <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] ${isDark ? 'opacity-50' : 'opacity-20'}`} />
            <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-96 h-96 bg-gradient-to-br ${isDark ? 'from-violet-600/20' : 'from-pink-300/20'} to-transparent rounded-full blur-3xl`} />
            <div className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-96 h-96 bg-gradient-to-tr ${isDark ? 'from-emerald-600/20' : 'from-cyan-300/20'} to-transparent rounded-full blur-3xl`} />
            
            <div className="relative z-10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`p-2 rounded-xl backdrop-blur-sm border ${isDark ? 'bg-white/10 border-white/10' : 'bg-white/70 border-rose-200/40'}`}>
                      <Sparkles className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                    </div>
                    <span className={`text-sm font-medium tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('advancedDashboard')}</span>
                  </motion.div>
                  
                  <h1 className={`text-3xl md:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {t('welcomeMessage')}, <span className={`bg-clip-text text-transparent ${isDark ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-pink-500 to-orange-500'}`}>{user.name}</span>
                  </h1>
                  <p className={`text-sm max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('systemDescription')}
                  </p>
                </div>

                    <div className="flex flex-wrap gap-3">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`px-5 py-2.5 rounded-2xl bg-gradient-to-r ${getSubscriptionGradient(subscription.badge)} shadow-lg shadow-emerald-500/25 flex items-center gap-2`}
                    >
                      <Crown className="w-4 h-4 text-white" />
                      <span className="text-white font-semibold text-sm">
                        {subscription.type === "premium" 
                          ? t('permanentSubscription')
                          : subscription.type === "expired"
                            ? t('subscriptionExpired')
                            : `${subscription.remaining_days} ${t('daysRemaining')}`
                        }
                      </span>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={`px-5 py-2.5 rounded-2xl backdrop-blur-sm border flex items-center gap-2 ${isDark ? 'bg-white/10 border-white/10' : 'bg-white/70 border-slate-200/60'}`}
                    >
                      <User className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                      <span className={`font-medium text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {user.userTypeName ? (isRTL ? user.userTypeName.ar : user.userTypeName.en) : (isAdmin ? t('admin') : t('manager'))}
                      </span>
                    </motion.div>
                  </div>
              </div>
            </div>
          </motion.div>

          {/* ===== COMPANY & SYSTEM INFO CARDS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div 
              variants={itemVariants}
              className={cn(
                "group relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 transition-all duration-500",
              isDark 
                    ? "bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 border-slate-600/30 shadow-2xl shadow-black/20 hover:border-slate-500/40"
                    : "bg-[#edd3de] border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30 hover:border-[#c48da3] hover:shadow-xl hover:shadow-[#d4a0b5]/40"
              )}
            >
              <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-32 h-32 bg-gradient-to-br ${isDark ? 'from-blue-500/10 to-indigo-500/10' : 'from-pink-300/20 to-rose-300/20'} rounded-full -translate-y-16 ${isRTL ? 'translate-x-16' : '-translate-x-16'}`} />
              <div className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} w-24 h-24 bg-gradient-to-tr ${isDark ? 'from-emerald-500/10 to-teal-500/10' : 'from-pink-200/15 to-rose-200/15'} rounded-full translate-y-12 ${isRTL ? '-translate-x-12' : 'translate-x-12'}`} />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn(
                    "p-3 rounded-xl shadow-lg",
                    isDark ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25" : "bg-gradient-to-br from-pink-500 to-rose-500 shadow-pink-500/20"
                  )}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{t('companyInfo')}</h3>
                    <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{t('companyData')}</p>
                  </div>
                </div>

                  <div className={cn(
                    "flex items-center gap-4 mb-6 p-4 rounded-xl border",
                    isDark ? "bg-slate-700/40 border-slate-600/40" : "bg-white/60 border-[#c48da3]/40"
                  )}>
                  {company?.logo ? (
                    <img src={company.logo} alt="Logo" className={cn(
                      "w-16 h-16 rounded-xl object-cover shadow-lg ring-2",
                      isDark ? "ring-slate-600/50" : "ring-rose-200/50"
                    )} />
                  ) : (
                    <div className={cn(
                      "w-16 h-16 rounded-xl flex items-center justify-center ring-2",
                      isDark ? "bg-gradient-to-br from-slate-600 to-slate-700 ring-slate-600/50" : "bg-gradient-to-br from-rose-100 to-pink-100 ring-rose-200/50"
                    )}>
                      <Building2 className={cn("w-8 h-8", isDark ? "text-slate-400" : "text-rose-400")} />
                    </div>
                  )}
                    <div>
                      <h4 className={cn("font-bold text-lg", isDark ? "text-white" : "text-slate-800")}>{company?.name || t('companyName')}</h4>
                      <p className={cn("text-sm font-mono", isDark ? "text-slate-400" : "text-slate-500")}>{company?.commercial_number || t('crNumber')}</p>
                    </div>
                </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={cn(
                      "p-4 rounded-xl border transition-colors",
                      isDark ? "bg-slate-700/30 border-slate-600/30 hover:border-blue-500/30" : "bg-white/60 border-[#c48da3]/40 hover:border-[#c48da3]/60"
                    )}>
                      <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", isDark ? "text-slate-500" : "text-slate-400")}>{t('taxNumber')}</p>
                      <p className={cn("text-sm font-bold font-mono", isDark ? "text-slate-200" : "text-slate-700")}>{company?.vat_number || t('notSpecified')}</p>
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl border transition-colors",
                      isDark ? "bg-slate-700/30 border-slate-600/30 hover:border-emerald-500/30" : "bg-white/60 border-[#c48da3]/40 hover:border-[#c48da3]/60"
                    )}>
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", isDark ? "text-slate-500" : "text-slate-400")}>{t('accountStatus')}</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${getSubscriptionGradient(subscription.badge)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                      {subscription.message}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className={cn(
                "group relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 transition-all duration-500",
isDark 
                      ? "bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 border-slate-600/30 shadow-2xl shadow-black/20 hover:border-slate-500/40"
                      : "bg-[#edd3de] border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30 hover:border-[#c48da3] hover:shadow-xl hover:shadow-[#d4a0b5]/40"
                  )}
                >
                  <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-32 h-32 bg-gradient-to-br ${isDark ? 'from-violet-500/10 to-purple-500/10' : 'from-pink-300/20 to-rose-300/20'} rounded-full -translate-y-16 ${isRTL ? '-translate-x-16' : 'translate-x-16'}`} />
                  <div className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-24 h-24 bg-gradient-to-tr ${isDark ? 'from-amber-500/10 to-orange-500/10' : 'from-pink-200/15 to-rose-200/15'} rounded-full translate-y-12 ${isRTL ? 'translate-x-12' : '-translate-x-12'}`} />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn(
                    "p-3 rounded-xl shadow-lg",
                    isDark ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/25" : "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20"
                  )}>
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={cn("font-bold", isDark ? "text-white" : "text-slate-800")}>{t('systemInfo')}</h3>
                    <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{t('accountSettings')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className={cn(
                      "p-4 rounded-xl border transition-colors",
                      isDark ? "bg-slate-700/30 border-slate-600/30 hover:border-violet-500/30" : "bg-white/60 border-[#c48da3]/40 hover:border-[#c48da3]/60"
                    )}>
                      <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", isDark ? "text-slate-500" : "text-slate-400")}>{t('accountType')}</p>
                      <p className={cn("text-sm font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                        {user.userTypeName ? (isRTL ? user.userTypeName.ar : user.userTypeName.en) : (isAdmin ? t('admin') : t('user'))}
                      </p>
                    </div>
                    <div className={cn(
                      "p-4 rounded-xl border transition-colors",
                      isDark ? "bg-slate-700/30 border-slate-600/30 hover:border-amber-500/30" : "bg-white/60 border-[#c48da3]/40 hover:border-[#c48da3]/60"
                    )}>
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", isDark ? "text-slate-500" : "text-slate-400")}>{t('subscriptionType')}</p>
                    <p className={cn("text-sm font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                      {subscription.type === "premium" ? t('permanent') : subscription.type === "active" ? t('active') : t('expired')}
                    </p>
                  </div>
                </div>
                
                <div className={cn(
                  "p-4 rounded-xl border",
                    isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-white/60 border-[#c48da3]/40"
                )}>
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-2", isDark ? "text-amber-400" : "text-amber-600")}>{t('accessToken')}</p>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "font-mono text-sm",
                      isDark ? "text-amber-300" : "text-amber-700",
                      tokenVisible ? "" : "blur-sm select-none"
                    )}>
                      {company?.access_token?.substring(0, 24) || t('notAvailable')}...
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setTokenVisible(!tokenVisible)} 
                        className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-amber-500/15 text-amber-400" : "hover:bg-amber-100 text-amber-600")}
                      >
                        {tokenVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={copyToken} 
                        className={cn("p-2 rounded-lg transition-colors", isDark ? "hover:bg-amber-500/15 text-amber-400" : "hover:bg-amber-100 text-amber-600")}
                      >
                        <Copy size={16} className={copied ? "text-emerald-400" : ""} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ===== FISCAL YEAR ===== */}
          <motion.div 
            variants={itemVariants}
            className={cn(
              "flex items-center justify-between p-4 rounded-2xl backdrop-blur-xl border shadow-xl",
                  isDark 
                      ? "bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 border-slate-600/30"
                      : "bg-[#edd3de] border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl shadow-lg",
                isDark ? "bg-gradient-to-br from-indigo-500 to-blue-600 shadow-indigo-500/25" : "bg-gradient-to-br from-sky-500 to-cyan-500 shadow-sky-500/20"
              )}>
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>{t('fiscalYear')}</span>
            </div>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className={cn(
                "px-4 py-2 rounded-xl border text-sm font-bold outline-none transition-all cursor-pointer",
                isDark 
                    ? "border-slate-600/40 bg-slate-700/50 text-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-500"
                    : "border-[#c48da3]/40 bg-white/60 text-slate-700 focus:ring-2 focus:ring-pink-500/20 focus:border-[#c48da3] hover:border-[#c48da3]"
              )}
            >
              {[2024, 2025, 2026, 2027, 2028].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </motion.div>

          {/* ===== STAT CARDS ===== */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {isAdmin ? (
              <>
                <LuxuryStatCard 
                  icon={Users} 
                  value={stats.users_count || 0} 
                  label={t('activeUsers')}
                  trend={12}
                  gradient="from-blue-500 to-indigo-600"
                  glowColor="blue"
                  isDark={isDark}
                />
                <LuxuryStatCard 
                  icon={Clock} 
                  value={stats.pending_requests || 0} 
                  label={t('newRequests')}
                  trend={5}
                  gradient="from-amber-500 to-orange-600"
                  glowColor="amber"
                  isDark={isDark}
                />
                <LuxuryStatCard 
                  icon={Ban} 
                  value={stats.stopped_companies || 0} 
                  label={t('stoppedCompanies')}
                  trend={-3}
                  gradient="from-rose-500 to-red-600"
                  glowColor="rose"
                  isDark={isDark}
                />
                <LuxuryStatCard 
                  icon={Building2} 
                  value={(stats.users_count || 0) + (stats.pending_requests || 0)} 
                  label={t('totalCompanies')}
                  trend={8}
                  gradient="from-violet-500 to-purple-600"
                  glowColor="violet"
                  isDark={isDark}
                />
              </>
            ) : (
              <>
                <LuxuryStatCard 
                  icon={Users} 
                  value={stats.total_employees || 0} 
                  label={t('totalEmployees')}
                  trend={15}
                  gradient="from-blue-500 to-indigo-600"
                  glowColor="blue"
                  isDark={isDark}
                />
                <LuxuryStatCard 
                    icon={Receipt} 
                    value={yearlyStats.total_invoices_amount} 
                    label={t('totalTaxInvoices')}
                    trend={8}
                    gradient="from-emerald-500 to-teal-600"
                    glowColor="emerald"
                    isCurrency
                    loading={loadingStats}
                    isDark={isDark}
                  />
                  <LuxuryStatCard 
                    icon={BadgeDollarSign} 
                    value={yearlyStats.yearly_expenses} 
                    label={t('totalYearlyExpenses')}
                    trend={12}
                    gradient="from-teal-500 to-cyan-600"
                    glowColor="teal"
                    isCurrency
                    loading={loadingStats}
                    isDark={isDark}
                  />
                {permissions.credit_notes_module === 1 ? (
                  <LuxuryStatCard 
                    icon={CreditCard} 
                    value={stats.credit_notes_total || 0} 
                    label={t('creditNotes')}
                    trend={-2}
                    gradient="from-rose-500 to-red-600"
                    glowColor="rose"
                    isCurrency
                    subValue={`${stats.credit_notes_count || 0} ${t('notes')}`}
                    isDark={isDark}
                  />
                ) : (
                  <LuxuryStatCard 
                    icon={AlertTriangle} 
                    value={stats.expired_iqama || 0} 
                    label={t('expiredIqama')}
                    trend={-5}
                    gradient="from-rose-500 to-red-600"
                    glowColor="rose"
                    isDark={isDark}
                  />
                )}
              </>
            )}
          </div>
        </motion.div>

          {/* ===== QUICK ACCESS ===== */}
          <motion.div 
            variants={itemVariants}
            className={cn(
              "relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 md:p-8",
                  isDark 
                      ? "bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 border-slate-600/30 shadow-2xl shadow-black/20"
                      : "bg-[#edd3de] border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30"
            )}
          >
            <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-64 h-64 bg-gradient-to-br ${isDark ? 'from-amber-500/5 to-orange-500/5' : 'from-orange-200/15 to-amber-200/15'} rounded-full -translate-y-32 ${isRTL ? 'translate-x-32' : '-translate-x-32'}`} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className={cn(
                  "p-3 rounded-xl shadow-lg",
                  isDark ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25" : "bg-gradient-to-br from-orange-500 to-amber-500 shadow-orange-500/20"
                )}>
                  <Bolt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={cn("font-bold text-lg", isDark ? "text-white" : "text-slate-800")}>{t('quickAccess')}</h3>
                  <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{t('quickAccessDescription')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredQuickAccess.map((item, index) => (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "group relative overflow-hidden p-5 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300",
                          isDark 
                              ? "bg-slate-700/30 border-slate-600/30 hover:border-slate-500/50"
                              : "bg-white/60 border-[#c48da3]/40 hover:border-[#c48da3] shadow-md shadow-[#d4a0b5]/20"
                    )}
                  >
                    <div className={`absolute inset-0 ${item.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    <div className="relative z-10 text-center">
                      <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className={cn(
                        "font-bold text-sm transition-colors",
                        isDark ? "text-slate-300 group-hover:text-white" : "text-slate-600 group-hover:text-slate-800"
                      )}>
                          {t(item.titleKey)}
                        </span>
                      
                      <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <ArrowUpRight className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-slate-400")} />
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
      </motion.div>
    </div>
  );
}

interface LuxuryStatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  trend: number;
  gradient: string;
  glowColor: string;
  isCurrency?: boolean;
  subValue?: string;
  loading?: boolean;
  isDark: boolean;
}

function LuxuryStatCard({ icon: Icon, value, label, trend, gradient, glowColor, isCurrency, subValue, loading, isDark }: LuxuryStatCardProps) {
  const { isRTL } = useLocale();
  const t = useTranslations('dashboard');

  // Light mode card styles per glow color (subtle logo-inspired tones)
      const lightCardStyles: Record<string, string> = {
          blue: "bg-[#edd3de] border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30 hover:border-[#c48da3] hover:shadow-xl hover:shadow-[#d4a0b5]/40",
          emerald: "bg-[#edd3de] border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30 hover:border-[#c48da3] hover:shadow-xl hover:shadow-[#d4a0b5]/40",
          teal: "bg-[#edd3de] border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30 hover:border-[#c48da3] hover:shadow-xl hover:shadow-[#d4a0b5]/40",
          rose: "bg-[#edd3de] border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30 hover:border-[#c48da3] hover:shadow-xl hover:shadow-[#d4a0b5]/40",
          amber: "bg-[#edd3de] border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30 hover:border-[#c48da3] hover:shadow-xl hover:shadow-[#d4a0b5]/40",
          violet: "bg-[#edd3de] border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30 hover:border-[#c48da3] hover:shadow-xl hover:shadow-[#d4a0b5]/40",
        };

  const lightCircleStyles: Record<string, string> = {
    blue: "from-sky-200/20 to-transparent",
    emerald: "from-teal-200/20 to-transparent",
    teal: "from-cyan-200/20 to-transparent",
    rose: "from-rose-200/20 to-transparent",
    amber: "from-amber-200/20 to-transparent",
    violet: "from-violet-200/20 to-transparent",
  };

  const darkGlowClasses: Record<string, string> = {
    blue: "shadow-blue-500/10 hover:shadow-blue-500/20",
    emerald: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
    teal: "shadow-teal-500/10 hover:shadow-teal-500/20",
    rose: "shadow-rose-500/10 hover:shadow-rose-500/20",
    amber: "shadow-amber-500/10 hover:shadow-amber-500/20",
    violet: "shadow-violet-500/10 hover:shadow-violet-500/20",
  };

    return (
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        className={cn(
          "group relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl border transition-all duration-500",
          isDark 
              ? `bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 shadow-2xl ${darkGlowClasses[glowColor]} border-slate-600/30 hover:border-slate-500/40`
              : `${lightCardStyles[glowColor]}`
        )}
      >
        <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-24 h-24 bg-gradient-to-br ${isDark ? 'from-slate-700/30' : lightCircleStyles[glowColor]} rounded-full -translate-y-12 ${isRTL ? 'translate-x-12' : '-translate-x-12'} group-hover:scale-150 transition-transform duration-500`} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trend >= 0 ? (isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (isDark ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-50 text-rose-600')}`}>
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              {Math.abs(trend)}%
            </div>
          </div>
          
          <div className="space-y-1">
              <h4 className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-800")}>
                {loading ? (
                  <span className={cn("inline-block w-20 h-8 animate-pulse rounded", isDark ? "bg-slate-700" : "bg-slate-200")} />
                ) : (
                    <>
                      <AnimatedCounter value={value} />
                      {isCurrency && <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500", isRTL ? "mr-1" : "ml-1")}>{t('sar')}</span>}
                    </>
                  )}
              </h4>
              <p className={cn("font-medium text-sm", isDark ? "text-slate-400" : "text-slate-500")}>{label}</p>
              {subValue && <p className={cn("text-xs", isDark ? "text-slate-500" : "text-slate-400")}>{subValue}</p>}
            </div>
          
          <div className={cn("mt-4 pt-4 border-t", isDark ? "border-slate-700/50" : "border-slate-200/70")}>
              <div className={cn("h-2 w-full rounded-full overflow-hidden", isDark ? "bg-slate-700/50" : "bg-slate-100/80")}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(75 + Math.random() * 20, 95)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
              />
            </div>
          </div>
        </div>
      </motion.div>
  );
}
