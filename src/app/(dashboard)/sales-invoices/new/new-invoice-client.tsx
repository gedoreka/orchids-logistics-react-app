"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Calendar,
  Users,
  Save,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calculator,
  DollarSign,
  Percent,
  FileCheck,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  vat_number: string;
  commercial_number: string;
}

interface InvoiceItem {
  id: string;
  product_name: string;
  quantity: number;
  total_with_vat: number;
  period_from: string;
  period_to: string;
  unit_price: number;
  before_vat: number;
  vat_amount: number;
}

interface Adjustment {
  id: string;
  title: string;
  type: 'discount' | 'addition';
  amount: number;
  is_gross: boolean;
  vat_amount: number;
  total_with_vat: number;
}

interface NewInvoiceClientProps {
  customers: Customer[];
  invoiceNumber: string;
  companyId: number;
  userName: string;
}

export function NewInvoiceClient({ customers, invoiceNumber, companyId, userName }: NewInvoiceClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error" | "loading";
    title: string;
    message: string;
  }>({ show: false, type: "success", title: "", message: "" });

  const today = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const invoiceMonth = new Date().toISOString().slice(0, 7);

  const [clientId, setClientId] = useState<number>(0);
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState(defaultDueDate);
  
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      product_name: '',
      quantity: 0,
      total_with_vat: 0,
      period_from: '',
      period_to: '',
      unit_price: 0,
      before_vat: 0,
      vat_amount: 0
    }
  ]);

  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const calculateItem = useCallback((item: InvoiceItem): InvoiceItem => {
    const totalWithVat = item.total_with_vat;
    const beforeVat = totalWithVat / 1.15;
    const vatAmount = totalWithVat - beforeVat;
    const unitPrice = item.quantity > 0 ? beforeVat / item.quantity : 0;
    
    return {
      ...item,
      before_vat: beforeVat,
      vat_amount: vatAmount,
      unit_price: unitPrice
    };
  }, []);

  const calculateAdjustment = useCallback((adj: Adjustment): Adjustment => {
    let vatAmount = 0;
    let totalWithVat = adj.amount;
    
    if (adj.is_gross) {
      vatAmount = adj.amount * 0.15;
      totalWithVat = adj.amount + vatAmount;
    }
    
    return {
      ...adj,
      vat_amount: vatAmount,
      total_with_vat: totalWithVat
    };
  }, []);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      newItems[index] = calculateItem(newItems[index]);
      return newItems;
    });
  };

  const handleAdjustmentChange = (index: number, field: keyof Adjustment, value: any) => {
    setAdjustments(prev => {
      const newAdj = [...prev];
      newAdj[index] = { ...newAdj[index], [field]: value };
      newAdj[index] = calculateAdjustment(newAdj[index]);
      return newAdj;
    });
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      product_name: '',
      quantity: 0,
      total_with_vat: 0,
      period_from: '',
      period_to: '',
      unit_price: 0,
      before_vat: 0,
      vat_amount: 0
    }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addAdjustment = () => {
    setAdjustments(prev => [...prev, {
      id: Date.now().toString(),
      title: '',
      type: 'discount',
      amount: 0,
      is_gross: false,
      vat_amount: 0,
      total_with_vat: 0
    }]);
  };

  const removeAdjustment = (index: number) => {
    setAdjustments(prev => prev.filter((_, i) => i !== index));
  };

  const totals = useMemo(() => {
    let totalBeforeVat = 0;
    let totalVat = 0;
    let totalWithVat = 0;

    items.forEach(item => {
      totalBeforeVat += item.before_vat;
      totalVat += item.vat_amount;
      totalWithVat += item.total_with_vat;
    });

    adjustments.forEach(adj => {
      if (adj.type === 'addition') {
        totalVat += adj.vat_amount;
        totalWithVat += adj.total_with_vat;
      } else {
        totalWithVat -= adj.total_with_vat;
      }
    });

    return { totalBeforeVat, totalVat, totalWithVat };
  }, [items, adjustments]);

  const validateForm = () => {
    if (!clientId) {
      showNotification("error", "خطأ", "الرجاء اختيار العميل");
      return false;
    }

    const validItems = items.filter(i => i.product_name.trim());
    if (validItems.length === 0) {
      showNotification("error", "خطأ", "الرجاء إدخال خدمة واحدة على الأقل");
      return false;
    }

    return true;
  };

  const handleSave = async (status: 'due' | 'draft') => {
    if (!validateForm()) return;

    setLoading(true);
    showNotification("loading", "جاري الحفظ", "جاري حفظ الفاتورة...");

    try {
      const validItems = items.filter(i => i.product_name.trim()).map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        total_with_vat: item.total_with_vat,
        period_from: item.period_from || null,
        period_to: item.period_to || null
      }));

      const validAdjustments = adjustments.filter(a => a.title.trim()).map(adj => ({
        title: adj.title,
        type: adj.type,
        amount: adj.amount,
        is_gross: adj.is_gross
      }));

      const res = await fetch('/api/sales-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_number: invoiceNumber,
          invoice_month: invoiceMonth,
          client_id: clientId,
          issue_date: issueDate,
          due_date: dueDate,
          status,
          items: validItems,
          adjustments: validAdjustments
        })
      });

      const data = await res.json();

      if (data.success) {
        showNotification("success", "تم الحفظ", data.message);
        setTimeout(() => {
          router.push(`/sales-invoices/${data.invoice_id}`);
        }, 1500);
      } else {
        showNotification("error", "خطأ", data.error || "حدث خطأ");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6">
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-4 left-1/2 z-50 px-6 py-3 rounded-xl shadow-lg ${
              notification.type === "success" ? "bg-emerald-500" : 
              notification.type === "error" ? "bg-red-500" : "bg-blue-500"
            } text-white font-bold flex items-center gap-2`}
          >
            {notification.type === "success" && <CheckCircle size={20} />}
            {notification.type === "error" && <AlertCircle size={20} />}
            {notification.type === "loading" && <Loader2 size={20} className="animate-spin" />}
            <div>
              <p className="font-bold">{notification.title}</p>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 text-white shadow-xl text-center"
        >
          <h1 className="text-2xl md:text-3xl font-black flex items-center justify-center gap-3">
            <FileText className="h-8 w-8" />
            إنشاء فاتورة ضريبية
          </h1>
          <p className="text-white/80 mt-2">أضف تفاصيل الفاتورة وخدماتها واختر العميل المناسب</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
            <Plus size={18} />
            <span>نظام إنشاء الفواتير الإلكترونية</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            معلومات الفاتورة الأساسية
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">رقم الفاتورة</label>
              <input
                type="text"
                value={invoiceNumber}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">تاريخ الإصدار</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">تاريخ الاستحقاق</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              <Users size={16} className="inline ml-1" />
              اسم العميل
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            >
              <option value={0}>-- اختر عميل --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.vat_number ? `(${c.vat_number})` : ''}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-600" />
            تفاصيل الخدمات / المنتجات
          </h3>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">اسم الخدمة</label>
                    <input
                      type="text"
                      value={item.product_name}
                      onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                      placeholder="أدخل اسم الخدمة"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">عدد الطلبات</label>
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">المبلغ شامل الضريبة</label>
                    <input
                      type="number"
                      value={item.total_with_vat || ''}
                      onChange={(e) => handleItemChange(index, 'total_with_vat', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">سعر الوحدة</label>
                    <input
                      type="text"
                      value={item.unit_price.toFixed(4)}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-gray-100 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">قبل الضريبة</label>
                    <input
                      type="text"
                      value={item.before_vat.toFixed(2)}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-gray-100 text-gray-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">الضريبة (15%)</label>
                    <input
                      type="text"
                      value={item.vat_amount.toFixed(2)}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-blue-50 text-blue-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">من تاريخ</label>
                    <input
                      type="date"
                      value={item.period_from}
                      onChange={(e) => handleItemChange(index, 'period_from', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-600 mb-1">إلى</label>
                      <input
                        type="date"
                        value={item.period_to}
                        onChange={(e) => handleItemChange(index, 'period_to', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-sm"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors font-bold text-sm"
          >
            <Plus size={18} />
            إضافة خدمة أخرى
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Percent size={20} className="text-amber-600" />
            إضافات وخصومات
          </h3>

          <div className="space-y-4">
            {adjustments.map((adj, index) => (
              <div key={adj.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">الوصف</label>
                    <input
                      type="text"
                      value={adj.title}
                      onChange={(e) => handleAdjustmentChange(index, 'title', e.target.value)}
                      placeholder="سبب الخصم أو الإضافة"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">النوع</label>
                    <select
                      value={adj.type}
                      onChange={(e) => handleAdjustmentChange(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-sm"
                    >
                      <option value="discount">خصم</option>
                      <option value="addition">إضافة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">المبلغ</label>
                    <input
                      type="number"
                      value={adj.amount || ''}
                      onChange={(e) => handleAdjustmentChange(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={adj.is_gross}
                      onChange={(e) => handleAdjustmentChange(index, 'is_gross', e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <label className="text-xs text-gray-600">شامل الضريبة</label>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-600 mb-1">الإجمالي</label>
                      <input
                        type="text"
                        value={adj.total_with_vat.toFixed(2)}
                        readOnly
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          adj.type === 'discount' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdjustment(index)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addAdjustment}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors font-bold text-sm"
          >
            <Plus size={18} />
            إضافة خصم أو إضافة
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calculator size={20} className="text-blue-600" />
            ملخص الفاتورة
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <span className="text-gray-600">المبلغ غير شامل الضريبة:</span>
              <span className="font-bold text-gray-900">{totals.totalBeforeVat.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
              <span className="text-gray-600">إجمالي الضريبة:</span>
              <span className="font-bold text-blue-600">{totals.totalVat.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between items-center py-3 mt-2 border-t-2 border-blue-200">
              <span className="text-lg font-bold text-gray-900">إجمالي المبلغ المستحق:</span>
              <span className="text-xl font-black text-emerald-600 bg-emerald-100 px-4 py-2 rounded-xl">
                {totals.totalWithVat.toFixed(2)} ريال
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link href="/sales-invoices">
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-bold">
              <ArrowRight size={20} />
              العودة
            </button>
          </Link>
          <button
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-bold transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            حفظ كمسودة
          </button>
          <button
            onClick={() => handleSave('due')}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-colors disabled:opacity-50 shadow-lg"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <FileCheck size={20} />}
            حفظ كفاتورة مستحقة
          </button>
        </motion.div>
      </div>
    </div>
  );
}
