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
  Layers
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
                {/* Header */}
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
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <AlertTriangle size={48} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black tracking-tight relative z-10"
                  >
                    {t("notifications.deleteConfirm")}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80 font-bold mt-2 relative z-10"
                  >
                    {t("notifications.deleteQuestion")}
                  </motion.p>
                </div>

                {/* Content */}
                <div className="p-8 text-center space-y-6" dir="rtl">
                  <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 border-2 border-red-100 dark:border-red-900/50">
                    <p className="text-slate-700 dark:text-slate-300 font-bold text-lg leading-relaxed">
                      {t("notifications.deleteWarning")}
                    </p>
                    <p className="text-red-600 dark:text-red-400 font-black text-xl mt-2 truncate">
                      &quot;{modal.payroll.payroll_month}&quot;
                    </p>
                  </div>

                  {/* Payroll details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                        <Users size={14} />
                        <span className="text-xs font-bold">{t("table.employeesCount")}</span>
                      </div>
                      <p className="text-lg font-black text-gray-900">{modal.payroll.employee_count}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                        <DollarSign size={14} />
                        <span className="text-xs font-bold">{t("table.totalSalaries")}</span>
                      </div>
                      <p className="text-lg font-black text-gray-900">{Number(modal.payroll.total_amount || 0).toLocaleString(locale)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1">
                        <Layers size={14} />
                        <span className="text-xs font-bold">{t("table.package")}</span>
                      </div>
                      <p className="text-sm font-black text-gray-900 truncate">{modal.payroll.package_name}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-amber-600 mb-1">
                        <Calendar size={14} />
                        <span className="text-xs font-bold">{t("table.payrollMonth")}</span>
                      </div>
                      <p className="text-sm font-black text-gray-900">{modal.payroll.payroll_month}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-800 text-xs font-bold text-center">
                      {t("notifications.deleteNote")}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={closeModal}
                      className="flex-1 flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X size={20} />
                      {tCommon("cancel")}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDelete}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50"
                    >
                      <Trash2 size={20} />
                      {t("notifications.confirmBtn")}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Deleting - Loading */}
            {modal.type === 'deleting' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20"
              >
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-10 text-white text-center overflow-hidden">
                  <motion.div
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
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
                    <p className="text-blue-700 font-bold text-center mt-3 text-sm">
                      جاري إزالة السجلات المالية المرتبطة...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Delete Success */}
            {modal.type === 'delete-success' && modal.payroll && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden border-4 border-emerald-500/20"
              >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-10 text-white text-center overflow-hidden">
                  {/* Animated particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ 
                          y: -100, 
                          opacity: [0, 1, 0],
                          x: Math.random() * 100 - 50
                        }}
                        transition={{ 
                          delay: i * 0.2, 
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                        className="absolute"
                        style={{ left: `${15 + i * 15}%` }}
                      >
                        <Sparkles size={20} className="text-white/40" />
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", damping: 12 }}
                    className="relative z-10 mx-auto w-28 h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <CheckCircle2 size={56} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-black tracking-tight relative z-10"
                  >
                    {t("notifications.deleteSuccess")}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/80 font-bold mt-2 relative z-10"
                  >
                    {t("notifications.deleteSuccessMsg")}
                  </motion.p>
                </div>

                {/* Content */}
                <div className="p-8 text-center space-y-6" dir="rtl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-6 border-2 border-emerald-100 dark:border-emerald-900/50"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                          <Calendar size={12} />
                          <span className="text-[10px] font-bold">شهر المسير</span>
                        </div>
                        <p className="font-black text-gray-900 text-sm">{modal.payroll.payroll_month}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                          <Layers size={12} />
                          <span className="text-[10px] font-bold">{t("table.package")}</span>
                        </div>
                        <p className="font-black text-gray-900 text-sm truncate">{modal.payroll.package_name}</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                          <Users size={12} />
                          <span className="text-[10px] font-bold">{t("table.employeesCount")}</span>
                        </div>
                        <p className="font-black text-gray-900 text-sm">{modal.payroll.employee_count} موظف</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-emerald-100">
                        <div className="flex items-center justify-center gap-1.5 text-amber-600 mb-1">
                          <DollarSign size={12} />
                          <span className="text-[10px] font-bold">{t("table.totalSalaries")}</span>
                        </div>
                        <p className="font-black text-gray-900 text-sm">{Number(modal.payroll.total_amount || 0).toLocaleString(locale)} {t("stats.sar")}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-700/50"
                  >
                    <CheckCircle2 size={24} />
                    {t("notifications.ok")}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Delete Error */}
            {modal.type === 'delete-error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
              >
                <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    <AlertCircle size={48} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black relative z-10">فشل في الحذف</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">{modal.errorMessage}</p>
                </div>
                <div className="p-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={closeModal}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50"
                  >
                    {t("notifications.ok")}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-[97%] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-8 text-white shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                  <FileText size={28} className="text-amber-400" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">{t("title")}</h1>
                  <p className="text-slate-400 font-medium text-sm">{t("description")}</p>
                </div>
              </div>
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
          
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="relative w-full md:w-96">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRtl ? "right-4" : "left-4")} size={18} />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn(
                    "w-full py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold transition-all",
                    isRtl ? "pr-12 pl-4" : "pl-12 pr-4"
                  )}
                />
              </div>
              <Link href="/salary-payrolls/new">
                <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                  <Plus size={18} />
                  <span>{t("createNew")}</span>
                </button>
              </Link>
            </div>

            <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FileText size={16} className="text-blue-400" />
                  </div>
                  <h3 className="font-black text-white text-sm">{t("table.title")}</h3>
                </div>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-[10px] font-black border border-blue-500/30">
                  {t("table.count", { count: filteredPayrolls.length })}
                </span>
              </div>

              {filteredPayrolls.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className={cn("w-full", isRtl ? "text-right" : "text-left")}>
                    <thead className="bg-white/5">
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-xs font-bold text-slate-400">{t("table.no")}</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-400">{t("table.payrollMonth")}</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-400">{t("table.package")}</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-400">{t("table.employeesCount")}</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-400">{t("table.totalSalaries")}</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-400">{t("table.status")}</th>
                        <th className="px-4 py-3 text-xs font-bold text-slate-400 text-center">{t("table.actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredPayrolls.map((payroll) => (
                        <tr key={payroll.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-400">{payroll.id}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Calendar size={14} />
                              </div>
                              <span className="font-bold text-white text-sm">{payroll.payroll_month}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-white text-sm">{payroll.package_name || t("table.notSpecified")}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${getWorkTypeBadge(payroll.work_type)}`}>
                                {getWorkTypeLabel(payroll.work_type)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm">
                              <Users size={14} className="text-slate-400" />
                              <span className="font-bold text-white">{payroll.employee_count}</span>
                              <span className="text-slate-400 text-xs">{t("table.employee")}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                              <DollarSign size={14} />
                              {Number(payroll.total_amount || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}
                              <span className="text-xs text-slate-400">{t("stats.sar")}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {payroll.is_draft ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                                <Clock size={10} />
                                {t("statuses.draft")}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                                <CheckCircle size={10} />
                                {t("statuses.confirmed")}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <Link href={`/salary-payrolls/${payroll.id}`}>
                                <button className="h-7 px-2.5 rounded-lg bg-blue-500/10 text-blue-400 flex items-center gap-1.5 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/30 whitespace-nowrap" title={t("actions.view")}>
                                  <Eye size={12} />
                                  <span className="text-[11px] font-black">{t("actions.view")}</span>
                                </button>
                              </Link>
                              <Link href={`/salary-payrolls/${payroll.id}/edit`}>
                                <button className="h-7 px-2.5 rounded-lg bg-amber-500/10 text-amber-400 flex items-center gap-1.5 hover:bg-amber-500 hover:text-white transition-all border border-amber-500/30 whitespace-nowrap" title={t("actions.edit")}>
                                  <Edit size={12} />
                                  <span className="text-[11px] font-black">{t("actions.edit")}</span>
                                </button>
                              </Link>
                              <button 
                                onClick={() => openDeleteConfirm(payroll)}
                                className="h-7 px-2.5 rounded-lg bg-red-500/10 text-red-400 flex items-center gap-1.5 hover:bg-red-500 hover:text-white transition-all border border-red-500/30 whitespace-nowrap"
                                title={t("actions.delete")}
                              >
                                <Trash2 size={12} />
                                <span className="text-[11px] font-black">{t("actions.delete")}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center">
                  <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2">{t("noPayrolls.title")}</h4>
                  <p className="text-slate-400 text-sm mb-4">{t("noPayrolls.desc")}</p>
                  <Link href="/salary-payrolls/new">
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">
                      <Plus size={16} />
                      <span>{t("createNew")}</span>
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </div>
  );
}
