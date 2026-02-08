"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import {
  FileText, Calendar, Save, Trash2, Edit, Eye, Search,
  CheckCircle2, AlertCircle, AlertTriangle, Clock, Loader2,
  X, Download, Printer, PlusCircle, LayoutDashboard, ArrowRight,
  Sparkles, TrendingUp, TrendingDown, BarChart3, Shield,
  Calculator, Send, ChevronLeft, ChevronRight, RefreshCw,
  Filter, List, ChevronDown, ChevronUp, Building, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────
interface TaxDeclaration {
  id: string;
  company_id: number;
  period_year: number;
  period_quarter: number;
  start_date: string;
  end_date: string;
  status: string;
  total_sales_taxable: number;
  total_output_tax: number;
  total_purchases_taxable: number;
  total_input_tax: number;
  net_tax_payable: number;
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalNetTax: number;
  totalOutputTax: number;
  totalInputTax: number;
  totalCount: number;
  draftCount: number;
  submittedCount: number;
  completedCount: number;
}

type ModalType = "idle" | "delete-confirm" | "deleting" | "delete-success" | "delete-error" | "notification";

interface ModalState {
  type: ModalType;
  declarationId: string | null;
  declarationLabel?: string;
  errorMessage?: string;
  notificationType?: "success" | "error" | "warning" | "info";
  notificationTitle?: string;
  notificationMessage?: string;
}

