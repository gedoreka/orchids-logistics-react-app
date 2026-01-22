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
  Ban
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "@/lib/locale-context";

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
  const [creditNotes, setCreditNotes] = useState(initialNotes);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotes = creditNotes.filter(note => 
    note.credit_note_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeNotes = creditNotes.filter(n => n.status === 'active');
  const totalAmount = activeNotes.reduce((sum, n) => sum + parseFloat(String(n.total_amount)), 0);
  const totalVat = activeNotes.reduce((sum, n) => sum + parseFloat(String(n.vat_amount)), 0);

  const handleCancel = async (id: number) => {
    if (!confirm(t('new.confirmCancel'))) return;

    try {
      const res = await fetch(`/api/credit-notes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success(t('new.cancelSuccess'));
        setCreditNotes(prev => prev.map(n => n.id === id ? { ...n, status: 'cancelled' } : n));
      } else {
        toast.error(data.error || t('new.cancelError'));
      }
    } catch (err) {
      toast.error(t('new.connectionError'));
    }
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
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[98%] mx-auto px-4 pt-6"
      >
        {/* Unified Professional Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden flex flex-col">
          
          {/* Luxury Integrated Header */}
          <div className="p-8 space-y-8 bg-gradient-to-b from-gray-50/50 to-white border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                  <ReceiptText className="text-white" size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    <Link href="/dashboard" className="hover:text-rose-600 transition-colors flex items-center gap-1">
                      <LayoutDashboard size={12} />
                      {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
                    </Link>
                    <ArrowRight size={10} className={cn(locale === 'ar' && "rotate-180")} />
                    <span className="text-rose-600">{t('breadcrumb')}</span>
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('title')}</h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-rose-50 border border-rose-100 rounded-2xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                  <span className="text-xs font-black text-rose-700 tracking-wide uppercase">{t('zatcaCompliant')}</span>
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
                    {totalAmount.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2 })}
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
                    {totalVat.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2 })}
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
            <div className="bg-slate-900 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-black tracking-tight">{t('listTitle')}</h3>
                  <p className="text-slate-400 text-xs font-bold tracking-wide uppercase">{filteredNotes.length} {t('notesInList')}</p>
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
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-right">{t('noteNumber')}</th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-right">{t('invoice')}</th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-right">{t('client')}</th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-right">{t('reason')}</th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">{t('amount')}</th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">{t('date')}</th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">{t('status')}</th>
                    <th className="px-8 py-5 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <AnimatePresence>
                    {filteredNotes.map((note, index) => (
                      <motion.tr
                        key={note.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: 0.03 * index }}
                        className="hover:bg-rose-50/40 transition-all group border-l-4 border-l-transparent hover:border-l-rose-500"
                      >
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                              <ReceiptText size={16} className="text-rose-600" />
                            </div>
                            <span className="font-black text-gray-900 text-sm tracking-tight">{note.credit_note_number}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-700 text-sm">{note.invoice_number}</span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-wide">{note.invoice_status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className="font-bold text-gray-700 text-sm">{note.client_name}</span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span className="text-gray-500 text-xs truncate max-w-[180px] block font-medium" title={note.reason}>
                            {note.reason}
                          </span>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-black text-rose-600 text-sm">
                              {parseFloat(String(note.total_amount)).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2 })} {locale === 'ar' ? 'ريال' : 'SAR'}
                            </span>
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter opacity-70">{t('includingTax')}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap text-center">
                          <span className="text-gray-500 font-bold text-xs bg-gray-100 px-3 py-1.5 rounded-full">
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
                                className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100" 
                                title={t('viewDetails')}
                              >
                                <Eye size={18} />
                              </motion.button>
                            </Link>
                            <motion.button 
                              whileHover={{ scale: 1.15, rotate: -5 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2.5 text-amber-500 hover:bg-amber-50 rounded-xl transition-all border border-transparent hover:border-amber-100" 
                              title={t('downloadPdf')}
                            >
                              <FileDown size={18} />
                            </motion.button>
                            {note.status === 'active' && (
                              <motion.button 
                                whileHover={{ scale: 1.15, rotate: 10 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleCancel(note.id)}
                                className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100" 
                                title={t('cancelNote')}
                              >
                                <XCircle size={18} />
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
                          <div className="h-24 w-24 rounded-3xl bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                            <FileText size={48} className="text-gray-200" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-500 font-black text-base">{t('noData')}</p>
                            <p className="text-gray-400 text-sm font-bold">{t('noDataSub')}</p>
                          </div>
                          <Link href="/credit-notes/new">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="mt-4 flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all font-black text-sm border border-rose-200"
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
            <div className="bg-gray-50/50 px-8 py-5 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs font-black text-gray-500 uppercase tracking-widest">
                <span className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">{t('totalItems')}: {filteredNotes.length}</span>
                <div className="flex items-center gap-6">
                  <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    {activeNotes.length} {t('active')}
                  </span>
                  <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
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
