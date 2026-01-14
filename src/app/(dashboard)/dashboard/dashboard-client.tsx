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
      <div className="space-y-4">
        {/* Main Dashboard Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          <h1 className="text-xl font-black text-center text-gray-800 mb-1">
            مرحباً بك في لوحة التحكم
          </h1>
          <p className="text-center text-gray-500 text-xs mb-4 italic">إدارة شاملة ومتكاملة لجميع عمليات منشأتك</p>
  
          <div className="flex justify-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-lg text-white font-bold text-[10px] flex items-center gap-1.5 ${getBadgeColor(subscription.badge)}`}>
              <Crown size={12} />
              {subscription.message}
            </span>
            <span className="px-3 py-1 rounded-lg bg-gray-600 text-white font-bold text-[10px] flex items-center gap-1.5">
              <User size={12} />
              {isAdmin ? "مدير النظام" : "مدير منشأة"}
            </span>
            {company?.name && (
              <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1.5">
                <Building2 size={12} />
                {company.name}
              </span>
            )}
          </div>
        </motion.div>
  
        {/* Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Company Info Card */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
              <Building2 className="text-blue-500" size={18} />
              <h3 className="text-sm font-bold text-gray-800">معلومات المنشأة</h3>
            </div>
  
            <div className="flex items-center gap-3 mb-4">
              {company?.logo ? (
                <img src={company.logo} alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-sm" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Building2 size={24} />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-gray-800">{company?.name || "اسم المنشأة"}</h4>
                <p className="text-gray-400 text-[10px]">{company?.commercial_number || "رقم السجل التجاري"}</p>
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50/50 p-2.5 rounded-lg border-r-2 border-blue-500">
                <p className="text-[9px] text-gray-400 font-bold mb-0.5 uppercase">الرقم الضريبي</p>
                <p className="text-xs font-bold text-gray-700">{company?.vat_number || "غير محدد"}</p>
              </div>
              <div className="bg-gray-50/50 p-2.5 rounded-lg border-r-2 border-green-500">
                <p className="text-[9px] text-gray-400 font-bold mb-0.5 uppercase">حالة الحساب</p>
                <span className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded ${getBadgeColor(subscription.badge)}`}>
                  {subscription.message}
                </span>
              </div>
            </div>
          </motion.div>
  
          {/* System Info Card */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
              <Crown className="text-purple-500" size={18} />
              <h3 className="text-sm font-bold text-gray-800">معلومات النظام</h3>
            </div>
  
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50/50 p-2.5 rounded-lg border-r-2 border-blue-500">
                <p className="text-[9px] text-gray-400 font-bold mb-0.5 uppercase">نوع الحساب</p>
                <p className="text-xs font-bold text-gray-700">{isAdmin ? "إداري" : "مستخدم"}</p>
              </div>
              <div className="bg-gray-50/50 p-2.5 rounded-lg border-r-2 border-green-500">
                <p className="text-[9px] text-gray-400 font-bold mb-0.5 uppercase">نوع الاشتراك</p>
                <p className="text-xs font-bold text-gray-700">
                  {subscription.type === "premium" ? "دائم" : subscription.type === "active" ? "نشط" : "منتهي"}
                </p>
              </div>
              <div className="bg-gray-50/50 p-2.5 rounded-lg border-r-2 border-orange-500 col-span-2">
                <p className="text-[9px] text-gray-400 font-bold mb-0.5 uppercase">رمز الوصول</p>
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-[10px] text-gray-600 ${tokenVisible ? "" : "blur-sm select-none"}`}>
                    {company?.access_token?.substring(0, 20) || "غير متاح"}...
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setTokenVisible(!tokenVisible)} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400">
                      {tokenVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button onClick={copyToken} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-400">
                      <Copy size={12} className={copied ? "text-green-500" : ""} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
  
        {/* Year Filter */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 text-gray-700 font-bold text-xs">
            <Calendar className="text-blue-500" size={16} />
            <span>السنة المالية</span>
          </div>
          <select className="px-3 py-1 rounded-lg border border-gray-200 bg-white text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
            {[2024, 2025, 2026, 2027, 2028].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </motion.div>
  
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isAdmin ? (
            <>
              <StatCard 
                icon={Users} 
                value={stats.users_count || 0} 
                label="المستخدمين النشطين" 
                badge="نشط"
                badgeColor="bg-green-500"
                iconColor="bg-blue-50"
                textColor="text-blue-600"
                delay={0.4}
              />
              <StatCard 
                icon={Clock} 
                value={stats.pending_requests || 0} 
                label="طلبات جديدة" 
                badge="انتظار"
                badgeColor="bg-yellow-500"
                iconColor="bg-yellow-50"
                textColor="text-yellow-600"
                delay={0.5}
              />
              <StatCard 
                icon={Ban} 
                value={stats.stopped_companies || 0} 
                label="شركات متوقفة" 
                badge="متوقف"
                badgeColor="bg-red-500"
                iconColor="bg-red-50"
                textColor="text-red-600"
                delay={0.6}
              />
              <StatCard 
                icon={Building2} 
                value={(stats.users_count || 0) + (stats.pending_requests || 0)} 
                label="إجمالي الشركات" 
                badge="الكل"
                badgeColor="bg-purple-500"
                iconColor="bg-purple-50"
                textColor="text-purple-600"
                delay={0.7}
              />
            </>
          ) : (
            <>
              <StatCard 
                icon={Users} 
                value={stats.total_employees || 0} 
                label="إجمالي الموظفين" 
                badge="موظف"
                badgeColor="bg-blue-500"
                iconColor="bg-blue-50"
                textColor="text-blue-600"
                delay={0.4}
              />
              <StatCard 
                icon={Package} 
                value={stats.total_packages || 0} 
                label="الباقات المضافة" 
                badge="باقة"
                badgeColor="bg-green-500"
                iconColor="bg-green-50"
                textColor="text-green-600"
                delay={0.5}
              />
              <StatCard 
                icon={UserCheck} 
                value={stats.active_employees || 0} 
                label="الموظفين النشطين" 
                badge="نشط"
                badgeColor="bg-teal-500"
                iconColor="bg-teal-50"
                textColor="text-teal-600"
                delay={0.6}
              />
              {permissions.credit_notes_module === 1 ? (
                <StatCard 
                  icon={CreditCard} 
                  value={stats.credit_notes_total || 0} 
                  label="إشعارات الدائن" 
                  badge="دائن"
                  badgeColor="bg-red-500"
                  iconColor="bg-red-50"
                  textColor="text-red-600"
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
                  iconColor="bg-red-50"
                  textColor="text-red-600"
                  delay={0.7}
                />
              )}
            </>
          )}
        </div>
  
        {/* Quick Access */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Bolt className="text-yellow-500" size={16} />
            الوصول السريع
          </h3>
  
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredQuickAccess.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                whileHover={{ y: -3 }}
                className="bg-gray-50/50 hover:bg-white p-3 rounded-lg text-center transition-all border border-transparent hover:border-gray-100 hover:shadow-sm group"
              >
                <div className={`w-10 h-10 mx-auto mb-2 rounded-lg ${item.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <item.icon className="text-white" size={16} />
                </div>
                <span className="font-bold text-gray-700 text-[10px]">{item.title}</span>
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
    textColor: string;
    delay: number;
    isCurrency?: boolean;
    subValue?: string;
  }
  
  function StatCard({ icon: Icon, value, label, badge, badgeColor, iconColor, textColor, delay, isCurrency, subValue }: StatCardProps) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -3 }}
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center relative overflow-hidden"
      >
        <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-black text-white ${badgeColor} uppercase`}>
          {badge}
        </span>
        
        <div className={`w-10 h-10 mx-auto mb-2 rounded-lg ${iconColor} flex items-center justify-center text-blue-500`}>
          <Icon className={textColor} size={20} />
        </div>
        
        <h4 className="text-xl font-black text-gray-800 mb-0.5 tracking-tight">
          {isCurrency ? `${value.toLocaleString('en-US')}` : value.toLocaleString('en-US')}
          {isCurrency && <span className="text-[10px] mr-1">ر.س</span>}
        </h4>
        <p className="text-gray-400 font-bold text-[10px]">{label}</p>
        {subValue && <p className="text-[8px] text-gray-300 mt-0.5">{subValue}</p>}
      </motion.div>
    );
  }

