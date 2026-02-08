"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Calendar, User, Building2, Printer,
  FileText, DollarSign, CreditCard, Receipt, Calculator, Filter,
  Download, ChevronDown, ChevronUp, BarChart3, PieChart, ArrowUp,
  ArrowDown, Banknote, FileSpreadsheet, Wallet, Users, Clock,
  CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, Building,
  BookOpen, Loader2, CheckCircle2, AlertTriangle, Sparkles, X,
  ArrowUpRight, ArrowDownRight, Layers, Hash, Activity, Book
} from "lucide-react";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

interface Invoice {
  id: number;
  invoice_number: string;
  issue_date: string;
  total_amount: number;
  vat_total: number;
  discount: number;
  before_discount: number;
  created_by: string;
}

interface ManualIncome {
  id: number;
  operation_number: string;
  income_type: string;
  income_date: string;
  amount: number;
  vat: number;
  total: number;
  payment_method: string;
  description: string;
  created_by: string;
}

interface ReceiptVoucher {
  id: number;
  receipt_number: string;
  receipt_date: string;
  received_from: string;
  amount: number;
  tax_value: number;
  total_amount: number;
  payment_method: string;
  description: string;
  created_by: string;
}

interface Expense {
  id: number;
  expense_type: string;
  expense_date: string;
  amount: number;
  employee_display_name: string;
  description: string;
}

interface Payroll {
  id: number;
  payroll_month: string;
  total_amount: number;
  created_at: string;
  is_draft: number;
}

interface JournalEntry {
  id: number;
  entry_number: string;
  entry_date: string;
  description: string;
  debit: number;
  credit: number;
  status: string;
  source_type: string;
  account_code: string;
  account_name: string;
  account_type: string;
  cost_center_name: string;
  cost_center_code: string;
  net_amount: number;
}

