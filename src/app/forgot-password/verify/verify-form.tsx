"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  UserCircle,
  Send,
  ArrowLeft,
  Truck,
  Globe,
  BarChart3,
  KeyRound,
  Fingerprint
} from "lucide-react";
import Link from "next/link";
import { verifyTokenAction, forgotPasswordAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface VerifyFormProps {
  email: string;
  userName: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

function ParticleBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function VerifyForm({ email, userName }: VerifyFormProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [resendTimeLeft, setResendTimeLeft] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const resendTimer = setInterval(() => {
      setResendTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(timer);
      clearInterval(resendTimer);
    };
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const token = otp.join("");
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

  const handleResend = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", email);

    const result = await forgotPasswordAction(formData);
    
    if (result.success) {
      setResendTimeLeft(60);
      setTimeLeft(15 * 60);
      setError("");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      setError(result.error || "فشل إعادة إرسال الرمز");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-blue-900/90 to-slate-900 items-center justify-center p-12 overflow-hidden">
        <ParticleBackground />
        
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-slate-900/80" />
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 w-full max-w-md text-right" dir="rtl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <motion.div 
              className="flex items-center gap-4 justify-start"
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 border border-white/10">
                <Truck size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Logistics Systems Pro</h2>
                <p className="text-blue-400 text-sm font-bold">Enterprise Edition</p>
              </div>
            </motion.div>

            <div className="space-y-6">
              <h1 className="text-5xl font-black text-white leading-[1.15]">
                تأكيد <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  الهوية الرقمية
                </span>
              </h1>
              <p className="text-slate-300 text-lg font-medium leading-relaxed">
                نقوم بتأمين حسابك من خلال رمز التحقق المكون من 6 أرقام لضمان حماية بياناتك وعملياتك.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: ShieldCheck, label: "حماية قصوى", desc: "تشفير متقدم" },
                { icon: Clock, label: "تحقق زمني", desc: "رمز مؤقت" },
                { icon: Globe, label: "عالمي", desc: "وصول آمن" },
                { icon: KeyRound, label: "ذكي", desc: "تحقق فوري" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="group flex flex-col gap-2 text-white bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-white/20 transition-all cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors">
                      <item.icon size={20} className="text-blue-400" />
                    </div>
                    <span className="text-sm font-black">{item.label}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium mr-11">{item.desc}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-slate-500 text-xs font-bold">
          <span>© 2026 Logistics Systems Pro</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            جميع الأنظمة تعمل
          </span>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[480px] relative z-10"
        >
          <div className="lg:hidden mb-10 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/30"
            >
              <Truck size={30} />
            </motion.div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Logistics Systems Pro</h1>
          </div>

          <div className="mb-8 text-right" dir="rtl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto lg:mx-0 mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl shadow-violet-500/30"
            >
              <Fingerprint size={36} />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black text-slate-900 dark:text-white mb-3"
            >
              تأكيد الرمز
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 dark:text-slate-400 font-medium"
            >
              أدخل الرمز المكون من 6 أرقام المرسل إلى بريدك
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 flex items-center gap-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4 text-right" 
            dir="rtl"
          >
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <UserCircle size={28} />
            </div>
            <div className="overflow-hidden flex-1">
              <h5 className="font-black text-slate-900 dark:text-white text-base truncate">{userName}</h5>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate">{email}</p>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-950/30 p-4 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 text-right backdrop-blur-sm"
                dir="rtl"
              >
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50">
                  <AlertTriangle size={18} />
                </div>
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">رمز التحقق</label>
              <div className="flex gap-3 justify-center" dir="ltr" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className={cn(
                      "w-14 h-16 sm:w-16 sm:h-18 rounded-2xl border-2 text-center text-2xl sm:text-3xl font-black transition-all duration-300 outline-none",
                      digit 
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10" 
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white",
                      "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white dark:focus:bg-slate-800"
                    )}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-3 py-2"
            >
              <div className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black transition-all",
                timeLeft <= 60 ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 animate-pulse border border-red-200 dark:border-red-900/50' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700'
              )}>
                <Clock size={14} />
                <span>ينتهي خلال {formatTime(timeLeft)}</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || timeLeft === 0}
              className="relative w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 py-4 text-white font-black text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
              ) : (
                <>
                  <CheckCircle size={20} />
                  تأكيد الرمز والمتابعة
                </>
              )}
            </motion.button>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            {resendTimeLeft > 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 font-bold">
                يمكنك إعادة إرسال الرمز خلال {resendTimeLeft} ثانية
              </p>
            ) : (
              <button 
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-sm font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                <Send size={16} />
                لم يصلك الرمز؟ إعادة الإرسال الآن
              </button>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center"
          >
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 py-3 px-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              تغيير البريد الإلكتروني
            </Link>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-6 left-0 right-0 lg:hidden text-center text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
          Logistics Systems Pro © 2026
        </div>
      </div>
    </div>
  );
}
