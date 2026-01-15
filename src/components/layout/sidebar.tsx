"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Building2, 
  Users, 
  FileText, 
  Receipt, 
  BadgeDollarSign, 
  Car, 
  Store, 
  Truck, 
  BarChart3, 
  Settings, 
  LogOut,
  Mail,
  Scale,
  BookOpen,
  PieChart,
  Bell,
  Key,
  PlusCircle,
  Search,
  MessageSquare,
  Package,
  Calendar,
  HandCoins,
  FileEdit,
  CreditCard,
  Landmark,
  FileSpreadsheet,
  Calculator,
  Coins,
  Sparkles,
  ChevronLeft,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  permission?: string;
  dividerAfter?: boolean;
  gradient?: string;
}

const navItems: NavItem[] = [
  { title: "الرئيسية", href: "/dashboard", icon: Home, gradient: "from-blue-500 to-cyan-500" },
  
  { title: "طلبات تسجيل الشركات", href: "/admin/companies", icon: Building2, adminOnly: true, gradient: "from-violet-500 to-purple-500" },
  { title: "إضافة شركة جديدة", href: "/register", icon: PlusCircle, adminOnly: true, gradient: "from-emerald-500 to-green-500" },
  { title: "توليد رمز الاشتراك", href: "/admin/tokens/generate", icon: Key, adminOnly: true, gradient: "from-amber-500 to-yellow-500" },
  { title: "بحث عن رمز اشتراك", href: "/admin/tokens/search", icon: Search, adminOnly: true, gradient: "from-sky-500 to-blue-500" },
  { title: "الدعم الفني", href: "/admin/chat", icon: MessageSquare, adminOnly: true, gradient: "from-indigo-500 to-violet-500" },
  { title: "إشعارات الإدارة", href: "/admin/notifications", icon: Bell, adminOnly: true, gradient: "from-rose-500 to-pink-500" },
  { title: "نظام الرواتب الخاصة", href: "/admin/special-salaries", icon: Coins, adminOnly: true, dividerAfter: true, gradient: "from-yellow-500 to-orange-500" },
  
  { title: "إدارة الموارد البشرية", href: "/hr", icon: Users, permission: "employees_module", gradient: "from-blue-500 to-indigo-500" },
  
  { title: "قائمة العملاء", href: "/customers", icon: Users, permission: "clients_module", gradient: "from-cyan-500 to-teal-500" },
  
  { title: "السندات المالية", href: "/financial-vouchers", icon: Receipt, permission: "receipts_module", gradient: "from-indigo-500 to-purple-500" },
  { title: "مسيرات الرواتب", href: "/salary-payrolls", icon: BadgeDollarSign, permission: "salary_payrolls_module", gradient: "from-teal-500 to-emerald-500" },
  { title: "الفواتير الضريبية", href: "/sales-invoices", icon: FileText, permission: "sales_module", gradient: "from-blue-500 to-sky-500" },
  { title: "إشعارات الدائن", href: "/credit-notes", icon: CreditCard, permission: "credit_notes_module", gradient: "from-red-500 to-rose-500" },
  { title: "إدارة المركبات", href: "/fleet", icon: Car, permission: "sales_module", gradient: "from-yellow-500 to-amber-500" },
  
  { title: "التجارة الإلكترونية", href: "/ecommerce-orders", icon: Store, permission: "ecommerce_orders_module", gradient: "from-pink-500 to-rose-500" },
  { title: "طلبات اليوم", href: "/ecommerce-orders/today", icon: Calendar, permission: "daily_orders_module", gradient: "from-fuchsia-500 to-pink-500" },
  { title: "إدارة المتاجر", href: "/ecommerce-stores", icon: Store, permission: "ecommerce_stores_module", gradient: "from-rose-500 to-red-500" },
  
  { title: "الشحنات الشخصية", href: "/personal-shipments", icon: Truck, permission: "personal_shipments_module", gradient: "from-sky-500 to-cyan-500" },
  { title: "إدارة الشحنات", href: "/manage-shipments", icon: Package, permission: "manage_shipments_module", gradient: "from-indigo-500 to-blue-500" },
  
  { title: "العمولات الشهرية", href: "/monthly-commissions", icon: HandCoins, permission: "monthly_commissions_module", gradient: "from-amber-500 to-orange-500" },
  { title: "تقرير العمولات", href: "/commissions-summary", icon: FileSpreadsheet, permission: "commissions_summary_module", gradient: "from-lime-500 to-green-500" },
  
  { title: "مركز المصروفات", href: "/expenses", icon: BarChart3, permission: "expenses_module", gradient: "from-red-500 to-orange-500" },
  { title: "القيود اليومية", href: "/journal-entries", icon: FileEdit, permission: "journal_entries_module", gradient: "from-violet-500 to-indigo-500" },
  { title: "ملخص الربح والخسارة", href: "/profit-loss", icon: PieChart, permission: "income_report_module", gradient: "from-sky-500 to-blue-500" },
  
  { title: "الخطابات الجاهزة", href: "/letters-templates", icon: Mail, permission: "letters_templates_module", gradient: "from-blue-500 to-indigo-500" },
  
  { title: "مركز الحسابات", href: "/accounts", icon: BookOpen, permission: "accounts_module", gradient: "from-orange-500 to-amber-500" },
  { title: "مراكز التكلفة", href: "/cost-centers", icon: Landmark, permission: "cost_centers_module", gradient: "from-slate-500 to-gray-500" },
  { title: "دفتر الأستاذ العام", href: "/general-ledger", icon: BookOpen, permission: "ledger_module", gradient: "from-zinc-500 to-neutral-500" },
  { title: "ميزان المراجعة", href: "/trial-balance", icon: Scale, permission: "trial_balance_module", gradient: "from-gray-500 to-slate-500" },
  { title: "قائمة الدخل", href: "/income-statement", icon: BarChart3, permission: "income_statement_module", gradient: "from-emerald-500 to-teal-500" },
  { title: "الميزانية العمومية", href: "/balance-sheet", icon: FileText, permission: "balance_sheet_module", gradient: "from-blue-500 to-cyan-500" },
  { title: "إعدادات الضريبة", href: "/tax-settings", icon: Calculator, permission: "balance_sheet_module", gradient: "from-rose-500 to-pink-500" },
  { title: "إعدادات النظام", href: "/settings", icon: Settings, gradient: "from-slate-400 to-gray-500" },
];

