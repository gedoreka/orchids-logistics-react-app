"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Package,
  CreditCard,
  Landmark,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Crown,
  Sparkles,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  Settings,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: number;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  price: number;
  duration_value: number;
  duration_unit: string;
  trial_days: number;
  is_active: number;
  include_all_services: number;
  sort_order: number;
}

interface BankAccount {
  id: number;
  bank_name: string;
  account_holder: string;
  account_number?: string;
  iban: string;
  logo_path?: string;
  is_active: number;
}

interface Payment {
  id: number;
  company_id: number;
  company_name: string;
  plan_id: number;
  plan_name: string;
  plan_price: number;
  amount: number;
  bank_name?: string;
  receipt_image?: string;
  status: string;
  rejection_reason?: string;
  request_type: string;
  created_at: string;
}

interface Props {
  initialPlans: Plan[];
  initialBankAccounts: BankAccount[];
  initialPayments: Payment[];
  stats: { totalPlans: number; activePlans: number; totalPayments: number; pendingPayments: number };
  userId: number;
}

export default function SubscriptionsClient({ initialPlans, initialBankAccounts, initialPayments, stats, userId }: Props) {
  const [activeTab, setActiveTab] = useState<'plans' | 'banks' | 'payments'>('plans');
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [isLoading, setIsLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showReceiptModal, setShowReceiptModal] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: number, type: 'plan' | 'bank' } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [setupDone, setSetupDone] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const res = await fetch('/api/admin/subscriptions/setup');
      const data = await res.json();
      const allReady = Object.values(data.tables || {}).every(v => v === true);
      setSetupDone(allReady);
    } catch {
      setSetupDone(false);
    }
  };

  const runSetup = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/subscriptions/setup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('تم إعداد النظام بنجاح');
        setSetupDone(true);
        window.location.reload();
      } else {
        toast.error(data.error || 'فشل في الإعداد');
      }
    } catch {
      toast.error('حدث خطأ');
    }
    setIsLoading(false);
  };

  const handleSavePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      name_en: formData.get('name_en'),
      description: formData.get('description'),
      description_en: formData.get('description_en'),
      price: parseFloat(formData.get('price') as string) || 0,
      duration_value: parseInt(formData.get('duration_value') as string) || 1,
      duration_unit: formData.get('duration_unit'),
      trial_days: parseInt(formData.get('trial_days') as string) || 0,
      is_active: formData.get('is_active') === 'on' ? 1 : 0,
      include_all_services: formData.get('include_all_services') === 'on' ? 1 : 0,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    };

    try {
      const url = editingPlan 
        ? `/api/admin/subscriptions/plans/${editingPlan.id}`
        : '/api/admin/subscriptions/plans';
      const method = editingPlan ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success(editingPlan ? 'تم تحديث الباقة' : 'تم إنشاء الباقة');
        setShowPlanModal(false);
        setEditingPlan(null);
        refreshPlans();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('حدث خطأ');
    }
    setIsLoading(false);
  };

  const handleDeletePlan = async (id: number) => {
    setShowDeleteConfirm({ id, type: 'plan' });
  };

  const handleDeleteBank = async (id: number) => {
    setShowDeleteConfirm({ id, type: 'bank' });
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;
    const { id, type } = showDeleteConfirm;
    setIsLoading(true);
    try {
      const url = type === 'plan' 
        ? `/api/admin/subscriptions/plans/${id}`
        : `/api/admin/subscriptions/bank-accounts/${id}`;
      
      const res = await fetch(url, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        toast.success(type === 'plan' ? 'تم حذف الباقة بنجاح' : 'تم حذف الحساب بنجاح');
        if (type === 'plan') refreshPlans();
        else refreshBanks();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
    setIsLoading(false);
    setShowDeleteConfirm(null);
  };

  const handleSaveBank = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      bank_name: formData.get('bank_name'),
      account_holder: formData.get('account_holder'),
      account_number: formData.get('account_number'),
      iban: formData.get('iban'),
      is_active: formData.get('is_active') === 'on' ? 1 : 0,
    };

    try {
      const url = editingBank 
        ? `/api/admin/subscriptions/bank-accounts/${editingBank.id}`
        : '/api/admin/subscriptions/bank-accounts';
      const method = editingBank ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success(editingBank ? 'تم تحديث الحساب' : 'تم إضافة الحساب');
        setShowBankModal(false);
        setEditingBank(null);
        refreshBanks();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('حدث خطأ');
    }
    setIsLoading(false);
  };

  const handlePaymentAction = async (paymentId: number, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error('يرجى إدخال سبب الرفض');
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/subscriptions/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action, 
          rejection_reason: rejectionReason,
          processed_by: userId 
        })
      });
      
      const result = await res.json();
      if (result.success) {
        toast.success(action === 'approve' ? 'تم قبول الطلب وتفعيل الاشتراك' : 'تم رفض الطلب');
        setShowRejectModal(null);
        setRejectionReason('');
        refreshPayments();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('حدث خطأ');
    }
    setIsLoading(false);
  };

  const refreshPlans = async () => {
    try {
      const res = await fetch('/api/admin/subscriptions/plans');
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans.map((p: any) => ({ ...p, price: parseFloat(p.price) || 0 })));
      }
    } catch {}
  };

  const refreshBanks = async () => {
    try {
      const res = await fetch('/api/admin/subscriptions/bank-accounts');
      const data = await res.json();
      if (data.success) setBankAccounts(data.accounts);
    } catch {}
  };

  const refreshPayments = async () => {
    try {
      const res = await fetch(`/api/admin/subscriptions/payments?status=${paymentFilter}`);
      const data = await res.json();
      if (data.success) {
        setPayments(data.requests.map((p: any) => ({
          ...p,
          amount: parseFloat(p.amount) || 0,
          plan_price: parseFloat(p.plan_price) || 0,
          created_at: p.created_at ? new Date(p.created_at).toISOString() : null,
        })));
      }
    } catch {}
  };

  useEffect(() => {
    if (activeTab === 'payments') refreshPayments();
  }, [paymentFilter]);

  const tabs = [
    { id: 'plans', label: 'الباقات', icon: Package, count: plans.length },
    { id: 'banks', label: 'الحسابات البنكية', icon: Landmark, count: bankAccounts.length },
    { id: 'payments', label: 'طلبات الدفع', icon: CreditCard, count: stats.pendingPayments },
  ];

  if (!setupDone) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
            <Settings size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">إعداد نظام الاشتراكات</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">يجب إعداد جداول قاعدة البيانات أولاً لتفعيل نظام الباقات والاشتراكات</p>
          <button
            onClick={runSetup}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Sparkles size={20} />}
            {isLoading ? 'جاري الإعداد...' : 'بدء الإعداد الآن'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl">
                <Crown size={28} className="text-white" />
              </div>
              إدارة الباقات والاشتراكات
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">إدارة باقات الاشتراك والحسابات البنكية وطلبات الدفع</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الباقات', value: stats.totalPlans, icon: Package, gradient: 'from-blue-500 to-cyan-500' },
            { label: 'الباقات النشطة', value: stats.activePlans, icon: CheckCircle2, gradient: 'from-emerald-500 to-green-500' },
            { label: 'طلبات الدفع', value: stats.totalPayments, icon: CreditCard, gradient: 'from-violet-500 to-purple-500' },
            { label: 'طلبات معلقة', value: stats.pendingPayments, icon: Clock, gradient: 'from-amber-500 to-orange-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800"
            >
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3", stat.gradient)}>
                <stat.icon size={24} className="text-white" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-4 font-bold text-sm transition-all",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                    : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
                {tab.count > 0 && (
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs",
                    activeTab === tab.id ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-700"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'plans' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-white">قائمة الباقات</h3>
                  <button
                    onClick={() => { setEditingPlan(null); setShowPlanModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    <Plus size={18} />
                    إضافة باقة
                  </button>
                </div>

                <div className="grid gap-4">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      layout
                      className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center",
                            plan.is_active ? "bg-gradient-to-br from-emerald-500 to-green-600" : "bg-slate-300 dark:bg-slate-600"
                          )}>
                            <Package size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">{plan.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{plan.name_en}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-2xl font-black text-blue-600">{plan.price} ر.س</span>
                              <span className="text-sm text-slate-400">/ {plan.duration_value} {plan.duration_unit === 'days' ? 'يوم' : plan.duration_unit === 'months' ? 'شهر' : 'سنة'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            plan.is_active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                          )}>
                            {plan.is_active ? 'نشطة' : 'غير نشطة'}
                          </span>
                          <button
                            onClick={() => { setEditingPlan(plan); setShowPlanModal(true); }}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Edit size={18} className="text-slate-500" />
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                      {plan.description && (
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl">
                          {plan.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'banks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-white">الحسابات البنكية</h3>
                  <button
                    onClick={() => { setEditingBank(null); setShowBankModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold text-sm hover:from-emerald-700 hover:to-green-700 transition-all"
                  >
                    <Plus size={18} />
                    إضافة حساب
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {bankAccounts.map((bank) => (
                    <motion.div
                      key={bank.id}
                      layout
                      className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Landmark size={24} className="text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white">{bank.bank_name}</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{bank.account_holder}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingBank(bank); setShowBankModal(true); }}
                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <Edit size={18} className="text-slate-500" />
                          </button>
                          <button
                            onClick={() => handleDeleteBank(bank.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm">
                        {bank.account_number && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">رقم الحساب:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{bank.account_number}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">الآيبان:</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">{bank.iban}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-white">طلبات الدفع</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={paymentFilter}
                      onChange={(e) => setPaymentFilter(e.target.value)}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                    >
                      <option value="all">الكل</option>
                      <option value="pending">معلقة</option>
                      <option value="approved">مقبولة</option>
                      <option value="rejected">مرفوضة</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {payments.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                      <p>لا توجد طلبات دفع</p>
                    </div>
                  ) : payments.map((payment) => (
                    <motion.div
                      key={payment.id}
                      layout
                      className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            payment.status === 'pending' ? "bg-amber-100 dark:bg-amber-900/30" :
                            payment.status === 'approved' ? "bg-emerald-100 dark:bg-emerald-900/30" :
                            "bg-red-100 dark:bg-red-900/30"
                          )}>
                            {payment.status === 'pending' ? <Clock size={24} className="text-amber-600" /> :
                             payment.status === 'approved' ? <CheckCircle2 size={24} className="text-emerald-600" /> :
                             <XCircle size={24} className="text-red-600" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{payment.company_name}</h4>
                            <p className="text-sm text-slate-500">{payment.plan_name} - {payment.amount} ر.س</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(payment.created_at).toLocaleDateString('ar-SA')}
                              {payment.bank_name && ` • ${payment.bank_name}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {payment.receipt_image && (
                            <button
                              onClick={() => setShowReceiptModal(payment.receipt_image!)}
                              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                              title="عرض الإيصال"
                            >
                              <Eye size={18} className="text-slate-500" />
                            </button>
                          )}
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handlePaymentAction(payment.id, 'approve')}
                                disabled={isLoading}
                                className="p-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 rounded-lg transition-colors"
                                title="قبول"
                              >
                                <Check size={18} className="text-emerald-600" />
                              </button>
                              <button
                                onClick={() => setShowRejectModal(payment.id)}
                                disabled={isLoading}
                                className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                title="رفض"
                              >
                                <X size={18} className="text-red-600" />
                              </button>
                            </>
                          )}
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            payment.status === 'pending' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                            payment.status === 'approved' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          )}>
                            {payment.status === 'pending' ? 'معلق' : payment.status === 'approved' ? 'مقبول' : 'مرفوض'}
                          </span>
                        </div>
                      </div>
                      {payment.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400">
                          <strong>سبب الرفض:</strong> {payment.rejection_reason}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlanModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
                {editingPlan ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
              </h3>
              <form onSubmit={handleSavePlan} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم الباقة (عربي)</label>
                    <input name="name" defaultValue={editingPlan?.name} required className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم الباقة (انجليزي)</label>
                    <input name="name_en" defaultValue={editingPlan?.name_en} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">الوصف</label>
                  <textarea name="description" defaultValue={editingPlan?.description || ''} rows={2} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">السعر (ر.س)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingPlan?.price || 0} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">المدة</label>
                    <input name="duration_value" type="number" defaultValue={editingPlan?.duration_value || 1} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">وحدة المدة</label>
                    <select name="duration_unit" defaultValue={editingPlan?.duration_unit || 'months'} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold">
                      <option value="days">يوم</option>
                      <option value="months">شهر</option>
                      <option value="years">سنة</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">فترة تجريبية (أيام)</label>
                    <input name="trial_days" type="number" defaultValue={editingPlan?.trial_days || 0} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ترتيب العرض</label>
                    <input name="sort_order" type="number" defaultValue={editingPlan?.sort_order || 0} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold" />
                  </div>
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input name="is_active" type="checkbox" defaultChecked={editingPlan?.is_active !== 0} className="w-5 h-5 rounded" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">نشطة</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input name="include_all_services" type="checkbox" defaultChecked={editingPlan?.include_all_services !== 0} className="w-5 h-5 rounded" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">تشمل كل الخدمات</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50">
                    {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                  <button type="button" onClick={() => setShowPlanModal(false)} className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl">
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showBankModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBankModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
                {editingBank ? 'تعديل الحساب' : 'إضافة حساب بنكي'}
              </h3>
              <form onSubmit={handleSaveBank} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم البنك</label>
                  <input name="bank_name" defaultValue={editingBank?.bank_name} required className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">اسم صاحب الحساب</label>
                  <input name="account_holder" defaultValue={editingBank?.account_holder} required className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">رقم الحساب</label>
                  <input name="account_number" defaultValue={editingBank?.account_number} className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">رقم الآيبان</label>
                  <input name="iban" defaultValue={editingBank?.iban} required className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input name="is_active" type="checkbox" defaultChecked={editingBank?.is_active !== 0} className="w-5 h-5 rounded" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">نشط</span>
                </label>
                <div className="flex gap-3 pt-4">
                  <button type="submit" disabled={isLoading} className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50">
                    {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                  <button type="button" onClick={() => setShowBankModal(false)} className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl">
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRejectModal(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle size={32} className="text-red-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">رفض طلب الدفع</h3>
                <p className="text-slate-500 text-sm mt-2">يرجى إدخال سبب الرفض ليتم إرساله للعميل</p>
              </div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="سبب الرفض..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-0 font-bold mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => handlePaymentAction(showRejectModal, 'reject')}
                  disabled={isLoading || !rejectionReason.trim()}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
                >
                  تأكيد الرفض
                </button>
                <button
                  onClick={() => { setShowRejectModal(null); setRejectionReason(''); }}
                  className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showReceiptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceiptModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-3xl max-h-[90vh] overflow-auto"
            >
              <button
                onClick={() => setShowReceiptModal(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} className="text-white" />
              </button>
              <img src={showReceiptModal} alt="Receipt" className="max-w-full rounded-2xl" />
            </motion.div>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirm(null)}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 text-center overflow-hidden"
              >
                {/* Background decorative elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
                
                <div className="relative">
                  <motion.div 
                    initial={{ scale: 0.5, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-red-500 to-orange-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-red-500/30"
                  >
                    <Trash2 size={40} className="text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                    {showDeleteConfirm.type === 'plan' ? 'حذف الباقة' : 'حذف الحساب البنكي'}
                  </h3>
                  
                  <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    {showDeleteConfirm.type === 'plan' 
                      ? 'هل أنت متأكد من حذف هذه الباقة؟ لا يمكن التراجع عن هذا الإجراء وسيتم إيقاف العروض المرتبطة بها.'
                      : 'هل أنت متأكد من حذف هذا الحساب؟ لن يتمكن المستخدمون من اختيار هذا الحساب كخيار للدفع.'}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={confirmDelete}
                      disabled={isLoading}
                      className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-black rounded-2xl hover:shadow-lg hover:shadow-red-500/40 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Trash2 size={20} />}
                      نعم، أريد الحذف
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                      تراجع، إلغاء الأمر
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

