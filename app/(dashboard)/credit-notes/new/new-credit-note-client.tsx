"use client";

import React, { useState, useMemo } from "react";
import { 
  ArrowRight, 
  Save, 
  RotateCcw, 
  FileText, 
  User, 
  Hash, 
  Coins, 
  Calculator,
  Percent,
  MessageSquare,
  LayoutDashboard,
  ReceiptText,
  AlertTriangle,
  BadgeCheck,
  Sparkles,
  CircleDollarSign,
  Building2,
  ChevronDown,
  Loader2,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Receipt,
  TrendingDown,
  ChevronLeft,
  FileCheck,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { formatEnglishNumber } from "@/lib/number-utils";

interface Invoice {
  id: number;
  invoice_number: string;
  total_amount: string | number;
  client_name: string;
  client_vat: string;
  status: string;
  total_issued: string | number;
}

interface NewCreditNoteClientProps {
  invoices: Invoice[];
}

export function NewCreditNoteClient({ invoices }: NewCreditNoteClientProps) {
  const t = useTranslations('creditNotes');
  const { locale } = useLocale();
  const router = useRouter();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Premium Modal States
    const [confirmModal, setConfirmModal] = useState(false);
    const [savingModal, setSavingModal] = useState<{
      isOpen: boolean;
      status: 'saving' | 'success' | 'error';
      creditNoteId?: number;
      message?: string;
    }>({ isOpen: false, status: 'saving' });

    const selectedInvoice = invoices.find(inv => inv.id === parseInt(selectedInvoiceId));
    const availableAmount = selectedInvoice 
      ? parseFloat(String(selectedInvoice.total_amount)) - parseFloat(String(selectedInvoice.total_issued))
      : 0;

    const calculations = useMemo(() => {
      const total = parseFloat(amount) || 0;
      const vatAmount = total * 0.15 / 1.15;
      const beforeVat = total - vatAmount;
      return { vatAmount, beforeVat, total };
    }, [amount]);

    // Open confirm modal
    const handleSaveClick = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedInvoiceId || !reason || !amount) {
        toast.error(t('new.fillingRequired'));
        return;
      }
      if (parseFloat(amount) > availableAmount) {
        toast.error(`${t('new.amountExceedsLimit')} (${availableAmount.toFixed(2)} ${locale === 'ar' ? 'ريال' : 'SAR'})`);
        return;
      }
      setConfirmModal(true);
    };

    // Execute save after confirmation
    const confirmSave = async () => {
      setConfirmModal(false);
      setSavingModal({ isOpen: true, status: 'saving' });
      setLoading(true);

      try {
        const res = await fetch("/api/credit-notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoice_id: parseInt(selectedInvoiceId),
            reason,
            total_with_vat: parseFloat(amount)
          })
        });

        const data = await res.json();
        if (data.success) {
          setSavingModal({ 
            isOpen: true, 
            status: 'success',
            creditNoteId: data.credit_note_id || data.id,
            message: data.message || t('new.saveSuccess')
          });
        } else {
          setSavingModal({ 
            isOpen: true, 
            status: 'error',
            message: data.error || t('new.saveError')
          });
        }
      } catch (err) {
        setSavingModal({ 
          isOpen: true, 
          status: 'error',
          message: t('new.connectionError')
        });
      } finally {
        setLoading(false);
      }
    };

    // Go to credit notes list
    const goToCreditNotes = () => {
      router.push("/credit-notes");
      router.refresh();
      setSavingModal({ isOpen: false, status: 'saving' });
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

    return (
      <div className="min-h-screen pb-20 bg-transparent">
        {/* Confirm Save Modal */}
        <AnimatePresence>
          {confirmModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmModal(false)}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(244,63,94,0.3)] overflow-hidden border-4 border-rose-500/20"
              >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 p-10 text-white text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
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
                      <FileCheck size={48} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-black tracking-tight relative z-10"
                  >
                    تأكيد حفظ الإشعار
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/80 font-bold mt-2 relative z-10"
                  >
                    سيتم إصدار إشعار دائن ضريبي رسمياً
                  </motion.p>
                </div>

                {/* Content */}
                <div className="p-8 text-center space-y-6">
                  <div className="bg-rose-50 dark:bg-rose-950/30 rounded-2xl p-6 border-2 border-rose-100 dark:border-rose-900/50">
                    <p className="text-slate-700 dark:text-slate-300 font-bold text-lg leading-relaxed">
                      هل أنت متأكد من حفظ الإشعار؟
                    </p>
                    <p className="text-rose-600 dark:text-rose-400 font-black text-xl mt-2">
                      مرجع الفاتورة: {selectedInvoice?.invoice_number || '---'}
                    </p>
                    <div className="mt-4 pt-4 border-t border-rose-200 dark:border-rose-800 flex justify-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-slate-400 font-bold">المبلغ الإجمالي</p>
                        <p className="text-lg font-black text-rose-600">{calculations.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} {locale === 'ar' ? 'ريال' : 'SAR'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400 font-bold">الضريبة</p>
                        <p className="text-lg font-black text-amber-600">{calculations.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {locale === 'ar' ? 'ريال' : 'SAR'}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-500 font-bold text-sm">
                    سيتم إصدار الإشعار وخصمه من الفاتورة المرتبطة
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setConfirmModal(false)}
                      className="flex-1 flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X size={20} />
                      إلغاء
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(244, 63, 94, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={confirmSave}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-rose-500/30 disabled:opacity-50 border-b-4 border-rose-700/50"
                    >
                      {loading ? (
                        <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save size={20} />
                          نعم، احفظ
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Saving/Success/Error Modal */}
        <AnimatePresence>
          {savingModal.isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={cn(
                  "relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border-4",
                  savingModal.status === 'saving' 
                    ? "border-blue-500/20 shadow-[0_0_100px_rgba(59,130,246,0.3)]"
                    : savingModal.status === 'success'
                    ? "border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.3)]"
                    : "border-red-500/20 shadow-[0_0_100px_rgba(239,68,68,0.3)]"
                )}
              >
                {/* Header */}
                <div className={cn(
                  "relative p-10 text-white text-center overflow-hidden",
                  savingModal.status === 'saving'
                    ? "bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700"
                    : savingModal.status === 'success'
                    ? "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700"
                    : "bg-gradient-to-br from-red-500 via-rose-600 to-red-700"
                )}>
                  {/* Animated particles for success */}
                  {savingModal.status === 'success' && (
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
                  )}

                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", damping: 12 }}
                    className="relative z-10 mx-auto w-28 h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    {savingModal.status === 'saving' ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 size={56} className="text-white drop-shadow-lg" />
                      </motion.div>
                    ) : savingModal.status === 'success' ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <CheckCircle2 size={56} className="text-white drop-shadow-lg" />
                      </motion.div>
                    ) : (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <AlertTriangle size={56} className="text-white drop-shadow-lg" />
                      </motion.div>
                    )}
                  </motion.div>
                  
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-black tracking-tight relative z-10"
                  >
                    {savingModal.status === 'saving' 
                      ? 'جاري حفظ الإشعار...'
                      : savingModal.status === 'success'
                      ? 'تم حفظ الإشعار بنجاح!'
                      : 'حدث خطأ'}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/80 font-bold mt-2 relative z-10"
                  >
                    {savingModal.status === 'saving' 
                      ? 'يرجى الانتظار...'
                      : savingModal.status === 'success'
                      ? 'تم إضافة الإشعار إلى النظام'
                      : 'تعذر إكمال العملية'}
                  </motion.p>
                </div>

                {/* Content */}
                <div className="p-8 text-center space-y-6">
                  {savingModal.status === 'saving' ? (
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-6 border-2 border-blue-100 dark:border-blue-900/50">
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-3 w-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <p className="text-slate-500 font-bold text-sm mt-4">جاري معالجة البيانات وحفظها في قاعدة البيانات</p>
                    </div>
                  ) : savingModal.status === 'success' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-6 border-2 border-emerald-100 dark:border-emerald-900/50"
                    >
                      <p className="text-slate-500 font-bold text-sm mb-2">مرجع الفاتورة:</p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-black text-xl">
                        {selectedInvoice?.invoice_number || '---'}
                      </p>
                      <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800">
                        <p className="text-rose-600 font-black text-2xl">
                          {calculations.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} {locale === 'ar' ? 'ريال' : 'SAR'}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 border-2 border-red-100 dark:border-red-900/50"
                    >
                      <p className="text-red-600 dark:text-red-400 font-black text-lg">
                        {savingModal.message}
                      </p>
                    </motion.div>
                  )}

                  {savingModal.status !== 'saving' && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={savingModal.status === 'success' ? goToCreditNotes : () => setSavingModal({ isOpen: false, status: 'saving' })}
                      className={cn(
                        "w-full flex items-center justify-center gap-3 text-white py-5 rounded-2xl font-black text-xl shadow-xl border-b-4",
                        savingModal.status === 'success'
                          ? "bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 shadow-emerald-500/30 border-emerald-700/50"
                          : "bg-gradient-to-r from-slate-600 via-slate-700 to-slate-600 shadow-slate-500/30 border-slate-800/50"
                      )}
                    >
                      {savingModal.status === 'success' ? (
                        <>
                          <ArrowRight size={24} className="rtl:rotate-180" />
                          عرض الإشعارات
                        </>
                      ) : (
                        <>
                          <X size={24} />
                          إغلاق
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[98%] mx-auto px-4 pt-6"
      >
        {/* Unified Professional Card */}
        <div className="bg-slate-900 rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">
          
          {/* Luxury Integrated Header */}
          <div className="p-8 space-y-8 bg-slate-900 border-b border-white/5">
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
                    <Link href="/credit-notes" className="hover:text-rose-400 transition-colors">
                      {t('breadcrumb')}
                    </Link>
                    <ArrowRight size={10} className={cn(locale === 'ar' && "rotate-180")} />
                    <span className="text-rose-500">{t('new.breadcrumb')}</span>
                  </div>
                  <h1 className="text-2xl font-black text-white tracking-tight">{t('new.title')}</h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                  <span className="text-xs font-black text-rose-400 tracking-wide uppercase">{t('zatcaCompliant')}</span>
                </div>
                <Link href="/credit-notes">
                  <motion.button
                    whileHover={{ scale: 1.02, translateX: locale === 'ar' ? 2 : -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-all font-black text-xs border border-white/10"
                  >
                    {locale === 'ar' ? <ArrowRight size={16} /> : <ChevronLeft size={16} />}
                    {locale === 'ar' ? 'العودة للسجل' : 'Back to Log'}
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Statistics Integrated Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              <motion.div variants={itemVariants} className="relative group">
                <div className="h-full rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 p-6 shadow-lg shadow-slate-500/20 transition-all group-hover:shadow-slate-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-white/15 rounded-xl text-white backdrop-blur-md">
                      <Hash size={20} />
                    </div>
                    <span className="text-[10px] font-black text-white/90 bg-white/10 px-3 py-1 rounded-full border border-white/10">{locale === 'ar' ? 'جديد' : 'New'}</span>
                  </div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{t('new.linkedInvoice')}</p>
                  <p className="text-lg font-black text-white mt-1.5 truncate">
                    {selectedInvoice?.invoice_number || '---'}
                  </p>
                  <p className="text-white/50 text-[10px] font-bold mt-2 flex items-center gap-1">
                    <Sparkles size={12} />
                    {locale === 'ar' ? 'مرتجع ضريبي' : 'Tax Return'}
                  </p>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="relative group">
                <div className="h-full rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-6 shadow-lg shadow-rose-500/20 transition-all group-hover:shadow-rose-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-white/15 rounded-xl text-white backdrop-blur-md">
                      <TrendingDown size={20} />
                    </div>
                  </div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{t('new.amountBeforeTax')}</p>
                    <p className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1 font-latin">
                      {formatEnglishNumber(calculations.beforeVat)}
                      <span className="text-xs text-white/60 font-bold">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                    </p>
                    <p className="text-white/50 text-[10px] font-bold mt-2 flex items-center gap-1">
                      <BadgeCheck size={12} />
                      {t('new.netAmount')}
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
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{t('new.refundedVat')}</p>
                    <p className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1 font-latin">
                      {formatEnglishNumber(calculations.vatAmount)}
                      <span className="text-xs text-white/60 font-bold">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                    </p>
                    <p className="text-white/50 text-[10px] font-bold mt-2 flex items-center gap-1">
                      <CheckCircle size={12} />
                      {t('new.vatRefund')}
                    </p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="relative group">
                  <div className="h-full rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-lg shadow-emerald-500/20 transition-all group-hover:shadow-emerald-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 bg-white/15 rounded-xl text-white backdrop-blur-md">
                        <CircleDollarSign size={20} />
                      </div>
                    </div>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{t('new.totalIncludingVat')}</p>
                    <p className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1 font-latin">
                      {formatEnglishNumber(calculations.total)}
                      <span className="text-xs text-white/60 font-bold">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                    </p>
                  <p className="text-white/50 text-[10px] font-bold mt-2 flex items-center gap-1">
                    <Sparkles size={12} />
                    {t('new.includingVat')}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Form Area Integrated into the Card */}
          <div className="p-8 bg-slate-900/50">
              <form onSubmit={handleSaveClick} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  variants={itemVariants}
                  className="bg-white/5 rounded-2xl border border-white/5 shadow-xl overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <FileText className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-black">{t('new.invoiceDetails')}</h3>
                        <p className="text-blue-100 text-xs font-bold opacity-80">{t('new.selectInvoiceSub')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2.5">
                        <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 px-1">
                          <Hash size={14} className="text-blue-500" />
                          {t('new.selectInvoice')}
                        </label>
                        <div className="relative group">
                          <Receipt className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <select
                            className="w-full h-14 pr-12 pl-4 rounded-2xl bg-white/5 border-2 border-transparent text-sm font-black text-white focus:border-blue-500/30 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer shadow-sm hover:bg-white/10"
                            value={selectedInvoiceId}
                            onChange={(e) => setSelectedInvoiceId(e.target.value)}
                            required
                          >
                            <option value="" className="bg-slate-900">{t('new.selectFromList')}</option>
                            {invoices.map(inv => (
                              <option key={inv.id} value={inv.id.toString()} className="bg-slate-900 text-white">
                                {inv.invoice_number} - {inv.client_name} ({parseFloat(String(inv.total_amount)).toLocaleString()} {locale === 'ar' ? 'ريال' : 'SAR'})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 px-1">
                          <User size={14} className="text-blue-500" />
                          {t('new.clientName')}
                        </label>
                        <div className="relative">
                          <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                          <input
                            type="text"
                            className="w-full h-14 pr-12 pl-4 rounded-2xl bg-white/5 border-2 border-transparent text-sm font-black text-slate-400 cursor-not-allowed shadow-inner"
                            value={selectedInvoice?.client_name || t('new.autoSelected')}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedInvoice && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10 shadow-sm"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t('new.invoiceTotal')}</span>
                              <span className="text-sm font-black text-white">
                                {parseFloat(String(selectedInvoice.total_amount)).toLocaleString()} {locale === 'ar' ? 'ريال' : 'SAR'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t('new.previousReturn')}</span>
                              <span className="text-sm font-black text-rose-400">
                                {parseFloat(String(selectedInvoice.total_issued)).toLocaleString()} {locale === 'ar' ? 'ريال' : 'SAR'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t('new.availableForReturn')}</span>
                              <span className="text-sm font-black text-emerald-400">
                                {availableAmount.toLocaleString()} {locale === 'ar' ? 'ريال' : 'SAR'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t('new.vatNumber')}</span>
                              <span className="text-sm font-black text-white">
                                {selectedInvoice.client_vat || t('new.notAvailable')}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2.5">
                      <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 px-1">
                        <MessageSquare size={14} className="text-blue-500" />
                        {t('new.reasonLabel')}
                      </label>
                      <textarea
                        className="w-full px-6 py-5 rounded-2xl bg-white/5 border-2 border-transparent text-sm font-black text-white focus:border-blue-500/30 focus:bg-white/10 outline-none transition-all min-h-[140px] resize-none shadow-sm hover:bg-white/10 placeholder:text-slate-600"
                        placeholder={t('new.reasonPlaceholder')}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-white/5 rounded-2xl border border-white/5 shadow-xl overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Calculator className="text-white" size={20} />
                      </div>
                      <div>
                        <h3 className="text-white font-black">{t('new.amountsAndTax')}</h3>
                        <p className="text-amber-100 text-xs font-bold opacity-80">{t('new.enterAmount')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2.5">
                        <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 px-1">
                          <Coins size={14} className="text-rose-500" />
                          {t('new.amountLabel')}
                        </label>
                        <div className="relative group">
                          <input
                            type="number"
                            step="0.01"
                            className="w-full h-14 px-6 rounded-2xl bg-rose-500/5 border-2 border-rose-500/20 text-sm font-black focus:border-rose-400 focus:bg-white/10 outline-none transition-all text-rose-400 shadow-sm"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            max={availableAmount}
                            required
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-rose-400 uppercase">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                        </div>
                        {selectedInvoiceId && (
                          <div className="flex items-center gap-1.5 px-1">
                            <AlertCircle size={10} className="text-rose-400" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                              {t('new.maxLimit')}: <span className="text-rose-400 font-black">{availableAmount.toLocaleString()} {locale === 'ar' ? 'ريال' : 'SAR'}</span>
                            </p>
                          </div>
                        )}
                      </div>

                        <div className="space-y-2.5">
                          <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 px-1">
                            <Calculator size={14} className="text-slate-400" />
                            {t('new.amountBeforeTax')}
                          </label>
                          <div className="w-full h-14 px-6 rounded-2xl bg-white/5 border-2 border-white/5 flex items-center justify-between shadow-inner">
                            <span className="text-sm font-black text-slate-200 font-latin">
                              {formatEnglishNumber(calculations.beforeVat)}
                            </span>
                            <span className="text-[10px] font-black text-slate-500 uppercase">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 px-1">
                            <Percent size={14} className="text-amber-500" />
                            {t('new.vatValue')}
                          </label>
                          <div className="w-full h-14 px-6 rounded-2xl bg-amber-500/5 border-2 border-amber-500/10 flex items-center justify-between shadow-inner">
                            <span className="text-sm font-black text-amber-400 font-latin">
                              {formatEnglishNumber(calculations.vatAmount)}
                            </span>
                            <span className="text-[10px] font-black text-amber-500 uppercase">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                          </div>
                        </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="space-y-8">
                <motion.div
                  variants={itemVariants}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden border border-white/5"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>

                  <div className="flex items-center gap-4 mb-8 relative z-10">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                      <Calculator className="text-rose-400" size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-lg tracking-tight">{t('new.summaryTitle')}</h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-70">{t('new.autoCalc')}</p>
                    </div>
                  </div>

                    <div className="space-y-4 mb-8 relative z-10">
                      <div className="flex justify-between items-center p-5 bg-white/5 rounded-2xl border border-white/5 transition-colors hover:bg-white/10 group">
                        <div className="flex items-center gap-3">
                          <Receipt size={18} className="text-slate-500 group-hover:text-rose-400 transition-colors" />
                          <span className="text-slate-400 font-black text-xs uppercase tracking-wider">{t('new.totalIncludingVat')}</span>
                        </div>
                        <span className="font-black text-white text-lg font-latin">
                          {formatEnglishNumber(calculations.total)}
                          <span className="text-slate-500 mr-2 text-[10px] uppercase tracking-tighter">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20 transition-colors hover:bg-rose-500/20 group">
                        <div className="flex items-center gap-3">
                          <TrendingDown size={18} className="text-rose-400" />
                          <span className="text-rose-200/70 font-black text-xs uppercase tracking-wider">{t('new.netRefund')}</span>
                        </div>
                        <span className="font-black text-rose-400 text-lg font-latin">
                          {formatEnglishNumber(calculations.beforeVat)}
                          <span className="text-rose-300/50 mr-2 text-[10px] uppercase tracking-tighter">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-5 bg-amber-500/10 rounded-2xl border border-amber-500/20 transition-colors hover:bg-amber-500/20 group">
                        <div className="flex items-center gap-3">
                          <Percent size={18} className="text-amber-400" />
                          <span className="text-amber-200/70 font-black text-xs uppercase tracking-wider">{t('new.totalVat')}</span>
                        </div>
                        <span className="font-black text-amber-400 text-lg font-latin">
                          {formatEnglishNumber(calculations.vatAmount)}
                          <span className="text-amber-300/50 mr-2 text-[10px] uppercase tracking-tighter">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8 relative z-10" />

                    <div className="p-6 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30 relative z-10 shadow-lg shadow-emerald-900/20 group">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CircleDollarSign size={20} className="text-emerald-400" />
                          </div>
                          <span className="text-emerald-200 font-black text-xs uppercase tracking-widest">{t('new.totalDiscount')}</span>
                        </div>
                        <div className="text-left">
                          <span className="text-3xl font-black text-emerald-400 tracking-tighter font-latin">
                            {formatEnglishNumber(calculations.total)}
                          </span>
                          <span className="mr-2 text-[10px] font-black text-emerald-300/50 uppercase tracking-tighter">{locale === 'ar' ? 'ريال' : 'SAR'}</span>
                        </div>
                      </div>
                    </div>

                  <div className="space-y-4 pt-8 relative z-10">
                    <motion.button
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className={cn(
                        "w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-sm transition-all shadow-xl shadow-rose-500/30",
                        loading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                      <span>{loading ? t('new.saving') : t('new.save')}</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setSelectedInvoiceId("");
                        setReason("");
                        setAmount("");
                      }}
                      className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-sm transition-all border border-white/10 backdrop-blur-sm"
                    >
                      <RotateCcw size={20} />
                      <span>{t('new.reset')}</span>
                    </motion.button>
                  </div>

                  <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10 relative z-10">
                    <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                      <BadgeCheck size={14} className="text-emerald-400" />
                      <span>{t('new.taxNote')} - ZATCA</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="bg-amber-500/10 p-6 rounded-3xl border border-amber-500/20 shadow-sm relative group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AlertTriangle size={48} className="text-amber-400" />
                  </div>
                  <div className="flex gap-4 relative z-10">
                    <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400 shrink-0 h-fit shadow-sm">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-black text-amber-200 uppercase tracking-wide">{t('new.taxNote')}</p>
                      <p className="text-xs font-bold text-amber-400/70 leading-relaxed">
                        {t('new.taxNoteDesc')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </form>
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
