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
import { useTranslations, useLocale } from "@/lib/locale-context";

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
  const t = useTranslations('subscriptions');
  const { isRTL, locale } = useLocale();
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
        toast.success(t('success'));
        setShowPaymentModal(null);
        setReceiptImage(null);
        fetchData();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error(t('error'));
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw size={40} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-[75%] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          {/* Page Header inside the card */}
          <div className="p-8 border-b border-white/5 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-4">
                  <div className="p-3.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/20">
                    <Crown size={32} className="text-white" />
                  </div>
                  {t('title')}
                </h1>
                <p className="text-slate-400 mt-2 font-medium">{t('subtitle')}</p>
              </div>

              {currentSubscription && (
                <div className={cn(
                  "px-6 py-4 rounded-3xl border flex items-center gap-4",
                  isSubscriptionActive && daysRemaining > 7
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : isSubscriptionActive && daysRemaining > 0
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                  <div className="w-12 h-12 rounded-2xl bg-current/10 flex items-center justify-center">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold opacity-80">{t('currentSub', { plan: currentSubscription.plan_name })}</p>
                    <p className="text-xl font-black">{daysRemaining > 0 ? daysRemaining : 0} {t('daysRemaining')}</p>
                    <p className="text-[10px] font-medium opacity-60">
                      {t('expiresAt', { date: new Date(currentSubscription.end_date).toLocaleDateString(isRTL ? \'en-US\' : 'en-US') })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 space-y-10">
            {!isSubscriptionActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/20 rounded-2xl">
                    <AlertCircle size={32} className="text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-black text-red-400 text-lg">{t('noActiveSub')}</h3>
                    <p className="text-red-400/70 text-sm font-medium">
                      {t('noActiveSubDesc')}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "relative bg-white/5 backdrop-blur-sm rounded-[2rem] p-8 border transition-all hover:translate-y-[-4px] hover:bg-white/10",
                    index === 1 
                      ? "border-violet-500/50 shadow-xl shadow-violet-500/10 ring-1 ring-violet-500/20" 
                      : "border-white/5"
                  )}
                >
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-full flex items-center gap-2 shadow-lg">
                      <Star size={12} />
                      {t('mostPopular')}
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <div className={cn(
                      "w-20 h-20 mx-auto rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl",
                      index === 0 ? "bg-slate-800 text-slate-400" :
                      index === 1 ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white" :
                      "bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                    )}>
                      <Package size={36} />
                    </div>
                    <h3 className="text-2xl font-black text-white">{isRTL ? plan.name : (plan.name_en || plan.name)}</h3>
                    <p className="text-slate-400 text-sm mt-2 font-medium leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="text-center mb-8 bg-white/5 py-4 rounded-2xl">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-400 mr-2 font-bold">{t('sar')}</span>
                    <div className="text-slate-500 text-sm mt-1 font-bold">
                      {t('per')} {plan.duration_value} {plan.duration_unit === 'days' ? t('day') : plan.duration_unit === 'months' ? t('month') : t('year')}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8 px-2">
                    {[t('features.all'), t('features.support'), t('features.updates')].map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPaymentModal(plan)}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg",
                      index === 1 
                        ? "bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-violet-500/20" 
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/5"
                    )}
                  >
                    <Zap size={20} />
                    {currentSubscription ? t('upgradeRenew') : t('subscribeNow')}
                  </motion.button>
                </motion.div>
              ))}
            </div>

            {paymentHistory.length > 0 && (
              <div className="bg-white/5 rounded-[2rem] p-8 border border-white/5">
                <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-2xl">
                    <History size={28} className="text-blue-400" />
                  </div>
                  {t('paymentHistory')}
                </h3>
                <div className="grid gap-4">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl transition-all"
                    >
                      <div className="flex items-center gap-5 mb-4 md:mb-0">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
                          payment.status === 'pending' ? "bg-amber-500/20 text-amber-500" :
                          payment.status === 'approved' ? "bg-emerald-500/20 text-emerald-500" :
                          "bg-red-500/20 text-red-500"
                        )}>
                          {payment.status === 'pending' ? <Clock size={28} /> :
                           payment.status === 'approved' ? <CheckCircle2 size={28} /> :
                           <X size={28} />}
                        </div>
                        <div>
                          <p className="text-lg font-black text-white">{payment.plan_name}</p>
                          <p className="text-sm text-slate-500 font-medium">{new Date(payment.created_at).toLocaleDateString(isRTL ? \'en-US\' : 'en-US')}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:text-left gap-8">
                        <div>
                          <p className="text-xl font-black text-white">{payment.amount} {t('sar')}</p>
                          <div className={cn(
                            "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black mt-2",
                            payment.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                            payment.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                            "bg-red-500/10 text-red-500"
                          )}>
                            {t(payment.status)}
                          </div>
                        </div>
                        <ChevronRight size={24} className="text-white/10 hidden md:block" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white">
                  {t('paymentRequest', { plan: showPaymentModal.name })}
                </h3>
                <button 
                  onClick={() => setShowPaymentModal(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} className="text-white/40" />
                </button>
              </div>

              <div className="bg-violet-500/10 border border-violet-500/20 p-6 rounded-3xl mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-violet-500/20 rounded-2xl text-violet-400">
                    <Zap size={24} />
                  </div>
                  <span className="font-bold text-white text-lg">{showPaymentModal.name}</span>
                </div>
                <span className="text-2xl font-black text-violet-400">
                  {t('amount', { amount: showPaymentModal.price, currency: t('sar') })}
                </span>
              </div>

              {bankAccounts.length > 0 && (
                <div className="bg-white/5 rounded-3xl p-6 mb-8 border border-white/5">
                  <h4 className="font-black text-white mb-4 flex items-center gap-3">
                    <Landmark size={20} className="text-blue-400" />
                    {t('availableBanks')}
                  </h4>
                  <div className="space-y-3">
                    {bankAccounts.map((bank) => (
                      <div key={bank.id} className="bg-black/30 p-4 rounded-2xl border border-white/5">
                        <p className="font-black text-white">{bank.bank_name}</p>
                        <p className="text-sm text-slate-400 font-medium mt-1">{bank.account_holder}</p>
                        <p className="text-xs font-mono text-blue-400 mt-2 tracking-wider bg-blue-500/10 inline-block px-3 py-1 rounded-lg">{bank.iban}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitPayment} className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-slate-300 mb-3 px-2">
                    {t('selectBank')}
                  </label>
                  <select 
                    name="bank_account_id" 
                    required
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none focus:border-violet-500/50 transition-all appearance-none"
                  >
                    <option value="" className="bg-slate-900">{t('selectBankPlaceholder')}</option>
                    {bankAccounts.map((bank) => (
                      <option key={bank.id} value={bank.id} className="bg-slate-900">{bank.bank_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-300 mb-3 px-2">
                    {t('receipt')}
                  </label>
                  <div className={cn(
                    "border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer group",
                    receiptImage ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  )}>
                    {receiptImage ? (
                      <div className="relative">
                        <img src={receiptImage} alt="Receipt" className="max-h-48 mx-auto rounded-2xl shadow-2xl" />
                        <button
                          type="button"
                          onClick={() => setReceiptImage(null)}
                          className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block w-full">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Upload size={32} className="text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-300 font-bold">{t('uploadReceipt')}</p>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} required />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-slate-300 mb-3 px-2">
                    {t('notes')}
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium placeholder:text-slate-600 outline-none focus:border-violet-500/50 transition-all resize-none"
                    placeholder={t('notesPlaceholder')}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-purple-700 text-white font-black rounded-2xl shadow-xl shadow-violet-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? <RefreshCw size={20} className="animate-spin" /> : <CreditCard size={20} />}
                    {t('submitRequest')}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(null)}
                    className="px-8 py-4 bg-white/5 text-slate-300 font-black rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
                  >
                    {t('cancel')}
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
