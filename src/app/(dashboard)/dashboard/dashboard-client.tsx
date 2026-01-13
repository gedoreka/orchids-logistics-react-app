"use client";

import { motion } from "framer-motion";
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
  BookOpen
} from "lucide-react";
import { useState } from "react";

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

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "success": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "danger": return "bg-red-500";
      case "primary": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const quickAccessItems = [
    { title: "إدارة الموارد البشرية", href: "/hr", icon: Users, color: "bg-gradient-to-br from-blue-500 to-blue-600", permission: "employees_module" },
    { title: "الفواتير الضريبية", href: "/sales-invoices", icon: FileText, color: "bg-gradient-to-br from-green-500 to-green-600", permission: "sales_module" },
    { title: "التجارة الإلكترونية", href: "/ecommerce-orders", icon: Store, color: "bg-gradient-to-br from-purple-500 to-purple-600", permission: "ecommerce_orders_module" },
    { title: "الشحنات", href: "/personal-shipments", icon: Truck, color: "bg-gradient-to-br from-orange-500 to-orange-600", permission: "personal_shipments_module" },
    { title: "المصروفات", href: "/expenses", icon: BadgeDollarSign, color: "bg-gradient-to-br from-red-500 to-red-600", permission: "expenses_module" },
    { title: "سندات القبض", href: "/receipt-vouchers", icon: Receipt, color: "bg-gradient-to-br from-teal-500 to-teal-600", permission: "receipt_vouchers_module" },
    { title: "مركز الحسابات", href: "/accounts", icon: BookOpen, color: "bg-gradient-to-br from-indigo-500 to-indigo-600", permission: "accounts_module" },
    { title: "قائمة العملاء", href: "/customers", icon: Users, color: "bg-gradient-to-br from-pink-500 to-pink-600", permission: "clients_module" },
  ];

  const filteredQuickAccess = quickAccessItems.filter(item => 
    isAdmin || permissions[item.permission] === 1
  );

  return (
    <div className="space-y-8">
      {/* Main Dashboard Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <h1 className="text-3xl font-black text-center bg-gradient-to-r from-[#2c3e50] to-[#3498db] bg-clip-text text-transparent mb-2">
          مرحباً بك في لوحة التحكم
        </h1>
        <p className="text-center text-gray-500 mb-8">إدارة شاملة ومتكاملة لجميع عمليات منشأتك</p>

        <div className="flex justify-center gap-4 flex-wrap">
          <span className={`px-4 py-2 rounded-full text-white font-bold text-sm flex items-center gap-2 ${getBadgeColor(subscription.badge)}`}>
            <Crown size={16} />
            {subscription.message}
          </span>
          <span className="px-4 py-2 rounded-full bg-gray-500 text-white font-bold text-sm flex items-center gap-2">
            <User size={16} />
            {isAdmin ? "مدير النظام" : "مدير منشأة"}
          </span>
          {company?.name && (
            <span className="px-4 py-2 rounded-full bg-blue-500 text-white font-bold text-sm flex items-center gap-2">
              <Building2 size={16} />
              {company.name}
            </span>
          )}
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Building2 className="text-blue-500" size={28} />
            <h3 className="text-xl font-bold text-gray-800">معلومات المنشأة</h3>
          </div>

          <div className="flex items-center gap-4 mb-6">
            {company?.logo ? (
              <img src={company.logo} alt="Logo" className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Building2 className="text-white" size={32} />
              </div>
            )}
            <div>
              <h4 className="text-lg font-bold text-gray-800">{company?.name || "اسم المنشأة"}</h4>
              <p className="text-gray-500 text-sm">{company?.commercial_number || "رقم السجل التجاري"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border-r-4 border-blue-500">
              <p className="text-xs text-gray-500 mb-1">الرقم الضريبي</p>
              <p className="font-bold text-gray-800">{company?.vat_number || "غير محدد"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border-r-4 border-green-500">
              <p className="text-xs text-gray-500 mb-1">حالة الحساب</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getBadgeColor(subscription.badge)}`}>
                {subscription.message}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border-r-4 border-purple-500 col-span-2">
              <p className="text-xs text-gray-500 mb-1">تاريخ الإنشاء</p>
              <p className="font-bold text-gray-800">{company?.created_at || "غير محدد"}</p>
            </div>
          </div>
        </motion.div>

        {/* System Info Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <Crown className="text-purple-500" size={28} />
            <h3 className="text-xl font-bold text-gray-800">معلومات النظام</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border-r-4 border-blue-500">
              <p className="text-xs text-gray-500 mb-1">نوع الحساب</p>
              <p className="font-bold text-gray-800">{isAdmin ? "حساب إداري" : "حساب مستخدم"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border-r-4 border-green-500">
              <p className="text-xs text-gray-500 mb-1">نوع الاشتراك</p>
              <p className="font-bold text-gray-800">
                {subscription.type === "premium" ? "دائم" : subscription.type === "active" ? "نشط" : "منتهي"}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border-r-4 border-purple-500">
              <p className="text-xs text-gray-500 mb-1">حالة النظام</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${company?.is_active ? "bg-green-500" : "bg-red-500"}`}>
                {company?.is_active ? "نشط" : "متوقف"}
              </span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border-r-4 border-orange-500">
              <p className="text-xs text-gray-500 mb-1">رمز الوصول</p>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs ${tokenVisible ? "" : "blur-sm select-none"}`}>
                  {company?.access_token?.substring(0, 12) || "غير متاح"}...
                </span>
                <button onClick={() => setTokenVisible(!tokenVisible)} className="p-1 hover:bg-gray-200 rounded">
                  {tokenVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={copyToken} className="p-1 hover:bg-gray-200 rounded">
                  <Copy size={14} className={copied ? "text-green-500" : ""} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Year Filter */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-white/30 flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3 text-gray-700 font-bold">
          <Calendar className="text-blue-500" size={24} />
          <span>اختر السنة المالية</span>
        </div>
        <select className="px-5 py-3 rounded-xl border border-gray-200 bg-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
          {[2024, 2025, 2026, 2027, 2028].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatCard 
              icon={Users} 
              value={stats.users_count || 0} 
              label="المستخدمين النشطين" 
              badge="نشط"
              badgeColor="bg-green-500"
              iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
              delay={0.4}
            />
            <StatCard 
              icon={Clock} 
              value={stats.pending_requests || 0} 
              label="طلبات جديدة" 
              badge="قيد الانتظار"
              badgeColor="bg-yellow-500"
              iconColor="bg-gradient-to-br from-yellow-500 to-orange-500"
              delay={0.5}
            />
            <StatCard 
              icon={Ban} 
              value={stats.stopped_companies || 0} 
              label="شركات متوقفة" 
              badge="متوقف"
              badgeColor="bg-red-500"
              iconColor="bg-gradient-to-br from-red-500 to-red-600"
              delay={0.6}
            />
            <StatCard 
              icon={Building2} 
              value={(stats.users_count || 0) + (stats.pending_requests || 0)} 
              label="إجمالي الشركات" 
              badge="الكل"
              badgeColor="bg-purple-500"
              iconColor="bg-gradient-to-br from-purple-500 to-purple-600"
              delay={0.7}
            />
          </>
        ) : (
          <>
            <StatCard 
              icon={Users} 
              value={stats.total_employees || 0} 
              label="إجمالي الموظفين" 
              badge="موظفين"
              badgeColor="bg-blue-500"
              iconColor="bg-gradient-to-br from-blue-500 to-blue-600"
              delay={0.4}
            />
            <StatCard 
              icon={Package} 
              value={stats.total_packages || 0} 
              label="الباقات المضافة" 
              badge="باقات"
              badgeColor="bg-green-500"
              iconColor="bg-gradient-to-br from-green-500 to-green-600"
              delay={0.5}
            />
            <StatCard 
              icon={UserCheck} 
              value={stats.active_employees || 0} 
              label="الموظفين النشطين" 
              badge="نشط"
              badgeColor="bg-teal-500"
              iconColor="bg-gradient-to-br from-teal-500 to-teal-600"
              delay={0.6}
            />
            {permissions.credit_notes_module === 1 ? (
              <StatCard 
                icon={CreditCard} 
                value={stats.credit_notes_total || 0} 
                label="إشعارات الدائن" 
                badge="دائن"
                badgeColor="bg-red-500"
                iconColor="bg-gradient-to-br from-red-500 to-red-600"
                delay={0.7}
                isCurrency
                subValue={`${stats.credit_notes_count || 0} إشعار`}
              />
            ) : (
              <StatCard 
                icon={AlertTriangle} 
                value={stats.expired_iqama || 0} 
                label="إقامات منتهية" 
                badge="تنبيه"
                badgeColor="bg-red-500"
                iconColor="bg-gradient-to-br from-red-500 to-red-600"
                delay={0.7}
              />
            )}
          </>
        )}
      </div>

      {/* Quick Access */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/30"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Bolt className="text-yellow-500" size={24} />
          الوصول السريع
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredQuickAccess.map((item, index) => (
            <motion.a
              key={item.href}
              href={item.href}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-gray-50 hover:bg-white p-6 rounded-2xl text-center transition-all border border-transparent hover:border-gray-200 hover:shadow-lg group"
            >
              <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <item.icon className="text-white" size={24} />
              </div>
              <span className="font-semibold text-gray-700 text-sm">{item.title}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  badge: string;
  badgeColor: string;
  iconColor: string;
  delay: number;
  isCurrency?: boolean;
  subValue?: string;
}

function StatCard({ icon: Icon, value, label, badge, badgeColor, iconColor, delay, isCurrency, subValue }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30 text-center relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-transparent" />
      <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white ${badgeColor}`}>
        {badge}
      </span>
      
      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${iconColor} flex items-center justify-center shadow-lg`}>
        <Icon className="text-white" size={28} />
      </div>
      
      <h4 className="text-3xl font-black text-gray-800 mb-2">
        {isCurrency ? `${value.toLocaleString()} ر.س` : value.toLocaleString()}
      </h4>
      <p className="text-gray-500 font-semibold">{label}</p>
      {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
    </motion.div>
  );
}
