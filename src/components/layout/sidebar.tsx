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
    <div className="w-64 h-screen overflow-y-auto bg-[#2c3e50] flex flex-col z-50 transition-all duration-300 shadow-xl border-l border-white/5">
      {/* Header */}
      <div className="p-4 border-b border-white/10 text-center relative bg-black/10">
        <div className="flex flex-col items-center gap-1.5">
          {mounted && (
            <>
              <div className="bg-[#3498db] p-1.5 rounded-lg text-white shadow-lg shadow-blue-500/10">
                <Truck size={20} />
              </div>
              <h2 className="text-sm font-black text-white tracking-tight">Logistics Systems Pro</h2>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <React.Fragment key={item.href}>
              <Link href={item.href}>
                <motion.div
                  whileHover={{ x: -3 }}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group relative border",
                    isActive 
                      ? "bg-white/10 text-white border-white/10 shadow-sm" 
                      : "text-white/70 hover:text-white hover:bg-white/5 border-transparent"
                  )}
                >
                  <item.icon size={16} className={cn(
                    "transition-all duration-300 shrink-0",
                    isActive ? "text-[#f1c40f]" : "text-white/40 group-hover:text-[#f1c40f]"
                  )} />
                  <span className="font-bold text-xs">{item.title}</span>
                </motion.div>
              </Link>
              {item.dividerAfter && (
                <hr className="border-white/5 my-2 mx-3" />
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-1.5">
        <Link href="/settings">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Settings size={16} />
            <span className="font-bold text-xs">إعدادات النظام</span>
          </div>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition-all border border-red-500/20"
        >
          <LogOut size={16} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
