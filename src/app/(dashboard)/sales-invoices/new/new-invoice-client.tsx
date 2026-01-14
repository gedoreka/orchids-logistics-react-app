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
  name?: string;
  customer_name?: string;
  company_name?: string;
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

    const calculateItem = useCallback((item: InvoiceItem, source: 'total' | 'unit_price' = 'total'): InvoiceItem => {
      let totalWithVat = item.total_with_vat;
      let unitPrice = item.unit_price;
      const quantity = item.quantity || 0;

      if (source === 'unit_price') {
        const beforeVat = unitPrice * quantity;
        totalWithVat = beforeVat * 1.15;
      }

      const beforeVat = totalWithVat / 1.15;
      const vatAmount = totalWithVat - beforeVat;
      if (source === 'total') {
        unitPrice = quantity > 0 ? beforeVat / quantity : 0;
      }
      
      return {
        ...item,
        before_vat: beforeVat,
        vat_amount: vatAmount,
        unit_price: unitPrice,
        total_with_vat: totalWithVat
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
        
        // Determine source of change for calculation
        const source = field === 'unit_price' ? 'unit_price' : 'total';
        newItems[index] = calculateItem(newItems[index], source);
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

        <div className="max-w-6xl mx-auto space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/10 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/15 backdrop-blur-md rounded-2xl shadow-inner border border-white/20">
                    <FileText className="h-8 w-8 text-blue-200" />
                  </div>
                  <div className="text-right">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">إنشاء فاتورة ضريبية</h1>
                    <p className="text-white/70 text-sm font-medium">نظام الفوترة الإلكترونية الذكي • المرحلة الثانية</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl text-xs font-bold border border-white/20 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="opacity-90 tracking-wide">متصل بالنظام الضريبي • {new Date().toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">بيانات العميل</h3>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">اختر العميل المستهدف</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none bg-no-repeat bg-[left_1rem_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22%236B7280%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem]"
                >
                  <option value={0}>-- اختر عميل من القائمة --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name || c.customer_name || c.name} {c.vat_number ? `(${c.vat_number})` : ''}
                    </option>
                  ))}
                </select>
                {clientId > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="text-xs">
                      <span className="text-gray-500 block">الرقم الضريبي</span>
                      <span className="font-bold text-gray-700">{customers.find(c => c.id === clientId)?.vat_number || 'غير متوفر'}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-gray-500 block">العنوان</span>
                      <span className="font-bold text-gray-700 truncate block">{customers.find(c => c.id === clientId)?.address || 'غير متوفر'}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">مواعيد الفاتورة</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">رقم الفاتورة</label>
                    <div className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-500 font-bold text-sm">
                      {invoiceNumber}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">تاريخ الإصدار</label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-600" />
                <h3 className="font-bold text-gray-900">تفاصيل الخدمات والمنتجات</h3>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-bold text-xs shadow-sm"
              >
                <Plus size={14} />
                إضافة خدمة
              </button>
            </div>

            <div className="p-0">
                <div className="hidden md:grid grid-cols-12 gap-2 px-6 py-3 bg-gray-100/50 text-xs font-black text-gray-500 border-b border-gray-100">
                  <div className="col-span-3">اسم الخدمة</div>
                  <div className="col-span-1 text-center">الكمية</div>
                  <div className="col-span-1 text-center">سعر الوحدة</div>
                  <div className="col-span-1 text-center">الإجمالي (شامل)</div>
                  <div className="col-span-2 text-center">من تاريخ</div>
                  <div className="col-span-2 text-center">إلى تاريخ</div>
                  <div className="col-span-1 text-center">الضريبة</div>
                  <div className="col-span-1 text-center">حذف</div>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <div key={item.id} className="p-4 md:px-6 md:py-3 hover:bg-gray-50/50 transition-colors">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        <div className="md:col-span-3">
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                            placeholder="اسم الخدمة أو المنتج..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-sm font-medium truncate bg-white shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <input
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-sm text-center font-bold bg-white shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-1">
                          <div className="relative">
                            <input
                              type="number"
                              value={item.unit_price ? Number(item.unit_price.toFixed(2)) : ''}
                              onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="w-full px-1 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-[11px] text-center font-bold bg-white shadow-sm text-blue-600"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-1">
                          <div className="relative">
                            <input
                              type="number"
                              value={item.total_with_vat || ''}
                              onChange={(e) => handleItemChange(index, 'total_with_vat', parseFloat(e.target.value) || 0)}
                              className="w-full px-1 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-[11px] text-center font-black text-emerald-600 bg-white shadow-sm"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="date"
                            value={item.period_from}
                            onChange={(e) => handleItemChange(index, 'period_from', e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-xs bg-white shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="date"
                            value={item.period_to}
                            onChange={(e) => handleItemChange(index, 'period_to', e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-xs bg-white shadow-sm"
                          />
                        </div>
                        <div className="md:col-span-1 text-center">
                          <div className="text-[10px] font-bold text-blue-600 bg-blue-50 py-1 rounded border border-blue-100">
                            {item.vat_amount.toFixed(2)}
                          </div>
                        </div>
                        <div className="md:col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4"
            >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Percent size={18} className="text-amber-600" />
                    <h3 className="font-bold text-gray-900">التعديلات والإضافية</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addAdjustment}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all font-bold text-xs shadow-md shadow-amber-100 hover:-translate-y-0.5"
                  >
                    <Plus size={14} />
                    إضافة خصم أو استحقاق
                  </button>
                </div>

              <div className="space-y-3">
                {adjustments.map((adj, index) => (
                  <div key={adj.id} className="flex flex-col md:flex-row gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 relative group">
                    <input
                      type="text"
                      value={adj.title}
                      onChange={(e) => handleAdjustmentChange(index, 'title', e.target.value)}
                      placeholder="وصف التعديل..."
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-xs"
                    />
                    <select
                      value={adj.type}
                      onChange={(e) => handleAdjustmentChange(index, 'type', e.target.value)}
                      className="w-24 px-2 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-xs font-bold"
                    >
                      <option value="discount">خصم (-)</option>
                      <option value="addition">إضافة (+)</option>
                    </select>
                    <div className="relative w-32">
                      <input
                        type="number"
                        value={adj.amount || ''}
                        onChange={(e) => handleAdjustmentChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-xs font-bold"
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">SR</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAdjustment(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {adjustments.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-sm">
                    لا يوجد خصومات أو إضافات حالياً
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl shadow-xl p-6 text-white"
            >
              <div className="flex items-center gap-2 mb-6">
                <Calculator size={20} className="text-blue-300" />
                <h3 className="font-bold">ملخص الحسابات الضريبية</h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm opacity-80">
                  <span>المبلغ قبل الضريبة</span>
                  <span className="font-mono">{totals.totalBeforeVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال</span>
                </div>
                <div className="flex justify-between items-center text-sm opacity-80">
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span className="font-mono">{totals.totalVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال</span>
                </div>
                <div className="h-px bg-white/10 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">الإجمالي النهائي</span>
                  <div className="text-right">
                    <span className="text-3xl font-black text-blue-300 tracking-tight">
                      {totals.totalWithVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="mr-2 text-sm font-bold opacity-70">ريال سعودي</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100"
          >
            <Link href="/sales-invoices">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-bold text-sm">
                <ArrowRight size={18} />
                إلغاء والعودة
              </button>
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleSave('draft')}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold transition-all disabled:opacity-50 text-sm shadow-md"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
                حفظ كمسودة
              </button>
              <button
                onClick={() => handleSave('due')}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 text-sm shadow-lg shadow-emerald-200 hover:-translate-y-0.5"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <FileCheck size={18} />}
                حفظ وإصدار الفاتورة
              </button>
            </div>
          </motion.div>
        </div>

    </div>
  );
}
