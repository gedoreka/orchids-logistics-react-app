"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BrandLogo from "@/components/brand-logo";
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
  ArrowLeft,
  Truck,
  ShieldCheck,
  Globe,
  BarChart3,
  Sparkles,
  KeyRound,
  Languages
} from "lucide-react";
import { resetPasswordAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/lib/locale-context";

interface ResetFormProps {
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

export default function ResetForm({ email, userName }: ResetFormProps) {
  const { locale, setLocale, isRTL } = useLocale();
  const tCommon = useTranslations('common');
  
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

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
  const strengthText = isRTL 
    ? ["", "ضعيفة", "متوسطة", "قوية", "قوية جداً"][strength]
    : ["", "Weak", "Medium", "Strong", "Very Strong"][strength];
  const strengthColor = ["bg-slate-200", "bg-red-500", "bg-yellow-500", "bg-green-500", "bg-blue-500"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password.length < 6) {
      setError(isRTL ? "كلمة المرور يجب أن تكون على الأقل 6 أحرف" : "Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (password !== confirm) {
      setError(isRTL ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
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
      setError(result.error || (isRTL ? "حدث خطأ ما" : "An error occurred"));
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative p-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <ParticleBackground />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent_70%)]" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-8 w-28 h-28 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30"
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
            className="text-4xl md:text-5xl font-black text-white mb-4"
          >
            {isRTL ? 'تم التحديث بنجاح!' : 'Updated Successfully!'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-slate-300 mb-10 leading-relaxed"
          >
            {isRTL 
              ? 'تم تحديث كلمة المرور لحسابك بنجاح. سيتم توجيهك لصفحة تسجيل الدخول الآن.'
              : 'Your password has been updated successfully. You will be redirected to the login page now.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="w-full max-w-xs mx-auto"
          >
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 flex items-center justify-center gap-3"
          >
            <div className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={cn(
        "hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-blue-900/90 to-slate-900 items-center justify-center p-12 overflow-hidden",
        !isRTL && "order-2"
      )}>
        <ParticleBackground />
        
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-slate-900/80" />
        </div>

        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
              <BrandLogo size="lg" />

            <div className="space-y-6">
              <h1 className="text-5xl font-black text-white leading-[1.15]">
                {isRTL ? (
                  <>
                    حماية <br />
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      متجددة وقوية
                    </span>
                  </>
                ) : (
                  <>
                    Protection <br />
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Renewed & Strong
                    </span>
                  </>
                )}
              </h1>
              <p className="text-slate-300 text-lg font-medium leading-relaxed">
                {isRTL 
                  ? 'تأكد دائماً من اختيار كلمات مرور فريدة وقوية لحماية بيانات منشأتك وعملياتك اللوجستية.'
                  : 'Always ensure choosing unique and strong passwords to protect your facility data and logistics operations.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { icon: ShieldCheck, label: isRTL ? "تشفير متطور" : "Advanced Encryption", desc: "256-bit" },
                { icon: RefreshCw, label: isRTL ? "تحديث آمن" : "Secure Update", desc: isRTL ? "فوري" : "Instant" },
                { icon: Globe, label: isRTL ? "وصول عالمي" : "Global Access", desc: isRTL ? "آمن" : "Secure" },
                { icon: KeyRound, label: isRTL ? "مراقبة ذكية" : "Smart Monitor", desc: "24/7" }
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
                  <span className={cn("text-xs text-slate-400 font-medium", isRTL ? "mr-11" : "ml-11")}>{item.desc}</span>
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

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white dark:bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20" />
        
        {/* Language Switcher Button */}
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLocale}
          className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50"
        >
          <Languages size={18} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {locale === 'ar' ? 'English' : 'العربية'}
          </span>
        </motion.button>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[480px] relative z-10"
        >
            <div className="lg:hidden mb-10 text-center">
              <BrandLogo size="md" />
            </div>

          <div className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={cn("mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl shadow-green-500/30", isRTL ? "mx-auto lg:mx-0" : "mx-auto lg:mx-0")}
            >
              <Key size={36} />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-black text-slate-900 dark:text-white mb-3"
            >
              {isRTL ? 'كلمة مرور جديدة' : 'New Password'}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-500 dark:text-slate-400 font-medium"
            >
              {isRTL 
                ? 'اختر كلمة مرور قوية وآمنة لحسابك'
                : 'Choose a strong and secure password for your account'}
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 flex items-center gap-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-4" 
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
                className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-950/30 p-4 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 backdrop-blur-sm"
              >
                <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/50">
                  <AlertTriangle size={18} />
                </div>
                <span className="text-sm font-bold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-2"
            >
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-2">
                <Lock size={12} className="text-blue-500" />
                {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <div className="relative group">
                <div className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300",
                  isRTL ? "right-4" : "left-4"
                )}>
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300",
                    isRTL ? "pr-12 pl-12" : "pl-12 pr-12"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1",
                    isRTL ? "left-4" : "right-4"
                  )}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              </div>
              
              <div className="pt-2 px-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{isRTL ? 'قوة الحماية' : 'Security Strength'}</span>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    strength >= 3 ? "text-green-600 dark:text-green-400" : strength >= 2 ? "text-yellow-600 dark:text-yellow-400" : "text-slate-400"
                  )}>
                    {strengthText}
                  </span>
                </div>
                <div className="flex gap-1.5 h-2">
                  {[1, 2, 3, 4].map((s) => (
                    <motion.div 
                      key={s} 
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: strength >= s ? 1 : 1 }}
                      className={cn(
                        "flex-1 rounded-full transition-all duration-500",
                        strength >= s ? strengthColor : "bg-slate-100 dark:bg-slate-800"
                      )}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-2">
                <Key size={12} className="text-blue-500" />
                {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <div className="relative group">
                <div className={cn(
                  "absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300",
                  isRTL ? "right-4" : "left-4"
                )}>
                  <Key size={18} />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300",
                    isRTL ? "pr-12 pl-12" : "pl-12 pr-12"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1",
                    isRTL ? "left-4" : "right-4"
                  )}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              </div>
              {confirm && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 mt-2 px-1"
                >
                  {password === confirm ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-black">
                      <div className="p-1 rounded-full bg-green-100 dark:bg-green-900/50">
                        <CheckCircle2 size={12} />
                      </div>
                      {isRTL ? 'تطابق تام' : 'Perfect Match'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-xs font-black">
                      <div className="p-1 rounded-full bg-red-100 dark:bg-red-900/50">
                        <XCircle size={12} />
                      </div>
                      {isRTL ? 'لا يوجد تطابق' : 'No Match'}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || password !== confirm || password.length < 6}
              className="relative w-full rounded-2xl bg-gradient-to-r from-green-500 via-emerald-600 to-green-500 bg-size-200 bg-pos-0 hover:bg-pos-100 py-4 text-white font-black text-base shadow-xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden group mt-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
              ) : (
                <>
                  <RefreshCw size={20} />
                  {isRTL ? 'تحديث كلمة المرور' : 'Update Password'}
                </>
              )}
            </motion.button>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center"
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 py-3 px-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
            >
              {isRTL ? (
                <>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                </>
              ) : (
                <>
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Login
                </>
              )}
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
