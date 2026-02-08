"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Calendar, User, Building2, Printer,
  FileText, DollarSign, CreditCard, Receipt, Calculator, Filter,
  Download, ChevronDown, ChevronUp, BarChart3, PieChart, ArrowUp,
  ArrowDown, Banknote, FileSpreadsheet, Wallet, Users, Clock,
  CheckCircle, AlertCircle, RefreshCw, Eye, EyeOff, Building
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations, useLocale } from "@/lib/locale-context";

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
  
    function ProfitLossContent() {
      const t = useTranslations("profitLoss");
      const locale = useLocale();
      const [data, setData] = useState<ProfitLossData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    
    // Split selectedMonth into year and month for the dropdowns
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
  const printRef = useRef<HTMLDivElement>(null);

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
      toast.error("حدث خطأ في جلب البيانات");
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
    } catch (e) {
      return t("dateInvalid") || "التاريخ غير صحيح";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-500 font-bold">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-slate-500 font-bold">{t("errorLoading")}</p>
          <button onClick={() => fetchData()} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  const { summary, details, counts, companyInfo, userName } = data;
  const isProfit = summary.netProfit >= 0;

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

    return (
      <div className="max-w-[1800px] mx-auto p-4 md:p-6 space-y-8 print:p-2 print:space-y-4" dir={locale.isRTL ? "rtl" : "ltr"} ref={printRef}>
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 shadow-2xl print:rounded-xl print:p-6 print:shadow-none"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 print:hidden" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl print:hidden" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl print:hidden" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            {companyInfo.logo_path ? (
              <img
                src={companyInfo.logo_path}
                alt={t("companyLogo")}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20"
              />
            ) : (
              <div className="p-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/30">
                <BarChart3 className="w-12 h-12 text-white" />
              </div>
            )}
            <div className={`text-center ${locale.isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {t("title")}
              </h1>
              <p className="text-slate-400 mt-2 text-lg">{getMonthName(selectedMonth)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{t("reportDate")}</p>
                <p className="text-xl font-black text-white">{new Date().toLocaleDateString("en-GB")}</p>
              </div>
            </div>
        </div>

        <div className="relative z-10 flex flex-wrap justify-center lg:justify-start gap-4 mt-8 print:hidden">
          <span className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30 text-blue-300 font-bold">
            <Building size={18} />
            {companyInfo.name}
          </span>
          <span className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30 text-purple-300 font-bold">
            <User size={18} />
            {t("user")}: {userName}
          </span>
        </div>
      </motion.div>

      <div className="bg-white rounded-[30px] shadow-xl border border-slate-100 p-6 md:p-8 print:hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <label className="block text-sm font-black text-slate-700 mb-2">
                    <Calendar className={`inline w-4 h-4 ${locale.isRTL ? 'ml-1' : 'mr-1'}`} />
                    {t("year")}:
                  </label>
                  <select
                    value={inputYear}
                    onChange={(e) => setInputYear(e.target.value)}
                    className="h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-black text-slate-700 mb-2">
                    <Clock className={`inline w-4 h-4 ${locale.isRTL ? 'ml-1' : 'mr-1'}`} />
                    {t("month")}:
                  </label>
                  <select
                    value={inputMonthIndex}
                    onChange={(e) => setInputMonthIndex(e.target.value)}
                    className="h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
                  >
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col justify-end pt-7">
                <button
                  onClick={() => fetchData()}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={18} />
                  {t("view")}
                </button>
              </div>
            </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handlePrint}
              className="h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2"
            >
              <Printer size={18} />
              {t("printReport")}
            </button>
            <button
              onClick={handleExportPDF}
              className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2"
            >
              <Download size={18} />
              {t("exportPdf")}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-[25px] p-6 md:p-8 border-2 border-emerald-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer print:p-4 print:shadow-none"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center gap-2 bg-emerald-100 px-3 py-1.5 rounded-lg">
              <button
                onClick={() => setIncludeTax(!includeTax)}
                className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${
                  includeTax ? "bg-emerald-600 text-white" : "bg-white text-emerald-700"
                }`}
              >
                {t("withTax")}
              </button>
              <button
                onClick={() => setIncludeTax(!includeTax)}
                className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${
                  !includeTax ? "bg-emerald-600 text-white" : "bg-white text-emerald-700"
                }`}
              >
                {t("withoutTax")}
              </button>
            </div>
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-emerald-700 mb-2">
            {formatNumber(summary.totalIncome)}
          </h3>
          <p className="text-emerald-600 font-bold text-lg mb-4">{t("totalIncome")}</p>
          <div className="space-y-2 text-sm text-emerald-700/80">
            <p className="flex justify-between">
              <span>{t("taxInvoices")}:</span>
              <span className="font-bold">{formatNumber(summary.invoiceTotal)}</span>
            </p>
            {summary.creditNotesTotal > 0 && (
              <p className="flex justify-between text-red-600">
                <span>{t("creditNotes")}:</span>
                <span className="font-bold">({formatNumber(summary.creditNotesTotal)})</span>
              </p>
            )}
            <p className="flex justify-between">
              <span>{t("manualIncome")}:</span>
              <span className="font-bold">{formatNumber(summary.manualIncomeTotal)}</span>
            </p>
            <p className="flex justify-between">
                <span>{t("receiptVouchers")}:</span>
                <span className="font-bold">{formatNumber(summary.receiptVouchersTotal)}</span>
              </p>
              {(summary.journalRevenueTotal || 0) > 0 && (
                <p className="flex justify-between">
                  <span>{t("journalRevenue")}:</span>
                  <span className="font-bold">{formatNumber(summary.journalRevenueTotal)}</span>
                </p>
              )}
            </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-50 to-rose-50 rounded-[25px] p-6 md:p-8 border-2 border-red-100 shadow-xl hover:shadow-2xl transition-all print:p-4 print:shadow-none"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg shadow-red-500/30">
              <TrendingDown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-red-700 mb-2">
            {formatNumber(summary.totalExpenses)}
          </h3>
          <p className="text-red-600 font-bold text-lg mb-4">{t("totalExpenses")}</p>
          <div className="space-y-2 text-sm text-red-700/80">
            <p className="flex justify-between">
              <span>{t("operatingExpenses")}:</span>
              <span className="font-bold">{formatNumber(summary.expensesTotal)}</span>
            </p>
            <p className="flex justify-between">
              <span>{t("paymentVouchers")}:</span>
              <span className="font-bold">{formatNumber(summary.paymentVouchersTotal)}</span>
            </p>
            <p className="flex justify-between">
                <span>{t("salaries")}:</span>
                <span className="font-bold">{formatNumber(summary.payrollsTotal)}</span>
              </p>
              {(summary.journalExpenseTotal || 0) > 0 && (
                <p className="flex justify-between">
                  <span>{t("journalExpense")}:</span>
                  <span className="font-bold">{formatNumber(summary.journalExpenseTotal)}</span>
                </p>
              )}
            </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`bg-gradient-to-br ${
            isProfit ? "from-blue-50 to-indigo-50 border-blue-100" : "from-orange-50 to-amber-50 border-orange-100"
          } rounded-[25px] p-6 md:p-8 border-2 shadow-xl hover:shadow-2xl transition-all print:p-4 print:shadow-none`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className={`p-4 bg-gradient-to-br ${
              isProfit ? "from-blue-500 to-indigo-600 shadow-blue-500/30" : "from-orange-500 to-amber-600 shadow-orange-500/30"
            } rounded-2xl shadow-lg`}>
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-black ${
              isProfit ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
            }`}>
              {isProfit ? t("profit") : t("loss")}
            </span>
          </div>
          <h3 className={`text-4xl md:text-5xl font-black mb-2 ${
            isProfit ? "text-blue-700" : "text-orange-700"
          }`}>
            {formatNumber(summary.netProfit)}
          </h3>
          <p className={`font-bold text-lg mb-4 ${isProfit ? "text-blue-600" : "text-orange-600"}`}>
            {t("netProfitLoss")}
          </p>
          <div className={`text-sm ${isProfit ? "text-blue-700/80" : "text-orange-700/80"}`}>
            <p className="flex justify-between">
              <span>{t("profitMargin")}:</span>
              <span className="font-bold">{summary.profitMargin.toFixed(2)}%</span>
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-[30px] shadow-xl border border-slate-100 p-6 md:p-8 print:p-4 print:shadow-none"
      >
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <PieChart className="w-7 h-7 text-blue-600" />
          {t("profitLossAnalysis")}
          <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">{t("advancedAnalysis")}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-emerald-700 font-bold flex items-center gap-2">
                <ArrowUp size={18} />
                {t("totalRevenue")}
              </span>
              <span className="text-emerald-700 font-black">{formatNumber(summary.totalIncome)} {t("currency")}</span>
            </div>
            <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-red-700 font-bold flex items-center gap-2">
                <ArrowDown size={18} />
                {t("totalExpenses")}
              </span>
              <span className="text-red-700 font-black">{formatNumber(summary.totalExpenses)} {t("currency")}</span>
            </div>
            <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${summary.totalIncome > 0 ? (summary.totalExpenses / summary.totalIncome * 100) : 0}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t-2 border-slate-100 text-center">
          <p className="text-slate-500 font-bold mb-2">{t("finalResult")}</p>
          <h3 className={`text-4xl font-black mb-2 ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
            {formatNumber(summary.netProfit)} {t("currency")}
          </h3>
          <p className="text-slate-500">
            {t("profitMargin")}: <span className={`font-black ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
              {summary.profitMargin.toFixed(2)}%
            </span>
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-[30px] shadow-xl border border-slate-100 overflow-hidden print:shadow-none"
      >
        <button
          onClick={() => toggleSection("invoices")}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 p-6 flex items-center justify-between print:p-4"
        >
          <div className="flex items-center gap-4">
            <Receipt className="w-8 h-8 text-white" />
            <div className={`${locale.isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-xl font-black text-white">{t("taxInvoiceIncome")}</h3>
              <p className="text-emerald-200 font-bold">
                {t("invoiceCount", { count: counts.invoices })} - {formatNumber(summary.invoiceTotal)} {t("currency")}
              </p>
            </div>
          </div>
          {expandedSections.invoices ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
        </button>

        <AnimatePresence>
          {expandedSections.invoices && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-100">
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("invoiceNumber")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("issueDate")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("beforeDiscount")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("discount")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("net")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("createdBy")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {details.invoices.length > 0 ? (
                      details.invoices.map((inv, idx) => (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-bold text-slate-700">
                              {inv.invoice_number}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-600">{formatDate(inv.issue_date)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">{formatNumber(inv.before_discount)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-red-600">{formatNumber(inv.discount || 0)}</td>
                          <td className="px-6 py-4 text-lg font-black text-emerald-600">{formatNumber(inv.total_amount)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-500">{inv.created_by}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-400 font-bold">{t("noInvoices")}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white rounded-[30px] shadow-xl border border-slate-100 overflow-hidden print:shadow-none"
        >
          <button
            onClick={() => toggleSection("creditNotes")}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 p-6 flex items-center justify-between print:p-4"
          >
            <div className="flex items-center gap-4">
              <ArrowDown className="w-8 h-8 text-white" />
              <div className={`${locale.isRTL ? 'text-right' : 'text-left'}`}>
                <h3 className="text-xl font-black text-white">{t("creditNotesTitle")}</h3>
                <p className="text-red-200 font-bold">
                  {t("noteCount", { count: counts.creditNotes })} - {formatNumber(summary.creditNotesTotal)} {t("currency")}
                </p>
              </div>
            </div>
            {expandedSections.creditNotes ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
          </button>

          <AnimatePresence>
            {expandedSections.creditNotes && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-100">
                        <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("noteNumber")}</th>
                        <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("relatedInvoice")}</th>
                        <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("date")}</th>
                        <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("amount")}</th>
                        <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("reason")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {details.creditNotes.length > 0 ? (
                        details.creditNotes.map((cn) => (
                          <tr key={cn.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <span className="px-3 py-1.5 bg-red-100 rounded-lg text-sm font-bold text-red-700">
                                {cn.credit_note_number}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{cn.invoice_number}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{formatDate(cn.created_at)}</td>
                            <td className="px-6 py-4 text-lg font-black text-red-600">{formatNumber(cn.total_amount)} {t("currency")}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{cn.reason}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <ArrowDown className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold">{t("noCreditNotes")}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.56 }}
          className="bg-white rounded-[30px] shadow-xl border border-slate-100 overflow-hidden print:shadow-none"
        >
          <button
            onClick={() => toggleSection("manualIncome")}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 p-6 flex items-center justify-between print:p-4"
          >
          <div className="flex items-center gap-4">
            <Banknote className="w-8 h-8 text-white" />
            <div className={`${locale.isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-xl font-black text-white">{t("manualIncomeIncome")}</h3>
              <p className="text-amber-200 font-bold">
                {t("operationCount", { count: counts.manualIncome })} - {formatNumber(summary.manualIncomeTotal)} {t("currency")}
              </p>
            </div>
          </div>
          {expandedSections.manualIncome ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
        </button>

        <AnimatePresence>
          {expandedSections.manualIncome && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-100">
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("operationNumber")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("incomeType")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("date")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("beforeTax")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("tax")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("total")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("paymentMethod")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("description")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("createdBy")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {details.manualIncome.length > 0 ? (
                      details.manualIncome.map((inc) => (
                        <tr key={inc.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4">
                            <span className="px-3 py-1.5 bg-amber-100 rounded-lg text-sm font-bold text-amber-700">
                              {inc.operation_number}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">{inc.income_type}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-600">{formatDate(inc.income_date)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">{formatNumber(inc.amount)}</td>
                          <td className="px-6 py-4 text-sm font-bold text-amber-600">{formatNumber(inc.vat)}</td>
                          <td className="px-6 py-4 text-lg font-black text-emerald-600">{formatNumber(inc.total)}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                              {inc.payment_method}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{inc.description}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-500">{inc.created_by}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center">
                          <Banknote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-400 font-bold">{t("noManualIncome")}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-[30px] shadow-xl border border-slate-100 overflow-hidden print:shadow-none"
      >
        <button
          onClick={() => toggleSection("expenses")}
          className="w-full bg-gradient-to-r from-red-500 to-rose-600 p-6 flex items-center justify-between print:p-4"
        >
          <div className="flex items-center gap-4">
            <CreditCard className="w-8 h-8 text-white" />
            <div className={`${locale.isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-xl font-black text-white">{t("expenseDetails")}</h3>
              <p className="text-red-200 font-bold">
                {t("expenseCount", { count: counts.expenses })} - {formatNumber(summary.expensesTotal)} {t("currency")}
              </p>
            </div>
          </div>
          {expandedSections.expenses ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
        </button>

          <AnimatePresence>
            {expandedSections.expenses && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-slate-50 border-b-2 border-slate-100">
                        <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("expenseType")}</th>
                        <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("date")}</th>
                        <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("amount")}</th>
                        <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("employee")}</th>
                        <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("description")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {details.expenses.length > 0 ? (
                        details.expenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{exp.expense_type}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{formatDate(exp.expense_date)}</td>
                            <td className="px-6 py-4 text-lg font-black text-red-600">{formatNumber(exp.amount)} {t("currency")}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-600">{exp.employee_display_name}</td>
                            <td className="px-6 py-4 text-sm text-slate-500 max-w-[200px] truncate">{exp.description}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-400 font-bold">{t("noExpenses")}</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="bg-white rounded-[30px] shadow-xl border border-slate-100 overflow-hidden print:shadow-none"
      >
        <button
          onClick={() => toggleSection("payrolls")}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex items-center justify-between print:p-4"
        >
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-white" />
            <div className={`${locale.isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className="text-xl font-black text-white">{t("payrollDetails")}</h3>
              <p className="text-purple-200 font-bold">
                {t("payrollCount", { count: counts.payrolls })} - {formatNumber(summary.payrollsTotal)} {t("currency")}
              </p>
            </div>
          </div>
          {expandedSections.payrolls ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
        </button>

        <AnimatePresence>
          {expandedSections.payrolls && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-100">
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("payrollMonth")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("totalAmount")}</th>
                      <th className={`px-6 py-4 text-xs font-black text-slate-500 uppercase ${locale.isRTL ? 'text-right' : 'text-left'}`}>{t("creationDate")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {details.payrolls.length > 0 ? (
                      details.payrolls.map((pr) => (
                        <tr key={pr.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">{pr.payroll_month}</td>
                          <td className="px-6 py-4 text-lg font-black text-red-600">{formatNumber(pr.total_amount)} {t("currency")}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-600">{formatDate(pr.created_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center">
                          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-400 font-bold">{t("noPayrolls")}</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 print:hidden">
        <div className="flex items-center gap-2">
          <BarChart3 size={12} className="text-blue-500" />
            <span>{t("automatedReport")}</span>
        </div>
        <span>{t("allRightsReserved")} {new Date().getFullYear()}</span>
      </div>

      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}

export function ProfitLossClient() {
  const { isRTL } = useLocale();
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen font-bold">{isRTL ? "جاري التحميل..." : "Loading..."}</div>}>
      <ProfitLossContent />
    </Suspense>
  );
}
