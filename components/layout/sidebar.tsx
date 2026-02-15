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
  ChevronRight,
  Zap,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/lib/locale-context";
import { useTheme } from "next-themes";
import BrandLogo from "@/components/brand-logo";

interface NavItem {
    titleKey: string;
    href: string;
    icon: React.ElementType;
    adminOnly?: boolean;
    permission?: string;
    ownerOnly?: boolean;
    dividerAfter?: boolean;
    gradient?: string;
    iconColor?: string;
  }

const navItems: NavItem[] = [
    { titleKey: "home", href: "/dashboard", icon: Home, gradient: "from-blue-500 to-cyan-500", iconColor: "text-blue-400" },
    
    { titleKey: "companyRequests", href: "/admin/companies", icon: Building2, adminOnly: true, gradient: "from-violet-500 to-purple-500", iconColor: "text-violet-400" },
  { titleKey: "addNewCompany", href: "/admin/companies/new", icon: PlusCircle, adminOnly: true, gradient: "from-emerald-500 to-green-500", iconColor: "text-emerald-400" },
  { titleKey: "generateToken", href: "/admin/generate-token", icon: Key, adminOnly: true, gradient: "from-amber-500 to-yellow-500", iconColor: "text-amber-400" },
  { titleKey: "searchToken", href: "/admin/search-token", icon: Search, adminOnly: true, gradient: "from-sky-500 to-blue-500", iconColor: "text-sky-400" },
  { titleKey: "technicalSupport", href: "/admin/chat", icon: MessageSquare, adminOnly: true, gradient: "from-indigo-500 to-violet-500", iconColor: "text-indigo-400" },
  { titleKey: "adminNotifications", href: "/admin/notifications", icon: Bell, adminOnly: true, gradient: "from-rose-500 to-pink-500", iconColor: "text-rose-400" },
  { titleKey: "subscriptionPlans", href: "/admin/subscriptions", icon: Package, adminOnly: true, gradient: "from-violet-500 to-purple-500", iconColor: "text-violet-400" },
  { titleKey: "specialSalaries", href: "/admin/special-salaries", icon: Coins, adminOnly: true, dividerAfter: true, gradient: "from-yellow-500 to-orange-500", iconColor: "text-yellow-400" },
  
  { titleKey: "hrManagement", href: "/hr", icon: Users, permission: "employees_module", gradient: "from-blue-500 to-indigo-500", iconColor: "text-blue-400" },
  
  { titleKey: "customersList", href: "/customers", icon: Users, permission: "clients_module", gradient: "from-cyan-500 to-teal-500", iconColor: "text-cyan-400" },
  
  { titleKey: "financialVouchers", href: "/financial-vouchers", icon: Receipt, permission: "receipts_module", gradient: "from-indigo-500 to-purple-500", iconColor: "text-indigo-400" },
  { titleKey: "salaryPayrolls", href: "/salary-payrolls", icon: BadgeDollarSign, permission: "salary_payrolls_module", gradient: "from-teal-500 to-emerald-500", iconColor: "text-teal-400" },
  { titleKey: "taxInvoices", href: "/sales-invoices", icon: FileText, permission: "sales_module", gradient: "from-blue-500 to-sky-500", iconColor: "text-blue-400" },
  { titleKey: "creditNotes", href: "/credit-notes", icon: CreditCard, permission: "credit_notes_module", gradient: "from-red-500 to-rose-500", iconColor: "text-red-400" },
  { titleKey: "fleetManagement", href: "/fleet", icon: Car, permission: "sales_module", gradient: "from-yellow-500 to-amber-500", iconColor: "text-yellow-400" },
    
      { titleKey: "ecommerce", href: "/ecommerce", icon: Store, permission: "ecommerce_orders_module", gradient: "from-emerald-500 to-teal-500", iconColor: "text-emerald-400" },
      
      { titleKey: "monthlyCommissions", href: "/hr/commissions", icon: HandCoins, permission: "monthly_commissions_module", gradient: "from-amber-500 to-orange-500", iconColor: "text-amber-400" },
    
      { titleKey: "expensesCenter", href: "/expenses", icon: BarChart3, permission: "expenses_module", gradient: "from-red-500 to-orange-500", iconColor: "text-red-400" },
    { titleKey: "journalEntries", href: "/journal-entries", icon: FileEdit, permission: "journal_entries_module", gradient: "from-violet-500 to-indigo-500", iconColor: "text-violet-400" },
    { titleKey: "profitLossSummary", href: "/profit-loss", icon: PieChart, permission: "income_report_module", gradient: "from-sky-500 to-blue-500", iconColor: "text-sky-400" },
    
    { titleKey: "accountsCenter", href: "/accounts", icon: BookOpen, permission: "accounts_module", gradient: "from-orange-500 to-amber-500", iconColor: "text-orange-400" },
  { titleKey: "costCenters", href: "/cost-centers", icon: Landmark, permission: "cost_centers_module", gradient: "from-slate-500 to-gray-500", iconColor: "text-slate-400" },
  { titleKey: "generalLedger", href: "/general-ledger", icon: BookOpen, permission: "ledger_module", gradient: "from-zinc-500 to-neutral-500", iconColor: "text-zinc-400" },
  { titleKey: "trialBalance", href: "/trial-balance", icon: Scale, permission: "trial_balance_module", gradient: "from-gray-500 to-slate-500", iconColor: "text-gray-400" },
  { titleKey: "incomeStatement", href: "/income-statement", icon: BarChart3, permission: "income_statement_module", gradient: "from-emerald-500 to-teal-500", iconColor: "text-emerald-400" },
  { titleKey: "balanceSheet", href: "/balance-sheet", icon: FileText, permission: "balance_sheet_module", gradient: "from-blue-500 to-cyan-500", iconColor: "text-blue-400" },
  
    { titleKey: "subUsersManagement", href: "/sub-users", icon: Users, permission: "sub_users_module", gradient: "from-violet-500 to-purple-500", iconColor: "text-violet-400" },
    { titleKey: "taxDeclarations", href: "/tax-declarations", icon: FileCheck, permission: "balance_sheet_module", gradient: "from-blue-600 to-indigo-600", iconColor: "text-blue-400" },
    { titleKey: "taxSettings", href: "/tax-settings", icon: Calculator, permission: "balance_sheet_module", gradient: "from-rose-500 to-pink-500", iconColor: "text-rose-400" },
  ];

