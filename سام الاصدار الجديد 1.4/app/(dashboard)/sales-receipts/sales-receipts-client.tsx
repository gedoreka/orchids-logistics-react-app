"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt, 
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Calendar,
  Link as LinkIcon,
  Unlink,
  FileSpreadsheet,
  Loader2,
  User,
  TrendingUp,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Mail,
  Printer
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { DeleteNotification, useDeleteNotification } from "@/components/ui/delete-notification";

interface SalesReceipt {
  id: number;
  receipt_number: string;
  client_name: string;
  invoice_id: number | null;
  invoice_number: string | null;
  receipt_date: string;
  amount: number;
  notes: string;
  created_by: string;
}

interface SalesReceiptsClientProps {
  receipts: SalesReceipt[];
  stats: {
    total: number;
    total_amount: number;
    linked: number;
    unlinked: number;
  };
  companyId: number;
}

export function SalesReceiptsClient({ receipts: initialReceipts, stats, companyId }: SalesReceiptsClientProps) {
  const t = useTranslations("financialVouchersPage.salesReceiptsPage");
  const tCommon = useTranslations("common");
  const { locale } = useLocale();
  const isRtl = locale === "ar";
  
  const [receipts, setReceipts] = useState(initialReceipts);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const { notification, showDeleteConfirm, showLoading, showSuccess, showError, hideNotification } = useDeleteNotification("teal");
  const router = useRouter();

  const filteredReceipts = receipts.filter(r => {
    const search = searchTerm.toLowerCase();
    return (
      r.receipt_number?.toLowerCase().includes(search) ||
      r.client_name?.toLowerCase().includes(search) ||
      r.invoice_number?.toLowerCase().includes(search)
    );
  });

  const handleDelete = (id: number, receiptNumber: string) => {
    showDeleteConfirm(
      isRtl ? "تأكيد حذف سند المبيعات" : "Confirm Delete Sales Receipt",
      isRtl 
        ? `هل أنت متأكد من حذف سند المبيعات رقم "${receiptNumber}"؟\nلا يمكن التراجع عن هذا الإجراء.`
        : `Are you sure you want to delete sales receipt "${receiptNumber}"?\nThis action cannot be undone.`,
      () => confirmDelete(id),
      id,
      receiptNumber
    );
  };

  const confirmDelete = async (id: number) => {
    setDeleteLoading(id);
    hideNotification();
    showLoading(
      isRtl ? "جاري الحذف" : "Deleting",
      isRtl ? "جاري حذف سند المبيعات..." : "Deleting sales receipt..."
    );
    
    try {
      const res = await fetch(`/api/sales-receipts/${id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setReceipts(prev => prev.filter(r => r.id !== id));
        showSuccess(
          isRtl ? "تم الحذف بنجاح" : "Deleted Successfully",
          isRtl ? "تم حذف سند المبيعات بنجاح" : "Sales receipt deleted successfully"
        );
        router.refresh();
      } else {
        showError(
          isRtl ? "فشل الحذف" : "Delete Failed",
          isRtl ? "فشل حذف سند المبيعات" : "Failed to delete sales receipt"
        );
      }
    } catch {
      showError(
        isRtl ? "خطأ" : "Error",
        isRtl ? "حدث خطأ أثناء الحذف" : "An error occurred during deletion"
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-8 space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      <DeleteNotification 
        notification={notification} 
        onClose={hideNotification}
        cancelLabel={tCommon("cancel")}
        deleteLabel={tCommon("delete")}
        okLabel={tCommon("ok")}
        isRtl={isRtl}
      />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-emerald-500 via-cyan-500 via-blue-500 to-teal-500 animate-gradient-x" />
        
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className={cn("text-center space-y-4", isRtl ? "lg:text-right" : "lg:text-left")}>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-teal-200 font-black text-[10px] uppercase tracking-widest">{t("subtitle")}</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight bg-gradient-to-r from-white via-teal-100 to-white bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
                {t("description")}
              </p>
              
              <div className={cn("flex flex-wrap justify-center gap-4 mt-8", isRtl ? "lg:justify-start" : "lg:justify-start")}>
                <Link href="/sales-receipts/new">
                  <button className="flex items-center gap-3 px-6 py-3 bg-teal-500 text-white font-black text-sm rounded-2xl hover:bg-teal-600 transition-all shadow-xl active:scale-95">
                    <Plus size={18} />
                    {t("addNew")}
                  </button>
                </Link>
                <button 
                    onClick={() => router.refresh()}
                    className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95"
                  >
                  <RefreshCw size={18} className="text-teal-400" />
                  {t("refreshData")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-teal-500/20 rounded-lg text-teal-400 group-hover:scale-110 transition-transform">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <span className="text-teal-300 font-black text-[10px] uppercase tracking-wider">{t("totalReceipts")}</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{stats.total}</p>
                <p className="text-teal-400/60 text-[10px] font-black mt-1">{t("receiptsCount")}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-emerald-300 font-black text-[10px] uppercase tracking-wider">{t("totalAmount")}</span>
                </div>
                <p className="text-2xl font-black text-white tracking-tight">{Number(stats.total_amount).toLocaleString(locale)}</p>
                <p className="text-emerald-400/60 text-[10px] font-black mt-1">{isRtl ? "ريال سعودي" : "SAR"}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <span className="text-purple-300 font-black text-[10px] uppercase tracking-wider">{t("linked")}</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{stats.linked}</p>
                <p className="text-purple-400/60 text-[10px] font-black mt-1">{t("linkedCount")}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                    <Unlink className="w-5 h-5" />
                  </div>
                  <span className="text-amber-300 font-black text-[10px] uppercase tracking-wider">{t("unlinked")}</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{stats.unlinked}</p>
                <p className="text-amber-400/60 text-[10px] font-black mt-1">{t("unlinkedCount")}</p>
              </motion.div>
            </div>
          </div>

          <div className="border-t border-white/10" />

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRtl ? "right-4" : "left-4")} size={20} />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "w-full py-3 bg-white/10 border border-white/10 rounded-2xl text-white font-medium focus:bg-white/20 focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-500",
                  isRtl ? "pr-12 pl-4" : "pl-12 pr-4"
                )}
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-teal-500/20 text-teal-300 font-bold rounded-2xl border border-teal-500/30 hover:bg-teal-500/30 transition-all">
                <FileSpreadsheet size={18} />
                {t("exportData")}
              </button>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-500/20 rounded-xl">
                  <Receipt className="w-5 h-5 text-teal-400" />
                </div>
                <h3 className="font-black text-lg">{t("tableTitle")}</h3>
              </div>
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                {t("receiptsFound", { count: filteredReceipts.length })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className={cn("w-full", isRtl ? "text-right" : "text-left")}>
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("receiptNo")}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("customer")}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("date")}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("amount")}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t("status")}</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredReceipts.length > 0 ? (
                    filteredReceipts.map((receipt, idx) => (
                      <motion.tr 
                        key={receipt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * idx }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <span className="px-3 py-1.5 bg-teal-500/10 text-teal-400 rounded-lg text-xs font-black border border-teal-500/20">
                            {receipt.receipt_number}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-teal-500/20 group-hover:text-teal-400 transition-all">
                              <User size={16} />
                            </div>
                            <span className="font-bold text-sm text-slate-200">{receipt.client_name || (isRtl ? "غير محدد" : "Not Specified")}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                            <Calendar size={14} className="text-slate-500" />
                            {receipt.receipt_date ? format(new Date(receipt.receipt_date), 'yyyy/MM/dd') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-baseline gap-1 text-emerald-400">
                            <span className="text-lg font-black">{Number(receipt.amount || 0).toLocaleString(locale)}</span>
                            <span className="text-[10px] font-bold text-emerald-400/50 uppercase">{isRtl ? "ر.س" : "SAR"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          {receipt.invoice_number ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20">
                              <LinkIcon size={12} />
                              {t("linkedToInvoice", { number: receipt.invoice_number })}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black rounded-full border border-amber-500/20">
                              <Unlink size={12} />
                              {t("notLinked")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/sales-receipts/${receipt.id}`}>
                              <button className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95" title={t("viewDetails")}>
                                <Eye size={16} />
                              </button>
                            </Link>
                            <Link href={`/sales-receipts/${receipt.id}/edit`}>
                              <button className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95" title={isRtl ? "تعديل" : "Edit"}>
                                <Edit size={16} />
                              </button>
                            </Link>
                            <Link href={`/sales-receipts/${receipt.id}?action=email`}>
                              <button className="h-9 w-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center hover:bg-teal-500 hover:text-white transition-all shadow-lg active:scale-95" title={isRtl ? "إرسال بريد" : "Send Email"}>
                                <Mail size={16} />
                              </button>
                            </Link>
                            <Link href={`/sales-receipts/${receipt.id}?action=print`}>
                              <button className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all shadow-lg active:scale-95" title={isRtl ? "طباعة" : "Print"}>
                                <Printer size={16} />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(receipt.id, receipt.receipt_number)}
                              disabled={deleteLoading === receipt.id}
                              className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                              title={t("deleteReceipt")}
                            >
                              {deleteLoading === receipt.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <Receipt size={64} className="text-slate-400" />
                          <div className="space-y-1">
                            <p className="text-xl font-black text-slate-300">{t("noReceipts")}</p>
                            <p className="text-sm font-medium text-slate-500">{t("noReceiptsDesc")}</p>
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

        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>

      <div className={cn(
        "flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-4 opacity-60",
        isRtl ? "md:flex-row" : "md:flex-row-reverse"
      )}>
        <div className="flex items-center gap-2">
          <Sparkles size={10} className="text-teal-500" />
          <span>{t("systemFooter")}</span>
        </div>
        <span>{t("allRightsReserved", { year: new Date().getFullYear() })}</span>
      </div>
    </div>
  );
}