// ─── Main Content ────────────────────────────────────────────────
function TaxDeclarationsContent({ companyId }: { companyId: number }) {
  // Data
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>([]);
  const [stats, setStats] = useState<Stats>({ totalNetTax: 0, totalOutputTax: 0, totalInputTax: 0, totalCount: 0, draftCount: 0, submittedCount: 0, completedCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("");

  // UI states
  const [modal, setModal] = useState<ModalState>({ type: "idle", declarationId: null });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeclaration, setSelectedDeclaration] = useState<TaxDeclaration | null>(null);

  // Create form
  const [createStep, setCreateStep] = useState(1);
  const [collecting, setCollecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [period, setPeriod] = useState({ year: new Date().getFullYear().toString(), quarter: "1" });
  const [collectData, setCollectData] = useState({
    total_sales_taxable: 0, total_output_tax: 0,
    total_purchases_taxable: 0, total_input_tax: 0,
    net_tax_payable: 0, details: null as any,
  });

  // ─── Helpers ──────────────────────────────────────────────────
  const showNotification = useCallback((type: "success" | "error" | "warning" | "info", title: string, message: string) => {
    setModal({ type: "notification", declarationId: null, notificationType: type, notificationTitle: title, notificationMessage: message });
    if (type === "success" || type === "info") {
      setTimeout(() => setModal(prev => prev.type === "notification" ? { type: "idle", declarationId: null } : prev), 2500);
    }
  }, []);

  const closeModal = () => setModal({ type: "idle", declarationId: null });

  const getPeriodDates = (year: string, quarter: string) => {
    const y = parseInt(year);
    switch (parseInt(quarter)) {
      case 1: return { start: `${y}-01-01`, end: `${y}-03-31` };
      case 2: return { start: `${y}-04-01`, end: `${y}-06-30` };
      case 3: return { start: `${y}-07-01`, end: `${y}-09-30` };
      case 4: return { start: `${y}-10-01`, end: `${y}-12-31` };
      default: return { start: `${y}-01-01`, end: `${y}-03-31` };
    }
  };

  const getQuarterLabel = (q: number) => {
    switch (q) {
      case 1: return "يناير - مارس";
      case 2: return "أبريل - يونيو";
      case 3: return "يوليو - سبتمبر";
      case 4: return "أكتوبر - ديسمبر";
      default: return "";
    }
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("en-GB"); } catch { return d; }
  };

  const formatNum = (n: number | string) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ─── Data Fetching ────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ company_id: String(companyId) });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (yearFilter) params.set("year", yearFilter);

      const res = await fetch(`/api/taxes/declarations?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setDeclarations(data.declarations || []);
      setStats(data.stats || { totalNetTax: 0, totalOutputTax: 0, totalInputTax: 0, totalCount: 0, draftCount: 0, submittedCount: 0, completedCount: 0 });
    } catch (error) {
      console.error(error);
      showNotification("error", "خطأ", "فشل في جلب بيانات الإقرارات الضريبية");
    } finally {
      setLoading(false);
    }
  }, [companyId, statusFilter, yearFilter, showNotification]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Filtered data ────────────────────────────────────────────
  const filteredDeclarations = useMemo(() => {
    if (!searchTerm) return declarations;
    const lower = searchTerm.toLowerCase();
    return declarations.filter(d =>
      d.period_year.toString().includes(lower) ||
      `q${d.period_quarter}`.includes(lower) ||
      `الربع ${d.period_quarter}`.includes(lower)
    );
  }, [declarations, searchTerm]);

  // ─── Status helpers ───────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "completed": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      default: return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "submitted": return "مقدم";
      case "completed": return "مكتمل";
      default: return "مسودة";
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────
  const handleCollectData = async () => {
    setCollecting(true);
    const { start, end } = getPeriodDates(period.year, period.quarter);
    try {
      const res = await fetch(`/api/taxes/declarations/collect?company_id=${companyId}&start_date=${start}&end_date=${end}`);
      const data = await res.json();
      if (data.success) {
        setCollectData(data.data);
        setCreateStep(2);
        showNotification("success", "تم تجميع البيانات", "تم استخراج البيانات الضريبية بنجاح لهذه الفترة");
      } else {
        showNotification("error", "فشل التجميع", data.error || "لم نتمكن من الوصول للبيانات المطلوبة");
      }
    } catch {
      showNotification("error", "خطأ في الاتصال", "تعذر الاتصال بالخادم");
    } finally {
      setCollecting(false);
    }
  };

  const handleSaveDeclaration = async (status: string) => {
    setSaving(true);
    const { start, end } = getPeriodDates(period.year, period.quarter);
    try {
      const res = await fetch("/api/taxes/declarations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          period_year: parseInt(period.year),
          period_quarter: parseInt(period.quarter),
          start_date: start,
          end_date: end,
          status,
          total_sales_taxable: collectData.total_sales_taxable,
          total_output_tax: collectData.total_output_tax,
          total_purchases_taxable: collectData.total_purchases_taxable,
          total_input_tax: collectData.total_input_tax,
          net_tax_payable: collectData.net_tax_payable,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success",
          status === "submitted" ? "تم التقديم بنجاح" : "تم الحفظ بنجاح",
          status === "submitted" ? "تم تقديم الإقرار الضريبي النهائي" : "تم حفظ مسودة الإقرار الضريبي"
        );
        setShowCreateModal(false);
        resetCreateForm();
        fetchData();
      } else {
        showNotification("error", "فشل الحفظ", data.error || "حدث خطأ أثناء الحفظ");
      }
    } catch {
      showNotification("error", "خطأ في الاتصال", "تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  const resetCreateForm = () => {
    setCreateStep(1);
    setPeriod({ year: new Date().getFullYear().toString(), quarter: "1" });
    setCollectData({ total_sales_taxable: 0, total_output_tax: 0, total_purchases_taxable: 0, total_input_tax: 0, net_tax_payable: 0, details: null });
  };

  const openDeleteConfirm = (d: TaxDeclaration) => {
    setModal({ type: "delete-confirm", declarationId: d.id, declarationLabel: `الربع ${d.period_quarter} - ${d.period_year}` });
  };

  const handleDelete = async () => {
    if (!modal.declarationId) return;
    const id = modal.declarationId;
    const label = modal.declarationLabel;
    setModal({ type: "deleting", declarationId: id, declarationLabel: label });
    try {
      const res = await fetch(`/api/taxes/declarations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setModal({ type: "delete-success", declarationId: id, declarationLabel: label });
        fetchData();
      } else {
        setModal({ type: "delete-error", declarationId: id, errorMessage: data.error || "فشل في الحذف" });
      }
    } catch {
      setModal({ type: "delete-error", declarationId: id, errorMessage: "تعذر الاتصال بالخادم" });
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/taxes/declarations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification("success", "تم التحديث", "تم تغيير حالة الإقرار بنجاح");
        setShowEditModal(false);
        fetchData();
      } else {
        showNotification("error", "فشل التحديث", data.error || "حدث خطأ");
      }
    } catch {
      showNotification("error", "خطأ في الاتصال", "تعذر الاتصال بالخادم");
    }
  };

  // ─── Print ────────────────────────────────────────────────────
  const handlePrint = (d: TaxDeclaration) => {
    const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8"/>
  <title>إقرار ضريبة القيمة المضافة</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; background: #f8fafc; padding: 40px; color: #1e293b; }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 30px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 40px; text-align: center; }
    .header h1 { font-size: 28px; font-weight: 900; margin-bottom: 8px; }
    .header p { opacity: 0.7; font-size: 14px; }
    .badge { display: inline-block; padding: 6px 20px; border-radius: 20px; font-weight: 800; font-size: 12px; margin-top: 12px; }
    .badge-draft { background: #fef3c7; color: #92400e; }
    .badge-submitted { background: #d1fae5; color: #065f46; }
    .badge-completed { background: #dbeafe; color: #1e40af; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 2px solid #f1f5f9; }
    .info-item { padding: 20px 30px; border-left: 1px solid #f1f5f9; }
    .info-item:nth-child(odd) { border-left: none; }
    .info-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 800; margin-bottom: 6px; }
    .info-value { font-size: 18px; font-weight: 900; color: #1e293b; }
    .table-section { padding: 30px; }
    .table-section h3 { font-size: 16px; font-weight: 900; margin-bottom: 16px; color: #475569; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 12px 16px; text-align: right; font-weight: 800; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; }
    td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
    .amount { font-weight: 900; font-size: 16px; }
    .positive { color: #059669; }
    .negative { color: #dc2626; }
    .total-row { background: linear-gradient(135deg, #1e293b, #334155); color: white; }
    .total-row td { padding: 20px 16px; font-weight: 900; font-size: 18px; border: none; }
    .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 11px; border-top: 1px solid #f1f5f9; }
    @media print { body { padding: 0; background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>إقرار ضريبة القيمة المضافة</h1>
      <p>الربع ${d.period_quarter} - السنة المالية ${d.period_year}</p>
      <span class="badge badge-${d.status}">${getStatusLabel(d.status)}</span>
    </div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">تاريخ البداية</div>
        <div class="info-value">${d.start_date}</div>
      </div>
      <div class="info-item">
        <div class="info-label">تاريخ النهاية</div>
        <div class="info-value">${d.end_date}</div>
      </div>
      <div class="info-item">
        <div class="info-label">تاريخ الإنشاء</div>
        <div class="info-value">${formatDate(d.created_at)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">رقم الإقرار</div>
        <div class="info-value">${d.id.substring(0, 8).toUpperCase()}</div>
      </div>
    </div>
    <div class="table-section">
      <h3>تفاصيل الضريبة</h3>
      <table>
        <thead>
          <tr><th>البيان</th><th>المبلغ الخاضع (ر.س)</th><th>مبلغ الضريبة (ر.س)</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>إجمالي المبيعات الخاضعة للضريبة</td>
            <td class="amount">${formatNum(d.total_sales_taxable)}</td>
            <td class="amount positive">${formatNum(d.total_output_tax)}</td>
          </tr>
          <tr>
            <td>إجمالي المشتريات الخاضعة للضريبة</td>
            <td class="amount">${formatNum(d.total_purchases_taxable)}</td>
            <td class="amount negative">${formatNum(d.total_input_tax)}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2">صافي الضريبة المستحقة للسداد</td>
            <td>${formatNum(d.net_tax_payable)} ر.س</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      تم الطباعة في ${new Date().toLocaleString("ar-SA")} | Logistics Systems Pro
    </div>
  </div>
</body>
</html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(printContent); w.document.close(); w.print(); }
  };

  // ─── CSV Export ───────────────────────────────────────────────
  const exportCsv = () => {
    const rows = ["رقم الإقرار,السنة,الربع,تاريخ البداية,تاريخ النهاية,المبيعات الخاضعة,ضريبة المخرجات,المشتريات الخاضعة,ضريبة المدخلات,صافي الضريبة,الحالة"];
    declarations.forEach(d => {
      rows.push([
        d.id.substring(0, 8), d.period_year, d.period_quarter,
        d.start_date, d.end_date,
        d.total_sales_taxable, d.total_output_tax,
        d.total_purchases_taxable, d.total_input_tax,
        d.net_tax_payable, getStatusLabel(d.status),
      ].join(","));
    });
    const blob = new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tax-declarations-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("success", "تم التصدير", "تم تصدير ملف CSV بنجاح");
  };

  // ─── Animation variants ──────────────────────────────────────
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative p-6 bg-slate-800/80 rounded-3xl border border-white/10 backdrop-blur-xl">
              <Loader2 size={48} className="text-indigo-400 animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-white font-black text-lg">جاري تحميل الإقرارات الضريبية</p>
            <p className="text-slate-500 font-bold text-sm mt-1">يتم الاتصال بقاعدة البيانات...</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const statusTabs = [
    { key: "all", label: "الكل", color: "from-slate-500 to-slate-600", count: stats.totalCount },
    { key: "draft", label: "مسودة", color: "from-amber-500 to-orange-600", count: stats.draftCount },
    { key: "submitted", label: "مقدم", color: "from-emerald-500 to-teal-600", count: stats.submittedCount },
    { key: "completed", label: "مكتمل", color: "from-blue-500 to-indigo-600", count: stats.completedCount },
  ];

  return (
    <div className="min-h-screen pb-20 bg-transparent" dir="rtl">
      {/* ═══════════ Premium Modals ═══════════ */}
      <AnimatePresence>
        {modal.type !== "idle" && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !["deleting"].includes(modal.type) && closeModal()}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
            />

            {/* Delete Confirmation */}
            {modal.type === "delete-confirm" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
              >
                <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <AlertTriangle size={48} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-3xl font-black tracking-tight relative z-10">تأكيد الحذف</motion.h3>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="text-white/70 font-bold mt-2 relative z-10">هذا الإجراء نهائي ولا يمكن التراجع عنه</motion.p>
                </div>
                <div className="p-8 text-center space-y-6">
                  <div className="bg-red-950/30 rounded-2xl p-6 border-2 border-red-900/50">
                    <p className="text-slate-300 font-bold text-lg leading-relaxed">هل أنت متأكد من حذف هذا الإقرار الضريبي؟</p>
                    <p className="text-red-400 font-black text-xl mt-2">&quot;{modal.declarationLabel}&quot;</p>
                  </div>
                  <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-3">
                    <p className="text-amber-400 text-xs font-bold text-center">سيتم حذف كافة بيانات الإقرار نهائياً من قاعدة البيانات</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                      className="flex-1 flex items-center justify-center gap-3 bg-slate-800 text-slate-300 py-4 rounded-2xl font-black text-lg hover:bg-slate-700 transition-colors border border-white/10">
                      <X size={20} />إلغاء
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(239,68,68,0.4)" }} whileTap={{ scale: 0.98 }} onClick={handleDelete}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50">
                      <Trash2 size={20} />تأكيد الحذف
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Deleting */}
            {modal.type === "deleting" && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full max-w-md bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20">
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-10 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
                  </div>
                  <div className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <Loader2 size={48} className="text-white animate-spin" />
                  </div>
                  <h3 className="text-2xl font-black relative z-10">جاري الحذف</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">يرجى الانتظار...</p>
                </div>
                <div className="p-8">
                  <div className="bg-blue-950/30 rounded-2xl p-5 border-2 border-blue-900/50">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <p className="text-blue-400 font-bold text-center mt-3 text-sm">يتم حذف الإقرار الضريبي نهائياً...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Delete Success */}
            {modal.type === "delete-success" && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden border-4 border-emerald-500/20">
                <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-10 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
                  </div>
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <CheckCircle2 size={48} className="text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-black relative z-10">تم الحذف بنجاح</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">تمت إزالة الإقرار الضريبي من النظام</p>
                </div>
                <div className="p-8 text-center">
                  <div className="bg-emerald-950/30 rounded-2xl p-6 border-2 border-emerald-900/50 mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10">
                      <FileText size={14} className="text-emerald-400" />
                      <span className="text-sm font-black text-emerald-300">{modal.declarationLabel}</span>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                    className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg shadow-xl shadow-emerald-500/30">
                    حسناً
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Delete Error */}
            {modal.type === "delete-error" && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full max-w-md bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.2)] overflow-hidden border-4 border-red-500/20">
                <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
                  </div>
                  <div className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <AlertCircle size={48} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black relative z-10">فشل في الحذف</h3>
                </div>
                <div className="p-8 text-center space-y-4">
                  <div className="bg-red-950/30 rounded-2xl p-4 border border-red-900/50">
                    <p className="text-red-400 font-bold text-sm">{modal.errorMessage}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-800 text-white font-black text-lg hover:bg-slate-700 transition-colors border border-white/10">
                    حسناً
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ═══════════ Premium Notification Modal ═══════════ */}
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
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.15, type: "spring", damping: 15 }}
                      className="relative z-10 mx-auto w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-5 shadow-2xl border-4 border-white/30"
                    >
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
                      حسناً
                    </motion.button>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════ View Detail Modal ═══════════ */}
      <AnimatePresence>
        {showViewModal && selectedDeclaration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4"
            onClick={() => setShowViewModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-slate-900 rounded-[2.5rem] shadow-[0_0_100px_rgba(99,102,241,0.2)] w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-indigo-500/20"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 p-7 text-white flex justify-between items-center overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
                </div>
                <h3 className="text-xl font-black flex items-center gap-3 relative z-10">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10"><Eye size={20} /></div>
                  تفاصيل الإقرار الضريبي
                </h3>
                <div className="flex items-center gap-3 relative z-10">
                  <span className={cn("px-3 py-1.5 rounded-lg text-xs font-black border", getStatusBadge(selectedDeclaration.status))}>
                    {getStatusLabel(selectedDeclaration.status)}
                  </span>
                  <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-7 overflow-y-auto max-h-[calc(90vh-90px)] space-y-6">
                {/* Period Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">الفترة الضريبية</p>
                    <p className="text-white font-black text-lg">الربع {selectedDeclaration.period_quarter} - {selectedDeclaration.period_year}</p>
                    <p className="text-slate-500 text-xs font-bold mt-1">{getQuarterLabel(selectedDeclaration.period_quarter)}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">فترة التغطية</p>
                    <p className="text-white font-black text-lg">{selectedDeclaration.start_date}</p>
                    <p className="text-slate-500 text-xs font-bold mt-1">إلى {selectedDeclaration.end_date}</p>
                  </div>
                </div>

                {/* Tax Details */}
                <div className="space-y-3">
                  <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest border-b border-white/10 pb-2">تفاصيل الضريبة</h4>

                  <div className="flex justify-between items-center py-3.5 border-b border-white/5">
                    <span className="text-slate-400 font-bold">إجمالي المبيعات الخاضعة للضريبة</span>
                    <span className="font-black text-white">{formatNum(selectedDeclaration.total_sales_taxable)} <small className="text-slate-500 text-[10px]">ر.س</small></span>
                  </div>
                  <div className="flex justify-between items-center py-3.5 border-b border-white/5">
                    <span className="text-emerald-400 font-bold flex items-center gap-2"><TrendingUp size={14} />ضريبة المخرجات (+)</span>
                    <span className="font-black text-emerald-400">{formatNum(selectedDeclaration.total_output_tax)} <small className="text-emerald-600 text-[10px]">ر.س</small></span>
                  </div>
                  <div className="flex justify-between items-center py-3.5 border-b border-white/5">
                    <span className="text-slate-400 font-bold">إجمالي المشتريات الخاضعة للضريبة</span>
                    <span className="font-black text-white">{formatNum(selectedDeclaration.total_purchases_taxable)} <small className="text-slate-500 text-[10px]">ر.س</small></span>
                  </div>
                  <div className="flex justify-between items-center py-3.5 border-b border-white/5">
                    <span className="text-red-400 font-bold flex items-center gap-2"><TrendingDown size={14} />ضريبة المدخلات (-)</span>
                    <span className="font-black text-red-400">{formatNum(selectedDeclaration.total_input_tax)} <small className="text-red-600 text-[10px]">ر.س</small></span>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 rounded-2xl p-6 flex justify-between items-center mt-4">
                    <span className="font-black text-indigo-300 text-lg">صافي الضريبة المستحقة</span>
                    <span className="text-2xl font-black text-white">
                      {formatNum(selectedDeclaration.net_tax_payable)}
                      <small className="text-indigo-400 text-sm mr-2">ر.س</small>
                    </span>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between text-[10px] text-slate-600 font-bold pt-2 border-t border-white/5">
                  <span>تاريخ الإنشاء: {formatDate(selectedDeclaration.created_at)}</span>
                  <span>رقم: {selectedDeclaration.id.substring(0, 8).toUpperCase()}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowViewModal(false)}
                    className="flex-1 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl font-black text-sm border border-white/10 transition-all">
                    إغلاق
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handlePrint(selectedDeclaration)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-500/20 transition-all">
                    <Printer size={16} />طباعة الإقرار
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ Edit Status Modal ═══════════ */}
      <AnimatePresence>
        {showEditModal && selectedDeclaration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-slate-900 rounded-[2.5rem] shadow-[0_0_100px_rgba(245,158,11,0.2)] w-full max-w-md overflow-hidden border-2 border-amber-500/20"
              onClick={e => e.stopPropagation()}>

              <div className="relative bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 p-7 text-white flex justify-between items-center overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
                </div>
                <h3 className="text-xl font-black flex items-center gap-3 relative z-10">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10"><Edit size={20} /></div>
                  تعديل حالة الإقرار
                </h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors relative z-10">
                  <X size={20} />
                </button>
              </div>

              <div className="p-7 space-y-3">
                <p className="text-slate-400 text-sm font-bold mb-5">اختر الحالة الجديدة للإقرار الضريبي</p>
                {[
                  { value: "draft", label: "مسودة", icon: Clock, gradient: "from-amber-500/20 to-orange-500/20", borderActive: "border-amber-500/40", textColor: "text-amber-400", bgIcon: "bg-amber-500/30", desc: "الإقرار قيد المراجعة" },
                  { value: "submitted", label: "تم التقديم", icon: Send, gradient: "from-emerald-500/20 to-teal-500/20", borderActive: "border-emerald-500/40", textColor: "text-emerald-400", bgIcon: "bg-emerald-500/30", desc: "تم تقديم الإقرار رسمياً" },
                  { value: "completed", label: "مكتمل ومسدد", icon: CheckCircle2, gradient: "from-blue-500/20 to-indigo-500/20", borderActive: "border-blue-500/40", textColor: "text-blue-400", bgIcon: "bg-blue-500/30", desc: "تم السداد والاكتمال" },
                ].map(s => (
                  <motion.button
                    key={s.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleUpdateStatus(selectedDeclaration.id, s.value)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4.5 rounded-2xl border-2 transition-all text-right",
                      selectedDeclaration.status === s.value
                        ? `bg-gradient-to-r ${s.gradient} ${s.borderActive} ${s.textColor}`
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-xl",
                      selectedDeclaration.status === s.value ? s.bgIcon : "bg-white/10"
                    )}>
                      <s.icon size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-sm">{s.label}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{s.desc}</p>
                    </div>
                    {selectedDeclaration.status === s.value && (
                      <CheckCircle2 size={18} className="text-emerald-400" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ Create Declaration Modal ═══════════ */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4"
            onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-slate-900 rounded-[2.5rem] shadow-[0_0_100px_rgba(99,102,241,0.2)] w-full max-w-4xl max-h-[90vh] overflow-hidden border-2 border-indigo-500/20"
              onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 p-7 text-white flex justify-between items-center overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
                </div>
                <h3 className="text-xl font-black flex items-center gap-3 relative z-10">
                  <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10"><PlusCircle size={20} /></div>
                  إنشاء إقرار ضريبي جديد
                </h3>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black border border-white/10">
                    <span>الخطوة {createStep}</span>
                    <span className="text-white/50">/</span>
                    <span>3</span>
                  </div>
                  <button onClick={() => { setShowCreateModal(false); resetCreateForm(); }} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Stepper */}
              <div className="px-8 py-5 bg-slate-800/50 border-b border-white/5">
                <div className="relative flex items-center justify-between max-w-lg mx-auto">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 -z-0 rounded-full" />
                  <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-600 -translate-y-1/2 transition-all duration-500 -z-0 rounded-full"
                    style={{ width: `${((createStep - 1) / 2) * 100}%` }} />
                  {[
                    { n: 1, label: "الفترة", icon: Calendar },
                    { n: 2, label: "المراجعة", icon: Eye },
                    { n: 3, label: "التأكيد", icon: CheckCircle2 },
                  ].map(s => (
                    <div key={s.n} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-11 h-11 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all",
                        createStep > s.n
                          ? "bg-gradient-to-br from-indigo-500 to-violet-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30"
                          : createStep === s.n
                          ? "bg-slate-900 border-indigo-500 text-indigo-400"
                          : "bg-slate-800 border-white/10 text-slate-600"
                      )}>
                        {createStep > s.n ? <CheckCircle2 size={18} /> : <s.icon size={16} />}
                      </div>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest",
                        createStep >= s.n ? "text-indigo-400" : "text-slate-600"
                      )}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-7 overflow-y-auto max-h-[calc(90vh-220px)]">
                <AnimatePresence mode="wait">
                  {/* Step 1: Period Selection */}
                  {createStep === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                      className="space-y-6">
                      <div className="text-center mb-6">
                        <h4 className="text-white font-black text-xl">تحديد الفترة الضريبية</h4>
                        <p className="text-slate-500 text-sm font-bold mt-2">اختر السنة والربع السنوي المراد إصدار الإقرار له</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Year */}
                        <div className="space-y-3">
                          <label className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                            <Calendar size={12} className="text-indigo-400" />
                            السنة المالية
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["2024", "2025", "2026"].map(y => (
                              <motion.button key={y} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => setPeriod({ ...period, year: y })}
                                className={cn(
                                  "p-4 rounded-xl font-black text-sm transition-all border-2",
                                  period.year === y
                                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/30"
                                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:border-white/20"
                                )}>
                                {y}
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Quarter */}
                        <div className="space-y-3">
                          <label className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                            <BarChart3 size={12} className="text-indigo-400" />
                            الربع السنوي
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { v: "1", l: "الربع الأول", sub: "يناير - مارس" },
                              { v: "2", l: "الربع الثاني", sub: "أبريل - يونيو" },
                              { v: "3", l: "الربع الثالث", sub: "يوليو - سبتمبر" },
                              { v: "4", l: "الربع الرابع", sub: "أكتوبر - ديسمبر" },
                            ].map(q => (
                              <motion.button key={q.v} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => setPeriod({ ...period, quarter: q.v })}
                                className={cn(
                                  "p-4 rounded-xl font-black text-sm transition-all border-2 text-right",
                                  period.quarter === q.v
                                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/30"
                                    : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:border-white/20"
                                )}>
                                <p className="font-black">{q.l}</p>
                                <p className={cn("text-[10px] font-bold mt-0.5",
                                  period.quarter === q.v ? "text-white/70" : "text-slate-600"
                                )}>{q.sub}</p>
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex gap-3">
                        <Info size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-300 text-xs font-bold leading-relaxed">
                          سيقوم النظام بتجميع كافة الفواتير والمصروفات والإيرادات المسجلة ضمن هذه الفترة تلقائياً وحساب المبالغ الضريبية المستحقة بدقة.
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCollectData}
                        disabled={collecting}
                        className="w-full flex items-center justify-center gap-3 px-8 py-4.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl font-black text-base shadow-xl shadow-indigo-500/25 disabled:opacity-50 transition-all border-b-4 border-indigo-700/50"
                      >
                        {collecting ? (
                          <><RefreshCw size={20} className="animate-spin" />جاري معالجة البيانات...</>
                        ) : (
                          <><Calculator size={20} />تجميع البيانات وحساب الضريبة</>
                        )}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Step 2: Review */}
                  {createStep === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                      className="space-y-6">
                      <div className="text-center mb-4">
                        <h4 className="text-white font-black text-xl">مراجعة البيانات المحسوبة</h4>
                        <p className="text-slate-500 text-sm font-bold mt-2">نتائج تجميع البيانات للفترة: الربع {period.quarter} - {period.year}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Output Tax Card */}
                        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-500/20 rounded-2xl p-6 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/20"><TrendingUp size={20} className="text-emerald-400" /></div>
                            <div>
                              <h4 className="text-white font-black text-sm">المخرجات</h4>
                              <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">ضريبة مستحقة (+)</p>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3.5 flex justify-between items-center border border-white/5">
                            <span className="text-slate-500 text-xs font-bold">المبيعات الخاضعة</span>
                            <span className="text-white font-black">{formatNum(collectData.total_sales_taxable)}</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">ضريبة المخرجات</p>
                            <p className="text-3xl font-black text-emerald-400">{formatNum(collectData.total_output_tax)} <small className="text-sm text-emerald-600">ر.س</small></p>
                          </div>
                        </div>

                        {/* Input Tax Card */}
                        <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-2 border-red-500/20 rounded-2xl p-6 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-red-500/20 rounded-xl border border-red-500/20"><TrendingDown size={20} className="text-red-400" /></div>
                            <div>
                              <h4 className="text-white font-black text-sm">المدخلات</h4>
                              <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest">ضريبة مستردة (-)</p>
                            </div>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3.5 flex justify-between items-center border border-white/5">
                            <span className="text-slate-500 text-xs font-bold">المشتريات الخاضعة</span>
                            <span className="text-white font-black">{formatNum(collectData.total_purchases_taxable)}</span>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">ضريبة المدخلات</p>
                            <p className="text-3xl font-black text-red-400">{formatNum(collectData.total_input_tax)} <small className="text-sm text-red-600">ر.س</small></p>
                          </div>
                        </div>
                      </div>

                      {/* Net Tax */}
                      <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border-2 border-indigo-500/30 rounded-2xl p-7 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-1">صافي الضريبة المستحقة للسداد</p>
                          <p className="text-4xl font-black text-white">
                            {formatNum(collectData.net_tax_payable)}
                            <small className="text-lg text-indigo-400 mr-2">ر.س</small>
                          </p>
                        </div>
                        <div className={cn(
                          "px-4 py-2 rounded-xl font-black text-sm border",
                          collectData.net_tax_payable > 0
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        )}>
                          {collectData.net_tax_payable > 0 ? "مستحق للسداد" : "رصيد دائن"}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setCreateStep(1)}
                          className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-black text-sm border border-white/10 transition-all">
                          <ChevronRight size={16} />تعديل الفترة
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setCreateStep(3)}
                          className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-500/20 transition-all border-b-4 border-indigo-700/50">
                          مراجعة التفاصيل والمتابعة<ChevronLeft size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Confirm */}
                  {createStep === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                      className="space-y-6">
                      <div className="text-center mb-4">
                        <h4 className="text-white font-black text-xl">التأكيد النهائي والتقديم</h4>
                        <p className="text-slate-500 text-sm font-bold mt-2">يرجى مراجعة كافة المبالغ قبل الحفظ النهائي</p>
                      </div>

                      {/* Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "السنة", value: period.year, icon: Calendar },
                          { label: "الربع", value: `الربع ${period.quarter}`, icon: BarChart3 },
                          { label: "ضريبة المخرجات", value: formatNum(collectData.total_output_tax), color: "text-emerald-400", icon: TrendingUp },
                          { label: "ضريبة المدخلات", value: formatNum(collectData.total_input_tax), color: "text-red-400", icon: TrendingDown },
                        ].map((item, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-1.5 mb-2">
                              <item.icon size={10} className="text-slate-500" />
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.label}</p>
                            </div>
                            <p className={cn("font-black text-sm", item.color || "text-white")}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border-2 border-indigo-500/30 rounded-2xl p-6 text-center">
                        <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-2">صافي الضريبة المستحقة</p>
                        <p className="text-3xl font-black text-white">{formatNum(collectData.net_tax_payable)} <small className="text-indigo-400 text-sm">ر.س</small></p>
                      </div>

                      <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl p-5 flex gap-3">
                        <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-amber-300 text-sm font-black">إقرار بالصحة والمسؤولية</p>
                          <p className="text-amber-400/70 text-xs font-bold leading-relaxed mt-1">بالنقر على &quot;تقديم الإقرار&quot;، فإنك تقر بصحة كافة البيانات ومطابقتها للسجلات المالية.</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-white/10">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => setCreateStep(2)}
                          className="flex items-center gap-2 px-4 py-3.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-black text-sm border border-white/10 transition-all">
                          <ChevronRight size={16} />رجوع
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={() => handleSaveDeclaration("draft")}
                          disabled={saving}
                          className="flex items-center gap-2 px-6 py-3.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl font-black text-sm border border-amber-500/20 disabled:opacity-30 transition-all">
                          <Clock size={16} />حفظ كمسودة
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(16,185,129,0.3)" }} whileTap={{ scale: 0.98 }}
                          onClick={() => handleSaveDeclaration("submitted")}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-500/20 disabled:opacity-30 transition-all border-b-4 border-emerald-700/50">
                          {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          تقديم الإقرار النهائي
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ Main Layout ═══════════ */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 pt-6">
        <div className="bg-slate-900 rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">

          {/* ─── Header ───────────────────────────────────────── */}
          <div className="p-8 space-y-8 bg-slate-900 border-b border-white/5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/10">
                  <FileText className="text-white" size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    <Link href="/dashboard" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
                      <LayoutDashboard size={12} />
                      لوحة التحكم
                    </Link>
                    <ArrowRight size={10} className="rotate-180" />
                    <span className="text-indigo-500">الإقرارات الضريبية</span>
                  </div>
                  <h1 className="text-2xl font-black text-white tracking-tight">وحدة الإقرارات الضريبية</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchData}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-sm"
                >
                  <RefreshCw size={16} />
                  تحديث
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { resetCreateForm(); setShowCreateModal(true); }}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 transition-all font-black text-sm shadow-xl shadow-indigo-500/25 border-b-4 border-indigo-700/50"
                >
                  <PlusCircle size={20} />
                  إنشاء إقرار جديد
                </motion.button>
              </div>
            </div>

            {/* ─── Stats Cards ────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "صافي الضريبة المستحقة", value: formatNum(stats.totalNetTax), icon: Calculator, gradient: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-500/20", suffix: "ر.س" },
                { label: "ضريبة المخرجات", value: formatNum(stats.totalOutputTax), icon: TrendingUp, gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20", suffix: "ر.س" },
                { label: "ضريبة المدخلات", value: formatNum(stats.totalInputTax), icon: TrendingDown, gradient: "from-red-500 to-rose-600", shadow: "shadow-red-500/20", suffix: "ر.س" },
                { label: "إقرارات مقدمة", value: String(stats.submittedCount), icon: CheckCircle2, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20" },
                { label: "إقرارات معلقة", value: String(stats.draftCount), icon: Clock, gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20" },
              ].map((card, i) => (
                <motion.div key={i} variants={itemVariants} className="relative group">
                  <div className={`h-full rounded-2xl bg-gradient-to-br ${card.gradient} p-5 shadow-lg ${card.shadow} transition-all group-hover:shadow-xl group-hover:scale-[1.02]`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 bg-white/15 rounded-xl text-white backdrop-blur-md border border-white/10">
                        <card.icon size={18} />
                      </div>
                    </div>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{card.label}</p>
                    <p className="text-xl font-black text-white mt-1 flex items-baseline gap-1">
                      {card.value}
                      {card.suffix && <span className="text-xs text-white/60 font-bold">{card.suffix}</span>}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ─── Filters & Status Tabs ─────────────────────────── */}
          <div className="bg-slate-900/80 px-8 py-5 border-b border-white/5 space-y-4">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {statusTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all",
                    statusFilter === tab.key
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                      : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black", statusFilter === tab.key ? "bg-white/20" : "bg-white/5")}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="بحث بالسنة أو الربع..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full py-2.5 pr-10 pl-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500/50 focus:bg-white/10 outline-none transition-all text-sm font-bold"
                />
              </div>

              <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
                className="py-2.5 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:border-indigo-500/50 outline-none transition-all appearance-none cursor-pointer [color-scheme:dark]">
                <option value="">كل السنوات</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>

              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={exportCsv}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-black">
                <Download size={14} />تصدير CSV
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                if (filteredDeclarations.length > 0) {
                  handlePrint(filteredDeclarations[0]);
                } else {
                  showNotification("warning", "لا يوجد بيانات", "لا يوجد إقرارات لطباعتها");
                }
              }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-black">
                <Printer size={14} />طباعة
              </motion.button>
            </div>
          </div>

          {/* ─── Table Header ─────────────────────────────────── */}
          <div className="bg-slate-900 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <List className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-white font-black tracking-tight text-lg">سجل الإقرارات الضريبية</h3>
                <p className="text-slate-400 text-xs font-bold tracking-wide uppercase">{filteredDeclarations.length} إقرار مسجل</p>
              </div>
            </div>
          </div>

          {/* ─── Declarations List ─────────────────────────────── */}
          <div className="p-6">
            <div className="space-y-3">
              {filteredDeclarations.length > 0 ? (
                filteredDeclarations.map((d) => (
                  <motion.div key={d.id} variants={itemVariants}
                    className="rounded-2xl overflow-hidden border border-white/5 hover:border-indigo-500/20 transition-all group bg-slate-800/50 hover:bg-slate-800/80">
                    <div className="p-5 flex justify-between items-center">
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Period Badge */}
                        <div className="px-4 py-2.5 rounded-xl font-black text-sm border-2 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 text-indigo-400 border-indigo-500/20">
                          الربع {d.period_quarter} - {d.period_year}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                            <Calendar size={10} />
                            {d.start_date} → {d.end_date}
                          </span>
                          <span className="text-slate-300 font-bold text-sm">{getQuarterLabel(d.period_quarter)}</span>
                        </div>
                        <span className={cn("px-3 py-1.5 rounded-lg text-[10px] font-black border", getStatusBadge(d.status))}>
                          {getStatusLabel(d.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Tax amounts */}
                        <div className="hidden md:flex items-center gap-6">
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 font-black uppercase">المخرجات</span>
                            <span className="text-sm font-black text-emerald-400">{formatNum(d.total_output_tax)}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 font-black uppercase">المدخلات</span>
                            <span className="text-sm font-black text-red-400">{formatNum(d.total_input_tax)}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 font-black uppercase">الصافي</span>
                            <span className="text-lg font-black text-white">
                              {formatNum(d.net_tax_payable)}
                              <small className="text-[10px] text-slate-500 font-bold mr-1">ر.س</small>
                            </span>
                          </div>
                        </div>

                        {/* Actions - Always visible */}
                        <div className="flex gap-2">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedDeclaration(d); setShowViewModal(true); }}
                            className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 transition-colors border border-indigo-500/20"
                            title="عرض التفاصيل">
                            <Eye size={16} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => { setSelectedDeclaration(d); setShowEditModal(true); }}
                            className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-500/30 transition-colors border border-amber-500/20"
                            title="تعديل الحالة">
                            <Edit size={16} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => handlePrint(d)}
                            className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors border border-blue-500/20"
                            title="طباعة الإقرار">
                            <Printer size={16} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => openDeleteConfirm(d)}
                            className="p-2.5 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/20"
                            title="حذف">
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile amounts */}
                    <div className="md:hidden px-5 pb-4 flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-bold">المخرجات:</span>
                        <span className="text-emerald-400 font-black">{formatNum(d.total_output_tax)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-bold">المدخلات:</span>
                        <span className="text-red-400 font-black">{formatNum(d.total_input_tax)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-bold">الصافي:</span>
                        <span className="text-white font-black">{formatNum(d.net_tax_payable)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 rounded-3xl border-2 border-dashed border-white/10 bg-white/5">
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl" />
                    <div className="relative p-5 bg-slate-800/80 rounded-2xl border border-white/10">
                      <FileText size={48} className="text-slate-600" />
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-slate-400">لا يوجد إقرارات ضريبية</h4>
                  <p className="text-slate-600 text-sm font-bold mt-1">ابدأ بإنشاء إقرار ضريبي جديد للفترة الحالية</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { resetCreateForm(); setShowCreateModal(true); }}
                    className="mt-6 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-500/20 border-b-4 border-indigo-700/50"
                  >
                    <PlusCircle size={16} className="inline ml-2" />إنشاء إقرار جديد
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────
export function TaxDeclarationsClient({ companyId }: { companyId: number }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-indigo-500 animate-spin" />
          <p className="text-slate-400 font-black text-sm">جاري التحميل...</p>
        </div>
      </div>
    }>
      <TaxDeclarationsContent companyId={companyId} />
    </Suspense>
  );
}
