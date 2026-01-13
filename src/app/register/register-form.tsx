"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  University, 
  FileCheck, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Globe, 
  Upload, 
  SendHorizontal,
  CreditCard,
  Stamp,
  Signature,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
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
  const [region, setRegion] = useState("");
  const router = useRouter();

  const totalSteps = 4;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#fdfdfd]" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-white rounded-[40px] p-12 shadow-2xl border border-gray-50 text-center"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-500 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-6">طلبك قيد المراجعة</h1>
          <p className="text-gray-500 font-bold text-lg mb-10 leading-relaxed">
            تم استلام بيانات منشأتك بنجاح. سيقوم فريق التدقيق بمراجعة طلبك وتفعيل الحساب خلال الساعات القادمة.
          </p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#2c3e50] text-white rounded-2xl font-black hover:bg-[#1a252f] transition-all shadow-xl shadow-gray-200"
          >
            العودة للرئيسية
            <ArrowRight size={20} className="rotate-180" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full py-16 px-6 flex flex-col items-center" dir="rtl">
      {/* Refined Header */}
      <div className="w-full max-w-4xl text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3498db]/10 text-[#3498db] text-[10px] font-black uppercase tracking-widest mb-6"
        >
          <Briefcase size={12} />
          نظام إدارة المنشآت المتطور
        </motion.div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">تسجيل منشأة جديدة</h1>
        <p className="text-gray-500 font-bold">خطوات بسيطة للانضمام إلى أقوى نظام لوجستي</p>
      </div>

      <div className="w-full max-w-4xl">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 px-2">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-3 relative">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 border-2",
                  step >= s ? "bg-[#2c3e50] border-[#2c3e50] text-white shadow-lg shadow-gray-200" : "bg-white border-gray-100 text-gray-300"
                )}>
                  {step > s ? <CheckCircle2 size={20} /> : s}
                </div>
                <span className={cn("text-[10px] font-black absolute -bottom-6 whitespace-nowrap", step >= s ? "text-[#2c3e50]" : "text-gray-300")}>
                  {s === 1 ? "البيانات الأساسية" : s === 2 ? "الموقع والبنك" : s === 3 ? "التراخيص" : "الحساب"}
                </span>
              </div>
              {s < 4 && <div className={cn("flex-1 h-0.5 mx-4 rounded-full transition-all duration-700", step > s ? "bg-[#2c3e50]" : "bg-gray-100")} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/80 backdrop-blur-xl rounded-[40px] p-10 border border-white shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField label="اسم المنشأة" name="name" icon={Building2} required />
                  <InputField label="رقم السجل التجاري" name="commercial_number" icon={FileCheck} required />
                  <InputField label="الرقم الضريبي" name="vat_number" icon={CreditCard} />
                  <InputField label="رقم الهاتف" name="phone" icon={Phone} />
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <CreditCard size={14} className="text-[#3498db]" />
                      العملة المفضلة
                    </label>
                    <select name="currency" required className="w-full rounded-2xl border-none bg-gray-50/50 py-4 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all">
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="AED">درهم إماراتي (AED)</option>
                    </select>
                  </div>
                  <FileUploadField label="شعار المنشأة" name="logo_path" icon={Upload} />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/80 backdrop-blur-xl rounded-[40px] p-10 border border-white shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Globe size={14} className="text-[#3498db]" />
                      الدولة
                    </label>
                    <select name="country" required onChange={(e) => setCountry(e.target.value)} className="w-full rounded-2xl border-none bg-gray-50/50 py-4 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all">
                      <option value="">اختر الدولة</option>
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={14} className="text-[#3498db]" />
                      المنطقة
                    </label>
                    <select name="region" required className="w-full rounded-2xl border-none bg-gray-50/50 py-4 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all">
                      <option value="">اختر المنطقة</option>
                      {country && regions[country]?.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <InputField label="اسم البنك" name="bank_name" icon={University} className="md:col-span-2" />
                  <InputField label="رقم الآيبان" name="bank_iban" icon={CreditCard} className="md:col-span-2" />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/80 backdrop-blur-xl rounded-[40px] p-10 border border-white shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField label="رقم ترخيص النقل" name="transport_license_number" icon={FileCheck} />
                  <InputField label="نوع الترخيص" name="transport_license_type" icon={FileCheck} />
                  <div className="grid grid-cols-2 gap-4 md:col-span-2">
                    <InputField label="بداية الترخيص" name="license_start" type="date" icon={Calendar} />
                    <InputField label="نهاية الترخيص" name="license_end" type="date" icon={Calendar} />
                  </div>
                  <FileUploadField label="صورة الترخيص" name="license_image" icon={Upload} className="md:col-span-2" />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white/80 backdrop-blur-xl rounded-[40px] p-10 border border-white shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputField label="البريد الإلكتروني للإدارة" name="user_email" type="email" icon={Mail} required />
                  <div />
                  <InputField label="كلمة المرور" name="password" type="password" icon={Lock} required />
                  <InputField label="تأكيد كلمة المرور" name="confirm_password" type="password" icon={Lock} required />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-gray-500 font-black hover:text-gray-900 transition-all border border-gray-100 shadow-sm"
              >
                السابق
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex items-center justify-center gap-3 px-12 py-4 rounded-2xl font-black text-lg transition-all shadow-xl disabled:opacity-70",
                step === totalSteps ? "bg-green-600 text-white shadow-green-100 hover:bg-green-700" : "bg-[#2c3e50] text-white shadow-gray-100 hover:bg-[#1a252f] mr-auto"
              )}
            >
              {isLoading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  {step === totalSteps ? "إكمال التسجيل" : "التالي"}
                  <ChevronLeft size={20} className={cn("transition-transform", step === totalSteps && "rotate-180")} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-12 text-center text-gray-400 font-bold">
          هل لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-[#3498db] hover:underline transition-all">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}

function InputField({ label, icon: Icon, className = "", ...props }: any) {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon size={14} className="text-[#3498db]" />}
        {label}
      </label>
      <div className="relative group">
        <input
          {...props}
          className="w-full rounded-2xl border-none bg-gray-50/50 py-4 px-4 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-[#3498db]/20 outline-none transition-all duration-300"
        />
      </div>
    </div>
  );
}

function FileUploadField({ label, icon: Icon, className = "", ...props }: any) {
  const [fileName, setFileName] = useState("");

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-2">
        {Icon && <Icon size={14} className="text-[#3498db]" />}
        {label}
      </label>
      <label className="flex items-center gap-4 w-full p-4 rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/30 hover:bg-[#3498db]/5 hover:border-[#3498db] transition-all cursor-pointer group">
        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-[#3498db] shadow-sm transition-colors">
          <Upload size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-gray-900">{fileName || "اضغط للرفع أو سحب الملف هنا"}</p>
          <p className="text-[10px] font-bold text-gray-400">PNG, JPG, PDF (Max 5MB)</p>
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
