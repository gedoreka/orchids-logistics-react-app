"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  Mail, 
  AlertTriangle, 
  Send, 
  ArrowRight,
  ShieldCheck,
  Globe,
  BarChart3,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("email", email);

    const result = await forgotPasswordAction(formData);

    if (result.success) {
      router.push("/forgot-password/verify");
    } else {
      setError(result.error || "حدث خطأ ما");
      setIsLoading(false);
    }
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
                استعادة <br />
                <span className="text-blue-500">الوصول للنظام</span>
              </h1>
              <p className="text-gray-400 text-lg font-medium leading-relaxed">
                لا تقلق، نحن هنا لمساعدتك في استعادة كلمة المرور الخاصة بك والعودة لمتابعة أعمالك بكل سهولة وأمان.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: ShieldCheck, label: "أمان عالي" },
                { icon: Mail, label: "تحقق فوري" },
                { icon: Globe, label: "دعم شامل" },
                { icon: BarChart3, label: "ذكاء تقني" }
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

      {/* Right Side: Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[420px]">
          {/* Mobile Header */}
          <div className="lg:hidden mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Truck size={26} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-1">Logistics Systems Pro</h1>
          </div>

          <div className="mb-10 text-right" dir="rtl">
            <h2 className="text-3xl font-black text-slate-900 mb-2">نسيت كلمة المرور؟</h2>
            <p className="text-slate-500 font-medium text-sm">أدخل بريدك الإلكتروني المسجل وسنرسل لك رمز التحقق</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-red-600 border border-red-100 text-right"
                dir="rtl"
              >
                <AlertTriangle size={20} className="shrink-0" />
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 mr-1">البريد الإلكتروني</label>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pr-12 pl-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 py-4 text-white font-black text-base shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
              ) : (
                <>
                  <Send size={20} />
                  إرسال رمز التحقق
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl border border-slate-200 text-sm font-black text-slate-900 hover:bg-slate-50 transition-all group"
            >
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
