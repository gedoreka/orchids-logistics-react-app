"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Crown,
  CheckCircle2,
  Clock,
  CreditCard,
  Landmark,
  Star,
  Zap,
  Upload,
  X,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  History,
  Shield,
  Gem,
  Rocket,
  Sparkles,
  Trophy,
  Diamond,
  Wallet,
  Lock,
  BadgeCheck,
  PartyPopper,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

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

// ---- Embedded Stripe Payment Form ----
function StripePaymentForm({ 
  plan, 
  onSuccess, 
  onCancel, 
  paymentIntentId, 
  isRTL 
}: { 
  plan: Plan; 
  onSuccess: (data: any) => void; 
  onCancel: () => void; 
  paymentIntentId: string;
  isRTL: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message || (isRTL ? "حدث خطأ في الدفع" : "Payment error"));
      setIsProcessing(false);
    } else if (result.paymentIntent?.status === "succeeded") {
      // Verify on server and activate subscription
      try {
        const res = await fetch("/api/stripe/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_intent_id: paymentIntentId }),
        });
        const data = await res.json();
        if (data.success) {
          onSuccess(data);
        } else {
          setError(data.error || (isRTL ? "حدث خطأ في التحقق" : "Verification error"));
          setIsProcessing(false);
        }
      } catch {
        setError(isRTL ? "حدث خطأ في الاتصال" : "Connection error");
        setIsProcessing(false);
      }
    } else {
      setError(isRTL ? "لم يكتمل الدفع" : "Payment incomplete");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-inner">
        <PaymentElement 
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 flex items-center gap-3"
        >
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}

      {/* Amount Summary */}
      <div className="bg-white/40 dark:bg-white/5 rounded-2xl p-5 border border-[#c48da3]/20 dark:border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {isRTL ? "الباقة" : "Plan"}
          </span>
          <span className="font-bold text-slate-700 dark:text-slate-300">{plan.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
            {isRTL ? "المبلغ الإجمالي" : "Total Amount"}
          </span>
          <span className="text-2xl font-black text-slate-800 dark:text-white">
            {plan.price} {isRTL ? "ر.س" : "SAR"}
          </span>
        </div>
      </div>

      <div className="flex gap-4 pt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all"
        >
          {isProcessing ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              {isRTL ? "جاري المعالجة..." : "Processing..."}
            </>
          ) : (
            <>
              <Lock size={18} />
              {isRTL ? `تأكيد الدفع - ${plan.price} ر.س` : `Confirm Payment - ${plan.price} SAR`}
            </>
          )}
        </motion.button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="px-8 py-4 bg-white/60 text-slate-600 dark:bg-white/5 dark:text-slate-300 font-black rounded-2xl border border-[#c48da3]/30 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all disabled:opacity-50"
        >
          {isRTL ? "إلغاء" : "Cancel"}
        </button>
      </div>
    </form>
  );
}

