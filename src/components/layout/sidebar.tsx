"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  DollarSign,
  Landmark,
  FileSpreadsheet,
  Calculator,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  permission?: string;
  dividerAfter?: boolean;
  iconColor?: string;
}

const navItems: NavItem[] = [
  { title: "الرئيسية", href: "/dashboard", icon: Home, iconColor: "text-blue-400" },
  
  { title: "طلبات تسجيل الشركات", href: "/admin/companies", icon: Building2, adminOnly: true, iconColor: "text-purple-400" },
  { title: "إضافة شركة جديدة", href: "/register", icon: PlusCircle, adminOnly: true, iconColor: "text-emerald-400" },
  { title: "توليد رمز الاشتراك", href: "/admin/tokens/generate", icon: Key, adminOnly: true, iconColor: "text-amber-400" },
  { title: "بحث عن رمز اشتراك", href: "/admin/tokens/search", icon: Search, adminOnly: true, iconColor: "text-sky-400" },
  { title: "الدعم الفني", href: "/admin/chat", icon: MessageSquare, adminOnly: true, iconColor: "text-indigo-400" },
  { title: "إشعارات الإدارة", href: "/admin/notifications", icon: Bell, adminOnly: true, iconColor: "text-rose-400" },
  { title: "نظام الرواتب الخاصة", href: "/admin/special-salaries", icon: Coins, adminOnly: true, dividerAfter: true, iconColor: "text-yellow-400" },
  
  { title: "إدارة الموارد البشرية", href: "/hr", icon: Users, permission: "employees_module", iconColor: "text-blue-400" },
  
  { title: "قائمة العملاء", href: "/customers", icon: Users, permission: "clients_module", iconColor: "text-cyan-400" },
  
  { title: "السندات المالية", href: "/financial-vouchers", icon: Receipt, permission: "receipts_module", iconColor: "text-indigo-400" },
  { title: "مسيرات الرواتب", href: "/salary-payrolls", icon: BadgeDollarSign, permission: "salary_payrolls_module", iconColor: "text-teal-400" },
  { title: "الفواتير الضريبية", href: "/sales-invoices", icon: FileText, permission: "sales_module", iconColor: "text-blue-400" },
  { title: "إشعارات الدائن", href: "/credit-notes", icon: CreditCard, permission: "credit_notes_module", iconColor: "text-red-400" },
  { title: "إدارة المركبات", href: "/fleet", icon: Car, permission: "sales_module", iconColor: "text-yellow-400" },
  
  { title: "التجارة الإلكترونية", href: "/ecommerce-orders", icon: Store, permission: "ecommerce_orders_module", iconColor: "text-pink-400" },
  { title: "طلبات اليوم", href: "/ecommerce-orders/today", icon: Calendar, permission: "daily_orders_module", iconColor: "text-fuchsia-400" },
  { title: "إدارة المتاجر", href: "/ecommerce-stores", icon: Store, permission: "ecommerce_stores_module", iconColor: "text-rose-400" },
  
  { title: "الشحنات الشخصية", href: "/personal-shipments", icon: Truck, permission: "personal_shipments_module", iconColor: "text-sky-400" },
  { title: "إدارة الشحنات", href: "/manage-shipments", icon: Package, permission: "manage_shipments_module", iconColor: "text-indigo-400" },
  
  { title: "العمولات الشهرية", href: "/monthly-commissions", icon: HandCoins, permission: "monthly_commissions_module", iconColor: "text-amber-400" },
  { title: "تقرير العمولات", href: "/commissions-summary", icon: FileSpreadsheet, permission: "commissions_summary_module", iconColor: "text-lime-400" },
  
  { title: "مركز المصروفات", href: "/expenses", icon: BarChart3, permission: "expenses_module", iconColor: "text-red-400" },
  { title: "القيود اليومية", href: "/journal-entries", icon: FileEdit, permission: "journal_entries_module", iconColor: "text-violet-400" },
  { title: "عرض تقارير الدخل", href: "/income-view", icon: PieChart, permission: "income_report_module", iconColor: "text-sky-400" },
  
  { title: "الخطابات الجاهزة", href: "/letters-templates", icon: Mail, permission: "letters_templates_module", iconColor: "text-blue-400" },
  
  { title: "مركز الحسابات", href: "/accounts", icon: BookOpen, permission: "accounts_module", iconColor: "text-orange-400" },
  { title: "مراكز التكلفة", href: "/cost-centers", icon: Landmark, permission: "cost_centers_module", iconColor: "text-slate-400" },
  { title: "دفتر الأستاذ العام", href: "/general-ledger", icon: BookOpen, permission: "ledger_module", iconColor: "text-zinc-400" },
  { title: "ميزان المراجعة", href: "/trial-balance", icon: Scale, permission: "trial_balance_module", iconColor: "text-gray-400" },
  { title: "قائمة الدخل", href: "/income-statement", icon: BarChart3, permission: "income_statement_module", iconColor: "text-emerald-400" },
  { title: "الميزانية العمومية", href: "/balance-sheet", icon: FileText, permission: "balance_sheet_module", iconColor: "text-blue-400" },
  { title: "إعدادات الضريبة", href: "/tax-settings", icon: Calculator, permission: "balance_sheet_module", iconColor: "text-rose-400" },
  { title: "إعدادات النظام", href: "/settings", icon: Settings, iconColor: "text-slate-300" },
];

interface SidebarProps {
  userRole?: string;
  permissions?: Record<string, number>;
}

export function Sidebar({ userRole, permissions = {} }: SidebarProps) {
  const [mounted, setMounted] = useState(false);
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

  return (
    <div className="w-64 h-screen overflow-hidden bg-[#0f172a] flex flex-col transition-all duration-300 shadow-2xl border-l border-white/5 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
      
      <div className="p-4 border-b border-white/5 text-center relative bg-slate-900/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          {mounted && (
            <>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20 flex items-center justify-center border border-blue-400/20"
              >
                <Truck size={24} className="drop-shadow-sm" />
              </motion.div>
              <h2 className="text-sm font-black text-white tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Logistics Systems Pro
              </h2>
            </>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar relative">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <React.Fragment key={item.href}>
              <Link href={item.href}>
                <motion.div
                  whileHover={{ x: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-blue-600/10 text-white border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
                  )}
                >
                  <div className={cn(
                    "absolute right-0 top-0 bottom-0 w-1 bg-blue-500 transition-all duration-300",
                    isActive ? "opacity-100 h-full" : "opacity-0 h-0 group-hover:opacity-50 group-hover:h-1/2"
                  )} />

                  <div className={cn(
                    "p-1.5 rounded-lg transition-all duration-300",
                    isActive ? "bg-blue-500/20 shadow-inner" : "bg-slate-800/30 group-hover:bg-slate-700/30"
                  )}>
                    <item.icon size={18} className={cn(
                      "transition-all duration-300",
                      isActive ? item.iconColor || "text-blue-400" : "text-slate-500 group-hover:" + (item.iconColor || "text-blue-400")
                    )} />
                  </div>
                  
                  <span className={cn(
                    "font-bold text-[13px] tracking-wide transition-colors duration-300",
                    isActive ? "text-white" : "group-hover:text-white"
                  )}>
                    {item.title}
                  </span>

                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className="absolute left-4 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                    />
                  )}
                </motion.div>
              </Link>
              {item.dividerAfter && (
                <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent my-3 mx-4" />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-slate-900/30 backdrop-blur-md">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-[13px] transition-all border border-rose-500/20 hover:border-rose-500/50 shadow-lg shadow-rose-500/5"
        >
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </motion.button>
      </div>
    </div>
  );
}
