"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Key, 
  AlertTriangle, 
  RefreshCw, 
  UserCircle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Truck,
  ShieldCheck,
  Globe,
  BarChart3
} from "lucide-react";
import { resetPasswordAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ResetFormProps {
  email: string;
  userName: string;
}

export default function ResetForm({ email, userName }: ResetFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[A-Z]/) && password.match(/[a-z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^A-Za-z0-9]/)) strength++;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthText = ["", "ضعيفة", "متوسطة", "قوية", "قوية جداً"][strength];
  const strengthColor = ["bg-slate-200", "bg-red-500", "bg-yellow-500", "bg-green-500", "bg-blue-500"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون على الأقل 6 أحرف");
      setIsLoading(false);
      return;
    }

    if (password !== confirm) {
      setError("كلمتا المرور غير متطابقتين");
      setIsLoading(false);
      return;
    }
    
    const formData = new FormData();
    formData.append("password", password);
    formData.append("confirm", confirm);

    const result = await resetPasswordAction(formData);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } else {
      setError(result.error || "حدث خطأ ما");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-white rounded-[40px] p-12 shadow-2xl border border-slate-100 text-center"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-green-50 text-green-500 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-6">تم التحديث بنجاح!</h1>
          <p className="text-slate-500 font-bold text-lg mb-10 leading-relaxed">
            تم تحديث كلمة المرور لحسابك بنجاح. سيتم توجيهك لصفحة تسجيل الدخول الآن.
          </p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
              className="h-full bg-green-500"
            />
          </div>
        </motion.div>
      </div>
    );
  }

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
                حماية <br />
                <span className="text-blue-500">متجددة وقوية</span>
              </h1>
              <p className="text-gray-400 text-lg font-medium leading-relaxed">
                تأكد دائماً من اختيار كلمات مرور فريدة وقوية لحماية بيانات منشأتك وعملياتك اللوجستية.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: ShieldCheck, label: "تشفير متطور" },
                { icon: RefreshCw, label: "تحديث آمن" },
                { icon: Globe, label: "وصول عالمي" },
                { icon: BarChart3, label: "مراقبة ذكية" }
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

      {/* Right Side: Reset Form */}
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
            <h2 className="text-3xl font-black text-slate-900 mb-2">كلمة مرور جديدة</h2>
            <p className="text-slate-500 font-medium text-sm">اختر كلمة مرور قوية وآمنة لحسابك</p>
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
              <label className="text-xs font-bold text-slate-500 mr-1 uppercase tracking-widest">كلمة المرور الجديدة</label>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pr-12 pl-12 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="pt-2 px-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">قوة الحماية</span>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", strength >= 3 ? "text-green-600" : "text-slate-400")}>
                    {strengthText}
                  </span>
                </div>
                <div className="flex gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((s) => (
                    <div 
                      key={s} 
                      className={cn("flex-1 rounded-full transition-all duration-500", strength >= s ? strengthColor : "bg-slate-100")}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 mr-1 uppercase tracking-widest">تأكيد كلمة المرور</label>
              <div className="relative group">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Key size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pr-12 pl-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200"
                />
              </div>
              {confirm && (
                <div className="flex items-center gap-2 mt-2 px-1">
                  {password === confirm ? (
                    <div className="flex items-center gap-1.5 text-green-600 text-[10px] font-black uppercase tracking-tighter">
                      <CheckCircle2 size={12} />
                      تطابق تام
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-tighter">
                      <XCircle size={12} />
                      لا يوجد تطابق
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || password !== confirm || password.length < 6}
              className="w-full rounded-xl bg-blue-600 py-4 text-white font-black text-base shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
              ) : (
                <>
                  <RefreshCw size={20} />
                  تحديث كلمة المرور
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
