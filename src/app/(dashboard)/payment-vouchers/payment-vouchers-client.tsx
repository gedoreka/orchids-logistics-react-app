"use client";

import React, { useState, useEffect, useMemo, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Save, Calendar, User, Building, CreditCard, Landmark,
  DollarSign, FileText, Percent, Calculator, Hash, PlusCircle,
  Search, Edit3, Trash2, Printer, Eye, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, X, ArrowDown, ArrowUp, Building2,
  Banknote, StickyNote, Sparkles, RefreshCw, Download, Target,
  BadgeCheck, Clock, FileCheck, Send, Ban
} from "lucide-react";
import { toast } from "sonner";

interface Account {
  id: number;
  account_code: string;
  account_name: string;
}

interface CostCenter {
  id: number;
  center_code: string;
  center_name: string;
}

interface Voucher {
  id: number;
  voucher_number: string;
  voucher_date: string;
  payee_name: string;
  payee_type: string;
  payee_id: string;
  branch_code: string;
  branch_name: string;
  payment_method: string;
  debit_account_code: string;
  debit_account_name: string;
  debit_cost_center: string;
  credit_account_code: string;
  credit_account_name: string;
  credit_cost_center: string;
  amount: number;
  tax_rate: number;
  tax_value: number;
  total_amount: number;
  currency: string;
  document_number: string;
  document_date: string;
  bank_name: string;
  check_number: string;
  payment_purpose: string;
  description: string;
  notes: string;
  status: string;
  prepared_by: string;
  approved_by: string;
  created_by: string;
  created_at: string;
}

const paymentMethods = [
  { value: "نقدي", label: "نقدي", icon: Banknote },
  { value: "شيك", label: "شيك", icon: FileCheck },
  { value: "تحويل بنكي", label: "تحويل بنكي", icon: Landmark },
  { value: "بطاقة", label: "بطاقة ائتمانية", icon: CreditCard },
];

const payeeTypes = [
  { value: "individual", label: "فرد" },
  { value: "company", label: "شركة" },
  { value: "employee", label: "موظف" },
  { value: "supplier", label: "مورد" },
];

