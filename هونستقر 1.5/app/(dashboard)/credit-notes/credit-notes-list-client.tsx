"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  FileText, 
  Eye, 
  FileDown, 
  XCircle,
  TrendingDown,
  Percent,
  History,
  LayoutDashboard,
  ArrowRight,
  BadgeCheck,
  Sparkles,
  Filter,
  Download,
  ReceiptText,
  CheckCircle2,
  Ban,
  ShieldAlert,
  X,
  CheckCircle
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { useTheme } from "next-themes";

interface CreditNote {
  id: number;
  credit_note_number: string;
  invoice_number: string;
  client_name: string;
  reason: string;
  total_amount: string | number;
  vat_amount: string | number;
  created_at: string;
  status: 'active' | 'cancelled';
  invoice_status: string;
}

interface CreditNotesListClientProps {
  creditNotes: CreditNote[];
}

export function CreditNotesListClient({ creditNotes: initialNotes }: CreditNotesListClientProps) {
  const t = useTranslations('creditNotes');
    const { locale } = useLocale();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const [creditNotes, setCreditNotes] = useState(initialNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [premiumModal, setPremiumModal] = useState<{
    show: boolean;
    noteNumber?: string;
    invoiceNumber?: string;
  }>({ show: false });

  const filteredNotes = creditNotes.filter(note => 
    note.credit_note_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeNotes = creditNotes.filter(n => n.status === 'active');
  const totalAmount = activeNotes.reduce((sum, n) => sum + parseFloat(String(n.total_amount)), 0);
  const totalVat = activeNotes.reduce((sum, n) => sum + parseFloat(String(n.vat_amount)), 0);

  const handleCancel = (id: number, noteNumber: string, invoiceNumber: string) => {
    setPremiumModal({ show: true, noteNumber, invoiceNumber });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const dateLocale = locale === 'ar' ? ar : enUS;

    return (
    <div className="min-h-screen pb-20 bg-transparent">
      {/* Premium Modal - Cannot Delete Credit Note */}
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
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 border border-amber-500/30 shadow-2xl shadow-amber-500/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
                
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
                    className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/30 border border-white/10"
                  >
                    <ShieldAlert size={40} className="text-white" />
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white">لا يمكن حذف إشعار الدائن</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {premiumModal.noteNumber && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10">
                          <ReceiptText size={14} className="text-amber-400" />
                          <span className="text-sm font-bold text-amber-300">{premiumModal.noteNumber}</span>
                        </div>
                      )}
                      {premiumModal.invoiceNumber && (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10">
                          <FileText size={14} className="text-rose-400" />
                          <span className="text-sm font-bold text-rose-300">{premiumModal.invoiceNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3 text-right">
                    <p className="text-sm text-amber-200 font-bold leading-relaxed">
                      إشعار الدائن مرتبط بفاتورة ضريبية ولا يمكن حذفه أو إلغاؤه لأنه مسجل في النظام المحاسبي.
                    </p>
                    <div className="h-px bg-white/10" />
                    <p className="text-sm text-emerald-300 font-bold leading-relaxed flex items-start gap-2">
                      <CheckCircle size={16} className="mt-0.5 shrink-0 text-emerald-400" />
                      <span>يمكنك استرداد المبلغ عبر إصدار <strong className="text-white">فاتورة مرتجع جديدة</strong> إذا لزم الأمر.</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setPremiumModal({ show: false })}
                    className="w-full px-5 py-3 rounded-2xl bg-white/10 text-white font-black text-sm border border-white/10 hover:bg-white/20 transition-all active:scale-95"
                  >
                    فهمت
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[98%] mx-auto px-4 pt-6"
      >
          {/* Unified Professional Card */}
          <div className={cn(
            "rounded-3xl shadow-2xl overflow-hidden flex flex-col",
            isDark 
              ? "bg-slate-900 border border-white/5" 
              : "bg-[#edd3de] border border-rose-200/60"
          )}>
            
              {/* Luxury Integrated Header */}
              <div className={cn(
                "p-8 space-y-8 border-b",
                isDark 
                  ? "bg-slate-900 border-white/5" 
                  : "bg-gradient-to-br from-[#edd3de] via-[#f0d5e0] to-[#f5e0ea] border-rose-200/40"
              )}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30 border border-white/10">
                    <ReceiptText className="text-white" size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      <Link href="/dashboard" className="hover:text-rose-400 transition-colors flex items-center gap-1">
                        <LayoutDashboard size={12} />
                        {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                      </Link>
                      <ArrowRight size={10} className={cn(locale === 'ar' && "rotate-180")} />
                      <span className="text-rose-500">{t('breadcrumb')}</span>
                    </div>
                      <h1 className={cn(
                        "text-2xl font-black tracking-tight",
                        isDark ? "text-white" : "bg-gradient-to-r from-pink-600 via-rose-500 to-orange-500 bg-clip-text text-transparent"
                      )}>{t('title')}</h1>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                    <span className="text-xs font-black text-rose-400 tracking-wide uppercase">{t('zatcaCompliant')}</span>
                  </div>
                  <Link href="/credit-notes/new">
                    <motion.button
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 transition-all font-black text-sm shadow-xl shadow-rose-500/25"
                    >
                      <Plus size={20} />
                      {t('createNew')}
                    </motion.button>
                  </Link>
                </div>
              </div>

            {/* Statistics Integrated Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              <motion.div variants={itemVariants} className="relative group">
                <div className="h-full rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-6 shadow-lg shadow-rose-500/20 transition-all group-hover:shadow-rose-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-white/15 rounded-xl text-white backdrop-blur-md">
                      <TrendingDown size={20} />
                    </div>
                    <span className="text-[10px] font-black text-white/90 bg-white/10 px-3 py-1 rounded-full border border-white/10">{activeNotes.length} {t('activeReturns')}</span>
                  </div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{t('totalReturns')}</p>
                  <p className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1">
                    {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-xs text-white/60 font-bold">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                  </p>
                  <p className="text-white/50 text-[10px] font-bold mt-2 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    {t('refundedAmounts')}
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="relative group">
                <div className="h-full rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 shadow-lg shadow-amber-500/20 transition-all group-hover:shadow-amber-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-white/15 rounded-xl text-white backdrop-blur-md">
                      <Percent size={20} />
                    </div>
                    <span className="text-[10px] font-black text-white/90 bg-white/10 px-3 py-1 rounded-full border border-white/10">15%</span>
                  </div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{t('refundedTax')}</p>
                  <p className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1">
                    {totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-xs text-white/60 font-bold">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                  </p>
                  <p className="text-white/50 text-[10px] font-bold mt-2 flex items-center gap-1">
                    <BadgeCheck size={12} />
                    {t('new.vatRefund')}
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="relative group">
                <div className="h-full rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 shadow-lg shadow-violet-500/20 transition-all group-hover:shadow-violet-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-white/15 rounded-xl text-white backdrop-blur-md">
                      <History size={20} />
                    </div>
                    <span className="text-[10px] font-black text-white/90 bg-white/10 px-3 py-1 rounded-full border border-white/10">#{creditNotes.length}</span>
                  </div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{t('totalNotes')}</p>
                  <p className="text-2xl font-black text-white mt-1.5">{creditNotes.length}</p>
                  <p className="text-white/50 text-[10px] font-bold mt-2 flex items-center gap-1">
                    <Ban size={12} />
                    {creditNotes.length - activeNotes.length} {t('cancelledNotes')}
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="relative group">
                <div className="h-full rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-lg shadow-emerald-500/20 transition-all group-hover:shadow-emerald-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-white/15 rounded-xl text-white backdrop-blur-md">
                      <BadgeCheck size={20} />
                    </div>
                  </div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{t('taxStatus')}</p>
                  <p className="text-2xl font-black text-white mt-1.5">{t('compliant')}</p>
                  <p className="text-white/50 text-[10px] font-bold mt-2 flex items-center gap-1">
                    <Sparkles size={12} />
                    {t('zatcaSystem')}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Table Area Integrated into the Card */}
          <div className="p-0">
            {/* Table Control Bar */}
              <div className={cn(
                "px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6",
                isDark ? "bg-slate-900" : "bg-[#f5e0ea]/80"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center border",
                    isDark ? "bg-white/10 border-white/10" : "bg-gradient-to-br from-rose-500 to-pink-600 border-rose-300/30"
                  )}>
                    <FileText className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className={cn("font-black tracking-tight", isDark ? "text-white" : "text-slate-800")}>{t('listTitle')}</h3>
                    <p className={cn("text-xs font-bold tracking-wide uppercase", isDark ? "text-slate-400" : "text-slate-500")}>{filteredNotes.length} {t('notesInList')}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1 lg:max-w-3xl">
                <div className="relative flex-1">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:bg-white/10 transition-all border-dashed"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 text-white transition-all font-black text-xs border border-white/10"
                  >
                    <Filter size={16} />
                    {locale === 'ar' ? 'تصفية' : 'Filter'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 text-white transition-all font-black text-xs border border-white/10"
                  >
                    <Download size={16} />
                    {locale === 'ar' ? 'تصدير' : 'Export'}
                  </motion.button>
                </div>
              </div>
            </div>

              {/* Table */}
              <div className={cn("overflow-x-auto", isDark ? "bg-slate-900/50" : "bg-white/40")}>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className={cn(
                        "border-b",
                        isDark 
                          ? "bg-white/5 border-white/5" 
                          : "bg-gradient-to-r from-[#f5e0ea] via-[#f0d5e0] to-[#edd3de] border-rose-200/40"
                      )}>
                        <th className={cn("px-8 py-5 text-[11px] font-black uppercase tracking-widest text-right", isDark ? "text-slate-400" : "text-slate-600")}>{t('noteNumber')}</th>
                        <th className={cn("px-8 py-5 text-[11px] font-black uppercase tracking-widest text-right", isDark ? "text-slate-400" : "text-slate-600")}>{t('invoice')}</th>
                        <th className={cn("px-8 py-5 text-[11px] font-black uppercase tracking-widest text-right", isDark ? "text-slate-400" : "text-slate-600")}>{t('client')}</th>
                        <th className={cn("px-8 py-5 text-[11px] font-black uppercase tracking-widest text-right", isDark ? "text-slate-400" : "text-slate-600")}>{t('reason')}</th>
                        <th className={cn("px-8 py-5 text-[11px] font-black uppercase tracking-widest text-center", isDark ? "text-slate-400" : "text-slate-600")}>{t('amount')}</th>
                        <th className={cn("px-8 py-5 text-[11px] font-black uppercase tracking-widest text-center", isDark ? "text-slate-400" : "text-slate-600")}>{t('date')}</th>
                        <th className={cn("px-8 py-5 text-[11px] font-black uppercase tracking-widest text-center", isDark ? "text-slate-400" : "text-slate-600")}>{t('status')}</th>
                        <th className={cn("px-8 py-5 text-[11px] font-black uppercase tracking-widest text-center", isDark ? "text-slate-400" : "text-slate-600")}>{t('actions')}</th>
                      </tr>
                  </thead>
                    <tbody className={cn("divide-y", isDark ? "divide-white/5" : "divide-rose-100/60")}>
                    <AnimatePresence>
                      {filteredNotes.map((note, index) => (
                        <motion.tr
                          key={note.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: 0.03 * index }}
                          className={cn(
                            "transition-all group border-l-4 border-l-transparent hover:border-l-rose-500",
                            isDark ? "hover:bg-white/5" : "hover:bg-white/60"
                          )}
                        >
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-rose-500/20">
                                <ReceiptText size={16} className="text-rose-400" />
                              </div>
                                <span className={cn("font-black text-sm tracking-tight", isDark ? "text-white" : "text-slate-800")}>{note.credit_note_number}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className={cn("font-bold text-sm", isDark ? "text-slate-200" : "text-slate-700")}>{note.invoice_number}</span>
                              <span className={cn("text-[10px] font-black uppercase tracking-wide", isDark ? "text-slate-500" : "text-slate-400")}>{note.invoice_status}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <span className={cn("font-bold text-sm", isDark ? "text-slate-200" : "text-slate-700")}>{note.client_name}</span>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap">
                            <span className="text-slate-400 text-xs truncate max-w-[180px] block font-medium" title={note.reason}>
                              {note.reason}
                            </span>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-black text-rose-400 text-sm">
                                {parseFloat(String(note.total_amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })} {locale === 'ar' ? 'ريال' : 'SAR'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter opacity-70">{t('includingTax')}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-center">
                            <span className="text-slate-400 font-bold text-xs bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                              {note.created_at ? format(new Date(note.created_at), 'yyyy-MM-dd', { locale: dateLocale }) : '-'}
                            </span>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-center">
                            <StatusBadge status={note.status} t={t} />
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Link href={`/credit-notes/${note.id}`}>
                                  <motion.button 
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={cn(
                                      "h-9 w-9 flex items-center justify-center rounded-xl transition-all border",
                                      isDark 
                                        ? "text-blue-400 hover:bg-blue-500/10 border-transparent hover:border-blue-500/20" 
                                        : "text-blue-600 bg-blue-50 border-blue-200/60 hover:bg-blue-100"
                                    )}
                                    title={t('viewDetails')}
                                  >
                                    <Eye size={16} />
                                  </motion.button>
                                </Link>
                                <motion.button 
                                  whileHover={{ scale: 1.15, rotate: -5 }}
                                  whileTap={{ scale: 0.9 }}
                                  className={cn(
                                    "h-9 w-9 flex items-center justify-center rounded-xl transition-all border",
                                    isDark 
                                      ? "text-amber-400 hover:bg-amber-500/10 border-transparent hover:border-amber-500/20" 
                                      : "text-amber-600 bg-amber-50 border-amber-200/60 hover:bg-amber-100"
                                  )}
                                  title={t('downloadPdf')}
                                >
                                  <FileDown size={16} />
                                </motion.button>
                                {note.status === 'active' && (
                                    <motion.button 
                                      whileHover={{ scale: 1.15, rotate: 10 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleCancel(note.id, note.credit_note_number, note.invoice_number)}
                                      className={cn(
                                        "h-9 w-9 flex items-center justify-center rounded-xl transition-all border",
                                        isDark 
                                          ? "text-rose-400 hover:bg-rose-500/10 border-transparent hover:border-rose-500/20" 
                                          : "text-rose-600 bg-rose-50 border-rose-200/60 hover:bg-rose-100"
                                      )}
                                      title={t('cancelNote')}
                                    >
                                    <XCircle size={16} />
                                  </motion.button>
                                )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {filteredNotes.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-8 py-24 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-24 w-24 rounded-3xl bg-white/5 flex items-center justify-center border-2 border-dashed border-white/10">
                              <FileText size={48} className="text-slate-700" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-400 font-black text-base">{t('noData')}</p>
                              <p className="text-slate-500 text-sm font-bold">{t('noDataSub')}</p>
                            </div>
                            <Link href="/credit-notes/new">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-4 flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/5 text-rose-400 hover:bg-white/10 transition-all font-black text-sm border border-white/10"
                              >
                                <Plus size={18} />
                                {t('new.breadcrumb')}
                              </motion.button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
  
              {/* Table Footer */}
              <div className={cn(
                "px-8 py-5 border-t",
                isDark ? "bg-slate-900 border-white/5" : "bg-[#f5e0ea]/60 border-rose-200/40"
              )}>
                <div className="flex items-center justify-between text-xs font-black text-slate-500 uppercase tracking-widest">
                  <span className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 shadow-sm">{t('totalItems')}: {filteredNotes.length}</span>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      {activeNotes.length} {t('active')}
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 shadow-sm">
                      <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                      {creditNotes.length - activeNotes.length} {t('cancelled')}
                    </span>
                  </div>
                </div>
              </div>

          </div>
        </div>

        {/* Footer Branding */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pt-8 opacity-70">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-lg bg-gray-200 flex items-center justify-center">
              <Sparkles size={12} className="text-rose-500" />
            </div>
            <span>{t('systemName')}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-1 w-1 rounded-full bg-gray-300"></div>
            <span>{t('allRightsReserved')} © {new Date().getFullYear()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatusBadge({ status, t }: { status: 'active' | 'cancelled', t: any }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-2xl text-[10px] font-black border border-emerald-200/50 shadow-sm ring-1 ring-emerald-500/10">
        <CheckCircle2 size={12} />
        {t('active')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black border border-gray-200 shadow-sm ring-1 ring-gray-400/10">
      <Ban size={12} />
      {t('cancelled')}
    </span>
  );
}
