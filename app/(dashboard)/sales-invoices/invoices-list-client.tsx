"use client";
// v2
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
  X,
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
    let paidCount = 0;
    let dueCount = 0;
    let draftCount = 0;

    invoices.forEach((inv) => {
      const subtotal = parseFloat(String(inv.subtotal)) || 0;
      const status = inv.invoice_status || inv.status || "due";
      totalSubtotal += subtotal;
      if (status === "paid") paidCount++;
      else if (status === "draft") draftCount++;
      else dueCount++;
    });

    return { totalSubtotal, paidCount, dueCount, draftCount, totalCount: invoices.length };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const status = inv.invoice_status || inv.status || "due";
      const matchesSearch =
        inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "all" || status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [invoices, searchQuery, filterStatus]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: "success", message: "" }), 3000);
  };

  const handleTogglePayment = async (invoiceId: number, currentStatus: string) => {
    setLoading(invoiceId);
    try {
      const res = await fetch(`/api/sales-invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_payment" }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", data.message);
        router.refresh();
      } else {
        showNotification("error", data.error || tc("error"));
      }
    } catch {
      showNotification("error", t("errorFetching") || tc("networkError"));
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (invoiceId: number, status: string, invoiceNumber?: string) => {
    if (status !== "draft") {
      setPremiumModal({ show: true, invoiceNumber: invoiceNumber || "" });
      return;
    }
    if (!confirm(t("confirmDelete"))) return;
    setLoading(invoiceId);
    try {
      const res = await fetch(`/api/sales-invoices/${invoiceId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotification("success", data.message);
        router.refresh();
      } else {
        showNotification("error", data.error || tc("error"));
      }
    } catch {
      showNotification("error", t("errorFetching") || tc("networkError"));
    } finally {
      setLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "paid")
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <CheckCircle size={13} />
          {t("paidStatus")}
        </span>
      );
    if (status === "draft")
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-full border bg-white/10 text-slate-400 border-white/10">
          <FileEdit size={13} />
          {t("draftStatus")}
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black rounded-full border bg-amber-500/10 text-amber-400 border-amber-500/20">
        <Clock size={13} />
        {t("dueStatus")}
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen bg-transparent px-3 py-4 md:px-5 md:py-5 space-y-5">

      {/* ══ Premium / Cannot Delete Modal ══ */}
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
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 24 }}
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
                    transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.15 }}
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

      {/* ══ Notification — centered ══ */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[150]",
              "px-8 py-5 rounded-2xl shadow-2xl font-black flex items-center gap-4 border backdrop-blur-md min-w-[300px] justify-center",
              notification.type === "success"
                ? "bg-emerald-600/95 border-emerald-400/40 text-white shadow-emerald-500/30"
                : "bg-rose-600/95 border-rose-400/40 text-white shadow-rose-500/30"
            )}
          >
            <div className="p-2 rounded-xl bg-white/20">
              {notification.type === "success" ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
            </div>
            <span className="text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          1. HEADER CARD
      ══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border shadow-2xl shadow-black/20 p-6",
          isDark
            ? "bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 border-slate-600/30 hover:border-slate-500/40"
            : "bg-white border-slate-200 hover:border-slate-300"
        )}
      >
        {/* top accent line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left — icon + titles */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25 shrink-0">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-0.5", isDark ? "text-slate-500" : "text-slate-400")}>
                ZATCA
              </p>
              <h1 className={cn("text-xl font-black tracking-tight", isDark ? "text-white" : "text-slate-800")}>
                إدارة الفواتير الضريبية
              </h1>
              <p className={cn("text-xs font-bold mt-0.5", isDark ? "text-slate-400" : "text-slate-500")}>
                إدارة فواتير المبيعات وتحصيل الضرائب
              </p>
            </div>
          </div>

          {/* Right — action buttons */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            <button
              onClick={() => router.refresh()}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm border transition-all active:scale-95",
                isDark
                  ? "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              )}
            >
              <RefreshCw size={15} className="text-emerald-400" />
              تحديث
            </button>
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm border transition-all active:scale-95",
                isDark
                  ? "bg-blue-500/15 border-blue-500/30 text-blue-300 hover:bg-blue-500/25"
                  : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
              )}
            >
              <FileSpreadsheet size={15} />
              {tc("export")}
            </button>
            <Link href="/sales-invoices/new">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm text-white shadow-lg transition-all active:scale-95 bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25 hover:shadow-emerald-500/40">
                <Plus size={16} />
                فاتورة جديدة
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════
          2. STAT CARDS — fully colored
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: tc("total"),
            sub: t("beforeTax"),
            value: stats.totalSubtotal.toLocaleString("en-US", { minimumFractionDigits: 2 }),
            icon: Receipt,
            gradient: "from-emerald-500 to-teal-600",
          },
          {
            label: t("paidStatus"),
            sub: t("paid"),
            value: stats.paidCount,
            icon: CheckCircle,
            gradient: "from-blue-500 to-indigo-600",
          },
          {
            label: t("dueStatus"),
            sub: t("dueStatus"),
            value: stats.dueCount,
            icon: Clock,
            gradient: "from-amber-500 to-orange-600",
          },
          {
            label: t("drafts"),
            sub: t("draftStatus"),
            value: stats.draftCount,
            icon: FileEdit,
            gradient: "from-violet-500 to-purple-600",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className={cn(
              "relative overflow-hidden rounded-3xl p-6 shadow-2xl",
              `bg-gradient-to-br ${card.gradient}`
            )}
          >
            <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10 w-fit mb-4">
              <card.icon size={22} className="text-white/90" />
            </div>
            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{card.label}</p>
            <p className="text-4xl font-black text-white mt-2">{card.value}</p>
            <p className="text-white/50 text-[10px] font-bold mt-1">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          3. SEARCH & FILTER BAR
      ══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "rounded-2xl border p-4 flex flex-col lg:flex-row gap-4 items-center backdrop-blur-xl",
          isDark
            ? "bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 border-slate-600/30"
            : "bg-white border-slate-200"
        )}
      >
        {/* Search */}
        <div className="relative w-full lg:max-w-sm">
          <Search
            className={cn("absolute right-4 top-1/2 -translate-y-1/2", isDark ? "text-slate-500" : "text-slate-400")}
            size={16}
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pr-11 pl-4 py-2.5 rounded-xl text-sm font-bold outline-none border transition-all",
              isDark
                ? "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:bg-white/8"
                : "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-400"
            )}
          />
        </div>

        {/* Filter tabs */}
        <div
          className={cn(
            "flex items-center gap-1 p-1.5 rounded-xl border",
            isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
          )}
        >
          {[
            { key: "all", label: tc("all"), active: "bg-emerald-500" },
            { key: "paid", label: t("paidStatus"), active: "bg-blue-500" },
            { key: "due", label: t("dueStatus"), active: "bg-amber-500" },
            { key: "draft", label: t("draftStatus"), active: "bg-violet-500" },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilterStatus(btn.key)}
              className={cn(
                "px-3.5 py-2 rounded-lg text-xs font-black transition-all",
                filterStatus === btn.key
                  ? `${btn.active} text-white shadow-md`
                  : isDark
                  ? "text-slate-400 hover:bg-white/10"
                  : "text-slate-500 hover:bg-white"
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════
          4. INVOICE TABLE
      ══════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className={cn(
          "rounded-2xl border overflow-hidden shadow-2xl shadow-black/20",
          isDark
            ? "bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95 border-slate-600/30"
            : "bg-white border-slate-200"
        )}
      >
        {/* Table header bar */}
        <div
          className={cn(
            "px-6 py-4 border-b flex items-center justify-between",
            isDark
              ? "bg-gradient-to-r from-slate-900/60 via-slate-800/40 to-slate-900/60 border-slate-600/20"
              : "bg-slate-50 border-slate-200"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={cn("font-black text-base", isDark ? "text-white" : "text-slate-800")}>
                {t("recordTitle")}
              </h3>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest", isDark ? "text-slate-500" : "text-slate-400")}>
                {t("invoicesFound", { count: filteredInvoices.length })}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
              isDark ? "bg-white/5 border border-white/10 text-slate-400" : "bg-slate-100 text-slate-500"
            )}
          >
            {filteredInvoices.length} {tc("invoice") || "فاتورة"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[900px]">
            <thead>
              <tr
                className={cn(
                  "border-b text-[11px] font-black uppercase tracking-widest",
                  isDark ? "bg-slate-900/50 border-white/5 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
                )}
              >
                <th className="px-5 py-4">{t("invoiceNumber")}</th>
                <th className="px-5 py-4">{t("customer")}</th>
                <th className="px-5 py-4">{tc("date")}</th>
                <th className="px-5 py-4">{tc("amount")}</th>
                <th className="px-5 py-4">{tc("tax")}</th>
                <th className="px-5 py-4 text-center">{tc("status")}</th>
                <th className="px-5 py-4 text-center">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-slate-100")}>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv, idx) => {
                  const status = inv.invoice_status || inv.status || "due";
                  return (
                    <motion.tr
                      key={inv.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.02 * idx }}
                      className={cn(
                        "transition-colors group",
                        isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                      )}
                    >
                      {/* Invoice # */}
                      <td className="px-5 py-4">
                        <span
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-black border",
                            isDark
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-emerald-50 text-emerald-600 border-emerald-200"
                          )}
                        >
                          {inv.invoice_number}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-xl flex items-center justify-center transition-all shrink-0",
                              isDark
                                ? "bg-white/5 text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400"
                                : "bg-slate-100 text-slate-400"
                            )}
                          >
                            <Building2 size={14} />
                          </div>
                          <span
                            className={cn(
                              "font-bold text-sm truncate max-w-[180px]",
                              isDark ? "text-slate-200" : "text-slate-700"
                            )}
                          >
                            {inv.client_name || tc("notSpecified")}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4">
                        <div
                          className={cn(
                            "flex items-center gap-2 text-xs font-bold",
                            isDark ? "text-slate-400" : "text-slate-500"
                          )}
                        >
                          <Calendar size={12} className={isDark ? "text-slate-500" : "text-slate-400"} />
                          {inv.issue_date}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <div className={cn("flex items-baseline gap-1", isDark ? "text-white" : "text-slate-800")}>
                          <span className="text-base font-black">
                            {parseFloat(String(inv.total_amount)).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                          <span className={cn("text-[9px] font-bold uppercase", isDark ? "text-slate-500" : "text-slate-400")}>
                            {tc("sar")}
                          </span>
                        </div>
                      </td>

                      {/* Tax */}
                      <td className="px-5 py-4">
                        <span className={cn("text-sm font-black", isDark ? "text-emerald-400" : "text-emerald-600")}>
                          {parseFloat(String(inv.tax_amount)).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">{getStatusBadge(status)}</td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/sales-invoices/${inv.id}`}>
                            <button
                              className={cn(
                                "h-9 w-9 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95",
                                isDark
                                  ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white"
                                  : "bg-blue-50 text-blue-500 border border-blue-200 hover:bg-blue-500 hover:text-white"
                              )}
                              title={tc("view")}
                            >
                              <Eye size={16} />
                            </button>
                          </Link>

                          {status === "due" && (
                            <button
                              onClick={() => handleTogglePayment(inv.id, status)}
                              disabled={loading === inv.id}
                              className={cn(
                                "h-9 px-3.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shadow-lg",
                                isDark
                                  ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white"
                              )}
                            >
                              {loading === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />}
                              {t("pay")}
                            </button>
                          )}

                          {status === "paid" && (
                            <button
                              onClick={() => handleTogglePayment(inv.id, status)}
                              disabled={loading === inv.id}
                              className={cn(
                                "h-9 px-3.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shadow-lg",
                                isDark
                                  ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white"
                                  : "bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-500 hover:text-white"
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
                              isDark
                                ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white"
                                : "bg-rose-50 text-rose-500 border border-rose-200 hover:bg-rose-500 hover:text-white"
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
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div
                        className={cn(
                          "w-20 h-20 rounded-3xl flex items-center justify-center border",
                          isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"
                        )}
                      >
                        <FileText size={36} className={isDark ? "text-slate-600" : "text-slate-300"} />
                      </div>
                      <div className="space-y-1">
                        <p className={cn("text-base font-black", isDark ? "text-slate-400" : "text-slate-500")}>
                          {t("noInvoices")}
                        </p>
                        <p className={cn("text-xs font-medium", isDark ? "text-slate-600" : "text-slate-400")}>
                          {t("startByCreating")}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-1 opacity-50">
        <div className="flex items-center gap-2">
          <Sparkles size={10} className="text-emerald-500" />
          <span>{t("zatcaCompliant")}</span>
        </div>
        <span>{tc("allRightsReserved") || "All Rights Reserved"} © {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