// ---- Success Overlay ----
function PaymentSuccessOverlay({ 
  data, 
  onClose, 
  isRTL 
}: { 
  data: { plan_name: string; end_date: string }; 
  onClose: () => void;
  isRTL: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
        className="relative w-full max-w-md"
      >
        {/* Confetti Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0.5],
              x: (Math.random() - 0.5) * 300,
              y: (Math.random() - 0.5) * 300 - 100,
            }}
            transition={{ duration: 1.5, delay: 0.2 + i * 0.05, ease: "easeOut" }}
            className={cn(
              "absolute top-1/2 left-1/2 w-3 h-3 rounded-full",
              ["bg-emerald-400", "bg-yellow-400", "bg-blue-400", "bg-pink-400", "bg-purple-400", "bg-orange-400"][i % 6]
            )}
          />
        ))}

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-emerald-200 dark:border-emerald-500/20 text-center relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-green-50 dark:from-emerald-500/5 dark:to-green-500/5" />
          
          <div className="relative z-10">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.3 }}
              className="mx-auto mb-6"
            >
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-600 dark:from-emerald-500 dark:to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <ShieldCheck size={56} className="text-white" strokeWidth={2.5} />
                </motion.div>
              </div>
            </motion.div>

            {/* Success Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-black mb-4"
            >
              <BadgeCheck size={16} />
              {isRTL ? "تمت العملية بنجاح" : "Payment Successful"}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-3xl font-black text-slate-800 dark:text-white mb-3"
            >
              {isRTL ? "مبروك! تم التفعيل" : "Congratulations!"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed"
            >
              {isRTL 
                ? `تم تفعيل اشتراكك في باقة "${data.plan_name}" بنجاح. استمتع بجميع المميزات الآن!`
                : `Your "${data.plan_name}" subscription has been activated. Enjoy all features now!`
              }
            </motion.p>

            {/* Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-emerald-50/80 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 mb-8 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-600/70 dark:text-emerald-400/70 flex items-center gap-2">
                  <Crown size={14} />
                  {isRTL ? "الباقة" : "Plan"}
                </span>
                <span className="font-black text-emerald-700 dark:text-emerald-300">{data.plan_name}</span>
              </div>
              <div className="h-px bg-emerald-200/50 dark:bg-emerald-500/10" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-600/70 dark:text-emerald-400/70 flex items-center gap-2">
                  <Clock size={14} />
                  {isRTL ? "صالح حتى" : "Valid Until"}
                </span>
                <span className="font-black text-emerald-700 dark:text-emerald-300">
                  {new Date(data.end_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
              <div className="h-px bg-emerald-200/50 dark:bg-emerald-500/10" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-600/70 dark:text-emerald-400/70 flex items-center gap-2">
                  <CreditCard size={14} />
                  {isRTL ? "طريقة الدفع" : "Payment"}
                </span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-xs">Stripe</span>
                </span>
              </div>
            </motion.div>

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all"
            >
              <PartyPopper size={20} />
              {isRTL ? "ممتاز! متابعة" : "Awesome! Continue"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ---- Main Page ----
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
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'stripe'>('bank');

  // Stripe embedded state
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);

  // Success overlay
  const [successData, setSuccessData] = useState<{ plan_name: string; end_date: string } | null>(null);

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

  const initStripePayment = async () => {
    if (!showPaymentModal) return;
    setStripeLoading(true);
    setStripeClientSecret(null);
    
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: showPaymentModal.id,
          request_type: currentSubscription ? 'renewal' : 'new'
        })
      });
      
      const result = await res.json();
      if (result.success && result.clientSecret) {
        setStripeClientSecret(result.clientSecret);
        setStripePaymentIntentId(result.paymentIntentId);
      } else {
        toast.error(result.error || (isRTL ? 'حدث خطأ في إعداد الدفع' : 'Error setting up payment'));
      }
    } catch {
      toast.error(isRTL ? 'حدث خطأ في الاتصال' : 'Connection error');
    }
    setStripeLoading(false);
  };

  // Load Stripe when selecting stripe payment method
  useEffect(() => {
    if (paymentMethod === 'stripe' && showPaymentModal && !stripeClientSecret) {
      initStripePayment();
    }
  }, [paymentMethod, showPaymentModal]);

  const handleStripeSuccess = useCallback((data: any) => {
    setShowPaymentModal(null);
    setStripeClientSecret(null);
    setStripePaymentIntentId(null);
    setSuccessData(data);
    fetchData();
  }, []);

  const handleCloseSuccess = () => {
    setSuccessData(null);
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

  const closePaymentModal = () => {
    setShowPaymentModal(null);
    setStripeClientSecret(null);
    setStripePaymentIntentId(null);
    setPaymentMethod('bank');
  };

  const isSubscriptionActive = companySubscription?.is_subscription_active === 1;
  const subscriptionEndDate = companySubscription?.subscription_end_date;
  const daysRemaining = subscriptionEndDate 
    ? Math.ceil((new Date(subscriptionEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw size={40} className="animate-spin text-[#c48da3] dark:text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-[75%] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#edd3de] border-[#d4a0b5] shadow-lg shadow-[#d4a0b5]/30 hover:border-[#c48da3] hover:shadow-xl hover:shadow-[#d4a0b5]/40 rounded-[2.5rem] backdrop-blur-xl border overflow-hidden transition-all duration-500 dark:bg-slate-900/50 dark:border-white/10 dark:shadow-2xl dark:hover:border-white/10 dark:hover:shadow-2xl"
        >
          {/* Page Header */}
          <div className="p-8 border-b border-[#d4a0b5]/30 bg-gradient-to-r from-[#d4a0b5]/20 to-[#c48da3]/10 dark:border-white/5 dark:bg-gradient-to-r dark:from-violet-500/10 dark:to-purple-500/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                    <h1 className="text-3xl font-black flex items-center gap-4 subscription-title">
                        <div className="p-3.5 bg-gradient-to-br from-[#c48da3] to-[#d4a0b5] dark:from-violet-500 dark:to-purple-600 rounded-2xl shadow-lg shadow-[#d4a0b5]/30 dark:shadow-violet-500/20">
                          <Crown size={32} className="text-[#ffffff]" />
                        </div>
                        {t('title')}
                      </h1>
                      <p className="mt-2 font-medium subscription-subtitle">{t('subtitle')}</p>
              </div>

              {currentSubscription && (
                <div className={cn(
                  "px-6 py-4 rounded-3xl border flex items-center gap-4",
                  isSubscriptionActive && daysRemaining > 7
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400"
                    : isSubscriptionActive && daysRemaining > 0
                    ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-400"
                    : "bg-red-50 border-red-200 text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
                )}>
                  <div className="w-12 h-12 rounded-2xl bg-current/10 flex items-center justify-center">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold opacity-80">{t('currentSub', { plan: currentSubscription.plan_name })}</p>
                    <p className="text-xl font-black">{daysRemaining > 0 ? daysRemaining : 0} {t('daysRemaining')}</p>
                    <p className="text-[10px] font-medium opacity-60">
                      {t('expiresAt', { date: new Date(currentSubscription.end_date).toLocaleDateString(isRTL ?  'en-US'  : 'en-US') })}
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
                  className="bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 p-6 rounded-3xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-2xl">
                      <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-red-600 dark:text-red-400 text-lg">{t('noActiveSub')}</h3>
                      <p className="text-red-400/70 text-sm font-medium">
                        {t('noActiveSubDesc')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Plan Cards */}
              {(() => {
                const luxuryPalette = [
                  { icon: Gem, from: "from-rose-400", to: "to-pink-600", shadow: "shadow-rose-400/30", darkFrom: "dark:from-rose-500", darkTo: "dark:to-pink-600", btnFrom: "from-rose-400", btnTo: "to-pink-500", ring: "ring-rose-400/30" },
                  { icon: Crown, from: "from-[#c48da3]", to: "to-[#d4a0b5]", shadow: "shadow-[#d4a0b5]/30", darkFrom: "dark:from-violet-500", darkTo: "dark:to-purple-600", btnFrom: "from-[#c48da3]", btnTo: "to-[#d4a0b5]", ring: "ring-[#c48da3]/30" },
                  { icon: Trophy, from: "from-amber-400", to: "to-orange-500", shadow: "shadow-amber-400/30", darkFrom: "dark:from-amber-500", darkTo: "dark:to-orange-600", btnFrom: "from-amber-400", btnTo: "to-orange-500", ring: "ring-amber-400/30" },
                  { icon: Diamond, from: "from-cyan-400", to: "to-blue-600", shadow: "shadow-cyan-400/30", darkFrom: "dark:from-cyan-500", darkTo: "dark:to-blue-600", btnFrom: "from-cyan-400", btnTo: "to-blue-500", ring: "ring-cyan-400/30" },
                  { icon: Rocket, from: "from-emerald-400", to: "to-teal-600", shadow: "shadow-emerald-400/30", darkFrom: "dark:from-emerald-500", darkTo: "dark:to-teal-600", btnFrom: "from-emerald-400", btnTo: "to-teal-500", ring: "ring-emerald-400/30" },
                  { icon: Sparkles, from: "from-fuchsia-400", to: "to-purple-600", shadow: "shadow-fuchsia-400/30", darkFrom: "dark:from-fuchsia-500", darkTo: "dark:to-purple-600", btnFrom: "from-fuchsia-400", btnTo: "to-purple-500", ring: "ring-fuchsia-400/30" },
                ];

                return (
                  <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => {
                      const style = luxuryPalette[index % luxuryPalette.length];
                      const IconComp = style.icon;
                      const isFeatured = index === 1;

                      return (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "relative backdrop-blur-sm rounded-[2rem] p-8 border transition-all hover:translate-y-[-4px]",
                            isFeatured
                              ? `bg-white/60 border-[#c48da3] shadow-xl ${style.shadow} ring-1 ${style.ring} hover:bg-white/80 dark:bg-white/5 dark:border-violet-500/50 dark:shadow-violet-500/10 dark:ring-violet-500/20 dark:hover:bg-white/10`
                              : "bg-white/60 border-[#c48da3]/40 hover:border-[#c48da3]/60 hover:bg-white/80 dark:bg-white/5 dark:border-white/5 dark:hover:bg-white/10"
                          )}
                        >
                          {isFeatured && (
                            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r ${style.btnFrom} ${style.btnTo} ${style.darkFrom} ${style.darkTo} text-white text-[10px] font-black rounded-full flex items-center gap-2 shadow-lg`}>
                              <Star size={12} />
                              {t('mostPopular')}
                            </div>
                          )}

                          <div className="text-center mb-8">
                            <div className={`w-20 h-20 mx-auto rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl bg-gradient-to-br ${style.from} ${style.to} ${style.darkFrom} ${style.darkTo} text-white`}>
                              <IconComp size={36} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{isRTL ? plan.name : (plan.name_en || plan.name)}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium leading-relaxed">{plan.description}</p>
                          </div>

                          <div className="text-center mb-8 bg-white/50 dark:bg-white/5 py-4 rounded-2xl border border-[#c48da3]/20 dark:border-transparent">
                            <span className="text-5xl font-black text-slate-800 dark:text-white">{plan.price}</span>
                            <span className="text-slate-500 dark:text-slate-400 mr-2 font-bold">{t('sar')}</span>
                            <div className="text-slate-400 dark:text-slate-500 text-sm mt-1 font-bold">
                              {t('per')} {plan.duration_value} {plan.duration_unit === 'days' ? t('day') : plan.duration_unit === 'months' ? t('month') : t('year')}
                            </div>
                          </div>

                          <ul className="space-y-4 mb-8 px-2">
                            {[t('features.all'), t('features.support'), t('features.updates')].map((feature, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 font-medium">
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setShowPaymentModal(plan); setPaymentMethod('bank'); setStripeClientSecret(null); }}
                            className={cn(
                              "w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg",
                              isFeatured
                                ? `bg-gradient-to-r ${style.btnFrom} ${style.btnTo} text-white ${style.shadow} ${style.darkFrom} ${style.darkTo} dark:shadow-violet-500/20`
                                : "bg-white/80 text-slate-700 hover:bg-white border border-[#c48da3]/30 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:border-white/5"
                            )}
                          >
                            <Zap size={20} />
                            {currentSubscription ? t('upgradeRenew') : t('subscribeNow')}
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Payment History */}
            {paymentHistory.length > 0 && (
              <div className="bg-white/60 border-[#c48da3]/40 hover:border-[#c48da3]/60 rounded-[2rem] p-8 border transition-colors dark:bg-white/5 dark:border-white/5">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-2xl">
                    <History size={28} className="text-blue-500 dark:text-blue-400" />
                  </div>
                  {t('paymentHistory')}
                </h3>
                <div className="grid gap-4">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/50 hover:bg-white/80 border border-[#c48da3]/30 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/5 rounded-3xl transition-all"
                    >
                      <div className="flex items-center gap-5 mb-4 md:mb-0">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
                          payment.status === 'pending' ? "bg-amber-100 text-amber-500 dark:bg-amber-500/20" :
                          payment.status === 'approved' ? "bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20" :
                          "bg-red-100 text-red-500 dark:bg-red-500/20"
                        )}>
                          {payment.status === 'pending' ? <Clock size={28} /> :
                           payment.status === 'approved' ? <CheckCircle2 size={28} /> :
                           <X size={28} />}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-800 dark:text-white">{payment.plan_name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{new Date(payment.created_at).toLocaleDateString(isRTL ?  'en-US'  : 'en-US')}</p>
                            {(payment.receipt_image?.startsWith('stripe_session:') || payment.receipt_image?.startsWith('stripe_pi:')) && (
                              <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black flex items-center gap-1">
                                <CreditCard size={10} />
                                Stripe
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:text-left gap-8">
                        <div>
                          <p className="text-xl font-black text-slate-800 dark:text-white">{payment.amount} {t('sar')}</p>
                          <div className={cn(
                            "inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black mt-2",
                            payment.status === 'pending' ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500" :
                            payment.status === 'approved' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500" :
                            "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500"
                          )}>
                            {t(payment.status)}
                          </div>
                        </div>
                        <ChevronRight size={24} className="text-slate-300 dark:text-white/10 hidden md:block" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePaymentModal}
              className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#edd3de] border border-[#d4a0b5] dark:bg-slate-900 dark:border-white/10 rounded-[3rem] p-8 shadow-2xl shadow-[#d4a0b5]/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                  {t('paymentRequest', { plan: showPaymentModal.name })}
                </h3>
                <button 
                  onClick={closePaymentModal}
                  className="p-2 hover:bg-white/40 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} className="text-slate-400 dark:text-white/40" />
                </button>
              </div>

              {/* Plan summary */}
              <div className="bg-white/60 border border-[#c48da3]/40 dark:bg-violet-500/10 dark:border-violet-500/20 p-6 rounded-3xl mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#c48da3]/20 dark:bg-violet-500/20 rounded-2xl text-[#c48da3] dark:text-violet-400">
                    <Zap size={24} />
                  </div>
                  <span className="font-bold text-slate-800 dark:text-white text-lg">{showPaymentModal.name}</span>
                </div>
                <span className="text-2xl font-black text-[#c48da3] dark:text-violet-400">
                  {t('amount', { amount: showPaymentModal.price, currency: t('sar') })}
                </span>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h4 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-3 px-1">
                  <Wallet size={20} className="text-[#c48da3] dark:text-violet-400" />
                  {isRTL ? 'اختر طريقة الدفع' : 'Choose Payment Method'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Bank Transfer Option */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod('bank')}
                    className={cn(
                      "relative p-5 rounded-2xl border-2 transition-all text-center",
                      paymentMethod === 'bank'
                        ? "border-[#c48da3] bg-white/80 dark:bg-violet-500/10 dark:border-violet-500 shadow-lg shadow-[#c48da3]/20 dark:shadow-violet-500/20"
                        : "border-[#c48da3]/20 bg-white/40 dark:bg-white/5 dark:border-white/10 hover:border-[#c48da3]/50 dark:hover:border-white/20"
                    )}
                  >
                    {paymentMethod === 'bank' && (
                      <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-[#c48da3] dark:bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                    )}
                    <div className={cn(
                      "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3",
                      paymentMethod === 'bank'
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "bg-slate-100 dark:bg-white/10 text-slate-400"
                    )}>
                      <Landmark size={28} />
                    </div>
                    <p className={cn(
                      "font-black text-sm",
                      paymentMethod === 'bank' ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"
                    )}>
                      {isRTL ? 'تحويل بنكي' : 'Bank Transfer'}
                    </p>
                    <p className={cn(
                      "text-[10px] mt-1 font-medium",
                      paymentMethod === 'bank' ? "text-slate-500 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
                    )}>
                      {isRTL ? 'تحويل لحساب بنكي' : 'Transfer to bank account'}
                    </p>
                  </motion.button>

                  {/* Stripe Card Payment Option */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod('stripe')}
                    className={cn(
                      "relative p-5 rounded-2xl border-2 transition-all text-center",
                      paymentMethod === 'stripe'
                        ? "border-indigo-500 bg-white/80 dark:bg-indigo-500/10 dark:border-indigo-500 shadow-lg shadow-indigo-500/20"
                        : "border-[#c48da3]/20 bg-white/40 dark:bg-white/5 dark:border-white/10 hover:border-indigo-400/50 dark:hover:border-white/20"
                    )}
                  >
                    {paymentMethod === 'stripe' && (
                      <div className="absolute -top-2.5 -right-2.5 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                    )}
                    <div className={cn(
                      "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3",
                      paymentMethod === 'stripe'
                        ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "bg-slate-100 dark:bg-white/10 text-slate-400"
                    )}>
                      <CreditCard size={28} />
                    </div>
                    <p className={cn(
                      "font-black text-sm",
                      paymentMethod === 'stripe' ? "text-slate-800 dark:text-white" : "text-slate-500 dark:text-slate-400"
                    )}>
                      {isRTL ? 'بطاقة ائتمان / Stripe' : 'Credit Card / Stripe'}
                    </p>
                    <p className={cn(
                      "text-[10px] mt-1 font-medium",
                      paymentMethod === 'stripe' ? "text-slate-500 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"
                    )}>
                      {isRTL ? 'Visa, Mastercard, مدى' : 'Visa, Mastercard, mada'}
                    </p>
                  </motion.button>
                </div>
              </div>

              {/* Stripe Payment Section - EMBEDDED */}
              <AnimatePresence mode="wait">
                {paymentMethod === 'stripe' && (
                  <motion.div
                    key="stripe"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Stripe Security Badge */}
                    <div className="flex items-center gap-3 px-1">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                        <Lock size={16} />
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-800 dark:text-white">
                          {isRTL ? 'دفع آمن ومشفر' : 'Secure & Encrypted Payment'}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {isRTL ? 'محمي بواسطة Stripe - معايير PCI DSS' : 'Protected by Stripe - PCI DSS Certified'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mr-auto">
                        {['Visa', 'Mastercard', 'mada'].map((card) => (
                          <span key={card} className="px-2 py-1 bg-white dark:bg-white/10 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                            {card}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Embedded Stripe Elements */}
                    {stripeLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                          <RefreshCw size={32} className="animate-spin text-indigo-500 mx-auto mb-4" />
                          <p className="font-bold text-slate-500 dark:text-slate-400">
                            {isRTL ? 'جاري تحميل نموذج الدفع...' : 'Loading payment form...'}
                          </p>
                        </div>
                      </div>
                    ) : stripeClientSecret ? (
                      <Elements
                        stripe={stripePromise}
                        options={{
                          clientSecret: stripeClientSecret,
                          appearance: {
                            theme: "stripe",
                            variables: {
                              colorPrimary: "#6366f1",
                              colorBackground: "#ffffff",
                              colorText: "#1e293b",
                              colorDanger: "#ef4444",
                              fontFamily: "inherit",
                              borderRadius: "16px",
                              spacingUnit: "4px",
                            },
                            rules: {
                              ".Input": {
                                border: "1px solid #e2e8f0",
                                boxShadow: "none",
                                padding: "12px 16px",
                              },
                              ".Input:focus": {
                                border: "2px solid #6366f1",
                                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                              },
                              ".Label": {
                                fontWeight: "700",
                                fontSize: "13px",
                                marginBottom: "6px",
                              },
                              ".Tab": {
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                              },
                              ".Tab--selected": {
                                borderColor: "#6366f1",
                                backgroundColor: "#eef2ff",
                              },
                            },
                          },
                          locale: isRTL ? "ar" : "en",
                        }}
                      >
                        <StripePaymentForm
                          plan={showPaymentModal}
                          onSuccess={handleStripeSuccess}
                          onCancel={closePaymentModal}
                          paymentIntentId={stripePaymentIntentId!}
                          isRTL={isRTL}
                        />
                      </Elements>
                    ) : (
                      <div className="text-center py-10">
                        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
                        <p className="font-bold text-slate-500 dark:text-slate-400">
                          {isRTL ? 'تعذر تحميل نموذج الدفع' : 'Failed to load payment form'}
                        </p>
                        <button
                          onClick={initStripePayment}
                          className="mt-4 px-6 py-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
                        >
                          {isRTL ? 'إعادة المحاولة' : 'Retry'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Bank Transfer Section */}
                {paymentMethod === 'bank' && (
                  <motion.div
                    key="bank"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {/* Bank accounts */}
                    {bankAccounts.length > 0 && (
                      <div className="bg-white/60 border-[#c48da3]/40 rounded-3xl p-6 mb-8 border dark:bg-white/5 dark:border-white/5">
                        <h4 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-3">
                          <Landmark size={20} className="text-blue-500 dark:text-blue-400" />
                          {t('availableBanks')}
                        </h4>
                        <div className="space-y-3">
                          {bankAccounts.map((bank) => (
                            <div key={bank.id} className="bg-white/50 dark:bg-black/30 p-4 rounded-2xl border border-[#c48da3]/30 dark:border-white/5">
                              <p className="font-black text-slate-800 dark:text-white">{bank.bank_name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{bank.account_holder}</p>
                              <p className="text-xs font-mono text-[#c48da3] dark:text-blue-400 mt-2 tracking-wider bg-[#c48da3]/10 dark:bg-blue-500/10 inline-block px-3 py-1 rounded-lg">{bank.iban}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleSubmitPayment} className="space-y-6">
                      <div>
                        <label className="block text-sm font-black text-slate-600 dark:text-slate-300 mb-3 px-2">
                          {t('selectBank')}
                        </label>
                        <select 
                          name="bank_account_id" 
                          required
                          className="w-full px-6 py-4 bg-white/60 border border-[#c48da3]/40 hover:border-[#c48da3] focus:ring-2 focus:ring-pink-500/20 focus:border-[#c48da3] rounded-2xl text-slate-800 dark:text-white font-bold outline-none transition-all appearance-none dark:bg-white/5 dark:border-white/10 dark:focus:border-violet-500/50"
                        >
                          <option value="" className="bg-white dark:bg-slate-900">{t('selectBankPlaceholder')}</option>
                          {bankAccounts.map((bank) => (
                            <option key={bank.id} value={bank.id} className="bg-white dark:bg-slate-900">{bank.bank_name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-black text-slate-600 dark:text-slate-300 mb-3 px-2">
                          {t('receipt')}
                        </label>
                        <div className={cn(
                          "border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer group",
                          receiptImage 
                            ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-500/5" 
                            : "border-[#c48da3]/40 bg-white/40 hover:border-[#c48da3] hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
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
                              <div className="w-16 h-16 bg-[#c48da3]/10 dark:bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={32} className="text-[#c48da3] dark:text-slate-400" />
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-300 font-bold">{t('uploadReceipt')}</p>
                              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} required />
                            </label>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-black text-slate-600 dark:text-slate-300 mb-3 px-2">
                          {t('notes')}
                        </label>
                        <textarea
                          name="notes"
                          rows={2}
                          className="w-full px-6 py-4 bg-white/60 border border-[#c48da3]/40 hover:border-[#c48da3] focus:ring-2 focus:ring-pink-500/20 focus:border-[#c48da3] rounded-2xl text-slate-800 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none transition-all resize-none dark:bg-white/5 dark:border-white/10 dark:focus:border-violet-500/50"
                          placeholder={t('notesPlaceholder')}
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 py-4 bg-gradient-to-r from-[#c48da3] to-[#d4a0b5] dark:from-violet-600 dark:to-purple-700 text-white font-black rounded-2xl shadow-xl shadow-[#d4a0b5]/30 dark:shadow-violet-500/20 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          {isSubmitting ? <RefreshCw size={20} className="animate-spin" /> : <CreditCard size={20} />}
                          {t('submitRequest')}
                        </motion.button>
                        <button
                          type="button"
                          onClick={closePaymentModal}
                          className="px-8 py-4 bg-white/60 text-slate-600 dark:bg-white/5 dark:text-slate-300 font-black rounded-2xl border border-[#c48da3]/30 dark:border-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
                        >
                          {t('cancel')}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Success Overlay */}
      <AnimatePresence>
        {successData && (
          <PaymentSuccessOverlay
            data={successData}
            onClose={handleCloseSuccess}
            isRTL={isRTL}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
