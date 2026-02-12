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
  Languages
} from "lucide-react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/lib/locale-context";

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
        setUserName(result.user?.name || "");
        if (result.user?.company_name) {
          localStorage.setItem("last_company_name", result.user.company_name);
        }
        setShowWelcome(true);
        setTimeout(() => {
          if (result.user?.is_subscription_active) {
            router.push("/dashboard");
          } else {
            router.push("/subscriptions");
          }
          router.refresh();
        }, 2500);
      } else {
      setError(result.error || (isRTL ? "حدث خطأ ما في البيانات" : "Invalid credentials"));
      setIsLoading(false);
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

        <div className="relative z-10 w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
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

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 relative bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.06),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.06),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_60%),radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.08),transparent_60%)]" />
            
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
            
              <div className="w-full max-w-[600px] relative z-10 flex flex-col items-center">
              {/* Logo Title - Above Card */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8 text-center"
              >
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl shadow-blue-500/30 border border-white/20 ring-4 ring-blue-500/10"
                  >
                    <Truck size={48} />
                  </motion.div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Logistics Systems Pro</h1>
                  <p className="text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-[0.3em]">Enterprise Edition</p>
              </motion.div>

              {/* Main Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full rounded-[28px] border border-white/60 dark:border-slate-700/60 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.6)] dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] px-10 sm:px-16 py-14 bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl"
              >

              {/* Welcome Text */}
              <div className="mb-12 text-center">
                <motion.h2 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[2.5rem] font-black mb-4"
                >
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {t('subtitle')}
                  </span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                    className="text-slate-500 dark:text-slate-400 font-medium text-lg"
                >
                  {isRTL ? 'أدخل بياناتك للوصول إلى لوحة التحكم الخاصة بك' : 'Enter your credentials to access your dashboard'}
                </motion.p>
                
                {lastCompany && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-4 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-100 dark:border-blue-900/50"
                  >
                    <Building2 size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                      {isRTL ? 'آخر دخول:' : 'Last login:'} {lastCompany}
                    </span>
                  </motion.div>
                )}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="mb-8 flex items-center gap-3 rounded-2xl bg-red-50 dark:bg-red-950/30 p-5 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 backdrop-blur-sm"
                  >
                    <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/50">
                      <AlertTriangle size={20} />
                    </div>
                    <span className="text-base font-bold">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-7">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2.5"
                >
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Mail size={14} className="text-blue-500" />
                    {tCommon('email')}
                  </label>
                  <div className="relative group">
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300",
                      isRTL ? "right-5" : "left-5"
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
                          "w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-5 text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300",
                          isRTL ? "pr-14 pl-5" : "pl-14 pr-5"
                        )}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-2.5"
                >
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Lock size={14} className="text-blue-500" />
                    {tCommon('password')}
                  </label>
                  <div className="relative group">
                    <div className={cn(
                      "absolute top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300",
                      isRTL ? "right-5" : "left-5"
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
                          "w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-5 text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300",
                          isRTL ? "pr-14 pl-14" : "pl-14 pr-14"
                        )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1",
                        isRTL ? "left-5" : "right-5"
                      )}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="flex items-center justify-between px-1 pt-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="peer h-5.5 w-5.5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer appearance-none checked:bg-blue-600 checked:border-blue-600 transition-all"
                      />
                      <CheckCircle2 size={15} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <label htmlFor="remember" className="text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      {t('rememberMe')}
                    </label>
                  </div>

                  <Link 
                    href="/forgot-password" 
                    className="group relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                    <span className="absolute inset-0 border border-transparent group-hover:border-amber-500/30 rounded-xl transition-all duration-300" />
                    <KeyRound size={15} className="text-amber-600 dark:text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent group-hover:from-amber-500 group-hover:via-orange-500 group-hover:to-amber-500 transition-all">
                      {tCommon('forgotPassword')}?
                    </span>
                  </Link>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                    className="relative w-full rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 bg-size-200 bg-pos-0 hover:bg-pos-100 py-[22px] text-white font-black text-xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-500 disabled:opacity-70 flex items-center justify-center gap-3 overflow-hidden group mt-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {isLoading ? (
                    <div className="h-7 w-7 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                  ) : (
                    <>
                        <LogIn size={24} />
                      {t('loginButton')}
                    </>
                  )}
                </motion.button>
              </form>

              <div className="mt-12 pt-10 border-t border-slate-200/60 dark:border-slate-700/50 text-center">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mb-6 text-lg font-bold bg-gradient-to-r from-slate-500 via-slate-600 to-slate-500 bg-clip-text text-transparent dark:from-slate-400 dark:via-slate-300 dark:to-slate-400"
                >
                  {t('noAccount')}
                </motion.p>
                <Link
                  href="/register"
                    className="group relative inline-flex items-center justify-center gap-3 py-5 px-14 rounded-2xl text-lg font-black transition-all duration-500 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-100" />
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute inset-0 shadow-xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow duration-500 rounded-2xl" />
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="absolute inset-[2px] bg-gradient-to-br from-white/10 to-transparent rounded-[14px] opacity-50" />
                  
                    <UserPlus size={22} className="relative text-white group-hover:scale-110 transition-transform duration-300" />
                  <span className="relative text-white">
                    {t('createAccount')}
                  </span>
                  {isRTL ? (
                    <ChevronLeft size={18} className="relative text-white group-hover:-translate-x-2 transition-transform duration-300" />
                  ) : (
                    <ChevronRight size={18} className="relative text-white group-hover:translate-x-2 transition-transform duration-300" />
                  )}
                </Link>
              </div>
              </motion.div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 lg:hidden text-center text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
              Logistics Systems Pro © 2026
            </div>
          </div>
    </div>
  );
}
