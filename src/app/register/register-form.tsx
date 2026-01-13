"use client";

import React, { useState } from "react";
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
  Truck,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const countries = ["السعودية", "السودان", "مصر"];
const regions: Record<string, string[]> = {
  "السعودية": ["الرياض", "مكة المكرمة", "المدينة المنورة", "المنطقة الشرقية", "القصيم"],
  "السودان": ["الخرطوم", "بحري", "أم درمان"],
  "مصر": ["القاهرة", "الإسكندرية", "الجيزة"]
};

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState("");
  const router = useRouter();

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
      toast.success("تم تقديم طلب التسجيل بنجاح!");
    } else {
      toast.error(result.error || "حدث خطأ ما");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-white rounded-[40px] p-12 shadow-2xl border border-slate-100 text-center"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-green-50 text-green-500 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-6">طلبك قيد المراجعة</h1>
          <p className="text-slate-500 font-bold text-lg mb-10 leading-relaxed">
            تم استلام بيانات منشأتك بنجاح. سيقوم فريق التدقيق بمراجعة طلبك وتفعيل الحساب خلال الساعات القادمة.
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
          >
            العودة لتسجيل الدخول
            <ArrowRight size={20} className="rotate-180" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-white overflow-hidden">
      {/* Left Side: Branding (Visible on lg) */}
      <div className="hidden lg:flex lg:w-1/3 relative bg-[#1e293b] items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#3b82f6,transparent_70%)]" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay grayscale" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <Truck size={28} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Logistics Systems Pro</h2>
            </div>

            <div className="space-y-6">
              <h1 className="text-4xl font-black text-white leading-[1.1]">
                انضم إلى مستقبل <br />
                <span className="text-blue-500">إدارة اللوجستيات</span>
              </h1>
              <p className="text-gray-400 text-lg font-medium leading-relaxed">
                أنشئ حساب منشأتك الآن وابدأ في تحويل عملياتك اللوجستية إلى تجربة رقمية متكاملة واحترافية.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 pt-4">
              {[
                { icon: ShieldCheck, label: "أمان وموثوقية عالية" },
                { icon: BarChart3, label: "تحليلات وتقارير متقدمة" },
                { icon: Globe, label: "دعم محلي ودولي واسع" },
                { icon: Briefcase, label: "إدارة شاملة للموارد" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <item.icon size={20} className="text-blue-500" />
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-2/3 flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Mobile Header */}
          <div className="lg:hidden mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Truck size={26} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-1">Logistics Systems Pro</h1>
          </div>

          <div className="mb-10 text-right" dir="rtl">
            <h2 className="text-3xl font-black text-slate-900 mb-2">إنشاء حساب منشأة جديد</h2>
            <p className="text-slate-500 font-medium text-sm">أكمل الخطوات التالية لتسجيل مؤسستك في النظام</p>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="flex items-center justify-between mb-12 px-2" dir="rtl">
            {[1, 2, 3, 4].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-3 relative">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 border-2",
                    step >= s ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white border-slate-100 text-slate-300"
                  )}>
                    {step > s ? <CheckCircle2 size={20} /> : s}
                  </div>
                  <span className={cn("text-[10px] font-black absolute -bottom-6 whitespace-nowrap", step >= s ? "text-slate-900" : "text-slate-300")}>
                    {s === 1 ? "البيانات الأساسية" : s === 2 ? "الموقع والبنك" : s === 3 ? "التراخيص" : "الحساب"}
                  </span>
                </div>
                {s < 4 && <div className={cn("flex-1 h-1 mx-4 rounded-full transition-all duration-700", step > s ? "bg-blue-600" : "bg-slate-100")} />}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <InputField label="اسم المنشأة" name="name" icon={Building2} required />
                  <InputField label="رقم السجل التجاري" name="commercial_number" icon={FileCheck} required />
                  <InputField label="الرقم الضريبي" name="vat_number" icon={CreditCard} />
                  <InputField label="رقم الهاتف" name="phone" icon={Phone} />
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-2">
                      <CreditCard size={14} className="text-blue-500" />
                      العملة المفضلة
                    </label>
                    <select name="currency" required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="AED">درهم إماراتي (AED)</option>
                    </select>
                  </div>
                  <FileUploadField label="شعار المنشأة" name="logo_path" icon={Upload} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-2">
                      <Globe size={14} className="text-blue-500" />
                      الدولة
                    </label>
                    <select name="country" required onChange={(e) => setCountry(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                      <option value="">اختر الدولة</option>
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-2">
                      <MapPin size={14} className="text-blue-500" />
                      المنطقة
                    </label>
                    <select name="region" required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all">
                      <option value="">اختر المنطقة</option>
                      {country && regions[country]?.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <InputField label="اسم البنك" name="bank_name" icon={University} className="md:col-span-2" />
                  <InputField label="رقم الآيبان" name="bank_iban" icon={CreditCard} className="md:col-span-2" />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <InputField label="رقم ترخيص النقل" name="transport_license_number" icon={FileCheck} />
                  <InputField label="نوع الترخيص" name="transport_license_type" icon={FileCheck} />
                  <InputField label="بداية الترخيص" name="license_start" type="date" icon={Calendar} />
                  <InputField label="نهاية الترخيص" name="license_end" type="date" icon={Calendar} />
                  <FileUploadField label="صورة الترخيص" name="license_image" icon={Upload} className="md:col-span-2" />
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <InputField label="البريد الإلكتروني للإدارة" name="user_email" type="email" icon={Mail} required />
                  <div className="hidden md:block" />
                  <InputField label="كلمة المرور" name="password" type="password" icon={Lock} required />
                  <InputField label="تأكيد كلمة المرور" name="confirm_password" type="password" icon={Lock} required />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl border border-slate-200 text-slate-600 font-black hover:bg-slate-50 transition-all"
                >
                  السابق
                </button>
              ) : (
                <div />
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "flex items-center justify-center gap-3 px-12 py-4 rounded-xl font-black text-base transition-all shadow-xl disabled:opacity-70",
                  step === totalSteps ? "bg-green-600 text-white shadow-green-500/20 hover:bg-green-700" : "bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700"
                )}
              >
                {isLoading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white" />
                ) : (
                  <>
                    {step === totalSteps ? "إكمال التسجيل" : "التالي"}
                    <ChevronLeft size={20} className={cn("transition-transform", step === totalSteps && "rotate-180")} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="mb-4 text-sm font-medium text-slate-400">هل لديك حساب بالفعل؟</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl border border-slate-200 text-sm font-black text-slate-900 hover:bg-slate-50 transition-all"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, icon: Icon, className = "", ...props }: any) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-2">
        {Icon && <Icon size={14} className="text-blue-500" />}
        {label}
      </label>
      <div className="relative group">
        <input
          {...props}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 px-4 text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-200"
        />
      </div>
    </div>
  );
}

function FileUploadField({ label, icon: Icon, className = "", ...props }: any) {
  const [fileName, setFileName] = useState("");

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-2">
        {Icon && <Icon size={14} className="text-blue-500" />}
        {label}
      </label>
      <label className="flex items-center gap-4 w-full p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 hover:bg-blue-50 hover:border-blue-500 transition-all cursor-pointer group">
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-sm transition-colors border border-slate-100">
          <Upload size={18} />
        </div>
        <div className="flex-1 text-right">
          <p className="text-sm font-bold text-slate-900">{fileName || "اضغط للرفع أو سحب الملف هنا"}</p>
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
