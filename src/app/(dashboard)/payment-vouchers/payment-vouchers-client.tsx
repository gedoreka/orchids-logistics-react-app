"use client";

import React, { useState, useEffect, useMemo, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, Save, Calendar, User, Building, CreditCard, Landmark,
  DollarSign, FileText, Percent, Calculator, Hash, PlusCircle,
  Search, Edit3, Trash2, Printer, Eye, ChevronDown, ChevronUp,
  CheckCircle, AlertCircle, X, ArrowDown, ArrowUp, Building2,
  Banknote, StickyNote, Sparkles, RefreshCw, Download, Target,
  BadgeCheck, Clock, FileCheck, Send, Ban, Loader2, Plus, FileSpreadsheet,
  TrendingDown, TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/locale-context";

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
  const t = useTranslations("financialVouchersPage.paymentVouchersPage");
  const tFinancial = useTranslations("financialVouchersPage");
  const tCommon = useTranslations("common");
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
      toast.error(t("notifications.fetchError"));
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
      toast.error(t("notifications.payeeRequired"));
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
      toast.error(error.message || t("notifications.saveFailed"));
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
    if (!confirm(t("notifications.deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/payment-vouchers/delete?id=${id}&company_id=${companyId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(t("notifications.deleteSuccess"));
        fetchData();
      }
    } catch {
      toast.error(t("notifications.deleteFailed"));
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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
      </div>
    );
  }

    return (
      <div className="max-w-[95%] mx-auto p-4 md:p-8 space-y-8">
        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            @page { size: A4; margin: 20mm; }
          }
        `}</style>
  
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x" />
          
          <div className="relative z-10 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="text-center lg:text-right space-y-4">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-2"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span className="text-blue-200 font-black text-[10px] uppercase tracking-widest">{t("subtitle")}</span>
                </motion.div>
                
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight bg-gradient-to-r from-white via-rose-100 to-white bg-clip-text text-transparent">
                  {t("title")}
                </h1>
                <p className="text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
                  {t("description")}
                </p>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                  <button 
                    onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 font-black text-sm rounded-2xl transition-all shadow-xl active:scale-95",
                      showForm ? "bg-white/10 text-white border border-white/20" : "bg-rose-500 text-white hover:bg-rose-600"
                    )}
                  >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? t("cancelForm") : t("addNew")}
                  </button>
                  <button 
                      onClick={fetchData}
                      className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95"
                    >
                    <RefreshCw size={18} className={cn("text-blue-400", loading ? "animate-spin" : "")} />
                    {t("refreshData")}
                  </button>
                </div>
              </div>
  
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 group-hover:scale-110 transition-transform">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <span className="text-rose-300 font-black text-[10px] uppercase tracking-wider">{t("stats.count")}</span>
                  </div>
                  <p className="text-3xl font-black text-white tracking-tight">{vouchers.length}</p>
                  <p className="text-rose-400/60 text-[10px] font-black mt-1">{t("stats.voucherLabel")}</p>
                </motion.div>
  
                <motion.div 
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <span className="text-emerald-300 font-black text-[10px] uppercase tracking-wider">{t("stats.nextNumber")}</span>
                  </div>
                  <p className="text-2xl font-black text-white tracking-tight">{voucherNumber}</p>
                  <p className="text-emerald-400/60 text-[10px] font-black mt-1">{t("stats.sequential")}</p>
                </motion.div>
              </div>
            </div>
  
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                      <div className="p-8 border-b border-white/10 bg-white/5">
                          <div className="flex items-center gap-4">
                              <div className="p-3 bg-rose-500/20 rounded-2xl text-rose-400">
                                  <PlusCircle className="w-8 h-8" />
                              </div>
                              <div>
                                  <h2 className="text-2xl font-black text-white">
                                      {editingId ? t("form.editTitle") : t("form.addTitle")}
                                  </h2>
                                  <p className="text-slate-400 font-bold tracking-wide">{t("form.fillData")}</p>
                              </div>
                          </div>
                      </div>
  
                      <form onSubmit={handleSubmit} className="p-8 space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.date")}</label>
                                  <div className="relative">
                                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input
                                          type="date"
                                          value={form.voucher_date}
                                          onChange={(e) => setForm({ ...form, voucher_date: e.target.value })}
                                          className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-rose-500 outline-none transition-all"
                                          required
                                      />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.payeeType")}</label>
                                  <select 
                                      value={form.payee_type} 
                                      onChange={(e) => setForm({ ...form, payee_type: e.target.value })}
                                      className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-rose-500 outline-none appearance-none"
                                  >
                                      {payeeTypes.map(pt => <option key={pt.value} value={pt.value} className="bg-slate-800">{t(`form.payeeTypes.${pt.value}`)}</option>)}
                                  </select>
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.payeeName")}</label>
                                  <div className="relative">
                                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input
                                          type="text"
                                          value={form.payee_name}
                                          onChange={(e) => setForm({ ...form, payee_name: e.target.value })}
                                          placeholder={t("form.payeeNamePlaceholder")}
                                          className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-rose-500 outline-none transition-all"
                                          required
                                      />
                                  </div>
                              </div>
                          </div>
  
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.method")}</label>
                                  <select 
                                      value={form.payment_method} 
                                      onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                                      className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-rose-500 outline-none appearance-none"
                                  >
                                      {paymentMethods.map(m => <option key={m.value} value={m.value} className="bg-slate-800">{m.label}</option>)}
                                  </select>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.amount")}</label>
                                  <div className="relative">
                                      <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input
                                          type="number"
                                          step="0.01"
                                          value={form.amount}
                                          onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                          placeholder="0.00"
                                          className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-rose-500 outline-none transition-all"
                                          required
                                      />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.total")}</label>
                                  <input
                                      type="text"
                                      value={form.total_amount}
                                      readOnly
                                      className="w-full px-6 py-3 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-rose-400 font-black cursor-not-allowed"
                                  />
                              </div>
                          </div>
  
                          <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.purpose")}</label>
                              <textarea
                                  value={form.payment_purpose}
                                  onChange={(e) => setForm({ ...form, payment_purpose: e.target.value })}
                                  rows={2}
                                  placeholder={t("form.purposePlaceholder")}
                                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:bg-white/10 focus:border-rose-500 outline-none transition-all resize-none"
                              />
                          </div>
  
                          <div className="flex justify-end gap-4">
                              <button
                                  type="button"
                                  onClick={resetForm}
                                  className="px-10 py-4 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                              >
                                  {t("form.cancel")}
                              </button>
                              <button
                                  type="submit"
                                  disabled={submitting}
                                  className="flex items-center gap-3 px-10 py-4 bg-rose-500 text-white font-black rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-50"
                              >
                                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                  {editingId ? t("form.editSave") : t("form.save")}
                              </button>
                          </div>
                      </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Search & Table Section */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 bg-white/10 border border-white/10 rounded-2xl text-white font-medium focus:bg-white/20 focus:border-rose-500/50 outline-none transition-all placeholder:text-slate-500"
                />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/20 text-blue-300 font-bold rounded-2xl border border-blue-500/30 hover:bg-blue-500/30 transition-all">
                        <FileSpreadsheet size={18} />
                        {useTranslations("financialVouchersPage.salesReceiptsPage")("exportData")}
                    </button>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <Wallet className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="font-black text-lg">{t("table.title")}</h3>
                    </div>
                    <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {t("table.countLabel", { count: filteredVouchers.length })}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("table.no")}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("table.date")}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("table.payee")}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("table.method")}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("table.status")}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("table.total")}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t("table.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredVouchers.length > 0 ? (
                                filteredVouchers.map((voucher, idx) => {
                                    const statusInfo = getStatusInfo(voucher.status);
                                    return (
                                        <motion.tr 
                                            key={voucher.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.05 * idx }}
                                            className="hover:bg-white/5 transition-colors group"
                                        >
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1.5 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-black border border-rose-500/20">
                                                    {voucher.voucher_number}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                                                    <Calendar size={14} className="text-slate-500" />
                                                    {voucher.voucher_date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-rose-500/20 group-hover:text-rose-400 transition-all">
                                                        <User size={16} />
                                                    </div>
                                                    <span className="font-bold text-sm text-slate-200 truncate max-w-[150px]">{voucher.payee_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-full border border-purple-500/20">
                                                    {voucher.payment_method}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border", statusInfo.color.includes('emerald') ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : statusInfo.color.includes('amber') ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : statusInfo.color.includes('blue') ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-white/10 text-slate-400 border-white/10")}>
                                                    <statusInfo.icon size={12} />
                                                    {t(`statuses.${voucher.status}`)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-baseline gap-1 text-rose-400">
                                                    <span className="text-lg font-black">{Number(voucher.total_amount).toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-rose-400/50 uppercase">{voucher.currency}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleEdit(voucher)}
                                                        className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95"
                                                        title={useTranslations("common")("edit")}
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handlePrint(voucher)}
                                                        className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all shadow-lg active:scale-95"
                                                        title={useTranslations("common")("print")}
                                                    >
                                                        <Printer size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(voucher.id)}
                                                        className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95"
                                                        title={useTranslations("common")("delete")}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <Wallet size={64} className="text-slate-400" />
                                            <div className="space-y-1">
                                                <p className="text-xl font-black text-slate-300">{t("noVouchers.title")}</p>
                                                <p className="text-sm font-medium text-slate-500">{t("noVouchers.desc")}</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-4 opacity-60">
        <div className="flex items-center gap-2">
          <Sparkles size={10} className="text-rose-500" />
          <span>{useTranslations("financialVouchersPage")("systemTitle", { name: "ZoolSpeed Logistics" })} - {t("subtitle")}</span>
        </div>
        <span>{useTranslations("financialVouchersPage")("allRightsReserved", { year: new Date().getFullYear() })}</span>
      </div>

      <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[101] bg-emerald-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 font-black"
            >
              <CheckCircle size={24} />
              <span>{t("notifications.saveSuccess")}</span>
            </motion.div>
          )}
      </AnimatePresence>

      {/* Print Area Container (Hidden) */}
      {printVoucher && (
        <div className="print-area fixed inset-0 bg-white z-[200] p-8 hidden print:block text-black" dir="rtl">
            {/* Simple print layout */}
            <div className="p-8 border-4 border-double border-slate-800 rounded-lg">
                <div className="text-center mb-8 border-b-2 pb-4">
                    <h1 className="text-2xl font-black">سند صرف</h1>
                    <p className="text-sm">Payment Voucher</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div><strong>رقم السند:</strong> {printVoucher.voucher_number}</div>
                    <div><strong>التاريخ:</strong> {printVoucher.voucher_date}</div>
                    <div><strong>المستفيد:</strong> {printVoucher.payee_name}</div>
                    <div><strong>المبلغ:</strong> {printVoucher.total_amount} {printVoucher.currency}</div>
                </div>
                <div className="mb-8"><strong>البيان:</strong> {printVoucher.payment_purpose}</div>
                <div className="flex justify-between mt-20">
                    <div>توقيع المُعد</div>
                    <div>توقيع المُعتمد</div>
                    <div>توقيع المستلم</div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export function PaymentVouchersClient() {
  const t = useTranslations("common");
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">{t("loading")}</div>}>
      <PaymentVouchersContent />
    </Suspense>
  );
}
