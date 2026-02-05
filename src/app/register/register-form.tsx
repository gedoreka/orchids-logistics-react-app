"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  University, 
  FileCheck, 
  Mail, 
  Lock, 
  Phone, 
  Globe, 
  Upload, 
  CreditCard,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Sparkles,
  Eye,
  EyeOff,
  Languages
} from "lucide-react";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "@/lib/locale-context";

const countries = [
  { ar: "السعودية", en: "Saudi Arabia" },
  { ar: "السودان", en: "Sudan" },
  { ar: "مصر", en: "Egypt" }
];
const regions: Record<string, { ar: string; en: string }[]> = {
  "السعودية": [
    { ar: "الرياض", en: "Riyadh" },
    { ar: "مكة المكرمة", en: "Makkah" },
    { ar: "المدينة المنورة", en: "Madinah" },
    { ar: "المنطقة الشرقية", en: "Eastern Province" },
    { ar: "القصيم", en: "Qassim" }
  ],
  "Saudi Arabia": [
    { ar: "الرياض", en: "Riyadh" },
    { ar: "مكة المكرمة", en: "Makkah" },
    { ar: "المدينة المنورة", en: "Madinah" },
    { ar: "المنطقة الشرقية", en: "Eastern Province" },
    { ar: "القصيم", en: "Qassim" }
  ],
  "السودان": [
    { ar: "الخرطوم", en: "Khartoum" },
    { ar: "بحري", en: "Bahri" },
    { ar: "أم درمان", en: "Omdurman" }
  ],
  "Sudan": [
    { ar: "الخرطوم", en: "Khartoum" },
    { ar: "بحري", en: "Bahri" },
    { ar: "أم درمان", en: "Omdurman" }
  ],
  "مصر": [
    { ar: "القاهرة", en: "Cairo" },
    { ar: "الإسكندرية", en: "Alexandria" },
    { ar: "الجيزة", en: "Giza" }
  ],
  "Egypt": [
    { ar: "القاهرة", en: "Cairo" },
    { ar: "الإسكندرية", en: "Alexandria" },
    { ar: "الجيزة", en: "Giza" }
  ]
};

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
    const newParticles: Particle[] = Array.from({ length: 40 }, (_, i) => ({
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

export default function RegisterForm() {
  const { locale, setLocale, isRTL } = useLocale();
  const t = useTranslations('register');
  const tCommon = useTranslations('common');
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const toggleLocale = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  const totalSteps = 4;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result.success) {
      setSuccess(true);
      toast.success(isRTL ? "تم تقديم طلب التسجيل بنجاح!" : "Registration request submitted successfully!");
    } else {
      toast.error(result.error || (isRTL ? "حدث خطأ ما" : "An error occurred"));
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
            {isRTL ? 'طلبك قيد المراجعة' : 'Request Under Review'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-slate-300 mb-10 leading-relaxed"
          >
            {isRTL 
              ? 'تم استلام بيانات منشأتك بنجاح. سيقوم فريق التدقيق بمراجعة طلبك وتفعيل الحساب خلال الساعات القادمة.'
              : 'Your facility data has been received successfully. Our verification team will review your request and activate your account within the next few hours.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Link 
              href="/login" 
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-500/25"
            >
              {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              {isRTL ? <ArrowRight size={20} className="rotate-180" /> : <ArrowLeft size={20} />}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const stepInfo = [
    { title: isRTL ? "البيانات الأساسية" : "Basic Info", icon: Building2 },
    { title: isRTL ? "الموقع والبنك" : "Location & Bank", icon: MapPin },
    { title: isRTL ? "التراخيص" : "Licenses", icon: FileCheck },
    { title: isRTL ? "الحساب" : "Account", icon: Lock }
  ];

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={cn(
        "hidden lg:flex lg:w-2/5 relative bg-gradient-to-br from-slate-900 via-blue-900/90 to-slate-900 items-center justify-center p-12 overflow-hidden",
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
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 border border-white/10">
                <Truck size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Logistics Systems Pro</h2>
                <p className="text-blue-400 text-sm font-bold">Enterprise Edition</p>
              </div>
            </motion.div>

            <div className="space-y-6">
              <h1 className="text-4xl font-black text-white leading-[1.15]">
                {isRTL ? (
                  <>
                    انضم إلى مستقبل <br />
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      إدارة اللوجستيات
                    </span>
                  </>
                ) : (
                  <>
                    Join the Future of <br />
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Logistics Management
                    </span>
                  </>
                )}
              </h1>
              <p className="text-slate-300 text-lg font-medium leading-relaxed">
                {isRTL 
                  ? 'أنشئ حساب منشأتك الآن وابدأ في تحويل عملياتك اللوجستية إلى تجربة رقمية متكاملة.'
                  : 'Create your facility account now and start transforming your logistics operations into a comprehensive digital experience.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4">
              {[
                { icon: ShieldCheck, label: isRTL ? "أمان وموثوقية عالية" : "High Security & Reliability" },
                { icon: BarChart3, label: isRTL ? "تحليلات وتقارير متقدمة" : "Advanced Analytics & Reports" },
                { icon: Globe, label: isRTL ? "دعم محلي ودولي واسع" : "Wide Local & International Support" },
                { icon: Briefcase, label: isRTL ? "إدارة شاملة للموارد" : "Comprehensive Resource Management" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-3 text-white bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3"
                >
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <item.icon size={18} className="text-blue-400" />
                  </div>
                  <span className="text-sm font-bold">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-8 left-8 right-8 text-slate-500 text-xs font-bold">
          © 2026 Logistics Systems Pro
        </div>
      </div>

      <div className="w-full lg:w-3/5 flex flex-col items-center justify-center p-6 sm:p-10 relative bg-white dark:bg-slate-900 overflow-y-auto">
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
          className="w-full max-w-2xl relative z-10"
        >
          <div className="lg:hidden mb-8 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/30"
            >
              <Truck size={26} />
            </motion.div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white mb-1">Logistics Systems Pro</h1>
          </div>

          <div className="mb-8">
            <motion.h2 
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl font-black text-slate-900 dark:text-white mb-2"
            >
              {t('title')}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 dark:text-slate-400 font-medium"
            >
              {isRTL ? 'أكمل الخطوات التالية لتسجيل مؤسستك في النظام' : 'Complete the following steps to register your facility'}
            </motion.p>
          </div>

          <div className="flex items-center justify-between mb-10 px-2">
            {stepInfo.map((s, index) => (
              <React.Fragment key={index}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col items-center gap-2 relative"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 border-2",
                      step > index + 1 
                        ? "bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 text-white shadow-lg shadow-green-500/25" 
                        : step === index + 1 
                          ? "bg-gradient-to-br from-blue-500 to-blue-700 border-blue-500 text-white shadow-lg shadow-blue-500/25" 
                          : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400"
                    )}
                  >
                    {step > index + 1 ? <CheckCircle2 size={20} /> : <s.icon size={18} />}
                  </motion.div>
                  <span className={cn(
                    "text-[10px] font-bold whitespace-nowrap hidden sm:block",
                    step >= index + 1 ? "text-slate-900 dark:text-white" : "text-slate-400"
                  )}>
                    {s.title}
                  </span>
                </motion.div>
                {index < 3 && (
                  <div className={cn(
                    "flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-700",
                    step > index + 1 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  <InputField label={isRTL ? "اسم المنشأة" : "Facility Name"} name="name" icon={Building2} required placeholder={isRTL ? "شركة النقل السريع" : "Fast Transport Co."} isRTL={isRTL} />
                  <InputField label={isRTL ? "رقم السجل التجاري" : "Commercial Registration"} name="commercial_number" icon={FileCheck} required placeholder="1234567890" isRTL={isRTL} />
                  <InputField label={isRTL ? "الرقم الضريبي" : "Tax Number"} name="vat_number" icon={CreditCard} placeholder="300000000000003" isRTL={isRTL} />
                  <InputField label={isRTL ? "رقم الهاتف" : "Phone Number"} name="phone" icon={Phone} placeholder="+966 5X XXX XXXX" isRTL={isRTL} />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <CreditCard size={12} className="text-blue-500" />
                      {isRTL ? 'العملة المفضلة' : 'Preferred Currency'}
                    </label>
                    <select name="currency" required className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-3.5 px-4 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                      <option value="SAR">{isRTL ? 'ريال سعودي (SAR)' : 'Saudi Riyal (SAR)'}</option>
                      <option value="USD">{isRTL ? 'دولار أمريكي (USD)' : 'US Dollar (USD)'}</option>
                      <option value="AED">{isRTL ? 'درهم إماراتي (AED)' : 'UAE Dirham (AED)'}</option>
                    </select>
                  </div>
                  <FileUploadField label={isRTL ? "شعار المنشأة" : "Facility Logo"} name="logo_path" icon={Upload} isRTL={isRTL} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Globe size={12} className="text-blue-500" />
                      {isRTL ? 'الدولة' : 'Country'}
                    </label>
                    <select name="country" required onChange={(e) => setCountry(e.target.value)} className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-3.5 px-4 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                      <option value="">{isRTL ? 'اختر الدولة' : 'Select Country'}</option>
                      {countries.map(c => <option key={c.ar} value={isRTL ? c.ar : c.en}>{isRTL ? c.ar : c.en}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <MapPin size={12} className="text-blue-500" />
                      {isRTL ? 'المنطقة' : 'Region'}
                    </label>
                    <select name="region" required className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-3.5 px-4 text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                      <option value="">{isRTL ? 'اختر المنطقة' : 'Select Region'}</option>
                      {country && regions[country]?.map(r => <option key={r.ar} value={isRTL ? r.ar : r.en}>{isRTL ? r.ar : r.en}</option>)}
                    </select>
                  </div>
                  <InputField label={isRTL ? "اسم البنك" : "Bank Name"} name="bank_name" icon={University} className="md:col-span-2" placeholder={isRTL ? "البنك الأهلي السعودي" : "Saudi National Bank"} isRTL={isRTL} />
                  <InputField label={isRTL ? "رقم الآيبان" : "IBAN Number"} name="bank_iban" icon={CreditCard} className="md:col-span-2" placeholder="SA0000000000000000000000" isRTL={isRTL} />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  <InputField label={isRTL ? "رقم ترخيص النقل" : "Transport License Number"} name="transport_license_number" icon={FileCheck} placeholder="TL-XXXXX" isRTL={isRTL} />
                  <InputField label={isRTL ? "نوع الترخيص" : "License Type"} name="transport_license_type" icon={FileCheck} placeholder={isRTL ? "نقل بضائع" : "Cargo Transport"} isRTL={isRTL} />
                  <InputField label={isRTL ? "بداية الترخيص" : "License Start Date"} name="license_start" type="date" icon={Calendar} isRTL={isRTL} />
                  <InputField label={isRTL ? "نهاية الترخيص" : "License End Date"} name="license_end" type="date" icon={Calendar} isRTL={isRTL} />
                  <FileUploadField label={isRTL ? "صورة الترخيص" : "License Image"} name="license_image" icon={Upload} className="md:col-span-2" isRTL={isRTL} />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  <InputField label={isRTL ? "البريد الإلكتروني للإدارة" : "Admin Email"} name="user_email" type="email" icon={Mail} required className="md:col-span-2" placeholder="admin@company.com" isRTL={isRTL} />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Lock size={12} className="text-blue-500" />
                      {tCommon('password')}
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        placeholder="••••••••"
                        className={cn(
                          "w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-3.5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all",
                          isRTL ? "pr-4 pl-12" : "pl-4 pr-12"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors",
                          isRTL ? "left-4" : "right-4"
                        )}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <InputField label={isRTL ? "تأكيد كلمة المرور" : "Confirm Password"} name="confirm_password" type="password" icon={Lock} required placeholder="••••••••" isRTL={isRTL} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-6 gap-4">
              {step > 1 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  {isRTL ? <ChevronLeft size={18} className="rotate-180" /> : <ChevronRight size={18} className="rotate-180" />}
                  {isRTL ? 'السابق' : 'Previous'}
                </motion.button>
              ) : (
                <div />
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={cn(
                  "flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black text-base transition-all shadow-xl disabled:opacity-70 overflow-hidden group relative",
                  step === totalSteps 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/25 hover:shadow-green-500/40" 
                    : "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25 hover:shadow-blue-500/40"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isLoading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                ) : (
                  <>
                    {step === totalSteps ? (isRTL ? "إكمال التسجيل" : "Complete Registration") : (isRTL ? "التالي" : "Next")}
                    {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                  </>
                )}
              </motion.button>
            </div>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center"
          >
            <p className="mb-4 text-sm font-medium text-slate-400">{t('haveAccount')}</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 py-3 px-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {tCommon('login')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function InputField({ label, icon: Icon, className = "", placeholder = "", isRTL = true, ...props }: any) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
        {Icon && <Icon size={12} className="text-blue-500" />}
        {label}
      </label>
      <div className="relative group">
        <input
          {...props}
          placeholder={placeholder}
          className="w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-3.5 px-4 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300"
        />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
      </div>
    </div>
  );
}

function FileUploadField({ label, icon: Icon, className = "", isRTL = true, ...props }: any) {
  const [fileName, setFileName] = useState("");

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
        {Icon && <Icon size={12} className="text-blue-500" />}
        {label}
      </label>
      <label className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-500 transition-all cursor-pointer group">
        <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors border border-slate-100 dark:border-slate-700">
          <Upload size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{fileName || (isRTL ? "اضغط للرفع أو سحب الملف هنا" : "Click to upload or drag file here")}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">PNG, JPG, PDF (Max 5MB)</p>
        </div>
        <input 
          type="file" 
          className="hidden" 
          {...props} 
          onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
        />
      </label>
    </div>
  );
}
