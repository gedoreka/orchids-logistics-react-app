"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  LogIn, 
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

function FloatingShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/10 rounded-full"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 2,
            ease: "easeInOut",
          }}
          style={{
            width: 100 - i * 10,
            height: 100 - i * 10,
            top: `${10 + i * 25}%`,
            left: i % 2 === 0 ? `${10 + i * 5}%` : undefined,
            right: i % 2 !== 0 ? `${10 + i * 5}%` : undefined,
          }}
        />
      ))}
    </div>
  );
}

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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <FloatingShapes />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div className="relative overflow-hidden rounded-[32px] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--frosted-blur)] p-8 md:p-10 shadow-[var(--card-shadow)] transition-all duration-500 hover:shadow-[var(--hover-shadow)]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3498db] to-[#2ecc71]" />
          
          <div className="mb-10 text-center">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] shadow-[0_10px_25px_rgba(102,126,234,0.3)]"
            >
              <Truck size={36} className="text-white" />
            </motion.div>
            <h1 className="mb-2 text-3xl font-black tracking-tight text-[var(--text-color)]">
              Logistics Systems Pro
            </h1>
            <p className="text-[var(--text-color)] text-sm font-medium opacity-80">نظام إدارة الخدمات اللوجستية المتكامل</p>
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
              <label className="text-sm font-bold text-[var(--text-color)] mr-1">
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-4 pl-4 pr-12 text-[var(--text-color)] placeholder:text-gray-500 outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-green-500/5 shadow-inner"
                />
                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[var(--text-color)] mr-1">
                  كلمة المرور
                </label>
                <Link href="/forgot-password" title="نسيت كلمة المرور؟" className="text-sm font-bold text-[#3498db] hover:underline transition-colors">
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
                  className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-4 pl-12 pr-12 text-[var(--text-color)] placeholder:text-gray-500 outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-green-500/5 shadow-inner"
                />
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                className="h-4 w-4 rounded border-gray-300 bg-white text-[#3498db] focus:ring-[#3498db] focus:ring-offset-0"
              />
              <label htmlFor="remember" className="text-sm font-medium text-[var(--text-color)] cursor-pointer hover:text-[#3498db] transition-colors">
                تذكر بيانات الدخول
              </label>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01, translateY: -2 }}
              whileTap={{ scale: 0.99 }}
              className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#667eea] to-[#764ba2] py-4 text-lg font-bold text-white shadow-[0_10px_20px_rgba(102,126,234,0.3)] transition-all duration-300 disabled:opacity-70 group"
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

          <div className="mt-8 border-t border-[var(--glass-border)] pt-8 text-center">
            <p className="mb-4 text-sm text-[var(--text-color)] opacity-70">ليس لديك حساب؟</p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#3498db] hover:underline transition-all group"
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
