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
  HelpCircle 
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
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-[linear-gradient(135deg,#667eea_0%,#764ba2_25%,#f093fb_50%,#f5576c_75%,#4facfe_100%)] bg-[length:400%_400%] animate-[gradientShift_15s_ease_infinite]">
      {/* Floating Shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            animate={{
              x: mousePosition.x * (i + 1),
              y: mousePosition.y * (i + 1),
              translateY: [0, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              translateY: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 2 },
              rotate: { duration: 12, repeat: Infinity, ease: "linear" }
            }}
            style={{
              width: i === 0 ? 120 : i === 1 ? 80 : 40,
              height: i === 0 ? 120 : i === 1 ? 80 : 40,
              top: i === 0 ? "15%" : i === 1 ? "65%" : "80%",
              left: i === 0 ? "10%" : i === 1 ? "85%" : "25%",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[480px]"
      >
        <div className="relative overflow-hidden rounded-[30px] border border-white/20 bg-white/10 p-10 backdrop-blur-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all duration-400 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[linear-gradient(90deg,#3498db,#2ecc71,#e74c3c,#f39c12,#9b59b6,#3498db)] bg-[length:200%_100%] animate-[gradientFlow_3s_linear_infinite]" />
          
          <div className="mb-8 text-center">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="mx-auto mb-5 flex h-[100px] w-[100px] items-center justify-center rounded-[25px] border border-white/20 bg-white/10 shadow-lg backdrop-blur-[20px]"
            >
              <Truck size={40} className="text-[#3498db]" style={{ filter: 'drop-shadow(0 0 10px rgba(52, 152, 219, 0.5))' }} />
            </motion.div>
            <h1 className="mb-1 text-[2.2rem] font-extrabold text-transparent bg-clip-text bg-[linear-gradient(135deg,#fff,#e3f2fd)] drop-shadow-md">
              Logistics Systems Pro
            </h1>
            <p className="text-white/80 font-medium">نظام إدارة الخدمات اللوجستية المتكامل</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: "auto", scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="mb-6 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-white/10 p-4 text-white backdrop-blur-[20px] shadow-[0_8px_25px_rgba(231,76,60,0.2)] animate-shake"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-700 rounded-l-2xl" />
                <AlertTriangle size={18} className="text-red-500" />
                <span className="text-[0.95rem]">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6 text-right">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[1rem] font-semibold text-white/90 drop-shadow-sm">
                <Mail size={16} />
                البريد الإلكتروني
              </label>
              <div className="relative group/input">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  className="w-full rounded-[15px] border border-white/20 bg-white/10 py-[18px] pl-[20px] pr-[55px] text-white placeholder:text-white/60 backdrop-blur-md outline-none transition-all duration-400 focus:bg-white/15 focus:border-white/40 focus:shadow-[inset_0_2px_15px_rgba(0,0,0,0.2),0_0_0_3px_rgba(255,255,255,0.1)] group-hover/input:scale-[1.02]"
                />
                <User size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/70 transition-all duration-400 group-focus-within/input:text-[#2ecc71] group-focus-within/input:scale-110" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[1rem] font-semibold text-white/90 drop-shadow-sm">
                <Lock size={16} />
                كلمة المرور
              </label>
              <div className="relative group/input">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full rounded-[15px] border border-white/20 bg-white/10 py-[18px] pl-[55px] pr-[55px] text-white placeholder:text-white/60 backdrop-blur-md outline-none transition-all duration-400 focus:bg-white/15 focus:border-white/40 focus:shadow-[inset_0_2px_15px_rgba(0,0,0,0.2),0_0_0_3px_rgba(255,255,255,0.1)] group-hover/input:scale-[1.02]"
                />
                <Key size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/70 transition-all duration-400 group-focus-within/input:text-[#2ecc71] group-focus-within/input:scale-110" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[0.95rem]">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-white/20 bg-white/10 backdrop-blur-md checked:bg-gradient-to-br checked:from-[#2ecc71] checked:to-[#27ae60] transition-all duration-400"
                  />
                  <motion.div
                    initial={false}
                    animate={remember ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                    className="absolute pointer-events-none text-white"
                  >
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </div>
                <span className="text-white/80 font-medium group-hover:text-white transition-colors">تذكر بيانات الدخول</span>
              </label>
              <Link href="/forgot-password" title="نسيت كلمة المرور؟" className="relative text-white/80 font-medium transition-all duration-400 hover:text-[#2ecc71] after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-[#2ecc71] after:transition-all after:duration-400 hover:after:w-full flex items-center gap-1">
                <HelpCircle size={16} />
                نسيت كلمة المرور؟
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ translateY: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative w-full overflow-hidden rounded-[15px] bg-gradient-to-br from-[#667eea] to-[#764ba2] py-[18px] text-[1.1rem] font-bold text-white shadow-[0_8px_25px_rgba(102,126,234,0.4),inset_0_2px_0_rgba(255,255,255,0.2)] transition-all duration-400 hover:from-[#764ba2] hover:to-[#667eea] hover:shadow-[0_12px_35px_rgba(102,126,234,0.6)] disabled:opacity-70 disabled:cursor-not-allowed group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <LogIn size={20} />
                    تسجيل الدخول إلى النظام
                  </>
                )}
              </div>
            </motion.button>
          </form>

          <div className="mt-8 border-t border-white/20 pt-6 text-center">
            <p className="mb-5 text-white/70">ليس لديك حساب في النظام؟</p>
            <motion.div whileHover={{ translateY: -3 }}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-br from-[#2ecc71] to-[#27ae60] px-8 py-[15px] font-bold text-white shadow-[0_6px_20px_rgba(39,174,96,0.4),inset_0_2px_0_rgba(255,255,255,0.2)] transition-all duration-400 hover:from-[#27ae60] hover:to-[#2ecc71] hover:shadow-[0_10px_25px_rgba(39,174,96,0.6)]"
              >
                <PlusCircle size={18} />
                إنشاء حساب منشأة جديدة
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
