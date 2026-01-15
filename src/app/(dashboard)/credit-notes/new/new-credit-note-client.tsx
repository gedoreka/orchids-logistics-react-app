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
  AlertCircle,
  Receipt,
  TrendingDown
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const router = useRouter();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "loading";
    title: string;
    message: string;
  }>({ show: false, type: "success", title: "", message: "" });

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

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || !reason || !amount) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (parseFloat(amount) > availableAmount) {
      toast.error(`المبلغ لا يمكن أن يتجاوز الحد المتاح (${availableAmount.toFixed(2)} ريال)`);
      return;
    }

    setLoading(true);
    showNotification("loading", "جاري الحفظ", "جاري إنشاء إشعار الدائن...");

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
        showNotification("success", "تم الحفظ", "تم إنشاء إشعار الدائن بنجاح");
        setTimeout(() => {
          router.push("/credit-notes");
          router.refresh();
        }, 1500);
      } else {
        showNotification("error", "خطأ", data.error || "فشل إنشاء إشعار الدائن");
      }
    } catch (err) {
      showNotification("error", "خطأ", "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
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
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl ${
              notification.type === "success" 
                ? "bg-gradient-to-r from-emerald-600 to-green-600" 
                : notification.type === "error" 
                ? "bg-gradient-to-r from-rose-600 to-red-600" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600"
            } text-white font-bold flex items-center gap-3 border border-white/20 backdrop-blur-md`}
          >
            {notification.type === "success" && <CheckCircle size={18} />}
            {notification.type === "error" && <AlertCircle size={18} />}
            {notification.type === "loading" && <Loader2 size={18} className="animate-spin" />}
            <div>
              <p className="font-black text-sm">{notification.title}</p>
              <p className="text-xs opacity-90">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[90%] mx-auto px-4 pt-6 space-y-6"
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
                <Link href="/credit-notes" className="hover:text-rose-600 transition-colors">
                  إشعارات الدائن
                </Link>
                <ArrowRight size={12} />
                <span className="text-rose-600">إنشاء إشعار جديد</span>
              </div>
              <h1 className="text-xl font-black text-gray-900">إنشاء إشعار دائن جديد</h1>
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
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 p-5 shadow-lg shadow-slate-500/20">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><Hash size={22} /></div>
                <span className="text-[10px] font-black text-white/70 bg-white/10 px-2 py-0.5 rounded-full">جديد</span>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">الفاتورة المرتبطة</p>
                <p className="text-lg font-black text-white mt-1 truncate">
                  {selectedInvoice?.invoice_number || '---'}
                </p>
                <p className="text-white/60 text-[10px] font-bold mt-1">مرتجع ضريبي</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 shadow-lg shadow-rose-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><TrendingDown size={22} /></div>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">المبلغ قبل الضريبة</p>
                <p className="text-2xl font-black text-white mt-1">
                  {calculations.beforeVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-sm text-white/70 mr-1">ريال</span>
                </p>
                <p className="text-white/60 text-[10px] font-bold mt-1">Net Amount</p>
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
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">ضريبة مسترجعة</p>
                <p className="text-2xl font-black text-white mt-1">
                  {calculations.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-sm text-white/70 mr-1">ريال</span>
                </p>
                <p className="text-white/60 text-[10px] font-bold mt-1">VAT Refund</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-lg shadow-emerald-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><CircleDollarSign size={22} /></div>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">الإجمالي</p>
                <p className="text-2xl font-black text-white mt-1">
                  {calculations.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-sm text-white/70 mr-1">ريال</span>
                </p>
                <p className="text-white/60 text-[10px] font-bold mt-1">شامل الضريبة</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <FileText className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-black">تفاصيل الفاتورة والسبب</h3>
                    <p className="text-blue-200 text-xs font-bold">اختر الفاتورة وأدخل سبب المرتجع</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-1.5">
                      <Hash size={14} className="text-blue-500" />
                      اختر الفاتورة الضريبية
                    </label>
                    <div className="relative">
                      <Receipt className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        className="w-full h-14 pr-12 pl-4 rounded-xl bg-gray-50 border-2 border-transparent text-sm font-bold focus:border-blue-500/30 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                        value={selectedInvoiceId}
                        onChange={(e) => setSelectedInvoiceId(e.target.value)}
                        required
                      >
                        <option value="">-- اختر فاتورة من القائمة --</option>
                        {invoices.map(inv => (
                          <option key={inv.id} value={inv.id.toString()}>
                            {inv.invoice_number} - {inv.client_name} ({parseFloat(String(inv.total_amount)).toLocaleString()} ريال)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-1.5">
                      <User size={14} className="text-blue-500" />
                      اسم العميل
                    </label>
                    <div className="relative">
                      <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        className="w-full h-14 pr-12 pl-4 rounded-xl bg-gray-100 border-2 border-transparent text-sm font-bold text-gray-500 cursor-not-allowed"
                        value={selectedInvoice?.client_name || "سيتم التحديد تلقائياً"}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {selectedInvoice && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">إجمالي الفاتورة</span>
                        <span className="text-sm font-black text-gray-800">
                          {parseFloat(String(selectedInvoice.total_amount)).toLocaleString()} ريال
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">المرتجع السابق</span>
                        <span className="text-sm font-black text-rose-600">
                          {parseFloat(String(selectedInvoice.total_issued)).toLocaleString()} ريال
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">المتاح للإرجاع</span>
                        <span className="text-sm font-black text-emerald-600">
                          {availableAmount.toLocaleString()} ريال
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">الرقم الضريبي</span>
                        <span className="text-sm font-black text-gray-800">
                          {selectedInvoice.client_vat || 'غير متوفر'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-blue-500" />
                    سبب إشعار الدائن
                  </label>
                  <textarea
                    className="w-full px-4 py-4 rounded-xl bg-gray-50 border-2 border-transparent text-sm font-bold focus:border-blue-500/30 focus:bg-white outline-none transition-all min-h-[120px] resize-none"
                    placeholder="أدخل سبب المرتجع بالتفصيل (مثال: إرجاع بضاعة تالفة، خصم متفق عليه، إلخ...)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Calculator className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-black">المبالغ والضريبة</h3>
                    <p className="text-amber-200 text-xs font-bold">أدخل المبلغ المراد إرجاعه</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-1.5">
                      <Coins size={14} className="text-emerald-500" />
                      المبلغ (شامل الضريبة)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        className="w-full h-14 px-4 rounded-xl bg-rose-50 border-2 border-rose-200 text-sm font-black focus:border-rose-400 focus:bg-white outline-none transition-all text-rose-600"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        max={availableAmount}
                        required
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">ريال</span>
                    </div>
                    {selectedInvoiceId && (
                      <p className="text-[10px] font-black text-gray-400">
                        الحد الأقصى: <span className="text-rose-600">{availableAmount.toLocaleString()} ريال</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-1.5">
                      <Calculator size={14} className="text-slate-400" />
                      المبلغ قبل الضريبة
                    </label>
                    <div className="w-full h-14 px-4 rounded-xl bg-gray-100 border-2 border-gray-200 flex items-center justify-between">
                      <span className="text-sm font-black text-gray-600">
                        {calculations.beforeVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs font-black text-gray-400">ريال</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-1.5">
                      <Percent size={14} className="text-amber-500" />
                      قيمة الضريبة (15%)
                    </label>
                    <div className="w-full h-14 px-4 rounded-xl bg-amber-50 border-2 border-amber-200 flex items-center justify-between">
                      <span className="text-sm font-black text-amber-700">
                        {calculations.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs font-black text-amber-500">ريال</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 text-white"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                  <Calculator className="text-rose-400" size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg">ملخص المرتجع</h3>
                  <p className="text-slate-400 text-xs font-bold">حساب تلقائي للضريبة</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Receipt size={18} className="text-slate-400" />
                    <span className="text-slate-300 font-bold text-sm">المبلغ الإجمالي</span>
                  </div>
                  <span className="font-mono font-black text-white">
                    {calculations.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-slate-400 mr-1 text-xs">ريال</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <div className="flex items-center gap-3">
                    <TrendingDown size={18} className="text-rose-400" />
                    <span className="text-rose-200 font-bold text-sm">صافي المسترجع</span>
                  </div>
                  <span className="font-mono font-black text-rose-400">
                    {calculations.beforeVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-rose-300/70 mr-1 text-xs">ريال</span>
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <Percent size={18} className="text-amber-400" />
                    <span className="text-amber-200 font-bold text-sm">إجمالي الضريبة</span>
                  </div>
                  <span className="font-mono font-black text-amber-400">
                    {calculations.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-amber-300/70 mr-1 text-xs">ريال</span>
                  </span>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />

              <div className="p-5 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl border border-emerald-500/30">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                      <CircleDollarSign size={20} className="text-emerald-400" />
                    </div>
                    <span className="text-emerald-200 font-black text-sm">إجمالي الخصم</span>
                  </div>
                  <div className="text-left">
                    <span className="text-2xl font-black text-emerald-400 tracking-tight">
                      {calculations.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="mr-2 text-sm font-bold text-emerald-300/70">ريال</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-sm transition-all shadow-lg shadow-rose-500/30",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>{loading ? "جاري الحفظ..." : "حفظ إشعار الدائن"}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setSelectedInvoiceId("");
                    setReason("");
                    setAmount("");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-sm transition-all border border-white/10"
                >
                  <RotateCcw size={18} />
                  <span>إعادة تعيين</span>
                </motion.button>
              </div>

              <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                  <BadgeCheck size={14} className="text-emerald-400" />
                  <span>متوافق مع متطلبات هيئة الزكاة والضريبة والجمارك ZATCA</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-2xl border border-amber-200"
            >
              <div className="flex gap-3">
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 shrink-0 h-fit">
                  <AlertTriangle size={18} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-black text-amber-800">ملاحظة ضريبية</p>
                  <p className="text-xs font-bold text-amber-600 leading-relaxed">
                    يتم احتساب ضريبة القيمة المضافة بنسبة 15% تلقائياً من المبلغ الشامل. تأكد من مطابقة المبلغ المرتجع مع المستندات المرفقة قبل الحفظ.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </form>

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
