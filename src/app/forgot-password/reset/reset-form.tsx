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
  XCircle
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
  const strengthColor = ["bg-gray-200", "bg-red-500", "bg-yellow-500", "bg-green-500", "bg-green-600"][strength];

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
      <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-[20px] shadow-2xl text-center max-w-md w-full"
        >
          <div className="mb-6 flex justify-center">
            <div className="bg-green-100 p-4 rounded-full text-green-600">
              <CheckCircle2 size={64} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">تم التحديث بنجاح!</h2>
          <div className="text-right space-y-2 text-gray-600 mb-8">
            <p>تم تحديث كلمة المرور لحسابك بنجاح</p>
            <p>يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة</p>
            <p>سيتم توجيهك إلى صفحة تسجيل الدخول خلال لحظات...</p>
          </div>
          <button 
            onClick={() => router.push("/login")}
            className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition-colors"
          >
            تسجيل الدخول الآن
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[linear-gradient(135deg,#667eea_0%,#764ba2_100%)]">
      {/* Floating Shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            animate={{
              x: mousePosition.x * (i + 1),
              y: mousePosition.y * (i + 1),
              translateY: [0, -30, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              translateY: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: i * 2 },
              rotate: { duration: 15, repeat: Infinity, ease: "linear" }
            }}
            style={{
              width: i === 0 ? 100 : i === 1 ? 80 : i === 2 ? 60 : 120,
              height: i === 0 ? 100 : i === 1 ? 80 : i === 2 ? 60 : 120,
              top: i === 0 ? "10%" : i === 1 ? "60%" : i === 2 ? "80%" : "30%",
              left: i === 0 ? "10%" : i === 1 ? "90%" : i === 2 ? "20%" : "80%",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-[480px]"
      >
        <div className="relative overflow-hidden rounded-[20px] bg-white/98 p-8 backdrop-blur-[10px] shadow-[0_15px_35px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.25)] transition-all duration-300">
          
          <div className="mb-8 text-center bg-gradient-to-br from-[#2c3e50] to-[#3498db] -mx-8 -mt-8 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] rotate-45 -translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white text-[#2c3e50] shadow-lg">
                <Lock size={30} className="text-[#3498db]" />
              </div>
              <h1 className="mb-2 text-[1.8rem] font-extrabold tracking-tight">
                تعيين كلمة مرور جديدة
              </h1>
              <p className="opacity-90 text-[1rem]">اختر كلمة مرور قوية وآمنة لحسابك</p>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-4 rounded-xl bg-[#f8f9fa] p-4 border-l-4 border-[#2980b9]">
            <UserCircle size={24} className="text-[#2980b9]" />
            <div className="text-right">
              <h5 className="font-bold text-[#2c3e50] text-sm">{userName}</h5>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-5 flex items-center gap-3 rounded-[10px] bg-gradient-to-br from-[#ff6b6b] to-[#ee5a52] p-3 text-white shadow-md text-sm"
              >
                <AlertTriangle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-5 rounded-[10px] border-l-4 border-[#3498db] bg-[#f8f9fa] p-4">
            <p className="flex items-center gap-3 text-sm text-gray-600">
              <Info size={18} className="text-[#3498db]" />
              يجب أن تحتوي كلمة المرور على الأقل على 6 أحرف
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-right">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#2c3e50]">
                <Key size={18} className="text-[#3498db]" />
                كلمة المرور الجديدة
              </label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="w-full rounded-xl border-2 border-[#e9ecef] bg-[#f8f9fa] py-4 pl-4 pr-[45px] text-black outline-none transition-all duration-300 focus:border-[#3498db] focus:bg-white"
                />
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3498db]" />
              </div>
              <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${strengthColor}`} 
                  style={{ width: `${(strength / 4) * 100}%` }}
                />
              </div>
              {strengthText && (
                <p className={`text-xs font-bold mt-1 ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-500' : 'text-green-500'}`}>
                  قوة كلمة المرور: {strengthText}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#2c3e50]">
                <Key size={18} className="text-[#3498db]" />
                تأكيد كلمة المرور
              </label>
              <div className="relative group">
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور"
                  className="w-full rounded-xl border-2 border-[#e9ecef] bg-[#f8f9fa] py-4 pl-4 pr-[45px] text-black outline-none transition-all duration-300 focus:border-[#3498db] focus:bg-white"
                />
                <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3498db]" />
              </div>
              {confirm && (
                <div className="flex items-center gap-2 mt-1">
                  {password === confirm ? (
                    <>
                      <CheckCircle2 size={14} className="text-green-500" />
                      <span className="text-xs text-green-500 font-bold">كلمة المرور متطابقة</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} className="text-red-500" />
                      <span className="text-xs text-red-500 font-bold">كلمة المرور غير متطابقة</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || password !== confirm || password.length < 6}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-br from-[#27ae60] to-[#219653] py-4 text-[1.1rem] font-bold text-white shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-3">
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <RefreshCw size={20} />
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
