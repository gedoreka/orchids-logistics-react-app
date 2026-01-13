"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  permission?: string;
}

const navItems: NavItem[] = [
  { title: "الرئيسية", href: "/dashboard", icon: Home },
  
  // Admin Sections
  { title: "طلبات تسجيل الشركات", href: "/admin/companies", icon: Building2, adminOnly: true },
  { title: "إضافة شركة جديدة", href: "/register", icon: PlusCircle, adminOnly: true },
  { title: "توليد كود الاشتراك", href: "/admin/tokens/generate", icon: Key, adminOnly: true },
  { title: "بحث عن كود اشتراك", href: "/admin/tokens/search", icon: Search, adminOnly: true },
  { title: "الدعم الفني", href: "/admin/support", icon: MessageSquare, adminOnly: true },
  { title: "إشعارات الإدارة", href: "/admin/notifications", icon: Bell, adminOnly: true },
  
  // Company Sections
  { title: "إدارة الموارد البشرية", href: "/hr", icon: Users, permission: "employees_module" },
  { title: "قائمة العملاء", href: "/customers", icon: Users, permission: "clients_module" },
  { title: "عروض الأسعار", href: "/quotations", icon: FileText, permission: "quotations_module" },
  { title: "سندات المبيعات", href: "/receipts", icon: Receipt, permission: "receipts_module" },
  { title: "مسيرات الرواتب", href: "/payroll", icon: BadgeDollarSign, permission: "salary_payrolls_module" },
  { title: "الفواتير الضريبية", href: "/invoices", icon: FileText, permission: "sales_module" },
  { title: "إشعارات الدائن", href: "/credit-notes", icon: BadgeDollarSign, permission: "credit_notes_module" },
  { title: "إدارة المركبات", href: "/vehicles", icon: Car, permission: "sales_module" },
  { title: "التجارة الإلكترونية", href: "/ecommerce", icon: Store, permission: "ecommerce_orders_module" },
  { title: "الشحنات الشخصية", href: "/shipments", icon: Truck, permission: "personal_shipments_module" },
  
  // Finance & Reports
  { title: "مركز المصروفات", href: "/expenses", icon: BarChart3, permission: "expenses_module" },
  { title: "إضافة إيراد جديد", href: "/income/new", icon: PlusCircle, permission: "income_module" },
  { title: "القيود اليومية", href: "/journal", icon: BookOpen, permission: "journal_entries_module" },
  { title: "سندات القبض", href: "/vouchers", icon: Receipt, permission: "receipt_vouchers_module" },
  { title: "تقارير الدخل", href: "/reports/income", icon: PieChart, permission: "income_report_module" },
  { title: "الخطابات الجاهزة", href: "/letters", icon: Mail, permission: "letters_templates_module" },
  { title: "مركز الحسابات", href: "/accounts", icon: BookOpen, permission: "accounts_module" },
  { title: "ميزان المراجعة", href: "/trial-balance", icon: Scale, permission: "trial_balance_module" },
  { title: "قائمة المراكز", href: "/income-statement", icon: BarChart3, permission: "income_statement_module" },
  { title: "الميزانية العمومية", href: "/balance-sheet", icon: FileText, permission: "balance_sheet_module" },
];

interface SidebarProps {
  userRole?: string;
  permissions?: Record<string, number>;
}

export function Sidebar({ userRole, permissions = {} }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "admin";

  const filteredItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.permission && permissions[item.permission] === 0) return false;
    return true;
  });

  return (
    <div className="w-72 h-screen overflow-y-auto bg-[var(--dark-bg)] border-l border-white/10 flex flex-col z-50 transition-all duration-300">
      <div className="p-8 border-b border-white/10 flex items-center justify-center">
        <h2 className="text-2xl font-black text-white tracking-tighter">ZOOL SYSTEM</h2>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: -4 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "bg-white/15 text-white shadow-lg shadow-black/20" 
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#3498db] to-[#764ba2] rounded-r-full"
                  />
                )}
                <item.icon size={20} className={cn(
                  "transition-all duration-300 group-hover:scale-110",
                  isActive ? "text-[#3498db]" : "text-white/50 group-hover:text-white"
                )} />
                <span className="font-bold text-sm">{item.title}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10 space-y-2">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/5 transition-all">
            <Settings size={20} />
            <span className="font-bold text-sm">إعدادات النظام</span>
          </div>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
}
