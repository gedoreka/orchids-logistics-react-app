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
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { verifyTokenAction, forgotPasswordAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#f8fafc]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,128,128,0.05),transparent_50%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-600/5 blur-[120px] rounded-full" />
        <div className="bottom-[-10%] left-[-10%] absolute w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[480px]"
      >
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          
          <div className="mb-8 text-center">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-[0_10px_25px_rgba(0,128,128,0.2)]"
            >
              <ShieldCheck size={36} className="text-white" />
            </motion.div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
              تأكيد الرمز
            </h1>
            <p className="text-slate-500 text-sm font-medium">تم إرسال رمز التحقق إلى بريدك الإلكتروني</p>
          </div>

          <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-right" dir="rtl">
            <UserCircle size={24} className="text-teal-600 shrink-0" />
            <div className="overflow-hidden">
              <h5 className="font-bold text-slate-900 text-sm truncate">{userName}</h5>
              <p className="text-xs text-slate-500 truncate">{email}</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm"
              >
                <AlertTriangle size={18} />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
                رمز التحقق (6 أرقام)
              </label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-5 text-center text-3xl font-bold tracking-[12px] text-slate-900 placeholder:text-slate-300 outline-none transition-all duration-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/5"
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 py-2">
              <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${timeLeft <= 60 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                <Clock size={14} />
                <span>تنتهي صلاحية الرمز خلال {formatTime(timeLeft)}</span>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || timeLeft === 0}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative w-full overflow-hidden rounded-2xl bg-teal-600 py-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,128,128,0.15)] transition-all duration-300 hover:bg-teal-700 disabled:opacity-50 group"
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    تأكيد الرمز والمتابعة
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            {resendTimeLeft > 0 ? (
              <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                إعادة إرسال الرمز خلال {resendTimeLeft} ثانية
              </p>
            ) : (
              <button 
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50 group"
              >
                <Send size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                لم يصلك الرمز؟ إعادة الإرسال الآن
              </button>
            )}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-8 text-center">
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              تغيير البريد الإلكتروني
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
