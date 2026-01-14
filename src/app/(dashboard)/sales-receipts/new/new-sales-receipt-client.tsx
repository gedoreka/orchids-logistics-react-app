"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt,
  User,
  Calendar,
  Hash,
  DollarSign,
  ArrowRight,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  StickyNote,
  Building2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Customer {
  id: number;
  customer_name: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
}

interface NewSalesReceiptClientProps {
  customers: Customer[];
  invoices: Invoice[];
  companyId: number;
  userName: string;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function NewSalesReceiptClient({ customers, invoices, companyId, userName }: NewSalesReceiptClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });
  
  const receiptNumber = 'RCPT' + Math.floor(10000 + Math.random() * 90000);
  
  const [formData, setFormData] = useState({
    receipt_number: receiptNumber,
    client_id: "",
    invoice_id: "",
    receipt_date: new Date().toISOString().split('T')[0],
    amount: "",
    notes: ""
  });

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      showNotification("error", "خطأ في البيانات", "يرجى اختيار العميل");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showNotification("error", "خطأ في البيانات", "يرجى إدخال المبلغ");
      return;
    }

    setLoading(true);
    showNotification("loading", "جاري الحفظ", "جاري حفظ الإيصال...");

    try {
      const res = await fetch("/api/sales-receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          company_id: companyId,
          amount: parseFloat(formData.amount),
          invoice_id: formData.invoice_id || null,
          created_by: userName
        })
      });

      if (res.ok) {
        showNotification("success", "تم الحفظ بنجاح", "تم حفظ الإيصال بنجاح");
        setTimeout(() => {
          router.push("/sales-receipts");
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        showNotification("error", "فشل الحفظ", data.error || "فشل حفظ الإيصال");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => notification.type !== "loading" && hideNotification()}
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
                      onClick={hideNotification}
                      className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      حسناً
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-[900px] mx-auto space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg">
                    <Receipt size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">إضافة إيصال مبيعات</h1>
                    <p className="text-white/60 text-sm">إنشاء سند قبض مبيعات جديد</p>
                  </div>
                </div>
                <Link href="/sales-receipts">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                    <ArrowRight size={16} />
                    <span>العودة للقائمة</span>
                  </button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-blue-500 px-4 py-3 flex items-center gap-2 text-white">
                <FileText size={18} />
                <h3 className="font-bold text-sm">المعلومات الأساسية</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <Hash size={14} className="text-gray-400" />
                    رقم الإيصال
                  </label>
                  <input
                    type="text"
                    name="receipt_number"
                    value={formData.receipt_number}
                    readOnly
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">يتم إنشاء الرقم تلقائياً</p>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    تاريخ الإيصال
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="receipt_date"
                    value={formData.receipt_date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-purple-500 px-4 py-3 flex items-center gap-2 text-white">
                <User size={18} />
                <h3 className="font-bold text-sm">بيانات العميل</h3>
              </div>
              <div className="p-5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                  <User size={14} className="text-gray-400" />
                  اختر العميل
                  <span className="text-red-500">*</span>
                </label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm"
                >
                  <option value="">-- اختر العميل --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.customer_name}
                    </option>
                  ))}
                </select>
                {customers.length === 0 && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-amber-700 text-xs">
                      لا يوجد عملاء مسجلين. 
                      <Link href="/customers/new" className="text-blue-600 hover:underline mr-1">
                        إضافة عميل جديد
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-indigo-500 px-4 py-3 flex items-center gap-2 text-white">
                <LinkIcon size={18} />
                <h3 className="font-bold text-sm">الربط مع الفاتورة</h3>
              </div>
              <div className="p-5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                  <FileText size={14} className="text-gray-400" />
                  ربط بفاتورة (اختياري)
                </label>
                <select
                  name="invoice_id"
                  value={formData.invoice_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm"
                >
                  <option value="">-- بدون ربط --</option>
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">يمكنك ربط الإيصال بفاتورة معينة لتسهيل التتبع</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-emerald-500 px-4 py-3 flex items-center gap-2 text-white">
                <DollarSign size={18} />
                <h3 className="font-bold text-sm">المبلغ والملاحظات</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <DollarSign size={14} className="text-gray-400" />
                    المبلغ
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none text-sm pl-12"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">ر.س</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">المبلغ بالريال السعودي</p>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <StickyNote size={14} className="text-gray-400" />
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="أدخل أي ملاحظات إضافية..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-2 pb-6">
              <Link href="/sales-receipts">
                <button type="button" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                  <ArrowRight size={16} />
                  <span>إلغاء</span>
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-sm hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-teal-500/25"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>حفظ الإيصال</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
