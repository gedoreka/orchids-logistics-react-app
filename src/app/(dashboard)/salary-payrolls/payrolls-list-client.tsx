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
  ShieldAlert
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

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

interface DeleteConfirmState {
  show: boolean;
  payrollId: number | null;
  payrollMonth: string;
  employeeCount: number;
  totalAmount: number;
}

export function PayrollsListClient({ payrolls: initialPayrolls, stats, companyId }: PayrollsListClientProps) {
  const t = useTranslations("financialVouchersPage.salaryPayrollsPage");
  const tCommon = useTranslations("common");
  const { locale } = useLocale();
  const isRtl = locale === "ar";

  const [payrolls, setPayrolls] = useState(initialPayrolls);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    show: false,
    payrollId: null,
    payrollMonth: "",
    employeeCount: 0,
    totalAmount: 0
  });
  const router = useRouter();

  const filteredPayrolls = payrolls.filter(p => {
    const search = searchTerm.toLowerCase();
    return (
      p.payroll_month?.toLowerCase().includes(search) ||
      p.package_name?.toLowerCase().includes(search) ||
      p.saved_by?.toLowerCase().includes(search)
    );
  });

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    if (type !== "loading") {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
    }
  };

  const openDeleteConfirm = (payroll: Payroll) => {
    setDeleteConfirm({
      show: true,
      payrollId: payroll.id,
      payrollMonth: payroll.payroll_month,
      employeeCount: payroll.employee_count,
      totalAmount: payroll.total_amount
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({
      show: false,
      payrollId: null,
      payrollMonth: "",
      employeeCount: 0,
      totalAmount: 0
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm.payrollId) return;
    
    const id = deleteConfirm.payrollId;
    const payrollMonth = deleteConfirm.payrollMonth;
    setDeleteLoading(id);
    closeDeleteConfirm();
    showNotification("loading", t("notifications.deleting"), t("notifications.deletingMsg", { month: payrollMonth }));
    
    try {
      const res = await fetch(`/api/payrolls/${id}`, { method: "DELETE" });
      
      if (res.ok) {
        setPayrolls(prev => prev.filter(p => p.id !== id));
        showNotification("success", t("notifications.deleteSuccess"), t("notifications.deleteSuccessMsg", { month: payrollMonth }));
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        showNotification("error", t("notifications.deleteFailed"), data.error || t("notifications.deleteFailedMsg"));
      }
    } catch {
      showNotification("error", t("notifications.error"), t("notifications.errorMsg"));
    } finally {
      setDeleteLoading(null);
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
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => notification.type !== "loading" && setNotification(prev => ({ ...prev, show: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className={`bg-white rounded-3xl p-8 shadow-2xl border-t-4 ${
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-red-500" : "border-blue-500"
              }`}>
                <div className="text-center">
                  <div className={`h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    notification.type === "success" ? "bg-emerald-100 text-emerald-500" :
                    notification.type === "error" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
                  }`}>
                    {notification.type === "success" && <CheckCircle size={40} />}
                    {notification.type === "error" && <AlertCircle size={40} />}
                    {notification.type === "loading" && <Loader2 size={40} className="animate-spin" />}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{notification.title}</h3>
                  <p className="text-gray-500 mb-6">{notification.message}</p>
                  {notification.type !== "loading" && (
                    <button
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {tCommon("ok")}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirm.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={closeDeleteConfirm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <ShieldAlert size={32} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{t("notifications.deleteConfirm")}</h2>
                      <p className="text-white/70 text-sm">{t("notifications.deleteQuestion")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={24} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-red-900 text-sm">{t("notifications.deleteWarning")}</p>
                        <p className="text-red-700 font-black text-lg mt-1">{deleteConfirm.payrollMonth}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                        <Users size={14} />
                        <span className="text-xs font-bold">{t("table.employeesCount")}</span>
                      </div>
                      <p className="text-lg font-black text-gray-900">{deleteConfirm.employeeCount}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                        <DollarSign size={14} />
                        <span className="text-xs font-bold">{t("table.totalSalaries")}</span>
                      </div>
                      <p className="text-lg font-black text-gray-900">{Number(deleteConfirm.totalAmount || 0).toLocaleString(locale)}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-amber-800 text-xs font-bold text-center">
                      {t("notifications.deleteNote")}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={closeDeleteConfirm}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all"
                    >
                      <X size={16} />
                      <span>{tCommon("cancel")}</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25"
                    >
                      <Trash2 size={16} />
                      <span>{t("notifications.confirmBtn")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto">
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
                                disabled={deleteLoading === payroll.id}
                                className="h-7 px-2.5 rounded-lg bg-red-500/10 text-red-400 flex items-center gap-1.5 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 border border-red-500/30 whitespace-nowrap"
                                title={t("actions.delete")}
                              >
                                {deleteLoading === payroll.id ? (
                                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 size={12} />
                                    <span className="text-[11px] font-black">{t("actions.delete")}</span>
                                  </>
                                )}
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