interface SidebarProps {
  userRole?: string;
  permissions?: Record<string, number>;
  userType?: string;
}

export function Sidebar({ userRole, permissions = {}, userType }: SidebarProps) {
    const [mounted, setMounted] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const isAdmin = userRole === "admin";
    const isSubUser = userType === "sub_user";
    const { isRTL } = useLocale();
    const t = useTranslations('sidebar');
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

    const filteredItems = navItems.filter(item => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.permission && !isAdmin && permissions[item.permission] !== 1) return false;
      return true;
    });

      const handleItemClick = (item: NavItem) => {
        router.push(item.href);
      };

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
    hidden: { opacity: 0, x: isRTL ? 20 : -20 },
    visible: { opacity: 1, x: 0 }
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const getGradientColors = (gradient?: string) => {
    const colorMap: Record<string, { from: string; to: string }> = {
      "from-blue-500 to-cyan-500": { from: "#3b82f6", to: "#06b6d4" },
      "from-violet-500 to-purple-500": { from: "#8b5cf6", to: "#a855f7" },
      "from-emerald-500 to-green-500": { from: "#10b981", to: "#22c55e" },
      "from-amber-500 to-yellow-500": { from: "#f59e0b", to: "#eab308" },
      "from-sky-500 to-blue-500": { from: "#0ea5e9", to: "#3b82f6" },
      "from-indigo-500 to-violet-500": { from: "#6366f1", to: "#8b5cf6" },
      "from-rose-500 to-pink-500": { from: "#f43f5e", to: "#ec4899" },
      "from-blue-500 to-indigo-500": { from: "#3b82f6", to: "#6366f1" },
      "from-cyan-500 to-teal-500": { from: "#06b6d4", to: "#14b8a6" },
      "from-indigo-500 to-purple-500": { from: "#6366f1", to: "#a855f7" },
      "from-teal-500 to-emerald-500": { from: "#14b8a6", to: "#10b981" },
      "from-red-500 to-rose-500": { from: "#ef4444", to: "#f43f5e" },
      "from-yellow-500 to-amber-500": { from: "#eab308", to: "#f59e0b" },
      "from-amber-500 to-orange-500": { from: "#f59e0b", to: "#f97316" },
      "from-red-500 to-orange-500": { from: "#ef4444", to: "#f97316" },
      "from-violet-500 to-indigo-500": { from: "#8b5cf6", to: "#6366f1" },
      "from-orange-500 to-amber-500": { from: "#f97316", to: "#f59e0b" },
      "from-slate-500 to-gray-500": { from: "#64748b", to: "#6b7280" },
      "from-zinc-500 to-neutral-500": { from: "#71717a", to: "#737373" },
      "from-gray-500 to-slate-500": { from: "#6b7280", to: "#64748b" },
      "from-yellow-500 to-orange-500": { from: "#eab308", to: "#f97316" },
      "from-blue-600 to-indigo-600": { from: "#2563eb", to: "#4f46e5" },
    };
    return colorMap[gradient || ""] || { from: "#6366f1", to: "#8b5cf6" };
  };

  return (
      <div className="w-64 h-screen overflow-hidden flex flex-col relative">
          {/* Glass background */}
          <div className={`absolute inset-0 ${isDark ? 'bg-white/[0.03] backdrop-blur-2xl' : ''}`} />
          <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-white/[0.06] via-transparent to-white/[0.02]' : 'from-white/10 via-transparent to-white/5'}`} />
          <div className={cn(
            "absolute top-0 w-64 h-64 bg-gradient-to-br from-blue-500/8 to-transparent rounded-full blur-3xl",
            isRTL ? "right-0" : "left-0"
          )} />
          <div className={cn(
            "absolute bottom-0 w-64 h-64 bg-gradient-to-tr from-purple-500/8 to-transparent rounded-full blur-3xl",
            isRTL ? "left-0" : "right-0"
          )} />
          {/* Glass edge border */}
          <div className={cn(
            `absolute top-0 bottom-0 w-[1px] bg-gradient-to-b ${isDark ? 'from-white/10 via-white/[0.15] to-white/10' : 'from-indigo-300/30 via-indigo-300/50 to-indigo-300/30'}`,
            isRTL ? "left-0" : "right-0"
          )} />
      
      <div className={`relative z-10 p-4 pb-5 border-b ${isDark ? 'border-white/5' : 'border-indigo-200/30'}`}>
        {mounted && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
                <BrandLogo size="md" />
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
                  <div
                    onClick={() => handleItemClick(item)}
                    className="cursor-pointer"
                  >
                      <motion.div
                        onHoverStart={() => setHoveredItem(item.href)}
                        onHoverEnd={() => setHoveredItem(null)}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden",
                          isActive 
                            ? isDark 
                              ? "bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg shadow-blue-500/10"
                              : "bg-white/50 backdrop-blur-xl border border-indigo-300/40 shadow-lg shadow-indigo-500/10"
                            : isDark 
                              ? "hover:bg-white/5 border border-transparent"
                              : "hover:bg-white/30 border border-transparent"
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
                                "absolute top-2 bottom-2 rounded-full",
                                isRTL ? "right-0" : "left-0",
                                isActive 
                                    ? `bg-gradient-to-b ${item.gradient}` 
                                    : isDark ? "bg-white/30" : ""
                              )}
                              style={!isActive && !isDark ? { 
                                background: `linear-gradient(to bottom, ${getGradientColors(item.gradient).from}, ${getGradientColors(item.gradient).to})`,
                                opacity: 0.6
                              } : undefined}
                            />
                        )}
                      </AnimatePresence>

                      <div className={cn(
                              "relative p-2 rounded-lg transition-all duration-300",
                              isActive 
                                ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                                : isDark 
                                  ? "bg-white/[0.06] group-hover:bg-white/[0.12]"
                                  : "bg-white/40"
                            )}
                            style={!isDark && !isActive && isHovered ? { 
                              background: `linear-gradient(135deg, ${getGradientColors(item.gradient).from}, ${getGradientColors(item.gradient).to})`,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            } : undefined}
                            >
                              <item.icon size={16} className={cn(
                                "transition-all duration-300",
                                isActive 
                                  ? "text-white drop-shadow-sm" 
                                  : isDark 
                                    ? (item.iconColor || "text-white/80") 
                                    : (!isHovered ? (item.iconColor || "text-indigo-700") : "text-white drop-shadow-sm")
                              )} />
                        </div>
                        
                            <span className={cn(
                            "relative text-[12px] tracking-wide transition-all duration-300",
                            isActive 
                              ? isDark ? "text-white font-bold" : "text-black font-black" 
                              : isDark ? "text-white/90 group-hover:text-white font-bold" : "text-black font-extrabold group-hover:text-black"
                          )}>
                        {t(item.titleKey)}
                      </span>

                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn("absolute", isRTL ? "right-3" : "left-3")}
                          >
                              <ChevronIcon size={14} className={isDark ? "text-white/50" : "text-indigo-400"} />
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                
                {item.dividerAfter && (
                    <div className="relative my-4 mx-4">
                      <div className={`h-[1px] bg-gradient-to-r from-transparent ${isDark ? 'via-white/10' : 'via-indigo-300/40'} to-transparent`} />
                      <div className={`absolute left-1/2 -translate-x-1/2 -top-1.5 px-2 ${isDark ? 'bg-[#0d1525]' : 'bg-transparent'}`}>
                        <Zap size={10} className={isDark ? "text-white/20" : "text-indigo-300/60"} />
                      </div>
                    </div>
                  )}
              </React.Fragment>
            );
          })}
        </motion.div>
        </nav>
      </div>
    );
  }
