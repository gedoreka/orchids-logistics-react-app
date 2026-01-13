"use client";

import React, { useState, useEffect } from "react";
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
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { registerAction } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const regions: Record<string, string[]> = {
  "السعودية": [
    "الرياض", "مكة المكرمة", "المدينة المنورة", "المنطقة الشرقية", "القصيم", "عسير",
    "تبوك", "حائل", "الجوف", "الباحة", "نجران", "جازان", "الحدود الشمالية"
  ],
  "السودان": ["الخرطوم", "بحري", "أم درمان"],
  "مصر": ["القاهرة", "الإسكندرية", "الجيزة"]
};

const districts: Record<string, string[]> = {
  "الرياض": ["الربيع", "الندى", "الصحافة", "النرجس", "العارض", "النفل", "العقيق", "الوادي", "الغدير", "الياسمين", "الفلاح", "بنبان", "القيروان", "حطين", "الملقا", "الروضة", "الرمال", "المونسية", "قرطبة", "الجنادرية", "القادسية", "اليرموك", "غرناطة", "أشبيلية", "الحمراء", "المعيزلية"],
  "مكة المكرمة": ["التنعيم", "الخالدية", "الرصيفة", "الزاهر", "الزهراء", "السليمانية", "الشامية", "الشبيكة", "الشوقية", "الطندباوي", "العتيبية", "العدل", "العزيزية", "العوالي", "الغزة", "القشاشية", "الكعكية", "المسفلة", "المعابدة", "المعيصم", "النزهة", "الهنداوية", "بطحاء قريش"],
  "المدينة المنورة": ["العزيزية", "الملك فهد", "الربوة", "سيد الشهداء", "قباء", "العنابس", "السحمان", "المستراح", "البحر", "الجبور", "النصر", "العنبرية", "العوالي", "العيون", "المناخة", "الأغوات", "الساحة", "زقاق الطيار", "الحرة الشرقية", "التاجوري", "باب المجيدي", "باب الشامي", "الحرة الغربية", "الجرف", "الدويمة", "القبلتين", "أبيار علي", "الخالدية", "الإسكان", "المطار"],
  "المنطقة الشرقية": ["السوق", "الربيع", "النخيل", "الدانة", "النهضة", "البادية", "الجلوية", "الدواسر", "الزهور", "الطبيشي", "العدامة", "العزيزية", "العنود", "القادسية", "الغدير"],
  "الخرطوم": ["كافوري", "الصحافة", "جبرة", "اللاماب", "المنشية"],
  "القاهرة": ["مدينة نصر", "المعادي", "الزمالك", "شبرا", "مصر الجديدة"]
};

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result.success) {
      setSuccess(true);
      toast.success("تم تقديم طلب التسجيل بنجاح!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error(result.error || "حدث خطأ ما");
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc] overflow-hidden" dir="rtl">
        {/* Decorative Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/5 blur-[120px] rounded-full" />
          <div className="bottom-[-10%] right-[-10%] absolute w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-2xl bg-white rounded-[40px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center border border-slate-100"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-teal-50 text-teal-600">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-6">تم تقديم طلبك بنجاح!</h1>
          <div className="space-y-4 text-slate-600 text-lg mb-10 leading-relaxed">
            <p>شكراً لانضمامك إلى <span className="text-teal-600 font-bold">Logistics Systems Pro</span></p>
            <p>لقد استلمنا طلب تسجيل منشأتك بنجاح. سيقوم فريقنا بمراجعة البيانات والمستندات المرفقة خلال 24-48 ساعة.</p>
            <p>سيتم إرسال بريد إلكتروني إليك فور تفعيل الحساب.</p>
          </div>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
          >
            العودة لصفحة الدخول
            <ArrowRight size={20} className="rotate-180" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#f8fafc] py-12 px-4 md:px-6 overflow-x-hidden" dir="rtl">
      {/* Dynamic Background Shapes */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
          animate={{ x: mousePosition.x * 2, y: mousePosition.y * 2 }}
          className="absolute top-[10%] left-[5%] w-[300px] h-[300px] bg-teal-400/10 blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ x: -mousePosition.x * 1.5, y: -mousePosition.y * 1.5 }}
          className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-400/10 blur-[100px] rounded-full" 
        />
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-bold mb-6 border border-teal-100">
            <Building2 size={16} />
            بوابة تسجيل المنشآت
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Logistics Systems Pro
          </h1>
          <p className="text-slate-500 text-lg font-medium">ابدأ رحلتك اللوجستية الاحترافية معنا اليوم</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Establishment Data */}
          <FormSection title="بيانات المنشأة الأساسية" icon={<Building2 />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="اسم المنشأة" name="name" icon={<Building2 />} required placeholder="الاسم التجاري الكامل" />
              <InputField label="رقم السجل التجاري" name="commercial_number" icon={<FileCheck />} required placeholder="رقم السجل المكون من 10 أرقام" />
              <InputField label="الرقم الضريبي" name="vat_number" icon={<CreditCard />} placeholder="الرقم الضريبي الموحد" />
              <InputField label="رقم الهاتف" name="phone" icon={<Phone />} placeholder="05xxxxxxxx" />
              <InputField label="الموقع الإلكتروني" name="website" type="url" icon={<Globe />} placeholder="https://example.com" />
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 mr-1 flex items-center gap-2">
                  <CreditCard size={16} className="text-teal-600" />
                  العملة الأساسية
                </label>
                <select name="currency" required className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 px-4 text-slate-900 outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/5 transition-all">
                  <option value="">اختر العملة</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                  <option value="SDG">جنيه سوداني (SDG)</option>
                </select>
              </div>

              <FileUploadField label="شعار المنشأة" name="logo_path" icon={<Upload />} accept="image/*" />
              <FileUploadField label="الختم الرسمي" name="stamp_path" icon={<Stamp />} accept="image/*" />
              <FileUploadField label="التوقيع الرقمي" name="digital_seal_path" icon={<Signature />} accept="image/*" />
            </div>
          </FormSection>

          {/* Section: Location */}
          <FormSection title="الموقع الجغرافي" icon={<MapPin />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 mr-1 flex items-center gap-2">
                  <Globe size={16} className="text-teal-600" />
                  الدولة
                </label>
                <select 
                  name="country" 
                  required 
                  onChange={(e) => {setCountry(e.target.value); setRegion("");}}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 px-4 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-all"
                >
                  <option value="">اختر الدولة</option>
                  {Object.keys(regions).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 mr-1 flex items-center gap-2">
                  <MapPin size={16} className="text-teal-600" />
                  المنطقة / الولاية
                </label>
                <select 
                  name="region" 
                  required 
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 px-4 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-all"
                >
                  <option value="">اختر المنطقة</option>
                  {country && regions[country]?.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 mr-1 flex items-center gap-2">
                  <MapPin size={16} className="text-teal-600" />
                  الحي
                </label>
                <select 
                  name="district" 
                  required 
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 px-4 text-slate-900 outline-none focus:border-teal-500 focus:bg-white transition-all"
                >
                  <option value="">اختر الحي</option>
                  {region && districts[region]?.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <InputField label="الشارع" name="street" className="md:col-span-2" placeholder="اسم الشارع ورقم المبنى" />
              <InputField label="الرمز البريدي" name="postal_code" placeholder="12345" />
              <InputField label="العنوان الوطني المختصر" name="short_address" className="md:col-span-3" placeholder="مثال: ABCD1234" />
            </div>
          </FormSection>

          {/* Section: Bank */}
          <FormSection title="الحساب البنكي" icon={<University />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="اسم المستفيد" name="bank_beneficiary" icon={<User />} placeholder="اسم المنشأة كما في البنك" />
              <InputField label="اسم البنك" name="bank_name" icon={<University />} placeholder="مثال: بنك الراجحي" />
              <InputField label="رقم الحساب" name="bank_account" icon={<CreditCard />} placeholder="رقم الحساب البنكي" />
              <InputField label="رقم الآيبان (IBAN)" name="bank_iban" icon={<CreditCard />} placeholder="SAxxxxxxxxxxxxxxxxxxxxxx" />
            </div>
          </FormSection>

          {/* Section: License */}
          <FormSection title="بيانات الترخيص" icon={<FileCheck />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="رقم ترخيص النقل" name="transport_license_number" icon={<FileCheck />} />
              <InputField label="نوع الترخيص" name="transport_license_type" placeholder="مثال: نقل بري بضائع" />
              <FileUploadField label="صورة الترخيص" name="license_image" icon={<Upload />} accept="image/*,application/pdf" />
              
              <div className="grid grid-cols-2 gap-4">
                <InputField label="تاريخ البداية" name="license_start" type="date" icon={<Calendar />} />
                <InputField label="تاريخ الانتهاء" name="license_end" type="date" icon={<Calendar />} />
              </div>
            </div>
          </FormSection>

          {/* Section: User Account */}
          <FormSection title="بيانات مدير النظام" icon={<User />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="البريد الإلكتروني الرسمي" name="user_email" type="email" icon={<Mail />} required placeholder="سيكون هذا اسم المستخدم للدخول" />
              <div />
              <InputField label="كلمة المرور" name="password" type="password" icon={<Lock />} required placeholder="••••••••" />
              <InputField label="تأكيد كلمة المرور" name="confirm_password" type="password" icon={<Lock />} required placeholder="••••••••" />
            </div>
          </FormSection>

          {/* Submit Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-6"
          >
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden group py-6 rounded-[24px] bg-teal-600 text-white font-black text-xl shadow-[0_20px_40px_rgba(0,128,128,0.25)] transition-all hover:bg-teal-700 hover:shadow-[0_25px_50px_rgba(0,128,128,0.35)] disabled:opacity-70 flex items-center justify-center gap-4"
            >
              {isLoading ? (
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-white/30 border-t-white" />
              ) : (
                  <>
                    إرسال طلب الانضمام
                    <SendHorizontal size={24} className="group-hover:translate-x-[-10px] group-hover:translate-y-[-10px] transition-transform" />
                  </>
              )}
            </button>
            <p className="mt-6 text-center text-slate-500 font-medium">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-teal-600 font-bold hover:underline">تسجيل الدخول</Link>
            </p>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-50">
        <div className="h-14 w-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-sm">
          {React.cloneElement(icon as React.ReactElement, { size: 28 })}
        </div>
        <h2 className="text-2xl font-black text-slate-800">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function InputField({ label, icon, className = "", ...props }: any) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-bold text-slate-700 mr-1 flex items-center gap-2">
        {icon && React.cloneElement(icon as React.ReactElement, { size: 16, className: "text-teal-600" })}
        {label}
      </label>
      <div className="relative group">
        <input
          {...props}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 px-4 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/5"
        />
      </div>
    </div>
  );
}

function FileUploadField({ label, icon, ...props }: any) {
  const [fileName, setFileName] = useState("");

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 mr-1 flex items-center gap-2">
        {icon && React.cloneElement(icon as React.ReactElement, { size: 16, className: "text-teal-600" })}
        {label}
      </label>
      <div className="relative">
        <label className="flex flex-col items-center justify-center w-full min-h-[100px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-teal-500 transition-all cursor-pointer group">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {fileName ? (
              <div className="flex items-center gap-2 text-teal-600 font-bold">
                <CheckCircle2 size={24} />
                <span className="text-sm max-w-[200px] truncate">{fileName}</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2 text-slate-400 group-hover:text-teal-500 transition-colors" />
                <p className="text-xs text-slate-500 group-hover:text-teal-600">انقر للرفع</p>
              </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            {...props} 
            onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
          />
        </label>
      </div>
    </div>
  );
}
