"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign,
  Save,
  Calendar,
  FileText,
  Landmark,
  Building2,
  CreditCard,
  Upload,
  CheckCircle,
  ArrowRight,
  History,
  Bolt,
  Hash,
  AlertCircle,
  User as UserIcon,
  Calculator,
  Receipt,
  Percent,
  Wallet,
  FileUp,
  X,
  Eye,
  Trash2,
  Edit3,
  RefreshCw,
  Download,
  Printer,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Clock,
  BadgeDollarSign
} from "lucide-react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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

interface IncomeRecord {
  id: number;
  operation_number: string;
  income_type: string;
  income_date: string;
  amount: number;
  vat: number;
  total: number;
  description: string;
  payment_method: string;
  uploaded_file: string | null;
  created_by: string;
  created_at: string;
}

interface Metadata {
  accounts: Account[];
  costCenters: CostCenter[];
  operationNumber: string;
  incomes: IncomeRecord[];
  totalIncomes: number;
}

const paymentMethods = [
  { value: 'نقدي', label: 'نقدي', icon: Wallet, color: 'emerald' },
  { value: 'تحويل', label: 'تحويل بنكي', icon: Landmark, color: 'blue' },
  { value: 'إيداع', label: 'إيداع', icon: CreditCard, color: 'purple' },
];

const incomeTypes = [
  'تحويل بنكي',
  'رأس مال',
  'إيرادات أخرى',
  'أرباح استثمارات',
  'دخل إيجار',
  'عائد ودائع',
  'تسويات مالية'
];

