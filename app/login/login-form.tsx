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
                {/* Single Elegant Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full rounded-[2rem] bg-white dark:bg-slate-800/95 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_4px_6px_-1px_rgba(59,130,246,0.06),0_10px_15px_-3px_rgba(59,130,246,0.08),0_20px_50px_-12px_rgba(99,102,241,0.12)] dark:shadow-[0_4px_6px_-1px_rgba(59,130,246,0.1),0_10px_15px_-3px_rgba(59,130,246,0.15),0_20px_60px_-12px_rgba(99,102,241,0.3),0_0_0_1px_rgba(59,130,246,0.05)] overflow-hidden backdrop-blur-sm"
                >
                  {/* Gradient Top Strip */}
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                  {/* Card Content */}
                <div className="px-10 sm:px-12 py-10">
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
