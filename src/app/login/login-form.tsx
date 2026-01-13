"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  LogIn, 
  ArrowLeft,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#fdfdfd]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] bg-white rounded-[40px] p-10 shadow-2xl border border-gray-50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3498db]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        
        <div className="relative z-10 mb-10 text-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#2c3e50] to-[#34495e] text-white shadow-xl shadow-gray-200"
          >
            <Truck size={36} />
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
            ZOOL SYSTEM
          </h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">تسجيل الدخول للنظام</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-red-600 border border-red-100"
            >
              <AlertTriangle size={18} />
              <span className="text-sm font-bold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
          <div className="space-y-2.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">
              البريد الإلكتروني
            </label>
            <div className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-2xl border-none bg-gray-50/50 py-4 px-4 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                كلمة المرور
              </label>
              <Link href="/forgot-password" title="نسيت كلمة المرور؟" className="text-[10px] font-black text-[#3498db] hover:underline">
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
                className="w-full rounded-2xl border-none bg-gray-50/50 py-4 px-4 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-gray-200 text-[#2c3e50] focus:ring-0 focus:ring-offset-0"
              />
            </div>
            <label htmlFor="remember" className="text-xs font-bold text-gray-500 cursor-pointer select-none">
              تذكرني في المرة القادمة
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-[#2c3e50] py-4 text-white font-black text-lg shadow-xl shadow-gray-200 hover:bg-[#1a252f] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <LogIn size={20} />
                دخول للنظام
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-50 text-center">
          <p className="mb-4 text-xs font-bold text-gray-400">ليس لديك حساب منشأة؟</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-black text-[#3498db] group"
          >
            إنشاء حساب جديد
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
