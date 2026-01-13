"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Mail, 
  AlertTriangle, 
  PaperPlane, 
  ArrowRight,
  Info
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
        className="relative z-10 w-full max-w-[520px]"
      >
        <div className="relative overflow-hidden rounded-[25px] border border-black/10 bg-white/95 p-10 backdrop-blur-[15px] shadow-[0_15px_35px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.2)] transition-all duration-300">
          
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-[90px] w-[90px] items-center justify-center rounded-full bg-gradient-to-br from-[#2c3e50] to-[#3498db] text-white shadow-lg">
              <Lock size={36} />
            </div>
            <h1 className="mb-3 text-[2.1rem] font-extrabold text-[#2c3e50] tracking-tight">
              استعادة كلمة المرور
            </h1>
            <p className="text-[#3498db] text-[1.1rem]">أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 flex items-center gap-3 rounded-[10px] bg-gradient-to-br from-[#ff6b6b] to-[#ee5a52] p-4 text-white shadow-md"
              >
                <AlertTriangle size={20} />
                <span className="text-[0.95rem]">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-6 rounded-[10px] border-l-4 border-[#2980b9] bg-[#f8f9fa] p-[18px]">
            <p className="flex items-center gap-3 text-[0.95rem] text-black">
              <Info size={18} className="text-[#2980b9]" />
              أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل لك رمز التحقق
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7 text-right">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[1.05rem] font-semibold text-black">
                <Mail size={18} className="text-[#3498db]" />
                البريد الإلكتروني
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني المسجل"
                  className="w-full rounded-[12px] border-2 border-[#e9ecef] bg-[#f8f9fa] py-4 pl-[50px] pr-4 text-[1.05rem] text-black transition-all duration-300 focus:border-[#3498db] focus:bg-white outline-none"
                />
                <Mail size={20} className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/70 group-focus-within:text-[#3498db]" />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full overflow-hidden rounded-[12px] bg-gradient-to-br from-[#3498db] to-[#2c3e50] py-4 text-[1.15rem] font-semibold text-white shadow-lg transition-all duration-300 disabled:opacity-70 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <div className="flex items-center justify-center gap-3">
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <PaperPlane size={20} />
                    إرسال رمز التحقق
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <Link
            href="/login"
            className="mt-6 flex items-center justify-center gap-2 text-[1.05rem] font-medium text-[#3498db] hover:text-[#2c3e50] hover:underline transition-colors"
          >
            <ArrowRight size={18} />
            العودة إلى صفحة تسجيل الدخول
          </Link>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
