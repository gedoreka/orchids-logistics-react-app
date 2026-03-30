"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  HandCoins, 
  FileText, 
  PieChart, 
  PlusCircle, 
  History, 
  ArrowLeftRight,
  ChartBar,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Receipt,
  Users
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/lib/locale-context";

interface ExpensesClientProps {
  companyId: number;
  companyInfo: {
    name: string;
    logo_path: string | null;
  };
  stats: {
    expenses: number;
    deductions: number;
    payrolls: number;
    total: number;
  };
  recentActivity: any[];
  currentMonth: string;
}

export function ExpensesClient({ companyId, companyInfo, stats, recentActivity, currentMonth }: ExpensesClientProps) {
  const router = useRouter();
  const t = useTranslations("expenses");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newMonth = direction === 'prev' ? month - 1 : month + 1;
    let newYear = year;
    
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    
    const newMonthStr = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setSelectedMonth(newMonthStr);
    router.push(`/expenses?month=${newMonthStr}`);
  };

  const statsData = [
    {
      label: t("dashboard.totalExpenses"),
      value: stats.expenses,
      icon: TrendingDown,
      gradient: "from-blue-500 to-indigo-600",
      glow: "bg-blue-500/10",
    },
    {
      label: t("dashboard.totalDeductions"),
      value: stats.deductions,
      icon: HandCoins,
      gradient: "from-rose-500 to-rose-600",
      glow: "bg-rose-500/10",
    },
    {
      label: t("dashboard.totalSalaries"),
      value: stats.payrolls,
      icon: Users,
      gradient: "from-amber-500 to-orange-600",
      glow: "bg-amber-500/10",
    },
    {
      label: t("dashboard.grandTotal"),
      value: stats.total,
      icon: Receipt,
      gradient: "from-emerald-500 to-teal-600",
      glow: "bg-emerald-500/10",
    },
  ];

