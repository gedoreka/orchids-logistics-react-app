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

interface DashboardClientProps {
  user: {
    name: string;
    email: string;
    role: string;
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
    total_packages?: number;
    active_employees?: number;
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

  return <span>{displayValue}</span>;
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
    { title: "إدارة الموارد البشرية", href: "/hr", icon: Users, gradient: "from-blue-600 to-indigo-600", bgGlow: "bg-blue-500/20", permission: "employees_module" },
    { title: "الفواتير الضريبية", href: "/sales-invoices", icon: FileText, gradient: "from-emerald-600 to-teal-600", bgGlow: "bg-emerald-500/20", permission: "sales_module" },
    { title: "التجارة الإلكترونية", href: "/ecommerce-orders", icon: Store, gradient: "from-violet-600 to-purple-600", bgGlow: "bg-violet-500/20", permission: "ecommerce_orders_module" },
    { title: "الشحنات", href: "/personal-shipments", icon: Truck, gradient: "from-orange-600 to-amber-600", bgGlow: "bg-orange-500/20", permission: "personal_shipments_module" },
    { title: "المصروفات", href: "/expenses", icon: BadgeDollarSign, gradient: "from-rose-600 to-pink-600", bgGlow: "bg-rose-500/20", permission: "expenses_module" },
    { title: "سندات القبض", href: "/receipt-vouchers", icon: Receipt, gradient: "from-teal-600 to-cyan-600", bgGlow: "bg-teal-500/20", permission: "receipt_vouchers_module" },
    { title: "مركز الحسابات", href: "/accounts", icon: BookOpen, gradient: "from-indigo-600 to-blue-600", bgGlow: "bg-indigo-500/20", permission: "accounts_module" },
    { title: "قائمة العملاء", href: "/customers", icon: Users, gradient: "from-pink-600 to-rose-600", bgGlow: "bg-pink-500/20", permission: "clients_module" },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 p-2 md:p-4">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full space-y-4"
      >
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-600/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-600/20 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-slate-400 text-sm font-medium tracking-wide">لوحة التحكم المتقدمة</span>
                </motion.div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  مرحباً بك، <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{user.name}</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-md">
                  إدارة شاملة ومتكاملة لجميع عمليات منشأتك بتصميم عصري ومتطور
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`px-5 py-2.5 rounded-2xl bg-gradient-to-r ${getSubscriptionGradient(subscription.badge)} shadow-lg shadow-emerald-500/25 flex items-center gap-2`}
                >
                  <Crown className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm">{subscription.message}</span>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-300" />
                  <span className="text-slate-300 font-medium text-sm">{isAdmin ? "مدير النظام" : "مدير منشأة"}</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div 
            variants={itemVariants}
            className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-slate-200/50 p-6 hover:shadow-3xl transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400/10 to-teal-400/10 rounded-full translate-y-12 -translate-x-12" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">معلومات المنشأة</h3>
                  <p className="text-xs text-slate-400">بيانات الشركة الأساسية</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                {company?.logo ? (
                  <img src={company.logo} alt="Logo" className="w-16 h-16 rounded-xl object-cover shadow-lg" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{company?.name || "اسم المنشأة"}</h4>
                  <p className="text-slate-500 text-sm font-mono">{company?.commercial_number || "رقم السجل التجاري"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:border-blue-200 transition-colors">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">الرقم الضريبي</p>
                  <p className="text-sm font-bold text-slate-700 font-mono">{company?.vat_number || "غير محدد"}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:border-emerald-200 transition-colors">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">حالة الحساب</p>
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
            className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-slate-200/50 p-6 hover:shadow-3xl transition-all duration-500"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full -translate-y-16 -translate-x-16" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-amber-400/10 to-orange-400/10 rounded-full translate-y-12 translate-x-12" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">معلومات النظام</h3>
                  <p className="text-xs text-slate-400">إعدادات الحساب والاشتراك</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:border-violet-200 transition-colors">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">نوع الحساب</p>
                  <p className="text-sm font-bold text-slate-700">{isAdmin ? "إداري" : "مستخدم"}</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 hover:border-amber-200 transition-colors">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">نوع الاشتراك</p>
                  <p className="text-sm font-bold text-slate-700">
                    {subscription.type === "premium" ? "دائم" : subscription.type === "active" ? "نشط" : "منتهي"}
                  </p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-2">رمز الوصول</p>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-sm text-amber-800 ${tokenVisible ? "" : "blur-sm select-none"}`}>
                    {company?.access_token?.substring(0, 24) || "غير متاح"}...
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setTokenVisible(!tokenVisible)} 
                      className="p-2 hover:bg-amber-200/50 rounded-lg transition-colors text-amber-600"
                    >
                      {tokenVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                      onClick={copyToken} 
                      className="p-2 hover:bg-amber-200/50 rounded-lg transition-colors text-amber-600"
                    >
                      <Copy size={16} className={copied ? "text-emerald-600" : ""} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/25">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-700">السنة المالية</span>
          </div>
          <select className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer hover:border-indigo-300">
            {[2024, 2025, 2026, 2027, 2028].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {isAdmin ? (
              <>
                <LuxuryStatCard 
                  icon={Users} 
                  value={stats.users_count || 0} 
                  label="المستخدمين النشطين" 
                  trend={12}
                  gradient="from-blue-500 to-indigo-600"
                  glowColor="blue"
                />
                <LuxuryStatCard 
                  icon={Clock} 
                  value={stats.pending_requests || 0} 
                  label="طلبات جديدة" 
                  trend={5}
                  gradient="from-amber-500 to-orange-600"
                  glowColor="amber"
                />
                <LuxuryStatCard 
                  icon={Ban} 
                  value={stats.stopped_companies || 0} 
                  label="شركات متوقفة" 
                  trend={-3}
                  gradient="from-rose-500 to-red-600"
                  glowColor="rose"
                />
                <LuxuryStatCard 
                  icon={Building2} 
                  value={(stats.users_count || 0) + (stats.pending_requests || 0)} 
                  label="إجمالي الشركات" 
                  trend={8}
                  gradient="from-violet-500 to-purple-600"
                  glowColor="violet"
                />
              </>
            ) : (
              <>
                <LuxuryStatCard 
                  icon={Users} 
                  value={stats.total_employees || 0} 
                  label="إجمالي الموظفين" 
                  trend={15}
                  gradient="from-blue-500 to-indigo-600"
                  glowColor="blue"
                />
                <LuxuryStatCard 
                  icon={Package} 
                  value={stats.total_packages || 0} 
                  label="الباقات المضافة" 
                  trend={8}
                  gradient="from-emerald-500 to-teal-600"
                  glowColor="emerald"
                />
                <LuxuryStatCard 
                  icon={UserCheck} 
                  value={stats.active_employees || 0} 
                  label="الموظفين النشطين" 
                  trend={12}
                  gradient="from-teal-500 to-cyan-600"
                  glowColor="teal"
                />
                {permissions.credit_notes_module === 1 ? (
                  <LuxuryStatCard 
                    icon={CreditCard} 
                    value={stats.credit_notes_total || 0} 
                    label="إشعارات الدائن" 
                    trend={-2}
                    gradient="from-rose-500 to-red-600"
                    glowColor="rose"
                    isCurrency
                    subValue={`${stats.credit_notes_count || 0} إشعار`}
                  />
                ) : (
                  <LuxuryStatCard 
                    icon={AlertTriangle} 
                    value={stats.expired_iqama || 0} 
                    label="إقامات منتهية" 
                    trend={-5}
                    gradient="from-rose-500 to-red-600"
                    glowColor="rose"
                  />
                )}
              </>
            )}
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-slate-200/50 p-6 md:p-8"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/5 to-orange-400/5 rounded-full -translate-y-32 translate-x-32" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30">
                <Bolt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">الوصول السريع</h3>
                <p className="text-xs text-slate-400">انتقل مباشرة إلى الأقسام الرئيسية</p>
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
                  className="group relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-100 hover:border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className={`absolute inset-0 ${item.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="relative z-10 text-center">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-slate-700 text-sm group-hover:text-slate-900 transition-colors">{item.title}</span>
                    
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
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
}

function LuxuryStatCard({ icon: Icon, value, label, trend, gradient, glowColor, isCurrency, subValue }: LuxuryStatCardProps) {
  const glowClasses: Record<string, string> = {
    blue: "shadow-blue-200/50 hover:shadow-blue-300/50",
    emerald: "shadow-emerald-200/50 hover:shadow-emerald-300/50",
    teal: "shadow-teal-200/50 hover:shadow-teal-300/50",
    rose: "shadow-rose-200/50 hover:shadow-rose-300/50",
    amber: "shadow-amber-200/50 hover:shadow-amber-300/50",
    violet: "shadow-violet-200/50 hover:shadow-violet-300/50",
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-2xl ${glowClasses[glowColor]} border border-white/60 backdrop-blur-xl hover:shadow-3xl transition-all duration-500`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100/50 to-transparent rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            {Math.abs(trend)}%
          </div>
        </div>
        
        <div className="space-y-1">
          <h4 className="text-3xl font-bold text-slate-800 tracking-tight">
            <AnimatedCounter value={value} />
            {isCurrency && <span className="text-sm text-slate-500 mr-1">ر.س</span>}
          </h4>
          <p className="text-slate-500 font-medium text-sm">{label}</p>
          {subValue && <p className="text-xs text-slate-400">{subValue}</p>}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