export default function IncomeFormClient({ user }: { user: User }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [enableVAT, setEnableVAT] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    income_type: '',
    income_date: new Date().toISOString().split('T')[0],
    amount: '',
    vat: '0',
    total: '0',
    description: '',
    account_id: '',
    cost_center_id: '',
    payment_method: ''
  });

  const fetchMetadata = async () => {
    try {
      const res = await fetch(`/api/income/metadata?company_id=${user.company_id}`);
      const data = await res.json();
      setMetadata(data);
    } catch (error) {
      console.error("Failed to fetch metadata", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, [user.company_id]);

  useEffect(() => {
    const amount = parseFloat(formData.amount) || 0;
    const vat = enableVAT ? amount * 0.15 : 0;
    const total = amount + vat;
    setFormData(prev => ({
      ...prev,
      vat: vat.toFixed(2),
      total: total.toFixed(2)
    }));
  }, [formData.amount, enableVAT]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData = new FormData();
    submitData.append('company_id', user.company_id.toString());
    submitData.append('user_name', user.name);
    submitData.append('income_type', formData.income_type);
    submitData.append('income_date', formData.income_date);
    submitData.append('amount', formData.amount);
    submitData.append('vat', formData.vat);
    submitData.append('total', formData.total);
    submitData.append('description', formData.description);
    submitData.append('account_id', formData.account_id);
    submitData.append('cost_center_id', formData.cost_center_id);
    submitData.append('payment_method', formData.payment_method);
    
    if (selectedFile) {
      submitData.append('receipt_file', selectedFile);
    }

    try {
      const res = await fetch('/api/income/save', {
        method: 'POST',
        body: submitData
      });
      const data = await res.json();
      if (data.success) {
        setShowSuccess(true);
        setFormData({
          income_type: '',
          income_date: new Date().toISOString().split('T')[0],
          amount: '',
          vat: '0',
          total: '0',
          description: '',
          account_id: '',
          cost_center_id: '',
          payment_method: ''
        });
        setSelectedFile(null);
        fetchMetadata();
      }
    } catch (error) {
      console.error('Save failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-500 font-bold">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-6 space-y-6" dir="rtl">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">إدارة الدخل المالي</h1>
              <p className="text-slate-400 mt-1">تسجيل الإيرادات الخارجية والتحويلات البنكية</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
              <p className="text-xs text-slate-400 font-bold">رقم العملية</p>
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {metadata?.operationNumber || 'INC00001'}
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-4 mt-6">
          <div className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-xl border border-blue-500/30">
            <UserIcon size={16} />
            <span className="text-sm font-bold">المسؤول: {user.name}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-xl border border-emerald-500/30">
            <Calendar size={16} />
            <span className="text-sm font-bold">تاريخ اليوم: {format(new Date(), 'yyyy/MM/dd', { locale: ar })}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">إجمالي السجلات</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{metadata?.totalIncomes || 0}</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl">
              <FileText className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">الشهر الحالي</p>
              <p className="text-xl font-black text-slate-900 mt-1">{format(new Date(), 'MMMM yyyy', { locale: ar })}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">حالة القيد</p>
              <p className="text-xl font-black text-emerald-600 mt-1">جديد</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <BadgeDollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">إضافة دخل جديد</h2>
                <p className="text-emerald-200 text-xs font-bold">تسجيل عملية مالية جديدة</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
              <span className="text-white text-sm font-bold">{metadata?.operationNumber}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Operation Number, Income Type, Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                <Hash className="inline w-4 h-4 ml-1 text-slate-400" />
                رقم العملية
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={metadata?.operationNumber || ''}
                  readOnly
                  className="w-full h-12 px-4 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-500 font-bold cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                <FileText className="inline w-4 h-4 ml-1 text-slate-400" />
                نوع الدخل
              </label>
              <select
                value={formData.income_type}
                onChange={(e) => setFormData(prev => ({ ...prev, income_type: e.target.value }))}
                required
                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
              >
                <option value="">-- اختر نوع الدخل --</option>
                {incomeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                <Calendar className="inline w-4 h-4 ml-1 text-slate-400" />
                تاريخ الدخل
              </label>
              <input
                type="date"
                value={formData.income_date}
                onChange={(e) => setFormData(prev => ({ ...prev, income_date: e.target.value }))}
                required
                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 2: Amount, VAT, Total, VAT Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                <DollarSign className="inline w-4 h-4 ml-1 text-slate-400" />
                المبلغ قبل الضريبة
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                placeholder="0.00"
                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                <Percent className="inline w-4 h-4 ml-1 text-slate-400" />
                الضريبة 15%
              </label>
              <input
                type="text"
                value={formData.vat}
                readOnly
                className="w-full h-12 px-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-700 font-bold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                <Calculator className="inline w-4 h-4 ml-1 text-slate-400" />
                الإجمالي بعد الضريبة
              </label>
              <input
                type="text"
                value={formData.total}
                readOnly
                className="w-full h-12 px-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700 font-black cursor-not-allowed"
              />
            </div>

            <div className="flex items-end pb-1">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={enableVAT}
                  onChange={(e) => setEnableVAT(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ms-3 text-sm font-black text-slate-700">تفعيل الضريبة</span>
              </label>
            </div>
          </div>

          {/* Row 3: Description */}
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">
              <FileText className="inline w-4 h-4 ml-1 text-slate-400" />
              الوصف
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="أدخل وصفاً مفصلاً للدخل..."
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Row 4: Account, Cost Center, Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                <Landmark className="inline w-4 h-4 ml-1 text-slate-400" />
                رمز الحساب
              </label>
              <select
                value={formData.account_id}
                onChange={(e) => setFormData(prev => ({ ...prev, account_id: e.target.value }))}
                required
                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
              >
                <option value="">-- اختر الحساب --</option>
                {(metadata?.accounts || []).map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.account_code} - {acc.account_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                <Building2 className="inline w-4 h-4 ml-1 text-slate-400" />
                رمز مركز التكلفة
              </label>
              <select
                value={formData.cost_center_id}
                onChange={(e) => setFormData(prev => ({ ...prev, cost_center_id: e.target.value }))}
                required
                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
              >
                <option value="">-- اختر مركز التكلفة --</option>
                {(metadata?.costCenters || []).map(cc => (
                  <option key={cc.id} value={cc.id}>{cc.center_code} - {cc.center_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2">
                <CreditCard className="inline w-4 h-4 ml-1 text-slate-400" />
                طريقة الدفع
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                required
                className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all"
              >
                <option value="">-- اختر طريقة الدفع --</option>
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5: File Upload */}
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">
              <Upload className="inline w-4 h-4 ml-1 text-slate-400" />
              رفع الإيصال أو الفاتورة (PDF/صورة)
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-emerald-100 transition-colors">
                  <FileUp className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="p-1 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-600 font-bold">اسحب الملف هنا أو انقر للاختيار</p>
                    <p className="text-slate-400 text-xs mt-1">PDF, PNG, JPG حتى 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              تم بواسطة: <span className="font-bold text-emerald-600">{user.name}</span>
            </p>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 ${
                submitting 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-emerald-500/30 hover:shadow-2xl'
              }`}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>حفظ الدخل</span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* Income Records Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">الدخل اليدوي المحفوظ</h2>
                <p className="text-slate-400 text-xs font-bold">سجلات الإيرادات الخارجية</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/30">
                <span className="text-sm font-bold">{metadata?.incomes?.length || 0} سجل</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">رقم العملية</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">نوع الدخل</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">قبل الضريبة</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">الضريبة</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">الإجمالي</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">طريقة الدفع</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">الوصف</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">المرفق</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider">تم بواسطة</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(metadata?.incomes || []).map((income, idx) => (
                <motion.tr
                  key={income.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                      {income.operation_number}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900">{income.income_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">{income.income_date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">{Number(income.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-amber-600">{Number(income.vat).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-emerald-600">{Number(income.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                      {income.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600 truncate max-w-[150px] block">{income.description || '--'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {income.uploaded_file ? (
                      <a
                        href={`/uploads/income/${income.uploaded_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-100 text-xs font-bold text-purple-700 hover:bg-purple-200 transition-colors"
                      >
                        <Eye size={14} />
                        عرض
                      </a>
                    ) : (
                      <span className="text-slate-400 text-sm">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-600">{income.created_by}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/income/${income.id}/edit`}
                        className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                      >
                        <Edit3 size={16} />
                      </Link>
                      <button
                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {(!metadata?.incomes || metadata.incomes.length === 0) && (
                <tr>
                  <td colSpan={11} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                        <Receipt size={28} className="text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold">لا توجد سجلات دخل</p>
                      <p className="text-slate-300 text-sm">ابدأ بإضافة أول سجل دخل باستخدام النموذج أعلاه</p>
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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-8 rounded-3xl shadow-2xl text-center min-w-[350px]"
            >
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-black mb-3">تم الحفظ بنجاح!</h2>
              <p className="text-base opacity-90 mb-6">تم تسجيل الدخل بنجاح في النظام المالي.</p>
              <button
                onClick={() => setShowSuccess(false)}
                className="bg-white text-emerald-700 px-8 py-2.5 rounded-xl font-bold text-base hover:bg-emerald-50 transition-colors flex items-center mx-auto gap-2"
              >
                <span>متابعة</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4">
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-emerald-500" />
          <span>إصدار آلي من نظام ZoolSpeed Logistics</span>
        </div>
        <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