return (
      <div className="min-h-screen p-4 md:p-6 font-tajawal w-full overflow-x-hidden">
        <motion.div 
          className="w-full"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Main Card Container */}
          <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 rounded-[3rem] p-6 md:p-8 shadow-2xl border border-slate-500/30 overflow-hidden">
            <div className="h-1.5 w-full absolute top-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 via-emerald-500 to-blue-500" />
            <div className="space-y-6">
              {/* Header Banner */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 p-8 shadow-2xl border border-white/10"
              >
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full -translate-y-16 translate-x-16 blur-3xl pointer-events-none bg-indigo-500/10" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-16 -translate-x-16 blur-3xl pointer-events-none bg-blue-500/10" />
                
                <div className="relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Left Section: Logo & Title */}
                    <div className="flex items-center gap-5">
                      {companyInfo.logo_path ? (
                        <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-2xl">
                          <img 
                            src={companyInfo.logo_path} 
                            alt="Logo" 
                            className="w-full h-full rounded-xl object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/15">
                            <Building2 className="w-8 h-8 text-indigo-400" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                          {t("dashboard.title")}
                        </h1>
                        <p className="text-sm font-medium text-white/50">{companyInfo.name || "Company Name"}</p>
                      </div>
                    </div>

                    {/* Month Selector */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 overflow-hidden">
                          <button
                            onClick={() => changeMonth('next')}
                            className="p-3 hover:bg-white/10 transition-colors"
                          >
                            <ChevronRight className="w-5 h-5 text-white/70" />
                          </button>
                          <div className="px-5 py-2 flex items-center gap-2 min-w-[160px] justify-center">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <span className="font-bold text-white text-sm">{formatMonthDisplay(selectedMonth)}</span>
                          </div>
                          <button
                            onClick={() => changeMonth('prev')}
                            className="p-3 hover:bg-white/10 transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-white/70" />
                          </button>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    {statsData.map((stat, idx) => (
                      <div
                        key={idx}
                        className="relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center group hover:bg-white/8 hover:-translate-y-0.5 transition-all"
                      >
                        <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8 blur-xl pointer-events-none ${stat.glow}`} />
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                            <stat.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-2xl font-black text-white tabular-nums">
                            {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(stat.value)}
                          </span>
                          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">{stat.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Decorative elements */}
                  <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              </motion.div>

              {/* Action Buttons Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Add Expenses Button */}
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/expenses/new')}
                  className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <PlusCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-start">
                      <h3 className="text-lg font-bold text-white">{t("dashboard.addExpense")}</h3>
                      <p className="text-xs text-blue-100">{t("dashboard.newMonthlyExpense")}</p>
                    </div>
                  </div>
                </motion.button>

                {/* Add Deductions Button */}
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/expenses/deductions')}
                  className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 p-5 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <PlusCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-start">
                      <h3 className="text-lg font-bold text-white">{t("dashboard.addDeduction")}</h3>
                      <p className="text-xs text-rose-100">{t("dashboard.newMonthlyDeduction")}</p>
                    </div>
                  </div>
                </motion.button>

                {/* Reports Button */}
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/expenses/report')}
                  className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <ChartBar className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-start">
                      <h3 className="text-lg font-bold text-white">{t("dashboard.expensesReport")}</h3>
                      <p className="text-xs text-emerald-100">{t("dashboard.viewMonthlyReport")}</p>
                    </div>
                  </div>
                </motion.button>

                {/* Analytics Button */}
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/expenses/analysis')}
                  className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 p-5 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <PieChart className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-start">
                      <h3 className="text-lg font-bold text-white">{t("dashboard.analytics")}</h3>
                      <p className="text-xs text-purple-100">{t("dashboard.expenseAnalysis")}</p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Recent Activity & Quick Actions Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <motion.div className="lg:col-span-2 space-y-4" variants={itemVariants}>
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      <History className="w-6 h-6 text-indigo-400" />
                      {t("dashboard.recentActivity")}
                    </h2>
                    <Button variant="ghost" className="text-indigo-400 font-bold hover:bg-white/10 h-8 text-sm">{t("dashboard.viewAll")}</Button>
                  </div>

                  <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
                    <CardContent className="p-0">
                      <div className="divide-y divide-white/5">
                        {recentActivity.length > 0 ? (
                          recentActivity.map((item, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                  <Wallet className="w-5 h-5" />
                                </div>
                                <div className="space-y-0.5 text-start">
                                  <h4 className="font-bold text-white text-sm">{item.expense_type}</h4>
                                  <p className="text-xs text-white/40 flex items-center gap-2">
                                    <span>{item.employee_name}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span className="font-bold text-blue-400">
                                      {new Intl.NumberFormat('en-US').format(item.amount)} SAR
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-end">
                                <Badge variant="secondary" className="font-bold px-3 py-1 rounded-lg flex items-center gap-1 bg-white/10 text-white/60 border-none text-[10px]">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.expense_date).toLocaleDateString('en-US')}
                                </Badge>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto text-white/30">
                              <History className="w-8 h-8" />
                            </div>
                            <p className="text-white/40 font-medium text-sm">{t("dashboard.noActivity")}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div className="space-y-4" variants={itemVariants}>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3 px-2">
                      <PlusCircle className="w-6 h-6 text-indigo-400" />
                      {t("dashboard.quickActions")}
                    </h2>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { label: t("dashboard.addExpense"), icon: PlusCircle, color: "text-blue-300", bg: "bg-blue-500/20", link: "/expenses/new" },
                      { label: t("dashboard.addDeduction"), icon: HandCoins, color: "text-rose-300", bg: "bg-rose-500/20", link: "/expenses/deductions" },
                      { label: t("dashboard.expensesReport"), icon: FileText, color: "text-emerald-300", bg: "bg-emerald-500/20", link: "/expenses/report" },
                      { label: t("dashboard.deductionsReport"), icon: ChartBar, color: "text-amber-300", bg: "bg-amber-500/20", link: "/expenses/report?type=deductions" },
                    ].map((action, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ x: 5 }}
                        className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group w-full text-start border border-white/10"
                        onClick={() => router.push(action.link)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-white/70 text-sm">{action.label}</span>
                        </div>
                        <ArrowLeftRight className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap');
        
        .font-tajawal {
          font-family: 'Tajawal', sans-serif;
        }

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
