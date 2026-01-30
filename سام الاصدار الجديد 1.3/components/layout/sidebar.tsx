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

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  permission?: string;
  ownerOnly?: boolean;
  dividerAfter?: boolean;
  gradient?: string;
}

const navItems: NavItem[] = [
    { titleKey: "home", href: "/dashboard", icon: Home, gradient: "from-blue-500 to-cyan-500" },
    
    { titleKey: "companyRequests", href: "/admin/companies", icon: Building2, adminOnly: true, gradient: "from-violet-500 to-purple-500" },
  { titleKey: "addNewCompany", href: "/admin/companies/new", icon: PlusCircle, adminOnly: true, gradient: "from-emerald-500 to-green-500" },
  { titleKey: "generateToken", href: "/admin/generate-token", icon: Key, adminOnly: true, gradient: "from-amber-500 to-yellow-500" },
  { titleKey: "searchToken", href: "/admin/search-token", icon: Search, adminOnly: true, gradient: "from-sky-500 to-blue-500" },
  { titleKey: "technicalSupport", href: "/admin/chat", icon: MessageSquare, adminOnly: true, gradient: "from-indigo-500 to-violet-500" },
  { titleKey: "adminNotifications", href: "/admin/notifications", icon: Bell, adminOnly: true, gradient: "from-rose-500 to-pink-500" },
  { titleKey: "subscriptionPlans", href: "/admin/subscriptions", icon: Package, adminOnly: true, gradient: "from-violet-500 to-purple-500" },
  { titleKey: "specialSalaries", href: "/admin/special-salaries", icon: Coins, adminOnly: true, dividerAfter: true, gradient: "from-yellow-500 to-orange-500" },
  
  { titleKey: "hrManagement", href: "/hr", icon: Users, permission: "employees_module", gradient: "from-blue-500 to-indigo-500" },
  
  { titleKey: "customersList", href: "/customers", icon: Users, permission: "clients_module", gradient: "from-cyan-500 to-teal-500" },
  
  { titleKey: "financialVouchers", href: "/financial-vouchers", icon: Receipt, permission: "receipts_module", gradient: "from-indigo-500 to-purple-500" },
  { titleKey: "salaryPayrolls", href: "/salary-payrolls", icon: BadgeDollarSign, permission: "salary_payrolls_module", gradient: "from-teal-500 to-emerald-500" },
  { titleKey: "taxInvoices", href: "/sales-invoices", icon: FileText, permission: "sales_module", gradient: "from-blue-500 to-sky-500" },
  { titleKey: "creditNotes", href: "/credit-notes", icon: CreditCard, permission: "credit_notes_module", gradient: "from-red-500 to-rose-500" },
  { titleKey: "fleetManagement", href: "/fleet", icon: Car, permission: "sales_module", gradient: "from-yellow-500 to-amber-500" },
    
      { titleKey: "ecommerce", href: "/ecommerce", icon: Store, permission: "ecommerce_orders_module", gradient: "from-emerald-500 to-teal-500" },
      
      { titleKey: "monthlyCommissions", href: "/hr/commissions", icon: HandCoins, permission: "monthly_commissions_module", gradient: "from-amber-500 to-orange-500" },
    
      { titleKey: "expensesCenter", href: "/expenses", icon: BarChart3, permission: "expenses_module", gradient: "from-red-500 to-orange-500" },
    { titleKey: "journalEntries", href: "/journal-entries", icon: FileEdit, permission: "journal_entries_module", gradient: "from-violet-500 to-indigo-500" },
    { titleKey: "profitLossSummary", href: "/profit-loss", icon: PieChart, permission: "income_report_module", gradient: "from-sky-500 to-blue-500" },
    
    { titleKey: "accountsCenter", href: "/accounts", icon: BookOpen, permission: "accounts_module", gradient: "from-orange-500 to-amber-500" },
  { titleKey: "costCenters", href: "/cost-centers", icon: Landmark, permission: "cost_centers_module", gradient: "from-slate-500 to-gray-500" },
  { titleKey: "generalLedger", href: "/general-ledger", icon: BookOpen, permission: "ledger_module", gradient: "from-zinc-500 to-neutral-500" },
  { titleKey: "trialBalance", href: "/trial-balance", icon: Scale, permission: "trial_balance_module", gradient: "from-gray-500 to-slate-500" },
  { titleKey: "incomeStatement", href: "/income-statement", icon: BarChart3, permission: "income_statement_module", gradient: "from-emerald-500 to-teal-500" },
  { titleKey: "balanceSheet", href: "/balance-sheet", icon: FileText, permission: "balance_sheet_module", gradient: "from-blue-500 to-cyan-500" },
  
    { titleKey: "subUsersManagement", href: "/sub-users", icon: Users, permission: "sub_users_module", gradient: "from-violet-500 to-purple-500" },
    { titleKey: "taxDeclarations", href: "/tax-declarations", icon: FileCheck, permission: "balance_sheet_module", gradient: "from-blue-600 to-indigo-600" },
    { titleKey: "taxSettings", href: "/tax-settings", icon: Calculator, permission: "balance_sheet_module", gradient: "from-rose-500 to-pink-500" },
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

  return (
    <div className="w-64 h-screen overflow-hidden flex flex-col relative">
      <div className="absolute inset-0 bg-transparent" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className={cn(
        "absolute top-0 w-64 h-64 bg-gradient-to-br from-blue-600/10 to-transparent rounded-full blur-3xl",
        isRTL ? "right-0" : "left-0"
      )} />
      <div className={cn(
        "absolute bottom-0 w-64 h-64 bg-gradient-to-tr from-purple-600/10 to-transparent rounded-full blur-3xl",
        isRTL ? "left-0" : "right-0"
      )} />
      <div className={cn(
        "absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/5 via-white/10 to-white/5",
        isRTL ? "left-0" : "right-0"
      )} />
      
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
                className={cn("absolute -top-1", isRTL ? "-left-1" : "-right-1")}
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
                              "absolute top-2 bottom-2 rounded-full",
                              isRTL ? "right-0" : "left-0",
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
                        {t(item.titleKey)}
                      </span>

                        {isActive && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn("absolute", isRTL ? "right-3" : "left-3")}
                          >
                            <ChevronIcon size={14} className="text-white/50" />
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                
                {item.dividerAfter && (
                  <div className="relative my-4 mx-4">
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 bg-[#0d1525] px-2">
                      <Zap size={10} className="text-white/20" />
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
