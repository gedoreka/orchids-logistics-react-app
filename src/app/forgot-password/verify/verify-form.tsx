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
  Send
} from "lucide-react";
import Link from "next/link";
import { verifyTokenAction } from "@/lib/actions/auth";
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

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const resendTimer = setInterval(() => {
      setResendTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
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
                <ShieldCheck size={30} className="text-[#3498db]" />
              </div>
              <h1 className="mb-2 text-[1.8rem] font-extrabold tracking-tight">
                التحقق من الرمز
              </h1>
              <p className="opacity-90 text-[1rem]">أدخل رمز التحقق الذي استلمته عبر البريد الإلكتروني</p>
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

          <div className="mb-5 rounded-[10px] border-l-4 border-[#f39c12] bg-[#f8f9fa] p-4">
            <p className="flex items-center gap-3 text-sm text-gray-600">
              <Clock size={18} className="text-[#f39c12]" />
              رمز التحقق صالح لمدة 15 دقيقة فقط
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 text-right">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-[#2c3e50]">
                <Key size={18} className="text-[#3498db]" />
                رمز التحقق
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="123456"
                  className="w-full rounded-xl border-2 border-[#e9ecef] bg-[#f8f9fa] py-4 pl-4 pr-[45px] text-xl font-bold tracking-[8px] text-center text-black outline-none transition-all duration-300 focus:border-[#3498db] focus:bg-white"
                />
                <Key size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3498db]" />
              </div>
            </div>

            <div className="text-center">
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold bg-[#f8f9fa] text-[#2c3e50] ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : ''}`}>
                <Clock size={16} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading || timeLeft === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-br from-[#27ae60] to-[#219653] py-4 text-[1.1rem] font-bold text-white shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-3">
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <CheckCircle size={20} />
                    التحقق من الرمز
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <div className="mt-4 text-center">
            {resendTimeLeft > 0 ? (
              <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                <Send size={14} />
                إعادة إرسال الرمز ({resendTimeLeft} ثانية)
              </p>
            ) : (
              <button 
                onClick={() => setResendTimeLeft(60)}
                className="text-sm font-bold text-[#3498db] hover:underline flex items-center justify-center gap-2 mx-auto"
              >
                <Send size={14} />
                إعادة إرسال الرمز
              </button>
            )}
          </div>

          <Link
            href="/forgot-password"
            className="mt-5 block text-center text-sm font-medium text-[#3498db] hover:text-[#2c3e50] hover:underline transition-colors"
          >
            <ArrowRight size={16} className="inline-block ml-1" />
            العودة إلى استعادة كلمة المرور
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
