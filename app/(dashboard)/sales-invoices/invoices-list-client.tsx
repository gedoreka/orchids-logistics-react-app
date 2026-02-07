"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  FileEdit,
  RefreshCw,
  FileSpreadsheet,
  Sparkles,
  Receipt,
  Building2,
  Calendar,
  AlertCircle,
  Loader2,
  Banknote,
  ShieldAlert,
  ReceiptText,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/locale-context";

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_month: string;
  client_id: number;
  client_name: string;
  client_vat: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  vat_total: number;
  status: string;
  subtotal: number;
  tax_amount: number;
  invoice_status: string;
}

interface InvoicesListClientProps {
  invoices: Invoice[];
}

export function InvoicesListClient({ invoices }: InvoicesListClientProps) {
  const t = useTranslations("invoices");
  const tc = useTranslations("common");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });
  const [premiumModal, setPremiumModal] = useState<{
    show: boolean;
    invoiceNumber?: string;
  }>({ show: false });

  const stats = useMemo(() => {
    let totalSubtotal = 0;
    let totalPaidTax = 0;
    let totalDueTax = 0;
    let totalDraft = 0;
    let paidCount = 0;
    let dueCount = 0;
    let draftCount = 0;

    invoices.forEach((inv) => {
      const subtotal = parseFloat(String(inv.subtotal)) || 0;
      const taxAmount = parseFloat(String(inv.tax_amount)) || 0;
      const total = parseFloat(String(inv.total_amount)) || 0;
      const status = inv.invoice_status || inv.status || 'due';

      totalSubtotal += subtotal;

      if (status === 'paid') {
        totalPaidTax += taxAmount;
        paidCount++;
      } else if (status === 'draft') {
        totalDraft += total;
        draftCount++;
      } else {
        totalDueTax += taxAmount;
        dueCount++;
      }
    });

    return {
      totalSubtotal,
      totalPaidTax,
      totalDueTax,
      totalDraft,
      paidCount,
      dueCount,
      draftCount,
      totalCount: invoices.length
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const status = inv.invoice_status || inv.status || 'due';
      const matchesSearch = 
        inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "all" || status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [invoices, searchQuery, filterStatus]);

  const handleTogglePayment = async (invoiceId: number, currentStatus: string) => {
    setLoading(invoiceId);
    try {
      const res = await fetch(`/api/sales-invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_payment" })
      });

      const data = await res.json();

      if (data.success) {
        setNotification({ show: true, type: "success", message: data.message });
        router.refresh();
      } else {
        setNotification({ show: true, type: "error", message: data.error || tc("error") });
      }
    } catch {
      setNotification({ show: true, type: "error", message: t("errorFetching") || tc("networkError") });
    } finally {
      setLoading(null);
      setTimeout(() => setNotification({ show: false, type: "success", message: "" }), 3000);
    }
  };

  const handleDelete = async (invoiceId: number, status: string, invoiceNumber?: string) => {
    if (status !== 'draft') {
      setPremiumModal({ show: true, invoiceNumber: invoiceNumber || '' });
      return;
    }

    if (!confirm(t("confirmDelete"))) return;

    setLoading(invoiceId);
    try {
      const res = await fetch(`/api/sales-invoices/${invoiceId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setNotification({ show: true, type: "success", message: data.message });
        router.refresh();
      } else {
        setNotification({ show: true, type: "error", message: data.error || tc("error") });
      }
    } catch {
      setNotification({ show: true, type: "error", message: t("errorFetching") || tc("networkError") });
    } finally {
      setLoading(null);
      setTimeout(() => setNotification({ show: false, type: "success", message: "" }), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20">
          <CheckCircle size={12} />
          {t("paidStatus")}
        </span>
      );
    } else if (status === 'draft') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-slate-400 text-[10px] font-black rounded-full border border-white/10">
          <FileEdit size={12} />
          {t("draftStatus")}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black rounded-full border border-amber-500/20">
          <Clock size={12} />
          {t("dueStatus")}
        </span>
      );
    }
  };

    return (
    <div className="w-full h-full min-h-screen px-3 py-4 md:px-6 md:py-6 space-y-6">
      {/* Premium Modal - Cannot Delete Tax Invoice */}
      <AnimatePresence>
        {premiumModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setPremiumModal({ show: false })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-rose-900 to-pink-950 border border-rose-500/30 shadow-2xl shadow-rose-500/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500" />
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl" />
                
                <div className="relative p-8 text-center space-y-5">
                  <button
                    onClick={() => setPremiumModal({ show: false })}
                    className="absolute top-4 left-4 p-2 rounded-xl bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                  >
                    <X size={16} />
                  </button>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
                    className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-xl shadow-rose-500/30 border border-white/10"
                  >
                    <ShieldAlert size={40} className="text-white" />
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white">لا يمكن حذف الفاتورة الضريبية</h3>
                    {premiumModal.invoiceNumber && (
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10">
                        <ReceiptText size={14} className="text-rose-400" />
                        <span className="text-sm font-bold text-rose-300">{premiumModal.invoiceNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3 text-right">
                    <p className="text-sm text-rose-200 font-bold leading-relaxed">
                      الفواتير الضريبية المستحقة أو المدفوعة لا يمكن حذفها وفقاً لنظام هيئة الزكاة والضريبة والجمارك (ZATCA).
                    </p>
                    <div className="h-px bg-white/10" />
                    <p className="text-sm text-emerald-300 font-bold leading-relaxed flex items-start gap-2">
                      <CheckCircle size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                      <span>يمكنك استرداد المبلغ عبر إنشاء <strong className="text-white">إشعار دائن (مرتجع)</strong> من صفحة تفاصيل الفاتورة.</span>
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setPremiumModal({ show: false })}
                      className="flex-1 px-5 py-3 rounded-2xl bg-white/10 text-white font-black text-sm border border-white/10 hover:bg-white/20 transition-all active:scale-95"
                    >
                      فهمت
                    </button>
                    <Link href="/credit-notes/new" className="flex-1">
                      <button className="w-full px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all active:scale-95">
                        إنشاء مرتجع
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={cn(
              "fixed top-6 left-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl font-black flex items-center gap-3 border backdrop-blur-md",
              notification.type === "success" ? "bg-emerald-600/90 border-emerald-500 text-white" : "bg-rose-600/90 border-rose-500 text-white"
            )}
          >
            {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-6 md:p-10 text-white shadow-2xl border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 via-blue-500 via-indigo-500 to-emerald-500 animate-gradient-x" />
        
        <div className="relative z-10 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center gap-8">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-5xl xl:text-6xl font-black text-white tracking-tight bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                إدارة الفواتير الضريبية
              </h1>
              <p className="text-xl md:text-2xl font-black text-emerald-100">
                الفواتير الضريبية
              </p>
              <p className="text-base md:text-lg text-slate-300 font-medium leading-relaxed">
                إدارة فواتير المبيعات وتحصيل الضرائب
              </p>
            </div>

            {/* Summary Stats */}
            <div className="w-full flex justify-center">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 w-full max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <span className="text-emerald-300 font-black text-[9px] uppercase tracking-wider">{tc("total")}</span>
                </div>
                <p className="text-xl font-black text-white tracking-tight">{stats.totalSubtotal.toLocaleString()}</p>
                <p className="text-emerald-400/60 text-[10px] font-black mt-1">{t("beforeTax")}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <span className="text-blue-300 font-black text-[9px] uppercase tracking-wider">{t("paid")}</span>
                </div>
                <p className="text-xl font-black text-white tracking-tight">{stats.paidCount}</p>
                <p className="text-blue-400/60 text-[10px] font-black mt-1">{t("paidStatus")}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-amber-300 font-black text-[9px] uppercase tracking-wider">{t("dueStatus")}</span>
                </div>
                <p className="text-xl font-black text-white tracking-tight">{stats.dueCount}</p>
                <p className="text-amber-400/60 text-[10px] font-black mt-1">{t("dueStatus")}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <span className="text-purple-300 font-black text-[9px] uppercase tracking-wider">{t("drafts")}</span>
                </div>
                <p className="text-xl font-black text-white tracking-tight">{stats.draftCount}</p>
                <p className="text-purple-400/60 text-[10px] font-black mt-1">{t("draftStatus")}</p>
              </motion.div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/sales-invoices/new">
                <button className="flex items-center gap-3 px-7 py-3 bg-emerald-500 text-white font-black text-sm rounded-2xl hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
                  <Plus size={18} />
                  فاتورة جديدة
                </button>
              </Link>
              <button 
                  onClick={() => router.refresh()}
                  className="flex items-center gap-3 px-7 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95"
                >
                <RefreshCw size={18} className="text-emerald-400" />
                تحديث
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Search & Filter Bar */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:flex-1 lg:max-w-md">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium focus:bg-white/20 focus:border-emerald-500/50 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 bg-white/5 p-1.5 rounded-xl border border-white/10">
                <button 
                    onClick={() => setFilterStatus('all')}
                    className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", filterStatus === 'all' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/10")}
                >{tc("all")}</button>
                <button 
                    onClick={() => setFilterStatus('paid')}
                    className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", filterStatus === 'paid' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/10")}
                >{t("paidStatus")}</button>
                <button 
                    onClick={() => setFilterStatus('due')}
                    className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", filterStatus === 'due' ? "bg-amber-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/10")}
                >{t("dueStatus")}</button>
                <button 
                    onClick={() => setFilterStatus('draft')}
                    className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", filterStatus === 'draft' ? "bg-purple-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/10")}
                >{t("draftStatus")}</button>
            </div>
            <div className="flex gap-2 w-full lg:w-auto">
              <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500/20 text-blue-300 font-bold text-sm rounded-xl border border-blue-500/30 hover:bg-blue-500/30 transition-all">
                <FileSpreadsheet size={16} />
                {tc("export")}
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-black text-base md:text-lg">{t("recordTitle")}</h3>
              </div>
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                {t("invoicesFound", { count: filteredInvoices.length })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right min-w-[900px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("invoiceNumber")}</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("customer")}</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{tc("date")}</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{tc("amount")}</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{tc("tax")}</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{tc("status")}</th>
                    <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{tc("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv, idx) => {
                      const status = inv.invoice_status || inv.status || 'due';
                      return (
                        <motion.tr 
                          key={inv.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.03 * idx }}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="px-4 py-4">
                            <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-black border border-emerald-500/20">
                              {inv.invoice_number}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-all">
                                <Building2 size={14} />
                              </div>
                              <span className="font-bold text-sm text-slate-200 truncate max-w-[180px]">{inv.client_name || tc("notSpecified")}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                              <Calendar size={13} className="text-slate-500" />
                              {inv.issue_date}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-baseline gap-1 text-white">
                              <span className="text-base font-black">{parseFloat(String(inv.total_amount)).toLocaleString()}</span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase">{tc("sar")}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-bold text-emerald-400">
                              {parseFloat(String(inv.tax_amount)).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {getStatusBadge(status)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Link href={`/sales-invoices/${inv.id}`}>
                                <button className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95" title={tc("view")}>
                                  <Eye size={14} />
                                </button>
                              </Link>
                              
                              {status === 'due' && (
                                <button
                                  onClick={() => handleTogglePayment(inv.id, status)}
                                  disabled={loading === inv.id}
                                  className="h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-400 font-black text-xs flex items-center gap-1.5 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                                >
                                  {loading === inv.id ? <Loader2 size={12} className="animate-spin" /> : <Banknote size={12} />}
                                  {t("pay")}
                                </button>
                              )}

                              {status === 'paid' && (
                                <button
                                  onClick={() => handleTogglePayment(inv.id, status)}
                                  disabled={loading === inv.id}
                                  className="h-8 px-3 rounded-lg bg-amber-500/10 text-amber-400 font-black text-xs flex items-center gap-1.5 hover:bg-amber-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                                >
                                  {loading === inv.id ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                                  {t("return")}
                                </button>
                              )}

                              <button 
                                onClick={() => handleDelete(inv.id, status, inv.invoice_number)}
                                disabled={loading === inv.id}
                                className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                title={tc("delete")}
                              >
                                {loading === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-40">
                          <FileText size={56} className="text-slate-400" />
                          <div className="space-y-1">
                            <p className="text-lg font-black text-slate-300">{t("noInvoices")}</p>
                            <p className="text-xs font-medium text-slate-500">{t("startByCreating")}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-2 opacity-60">
        <div className="flex items-center gap-2">
          <Sparkles size={10} className="text-emerald-500" />
          <span>{t("zatcaCompliant")}</span>
        </div>
        <span>{tc("allRightsReserved") || "All Rights Reserved"} © {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
