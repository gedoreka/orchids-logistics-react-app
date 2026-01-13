"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Mail, 
  AlertTriangle, 
  Send, 
  ArrowRight,
  Info,
  Truck
} from "lucide-react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#0a0a0a]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(102,126,234,0.1),transparent_50%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="bottom-[-10%] left-[-10%] absolute w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-8 md:p-10 backdrop-blur-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/[0.12]">
          
          <div className="mb-10 text-center">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
            >
              <Lock size={36} className="text-white" />
            </motion.div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
              استعادة الحساب
            </h1>
            <p className="text-gray-400 text-sm font-medium">أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400"
              >
                <AlertTriangle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-right" dir="rtl">
            <p className="flex items-start gap-3 text-sm text-blue-400 font-medium leading-relaxed">
              <Info size={18} className="mt-0.5 shrink-0" />
              سنرسل لك رمزاً مكوناً من 6 أرقام إلى بريدك الإلكتروني لتتمكن من تعيين كلمة مرور جديدة.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-1">
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] py-4 pl-4 pr-12 text-white placeholder:text-gray-600 outline-none transition-all duration-300 focus:border-blue-500/50 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
                />
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative w-full overflow-hidden rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-[0_16px_32px_rgba(59,130,246,0.3)] transition-all duration-300 hover:bg-blue-500 disabled:opacity-70 group"
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <Send size={18} />
                    إرسال رمز التحقق
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <div className="mt-8 border-t border-white/[0.08] pt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-all group"
            >
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
