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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc]">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[380px] bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden"
      >
        <div className="relative z-10 mb-8 text-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-[#2c3e50] text-white shadow-lg"
          >
            <Truck size={28} />
          </motion.div>
          <h1 className="text-xl font-black text-gray-900 mb-1 tracking-tight">
            Logistics Systems Pro
          </h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">تسجيل الدخول للنظام</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mb-6 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600 border border-red-100"
            >
              <AlertTriangle size={16} />
              <span className="text-[11px] font-bold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded-xl border border-gray-100 bg-gray-50/50 py-3 px-4 text-xs font-bold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-[#3498db]/20 focus:border-[#3498db] outline-none transition-all duration-200"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                كلمة المرور
              </label>
              <Link href="/forgot-password" title="نسيت كلمة المرور؟" className="text-[9px] font-black text-[#3498db] hover:underline">
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
                className="w-full rounded-xl border border-gray-100 bg-gray-50/50 py-3 px-4 text-xs font-bold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-[#3498db]/20 focus:border-[#3498db] outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-gray-200 text-[#2c3e50] focus:ring-0 focus:ring-offset-0"
            />
            <label htmlFor="remember" className="text-[11px] font-bold text-gray-500 cursor-pointer select-none">
              تذكرني في المرة القادمة
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#2c3e50] py-3 text-white font-black text-sm shadow-md shadow-gray-200 hover:bg-[#1a252f] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <LogIn size={18} />
                دخول للنظام
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="mb-2 text-[10px] font-bold text-gray-400">ليس لديك حساب منشأة؟</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-black text-[#3498db] group"
          >
            إنشاء حساب جديد
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
