"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  User,
  Calendar,
  Clock,
  Package,
  Hash,
  DollarSign,
  Plus,
  Trash2,
  ArrowRight,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Percent
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  vat_number: string;
}

interface ProductItem {
  id: string;
  product_name: string;
  description: string;
  quantity: number;
  price: number;
}

interface NewQuotationClientProps {
  customers: Customer[];
  companyId: number;
  nextQuotationNumber: string;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function NewQuotationClient({ customers, companyId, nextQuotationNumber }: NewQuotationClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });
  const [formData, setFormData] = useState({
    quotation_number: nextQuotationNumber,
    client_id: "",
    issue_date: new Date().toISOString().split('T')[0],
    due_date: ""
  });
  const [items, setItems] = useState<ProductItem[]>([
    { id: "1", product_name: "", description: "", quantity: 1, price: 0 }
  ]);

  const vatRate = 15;

  const calculateTotals = () => {
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.quantity * item.price;
    });
    const vatAmount = (subtotal * vatRate) / 100;
    const total = subtotal + vatAmount;
    return { subtotal, vatAmount, total };
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: keyof ProductItem, value: string | number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      product_name: "",
      description: "",
      quantity: 1,
      price: 0
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmit = async (status: 'draft' | 'confirmed') => {
    if (!formData.client_id) {
      showNotification("error", "خطأ في البيانات", "يرجى اختيار العميل");
      return;
    }

    if (!formData.due_date) {
      showNotification("error", "خطأ في البيانات", "يرجى تحديد تاريخ الانتهاء");
      return;
    }

    const validItems = items.filter(item => item.product_name && item.quantity > 0 && item.price > 0);
    if (validItems.length === 0) {
      showNotification("error", "خطأ في البيانات", "يرجى إضافة منتج واحد على الأقل");
      return;
    }

    setLoading(true);
    showNotification("loading", "جاري الحفظ", "جاري حفظ عرض السعر...");

    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          company_id: companyId,
          status,
          items: validItems
        })
      });

      if (res.ok) {
        showNotification("success", "تم الحفظ بنجاح", status === 'confirmed' ? "تم حفظ وتأكيد عرض السعر" : "تم حفظ عرض السعر كمسودة");
        setTimeout(() => {
          router.push("/quotations");
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        showNotification("error", "فشل الحفظ", data.error || "فشل حفظ عرض السعر");
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
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">إنشاء عرض سعر جديد</h1>
                    <p className="text-white/60 text-sm">أضف عرض سعر جديد للعملاء</p>
                  </div>
                </div>
                <Link href="/quotations">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                    <ArrowRight size={16} />
                    <span>العودة للقائمة</span>
                  </button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-blue-500 px-4 py-3 flex items-center gap-2 text-white">
                <FileText size={18} />
                <h3 className="font-bold text-sm">المعلومات الأساسية</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <Hash size={14} className="text-gray-400" />
                    رقم العرض
                  </label>
                  <input
                    type="text"
                    name="quotation_number"
                    value={formData.quotation_number}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">يتم إنشاء الرقم تلقائياً</p>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <Calendar size={14} className="text-gray-400" />
                    تاريخ الإصدار
                  </label>
                  <input
                    type="date"
                    name="issue_date"
                    value={formData.issue_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                    <Clock size={14} className="text-gray-400" />
                    تاريخ الانتهاء
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-purple-500 px-4 py-3 flex items-center gap-2 text-white">
                <User size={18} />
                <h3 className="font-bold text-sm">العميل</h3>
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
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none text-sm"
                >
                  <option value="">اختر العميل...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.customer_name || c.company_name} - {c.vat_number}
                    </option>
                  ))}
                </select>
                {customers.length === 0 && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
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
              <div className="bg-emerald-500 px-4 py-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Package size={18} />
                  <h3 className="font-bold text-sm">المنتجات / الخدمات</h3>
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-all"
                >
                  <Plus size={14} />
                  إضافة منتج
                </button>
              </div>
              <div className="p-5 space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 border-r-4 border-blue-500">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-4">
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">اسم المنتج</label>
                        <input
                          type="text"
                          placeholder="اسم المنتج أو الخدمة"
                          value={item.product_name}
                          onChange={(e) => handleItemChange(item.id, 'product_name', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">الوصف</label>
                        <input
                          type="text"
                          placeholder="وصف اختياري"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">الكمية</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-gray-500 mb-1 block">السعر</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 outline-none text-sm"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="w-full h-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-left">
                      <span className="text-xs text-gray-500">
                        الإجمالي: <span className="font-bold text-emerald-600">{(item.quantity * item.price).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-amber-500 px-4 py-3 flex items-center gap-2 text-white">
                <DollarSign size={18} />
                <h3 className="font-bold text-sm">ملخص المبالغ</h3>
              </div>
              <div className="p-5">
                <div className="max-w-md mr-auto space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">المجموع الفرعي:</span>
                    <span className="font-bold text-gray-900">{subtotal.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm flex items-center gap-1">
                      <Percent size={12} />
                      ضريبة القيمة المضافة ({vatRate}%):
                    </span>
                    <span className="font-bold text-amber-600">{vatAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-emerald-50 rounded-lg px-4">
                    <span className="text-emerald-800 font-bold">الإجمالي شامل الضريبة:</span>
                    <span className="font-black text-2xl text-emerald-600">{total.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ر.س</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-2 pb-6">
              <Link href="/quotations">
                <button type="button" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                  <ArrowRight size={16} />
                  <span>إلغاء</span>
                </button>
              </Link>
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-500 text-white font-bold text-sm hover:bg-gray-600 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>حفظ كمسودة</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('confirmed')}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <FileCheck size={16} />}
                <span>حفظ وتأكيد</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
