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
import { useTheme } from "next-themes";

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
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
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
          <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-full border",
            isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200"
          )}>
            <CheckCircle size={13} />
            {t("paidStatus")}
          </span>
        );
      } else if (status === 'draft') {
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-full border",
            isDark ? "bg-white/10 text-slate-400 border-white/10" : "bg-slate-50 text-slate-500 border-slate-200"
          )}>
            <FileEdit size={13} />
            {t("draftStatus")}
          </span>
        );
      } else {
        return (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-full border",
            isDark ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-600 border-amber-200"
          )}>
            <Clock size={13} />
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
          className={cn(
            "relative overflow-hidden rounded-3xl p-6 md:p-10 shadow-2xl border",
            isDark 
              ? "bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] text-white border-white/10"
              : "bg-[#edd3de] text-slate-800 border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30"
          )}
        >
          <div className={cn(
            "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
            isDark ? "from-emerald-500 via-teal-500 via-blue-500 via-indigo-500 to-emerald-500 animate-gradient-x" : "from-pink-500 via-rose-400 via-orange-400 to-pink-500"
          )} />
        
        <div className="relative z-10 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center gap-8">
            <div className="space-y-3">
              <h1 className={cn(
                  "text-3xl md:text-5xl xl:text-6xl font-black tracking-tight bg-clip-text text-transparent",
                  isDark ? "bg-gradient-to-r from-white via-emerald-100 to-white" : "bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500"
                )}>
                  إدارة الفواتير الضريبية
                </h1>
                <p className={cn(
                  "text-xl md:text-2xl font-black",
                  isDark ? "text-emerald-100" : "text-slate-700"
                )}>
                  الفواتير الضريبية
                </p>
                <p className={cn(
                  "text-base md:text-lg font-medium leading-relaxed",
                  isDark ? "text-slate-300" : "text-slate-500"
                )}>
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
                  className={cn(
                    "backdrop-blur-xl rounded-2xl p-5 border shadow-2xl group transition-all",
                    isDark ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-white/60 border-[#c48da3]/30 hover:bg-white/80 shadow-[#d4a0b5]/20"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <span className={cn("font-black text-[9px] uppercase tracking-wider", isDark ? "text-emerald-300" : "text-emerald-600")}>{tc("total")}</span>
                  </div>
                  <p className={cn("text-xl font-black tracking-tight", isDark ? "text-white" : "text-slate-800")}>{stats.totalSubtotal.toLocaleString()}</p>
                  <p className={cn("text-[10px] font-black mt-1", isDark ? "text-emerald-400/60" : "text-emerald-600/60")}>{t("beforeTax")}</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className={cn(
                    "backdrop-blur-xl rounded-2xl p-5 border shadow-2xl group transition-all",
                    isDark ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-white/60 border-[#c48da3]/30 hover:bg-white/80 shadow-[#d4a0b5]/20"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span className={cn("font-black text-[9px] uppercase tracking-wider", isDark ? "text-blue-300" : "text-blue-600")}>{t("paid")}</span>
                  </div>
                  <p className={cn("text-xl font-black tracking-tight", isDark ? "text-white" : "text-slate-800")}>{stats.paidCount}</p>
                  <p className={cn("text-[10px] font-black mt-1", isDark ? "text-blue-400/60" : "text-blue-600/60")}>{t("paidStatus")}</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className={cn(
                    "backdrop-blur-xl rounded-2xl p-5 border shadow-2xl group transition-all",
                    isDark ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-white/60 border-[#c48da3]/30 hover:bg-white/80 shadow-[#d4a0b5]/20"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500 group-hover:scale-110 transition-transform">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className={cn("font-black text-[9px] uppercase tracking-wider", isDark ? "text-amber-300" : "text-amber-600")}>{t("dueStatus")}</span>
                  </div>
                  <p className={cn("text-xl font-black tracking-tight", isDark ? "text-white" : "text-slate-800")}>{stats.dueCount}</p>
                  <p className={cn("text-[10px] font-black mt-1", isDark ? "text-amber-400/60" : "text-amber-600/60")}>{t("dueStatus")}</p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className={cn(
                    "backdrop-blur-xl rounded-2xl p-5 border shadow-2xl group transition-all",
                    isDark ? "bg-white/10 border-white/10 hover:bg-white/20" : "bg-white/60 border-[#c48da3]/30 hover:bg-white/80 shadow-[#d4a0b5]/20"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500 group-hover:scale-110 transition-transform">
                      <FileEdit className="w-4 h-4" />
                    </div>
                    <span className={cn("font-black text-[9px] uppercase tracking-wider", isDark ? "text-purple-300" : "text-purple-600")}>{t("drafts")}</span>
                  </div>
                  <p className={cn("text-xl font-black tracking-tight", isDark ? "text-white" : "text-slate-800")}>{stats.draftCount}</p>
                  <p className={cn("text-[10px] font-black mt-1", isDark ? "text-purple-400/60" : "text-purple-600/60")}>{t("draftStatus")}</p>
                </motion.div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/sales-invoices/new">
                  <button className={cn(
                    "flex items-center gap-3 px-7 py-3 font-black text-sm rounded-2xl transition-all shadow-xl active:scale-95",
                    isDark ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-pink-500/25"
                  )}>
                    <Plus size={18} />
                    فاتورة جديدة
                  </button>
                </Link>
                <button 
                    onClick={() => router.refresh()}
                    className={cn(
                      "flex items-center gap-3 px-7 py-3 backdrop-blur-md rounded-2xl border font-black text-sm transition-all shadow-xl active:scale-95",
                      isDark ? "bg-white/10 border-white/20 text-white hover:bg-white/20" : "bg-white/70 border-[#c48da3]/40 text-slate-700 hover:bg-white/90"
                    )}
                  >
                  <RefreshCw size={18} className={isDark ? "text-emerald-400" : "text-pink-500"} />
                  تحديث
                </button>
            </div>
          </div>

          {/* Divider */}
            <div className={cn("border-t", isDark ? "border-white/10" : "border-[#c48da3]/30")} />

            {/* Search & Filter Bar */}
            <div className={cn(
              "backdrop-blur-xl rounded-2xl p-4 border flex flex-col lg:flex-row gap-4 items-center justify-between",
              isDark ? "bg-white/5 border-white/10" : "bg-white/50 border-[#c48da3]/30"
            )}>
              <div className="relative w-full lg:flex-1 lg:max-w-md">
                <Search className={cn("absolute right-4 top-1/2 -translate-y-1/2", isDark ? "text-slate-400" : "text-slate-400")} size={18} />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pr-12 pl-4 py-2.5 border rounded-xl text-sm font-medium outline-none transition-all",
                    isDark 
                      ? "bg-white/10 border-white/10 text-white focus:bg-white/20 focus:border-emerald-500/50 placeholder:text-slate-500"
                      : "bg-white/70 border-[#c48da3]/30 text-slate-800 focus:bg-white focus:border-pink-400 placeholder:text-slate-400"
                  )}
                />
              </div>
              <div className={cn(
                "flex flex-wrap items-center gap-2 p-1.5 rounded-xl border",
                isDark ? "bg-white/5 border-white/10" : "bg-white/40 border-[#c48da3]/20"
              )}>
                  <button 
                      onClick={() => setFilterStatus('all')}
                      className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", filterStatus === 'all' ? (isDark ? "bg-emerald-500 text-white shadow-lg" : "bg-pink-500 text-white shadow-lg") : (isDark ? "text-slate-400 hover:bg-white/10" : "text-slate-500 hover:bg-white/60"))}
                  >{tc("all")}</button>
                  <button 
                      onClick={() => setFilterStatus('paid')}
                      className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", filterStatus === 'paid' ? "bg-emerald-500 text-white shadow-lg" : (isDark ? "text-slate-400 hover:bg-white/10" : "text-slate-500 hover:bg-white/60"))}
                  >{t("paidStatus")}</button>
                  <button 
                      onClick={() => setFilterStatus('due')}
                      className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", filterStatus === 'due' ? "bg-amber-500 text-white shadow-lg" : (isDark ? "text-slate-400 hover:bg-white/10" : "text-slate-500 hover:bg-white/60"))}
                  >{t("dueStatus")}</button>
                  <button 
                      onClick={() => setFilterStatus('draft')}
                      className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black transition-all", filterStatus === 'draft' ? "bg-purple-500 text-white shadow-lg" : (isDark ? "text-slate-400 hover:bg-white/10" : "text-slate-500 hover:bg-white/60"))}
                  >{t("draftStatus")}</button>
              </div>
              <div className="flex gap-2 w-full lg:w-auto">
                <button className={cn(
                  "flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 font-bold text-sm rounded-xl border transition-all",
                  isDark ? "bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30" : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                )}>
                  <FileSpreadsheet size={16} />
                  {tc("export")}
                </button>
              </div>
            </div>

          {/* Table Section */}
            <div className={cn(
              "backdrop-blur-xl rounded-2xl border overflow-hidden shadow-2xl",
              isDark ? "bg-white/5 border-white/10" : "bg-white/60 border-[#c48da3]/30 shadow-[#d4a0b5]/20"
            )}>
              {/* Record Header Bar */}
              <div className={cn(
                "p-5 border-b flex items-center justify-between",
                isDark 
                  ? "bg-gradient-to-r from-white/5 via-white/10 to-white/5 border-white/10"
                  : "bg-gradient-to-r from-[#edd3de] via-[#f0d8e3] to-[#edd3de] border-[#c48da3]/30"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2.5 rounded-xl shadow-lg",
                    isDark ? "bg-emerald-500/20" : "bg-gradient-to-br from-pink-500 to-rose-500 shadow-pink-500/20"
                  )}>
                    <FileText className={cn("w-5 h-5", isDark ? "text-emerald-400" : "text-white")} />
                  </div>
                  <h3 className={cn(
                    "font-black text-base md:text-lg",
                    isDark ? "text-white" : "text-slate-800"
                  )}>{t("recordTitle")}</h3>
                </div>
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                  isDark ? "bg-white/10 text-slate-400" : "bg-white/60 text-slate-500 border border-[#c48da3]/20"
                )}>
                  {t("invoicesFound", { count: filteredInvoices.length })}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right min-w-[900px]">
                  <thead>
                    {/* Table Header Row */}
                    <tr className={cn(
                      "border-b",
                      isDark 
                        ? "bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 border-white/5"
                        : "bg-gradient-to-r from-[#f5e0ea] via-[#f8e6ef] to-[#f5e0ea] border-[#c48da3]/20"
                    )}>
                      <th className={cn("px-5 py-4 text-[11px] font-black uppercase tracking-widest", isDark ? "text-slate-300" : "text-slate-600")}>{t("invoiceNumber")}</th>
                      <th className={cn("px-5 py-4 text-[11px] font-black uppercase tracking-widest", isDark ? "text-slate-300" : "text-slate-600")}>{t("customer")}</th>
                      <th className={cn("px-5 py-4 text-[11px] font-black uppercase tracking-widest", isDark ? "text-slate-300" : "text-slate-600")}>{tc("date")}</th>
                      <th className={cn("px-5 py-4 text-[11px] font-black uppercase tracking-widest", isDark ? "text-slate-300" : "text-slate-600")}>{tc("amount")}</th>
                      <th className={cn("px-5 py-4 text-[11px] font-black uppercase tracking-widest", isDark ? "text-slate-300" : "text-slate-600")}>{tc("tax")}</th>
                      <th className={cn("px-5 py-4 text-[11px] font-black uppercase tracking-widest text-center", isDark ? "text-slate-300" : "text-slate-600")}>{tc("status")}</th>
                      <th className={cn("px-5 py-4 text-[11px] font-black uppercase tracking-widest text-center", isDark ? "text-slate-300" : "text-slate-600")}>{tc("actions")}</th>
                    </tr>
                  </thead>
                <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-[#c48da3]/10")}>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv, idx) => {
                      const status = inv.invoice_status || inv.status || 'due';
                      return (
                          <motion.tr 
                            key={inv.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.03 * idx }}
                            className={cn(
                              "transition-colors group",
                              isDark ? "hover:bg-white/5" : "hover:bg-pink-50/50"
                            )}
                          >
                            <td className="px-5 py-4">
                              <span className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-black border",
                                isDark ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-pink-50 text-pink-600 border-pink-200"
                              )}>
                                {inv.invoice_number}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                                  isDark ? "bg-white/5 text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400" : "bg-pink-50 text-pink-400 group-hover:bg-pink-100 group-hover:text-pink-600"
                                )}>
                                  <Building2 size={14} />
                                </div>
                                <span className={cn("font-bold text-sm truncate max-w-[180px]", isDark ? "text-slate-200" : "text-slate-700")}>{inv.client_name || tc("notSpecified")}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className={cn("flex items-center gap-2 text-xs font-bold", isDark ? "text-slate-400" : "text-slate-500")}>
                                <Calendar size={13} className={isDark ? "text-slate-500" : "text-slate-400"} />
                                {inv.issue_date}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className={cn("flex items-baseline gap-1", isDark ? "text-white" : "text-slate-800")}>
                                <span className="text-base font-black">{parseFloat(String(inv.total_amount)).toLocaleString()}</span>
                                <span className={cn("text-[9px] font-bold uppercase", isDark ? "text-slate-500" : "text-slate-400")}>{tc("sar")}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={cn("text-sm font-bold", isDark ? "text-emerald-400" : "text-emerald-600")}>
                                {parseFloat(String(inv.tax_amount)).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-center">
                              {getStatusBadge(status)}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <Link href={`/sales-invoices/${inv.id}`}>
                                  <button className={cn(
                                    "h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95",
                                    isDark ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white" : "bg-blue-50 text-blue-500 border border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500"
                                  )} title={tc("view")}>
                                    <Eye size={16} />
                                  </button>
                                </Link>
                                
                                {status === 'due' && (
                                  <button
                                    onClick={() => handleTogglePayment(inv.id, status)}
                                    disabled={loading === inv.id}
                                    className={cn(
                                      "h-9 px-3.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg",
                                      isDark ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white" : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
                                    )}
                                  >
                                    {loading === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />}
                                    {t("pay")}
                                  </button>
                                )}

                                {status === 'paid' && (
                                  <button
                                    onClick={() => handleTogglePayment(inv.id, status)}
                                    disabled={loading === inv.id}
                                    className={cn(
                                      "h-9 px-3.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg",
                                      isDark ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white" : "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-500 hover:text-white hover:border-amber-500"
                                    )}
                                  >
                                    {loading === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                                    {t("return")}
                                  </button>
                                )}

                                <button 
                                  onClick={() => handleDelete(inv.id, status, inv.invoice_number)}
                                  disabled={loading === inv.id}
                                  className={cn(
                                    "h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95 disabled:opacity-50",
                                    isDark ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white" : "bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500"
                                  )}
                                  title={tc("delete")}
                                >
                                  {loading === inv.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
                            <FileText size={56} className={isDark ? "text-slate-400" : "text-slate-300"} />
                            <div className="space-y-1">
                              <p className={cn("text-lg font-black", isDark ? "text-slate-300" : "text-slate-500")}>{t("noInvoices")}</p>
                              <p className={cn("text-xs font-medium", isDark ? "text-slate-500" : "text-slate-400")}>{t("startByCreating")}</p>
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
          <div className={cn("absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[100px] pointer-events-none", isDark ? "bg-emerald-500/10" : "bg-pink-300/20")} />
          <div className={cn("absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[100px] pointer-events-none", isDark ? "bg-blue-500/10" : "bg-rose-300/20")} />
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
