"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  LogIn,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Globe,
  BarChart3,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Building2,
  UserPlus,
  Languages,
  MessageSquare,
  Phone,
  RefreshCw,
  Shield,
  ArrowRight,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/lib/locale-context";
import BrandLogo from "@/components/brand-logo";

interface LoginFormProps {
  initialEmail?: string;
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  if (!mounted) {
    return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;
  }

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

// OTP Input Component
function OTPInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (index: number, char: string) => {
    const clean = char.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = clean;
    const newVal = newDigits.join("").replace(/\s/g, "");
    onChange(newVal);
    if (clean && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join("").trim());
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join("").trim());
      }
    }
    if (e.key === "ArrowLeft") inputs.current[index - 1]?.focus();
    if (e.key === "ArrowRight") inputs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" dir="ltr">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          whileFocus={{ scale: 1.05 }}
          className={cn(
            "w-12 h-14 text-center text-xl font-black rounded-2xl border-2 outline-none transition-all duration-200",
            "bg-slate-50/80 dark:bg-slate-800/80 text-slate-900 dark:text-white",
            digits[i]
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-lg shadow-indigo-500/20"
              : "border-slate-200 dark:border-slate-600/80",
            "focus:border-indigo-500 focus:bg-indigo-50/50 dark:focus:bg-indigo-950/30 focus:shadow-lg focus:shadow-indigo-500/20",
            "disabled:opacity-50"
          )}
        />
      ))}
    </div>
  );
}

