"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
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
  Percent,
  FileCheck,
  Clock,
  LayoutDashboard,
  Receipt,
  Building2,
  Sparkles,
  Hash,
  MapPin,
  Phone,
  CreditCard,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  ShoppingCart,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

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
    is_unit_price_inclusive?: boolean;
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
  const t = useTranslations("newInvoicePage");
  const tc = useTranslations("common");
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

    const [clientId, setClientId] = useState<number>(0);
    const [issueDate, setIssueDate] = useState(today);
    const [dueDate, setDueDate] = useState(defaultDueDate);
    const [invoiceMonth, setInvoiceMonth] = useState(today.slice(0, 7));
    const [calculationMethod, setCalculationMethod] = useState<'total' | 'quantity'>('total');
    
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
        vat_amount: 0,
        is_unit_price_inclusive: false
      }
    ]);


  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const calculateItem = useCallback((item: InvoiceItem, source: 'total' | 'unit_price' | 'quantity_method' = 'total'): InvoiceItem => {
    let totalWithVat = item.total_with_vat;
    let unitPrice = item.unit_price;
    const quantity = item.quantity || 0;
    const isInclusive = item.is_unit_price_inclusive;

    if (source === 'quantity_method') {
      if (isInclusive) {
        totalWithVat = quantity * unitPrice;
        const beforeVat = totalWithVat / 1.15;
        const vatAmount = totalWithVat - beforeVat;
        return {
          ...item,
          before_vat: beforeVat,
          vat_amount: vatAmount,
          total_with_vat: totalWithVat
        };
      } else {
        const beforeVat = quantity * unitPrice;
        const vatAmount = beforeVat * 0.15;
        totalWithVat = beforeVat + vatAmount;
        return {
          ...item,
          before_vat: beforeVat,
          vat_amount: vatAmount,
          total_with_vat: totalWithVat
        };
      }
    }

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

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number | boolean) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value } as InvoiceItem;
      
      let source: 'total' | 'unit_price' | 'quantity_method' = 'total';
      if (calculationMethod === 'quantity') {
        source = 'quantity_method';
      } else {
        source = field === 'unit_price' ? 'unit_price' : 'total';
      }
      
      newItems[index] = calculateItem(newItems[index], source);
      return newItems;
    });
  };

  const handleAdjustmentChange = (index: number, field: keyof Adjustment, value: string | number | boolean) => {
    setAdjustments(prev => {
      const newAdj = [...prev];
      const updatedAdj = { ...newAdj[index], [field]: value };
      
      let vatAmount = 0;
      let totalWithVat = updatedAdj.amount;
      
      if (updatedAdj.is_taxable && updatedAdj.amount > 0) {
        if (updatedAdj.is_inclusive) {
          const beforeVat = updatedAdj.amount / 1.15;
          vatAmount = updatedAdj.amount - beforeVat;
          totalWithVat = updatedAdj.amount;
        } else {
          vatAmount = updatedAdj.amount * 0.15;
          totalWithVat = updatedAdj.amount + vatAmount;
        }
      }
      
      newAdj[index] = {
        ...updatedAdj,
        vat_amount: vatAmount,
        total_with_vat: totalWithVat
      };
      
      return newAdj;
    });
  };

  useEffect(() => {
    setInvoiceMonth(issueDate.slice(0, 7));
  }, [issueDate]);

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
      vat_amount: 0,
      is_unit_price_inclusive: false
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
      showNotification("error", t("error"), t("selectCustomerError"));
      return false;
    }

    const validItems = items.filter(i => i.product_name.trim());
    if (validItems.length === 0) {
      showNotification("error", t("error"), t("addItemError"));
      return false;
    }

    return true;
  };

  const handleSave = async (status: 'due' | 'draft') => {
    if (!validateForm()) return;

    setLoading(true);
    showNotification("loading", t("saving"), t("savingDesc"));

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
        showNotification("success", t("savedSuccess"), data.message);
        setTimeout(() => {
          router.push(`/sales-invoices/${data.invoice_id}`);
        }, 1500);
      } else {
        showNotification("error", t("error"), data.error || "حدث خطأ");
      }
    } catch {
      showNotification("error", t("error"), t("connectionError"));
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
                ? "bg-emerald-600" 
                : notification.type === "error" 
                ? "bg-rose-600" 
                : "bg-blue-600"
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
        className="max-w-[85%] mx-auto px-4 pt-8"
      >
        {/* Main Professional Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          
          {/* Unified Professional Header */}
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
            {/* Background Decorative Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 space-y-8">
              {/* Top Row: Breadcrumbs & Badges */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Link href="/dashboard" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                      <LayoutDashboard size={12} />
                      {t("breadcrumbDashboard")}
                    </Link>
                    <ChevronRight size={10} className="rtl:rotate-180" />
                    <Link href="/sales-invoices" className="hover:text-emerald-400 transition-colors">
                      {t("breadcrumbInvoices")}
                    </Link>
                    <ChevronRight size={10} className="rtl:rotate-180" />
                    <span className="text-emerald-400">{t("breadcrumbNew")}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <FileText className="text-emerald-400" size={24} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">{t("title")}</h1>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span className="text-xs font-black text-emerald-400">{t("zatcaCompliant")}</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-xl backdrop-blur-md">
                    <span className="text-xs font-bold text-slate-300">{t("invoiceNumberLabel")}</span>
                    <span className="text-xs font-black text-white">{invoiceNumber}</span>
                  </div>
                </div>
              </div>

              {/* Summary Cards Grid (Inside Header) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 group hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-slate-700 rounded-lg text-slate-300"><Hash size={16} /></div>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">{t("newBadge")}</span>
                  </div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{t("invoiceNumberLabel").replace(':', '')}</p>
                  <p className="text-xl font-black text-white mt-1">{invoiceNumber}</p>
                  <p className="text-slate-500 text-[9px] font-bold mt-1">{t("electronicTaxInvoice")}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 group hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><Receipt size={16} /></div>
                  </div>
                  <p className="text-emerald-400/70 text-[10px] font-black uppercase tracking-wider">{t("totalBeforeTax")}</p>
                  <p className="text-xl font-black text-white mt-1">
                    {totals.totalBeforeVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-xs text-white/50 mr-1">{tc("sar")}</span>
                  </p>
                  <p className="text-slate-500 text-[9px] font-bold mt-1">{t("taxableAmount")}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 group hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400"><Percent size={16} /></div>
                    <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">15%</span>
                  </div>
                  <p className="text-amber-400/70 text-[10px] font-black uppercase tracking-wider">{t("vatAmount")}</p>
                  <p className="text-xl font-black text-white mt-1">
                    {totals.totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-xs text-white/50 mr-1">{tc("sar")}</span>
                  </p>
                  <p className="text-slate-500 text-[9px] font-bold mt-1">{t("vatAmountLabel")}</p>
                </div>

                <div className="bg-emerald-500 rounded-2xl p-4 shadow-lg shadow-emerald-500/20 group hover:bg-emerald-600 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-white/20 rounded-lg text-white"><CircleDollarSign size={16} /></div>
                  </div>
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">{t("finalTotal")}</p>
                  <p className="text-xl font-black text-white mt-1">
                    {totals.totalWithVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-xs text-white/70 mr-1">{tc("sar")}</span>
                  </p>
                  <p className="text-white/60 text-[9px] font-bold mt-1">{t("inclusiveTax")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Customer Data Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Building2 className="text-blue-600" size={20} />
                  </div>
                    <div>
                      <h3 className="text-gray-900 font-black">{t("customerData")}</h3>
                      <p className="text-black text-xs font-bold">{t("selectCustomerDesc")}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="relative">
                      <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <select
                        value={clientId}
                        onChange={(e) => setClientId(parseInt(e.target.value))}
                        className="w-full h-14 pr-12 pl-4 rounded-xl bg-white border border-gray-200 text-sm font-bold focus:border-blue-500/30 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value={0}>{t("selectCustomerPlaceholder")}</option>
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
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center shadow-sm">
                            <Building2 size={18} className="text-blue-500" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-black uppercase block">{t("companyNameLabel")}</span>
                            <span className="text-sm font-black text-gray-800">
                              {selectedCustomer.company_name || selectedCustomer.customer_name || selectedCustomer.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center shadow-sm">
                            <CreditCard size={18} className="text-emerald-500" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-black uppercase block">{t("vatNumberLabel")}</span>
                            <span className="text-sm font-black text-emerald-600">{selectedCustomer.vat_number || tc("notSpecified")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shadow-sm">
                            <MapPin size={18} className="text-amber-500" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-black uppercase block">{t("addressLabel")}</span>
                            <span className="text-sm font-bold text-gray-600 truncate block max-w-[200px]">{selectedCustomer.address || tc("notSpecified")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center shadow-sm">
                            <Phone size={18} className="text-violet-500" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-black uppercase block">{t("phoneLabel")}</span>
                            <span className="text-sm font-bold text-gray-600">{selectedCustomer.phone || tc("notSpecified")}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Dates Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <CalendarDays className="text-teal-600" size={20} />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-black">{t("invoiceDates")}</h3>
                      <p className="text-black text-xs font-bold">{t("datesDesc")}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div>
                      <label className="block text-[10px] font-black text-black uppercase mb-2">{t("issueDateLabel")}</label>
                      <div className="relative">
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="date"
                          value={issueDate}
                          onChange={(e) => setIssueDate(e.target.value)}
                          className="w-full h-12 pr-12 pl-4 rounded-xl bg-white border border-gray-200 text-sm font-bold focus:border-teal-500/30 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-black uppercase mb-2">{t("dueDateLabel")}</label>
                      <div className="relative">
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full h-12 pr-12 pl-4 rounded-xl bg-white border border-gray-200 text-sm font-bold focus:border-teal-500/30 outline-none transition-all"
                        />
                      </div>
                    </div>
                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 flex items-center gap-2">
                    <Sparkles size={14} className="text-teal-600" />
                    <span className="text-[11px] font-black text-teal-700">{t("invoiceMonth")} {invoiceMonth}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <ShoppingCart className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-black">{t("servicesDetails")}</h3>
                    <p className="text-gray-400 text-xs font-bold">{t("itemsInInvoice", { count: items.length })}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setCalculationMethod(prev => prev === 'total' ? 'quantity' : 'total')}
                      className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-black text-xs shadow-lg",
                        calculationMethod === 'quantity' 
                          ? "bg-amber-500 text-white shadow-amber-500/20" 
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-gray-200/50"
                      )}
                    >
                      <Calculator size={16} />
                      {t("calculateByQuantity")}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-all font-black text-xs shadow-lg shadow-emerald-500/20"
                    >
                      <Plus size={16} />
                      {t("addService")}
                    </motion.button>
                  </div>
                </div>
              </div>

                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest text-right w-12">{t("itemNo")}</th>
                        <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest text-right min-w-[200px]">{t("serviceName")}</th>
                          <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest text-center w-24">{t("quantity")}</th>
                          <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest text-center w-40">{t("unitPrice")}</th>
                          <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest text-center w-36">{t("totalInclusive")}</th>

                        <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest text-center w-32">{t("fromDate")}</th>
                        <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest text-center w-32">{t("toDate")}</th>
                        <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest text-center w-24">{t("tax")}</th>
                        <th className="px-4 py-4 text-[10px] font-black text-black uppercase tracking-widest text-center w-12">{t("delete")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                    {items.map((item, index) => (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="group hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 text-[10px] font-black text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                            placeholder={t("serviceNamePlaceholder")}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm font-bold focus:border-emerald-500/30 outline-none transition-all"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-2 rounded-xl bg-white border border-gray-200 text-sm font-black text-center focus:border-emerald-500/30 outline-none"
                          />
                        </td>
                          <td className="px-4 py-4">
                            {calculationMethod === 'total' ? (
                              <div className="w-full px-2 py-2 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
                                <span className="text-sm font-black text-blue-600">
                                  {item.unit_price ? Number(item.unit_price.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                                </span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <input
                                  type="number"
                                  value={item.unit_price || ''}
                                  onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-2 rounded-xl bg-white border border-blue-200 text-sm font-black text-center text-blue-600 focus:border-blue-400 outline-none"
                                />
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="checkbox"
                                    id={`inclusive-${item.id}`}
                                    checked={item.is_unit_price_inclusive}
                                    onChange={(e) => handleItemChange(index, 'is_unit_price_inclusive', e.target.checked)}
                                    className="h-3 w-3 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                                  />
                                  <label htmlFor={`inclusive-${item.id}`} className="text-[8px] font-black text-gray-500 cursor-pointer uppercase">
                                    {t("isUnitPriceInclusive")}
                                  </label>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {calculationMethod === 'total' ? (
                              <input
                                type="number"
                                value={item.total_with_vat || ''}
                                onChange={(e) => handleItemChange(index, 'total_with_vat', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-sm font-black text-center text-emerald-600 focus:border-emerald-400 outline-none"
                              />
                            ) : (
                              <div className="w-full px-2 py-2 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                                <span className="text-sm font-black text-emerald-600">
                                  {item.total_with_vat ? Number(item.total_with_vat.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                                </span>
                              </div>
                            )}
                          </td>

                        <td className="px-4 py-4">
                          <input
                            type="date"
                            value={item.period_from}
                            onChange={(e) => handleItemChange(index, 'period_from', e.target.value)}
                            className="w-full px-2 py-2 rounded-xl bg-white border border-gray-200 text-[10px] font-bold focus:border-emerald-500/30 outline-none"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="date"
                            value={item.period_to}
                            onChange={(e) => handleItemChange(index, 'period_to', e.target.value)}
                            className="w-full px-2 py-2 rounded-xl bg-white border border-gray-200 text-[10px] font-bold focus:border-emerald-500/30 outline-none"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="w-full py-2 rounded-xl bg-amber-50/50 border border-amber-100 text-center">
                            <span className="text-[11px] font-black text-amber-600">{item.vat_amount.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all mx-auto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
                <div className="flex justify-between items-center px-4">
                  <span className="text-xs font-black text-black">{t("totalItems", { count: items.length })}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Adjustments Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b-2 border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-200">
                        <Percent className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-black text-lg">{t("adjustments")}</h3>
                        <p className="text-black text-xs font-bold">{t("adjustmentsDesc")}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={addAdjustment}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 transition-all font-black text-sm shadow-lg shadow-amber-200"
                    >
                      <Plus size={18} />
                      {t("addAdjustment")}
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    {adjustments.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
                        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Percent size={32} className="text-gray-300" />
                        </div>
                        <p className="text-black font-black text-sm">{t("noAdjustments")}</p>
                        <p className="text-black text-xs mt-1 opacity-60">{t("addAdjustmentDesc")}</p>
                      </div>
                    ) : (
                      adjustments.map((adj, index) => (
                        <motion.div
                          key={adj.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm space-y-6"
                        >
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                              <label className="text-[10px] font-black text-black uppercase tracking-wider block mr-2">{t("adjustmentPlaceholder")}</label>
                              <input
                                type="text"
                                value={adj.title}
                                onChange={(e) => handleAdjustmentChange(index, 'title', e.target.value)}
                                placeholder={t("adjustmentPlaceholder")}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 text-sm font-bold focus:bg-white focus:border-amber-300 outline-none transition-all"
                              />
                            </div>
                            <div className="w-full sm:w-32 space-y-2">
                              <label className="text-[10px] font-black text-black uppercase tracking-wider block mr-2">{t("type")}</label>
                              <select
                                value={adj.type}
                                onChange={(e) => handleAdjustmentChange(index, 'type', e.target.value)}
                                className="w-full h-12 px-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-black focus:bg-white focus:border-amber-300 outline-none transition-all appearance-none cursor-pointer"
                              >
                                <option value="discount">{t("discount")}</option>
                                <option value="addition">{t("addition")}</option>
                              </select>
                            </div>
                            <div className="w-full sm:w-40 space-y-2">
                              <label className="text-[10px] font-black text-black uppercase tracking-wider block mr-2">{t("amount")}</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  value={adj.amount || ''}
                                  onChange={(e) => handleAdjustmentChange(index, 'amount', parseFloat(e.target.value) || 0)}
                                  className="w-full h-12 px-4 rounded-xl bg-amber-50 border border-amber-100 text-sm font-black text-amber-600 focus:bg-white focus:border-amber-300 outline-none transition-all"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-400 font-black uppercase">{tc("sar")}</span>
                              </div>
                            </div>
                            <div className="flex items-end pb-1">
                              <button
                                type="button"
                                onClick={() => removeAdjustment(index)}
                                className="w-12 h-12 flex items-center justify-center rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all shadow-sm"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-6 pt-5 border-t border-gray-100">
                            <div className="flex items-center gap-6">
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={adj.is_taxable}
                                    onChange={(e) => handleAdjustmentChange(index, 'is_taxable', e.target.checked)}
                                    className="peer h-5 w-5 rounded-lg border-gray-300 text-amber-500 focus:ring-amber-500 transition-all"
                                  />
                                </div>
                                <span className="text-xs font-black text-black">{t("taxable")}</span>
                              </label>

                              {adj.is_taxable && (
                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustmentChange(index, 'is_inclusive', true)}
                                    className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", adj.is_inclusive ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-400 hover:text-gray-600')}
                                  >
                                    {t("inclusive")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleAdjustmentChange(index, 'is_inclusive', false)}
                                    className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black transition-all", !adj.is_inclusive ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-400 hover:text-gray-600')}
                                  >
                                    {t("exclusive")}
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-6 bg-gray-50 px-6 py-2.5 rounded-2xl border border-gray-100">
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] font-black text-black/40 uppercase">{t("taxLabel")}</span>
                                <span className="text-xs font-black text-amber-600">{adj.vat_amount.toFixed(2)}</span>
                              </div>
                              <div className="w-px h-6 bg-gray-200" />
                              <div className="flex flex-col items-center">
                                <span className="text-[9px] font-black text-black/40 uppercase">{t("totalLabel")}</span>
                                <span className="text-xs font-black text-emerald-600">{adj.total_with_vat.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

              {/* Tax Summary Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Calculator className="text-slate-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-black">{t("taxSummary")}</h3>
                    <p className="text-gray-400 text-xs font-bold">{t("automaticTax")}</p>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                  {/* Background Glow */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3 text-slate-400">
                        <Receipt size={16} />
                        <span className="text-xs font-bold">{t("amountBeforeTax")}</span>
                      </div>
                      <span className="font-black text-lg">
                        {totals.totalBeforeVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <span className="text-slate-500 text-[10px] mr-1 uppercase">{tc("sar")}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <div className="flex items-center gap-3 text-amber-400">
                        <Percent size={16} />
                        <span className="text-xs font-bold">{t("vat15")}</span>
                      </div>
                      <span className="font-black text-lg text-amber-400">
                        {totals.totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        <span className="text-amber-500/50 text-[10px] mr-1 uppercase">{tc("sar")}</span>
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="p-6 bg-emerald-500/10 rounded-[1.5rem] border border-emerald-500/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <CircleDollarSign size={20} className="text-emerald-400" />
                          </div>
                          <span className="text-emerald-400 font-black text-sm">{t("finalTotal")}</span>
                        </div>
                        <div className="text-left">
                          <span className="text-3xl font-black text-white tracking-tight">
                            {totals.totalWithVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs font-bold text-emerald-500/50 mr-2 uppercase">{tc("sar")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{t("zatcaRequirement")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Actions Section */}
            <div className="pt-10 mt-10 border-t border-gray-100">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                <Link href="/sales-invoices">
                  <motion.button 
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 text-black hover:opacity-70 transition-all font-black text-sm uppercase tracking-widest"
                  >
                    <ArrowRight size={20} className="rtl:rotate-180" />
                    {t("cancelAndReturn")}
                  </motion.button>
                </Link>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSave('draft')}
                    disabled={loading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-slate-800 text-white hover:bg-slate-900 font-black transition-all disabled:opacity-50 text-sm shadow-xl shadow-slate-200"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Clock size={18} />}
                    {t("saveAsDraft")}
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSave('due')}
                    disabled={loading}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-12 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black transition-all disabled:opacity-50 text-sm shadow-xl shadow-emerald-500/20"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <FileCheck size={18} />}
                    {t("saveAndIssue")}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-emerald-500" />
              <span>{t("systemName")}</span>
            </div>
            <span>{t("rightsReserved", { year: new Date().getFullYear() })}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
