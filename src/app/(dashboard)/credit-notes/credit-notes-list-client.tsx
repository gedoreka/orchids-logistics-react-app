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
  AlertCircle,
  LayoutDashboard,
  ArrowRight,
  BadgeCheck,
  Sparkles,
  Filter,
  Download,
  ReceiptText,
  CircleDollarSign,
  CheckCircle2,
  Clock,
  Ban
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
    if (!confirm("هل أنت متأكد من إلغاء إشعار الدائن هذا؟")) return;

    try {
      const res = await fetch(`/api/credit-notes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success("تم إلغاء إشعار الدائن بنجاح");
        setCreditNotes(prev => prev.map(n => n.id === id ? { ...n, status: 'cancelled' } : n));
      } else {
        toast.error(data.error || "فشل إلغاء إشعار الدائن");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
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

  return (
    <div className="min-h-screen pb-20">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[95%] mx-auto px-4 pt-6 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <ReceiptText className="text-white" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <Link href="/dashboard" className="hover:text-rose-600 transition-colors flex items-center gap-1">
                  <LayoutDashboard size={12} />
                  لوحة التحكم
                </Link>
                <ArrowRight size={12} />
                <span className="text-rose-600">إشعارات الدائن الضريبية</span>
              </div>
              <h1 className="text-xl font-black text-gray-900">إشعارات الدائن الضريبية</h1>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              <span className="text-xs font-black text-rose-700">متوافق مع ZATCA</span>
            </div>
            <Link href="/credit-notes/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-700 hover:to-pink-700 transition-all font-black text-sm shadow-lg shadow-rose-500/30"
              >
                <Plus size={18} />
                إنشاء إشعار دائن جديد
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 shadow-lg shadow-rose-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><TrendingDown size={22} /></div>
                <span className="text-[10px] font-black text-white/70 bg-white/10 px-2 py-0.5 rounded-full">{activeNotes.length} نشط</span>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">إجمالي المرتجعات</p>
                <p className="text-2xl font-black text-white mt-1">
                  {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-sm text-white/70 mr-1">ريال</span>
                </p>
                <p className="text-white/60 text-[10px] font-bold mt-1">المبالغ المسترجعة</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 shadow-lg shadow-amber-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><Percent size={22} /></div>
                <span className="text-[10px] font-black text-white/90 bg-white/20 px-2 py-0.5 rounded-full">15%</span>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">الضريبة المسترجعة</p>
                <p className="text-2xl font-black text-white mt-1">
                  {totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-sm text-white/70 mr-1">ريال</span>
                </p>
                <p className="text-white/60 text-[10px] font-bold mt-1">VAT Refund</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-5 shadow-lg shadow-violet-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><History size={22} /></div>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">إجمالي الإشعارات</p>
                <p className="text-2xl font-black text-white mt-1">{creditNotes.length}</p>
                <p className="text-white/60 text-[10px] font-bold mt-1">{creditNotes.length - activeNotes.length} ملغاة</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-lg shadow-emerald-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><BadgeCheck size={22} /></div>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">الحالة الضريبية</p>
                <p className="text-2xl font-black text-white mt-1">متوافق</p>
                <p className="text-white/60 text-[10px] font-bold mt-1">نظام ZATCA</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <FileText className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black">سجل إشعارات الدائن</h3>
                  <p className="text-slate-400 text-xs font-bold">{filteredNotes.length} إشعار في القائمة</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1 sm:min-w-[300px]">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="البحث برقم الإشعار، العميل، أو الفاتورة..."
                    className="w-full pr-12 pl-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:bg-white/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-xs border border-white/10"
                  >
                    <Filter size={16} />
                    تصفية
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all font-bold text-xs border border-white/10"
                  >
                    <Download size={16} />
                    تصدير
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">رقم الإشعار</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">الفاتورة</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">العميل</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right">السبب</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">المبلغ</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">التاريخ</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">الحالة</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">الإجراءات</th>
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
                      className="hover:bg-rose-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center group-hover:from-rose-200 group-hover:to-pink-200 transition-colors">
                            <ReceiptText size={14} className="text-rose-600" />
                          </div>
                          <span className="font-black text-gray-900 text-sm">{note.credit_note_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-700 text-sm">{note.invoice_number}</span>
                          <span className="text-[10px] text-gray-400 font-black uppercase">{note.invoice_status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-700 text-sm">{note.client_name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-500 text-sm truncate max-w-[200px] block font-medium" title={note.reason}>
                          {note.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-rose-600 text-sm">
                            {parseFloat(String(note.total_amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold">شامل الضريبة</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-gray-500 font-bold text-xs">
                          {note.created_at ? format(new Date(note.created_at), 'yyyy-MM-dd', { locale: ar }) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <StatusBadge status={note.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/credit-notes/${note.id}`}>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                              title="عرض التفاصيل"
                            >
                              <Eye size={18} />
                            </motion.button>
                          </Link>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" 
                            title="تحميل PDF"
                          >
                            <FileDown size={18} />
                          </motion.button>
                          {note.status === 'active' && (
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleCancel(note.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                              title="إلغاء الإشعار"
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
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-20 w-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <FileText size={40} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-black text-sm">لا توجد إشعارات دائنة مطابقة للبحث</p>
                        <p className="text-gray-400 text-xs font-bold">جرب البحث بكلمات مختلفة أو قم بإنشاء إشعار جديد</p>
                        <Link href="/credit-notes/new">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all font-bold text-xs"
                          >
                            <Plus size={16} />
                            إنشاء إشعار جديد
                          </motion.button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span>إجمالي العناصر: {filteredNotes.length}</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  {activeNotes.length} نشط
                </span>
                <span className="flex items-center gap-1">
                  <Ban size={14} className="text-gray-400" />
                  {creditNotes.length - activeNotes.length} ملغي
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-rose-500" />
            <span>نظام إشعارات الدائن - ZoolSpeed Logistics</span>
          </div>
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
        </div>
      </motion.div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'cancelled' }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-xl text-[10px] font-black border border-emerald-200 shadow-sm">
        <CheckCircle2 size={12} />
        نشط
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black border border-gray-200">
      <Ban size={12} />
      ملغي
    </span>
  );
}
