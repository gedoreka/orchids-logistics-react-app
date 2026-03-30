"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  X,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Layers,
  TrendingUp,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/locale-context";

interface Payroll {
  id: number;
  payroll_month: string;
  package_id: number;
  package_name: string;
  work_type: string;
  saved_by: string;
  created_at: string;
  is_draft: number;
  total_amount: number;
  employee_count: number;
}

interface PayrollsListClientProps {
  payrolls: Payroll[];
  stats: {
    total: number;
    total_amount: number;
    draft_count: number;
    confirmed_count: number;
  };
  companyId: number;
}

type ModalType = 'idle' | 'delete-confirm' | 'deleting' | 'delete-success' | 'delete-error';

interface ModalState {
  type: ModalType;
  payroll: Payroll | null;
  errorMessage?: string;
}

export function PayrollsListClient({ payrolls: initialPayrolls, stats, companyId }: PayrollsListClientProps) {
  const t = useTranslations("financialVouchersPage.salaryPayrollsPage");
  const tCommon = useTranslations("common");
  const { locale } = useLocale();
  const isRtl = locale === "ar";

  const [payrolls, setPayrolls] = useState(initialPayrolls);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState<ModalState>({ type: 'idle', payroll: null });
  const router = useRouter();

  const filteredPayrolls = payrolls.filter(p => {
    const search = searchTerm.toLowerCase();
    return (
      p.payroll_month?.toLowerCase().includes(search) ||
      p.package_name?.toLowerCase().includes(search) ||
      p.saved_by?.toLowerCase().includes(search)
    );
  });

  const openDeleteConfirm = (payroll: Payroll) => {
    setModal({ type: 'delete-confirm', payroll });
  };

  const closeModal = () => {
    setModal({ type: 'idle', payroll: null });
  };

  const handleDelete = async () => {
    if (!modal.payroll) return;
    const payroll = modal.payroll;
    
    setModal({ type: 'deleting', payroll });
    
    try {
      const res = await fetch(`/api/payrolls/${payroll.id}`, { method: "DELETE" });
      
      if (res.ok) {
        setPayrolls(prev => prev.filter(p => p.id !== payroll.id));
        setModal({ type: 'delete-success', payroll });
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setModal({ type: 'delete-error', payroll, errorMessage: data.error || t("notifications.deleteFailedMsg") });
      }
    } catch {
      setModal({ type: 'delete-error', payroll, errorMessage: t("notifications.errorMsg") });
    }
  };

  const getWorkTypeLabel = (type: string) => {
    switch (type) {
      case 'salary': return t("workTypes.salary");
      case 'target': return t("workTypes.target");
      case 'tiers': return t("workTypes.tiers");
      case 'commission': return t("workTypes.commission");
      default: return type;
    }
  };

  const getWorkTypeBadge = (type: string) => {
    switch (type) {
      case 'salary': return 'bg-emerald-100 text-emerald-700';
      case 'target': return 'bg-blue-100 text-blue-700';
      case 'tiers': return 'bg-purple-100 text-purple-700';
      case 'commission': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Premium Delete Modals */}
      <AnimatePresence>
        {modal.type !== 'idle' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !['deleting'].includes(modal.type) && closeModal()}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
            />

            {/* Delete Confirmation */}
            {modal.type === 'delete-confirm' && modal.payroll && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
              >
                <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <AlertTriangle size={48} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-black tracking-tight relative z-10">
                    {t("notifications.deleteConfirm")}
                  </motion.h3>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-white/80 font-bold mt-2 relative z-10">
                    {t("notifications.deleteQuestion")}
                  </motion.p>
                </div>
                <div className="p-8 text-center space-y-6" dir="rtl">
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 border-2 border-red-100 dark:border-red-900/50">
                    <p className="text-slate-700 dark:text-slate-300 font-bold text-lg leading-relaxed">{t("notifications.deleteWarning")}</p>
                    <p className="text-red-600 dark:text-red-400 font-black text-xl mt-2 truncate">&quot;{modal.payroll.payroll_month}&quot;</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1"><Users size={14} /><span className="text-xs font-bold">{t("table.employeesCount")}</span></div>
                      <p className="text-lg font-black text-gray-900">{modal.payroll.employee_count}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1"><DollarSign size={14} /><span className="text-xs font-bold">{t("table.totalSalaries")}</span></div>
                      <p className="text-lg font-black text-gray-900">{Number(modal.payroll.total_amount || 0).toLocaleString(locale)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1"><Layers size={14} /><span className="text-xs font-bold">{t("table.package")}</span></div>
                      <p className="text-sm font-black text-gray-900 truncate">{modal.payroll.package_name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-amber-600 mb-1"><Calendar size={14} /><span className="text-xs font-bold">{t("table.payrollMonth")}</span></div>
                      <p className="text-sm font-black text-gray-900">{modal.payroll.payroll_month}</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-800 text-xs font-bold text-center">{t("notifications.deleteNote")}</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal} className="flex-1 flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      <X size={20} />{tCommon("cancel")}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.4)" }} whileTap={{ scale: 0.98 }} onClick={handleDelete} className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50">
                      <Trash2 size={20} />{t("notifications.confirmBtn")}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Deleting */}
            {modal.type === 'deleting' && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20">
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-10 text-white text-center overflow-hidden">
                  <motion.div className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <Loader2 size={48} className="text-white animate-spin" />
                  </motion.div>
                  <h3 className="text-2xl font-black relative z-10">جاري حذف المسير</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">يرجى الانتظار...</p>
                </div>
                <div className="p-8">
                  <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-100">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <p className="text-blue-700 font-bold text-center mt-3 text-sm">جاري إزالة السجلات المالية المرتبطة...</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Delete Success */}
            {modal.type === 'delete-success' && modal.payroll && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ type: "spring", damping: 20, stiffness: 300 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden border-4 border-emerald-500/20">
                <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-10 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div key={i} initial={{ y: 100, opacity: 0 }} animate={{ y: -100, opacity: [0, 1, 0], x: Math.random() * 100 - 50 }} transition={{ delay: i * 0.2, duration: 2, repeat: Infinity, repeatDelay: 1 }} className="absolute" style={{ left: `${15 + i * 15}%` }}>
                        <Sparkles size={20} className="text-white/40" />
                      </motion.div>
                    ))}
                  </div>
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.1, type: "spring", damping: 12 }} className="relative z-10 mx-auto w-28 h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ delay: 0.3, duration: 0.5 }}>
                      <CheckCircle2 size={56} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-black tracking-tight relative z-10">{t("notifications.deleteSuccess")}</motion.h3>
                  <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-white/80 font-bold mt-2 relative z-10">{t("notifications.deleteSuccessMsg")}</motion.p>
                </div>
                <div className="p-8 text-center space-y-6" dir="rtl">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-6 border-2 border-emerald-100 dark:border-emerald-900/50">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-3 border border-emerald-100"><div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1"><Calendar size={12} /><span className="text-[10px] font-bold">شهر المسير</span></div><p className="font-black text-gray-900 text-sm">{modal.payroll.payroll_month}</p></div>
                      <div className="bg-white rounded-xl p-3 border border-emerald-100"><div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1"><Layers size={12} /><span className="text-[10px] font-bold">{t("table.package")}</span></div><p className="font-black text-gray-900 text-sm truncate">{modal.payroll.package_name}</p></div>
                      <div className="bg-white rounded-xl p-3 border border-emerald-100"><div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1"><Users size={12} /><span className="text-[10px] font-bold">{t("table.employeesCount")}</span></div><p className="font-black text-gray-900 text-sm">{modal.payroll.employee_count} موظف</p></div>
                      <div className="bg-white rounded-xl p-3 border border-emerald-100"><div className="flex items-center justify-center gap-1.5 text-amber-600 mb-1"><DollarSign size={12} /><span className="text-[10px] font-bold">{t("table.totalSalaries")}</span></div><p className="font-black text-gray-900 text-sm">{Number(modal.payroll.total_amount || 0).toLocaleString(locale)} {t("stats.sar")}</p></div>
                    </div>
                  </motion.div>
                  <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-700/50">
                    <CheckCircle2 size={24} />{t("notifications.ok")}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Delete Error */}
            {modal.type === 'delete-error' && (
              <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20">
                <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12 }} className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <AlertCircle size={48} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black relative z-10">فشل في الحذف</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">{modal.errorMessage}</p>
                </div>
                <div className="p-8">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50">
                    {t("notifications.ok")}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-[97%] mx-auto space-y-6">

        {/* ─── Header Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 p-8 text-white shadow-2xl border border-slate-500/30"
        >
          {/* Top colour bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 via-emerald-500 to-blue-500 animate-gradient-x" />

          {/* Decorative circles – hidden in dark mode */}
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 -translate-x-1/2 -translate-y-1/2 dark:hidden" />
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 translate-x-1/2 -translate-y-1/2 dark:hidden" />
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 -translate-x-1/3 translate-y-1/3 dark:hidden" />
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 translate-x-1/3 translate-y-1/3 dark:hidden" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                <FileText size={28} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  {t("title")}
                </h1>
                <p className="text-slate-400 font-medium text-sm">{t("description")}</p>
              </div>
            </div>

            {/* Mini stats inside header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5 text-center">
                <div className="text-lg font-black text-white">{stats.total}</div>
                <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">{t("stats.total")}</div>
              </div>
              <div className="bg-emerald-500/10 backdrop-blur-md rounded-xl p-3 border border-emerald-500/20 text-center">
                <div className="text-lg font-black text-emerald-400">{Number(stats.total_amount).toLocaleString(locale)}</div>
                <div className="text-[9px] text-emerald-200/60 font-bold uppercase tracking-wider">{t("stats.sar")}</div>
              </div>
              <div className="bg-blue-500/10 backdrop-blur-md rounded-xl p-3 border border-blue-500/20 text-center">
                <div className="text-lg font-black text-blue-400">{stats.confirmed_count}</div>
                <div className="text-[9px] text-blue-200/60 font-bold uppercase tracking-wider">{t("stats.confirmed")}</div>
              </div>
              <div className="bg-amber-500/10 backdrop-blur-md rounded-xl p-3 border border-amber-500/20 text-center">
                <div className="text-lg font-black text-amber-400">{stats.draft_count}</div>
                <div className="text-[9px] text-amber-200/60 font-bold uppercase tracking-wider">{t("stats.draft")}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Stats Cards ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {/* Total payrolls */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 shadow-xl shadow-blue-500/20 text-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t("stats.total")}</p>
                <p className="text-4xl font-black text-white mt-1">{stats.total}</p>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
                <FileText size={20} className="text-white" />
              </div>
            </div>
          </div>

          {/* Total amount */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-xl shadow-emerald-500/20 text-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t("stats.sar")}</p>
                <p className="text-2xl font-black text-white mt-1">{Number(stats.total_amount).toLocaleString(locale)}</p>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
                <DollarSign size={20} className="text-white" />
              </div>
            </div>
          </div>

          {/* Confirmed */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 shadow-xl shadow-amber-500/20 text-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t("stats.confirmed")}</p>
                <p className="text-4xl font-black text-white mt-1">{stats.confirmed_count}</p>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
                <CheckCircle size={20} className="text-white" />
              </div>
            </div>
          </div>

          {/* Draft */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 shadow-xl shadow-rose-500/20 text-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">{t("stats.draft")}</p>
                <p className="text-4xl font-black text-white mt-1">{stats.draft_count}</p>
              </div>
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
                <Clock size={20} className="text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Main Content Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50/80 via-purple-50/50 to-indigo-50/80 border-2 border-violet-200/60 shadow-sm dark:bg-white/95 dark:border dark:border-white/50 dark:rounded-[2rem] dark:shadow-xl"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 -translate-x-1/2 -translate-y-1/2 dark:hidden" />
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 translate-x-1/3 translate-y-1/3 dark:hidden" />

          <div className="relative z-10 p-6">
            {/* Search & create row */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative w-full md:w-96">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRtl ? "right-4" : "left-4")} size={18} />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "w-full py-3 rounded-xl border-2 border-violet-200 bg-white text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold transition-all shadow-sm",
                    isRtl ? "pr-12 pl-4" : "pl-12 pr-4"
                  )}
                />
              </div>
              <Link href="/salary-payrolls/new">
                <button
                  className="flex items-center gap-3 px-8 py-3 rounded-2xl font-black text-sm shadow-2xl shadow-blue-500/40 active:scale-95 transition-all"
                  style={{ background: "linear-gradient(to right, #2563eb, #4f46e5)", color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                >
                  <Plus size={18} />
                  <span>{t("createNew")}</span>
                </button>
              </Link>
            </div>

            {/* Table section header */}
            <div className="bg-gradient-to-r from-violet-100 via-purple-100 to-indigo-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl px-5 py-3 mb-4 flex justify-between items-center border border-violet-200/60">
              <div className="flex items-center gap-3">
                <div className="bg-violet-200/50 border border-violet-300/50 rounded-2xl p-2">
                  <FileText size={16} className="text-violet-700" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-sm">{t("table.title")}</h3>
              </div>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                {t("table.count", { count: filteredPayrolls.length })}
              </span>
            </div>

            {/* Table */}
            {filteredPayrolls.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border-2 border-violet-200/60 bg-white shadow-sm">
                <table className={cn("w-full", isRtl ? "text-right" : "text-left")}>
                  <thead>
                    <tr className="bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-b-2 border-violet-200/60">
                      <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase tracking-wider">{t("table.no")}</th>
                      <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase tracking-wider">{t("table.payrollMonth")}</th>
                      <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase tracking-wider">{t("table.package")}</th>
                      <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase tracking-wider">{t("table.employeesCount")}</th>
                      <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase tracking-wider">{t("table.totalSalaries")}</th>
                      <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase tracking-wider">{t("table.status")}</th>
                      <th className="px-4 py-3 text-xs font-black text-slate-700 uppercase tracking-wider text-center">{t("table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-violet-100">
                    {filteredPayrolls.map((payroll, idx) => (
                      <tr key={payroll.id} className={cn("transition-colors hover:bg-violet-50/60", idx % 2 === 0 ? "bg-white" : "bg-violet-50/20")}>
                        <td className="px-4 py-3 text-sm font-bold text-slate-500">{payroll.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                              <Calendar size={14} />
                            </div>
                            <span className="font-black text-slate-900 text-sm">{payroll.payroll_month}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-black text-slate-900 text-sm">{payroll.package_name || t("table.notSpecified")}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit font-bold ${getWorkTypeBadge(payroll.work_type)}`}>
                              {getWorkTypeLabel(payroll.work_type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Users size={14} className="text-slate-400" />
                            <span className="font-black text-slate-900">{payroll.employee_count}</span>
                            <span className="text-slate-400 text-xs font-bold">{t("table.employee")}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm font-black text-emerald-600">
                            <DollarSign size={14} />
                            {Number(payroll.total_amount || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}
                            <span className="text-xs text-slate-400 font-bold">{t("stats.sar")}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {payroll.is_draft ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black border border-amber-200">
                              <Clock size={10} />{t("statuses.draft")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black border border-emerald-200">
                              <CheckCircle size={10} />{t("statuses.confirmed")}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2 flex-wrap">
                            <Link href={`/salary-payrolls/${payroll.id}`}>
                              <button
                                className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap text-[11px] font-black transition-all hover:opacity-80"
                                style={{ backgroundColor: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }}
                                title={t("actions.view")}
                              >
                                <Eye size={12} /><span>{t("actions.view")}</span>
                              </button>
                            </Link>
                            <Link href={`/salary-payrolls/${payroll.id}/edit`}>
                              <button
                                className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap text-[11px] font-black transition-all hover:opacity-80"
                                style={{ backgroundColor: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }}
                                title={t("actions.edit")}
                              >
                                <Edit size={12} /><span>{t("actions.edit")}</span>
                              </button>
                            </Link>
                            <button
                              onClick={() => openDeleteConfirm(payroll)}
                              className="h-7 px-2.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap text-[11px] font-black transition-all hover:opacity-80"
                              style={{ backgroundColor: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}
                              title={t("actions.delete")}
                            >
                              <Trash2 size={12} /><span>{t("actions.delete")}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center bg-white rounded-2xl border-2 border-violet-200/60">
                <FileText size={48} className="mx-auto text-violet-300 mb-4" />
                <h4 className="text-lg font-black text-slate-900 mb-2">{t("noPayrolls.title")}</h4>
                <p className="text-slate-500 font-bold text-sm mb-4">{t("noPayrolls.desc")}</p>
                <Link href="/salary-payrolls/new">
                  <button
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-sm shadow-2xl shadow-blue-500/40 active:scale-95 transition-all"
                    style={{ background: "linear-gradient(to right, #2563eb, #4f46e5)", color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                  >
                    <Plus size={16} /><span>{t("createNew")}</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[11px] font-black text-slate-400 uppercase tracking-widest pb-2">
          SALARY PAYROLLS — LOGISTICS SYSTEM PRO
        </p>
      </div>
    </div>
  );
}
