"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt, Save, Calendar, User, Building, CreditCard, Landmark,
  DollarSign, FileText, Percent, Calculator, Hash, PlusCircle,
  Search, Edit3, Trash2, Printer, Mail, Eye, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, X, ArrowDown, ArrowUp, Building2,
  Banknote, StickyNote, Sparkles, Filter, Download, RefreshCw
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
  receipt_number: string;
  receipt_date: string;
  received_from: string;
  branch_code: string;
  branch_name: string;
  payment_method: string;
  account_name: string;
  debit_account_code: string;
  debit_cost_center: string;
  credit_account_code: string;
  credit_cost_center: string;
  amount: number;
  tax_rate: number;
  tax_value: number;
  total_amount: number;
  document_number: string;
  bank_name: string;
  document_date: string;
  description: string;
  notes: string;
  created_by: string;
  created_at: string;
}

const paymentMethods = [
  { value: "نقدي", label: "نقدي", icon: Banknote },
  { value: "شبكة", label: "شبكة", icon: CreditCard },
  { value: "الإيداع", label: "الإيداع", icon: Building2 },
  { value: "التحويل الإلكتروني", label: "تحويل إلكتروني", icon: Landmark },
];

function ReceiptVouchersContent() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const companyId = "1";

  const initialForm = {
    receipt_date: new Date().toISOString().split("T")[0],
    received_from: "",
    branch_code: "",
    branch_name: "",
    payment_method: "نقدي",
    account_name: "",
    debit_account_code: "",
    debit_cost_center: "",
    credit_account_code: "",
    credit_cost_center: "",
    amount: "",
    tax_rate: "15",
    tax_value: "0",
    total_amount: "0",
    document_number: "",
    bank_name: "",
    document_date: "",
    description: "",
    notes: "",
  };

  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/receipt-vouchers/metadata?company_id=${companyId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAccounts(data.accounts || []);
      setCostCenters(data.costCenters || []);
      setVouchers(data.vouchers || []);
      if (!editingId) setReceiptNumber(data.receiptNumber);
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
      v.receipt_number.toLowerCase().includes(lower) ||
      v.received_from.toLowerCase().includes(lower) ||
      v.description?.toLowerCase().includes(lower)
    );
  }, [vouchers, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/receipt-vouchers/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: editingId,
          company_id: companyId,
          receipt_number: receiptNumber,
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
      receipt_date: voucher.receipt_date,
      received_from: voucher.received_from || "",
      branch_code: voucher.branch_code || "",
      branch_name: voucher.branch_name || "",
      payment_method: voucher.payment_method || "نقدي",
      account_name: voucher.account_name || "",
      debit_account_code: voucher.debit_account_code || "",
      debit_cost_center: voucher.debit_cost_center || "",
      credit_account_code: voucher.credit_account_code || "",
      credit_cost_center: voucher.credit_cost_center || "",
      amount: String(voucher.amount || ""),
      tax_rate: String(voucher.tax_rate || "15"),
      tax_value: String(voucher.tax_value || "0"),
      total_amount: String(voucher.total_amount || "0"),
      document_number: voucher.document_number || "",
      bank_name: voucher.bank_name || "",
      document_date: voucher.document_date || "",
      description: voucher.description || "",
      notes: voucher.notes || "",
    });
    setReceiptNumber(voucher.receipt_number);
    setEditingId(voucher.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا السند؟")) return;
    try {
      const res = await fetch(`/api/receipt-vouchers/delete?id=${id}&company_id=${companyId}`, {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-pulse" />
            <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-slate-500 font-bold">جاري تحميل سندات القبض...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto p-4 md:p-6 space-y-8" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/30">
              <Receipt className="w-12 h-12 text-white" />
            </div>
            <div className="text-center lg:text-right">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                سندات القبض
              </h1>
              <p className="text-slate-400 mt-2 text-lg">إدارة إيصالات الاستلام المالية</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">رقم السند الجديد</p>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {receiptNumber}
              </p>
            </div>
            <div className="bg-emerald-500/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-emerald-500/30">
              <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">إجمالي السندات</p>
              <p className="text-3xl font-black text-emerald-400">{vouchers.length}</p>
            </div>
          </div>
        </div>

          <div className="relative z-10 flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
            <span className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-500/30 text-blue-300 font-bold">
              <User size={18} />
              المسؤول: المدير
            </span>
            <span className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30 text-purple-300 font-bold">
              <Calendar size={18} />
              {new Date().toLocaleDateString("en-GB")}
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
              : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-emerald-500/30"
          }`}
        >
          {showForm ? <X size={24} /> : <PlusCircle size={24} />}
          {showForm ? "إغلاق النموذج" : "إضافة سند قبض جديد"}
        </button>

        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="البحث برقم السند أو اسم المستلم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pr-12 pl-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
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
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Receipt className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white">
                        {editingId ? "تعديل سند القبض" : "إضافة سند قبض جديد"}
                      </h2>
                      <p className="text-emerald-200 font-bold">تسجيل إيصال استلام مالي</p>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20">
                    <span className="text-white text-xl font-black">{receiptNumber}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                {/* Basic Info Section */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6 border-r-4 border-blue-500">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    المعلومات الأساسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">
                        <Hash className="inline w-4 h-4 ml-1 text-slate-400" />
                        رقم السند
                      </label>
                      <input
                        type="text"
                        value={receiptNumber}
                        readOnly
                        className="w-full h-12 px-4 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">
                        <Calendar className="inline w-4 h-4 ml-1 text-slate-400" />
                        تاريخ الاستلام
                      </label>
                      <input
                        type="date"
                        value={form.receipt_date}
                        onChange={(e) => setForm({ ...form, receipt_date: e.target.value })}
                        required
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">
                        <User className="inline w-4 h-4 ml-1 text-slate-400" />
                        مستلم من
                      </label>
                      <input
                        type="text"
                        value={form.received_from}
                        onChange={(e) => setForm({ ...form, received_from: e.target.value })}
                        placeholder="اسم الشخص أو الجهة"
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment & Branch Section */}
                <div className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-2xl p-6 border-r-4 border-purple-500">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-purple-500" />
                    طريقة الدفع والفرع
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">طريقة الاستلام</label>
                      <select
                        value={form.payment_method}
                        onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      >
                        {paymentMethods.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">رمز الفرع</label>
                      <input
                        type="text"
                        value={form.branch_code}
                        onChange={(e) => setForm({ ...form, branch_code: e.target.value })}
                        placeholder="رمز الفرع"
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-black text-slate-700 mb-2">اسم الفرع</label>
                      <input
                        type="text"
                        value={form.branch_name}
                        onChange={(e) => setForm({ ...form, branch_name: e.target.value })}
                        placeholder="اسم الفرع"
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Accounts Section */}
                <div className="bg-gradient-to-r from-slate-50 to-amber-50 rounded-2xl p-6 border-r-4 border-amber-500">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <Landmark className="w-5 h-5 text-amber-500" />
                    معلومات الحسابات
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">
                        <ArrowDown className="inline w-4 h-4 ml-1 text-red-400" />
                        حساب مدين
                      </label>
                      <select
                        value={form.debit_account_code}
                        onChange={(e) => setForm({ ...form, debit_account_code: e.target.value })}
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      >
                        <option value="">-- اختر الحساب --</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.account_code}>{a.account_code} - {a.account_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">مركز تكلفة مدين</label>
                      <select
                        value={form.debit_cost_center}
                        onChange={(e) => setForm({ ...form, debit_cost_center: e.target.value })}
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      >
                        <option value="">-- اختر مركز التكلفة --</option>
                        {costCenters.map((c) => (
                          <option key={c.id} value={c.center_code}>{c.center_code} - {c.center_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">
                        <ArrowUp className="inline w-4 h-4 ml-1 text-green-400" />
                        حساب دائن
                      </label>
                      <select
                        value={form.credit_account_code}
                        onChange={(e) => setForm({ ...form, credit_account_code: e.target.value })}
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      >
                        <option value="">-- اختر الحساب --</option>
                        {accounts.map((a) => (
                          <option key={a.id} value={a.account_code}>{a.account_code} - {a.account_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">مركز تكلفة دائن</label>
                      <select
                        value={form.credit_cost_center}
                        onChange={(e) => setForm({ ...form, credit_cost_center: e.target.value })}
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      >
                        <option value="">-- اختر مركز التكلفة --</option>
                        {costCenters.map((c) => (
                          <option key={c.id} value={c.center_code}>{c.center_code} - {c.center_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Financial Section */}
                <div className="bg-gradient-to-r from-slate-50 to-emerald-50 rounded-2xl p-6 border-r-4 border-emerald-500">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-emerald-500" />
                    المعلومات المالية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">
                        <DollarSign className="inline w-4 h-4 ml-1 text-slate-400" />
                        المبلغ
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        placeholder="0.00"
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">
                        <Percent className="inline w-4 h-4 ml-1 text-slate-400" />
                        نسبة الضريبة %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={form.tax_rate}
                        onChange={(e) => setForm({ ...form, tax_rate: e.target.value })}
                        placeholder="15"
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">قيمة الضريبة</label>
                      <input
                        type="text"
                        value={form.tax_value}
                        readOnly
                        className="w-full h-12 px-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-700 font-bold cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">صافي المبلغ</label>
                      <input
                        type="text"
                        value={form.total_amount}
                        readOnly
                        className="w-full h-12 px-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 font-black cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info Section */}
                <div className="bg-gradient-to-r from-slate-50 to-cyan-50 rounded-2xl p-6 border-r-4 border-cyan-500">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                    <StickyNote className="w-5 h-5 text-cyan-500" />
                    معلومات إضافية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">رقم المستند</label>
                      <input
                        type="text"
                        value={form.document_number}
                        onChange={(e) => setForm({ ...form, document_number: e.target.value })}
                        placeholder="رقم المستند"
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">اسم البنك</label>
                      <input
                        type="text"
                        value={form.bank_name}
                        onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                        placeholder="اسم البنك"
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">تاريخ المستند</label>
                      <input
                        type="date"
                        value={form.document_date}
                        onChange={(e) => setForm({ ...form, document_date: e.target.value })}
                        className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">الوصف</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        rows={3}
                        placeholder="وصف السند..."
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2">ملاحظات</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={3}
                        placeholder="ملاحظات إضافية..."
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <p className="text-sm text-slate-500">
                    تم بواسطة: <span className="font-bold text-emerald-600">المدير</span>
                  </p>
                  <div className="flex gap-4">
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-8 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-black transition-all"
                      >
                        إلغاء التعديل
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 ${
                        submitting
                          ? "bg-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/30 hover:-translate-y-1"
                      }`}
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-[30px] shadow-2xl border border-slate-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">سجل سندات القبض</h2>
                <p className="text-slate-400 font-bold">جميع إيصالات الاستلام المحفوظة</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500/20 text-emerald-400 px-5 py-2.5 rounded-xl border border-emerald-500/30 font-bold">
                {filteredVouchers.length} سند
              </span>
              <button
                onClick={fetchData}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b-2 border-slate-100">
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase tracking-wider">رقم السند</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase tracking-wider">مستلم من</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase tracking-wider">طريقة الدفع</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase tracking-wider">المبلغ</th>
                <th className="px-6 py-5 text-right text-[11px] font-black text-slate-500 uppercase tracking-wider">الصافي</th>
                <th className="px-6 py-5 text-center text-[11px] font-black text-slate-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map((v, idx) => (
                  <React.Fragment key={v.id}>
                    <motion.tr
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}
                    >
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-sm font-black text-slate-700">
                          {v.receipt_number}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">{v.receipt_date}</td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-800">{v.received_from || "---"}</td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 text-xs font-bold text-purple-700">
                          {v.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-700">
                        {Number(v.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-lg font-black text-emerald-600">
                          {Number(v.total_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(v); }}
                            className="p-2.5 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                            title="تعديل"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            className="p-2.5 rounded-xl bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                            title="طباعة"
                          >
                            <Printer size={18} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }}
                            className="p-2.5 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                            {expandedId === v.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                    <AnimatePresence>
                      {expandedId === v.id && (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <td colSpan={7} className="bg-slate-50/50 px-8 py-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">الفرع</p>
                                <p className="text-sm font-bold text-slate-700">{v.branch_name || "---"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">رقم المستند</p>
                                <p className="text-sm font-bold text-slate-700">{v.document_number || "---"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">البنك</p>
                                <p className="text-sm font-bold text-slate-700">{v.bank_name || "---"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">نسبة الضريبة</p>
                                <p className="text-sm font-bold text-slate-700">{v.tax_rate}%</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">الوصف</p>
                                <p className="text-sm text-slate-600">{v.description || "---"}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">ملاحظات</p>
                                <p className="text-sm text-slate-600">{v.notes || "---"}</p>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center">
                        <Receipt size={36} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold text-lg">لا توجد سندات قبض</p>
                      <p className="text-slate-300">ابدأ بإضافة أول سند قبض من الزر أعلاه</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setShowSuccess(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-10 rounded-[30px] shadow-2xl text-center min-w-[400px]"
            >
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              <h2 className="text-3xl font-black mb-4">تم الحفظ بنجاح!</h2>
              <p className="text-lg opacity-90 mb-8">تم تسجيل سند القبض بنجاح في النظام.</p>
              <button
                onClick={() => setShowSuccess(false)}
                className="bg-white text-emerald-700 px-10 py-3 rounded-2xl font-black text-lg hover:bg-emerald-50 transition-colors"
              >
                متابعة
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6">
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-emerald-500" />
          <span>إصدار آلي من نظام ZoolSpeed Logistics</span>
        </div>
        <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}

export function ReceiptVouchersClient() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>}>
      <ReceiptVouchersContent />
    </Suspense>
  );
}