interface SidebarProps {
  userRole?: string;
  permissions?: Record<string, number>;
}

export function Sidebar({ userRole, permissions = {} }: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = userRole === "admin";

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.permission && !isAdmin && permissions[item.permission] !== 1) return false;
    return true;
  });

  const handleLogout = async () => {
    document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.02 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="w-64 h-screen overflow-hidden flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-600/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/10 via-white/5 to-white/10" />
      
      <div className="relative z-10 p-5 border-b border-white/5">
        {mounted && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-4 rounded-2xl shadow-2xl shadow-blue-500/30 border border-white/10">
                <Truck size={28} className="text-white drop-shadow-lg" />
              </div>
              <motion.div 
                className="absolute -top-1 -right-1"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles size={14} className="text-amber-400" />
              </motion.div>
            </motion.div>
            
            <div className="text-center">
              <h2 className="text-sm font-black tracking-wider bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                LOGISTICS PRO
              </h2>
              <p className="text-[9px] text-white/30 font-medium tracking-[0.2em] mt-1">ENTERPRISE EDITION</p>
            </div>
          </motion.div>
        )}
      </div>

      <nav className="relative z-10 flex-1 p-3 overflow-y-auto custom-scrollbar">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          {filteredItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const isHovered = hoveredItem === item.href;
            
            return (
              <React.Fragment key={item.href}>
                <motion.div variants={itemVariants}>
                  <Link href={item.href}>
                    <motion.div
                      onHoverStart={() => setHoveredItem(item.href)}
                      onHoverEnd={() => setHoveredItem(null)}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden",
                        isActive 
                          ? "bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg shadow-blue-500/10" 
                          : "hover:bg-white/5 border border-transparent"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-sidebar-bg"
                          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      
                      <AnimatePresence>
                        {(isActive || isHovered) && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 3 }}
                            exit={{ opacity: 0, width: 0 }}
                            className={cn(
                              "absolute right-0 top-2 bottom-2 rounded-full",
                              isActive 
                                ? `bg-gradient-to-b ${item.gradient}` 
                                : "bg-white/30"
                            )}
                          />
                        )}
                      </AnimatePresence>

                      <div className={cn(
                        "relative p-2 rounded-lg transition-all duration-300",
                        isActive 
                          ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                          : "bg-white/5 group-hover:bg-white/10"
                      )}>
                        <item.icon size={16} className={cn(
                          "transition-all duration-300",
                          isActive ? "text-white" : "text-white/50 group-hover:text-white/80"
                        )} />
                      </div>
                      
                      <span className={cn(
                        "relative font-bold text-[12px] tracking-wide transition-all duration-300",
                        isActive ? "text-white" : "text-white/50 group-hover:text-white/90"
                      )}>
                        {item.title}
                      </span>

                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute left-3"
                        >
                          <ChevronLeft size={14} className="text-white/50" />
                        </motion.div>
                      )}
                    </motion.div>
                  </Link>
                </motion.div>
                
                {item.dividerAfter && (
                  <div className="relative my-4 mx-4">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 bg-slate-900 px-2">
                      <Zap size={10} className="text-white/20" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </motion.div>
      </nav>

      <div className="relative z-10 p-4 border-t border-white/5 bg-black/20 backdrop-blur-xl">
        <motion.button 
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="relative w-full overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-red-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-rose-500/30 transition-all">
            <LogOut size={16} className="text-rose-400 group-hover:text-rose-300 transition-colors" />
            <span className="font-bold text-[12px] text-white/70 group-hover:text-white transition-colors">تسجيل الخروج</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