const statusOptions = [
  { value: "draft", label: "مسودة", color: "bg-slate-100 text-slate-600", icon: Clock },
  { value: "pending", label: "قيد المراجعة", color: "bg-amber-100 text-amber-700", icon: Clock },
  { value: "approved", label: "معتمد", color: "bg-emerald-100 text-emerald-700", icon: BadgeCheck },
  { value: "paid", label: "مصروف", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  { value: "cancelled", label: "ملغي", color: "bg-red-100 text-red-700", icon: Ban },
];

function PaymentVouchersContent() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherNumber, setVoucherNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [printVoucher, setPrintVoucher] = useState<Voucher | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const companyId = "1";

  const initialForm = {
    voucher_date: new Date().toISOString().split("T")[0],
    payee_name: "",
    payee_type: "individual",
    payee_id: "",
    branch_code: "",
    branch_name: "",
    payment_method: "نقدي",
    debit_account_code: "",
    debit_account_name: "",
    debit_cost_center: "",
    credit_account_code: "",
    credit_account_name: "",
    credit_cost_center: "",
    amount: "",
    tax_rate: "0",
    tax_value: "0",
    total_amount: "0",
    currency: "SAR",
    document_number: "",
    document_date: "",
    bank_name: "",
    check_number: "",
    payment_purpose: "",
    description: "",
    notes: "",
    status: "draft",
    prepared_by: "المدير",
    approved_by: "",
  };

  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/payment-vouchers/metadata?company_id=${companyId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAccounts(data.accounts || []);
      setCostCenters(data.costCenters || []);
      setVouchers(data.vouchers || []);
      if (!editingId) setVoucherNumber(data.voucherNumber);
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const amount = parseFloat(form.amount) || 0;
    const taxRate = parseFloat(form.tax_rate) || 0;
    const taxValue = amount * (taxRate / 100);
    const total = amount + taxValue;
    setForm(prev => ({
      ...prev,
      tax_value: taxValue.toFixed(2),
      total_amount: total.toFixed(2),
    }));
  }, [form.amount, form.tax_rate]);

  const filteredVouchers = useMemo(() => {
    if (!searchTerm) return vouchers;
    const lower = searchTerm.toLowerCase();
    return vouchers.filter(v =>
      v.voucher_number.toLowerCase().includes(lower) ||
      v.payee_name.toLowerCase().includes(lower) ||
      v.payment_purpose?.toLowerCase().includes(lower)
    );
  }, [vouchers, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.payee_name.trim()) {
      toast.error("يرجى إدخال اسم المستفيد");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/payment-vouchers/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: editingId,
          company_id: companyId,
          voucher_number: voucherNumber,
          created_by: "المدير",
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "فشل حفظ السند");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (voucher: Voucher) => {
    setForm({
      voucher_date: voucher.voucher_date,
      payee_name: voucher.payee_name || "",
      payee_type: voucher.payee_type || "individual",
      payee_id: voucher.payee_id || "",
      branch_code: voucher.branch_code || "",
      branch_name: voucher.branch_name || "",
      payment_method: voucher.payment_method || "نقدي",
      debit_account_code: voucher.debit_account_code || "",
      debit_account_name: voucher.debit_account_name || "",
      debit_cost_center: voucher.debit_cost_center || "",
      credit_account_code: voucher.credit_account_code || "",
      credit_account_name: voucher.credit_account_name || "",
      credit_cost_center: voucher.credit_cost_center || "",
      amount: String(voucher.amount || ""),
      tax_rate: String(voucher.tax_rate || "0"),
      tax_value: String(voucher.tax_value || "0"),
      total_amount: String(voucher.total_amount || "0"),
      currency: voucher.currency || "SAR",
      document_number: voucher.document_number || "",
      document_date: voucher.document_date || "",
      bank_name: voucher.bank_name || "",
      check_number: voucher.check_number || "",
      payment_purpose: voucher.payment_purpose || "",
      description: voucher.description || "",
      notes: voucher.notes || "",
      status: voucher.status || "draft",
      prepared_by: voucher.prepared_by || "",
      approved_by: voucher.approved_by || "",
    });
    setVoucherNumber(voucher.voucher_number);
    setEditingId(voucher.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا السند؟")) return;
    try {
      const res = await fetch(`/api/payment-vouchers/delete?id=${id}&company_id=${companyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("تم حذف السند بنجاح");
        fetchData();
      }
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const handlePrint = (voucher: Voucher) => {
    setPrintVoucher(voucher);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-rose-200 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-500 font-bold">جاري تحميل سندات الصرف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto p-4 md:p-6 space-y-8" dir="rtl">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          @page { size: A4; margin: 20mm; }
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-rose-900 via-rose-800 to-rose-900 p-8 md:p-12 shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-gradient-to-br from-rose-500 to-orange-600 rounded-3xl shadow-2xl shadow-rose-500/30">
              <Wallet className="w-12 h-12 text-white" />
            </div>
            <div className="text-center lg:text-right">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                سندات الصرف
              </h1>
              <p className="text-rose-300 mt-2 text-lg">إدارة المدفوعات والمصروفات المالية</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
              <p className="text-xs text-rose-300 font-bold uppercase tracking-wider">رقم السند الجديد</p>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-orange-300">
                {voucherNumber}
              </p>
            </div>
            <div className="bg-rose-500/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-rose-500/30">
              <p className="text-xs text-rose-200 font-bold uppercase tracking-wider">إجمالي السندات</p>
              <p className="text-3xl font-black text-rose-300">{vouchers.length}</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
          <span className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30 text-blue-200 font-bold">
            <User size={18} />
            المسؤول: المدير
          </span>
          <span className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30 text-purple-200 font-bold">
            <Calendar size={18} />
            {new Date().toLocaleDateString("ar-SA")}
          </span>
        </div>
      </motion.div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <button
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 ${
            showForm
              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
              : "bg-gradient-to-r from-rose-600 to-orange-600 text-white hover:shadow-rose-500/30"
          }`}
        >
          {showForm ? <X size={24} /> : <PlusCircle size={24} />}
          {showForm ? "إغلاق النموذج" : "إضافة سند صرف جديد"}
        </button>

        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="البحث برقم السند أو اسم المستفيد..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pr-12 pl-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 font-bold focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-[30px] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-orange-600 p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        {editingId ? "تعديل سند الصرف" : "إضافة سند صرف جديد"}
                      </h2>
                      <p className="text-rose-200 font-bold">تسجيل مدفوعات ومصروفات</p>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
                    <span className="text-white text-xl font-black">{voucherNumber}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                {/* Basic Info */}
                <div className="bg-gradient-to-r from-slate-50 to-rose-50 rounded-2xl p-6 border-r-4 border-rose-500">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-rose-500" />
                    المعلومات الأساسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">رقم السند</label>
                      <input type="text" value={voucherNumber} readOnly className="w-full h-12 px-4 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">تاريخ الصرف *</label>
                      <input type="date" value={form.voucher_date} onChange={(e) => setForm({ ...form, voucher_date: e.target.value })} required className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">نوع المستفيد</label>
                      <select value={form.payee_type} onChange={(e) => setForm({ ...form, payee_type: e.target.value })} className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none">
                        {payeeTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">حالة السند</label>
                      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none">
                        {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">اسم المستفيد *</label>
                      <input type="text" value={form.payee_name} onChange={(e) => setForm({ ...form, payee_name: e.target.value })} placeholder="أدخل اسم المستفيد" required className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">رقم هوية المستفيد</label>
                      <input type="text" value={form.payee_id} onChange={(e) => setForm({ ...form, payee_id: e.target.value })} placeholder="رقم الهوية/السجل التجاري" className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none" />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl p-6 border-r-4 border-purple-500">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    طريقة الدفع والفرع
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">طريقة الصرف</label>
                      <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none">
                        {paymentMethods.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">رمز الفرع</label>
                      <input type="text" value={form.branch_code} onChange={(e) => setForm({ ...form, branch_code: e.target.value })} placeholder="رمز الفرع" className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-black text-slate-700 mb-2">اسم الفرع</label>
                      <input type="text" value={form.branch_name} onChange={(e) => setForm({ ...form, branch_name: e.target.value })} placeholder="اسم الفرع" className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none" />
                    </div>
                  </div>
                  {(form.payment_method === "شيك" || form.payment_method === "تحويل بنكي") && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-black text-slate-700 mb-2">اسم البنك</label>
                        <input type="text" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="اسم البنك" className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none" />
                      </div>
                      {form.payment_method === "شيك" && (
                        <div>
                          <label className="block text-sm font-black text-slate-700 mb-2">رقم الشيك</label>
                          <input type="text" value={form.check_number} onChange={(e) => setForm({ ...form, check_number: e.target.value })} placeholder="رقم الشيك" className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Accounts */}
                <div className="bg-gradient-to-r from-slate-50 to-amber-50 rounded-2xl p-6 border-r-4 border-amber-500">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <Landmark className="w-5 h-5 text-amber-500" />
                    معلومات الحسابات
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2"><ArrowDown className="inline w-4 h-4 ml-1 text-red-400" />حساب مدين</label>
                      <select value={form.debit_account_code} onChange={(e) => setForm({ ...form, debit_account_code: e.target.value })} className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none">
                        <option value="">-- اختر الحساب --</option>
                        {accounts.map(a => <option key={a.id} value={a.account_code}>{a.account_code} - {a.account_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">مركز تكلفة مدين</label>
                      <select value={form.debit_cost_center} onChange={(e) => setForm({ ...form, debit_cost_center: e.target.value })} className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none">
                        <option value="">-- اختر --</option>
                        {costCenters.map(c => <option key={c.id} value={c.center_code}>{c.center_code} - {c.center_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2"><ArrowUp className="inline w-4 h-4 ml-1 text-green-400" />حساب دائن</label>
                      <select value={form.credit_account_code} onChange={(e) => setForm({ ...form, credit_account_code: e.target.value })} className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none">
                        <option value="">-- اختر الحساب --</option>
                        {accounts.map(a => <option key={a.id} value={a.account_code}>{a.account_code} - {a.account_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">مركز تكلفة دائن</label>
                      <select value={form.credit_cost_center} onChange={(e) => setForm({ ...form, credit_cost_center: e.target.value })} className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none">
                        <option value="">-- اختر --</option>
                        {costCenters.map(c => <option key={c.id} value={c.center_code}>{c.center_code} - {c.center_name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Financial */}
                <div className="bg-gradient-to-r from-slate-50 to-rose-50 rounded-2xl p-6 border-r-4 border-rose-600">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-rose-600" />
                    المعلومات المالية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">المبلغ *</label>
                      <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">نسبة الضريبة %</label>
                      <input type="number" step="0.01" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} placeholder="0" className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">قيمة الضريبة</label>
                      <input type="text" value={form.tax_value} readOnly className="w-full h-12 px-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-700 font-bold cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">صافي المبلغ</label>
                      <input type="text" value={form.total_amount} readOnly className="w-full h-12 px-4 bg-rose-50 border-2 border-rose-200 rounded-xl text-rose-700 font-black cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">العملة</label>
                      <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none">
                        <option value="SAR">ريال سعودي</option>
                        <option value="USD">دولار أمريكي</option>
                        <option value="EUR">يورو</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Purpose & Additional */}
                <div className="bg-gradient-to-r from-slate-50 to-cyan-50 rounded-2xl p-6 border-r-4 border-cyan-500">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <Target className="w-5 h-5 text-cyan-500" />
                    الغرض والتفاصيل
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-black text-slate-700 mb-2">الغرض من الصرف</label>
                      <input type="text" value={form.payment_purpose} onChange={(e) => setForm({ ...form, payment_purpose: e.target.value })} placeholder="سبب الصرف..." className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">رقم المستند</label>
                      <input type="text" value={form.document_number} onChange={(e) => setForm({ ...form, document_number: e.target.value })} placeholder="رقم المستند" className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold focus:border-rose-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">الوصف</label>
                      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="وصف السند..." className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium focus:border-rose-500 outline-none resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">ملاحظات</label>
                      <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="ملاحظات إضافية..." className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl font-medium focus:border-rose-500 outline-none resize-none" />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <p className="text-sm text-slate-500">أعد بواسطة: <span className="font-bold text-rose-600">{form.prepared_by}</span></p>
                  <div className="flex gap-4">
                    {editingId && <button type="button" onClick={resetForm} className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-black transition-all">إلغاء</button>}
                    <button type="submit" disabled={submitting} className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${submitting ? "bg-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-rose-600 to-orange-600 hover:shadow-rose-500/30 hover:-translate-y-1"}`}>
                      {submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                      {editingId ? "حفظ التعديلات" : "حفظ السند"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vouchers List */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-[30px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 via-rose-900 to-slate-800 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl"><Wallet className="w-8 h-8 text-white" /></div>
              <div>
                <h2 className="text-2xl font-black text-white">سجل سندات الصرف</h2>
                <p className="text-slate-400 font-bold">جميع المدفوعات والمصروفات</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-rose-500/20 text-rose-300 px-5 py-2.5 rounded-xl border border-rose-500/30 font-bold">{filteredVouchers.length} سند</span>
              <button onClick={fetchData} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"><RefreshCw className="w-5 h-5 text-white" /></button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-100">
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase">رقم السند</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase">التاريخ</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase">المستفيد</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase">طريقة الدفع</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase">الحالة</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase">المبلغ</th>
                <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredVouchers.length > 0 ? filteredVouchers.map((v, idx) => {
                const statusInfo = getStatusInfo(v.status);
                return (
                  <React.Fragment key={v.id}>
                    <motion.tr initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}>
                      <td className="px-6 py-5"><span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100 text-sm font-black text-rose-700">{v.voucher_number}</span></td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">{v.voucher_date}</td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-800">{v.payee_name}</td>
                      <td className="px-6 py-5"><span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 text-xs font-bold text-purple-700">{v.payment_method}</span></td>
                      <td className="px-6 py-5"><span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${statusInfo.color}`}><statusInfo.icon size={14} />{statusInfo.label}</span></td>
                      <td className="px-6 py-5"><span className="text-lg font-black text-rose-600">{Number(v.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} <small className="text-[10px] opacity-70">{v.currency}</small></span></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); handleEdit(v); }} className="p-2.5 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors" title="تعديل"><Edit3 size={18} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handlePrint(v); }} className="p-2.5 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors" title="طباعة"><Printer size={18} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }} className="p-2.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors" title="حذف"><Trash2 size={18} /></button>
                          <button className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">{expandedId === v.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
                        </div>
                      </td>
                    </motion.tr>
                    <AnimatePresence>
                      {expandedId === v.id && (
                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td colSpan={7} className="bg-slate-50/50 px-8 py-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div><p className="text-xs font-bold text-slate-400 uppercase mb-1">الغرض</p><p className="text-sm font-bold text-slate-700">{v.payment_purpose || "---"}</p></div>
                              <div><p className="text-xs font-bold text-slate-400 uppercase mb-1">رقم المستند</p><p className="text-sm font-bold text-slate-700">{v.document_number || "---"}</p></div>
                              <div><p className="text-xs font-bold text-slate-400 uppercase mb-1">البنك</p><p className="text-sm font-bold text-slate-700">{v.bank_name || "---"}</p></div>
                              <div><p className="text-xs font-bold text-slate-400 uppercase mb-1">نسبة الضريبة</p><p className="text-sm font-bold text-slate-700">{v.tax_rate}%</p></div>
                              <div className="md:col-span-2"><p className="text-xs font-bold text-slate-400 uppercase mb-1">الوصف</p><p className="text-sm text-slate-600">{v.description || "---"}</p></div>
                              <div className="md:col-span-2"><p className="text-xs font-bold text-slate-400 uppercase mb-1">ملاحظات</p><p className="text-sm text-slate-600">{v.notes || "---"}</p></div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              }) : (
                <tr><td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center"><Wallet size={36} className="text-slate-300" /></div>
                    <p className="text-slate-400 font-bold text-lg">لا توجد سندات صرف</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Print Area */}
      {printVoucher && (
        <div className="print-area fixed inset-0 bg-white z-[200] p-8 hidden print:block" ref={printRef}>
          <div className="max-w-4xl mx-auto border-2 border-slate-300 rounded-lg p-8">
            <div className="text-center border-b-2 pb-6 mb-6">
              <h1 className="text-3xl font-black text-slate-800">سند صرف</h1>
              <p className="text-lg text-slate-500">Payment Voucher</p>
              <div className="flex justify-between mt-4">
                <div><span className="font-bold">رقم السند:</span> {printVoucher.voucher_number}</div>
                <div><span className="font-bold">التاريخ:</span> {printVoucher.voucher_date}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div><span className="font-bold">المستفيد:</span> {printVoucher.payee_name}</div>
              <div><span className="font-bold">طريقة الدفع:</span> {printVoucher.payment_method}</div>
              <div><span className="font-bold">المبلغ:</span> {Number(printVoucher.amount).toLocaleString()} {printVoucher.currency}</div>
              <div><span className="font-bold">الصافي:</span> {Number(printVoucher.total_amount).toLocaleString()} {printVoucher.currency}</div>
            </div>
            <div className="mb-6"><span className="font-bold">الغرض:</span> {printVoucher.payment_purpose || "---"}</div>
            <div className="mb-6"><span className="font-bold">الوصف:</span> {printVoucher.description || "---"}</div>
            <div className="flex justify-between mt-12 pt-6 border-t">
              <div className="text-center"><div className="w-32 border-b border-slate-400 mb-2"></div><p>المُعد</p></div>
              <div className="text-center"><div className="w-32 border-b border-slate-400 mb-2"></div><p>المُعتمد</p></div>
              <div className="text-center"><div className="w-32 border-b border-slate-400 mb-2"></div><p>المستلم</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowSuccess(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 100 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-gradient-to-br from-rose-600 to-orange-700 text-white p-10 rounded-[30px] shadow-2xl text-center min-w-[400px]">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce"><CheckCircle className="w-14 h-14 text-white" /></div>
              <h2 className="text-3xl font-black mb-4">تم الحفظ بنجاح!</h2>
              <p className="text-lg opacity-90 mb-8">تم تسجيل سند الصرف بنجاح في النظام.</p>
              <button onClick={() => setShowSuccess(false)} className="bg-white text-rose-700 px-10 py-3 rounded-2xl font-black text-lg hover:bg-rose-50 transition-colors">متابعة</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6">
        <div className="flex items-center gap-2"><Sparkles size={12} className="text-rose-500" /><span>نظام ZoolSpeed Logistics</span></div>
        <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}

export function PaymentVouchersClient() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
      <PaymentVouchersContent />
    </Suspense>
  );
}
