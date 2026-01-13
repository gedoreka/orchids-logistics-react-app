"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Key, 
  AlertTriangle, 
  RefreshCw, 
  UserCircle,
  Info,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { resetPasswordAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

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
  const strengthColor = ["bg-gray-800", "bg-red-500", "bg-yellow-500", "bg-green-500", "bg-green-400"][strength];

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
        <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[#f8fafc]">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_50%)]" />
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-[32px] border border-green-100 bg-white p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center"
          >
            <div className="mb-6 flex justify-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="bg-green-100 p-5 rounded-full text-green-600"
              >
                <CheckCircle2 size={64} />
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">تم التحديث بنجاح!</h2>
            <div className="space-y-2 text-slate-500 mb-8 font-medium">
              <p>تم تحديث كلمة المرور لحسابك بنجاح</p>
              <p>سيتم توجيهك إلى صفحة تسجيل الدخول خلال لحظات...</p>
            </div>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
              className="h-1 bg-green-500/30 rounded-full"
            />
          </motion.div>
        </div>
      );
    }

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
          className="relative z-10 w-full max-w-[480px]"
        >
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            
            <div className="mb-10 text-center">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-[0_10px_25px_rgba(0,128,128,0.2)]"
              >
                <RefreshCw size={36} className="text-white" />
              </motion.div>
              <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">
                كلمة مرور جديدة
              </h1>
              <p className="text-slate-500 text-sm font-medium">اختر كلمة مرور قوية وآمنة لحسابك</p>
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
                  كلمة المرور الجديدة
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
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
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">قوة كلمة المرور</span>
                    <span className={`text-[10px] font-bold uppercase ${strength >= 3 ? 'text-green-500' : strength >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                      {strengthText}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step} 
                        className={`h-full flex-1 rounded-full transition-all duration-500 ${strength >= step ? strengthColor : 'bg-slate-100'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
                  تأكيد كلمة المرور
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-4 pr-12 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/5"
                  />
                  <Key size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                {confirm && (
                  <div className="flex items-center gap-2 mt-2 px-1">
                    {password === confirm ? (
                      <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-green-600 text-[10px] font-bold uppercase">
                        <CheckCircle2 size={12} />
                        تطابق تام
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase">
                        <XCircle size={12} />
                        لا يوجد تطابق
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || password !== confirm || password.length < 6}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative w-full overflow-hidden rounded-2xl bg-teal-600 py-4 text-sm font-bold text-white shadow-[0_10px_20px_rgba(0,128,128,0.15)] transition-all duration-300 hover:bg-teal-700 disabled:opacity-50 group"
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <RefreshCw size={18} />
                      تحديث كلمة المرور
                    </>
                  )}
                </div>
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
  );
}
