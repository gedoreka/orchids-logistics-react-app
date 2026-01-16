"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Crown,
  Package,
  CheckCircle2,
  Clock,
  CreditCard,
  Landmark,
  Calendar,
  Star,
  Zap,
  Upload,
  X,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  History,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: number;
  name: string;
  name_en?: string;
  description?: string;
  price: number;
  duration_value: number;
  duration_unit: string;
}

interface BankAccount {
  id: number;
  bank_name: string;
  account_holder: string;
  account_number?: string;
  iban: string;
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [companySubscription, setCompanySubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans);
        setBankAccounts(data.bankAccounts);
        setCurrentSubscription(data.currentSubscription);
        setPaymentHistory(data.paymentHistory);
        setCompanySubscription(data.companySubscription);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    }
    setIsLoading(false);
  };

  const handleSubmitPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showPaymentModal) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/subscriptions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: showPaymentModal.id,
          bank_account_id: formData.get('bank_account_id'),
          receipt_image: receiptImage,
          request_type: currentSubscription ? 'renewal' : 'new',
          notes: formData.get('notes')
        })
      });

      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        setShowPaymentModal(null);
        setReceiptImage(null);
        fetchData();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error('حدث خطأ');
    }
    setIsSubmitting(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const isSubscriptionActive = companySubscription?.is_subscription_active === 1;
  const subscriptionEndDate = companySubscription?.subscription_end_date;
  const daysRemaining = subscriptionEndDate 
    ? Math.ceil((new Date(subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl">
                <Crown size={28} className="text-white" />
              </div>
              باقات الاشتراك
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">اختر الباقة المناسبة لاحتياجاتك</p>
          </div>
        </div>

        {currentSubscription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "bg-gradient-to-r p-6 rounded-3xl text-white",
              isSubscriptionActive && daysRemaining > 7
                ? "from-emerald-500 to-green-600"
                : isSubscriptionActive && daysRemaining > 0
                ? "from-amber-500 to-orange-600"
                : "from-red-500 to-rose-600"
            )}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Shield size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black">اشتراكك الحالي: {currentSubscription.plan_name}</h3>
                  <p className="text-white/80">
                    رمز الاشتراك: <span className="font-mono">{currentSubscription.subscription_code}</span>
                  </p>
                </div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-4xl font-black">{daysRemaining > 0 ? daysRemaining : 0}</div>
                <div className="text-white/80 text-sm">يوم متبقي</div>
                <div className="text-xs mt-1">
                  ينتهي في: {new Date(currentSubscription.end_date).toLocaleDateString('ar-SA')}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!isSubscriptionActive && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-4">
              <AlertCircle size={32} className="text-red-600" />
              <div>
                <h3 className="font-bold text-red-800 dark:text-red-400">لا يوجد اشتراك نشط</h3>
                <p className="text-red-600 dark:text-red-400/80 text-sm">
                  يرجى اختيار باقة للاشتراك والاستفادة من جميع مميزات النظام
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 transition-all hover:shadow-2xl",
                index === 1 
                  ? "border-violet-500 shadow-lg shadow-violet-500/20" 
                  : "border-slate-200 dark:border-slate-800"
              )}
            >
              {index === 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
                  <Star size={12} />
                  الأكثر شيوعاً
                </div>
              )}

              <div className="text-center mb-6">
                <div className={cn(
                  "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4",
                  index === 0 ? "bg-slate-100 dark:bg-slate-800" :
                  index === 1 ? "bg-gradient-to-br from-violet-500 to-purple-600" :
                  "bg-gradient-to-br from-amber-500 to-orange-600"
                )}>
                  <Package size={28} className={index === 0 ? "text-slate-600" : "text-white"} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">{plan.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-slate-500 mr-1">ر.س</span>
                <span className="text-slate-400 text-sm block">
                  / {plan.duration_value} {plan.duration_unit === 'days' ? 'يوم' : plan.duration_unit === 'months' ? 'شهر' : 'سنة'}
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {['جميع المميزات متاحة', 'دعم فني على مدار الساعة', 'تحديثات مجانية'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setShowPaymentModal(plan)}
                className={cn(
                  "w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                  index === 1 
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                <Zap size={18} />
                {currentSubscription ? 'ترقية / تجديد' : 'اشترك الآن'}
              </button>
            </motion.div>
          ))}
        </div>

        {paymentHistory.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <History size={24} className="text-blue-600" />
              سجل عمليات الدفع
            </h3>
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      payment.status === 'pending' ? "bg-amber-100 dark:bg-amber-900/30" :
                      payment.status === 'approved' ? "bg-emerald-100 dark:bg-emerald-900/30" :
                      "bg-red-100 dark:bg-red-900/30"
                    )}>
                      {payment.status === 'pending' ? <Clock size={20} className="text-amber-600" /> :
                       payment.status === 'approved' ? <CheckCircle2 size={20} className="text-emerald-600" /> :
                       <X size={20} className="text-red-600" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{payment.plan_name}</p>
                      <p className="text-sm text-slate-500">{new Date(payment.created_at).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-900 dark:text-white">{payment.amount} ر.س</p>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      payment.status === 'pending' ? "bg-amber-100 text-amber-700" :
                      payment.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {payment.status === 'pending' ? 'قيد المراجعة' : payment.status === 'approved' ? 'مقبول' : 'مرفوض'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                طلب اشتراك - {showPaymentModal.name}
              </h3>
              <p className="text-slate-500 mb-6">المبلغ: {showPaymentModal.price} ر.س</p>

              {bankAccounts.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                    <Landmark size={18} className="text-blue-600" />
                    حسابات الدفع المتاحة
                  </h4>
                  <div className="space-y-3">
                    {bankAccounts.map((bank) => (
                      <div key={bank.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="font-bold text-slate-900 dark:text-white">{bank.bank_name}</p>
                        <p className="text-sm text-slate-500">{bank.account_holder}</p>
                        <p className="text-xs font-mono text-slate-400 mt-1">{bank.iban}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    اختر طريقة الدفع
                  </label>
                  <select name="bank_account_id" className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold">
                    <option value="">-- اختر الحساب البنكي --</option>
                    {bankAccounts.map((bank) => (
                      <option key={bank.id} value={bank.id}>{bank.bank_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    إيصال الدفع
                  </label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center">
                    {receiptImage ? (
                      <div className="relative">
                        <img src={receiptImage} alt="Receipt" className="max-h-40 mx-auto rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setReceiptImage(null)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">اضغط لرفع صورة الإيصال</p>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    ملاحظات (اختياري)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
                    placeholder="أي ملاحظات إضافية..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <RefreshCw size={18} className="animate-spin" /> : <CreditCard size={18} />}
                    إرسال طلب الاشتراك
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(null)}
                    className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
