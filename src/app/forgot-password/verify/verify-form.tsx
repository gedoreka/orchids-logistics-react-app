"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  Clock,
  UserCircle,
  Send,
  ArrowLeft,
  Truck,
  Globe,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { verifyTokenAction, forgotPasswordAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface VerifyFormProps {
  email: string;
  userName: string;
}

export default function VerifyForm({ email, userName }: VerifyFormProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [resendTimeLeft, setResendTimeLeft] = useState(60);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const resendTimer = setInterval(() => {
      setResendTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(resendTimer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (token.length !== 6) {
      setError("يرجى إدخال رمز مكون من 6 أرقام");
      setIsLoading(false);
      return;
    }
    
    const formData = new FormData();
    formData.append("token", token);

    const result = await verifyTokenAction(formData);

    if (result.success) {
      router.push("/forgot-password/reset");
    } else {
      setError(result.error || "رمز التحقق غير صحيح");
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", email);

    const result = await forgotPasswordAction(formData);
    
    if (result.success) {
      setResendTimeLeft(60);
      setTimeLeft(15 * 60);
      setError("");
    } else {
      setError(result.error || "فشل إعادة إرسال الرمز");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      {/* Left Side: Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1e293b] items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#3b82f6,transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay grayscale" />
        </div>

        <div className="relative z-10 w-full max-w-md text-right" dir="rtl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3 justify-end">
              <h2 className="text-3xl font-black text-white tracking-tight">Logistics Systems Pro</h2>
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Truck size={28} />
              </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-black text-white leading-[1.1]">
                تأكيد <br />
                <span className="text-blue-500">الهوية الرقمية</span>
              </h1>
              <p className="text-gray-400 text-lg font-medium leading-relaxed">
                نقوم بتأمين حسابك من خلال رمز التحقق المكون من 6 أرقام لضمان حماية بياناتك وعملياتك.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: ShieldCheck, label: "حماية قصوى" },
                { icon: Clock, label: "تحقق زمني" },
                { icon: Globe, label: "عالمي" },
                { icon: BarChart3, label: "ذكي" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-300 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                  <item.icon size={18} className="text-blue-500" />
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Verify Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[440px]">
          {/* Mobile Header */}
          <div className="lg:hidden mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Truck size={26} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-1">Logistics Systems Pro</h1>
          </div>

          <div className="mb-10 text-right" dir="rtl">
            <h2 className="text-3xl font-black text-slate-900 mb-2">تأكيد الرمز</h2>
            <p className="text-slate-500 font-medium text-sm">أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك</p>
          </div>

          <div className="mb-8 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-right" dir="rtl">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
              <UserCircle size={24} />
            </div>
            <div className="overflow-hidden">
              <h5 className="font-bold text-slate-900 text-sm truncate">{userName}</h5>
              <p className="text-xs text-slate-500 font-medium truncate">{email}</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600 border border-red-100 text-right"
                dir="rtl"
              >
                <AlertTriangle size={20} className="shrink-0" />
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 mr-1 uppercase tracking-widest">رمز التحقق</label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-5 text-center text-4xl font-black tracking-[12px] text-slate-900 placeholder:text-slate-200 outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-inner"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 py-2">
              <div className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2 text-xs font-black transition-all",
                timeLeft <= 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-500 border border-slate-100'
              )}>
                <Clock size={14} />
                <span>ينتهي خلال {formatTime(timeLeft)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || timeLeft === 0}
              className="w-full rounded-xl bg-blue-600 py-4 text-white font-black text-base shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
              ) : (
                <>
                  <CheckCircle size={20} />
                  تأكيد الرمز والمتابعة
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            {resendTimeLeft > 0 ? (
              <p className="text-sm text-slate-400 font-bold">
                يمكنك إعادة إرسال الرمز خلال {resendTimeLeft} ثانية
              </p>
            ) : (
              <button 
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-sm font-black text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                <Send size={16} />
                لم يصلك الرمز؟ إعادة الإرسال الآن
              </button>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl border border-slate-200 text-sm font-black text-slate-900 hover:bg-slate-50 transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              تغيير البريد الإلكتروني
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
