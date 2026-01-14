"use client";

import React, { useState, useEffect } from "react";
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
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

  const selectedInvoice = invoices.find(inv => inv.id === parseInt(selectedInvoiceId));
  const availableAmount = selectedInvoice 
    ? parseFloat(String(selectedInvoice.total_amount)) - parseFloat(String(selectedInvoice.total_issued))
    : 0;

  const vatAmount = (parseFloat(amount) || 0) * 0.15;
  const beforeVat = (parseFloat(amount) || 0) - vatAmount;

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
        toast.success("تم إنشاء إشعار الدائن بنجاح");
        router.push("/credit-notes");
        router.refresh();
      } else {
        toast.error(data.error || "فشل إنشاء إشعار الدائن");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-6 overflow-y-auto bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/credit-notes">
          <button className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-slate-500">
            <ArrowRight size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-[#1e293b]">إنشاء إشعار دائن جديد</h1>
          <p className="text-[#64748b] font-bold text-sm">إصدار مستند مرتجع مرتبط بفاتورة ضريبية</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <FileText className="text-blue-600" size={20} />
              تفاصيل الفاتورة والسبب
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5">
                  <Hash size={14} className="text-blue-500" />
                  اختر الفاتورة الضريبية
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5">
                  <User size={14} className="text-blue-500" />
                  اسم العميل
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 cursor-not-allowed"
                  value={selectedInvoice?.client_name || "سيتم التحديد تلقائياً"}
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5">
                <MessageSquare size={14} className="text-blue-500" />
                سبب إشعار الدائن
              </label>
              <textarea
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px]"
                placeholder="أدخل سبب المرتجع بالتفصيل (مثال: إرجاع بضاعة تالفة، خصم متفق عليه، إلخ...)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Calculator className="text-blue-600" size={20} />
              المبالغ والضريبة
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5">
                  <Coins size={14} className="text-emerald-500" />
                  المبلغ (شامل الضريبة)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-red-600"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    max={availableAmount}
                    required
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">ريال</span>
                </div>
                {selectedInvoiceId && (
                  <p className="text-[10px] font-black text-slate-400 mt-1">
                    الحد الأقصى المتاح: <span className="text-blue-600">{availableAmount.toLocaleString()} ريال</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5">
                  <Calculator size={14} className="text-slate-400" />
                  المبلغ قبل الضريبة
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500"
                  value={beforeVat.toFixed(2)}
                  readOnly
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-500 uppercase flex items-center gap-1.5">
                  <Percent size={14} className="text-amber-500" />
                  قيمة الضريبة (15%)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500"
                  value={vatAmount.toFixed(2)}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className="bg-[#2c3e50] p-6 rounded-2xl shadow-xl text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <h2 className="text-lg font-black flex items-center gap-2 relative z-10">
              <Calculator size={20} className="text-blue-400" />
              ملخص المرتجع
            </h2>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-slate-300">المبلغ الإجمالي</span>
                <span className="text-sm font-black">{amount || "0.00"} ريال</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-slate-300">صافي المسترجع</span>
                <span className="text-sm font-black text-blue-400">{beforeVat.toFixed(2)} ريال</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-slate-300">إجمالي الضريبة</span>
                <span className="text-sm font-black text-amber-400">{vatAmount.toFixed(2)} ريال</span>
              </div>
              <div className="pt-2">
                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                  <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">إجمالي الخصم من الفاتورة</p>
                  <p className="text-xl font-black text-emerald-400">
                    {amount ? parseFloat(amount).toLocaleString() : "0.00"} <span className="text-xs">ريال</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 relative z-10 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                <Save size={18} />
                <span>{loading ? "جاري الحفظ..." : "حفظ إشعار الدائن"}</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSelectedInvoiceId("");
                  setReason("");
                  setAmount("");
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                <span>إعادة تعيين</span>
              </button>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0">
              <calculator size={18} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black text-amber-800">ملاحظة ضريبية</p>
              <p className="text-[10px] font-bold text-amber-600 leading-relaxed">
                يتم احتساب ضريبة القيمة المضافة بنسبة 15% تلقائياً. تأكد من مطابقة المبلغ المرتجع مع المستندات المرفقة.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
