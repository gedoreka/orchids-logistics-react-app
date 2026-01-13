"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Key, 
  AlertTriangle, 
  LogIn, 
  PlusCircle, 
  HelpCircle,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  initialEmail?: string;
}

export default function LoginForm({ initialEmail = "" }: LoginFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(initialEmail !== "");
  const [showPassword, setShowPassword] = useState(false);
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
    formData.append("password", password);
    if (remember) formData.append("remember", "on");

    const result = await loginAction(formData);

    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error || "حدث خطأ ما");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#f8fafc]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,128,128,0.05),transparent_50%)]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/5 blur-[120px] rounded-full" />
        <div className="bottom-[-10%] right-[-10%] absolute w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          
          <div className="mb-10 text-center">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-[0_10px_25px_rgba(0,128,128,0.2)]"
            >
              <Truck size={36} className="text-white" />
            </motion.div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
              ZoolSpeed
            </h1>
            <p className="text-slate-500 text-sm font-medium">نظام إدارة الخدمات اللوجستية المتكامل</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600"
              >
                <AlertTriangle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-4 pr-12 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/5"
                />
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
                  كلمة المرور
                </label>
                <Link href="/forgot-password" title="نسيت كلمة المرور؟" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/5"
                />
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mr-1">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 bg-white text-teal-600 focus:ring-teal-500 focus:ring-offset-0"
              />
              <label htmlFor="remember" className="text-sm font-medium text-slate-600 cursor-pointer hover:text-teal-600 transition-colors">
                تذكر بيانات الدخول
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative w-full overflow-hidden rounded-2xl bg-teal-600 py-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,128,128,0.15)] transition-all duration-300 hover:bg-teal-700 disabled:opacity-70 group"
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <LogIn size={18} />
                    تسجيل الدخول
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-8 text-center">
            <p className="mb-4 text-sm text-slate-500">ليس لديك حساب؟</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition-all group"
            >
              إنشاء حساب منشأة جديدة
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
