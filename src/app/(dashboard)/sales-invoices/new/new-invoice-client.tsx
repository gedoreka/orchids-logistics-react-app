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
  Clock,
  LayoutDashboard,
  Receipt,
  Building2,
  Sparkles,
  BadgeCheck,
  FileSpreadsheet,
  Hash,
  MapPin,
  Phone,
  CreditCard,
  Banknote,
  Package,
  CalendarDays,
  ArrowLeftRight,
  TrendingUp,
  ChevronDown,
  Zap,
  Target,
  CircleDollarSign,
  ReceiptText,
  ShoppingCart
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
  is_taxable: boolean;
  is_inclusive: boolean;
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

  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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
      
      if (adj.is_taxable) {
        if (adj.is_inclusive) {
          const beforeVat = adj.amount / 1.15;
          vatAmount = adj.amount - beforeVat;
          totalWithVat = adj.amount;
        } else {
          vatAmount = adj.amount * 0.15;
          totalWithVat = adj.amount + vatAmount;
        }
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
      is_taxable: true,
      is_inclusive: true,
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
          totalBeforeVat += (adj.total_with_vat - adj.vat_amount);
        } else {
          totalVat -= adj.vat_amount;
          totalWithVat -= adj.total_with_vat;
          totalBeforeVat -= (adj.total_with_vat - adj.vat_amount);
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
        is_taxable: adj.is_taxable,
        is_inclusive: adj.is_inclusive
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

  const selectedCustomer = customers.find(c => c.id === clientId);

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
        className="max-w-[1800px] mx-auto px-4 pt-6 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FileText className="text-white" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <Link href="/dashboard" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                  <LayoutDashboard size={12} />
                  لوحة التحكم
                </Link>
                <ArrowRight size={12} />
                <Link href="/sales-invoices" className="hover:text-emerald-600 transition-colors">
                  الفواتير الضريبية
                </Link>
                <ArrowRight size={12} />
                <span className="text-emerald-600">إنشاء فاتورة جديدة</span>
              </div>
              <h1 className="text-xl font-black text-gray-900">إنشاء فاتورة ضريبية</h1>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-black text-emerald-700">متوافق مع ZATCA</span>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/20">
              <span className="text-xs font-black">رقم الفاتورة: {invoiceNumber}</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 p-5 shadow-lg shadow-slate-500/20">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><Hash size={22} /></div>
                <span className="text-[10px] font-black text-white/70 bg-white/10 px-2 py-0.5 rounded-full">جديدة</span>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">رقم الفاتورة</p>
                <p className="text-2xl font-black text-white mt-1">{invoiceNumber}</p>
                <p className="text-white/60 text-[10px] font-bold mt-1">فاتورة ضريبية إلكترونية</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 shadow-lg shadow-emerald-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><Receipt size={22} /></div>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">إجمالي قبل الضريبة</p>
                <p className="text-2xl font-black text-white mt-1">
                  {totals.totalBeforeVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-sm text-white/70 mr-1">ريال</span>
                </p>
                <p className="text-white/60 text-[10px] font-bold mt-1">المبلغ الخاضع للضريبة</p>
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
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">ضريبة القيمة المضافة</p>
                <p className="text-2xl font-black text-white mt-1">
                  {totals.totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-sm text-white/70 mr-1">ريال</span>
                </p>
                <p className="text-white/60 text-[10px] font-bold mt-1">VAT Amount</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-5 shadow-lg shadow-violet-500/30">
              <div className="flex items-start justify-between">
                <div className="text-white/90"><CircleDollarSign size={22} /></div>
              </div>
              <div className="mt-4">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">الإجمالي النهائي</p>
                <p className="text-2xl font-black text-white mt-1">
                  {totals.totalWithVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-sm text-white/70 mr-1">ريال</span>
                </p>
                <p className="text-white/60 text-[10px] font-bold mt-1">شامل الضريبة</p>
              </div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Building2 className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black">بيانات العميل</h3>
                  <p className="text-blue-200 text-xs font-bold">اختر العميل المستهدف للفاتورة</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={clientId}
                  onChange={(e) => setClientId(parseInt(e.target.value))}
                  className="w-full h-14 pr-12 pl-4 rounded-xl bg-gray-50 border-2 border-transparent text-sm font-bold focus:border-blue-500/30 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value={0}>-- اختر عميل من القائمة --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name || c.customer_name || c.name} {c.vat_number ? `(${c.vat_number})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
              
              {selectedCustomer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Building2 size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">اسم الشركة</span>
                      <span className="text-sm font-black text-gray-800">
                        {selectedCustomer.company_name || selectedCustomer.customer_name || selectedCustomer.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <CreditCard size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">الرقم الضريبي</span>
                      <span className="text-sm font-black text-emerald-700">{selectedCustomer.vat_number || 'غير متوفر'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <MapPin size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">العنوان</span>
                      <span className="text-sm font-bold text-gray-700 truncate block max-w-[200px]">{selectedCustomer.address || 'غير متوفر'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center">
                      <Phone size={18} className="text-violet-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">الهاتف</span>
                      <span className="text-sm font-bold text-gray-700">{selectedCustomer.phone || 'غير متوفر'}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <CalendarDays className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black">تواريخ الفاتورة</h3>
                  <p className="text-teal-200 text-xs font-bold">حدد تواريخ الإصدار والاستحقاق</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-2">تاريخ الإصدار</label>
                <div className="relative">
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border-2 border-transparent text-sm font-bold focus:border-teal-500/30 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-2">تاريخ الاستحقاق</label>
                <div className="relative">
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border-2 border-transparent text-sm font-bold focus:border-teal-500/30 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                <div className="flex items-center gap-2 text-xs font-bold text-teal-700">
                  <Sparkles size={14} />
                  <span>شهر الفاتورة: {invoiceMonth}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShoppingCart className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black">تفاصيل الخدمات والمنتجات</h3>
                  <p className="text-emerald-200 text-xs font-bold">{items.length} عنصر في الفاتورة</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all font-bold text-xs border border-white/20"
              >
                <Plus size={16} />
                إضافة خدمة
              </motion.button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right w-12">#</th>
                  <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-right min-w-[200px]">اسم الخدمة</th>
                  <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center w-20">الكمية</th>
                  <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center w-28">سعر الوحدة</th>
                  <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center w-32">الإجمالي (شامل)</th>
                  <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center w-32">من تاريخ</th>
                  <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center w-32">إلى تاريخ</th>
                  <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center w-24">الضريبة</th>
                  <th className="px-4 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center w-16">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item, index) => (
                  <motion.tr 
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * index }}
                    className="hover:bg-emerald-50/30 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-xs font-black text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                        placeholder="اسم الخدمة أو المنتج..."
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent text-sm font-bold focus:border-emerald-500/30 focus:bg-white outline-none transition-all"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent text-sm font-black text-center focus:border-emerald-500/30 focus:bg-white outline-none transition-all"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.unit_price ? Number(item.unit_price.toFixed(2)) : ''}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 rounded-xl bg-blue-50 border-2 border-blue-100 text-sm font-black text-center text-blue-700 focus:border-blue-300 focus:bg-white outline-none transition-all"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.total_with_vat || ''}
                        onChange={(e) => handleItemChange(index, 'total_with_vat', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-100 text-sm font-black text-center text-emerald-700 focus:border-emerald-300 focus:bg-white outline-none transition-all"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={item.period_from}
                        onChange={(e) => handleItemChange(index, 'period_from', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent text-xs font-bold focus:border-emerald-500/30 focus:bg-white outline-none transition-all"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={item.period_to}
                        onChange={(e) => handleItemChange(index, 'period_to', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border-2 border-transparent text-xs font-bold focus:border-emerald-500/30 focus:bg-white outline-none transition-all"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-center">
                        <span className="text-xs font-black text-amber-700">{item.vat_amount.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-0"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500">
              <span>إجمالي العناصر: {items.length}</span>
              <button
                type="button"
                onClick={addItem}
                className="text-emerald-600 hover:text-emerald-700 font-black flex items-center gap-1"
              >
                <Plus size={14} />
                إضافة عنصر آخر
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Percent className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-black">التعديلات والخصومات</h3>
                    <p className="text-amber-200 text-xs font-bold">إضافة خصومات أو رسوم إضافية</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={addAdjustment}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all font-bold text-xs border border-white/20"
                >
                  <Plus size={16} />
                  إضافة تعديل
                </motion.button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {adjustments.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Percent size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-400 font-bold text-sm">لا توجد تعديلات أو خصومات</p>
                  <p className="text-gray-300 text-xs">اضغط على "إضافة تعديل" لإضافة خصم أو رسوم</p>
                </div>
              ) : (
                adjustments.map((adj, index) => (
                  <motion.div
                    key={adj.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col md:flex-row gap-3">
                        <input
                          type="text"
                          value={adj.title}
                          onChange={(e) => handleAdjustmentChange(index, 'title', e.target.value)}
                          placeholder="وصف التعديل..."
                          className="flex-1 px-4 py-2.5 rounded-xl bg-white border-2 border-transparent text-sm font-bold focus:border-amber-300 outline-none transition-all"
                        />
                        <select
                          value={adj.type}
                          onChange={(e) => handleAdjustmentChange(index, 'type', e.target.value)}
                          className="w-full md:w-32 px-3 py-2.5 rounded-xl bg-white border-2 border-transparent text-sm font-black focus:border-amber-300 outline-none transition-all"
                        >
                          <option value="discount">خصم (-)</option>
                          <option value="addition">إضافة (+)</option>
                        </select>
                        <div className="relative w-full md:w-36">
                          <input
                            type="number"
                            value={adj.amount || ''}
                            onChange={(e) => handleAdjustmentChange(index, 'amount', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-transparent text-sm font-black text-amber-700 focus:border-amber-300 outline-none transition-all"
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">ريال</span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => removeAdjustment(index)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-amber-200/50">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={adj.is_taxable}
                            onChange={(e) => handleAdjustmentChange(index, 'is_taxable', e.target.checked)}
                            className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-[11px] font-black text-gray-600">خاضع للضريبة (15%)</span>
                        </label>

                        {adj.is_taxable && (
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200">
                            <span className="text-[10px] font-bold text-amber-700">الطريقة:</span>
                            <button
                              type="button"
                              onClick={() => handleAdjustmentChange(index, 'is_inclusive', true)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${adj.is_inclusive ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-600 hover:bg-amber-50'}`}
                            >
                              شاملة
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustmentChange(index, 'is_inclusive', false)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${!adj.is_inclusive ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-600 hover:bg-amber-50'}`}
                            >
                              غير شاملة
                            </button>
                          </div>
                        )}

                        <div className="mr-auto flex items-center gap-4">
                          <span className="text-[11px] font-bold text-gray-500">
                            الضريبة: <span className="text-amber-600 font-black">{adj.vat_amount.toFixed(2)}</span>
                          </span>
                          <span className="text-[11px] font-bold text-gray-500">
                            الإجمالي: <span className="text-emerald-600 font-black">{adj.total_with_vat.toFixed(2)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                <Calculator className="text-emerald-400" size={24} />
              </div>
              <div>
                <h3 className="font-black text-lg">ملخص الحسابات الضريبية</h3>
                <p className="text-slate-400 text-xs font-bold">حساب تلقائي للضريبة</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Receipt size={18} className="text-slate-400" />
                  <span className="text-slate-300 font-bold text-sm">المبلغ قبل الضريبة</span>
                </div>
                <span className="font-mono font-black text-white">
                  {totals.totalBeforeVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-slate-400 mr-1 text-xs">ريال</span>
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <Percent size={18} className="text-amber-400" />
                  <span className="text-amber-200 font-bold text-sm">ضريبة القيمة المضافة (15%)</span>
                </div>
                <span className="font-mono font-black text-amber-400">
                  {totals.totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                  <span className="text-emerald-200 font-black">الإجمالي النهائي</span>
                </div>
                <div className="text-left">
                  <span className="text-3xl font-black text-emerald-400 tracking-tight">
                    {totals.totalWithVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="mr-2 text-sm font-bold text-emerald-300/70">ريال</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <BadgeCheck size={14} className="text-emerald-400" />
                <span>متوافق مع متطلبات هيئة الزكاة والضريبة والجمارك ZATCA</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/sales-invoices">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-bold text-sm"
              >
                <ArrowRight size={18} />
                إلغاء والعودة
              </motion.button>
            </Link>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSave('draft')}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-black transition-all disabled:opacity-50 text-sm shadow-lg shadow-slate-500/20"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
                حفظ كمسودة
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSave('due')}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black transition-all disabled:opacity-50 text-sm shadow-lg shadow-emerald-500/30"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <FileCheck size={18} />}
                حفظ وإصدار الفاتورة
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-emerald-500" />
            <span>نظام الفواتير الضريبية - ZoolSpeed Logistics</span>
          </div>
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
        </div>
      </motion.div>
    </div>
  );
}