// OTP Step Component
function OTPStep({
  email,
  emailSent,
  whatsappSent,
  maskedEmail,
  maskedPhone,
  noPhone,
  whatsappEnabled,
  emailEnabled,
  onVerified,
  onBack,
  isRTL,
}: {
  email: string;
  emailSent: boolean;
  whatsappSent: boolean;
  maskedEmail: string;
  maskedPhone: string | null;
  noPhone: boolean;
  whatsappEnabled: boolean;
  emailEnabled: boolean;
  onVerified: () => void;
  onBack: () => void;
  isRTL: boolean;
}) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError("أدخل الرمز المكوّن من 6 أرقام كاملاً");
      return;
    }
    setVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => onVerified(), 1200);
      } else {
        setError(data.error || "رمز التحقق غير صحيح");
      }
    } catch {
      setError("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setCountdown(60);
      setCanResend(false);
      setOtp("");
    } catch {
      setError("فشل في إعادة الإرسال");
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30"
        >
          <Shield size={32} className="text-white" />
        </motion.div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
          التحقق بخطوتين
        </h3>
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          تم إرسال رمز التحقق إلى:
        </p>
      </div>

      {/* Delivery Methods */}
      <div className="space-y-2.5">
        {emailSent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40"
          >
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Mail size={16} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400">بريد إلكتروني</p>
              <p className="text-xs text-blue-500/70">{maskedEmail}</p>
            </div>
            <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />
          </motion.div>
        )}

        {whatsappSent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <MessageSquare size={16} className="text-emerald-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">واتساب</p>
              <p className="text-xs text-emerald-500/70">{maskedPhone}</p>
            </div>
            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
          </motion.div>
        )}

        {noPhone && whatsappEnabled && !whatsappSent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40"
          >
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Phone size={16} className="text-amber-500" />
            </div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
              لا يوجد رقم هاتف مسجل للشركة - يُرجى إضافة رقم الهاتف في بيانات المؤسسة
            </p>
          </motion.div>
        )}
      </div>

      {/* OTP Input */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 text-center block">
          أدخل رمز التحقق المكوّن من 6 أرقام
        </label>
        <OTPInput value={otp} onChange={setOtp} disabled={verifying || success} />
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 p-3 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50"
          >
            <AlertTriangle size={16} />
            <span className="text-sm font-bold">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verify Button */}
      <motion.button
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleVerify}
        disabled={otp.length < 6 || verifying || success}
        className={cn(
          "relative w-full rounded-2xl py-4 text-white font-black text-[16px] shadow-xl transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden",
          success
            ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-500/25"
            : otp.length === 6
            ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-indigo-500/25 hover:shadow-indigo-500/35"
            : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
        )}
      >
        {success ? (
          <>
            <CheckCircle2 size={20} />
            تم التحقق بنجاح
          </>
        ) : verifying ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <>
            <ShieldCheck size={20} />
            تأكيد الرمز
          </>
        )}
      </motion.button>

      {/* Resend + Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
        >
          {isRTL ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          العودة
        </button>

        <button
          onClick={handleResend}
          disabled={!canResend || resending}
          className={cn(
            "text-xs font-bold flex items-center gap-1.5 transition-colors",
            canResend
              ? "text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              : "text-slate-300 dark:text-slate-600 cursor-not-allowed"
          )}
        >
          {resending ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <RefreshCw size={12} />
          )}
          {canResend ? "إعادة الإرسال" : `إعادة الإرسال (${countdown}s)`}
        </button>
      </div>
    </motion.div>
  );
}

export default function LoginForm({ initialEmail = "" }: LoginFormProps) {
  const { locale, setLocale, isRTL } = useLocale();
  const t = useTranslations('login');
  const tCommon = useTranslations('common');
  
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(initialEmail !== "");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState("");
  const [lastCompany, setLastCompany] = useState<string | null>(null);
  const router = useRouter();

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [otpData, setOtpData] = useState<{
    emailSent: boolean;
    whatsappSent: boolean;
    maskedEmail: string;
    maskedPhone: string | null;
    noPhone: boolean;
    whatsappEnabled: boolean;
    emailEnabled: boolean;
  } | null>(null);
  const [pendingLoginData, setPendingLoginData] = useState<{ formData: FormData; userName: string; companyName: string; isSubscriptionActive: boolean } | null>(null);

  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  useEffect(() => {
    const savedCompany = localStorage.getItem("last_company_name");
    if (savedCompany) {
      setLastCompany(savedCompany);
    }
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
      // Check if OTP is required
      try {
        const otpStatusRes = await fetch("/api/auth/otp-status");
        const otpStatus = await otpStatusRes.json();

        if (otpStatus.otpRequired) {
          // Send OTP
          const sendRes = await fetch("/api/auth/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const sendData = await sendRes.json();

          if (sendData.otpDisabled) {
            // OTP disabled, proceed normally
            finishLogin(result, formData);
            return;
          }

          // Store pending login data
          setPendingLoginData({
            formData,
            userName: result.user?.name || "",
            companyName: result.user?.company_name || "",
            isSubscriptionActive: !!result.user?.is_subscription_active,
          });

          setOtpData({
            emailSent: sendData.emailSent || false,
            whatsappSent: sendData.whatsappSent || false,
            maskedEmail: sendData.maskedEmail || email,
            maskedPhone: sendData.maskedPhone || null,
            noPhone: sendData.noPhone || false,
            whatsappEnabled: otpStatus.whatsappEnabled,
            emailEnabled: otpStatus.emailEnabled,
          });

          setOtpStep(true);
          setIsLoading(false);
          return;
        }
      } catch {
        // If OTP status check fails, proceed normally
      }

      finishLogin(result, formData);
    } else {
      setError(result.error || (isRTL ? "حدث خطأ ما في البيانات" : "Invalid credentials"));
      setIsLoading(false);
    }
  };

  const finishLogin = (result: any, formData?: FormData) => {
    const name = result.user?.name || pendingLoginData?.userName || "";
    const companyName = result.user?.company_name || pendingLoginData?.companyName || "";
    const isSubscriptionActive = result.user?.is_subscription_active ?? pendingLoginData?.isSubscriptionActive ?? false;

    setUserName(name);
    if (companyName) {
      localStorage.setItem("last_company_name", companyName);
    }
    setShowWelcome(true);
    setTimeout(() => {
      if (isSubscriptionActive) {
        router.push("/dashboard");
      } else {
        router.push("/subscriptions");
      }
      router.refresh();
    }, 2500);
  };

  const handleOTPVerified = () => {
    // Re-run login after OTP verified to create session
    if (pendingLoginData) {
      loginAction(pendingLoginData.formData).then((result) => {
        if (result.success) {
          finishLogin(result);
        } else {
          setOtpStep(false);
          setError("حدث خطأ أثناء إتمام تسجيل الدخول");
          setIsLoading(false);
        }
      });
    }
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative">
        <ParticleBackground />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 text-center px-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-8 w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={48} className="text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-6xl font-black text-white mb-4"
          >
            {isRTL ? 'مرحباً بك' : 'Welcome'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-2xl md:text-3xl font-bold text-blue-400 mb-8"
          >
            {userName || (isRTL ? "في نظام اللوجستيات" : "to Logistics System")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-slate-400 text-sm font-medium"
          >
            {isRTL ? 'جاري تجهيز لوحة التحكم...' : 'Preparing your dashboard...'}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={cn(
        "hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 items-center justify-center p-12 overflow-hidden",
        !isRTL && "order-2"
      )}>
        <ParticleBackground />
        
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60" />
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

          <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10 flex flex-col items-center"
            >
                  <BrandLogo size="lg" />

            <div className="space-y-6 text-center">
              <h1 className="text-5xl font-black text-white leading-[1.15]">
                {isRTL ? (
                  <>
                    نظام إدارة <br />
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      اللوجستيات المتطور
                    </span>
                  </>
                ) : (
                  <>
                    Advanced <br />
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Logistics System
                    </span>
                  </>
                )}
              </h1>
              <p className="text-slate-300 text-lg font-medium leading-relaxed">
                {isRTL 
                  ? 'تحكم كامل في أسطولك، موظفيك، وعملياتك من خلال لوحة تحكم واحدة ذكية واحترافية.'
                  : 'Complete control over your fleet, employees, and operations through one smart and professional dashboard.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: ShieldCheck, label: isRTL ? "أمان عالي" : "High Security", desc: isRTL ? "تشفير 256-bit" : "256-bit Encryption" },
                { icon: BarChart3, label: isRTL ? "تقارير ذكية" : "Smart Reports", desc: isRTL ? "تحليلات فورية" : "Real-time Analytics" },
                { icon: Globe, label: isRTL ? "تغطية شاملة" : "Full Coverage", desc: isRTL ? "متعدد الفروع" : "Multi-branch" },
                { icon: Truck, label: isRTL ? "تتبع لحظي" : "Live Tracking", desc: isRTL ? "GPS مباشر" : "Live GPS" }
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
            {isRTL ? 'جميع الأنظمة تعمل' : 'All systems operational'}
          </span>
        </div>
      </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.04),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%)]" />
            
            {/* Language Switcher */}
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLocale}
              className="absolute top-5 right-5 z-20 flex items-center gap-2.5 px-5 py-3 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 rounded-2xl transition-all duration-200 border-2 border-blue-200/60 dark:border-blue-500/30 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/10 backdrop-blur-sm"
              >
              <Languages size={20} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200 tracking-wide">
                {locale === 'ar' ? 'EN' : 'عربي'}
              </span>
            </motion.button>
            
            <div className="w-full max-w-[540px] relative z-10">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full rounded-[2rem] bg-white dark:bg-slate-800/95 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_4px_6px_-1px_rgba(59,130,246,0.06),0_10px_15px_-3px_rgba(59,130,246,0.08),0_20px_50px_-12px_rgba(99,102,241,0.12)] dark:shadow-[0_4px_6px_-1px_rgba(59,130,246,0.1),0_10px_15px_-3px_rgba(59,130,246,0.15),0_20px_60px_-12px_rgba(99,102,241,0.3),0_0_0_1px_rgba(59,130,246,0.05)] overflow-hidden backdrop-blur-sm"
                >
                  {/* Gradient Top Strip */}
                  <div className={cn(
                    "h-1.5 bg-gradient-to-r transition-all duration-500",
                    otpStep
                      ? "from-indigo-500 via-purple-500 to-violet-500"
                      : "from-blue-500 via-indigo-500 to-purple-500"
                  )} />

                  <div className="px-10 sm:px-12 py-10">
                    <AnimatePresence mode="wait">
                      {otpStep && otpData ? (
                        <OTPStep
                          key="otp"
                          email={email}
                          emailSent={otpData.emailSent}
                          whatsappSent={otpData.whatsappSent}
                          maskedEmail={otpData.maskedEmail}
                          maskedPhone={otpData.maskedPhone}
                          noPhone={otpData.noPhone}
                          whatsappEnabled={otpData.whatsappEnabled}
                          emailEnabled={otpData.emailEnabled}
                          onVerified={handleOTPVerified}
                          onBack={() => setOtpStep(false)}
                          isRTL={isRTL}
                        />
                      ) : (
                        <motion.div
                          key="login"
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 30 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Logo + Title */}
                          <div className="text-center mb-10">
                            <h2 className="text-3xl font-black mb-2">
                              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {t('subtitle')}
                              </span>
                            </h2>
                            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">
                              {isRTL ? 'أدخل بياناتك للوصول إلى لوحة التحكم' : 'Enter your credentials to access your dashboard'}
                            </p>
                            
                            {lastCompany && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40"
                              >
                                <Building2 size={13} className="text-blue-500" />
                                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                                  {isRTL ? 'آخر دخول:' : 'Last:'} {lastCompany}
                                </span>
                              </motion.div>
                            )}
                          </div>

                          {/* Error */}
                          <AnimatePresence>
                            {error && (
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="mb-5 flex items-center gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 p-3.5 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50"
                              >
                                <AlertTriangle size={18} />
                                <span className="text-sm font-bold">{error}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Form */}
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                                <Mail size={12} className="text-blue-500" />
                                {tCommon('email')}
                              </label>
                              <div className="relative group">
                                <div className={cn(
                                  "absolute top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-blue-500 transition-all duration-300",
                                  isRTL ? "right-4" : "left-4"
                                )}>
                                  <Mail size={20} />
                                </div>
                                <input
                                  type="email"
                                  required
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="name@company.com"
                                  className={cn(
                                    "w-full rounded-2xl border-2 border-slate-200 dark:border-slate-600/80 bg-slate-50/80 dark:bg-slate-700/40 py-4 text-[15px] font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-700/60 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg focus:shadow-blue-500/5 dark:focus:shadow-blue-500/10",
                                    isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                                  )}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1">
                                <Lock size={12} className="text-blue-500" />
                                {tCommon('password')}
                              </label>
                              <div className="relative group">
                                <div className={cn(
                                  "absolute top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 group-focus-within:text-blue-500 transition-all duration-300",
                                  isRTL ? "right-4" : "left-4"
                                )}>
                                  <Lock size={20} />
                                </div>
                                <input
                                  type={showPassword ? "text" : "password"}
                                  required
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder="••••••••"
                                  className={cn(
                                    "w-full rounded-2xl border-2 border-slate-200 dark:border-slate-600/80 bg-slate-50/80 dark:bg-slate-700/40 py-4 text-[15px] font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-700/60 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg focus:shadow-blue-500/5 dark:focus:shadow-blue-500/10",
                                    isRTL ? "pr-12 pl-12" : "pl-12 pr-12"
                                  )}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className={cn(
                                    "absolute top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600/50",
                                    isRTL ? "left-3" : "right-3"
                                  )}
                                >
                                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-0.5">
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    id="remember"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="peer h-4 w-4 rounded-md border-2 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer appearance-none checked:bg-blue-600 checked:border-blue-600 transition-all"
                                  />
                                  <CheckCircle2 size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <label htmlFor="remember" className="text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                                  {t('rememberMe')}
                                </label>
                              </div>

                              <Link 
                                href="/forgot-password" 
                                className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors"
                              >
                                <KeyRound size={12} />
                                {tCommon('forgotPassword')}?
                              </Link>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.01, y: -1 }}
                              whileTap={{ scale: 0.98 }}
                              type="submit"
                              disabled={isLoading}
                              className="relative w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 py-4.5 text-white font-black text-[16px] shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/35 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-3 overflow-hidden group mt-2"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                              {isLoading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                              ) : (
                                <>
                                  <LogIn size={20} />
                                  {t('loginButton')}
                                </>
                              )}
                            </motion.button>
                          </form>

                          {/* Divider + Register */}
                          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/40 text-center">
                            <p className="mb-4 text-sm font-bold text-slate-400 dark:text-slate-500">
                              {t('noAccount')}
                            </p>
                            <Link
                              href="/register"
                              className="group relative inline-flex items-center justify-center gap-2 py-3 px-8 rounded-xl text-sm font-black transition-all duration-300 overflow-hidden"
                            >
                              <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                              <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                              <UserPlus size={18} className="relative text-white" />
                              <span className="relative text-white">{t('createAccount')}</span>
                              {isRTL ? (
                                <ChevronLeft size={16} className="relative text-white group-hover:-translate-x-1 transition-transform" />
                              ) : (
                                <ChevronRight size={16} className="relative text-white group-hover:translate-x-1 transition-transform" />
                              )}
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

              {/* Footer */}
              <div className="mt-4 text-center text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest lg:hidden">
                Logistics Systems Pro © 2026
              </div>
            </div>
          </div>
    </div>
  );
}
