"use client";

import React from "react";
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
}

const navItems: NavItem[] = [
  { title: "الرئيسية", href: "/dashboard", icon: Home },
  
  // Admin Sections - روابط المدير
  { title: "طلبات تسجيل الشركات", href: "/admin/companies", icon: Building2, adminOnly: true },
  { title: "إضافة شركة جديدة", href: "/register", icon: PlusCircle, adminOnly: true },
  { title: "توليد رمز الاشتراك", href: "/admin/tokens/generate", icon: Key, adminOnly: true },
  { title: "بحث عن رمز اشتراك", href: "/admin/tokens/search", icon: Search, adminOnly: true },
  { title: "الدعم الفني", href: "/admin/chat", icon: MessageSquare, adminOnly: true },
  { title: "إشعارات الإدارة", href: "/admin/notifications", icon: Bell, adminOnly: true },
  { title: "نظام الرواتب الخاصة", href: "/admin/special-salaries", icon: Coins, adminOnly: true, dividerAfter: true },
  
  // HR - الموارد البشرية
  { title: "إدارة الموارد البشرية", href: "/hr", icon: Users, permission: "employees_module" },
  
  // Clients - العملاء
  { title: "قائمة العملاء", href: "/customers", icon: Users, permission: "clients_module" },
  
  // Sales - المبيعات
  { title: "عروض الأسعار", href: "/quotations", icon: FileText, permission: "quotations_module" },
  { title: "سندات المبيعات", href: "/sales-receipts", icon: Receipt, permission: "receipts_module" },
  { title: "مسيرات الرواتب", href: "/salary-payrolls", icon: BadgeDollarSign, permission: "salary_payrolls_module" },
  { title: "الفواتير الضريبية", href: "/sales-invoices", icon: FileText, permission: "sales_module" },
  { title: "إشعارات الدائن", href: "/credit-notes", icon: CreditCard, permission: "credit_notes_module" },
  { title: "إدارة المركبات", href: "/vehicles", icon: Car, permission: "sales_module" },
  
  // E-commerce - التجارة الإلكترونية
  { title: "التجارة الإلكترونية", href: "/ecommerce-orders", icon: Store, permission: "ecommerce_orders_module" },
  { title: "طلبات اليوم", href: "/ecommerce-orders/today", icon: Calendar, permission: "daily_orders_module" },
  { title: "إدارة المتاجر", href: "/ecommerce-stores", icon: Store, permission: "ecommerce_stores_module" },
  
  // Shipments - الشحنات
  { title: "الشحنات الشخصية", href: "/personal-shipments", icon: Truck, permission: "personal_shipments_module" },
  { title: "إدارة الشحنات", href: "/manage-shipments", icon: Package, permission: "manage_shipments_module" },
  
  // Commissions - العمولات
  { title: "العمولات الشهرية", href: "/monthly-commissions", icon: HandCoins, permission: "monthly_commissions_module" },
  { title: "تقرير العمولات", href: "/commissions-summary", icon: FileSpreadsheet, permission: "commissions_summary_module" },
  
  // Finance - المالية
  { title: "مركز المصروفات الشهرية", href: "/expenses", icon: BarChart3, permission: "expenses_module" },
  { title: "إضافة إيراد جديد", href: "/income", icon: DollarSign, permission: "income_module" },
  { title: "القيود اليومية", href: "/journal-entries", icon: FileEdit, permission: "journal_entries_module" },
  { title: "سندات القبض", href: "/receipt-vouchers", icon: Receipt, permission: "receipt_vouchers_module" },
  { title: "عرض تقارير الدخل", href: "/income-view", icon: PieChart, permission: "income_report_module" },
  
  // Letters - الخطابات
  { title: "الخطابات الجاهزة", href: "/letters-templates", icon: Mail, permission: "letters_templates_module" },
  
  // Accounting - المحاسبة
  { title: "مركز الحسابات", href: "/accounts", icon: BookOpen, permission: "accounts_module" },
  { title: "مراكز التكلفة", href: "/cost-centers", icon: Landmark, permission: "cost_centers_module" },
  { title: "دفتر الأستاذ العام", href: "/general-ledger", icon: BookOpen, permission: "ledger_module" },
  { title: "ميزان المراجعة", href: "/trial-balance", icon: Scale, permission: "trial_balance_module" },
  { title: "قائمة الدخل", href: "/income-statement", icon: BarChart3, permission: "income_statement_module" },
  { title: "الميزانية العمومية", href: "/balance-sheet", icon: FileText, permission: "balance_sheet_module" },
  { title: "إعدادات الضريبة", href: "/tax-settings", icon: Calculator, permission: "balance_sheet_module" },
];

interface SidebarProps {
  userRole?: string;
  permissions?: Record<string, number>;
}

export function Sidebar({ userRole, permissions = {} }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = userRole === "admin";

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
    <div className="w-72 h-screen overflow-y-auto bg-gradient-to-b from-[#2c3e50] to-[#34495e] flex flex-col z-50 transition-all duration-300 shadow-xl">
      {/* Header */}
      <div className="p-6 border-b border-white/15 text-center relative backdrop-blur-sm bg-black/20">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-[#3498db] p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Truck size={28} />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Logistics Systems Pro</h2>
        </div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-transparent via-[#3498db] to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <React.Fragment key={item.href}>
              <Link href={item.href}>
                <motion.div
                  whileHover={{ x: -5 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden border",
                    isActive 
                      ? "bg-white/15 text-white shadow-lg border-white/20" 
                      : "text-white/80 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#3498db] to-[#9b59b6] rounded-l-full"
                    />
                  )}
                  <item.icon size={20} className={cn(
                    "transition-all duration-300 group-hover:scale-110 flex-shrink-0",
                    isActive ? "text-[#f1c40f]" : "text-white/60 group-hover:text-[#f1c40f]"
                  )} />
                  <span className="font-semibold text-sm">{item.title}</span>
                </motion.div>
              </Link>
              {item.dividerAfter && (
                <hr className="border-white/20 my-4 mx-4" />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/15 space-y-2">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
            <Settings size={20} />
            <span className="font-semibold text-sm">إعدادات النظام</span>
          </div>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-gradient-to-l from-[#e74c3c] to-[#c0392b] text-white font-bold text-sm shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-[1.02] transition-all"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