interface ProfitLossData {
  companyInfo: {
    name: string;
    logo_path: string | null;
  };
  userName: string;
  month: string;
  includeTax: boolean;
  summary: {
    invoiceTotal: number;
    invoiceTotalWithTax: number;
    invoiceTotalWithoutTax: number;
    creditNotesTotal: number;
    manualIncomeTotal: number;
    receiptVouchersTotal: number;
    journalRevenueTotal: number;
    journalExpenseTotal: number;
    totalIncome: number;
    expensesTotal: number;
    paymentVouchersTotal: number;
    payrollsTotal: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  details: {
    invoices: Invoice[];
    creditNotes: any[];
    manualIncome: ManualIncome[];
    receiptVouchers: ReceiptVoucher[];
    expenses: Expense[];
    paymentVouchers: any[];
    payrolls: Payroll[];
    journalRevenueEntries: JournalEntry[];
    journalExpenseEntries: JournalEntry[];
  };
  counts: {
    invoices: number;
    creditNotes: number;
    manualIncome: number;
    receiptVouchers: number;
    expenses: number;
    paymentVouchers: number;
    payrolls: number;
    journalRevenue: number;
    journalExpense: number;
  };
}

// ─── Notification Modal Types ────────────────────────────────────
type ModalType = "idle" | "notification";
interface ModalState {
  type: ModalType;
  notificationType?: "success" | "error" | "warning" | "info";
  notificationTitle?: string;
  notificationMessage?: string;
}

function ProfitLossContent() {
  const t = useTranslations("profitLoss");
  const locale = useLocale();
  const isRTL = locale.isRTL;
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [inputYear, setInputYear] = useState(new Date().getFullYear().toString());
  const [inputMonthIndex, setInputMonthIndex] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [includeTax, setIncludeTax] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    invoices: true,
    creditNotes: false,
    manualIncome: true,
    receiptVouchers: false,
    journalRevenue: true,
    expenses: true,
    paymentVouchers: false,
    payrolls: true,
    journalExpense: true,
  });
  const [modal, setModal] = useState<ModalState>({ type: "idle" });
  const printRef = useRef<HTMLDivElement>(null);

  const showNotification = useCallback((type: "success" | "error" | "warning" | "info", title: string, message: string) => {
    setModal({ type: "notification", notificationType: type, notificationTitle: title, notificationMessage: message });
    if (type === "success" || type === "info") {
      setTimeout(() => setModal(prev => prev.type === "notification" ? { type: "idle" } : prev), 2500);
    }
  }, []);

  const closeModal = () => setModal({ type: "idle" });

  const fetchData = async (monthOverride?: string) => {
    setLoading(true);
    const monthToFetch = monthOverride || `${inputYear}-${inputMonthIndex}`;
    try {
      const res = await fetch(`/api/profit-loss?month=${monthToFetch}&includeTax=${includeTax}`);
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
      setSelectedMonth(monthToFetch);
    } catch (error: any) {
      console.error(error);
      showNotification("error", t("errorLoading") || "خطأ", t("errorLoadingDesc") || "حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedMonth);
  }, [includeTax]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB");
  };

  const getMonthName = (month: string) => {
    try {
      const date = new Date(month + "-01");
      if (isNaN(date.getTime())) return t("dateInvalid") || "التاريخ غير صحيح";
      const monthPart = month.split("-")[1];
      const yearPart = month.split("-")[0];
      return `${t(`months.${monthPart}`)} ${yearPart}`;
    } catch {
      return t("dateInvalid") || "التاريخ غير صحيح";
    }
  };

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    if (!data) return;
    const { summary } = data;
    const rows = [
      "البيان,المبلغ",
      `إجمالي الإيرادات,${summary.totalIncome}`,
      `الفواتير الضريبية,${summary.invoiceTotal}`,
      `الإشعارات الدائنة,${summary.creditNotesTotal}`,
      `الدخل اليدوي,${summary.manualIncomeTotal}`,
      `سندات القبض,${summary.receiptVouchersTotal}`,
      `إيرادات القيود,${summary.journalRevenueTotal}`,
      `إجمالي المصروفات,${summary.totalExpenses}`,
      `المصروفات التشغيلية,${summary.expensesTotal}`,
      `سندات الصرف,${summary.paymentVouchersTotal}`,
      `الرواتب,${summary.payrollsTotal}`,
      `مصروفات القيود,${summary.journalExpenseTotal}`,
      `صافي الربح/الخسارة,${summary.netProfit}`,
    ];
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profit-loss-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("success", "تم التصدير", "تم تصدير ملف CSV بنجاح");
  };

  const years = Array.from({ length: 11 }, (_, i) => (new Date().getFullYear() - 5 + i).toString());
  const months = [
    { value: "01", label: t("months.01") },
    { value: "02", label: t("months.02") },
    { value: "03", label: t("months.03") },
    { value: "04", label: t("months.04") },
    { value: "05", label: t("months.05") },
    { value: "06", label: t("months.06") },
    { value: "07", label: t("months.07") },
    { value: "08", label: t("months.08") },
    { value: "09", label: t("months.09") },
    { value: "10", label: t("months.10") },
    { value: "11", label: t("months.11") },
    { value: "12", label: t("months.12") },
  ];

  // Animation variants
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-6 bg-slate-800/80 rounded-3xl border border-white/10 backdrop-blur-xl">
              <Loader2 size={48} className="text-blue-400 animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-black text-lg">{t("loading")}</p>
            <p className="text-slate-500 font-bold text-sm mt-1">{isRTL ? "يتم جلب بيانات الأرباح والخسائر..." : "Fetching profit & loss data..."}</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6 text-center">
          <div className="relative p-6 bg-slate-800/80 rounded-3xl border border-red-500/20 backdrop-blur-xl">
            <AlertCircle size={48} className="text-red-400" />
          </div>
          <p className="text-white font-black text-lg">{t("errorLoading")}</p>
          <button onClick={() => fetchData()} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:shadow-2xl transition-all">
            {t("retry")}
          </button>
        </motion.div>
      </div>
    );
  }

  const { summary, details, counts, companyInfo, userName } = data;
  const isProfit = summary.netProfit >= 0;

  return (
    <div className="min-h-screen pb-20 bg-transparent" dir={isRTL ? "rtl" : "ltr"} ref={printRef}>
      {/* ═══════════ Premium Notification Modal ═══════════ */}
      <AnimatePresence>
        {modal.type === "notification" && (() => {
          const nType = modal.notificationType || "info";
          const gradients: Record<string, string> = {
            success: "from-emerald-500 via-teal-600 to-emerald-700",
            error: "from-red-500 via-rose-600 to-red-700",
            warning: "from-amber-500 via-orange-600 to-amber-700",
            info: "from-blue-500 via-indigo-600 to-blue-700",
          };
          const shadows: Record<string, string> = {
            success: "shadow-[0_0_80px_rgba(16,185,129,0.3)] border-emerald-500/20",
            error: "shadow-[0_0_80px_rgba(239,68,68,0.3)] border-red-500/20",
            warning: "shadow-[0_0_80px_rgba(245,158,11,0.3)] border-amber-500/20",
            info: "shadow-[0_0_80px_rgba(59,130,246,0.3)] border-blue-500/20",
          };
          const icons: Record<string, React.ReactNode> = {
            success: <CheckCircle2 size={40} className="text-white drop-shadow-lg" />,
            error: <AlertCircle size={40} className="text-white drop-shadow-lg" />,
            warning: <AlertTriangle size={40} className="text-white drop-shadow-lg" />,
            info: <Sparkles size={40} className="text-white drop-shadow-lg" />,
          };
          const btnGradients: Record<string, string> = {
            success: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
            error: "from-red-500 to-rose-600 shadow-red-500/30",
            warning: "from-amber-500 to-orange-600 shadow-amber-500/30",
            info: "from-blue-500 to-indigo-600 shadow-blue-500/30",
          };
          const bgAccents: Record<string, string> = {
            success: "bg-emerald-950/30 border-emerald-900/50",
            error: "bg-red-950/30 border-red-900/50",
            warning: "bg-amber-950/30 border-amber-900/50",
            info: "bg-blue-950/30 border-blue-900/50",
          };
          return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={closeModal} className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl" />
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 30 }}
                transition={{ type: "spring", damping: 22, stiffness: 300 }}
                className={`relative w-full max-w-md bg-slate-900 rounded-[3rem] ${shadows[nType]} overflow-hidden border-4`}
              >
                <div className={`relative bg-gradient-to-br ${gradients[nType]} p-8 text-white text-center overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
                  </div>
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-5 shadow-2xl border-4 border-white/30">
                    {icons[nType]}
                  </motion.div>
                  <motion.h3 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="text-2xl font-black tracking-tight relative z-10">{modal.notificationTitle}</motion.h3>
                </div>
                <div className="p-7 text-center space-y-5">
                  <div className={`${bgAccents[nType]} rounded-2xl p-5 border-2`}>
                    <p className="text-slate-300 font-bold text-base leading-relaxed">{modal.notificationMessage}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                    className={`w-full px-6 py-4 rounded-2xl bg-gradient-to-r ${btnGradients[nType]} text-white font-black text-lg shadow-xl transition-all`}>
                    {isRTL ? "حسناً" : "OK"}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 md:space-y-8">
        {/* ═══════════ Premium Header ═══════════ */}
        <motion.div variants={itemVariants}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-2xl border border-white/10 print:hidden"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500" />

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  {companyInfo.logo_path ? (
                    <img src={companyInfo.logo_path} alt="Logo"
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-white/20 object-cover shadow-2xl" />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl">
                      <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Calculator className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    {t("title")}
                  </h1>
                  <p className="text-white/60 font-medium mt-1 text-sm md:text-base">{companyInfo.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold text-xs">
                      <Activity className="w-3 h-3" />
                      {getMonthName(selectedMonth)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-xs">
                      <User className="w-3 h-3" />
                      {userName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <button onClick={() => fetchData()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white hover:bg-white/20 font-bold rounded-xl text-sm transition-all">
                  <RefreshCw className="w-4 h-4" />
                  {t("view")}
                </button>
                <button onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 font-bold rounded-xl text-sm transition-all">
                  <FileSpreadsheet className="w-4 h-4" />
                  {isRTL ? "تصدير CSV" : "Export CSV"}
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 font-bold rounded-xl text-sm transition-all">
                  <Printer className="w-4 h-4" />
                  {t("printReport")}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-6 md:mt-8">
              {[
                { label: t("totalIncome"), value: summary.totalIncome, icon: TrendingUp, color: "from-emerald-500 to-green-600", iconBg: "bg-emerald-500/20" },
                { label: t("totalExpenses"), value: summary.totalExpenses, icon: TrendingDown, color: "from-rose-500 to-red-600", iconBg: "bg-rose-500/20" },
                { label: t("netProfitLoss"), value: summary.netProfit, icon: Calculator, color: isProfit ? "from-blue-500 to-indigo-600" : "from-orange-500 to-amber-600", iconBg: isProfit ? "bg-blue-500/20" : "bg-orange-500/20" },
                { label: t("profitMargin"), value: summary.profitMargin, icon: PieChart, color: "from-purple-500 to-violet-600", iconBg: "bg-purple-500/20", isPercent: true },
                { label: isRTL ? "عدد المصادر" : "Sources", value: counts.invoices + counts.manualIncome + counts.expenses + counts.journalRevenue + counts.journalExpense, icon: Layers, color: "from-amber-500 to-orange-600", iconBg: "bg-amber-500/20", isCount: true },
              ].map((stat, idx) => (
                <div key={idx}
                  className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 md:p-4 group hover:bg-white/10 transition-all">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative z-10 flex flex-col items-center text-center gap-2">
                    <div className={`p-2 md:p-2.5 rounded-xl ${stat.iconBg}`}>
                      <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <span className="text-lg md:text-2xl font-black text-white tabular-nums">
                      {stat.isCount ? stat.value : stat.isPercent ? `${stat.value.toFixed(1)}%` : formatNumber(stat.value)}
                    </span>
                    <span className="text-[10px] md:text-xs font-medium text-white/50">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════════ Filters Bar ═══════════ */}
        <motion.div variants={itemVariants}
          className="bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 p-5 md:p-6 print:hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col">
                <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">
                  <Calendar className={`inline w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t("year")}
                </label>
                <select value={inputYear} onChange={(e) => setInputYear(e.target.value)}
                  className="h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm">
                  {years.map(year => <option key={year} value={year} className="bg-slate-900 text-white">{year}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="block text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">
                  <Clock className={`inline w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t("month")}
                </label>
                <select value={inputMonthIndex} onChange={(e) => setInputMonthIndex(e.target.value)}
                  className="h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm">
                  {months.map(m => <option key={m.value} value={m.value} className="bg-slate-900 text-white">{m.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col justify-end pt-5">
                <button onClick={() => fetchData()}
                  className="h-11 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-black text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2">
                  <RefreshCw size={16} />
                  {t("view")}
                </button>
              </div>
            </div>

            {/* Tax Toggle */}
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-1 border border-white/10">
              <button onClick={() => setIncludeTax(true)}
                className={cn("px-4 py-2 rounded-lg font-black text-xs transition-all",
                  includeTax ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "text-slate-400 hover:text-white")}>
                {t("withTax")}
              </button>
              <button onClick={() => setIncludeTax(false)}
                className={cn("px-4 py-2 rounded-lg font-black text-xs transition-all",
                  !includeTax ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "text-slate-400 hover:text-white")}>
                {t("withoutTax")}
              </button>
            </div>
          </div>
        </motion.div>

        {/* ═══════════ Summary Cards ═══════════ */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Income Card */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950/50 to-teal-950/50 border-2 border-emerald-500/20 p-6 md:p-8 backdrop-blur-xl">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-black border border-emerald-500/30">
                {isRTL ? "إيرادات" : "Revenue"}
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-emerald-400 mb-2 tabular-nums">{formatNumber(summary.totalIncome)}</h3>
            <p className="text-emerald-500/80 font-bold text-sm mb-4">{t("totalIncome")}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-bold">{t("taxInvoices")}</span>
                <span className="font-black text-white tabular-nums">{formatNumber(summary.invoiceTotal)}</span>
              </div>
              {summary.creditNotesTotal > 0 && (
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-red-400 font-bold">{t("creditNotes")}</span>
                  <span className="font-black text-red-400 tabular-nums">({formatNumber(summary.creditNotesTotal)})</span>
                </div>
              )}
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-bold">{t("manualIncome")}</span>
                <span className="font-black text-white tabular-nums">{formatNumber(summary.manualIncomeTotal)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-bold">{t("receiptVouchers")}</span>
                <span className="font-black text-white tabular-nums">{formatNumber(summary.receiptVouchersTotal)}</span>
              </div>
              {(summary.journalRevenueTotal || 0) > 0 && (
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-blue-400 font-bold flex items-center gap-1"><Book size={12} />{t("journalRevenue") || (isRTL ? "إيرادات القيود" : "Journal Revenue")}</span>
                  <span className="font-black text-blue-400 tabular-nums">{formatNumber(summary.journalRevenueTotal)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Expenses Card */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-red-950/50 to-rose-950/50 border-2 border-red-500/20 p-6 md:p-8 backdrop-blur-xl">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-red-500/10 rounded-full blur-3xl" />
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg shadow-red-500/30">
                <TrendingDown className="w-7 h-7 text-white" />
              </div>
              <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-black border border-red-500/30">
                {isRTL ? "مصروفات" : "Expenses"}
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-red-400 mb-2 tabular-nums">{formatNumber(summary.totalExpenses)}</h3>
            <p className="text-red-500/80 font-bold text-sm mb-4">{t("totalExpenses")}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-bold">{t("operatingExpenses")}</span>
                <span className="font-black text-white tabular-nums">{formatNumber(summary.expensesTotal)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-bold">{t("paymentVouchers")}</span>
                <span className="font-black text-white tabular-nums">{formatNumber(summary.paymentVouchersTotal)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-bold">{t("salaries")}</span>
                <span className="font-black text-white tabular-nums">{formatNumber(summary.payrollsTotal)}</span>
              </div>
              {(summary.journalExpenseTotal || 0) > 0 && (
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-amber-400 font-bold flex items-center gap-1"><Book size={12} />{t("journalExpense") || (isRTL ? "مصروفات القيود" : "Journal Expense")}</span>
                  <span className="font-black text-amber-400 tabular-nums">{formatNumber(summary.journalExpenseTotal)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Net Profit/Loss Card */}
          <div className={cn(
            "relative overflow-hidden rounded-[2rem] border-2 p-6 md:p-8 backdrop-blur-xl",
            isProfit
              ? "bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border-blue-500/20"
              : "bg-gradient-to-br from-orange-950/50 to-amber-950/50 border-orange-500/20"
          )}>
            <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl", isProfit ? "bg-blue-500/10" : "bg-orange-500/10")} />
            <div className="flex items-center justify-between mb-6">
              <div className={cn("p-3 rounded-2xl shadow-lg", isProfit ? "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30" : "bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30")}>
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <span className={cn("px-3 py-1 rounded-lg text-xs font-black border",
                isProfit ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-orange-500/20 text-orange-400 border-orange-500/30")}>
                {isProfit ? t("profit") : t("loss")}
              </span>
            </div>
            <h3 className={cn("text-3xl md:text-4xl font-black mb-2 tabular-nums", isProfit ? "text-blue-400" : "text-orange-400")}>
              {formatNumber(summary.netProfit)}
            </h3>
            <p className={cn("font-bold text-sm mb-4", isProfit ? "text-blue-500/80" : "text-orange-500/80")}>{t("netProfitLoss")}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-bold">{t("profitMargin")}</span>
                <span className={cn("font-black tabular-nums", isProfit ? "text-blue-400" : "text-orange-400")}>{summary.profitMargin.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-slate-400 font-bold">{t("totalIncome")}</span>
                <span className="font-black text-emerald-400 tabular-nums">{formatNumber(summary.totalIncome)}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400 font-bold">{t("totalExpenses")}</span>
                <span className="font-black text-red-400 tabular-nums">{formatNumber(summary.totalExpenses)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════ Analysis Bar ═══════════ */}
        <motion.div variants={itemVariants}
          className="bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 p-6 md:p-8">
          <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl"><PieChart className="w-5 h-5 text-blue-400" /></div>
            {t("profitLossAnalysis")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-400 font-bold flex items-center gap-2 text-sm"><ArrowUp size={16} />{t("totalRevenue")}</span>
                <span className="text-emerald-400 font-black text-sm tabular-nums">{formatNumber(summary.totalIncome)} {t("currency")}</span>
              </div>
              <div className="h-5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-red-400 font-bold flex items-center gap-2 text-sm"><ArrowDown size={16} />{t("totalExpenses")}</span>
                <span className="text-red-400 font-black text-sm tabular-nums">{formatNumber(summary.totalExpenses)} {t("currency")}</span>
              </div>
              <div className="h-5 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div initial={{ width: 0 }}
                  animate={{ width: `${summary.totalIncome > 0 ? Math.min((summary.totalExpenses / summary.totalIncome * 100), 100) : 0}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full" />
              </div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-500 font-bold text-sm mb-2">{t("finalResult")}</p>
            <h3 className={cn("text-3xl font-black mb-1 tabular-nums", isProfit ? "text-emerald-400" : "text-red-400")}>
              {formatNumber(summary.netProfit)} {t("currency")}
            </h3>
            <p className="text-slate-500 text-sm">
              {t("profitMargin")}: <span className={cn("font-black", isProfit ? "text-emerald-400" : "text-red-400")}>{summary.profitMargin.toFixed(2)}%</span>
            </p>
          </div>
        </motion.div>

        {/* ═══════════ Detail Sections ═══════════ */}

        {/* Invoices Section */}
        <SectionAccordion
          isExpanded={expandedSections.invoices}
          onToggle={() => toggleSection("invoices")}
          gradient="from-emerald-500 via-teal-600 to-emerald-600"
          icon={Receipt}
          title={t("taxInvoiceIncome")}
          subtitle={`${t("invoiceCount", { count: counts.invoices })} - ${formatNumber(summary.invoiceTotal)} ${t("currency")}`}
          shadowColor="emerald"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                {[t("invoiceNumber"), t("issueDate"), t("beforeDiscount"), t("discount"), t("net"), t("createdBy")].map((h, i) => (
                  <th key={i} className={cn("px-4 md:px-6 py-4 text-xs font-bold whitespace-nowrap", isRTL ? "text-right" : "text-left")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {details.invoices.length > 0 ? details.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 md:px-6 py-3.5"><span className="px-3 py-1 bg-emerald-500/20 rounded-lg text-xs font-black text-emerald-400 border border-emerald-500/30">{inv.invoice_number}</span></td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-slate-400">{formatDate(inv.issue_date)}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-white tabular-nums">{formatNumber(inv.before_discount)}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-red-400 tabular-nums">{formatNumber(inv.discount || 0)}</td>
                  <td className="px-4 md:px-6 py-3.5 text-base font-black text-emerald-400 tabular-nums">{formatNumber(inv.total_amount)}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-slate-500">{inv.created_by}</td>
                </tr>
              )) : (
                <EmptyRow colSpan={6} icon={Receipt} text={t("noInvoices")} />
              )}
            </tbody>
          </table>
        </SectionAccordion>

        {/* Credit Notes Section */}
        <SectionAccordion
          isExpanded={expandedSections.creditNotes}
          onToggle={() => toggleSection("creditNotes")}
          gradient="from-red-500 via-rose-600 to-red-600"
          icon={ArrowDown}
          title={t("creditNotesTitle")}
          subtitle={`${t("noteCount", { count: counts.creditNotes })} - ${formatNumber(summary.creditNotesTotal)} ${t("currency")}`}
          shadowColor="red"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                {[t("noteNumber"), t("relatedInvoice"), t("date"), t("amount"), t("reason")].map((h, i) => (
                  <th key={i} className={cn("px-4 md:px-6 py-4 text-xs font-bold whitespace-nowrap", isRTL ? "text-right" : "text-left")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {details.creditNotes.length > 0 ? details.creditNotes.map((cn) => (
                <tr key={cn.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 md:px-6 py-3.5"><span className="px-3 py-1 bg-red-500/20 rounded-lg text-xs font-black text-red-400 border border-red-500/30">{cn.credit_note_number}</span></td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-white">{cn.invoice_number}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-slate-400">{formatDate(cn.created_at)}</td>
                  <td className="px-4 md:px-6 py-3.5 text-base font-black text-red-400 tabular-nums">{formatNumber(cn.total_amount)}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-slate-500">{cn.reason}</td>
                </tr>
              )) : (
                <EmptyRow colSpan={5} icon={ArrowDown} text={t("noCreditNotes")} />
              )}
            </tbody>
          </table>
        </SectionAccordion>

        {/* Manual Income Section */}
        <SectionAccordion
          isExpanded={expandedSections.manualIncome}
          onToggle={() => toggleSection("manualIncome")}
          gradient="from-amber-500 via-orange-500 to-amber-600"
          icon={Banknote}
          title={t("manualIncomeIncome")}
          subtitle={`${t("operationCount", { count: counts.manualIncome })} - ${formatNumber(summary.manualIncomeTotal)} ${t("currency")}`}
          shadowColor="amber"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                {[t("operationNumber"), t("incomeType"), t("date"), t("beforeTax"), t("tax"), t("total"), t("paymentMethod"), t("description"), t("createdBy")].map((h, i) => (
                  <th key={i} className={cn("px-4 md:px-6 py-4 text-xs font-bold whitespace-nowrap", isRTL ? "text-right" : "text-left")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {details.manualIncome.length > 0 ? details.manualIncome.map((inc) => (
                <tr key={inc.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 md:px-6 py-3.5"><span className="px-3 py-1 bg-amber-500/20 rounded-lg text-xs font-black text-amber-400 border border-amber-500/30">{inc.operation_number}</span></td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-white">{inc.income_type}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-slate-400">{formatDate(inc.income_date)}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-white tabular-nums">{formatNumber(inc.amount)}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-amber-400 tabular-nums">{formatNumber(inc.vat)}</td>
                  <td className="px-4 md:px-6 py-3.5 text-base font-black text-emerald-400 tabular-nums">{formatNumber(inc.total)}</td>
                  <td className="px-4 md:px-6 py-3.5"><span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-bold text-slate-300 border border-white/10">{inc.payment_method}</span></td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-slate-500 max-w-[200px] truncate">{inc.description}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-slate-500">{inc.created_by}</td>
                </tr>
              )) : (
                <EmptyRow colSpan={9} icon={Banknote} text={t("noManualIncome")} />
              )}
            </tbody>
          </table>
        </SectionAccordion>

        {/* ═══════════ Journal Revenue Entries Section ═══════════ */}
        <SectionAccordion
          isExpanded={expandedSections.journalRevenue}
          onToggle={() => toggleSection("journalRevenue")}
          gradient="from-blue-500 via-indigo-600 to-blue-600"
          icon={Book}
          title={isRTL ? "إيرادات القيود اليومية" : "Journal Revenue Entries"}
          subtitle={`${counts.journalRevenue} ${isRTL ? "قيد" : "entries"} - ${formatNumber(summary.journalRevenueTotal)} ${t("currency")}`}
          shadowColor="blue"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                {[
                  isRTL ? "رقم القيد" : "Entry #",
                  isRTL ? "التاريخ" : "Date",
                  isRTL ? "الحساب" : "Account",
                  isRTL ? "مركز التكلفة" : "Cost Center",
                  isRTL ? "الوصف" : "Description",
                  isRTL ? "مدين" : "Debit",
                  isRTL ? "دائن" : "Credit",
                  isRTL ? "الصافي" : "Net",
                ].map((h, i) => (
                  <th key={i} className={cn("px-4 md:px-6 py-4 text-xs font-bold whitespace-nowrap", isRTL ? "text-right" : "text-left")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {details.journalRevenueEntries.length > 0 ? details.journalRevenueEntries.map((je) => (
                <tr key={je.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 md:px-6 py-3.5"><span className="px-3 py-1 bg-blue-500/20 rounded-lg text-xs font-black text-blue-400 border border-blue-500/30">{je.entry_number}</span></td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-slate-400">{formatDate(je.entry_date)}</td>
                  <td className="px-4 md:px-6 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">{je.account_code}</span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{je.account_name}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3.5">
                    {je.cost_center_code ? (
                      <span className="px-2 py-1 bg-purple-500/20 rounded-lg text-[10px] font-bold text-purple-400 border border-purple-500/30">{je.cost_center_code}</span>
                    ) : <span className="text-slate-600">-</span>}
                  </td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-slate-400 max-w-[200px] truncate">{je.description}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-rose-400 tabular-nums">{je.debit > 0 ? formatNumber(je.debit) : "-"}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-emerald-400 tabular-nums">{je.credit > 0 ? formatNumber(je.credit) : "-"}</td>
                  <td className="px-4 md:px-6 py-3.5 text-base font-black text-blue-400 tabular-nums">{formatNumber(je.net_amount)}</td>
                </tr>
              )) : (
                <EmptyRow colSpan={8} icon={Book} text={isRTL ? "لا توجد إيرادات قيود يومية" : "No journal revenue entries"} />
              )}
            </tbody>
            {details.journalRevenueEntries.length > 0 && (
              <tfoot>
                <tr className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-t border-blue-500/20">
                  <td colSpan={7} className={cn("px-4 md:px-6 py-4 font-black text-blue-300 text-sm", isRTL ? "text-right" : "text-left")}>{isRTL ? "إجمالي إيرادات القيود" : "Total Journal Revenue"}</td>
                  <td className="px-4 md:px-6 py-4 font-black text-blue-400 text-base tabular-nums">{formatNumber(summary.journalRevenueTotal)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </SectionAccordion>

        {/* Expenses Section */}
        <SectionAccordion
          isExpanded={expandedSections.expenses}
          onToggle={() => toggleSection("expenses")}
          gradient="from-red-500 via-rose-600 to-red-600"
          icon={CreditCard}
          title={t("expenseDetails")}
          subtitle={`${t("expenseCount", { count: counts.expenses })} - ${formatNumber(summary.expensesTotal)} ${t("currency")}`}
          shadowColor="red"
        >
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                  {[t("expenseType"), t("date"), t("amount"), t("employee"), t("description")].map((h, i) => (
                    <th key={i} className={cn("px-4 md:px-6 py-4 text-xs font-bold whitespace-nowrap", isRTL ? "text-right" : "text-left")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {details.expenses.length > 0 ? details.expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-white">{exp.expense_type}</td>
                    <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-slate-400">{formatDate(exp.expense_date)}</td>
                    <td className="px-4 md:px-6 py-3.5 text-base font-black text-red-400 tabular-nums">{formatNumber(exp.amount)}</td>
                    <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-slate-400">{exp.employee_display_name}</td>
                    <td className="px-4 md:px-6 py-3.5 text-sm text-slate-500 max-w-[200px] truncate">{exp.description}</td>
                  </tr>
                )) : (
                  <EmptyRow colSpan={5} icon={CreditCard} text={t("noExpenses")} />
                )}
              </tbody>
            </table>
          </div>
        </SectionAccordion>

        {/* Payrolls Section */}
        <SectionAccordion
          isExpanded={expandedSections.payrolls}
          onToggle={() => toggleSection("payrolls")}
          gradient="from-purple-500 via-violet-600 to-purple-600"
          icon={Users}
          title={t("payrollDetails")}
          subtitle={`${t("payrollCount", { count: counts.payrolls })} - ${formatNumber(summary.payrollsTotal)} ${t("currency")}`}
          shadowColor="purple"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                {[t("payrollMonth"), t("totalAmount"), t("creationDate")].map((h, i) => (
                  <th key={i} className={cn("px-4 md:px-6 py-4 text-xs font-bold whitespace-nowrap", isRTL ? "text-right" : "text-left")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {details.payrolls.length > 0 ? details.payrolls.map((pr) => (
                <tr key={pr.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-white">{pr.payroll_month}</td>
                  <td className="px-4 md:px-6 py-3.5 text-base font-black text-red-400 tabular-nums">{formatNumber(pr.total_amount)}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-slate-400">{formatDate(pr.created_at)}</td>
                </tr>
              )) : (
                <EmptyRow colSpan={3} icon={Users} text={t("noPayrolls")} />
              )}
            </tbody>
          </table>
        </SectionAccordion>

        {/* ═══════════ Journal Expense Entries Section ═══════════ */}
        <SectionAccordion
          isExpanded={expandedSections.journalExpense}
          onToggle={() => toggleSection("journalExpense")}
          gradient="from-amber-500 via-orange-600 to-amber-600"
          icon={Book}
          title={isRTL ? "مصروفات القيود اليومية" : "Journal Expense Entries"}
          subtitle={`${counts.journalExpense} ${isRTL ? "قيد" : "entries"} - ${formatNumber(summary.journalExpenseTotal)} ${t("currency")}`}
          shadowColor="amber"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                {[
                  isRTL ? "رقم القيد" : "Entry #",
                  isRTL ? "التاريخ" : "Date",
                  isRTL ? "الحساب" : "Account",
                  isRTL ? "مركز التكلفة" : "Cost Center",
                  isRTL ? "الوصف" : "Description",
                  isRTL ? "مدين" : "Debit",
                  isRTL ? "دائن" : "Credit",
                  isRTL ? "الصافي" : "Net",
                ].map((h, i) => (
                  <th key={i} className={cn("px-4 md:px-6 py-4 text-xs font-bold whitespace-nowrap", isRTL ? "text-right" : "text-left")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {details.journalExpenseEntries.length > 0 ? details.journalExpenseEntries.map((je) => (
                <tr key={je.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 md:px-6 py-3.5"><span className="px-3 py-1 bg-amber-500/20 rounded-lg text-xs font-black text-amber-400 border border-amber-500/30">{je.entry_number}</span></td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-slate-400">{formatDate(je.entry_date)}</td>
                  <td className="px-4 md:px-6 py-3.5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white">{je.account_code}</span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{je.account_name}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3.5">
                    {je.cost_center_code ? (
                      <span className="px-2 py-1 bg-purple-500/20 rounded-lg text-[10px] font-bold text-purple-400 border border-purple-500/30">{je.cost_center_code}</span>
                    ) : <span className="text-slate-600">-</span>}
                  </td>
                  <td className="px-4 md:px-6 py-3.5 text-sm text-slate-400 max-w-[200px] truncate">{je.description}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-rose-400 tabular-nums">{je.debit > 0 ? formatNumber(je.debit) : "-"}</td>
                  <td className="px-4 md:px-6 py-3.5 text-sm font-bold text-emerald-400 tabular-nums">{je.credit > 0 ? formatNumber(je.credit) : "-"}</td>
                  <td className="px-4 md:px-6 py-3.5 text-base font-black text-amber-400 tabular-nums">{formatNumber(je.net_amount)}</td>
                </tr>
              )) : (
                <EmptyRow colSpan={8} icon={Book} text={isRTL ? "لا توجد مصروفات قيود يومية" : "No journal expense entries"} />
              )}
            </tbody>
            {details.journalExpenseEntries.length > 0 && (
              <tfoot>
                <tr className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-t border-amber-500/20">
                  <td colSpan={7} className={cn("px-4 md:px-6 py-4 font-black text-amber-300 text-sm", isRTL ? "text-right" : "text-left")}>{isRTL ? "إجمالي مصروفات القيود" : "Total Journal Expenses"}</td>
                  <td className="px-4 md:px-6 py-4 font-black text-amber-400 text-base tabular-nums">{formatNumber(summary.journalExpenseTotal)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </SectionAccordion>

        {/* ═══════════ Footer ═══════════ */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-600 uppercase tracking-widest pt-6 print:hidden">
          <div className="flex items-center gap-2">
            <BarChart3 size={12} className="text-blue-500" />
            <span>{t("automatedReport")}</span>
          </div>
          <span>{t("allRightsReserved")} {new Date().getFullYear()}</span>
        </div>
      </motion.div>

      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:hidden { display: none !important; }
          @page { size: A4 portrait; margin: 10mm; }
        }
      `}</style>
    </div>
  );
}

// ─── Reusable Section Accordion ────────────────────────────────────
function SectionAccordion({
  isExpanded, onToggle, gradient, icon: Icon, title, subtitle, shadowColor, children
}: {
  isExpanded: boolean;
  onToggle: () => void;
  gradient: string;
  icon: any;
  title: string;
  subtitle: string;
  shadowColor: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden transition-all",
        isExpanded && `shadow-[0_0_40px_rgba(var(--shadow-color),0.1)]`
      )}
    >
      <button onClick={onToggle}
        className={`w-full bg-gradient-to-r ${gradient} p-5 md:p-6 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <h3 className="text-lg font-black text-white">{title}</h3>
            <p className="text-white/70 font-bold text-xs mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="p-2 bg-white/10 rounded-xl">
          {isExpanded ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Empty Row Component ────────────────────────────────────
function EmptyRow({ colSpan, icon: Icon, text }: { colSpan: number; icon: any; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <Icon className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-500 font-bold">{text}</p>
        </div>
      </td>
    </tr>
  );
}

export function ProfitLossClient() {
  const { isRTL } = useLocale();
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-white font-bold">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
        </div>
      </div>
    }>
      <ProfitLossContent />
    </Suspense>
  );
}
