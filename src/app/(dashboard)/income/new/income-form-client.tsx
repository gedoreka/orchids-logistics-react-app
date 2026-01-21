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
  BadgeDollarSign,
  Plus,
  Loader2,
  FileSpreadsheet
} from "lucide-react";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/locale-context";

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

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading" | "confirm";
  title: string;
  message: string;
  onConfirm?: () => void;
  itemId?: number;
  itemName?: string;
}

export default function IncomeFormClient({ user }: { user: User }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("financialVouchersPage.incomePage");
  const tCommon = useTranslations("common");
  const { locale } = useLocale();
  const isRtl = locale === "ar";
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [enableVAT, setEnableVAT] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });

  const paymentMethods = [
    { value: 'نقدي', label: t("paymentMethods.cash"), icon: Wallet },
    { value: 'تحويل', label: t("paymentMethods.transfer"), icon: Landmark },
    { value: 'إيداع', label: t("paymentMethods.deposit"), icon: CreditCard },
  ];

  const incomeTypes = [
    { value: 'تحويل بنكي', label: t("incomeTypes.bankTransfer") },
    { value: 'رأس مال', label: t("incomeTypes.capital") },
    { value: 'إيرادات أخرى', label: t("incomeTypes.otherRevenue") },
    { value: 'أرباح استثمارات', label: t("incomeTypes.investmentProfit") },
    { value: 'دخل إيجار', label: t("incomeTypes.rentalIncome") },
    { value: 'عائد ودائع', label: t("incomeTypes.depositReturn") },
    { value: 'تسويات مالية', label: t("incomeTypes.financialAdjustments") },
  ];
  
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

  const showNotification = (type: "success" | "error" | "loading" | "confirm", title: string, message: string, onConfirm?: () => void, itemId?: number, itemName?: string) => {
    setNotification({ show: true, type, title, message, onConfirm, itemId, itemName });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleDelete = (id: number, operationNumber: string) => {
    showNotification(
      "confirm",
      isRtl ? "تأكيد حذف سند الإيراد" : "Confirm Delete Income Voucher",
      isRtl ? `هل أنت متأكد من حذف سند الإيراد رقم "${operationNumber}"؟\nلا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete income voucher "${operationNumber}"?\nThis action cannot be undone.`,
      () => confirmDelete(id),
      id,
      operationNumber
    );
  };

  const confirmDelete = async (id: number) => {
    setDeleteLoading(id);
    hideNotification();
    showNotification("loading", isRtl ? "جاري الحذف" : "Deleting", isRtl ? "جاري حذف سند الإيراد..." : "Deleting income voucher...");
    
    try {
      const res = await fetch(`/api/income/${id}?company_id=${user.company_id}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        showNotification("success", isRtl ? "تم الحذف بنجاح" : "Deleted Successfully", isRtl ? "تم حذف سند الإيراد بنجاح" : "Income voucher deleted successfully");
        fetchMetadata();
        setTimeout(() => hideNotification(), 2000);
      } else {
        showNotification("error", isRtl ? "فشل الحذف" : "Delete Failed", isRtl ? "فشل حذف سند الإيراد" : "Failed to delete income voucher");
      }
    } catch {
      showNotification("error", isRtl ? "خطأ" : "Error", isRtl ? "حدث خطأ أثناء الحذف" : "An error occurred during deletion");
    } finally {
      setDeleteLoading(null);
    }
  };

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
        setShowForm(false);
        fetchMetadata();
      }
    } catch (error) {
      console.error('Save failed', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIncomes = (metadata?.incomes || []).filter(inc => 
    inc.operation_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.income_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-8 space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
              onClick={() => notification.type !== "loading" && notification.type !== "confirm" && hideNotification()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md p-4"
            >
              <div className={cn(
                "bg-white rounded-[2rem] p-8 shadow-2xl border-t-4",
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-red-500" : 
                notification.type === "confirm" ? "border-cyan-500" : "border-blue-500"
              )}>
                <div className="text-center">
                  <div className={cn(
                    "h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center",
                    notification.type === "success" ? "bg-emerald-100 text-emerald-500" :
                    notification.type === "error" ? "bg-red-100 text-red-500" : 
                    notification.type === "confirm" ? "bg-cyan-100 text-cyan-500" : "bg-blue-100 text-blue-500"
                  )}>
                    {notification.type === "success" && <CheckCircle size={40} />}
                    {notification.type === "error" && <AlertCircle size={40} />}
                    {notification.type === "loading" && <Loader2 size={40} className="animate-spin" />}
                    {notification.type === "confirm" && <Trash2 size={40} />}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{notification.title}</h3>
                  <p className="text-gray-500 mb-6 font-medium whitespace-pre-line">{notification.message}</p>
                  
                  {notification.type === "confirm" && (
                    <div className="flex gap-3">
                      <button
                        onClick={hideNotification}
                        className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200 transition-all"
                      >
                        {tCommon("cancel")}
                      </button>
                      <button
                        onClick={() => notification.onConfirm && notification.onConfirm()}
                        className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        {tCommon("delete")}
                      </button>
                    </div>
                  )}
                  
                  {notification.type !== "loading" && notification.type !== "confirm" && (
                    <button
                      onClick={hideNotification}
                      className={cn(
                        "w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg active:scale-95",
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                      )}
                    >
                      {tCommon("ok")}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 via-teal-500 via-emerald-500 to-cyan-500 animate-gradient-x" />
        
        <div className="relative z-10 space-y-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-right space-y-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-cyan-200 font-black text-[10px] uppercase tracking-widest">{t("subtitle")}</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
                {t("description")}
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 font-black text-sm rounded-2xl transition-all shadow-xl active:scale-95",
                    showForm ? "bg-white/10 text-white border border-white/20" : "bg-cyan-500 text-white hover:bg-cyan-600 shadow-cyan-500/20"
                  )}
                >
                  {showForm ? <X size={18} /> : <Plus size={18} />}
                  {showForm ? t("cancelForm") : t("addNew")}
                </button>
                <button 
                    onClick={fetchMetadata}
                    className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95"
                  >
                  <RefreshCw size={18} className={cn("text-cyan-400", loading ? "animate-spin" : "")} />
                  {t("refreshData")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-cyan-300 font-black text-[10px] uppercase tracking-wider">{t("stats.count")}</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{metadata?.totalIncomes || 0}</p>
                <p className="text-cyan-400/60 text-[10px] font-black mt-1">{t("stats.voucherLabel")}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-emerald-300 font-black text-[10px] uppercase tracking-wider">{t("stats.nextNumber")}</span>
                </div>
                <p className="text-2xl font-black text-white tracking-tight">{metadata?.operationNumber || "---"}</p>
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
                            <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400">
                                <BadgeDollarSign className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">{t("form.addTitle")}</h2>
                                <p className="text-slate-400 font-bold tracking-wide">{t("form.fillData")}</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.incomeType")}</label>
                                <select
                                    value={formData.income_type}
                                    onChange={(e) => setFormData({...formData, income_type: e.target.value})}
                                    className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-cyan-500 outline-none appearance-none"
                                    required
                                >
                                    <option value="" className="bg-slate-800">{t("form.selectIncomeType")}</option>
                                    {incomeTypes.map(type => <option key={type.value} value={type.value} className="bg-slate-800">{type.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.incomeDate")}</label>
                                <div className="relative">
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        value={formData.income_date}
                                        onChange={(e) => setFormData({...formData, income_date: e.target.value})}
                                        className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-cyan-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.paymentMethod")}</label>
                                <select
                                    value={formData.payment_method}
                                    onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                                    className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-cyan-500 outline-none appearance-none"
                                    required
                                >
                                    <option value="" className="bg-slate-800">{t("form.selectPaymentMethod")}</option>
                                    {paymentMethods.map(m => <option key={m.value} value={m.value} className="bg-slate-800">{m.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.amount")}</label>
                                <div className="relative">
                                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        placeholder="0.00"
                                        className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-cyan-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.taxValue")}</label>
                                <input
                                    type="text"
                                    value={formData.vat}
                                    readOnly
                                    className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-amber-400 font-black cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.totalAmount")}</label>
                                <input
                                    type="text"
                                    value={formData.total}
                                    readOnly
                                    className="w-full px-6 py-3 bg-cyan-500/20 border border-cyan-500/30 rounded-2xl text-cyan-400 font-black cursor-not-allowed"
                                />
                            </div>
                            <div className="flex items-end pb-3">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={enableVAT}
                                        onChange={(e) => setEnableVAT(e.target.checked)}
                                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-cyan-500"
                                    />
                                    <span className="text-slate-300 font-bold group-hover:text-white transition-colors">{t("form.enableTax")}</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.account")} <span className="text-slate-500">({tCommon("optional")})</span></label>
                                <select
                                    value={formData.account_id}
                                    onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                                    className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-cyan-500 outline-none appearance-none"
                                >
                                    <option value="" className="bg-slate-800">{t("form.selectAccount")}</option>
                                    {(metadata?.accounts || []).map(acc => <option key={acc.id} value={acc.id} className="bg-slate-800">{acc.account_code} - {acc.account_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.costCenter")} <span className="text-slate-500">({tCommon("optional")})</span></label>
                                <select
                                    value={formData.cost_center_id}
                                    onChange={(e) => setFormData({...formData, cost_center_id: e.target.value})}
                                    className="w-full px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-cyan-500 outline-none appearance-none"
                                >
                                    <option value="" className="bg-slate-800">{t("form.selectCostCenter")}</option>
                                    {(metadata?.costCenters || []).map(cc => <option key={cc.id} value={cc.id} className="bg-slate-800">{cc.center_code} - {cc.center_name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{t("form.description")}</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={2}
                                placeholder={t("form.descriptionPlaceholder")}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:bg-white/10 focus:border-cyan-500 outline-none resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-10 py-4 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                            >
                                {t("form.cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-3 px-10 py-4 bg-cyan-500 text-white font-black rounded-2xl shadow-xl shadow-cyan-500/20 hover:bg-cyan-600 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                {t("form.save")}
                            </button>
                        </div>
                    </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-white/10" />

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 bg-white/10 border border-white/10 rounded-2xl text-white font-medium focus:bg-white/20 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-500"
                />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500/20 text-cyan-300 font-bold rounded-2xl border border-cyan-500/30 hover:bg-cyan-500/30 transition-all">
                        <FileSpreadsheet size={18} />
                        {t("exportData")}
                    </button>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-xl">
                            <Receipt className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="font-black text-lg">{t("table.title")}</h3>
                    </div>
                    <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {filteredIncomes.length} {tCommon("records")}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("table.no")}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("table.type")}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("table.date")}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("table.method")}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("table.total")}</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t("table.actions")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredIncomes.length > 0 ? (
                                filteredIncomes.map((income, idx) => (
                                    <motion.tr 
                                        key={income.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * idx }}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs font-black border border-cyan-500/20">
                                                {income.operation_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-bold text-sm text-slate-200">{income.income_type}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                                                <Calendar size={14} className="text-slate-500" />
                                                {income.income_date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black rounded-full border border-purple-500/20">
                                                {income.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-baseline gap-1 text-emerald-400">
                                                <span className="text-lg font-black">{Number(income.total).toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-emerald-400/50 uppercase">{tCommon("sar")}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                          <div className="flex items-center justify-center gap-2">
                                              <Link href={`/income/${income.id}`}>
                                                <button 
                                                    className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95"
                                                    title={tCommon("view")}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                              </Link>
                                              <button 
                                                  className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95"
                                                  title={tCommon("edit")}
                                              >
                                                  <Edit3 size={16} />
                                              </button>
                                              <button 
                                                  onClick={() => handleDelete(income.id, income.operation_number)}
                                                  disabled={deleteLoading === income.id}
                                                  className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                                  title={tCommon("delete")}
                                              >
                                                  {deleteLoading === income.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                              </button>
                                          </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <BadgeDollarSign size={64} className="text-slate-400" />
                                            <div className="space-y-1">
                                                <p className="text-xl font-black text-slate-300">{t("noRecords.title")}</p>
                                                <p className="text-sm font-medium text-slate-500">{t("noRecords.desc")}</p>
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

        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-4 opacity-60">
        <div className="flex items-center gap-2">
          <Sparkles size={10} className="text-cyan-500" />
          <span>{t("footer.system")}</span>
        </div>
        <span>{t("footer.rights", { year: new Date().getFullYear().toString() })}</span>
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
    </div>
  );
}
