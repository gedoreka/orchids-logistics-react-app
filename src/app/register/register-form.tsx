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

function FloatingShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white/10 rounded-full"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 2,
            ease: "easeInOut",
          }}
          style={{
            width: 100 - i * 10,
            height: 100 - i * 10,
            top: `${10 + i * 25}%`,
            left: i % 2 === 0 ? `${10 + i * 5}%` : undefined,
            right: i % 2 !== 0 ? `${10 + i * 5}%` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const router = useRouter();

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
      <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-hidden" dir="rtl">
        <FloatingShapes />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-2xl bg-[var(--glass-bg)] backdrop-blur-[var(--frosted-blur)] rounded-[30px] p-10 shadow-[var(--card-shadow)] text-center border border-[var(--glass-border)]"
        >
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-color)] mb-6">تم تقديم طلبك بنجاح!</h1>
          <div className="space-y-4 text-[var(--text-color)] text-lg mb-10 leading-relaxed">
            <p>شكراً لانضمامك إلى <span className="font-bold">Logistics Systems Pro</span></p>
            <p>لقد استلمنا طلب تسجيل منشأتك بنجاح. سيقوم فريقنا بمراجعة البيانات والمستندات المرفقة خلال 24-48 ساعة.</p>
            <p>سيتم إرسال بريد إلكتروني إليك فور تفعيل الحساب.</p>
          </div>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-2xl font-bold hover:shadow-[var(--hover-shadow)] transition-all"
          >
            العودة لصفحة الدخول
            <ArrowRight size={20} className="rotate-180" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full py-12 px-4 md:px-6 overflow-x-hidden" dir="rtl">
      <FloatingShapes />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--glass-bg)] backdrop-blur-[var(--frosted-blur)] border border-[var(--glass-border)] rounded-[30px] p-10 mb-10 shadow-[var(--card-shadow)] text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3498db] via-[#2ecc71] via-[#e74c3c] via-[#f39c12] via-[#9b59b6] to-[#3498db] bg-[length:200%_100%] animate-[gradientFlow_3s_linear_infinite]" />
          <h1 className="text-4xl md:text-5xl font-black text-[var(--text-color)] mb-4 flex items-center justify-center gap-4">
            <Building2 size={48} />
            تسجيل منشأة جديدة
          </h1>
          <p className="text-[var(--text-color)] text-xl font-medium">املأ النموذج أدناه لتسجيل منشأتك في نظام Logistics Systems Pro</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Establishment Data */}
          <FormSection title="بيانات المنشأة الأساسية" icon={<Building2 />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="اسم المنشأة" name="name" icon={<Building2 />} required placeholder="أدخل اسم المنشأة" />
              <InputField label="رقم السجل التجاري" name="commercial_number" icon={<FileCheck />} required placeholder="أدخل رقم السجل التجاري" />
              <InputField label="الرقم الضريبي" name="vat_number" icon={<CreditCard />} placeholder="أدخل الرقم الضريبي" />
              <InputField label="رقم الهاتف" name="phone" icon={<Phone />} placeholder="أدخل رقم الهاتف" />
              <InputField label="الموقع الإلكتروني" name="website" type="url" icon={<Globe />} placeholder="https://example.com" />
              
              <div className="space-y-2">
                <label className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
                  <CreditCard size={20} className="text-green-500" />
                  العملة
                </label>
                <select name="currency" required className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-4 px-4 text-[var(--text-color)] outline-none focus:bg-white transition-all">
                  <option value="">اختر العملة</option>
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                  <option value="EUR">يورو (EUR)</option>
                  <option value="EGP">جنيه مصري (EGP)</option>
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
                <label className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
                  <Globe size={20} className="text-green-500" />
                  الدولة
                </label>
                <select 
                  name="country" 
                  required 
                  onChange={(e) => {setCountry(e.target.value); setRegion("");}}
                  className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-4 px-4 text-[var(--text-color)] outline-none focus:bg-white transition-all"
                >
                  <option value="">اختر الدولة</option>
                  {Object.keys(regions).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
                  <MapPin size={20} className="text-green-500" />
                  المنطقة
                </label>
                <select 
                  name="region" 
                  required 
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-4 px-4 text-[var(--text-color)] outline-none focus:bg-white transition-all"
                >
                  <option value="">اختر المنطقة</option>
                  {country && regions[country]?.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
                  <MapPin size={20} className="text-green-500" />
                  الحي
                </label>
                <select 
                  name="district" 
                  required 
                  className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] py-4 px-4 text-[var(--text-color)] outline-none focus:bg-white transition-all"
                >
                  <option value="">اختر الحي</option>
                  {region && districts[region]?.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <InputField label="الشارع" name="street" className="md:col-span-2" placeholder="أدخل اسم الشارع" />
              <InputField label="الرمز البريدي" name="postal_code" placeholder="أدخل الرمز البريدي" />
              <InputField label="العنوان الوطني المختصر" name="short_address" className="md:col-span-3" placeholder="أدخل العنوان المختصر" />
            </div>
          </FormSection>

          {/* Section: Bank */}
          <FormSection title="الحساب البنكي" icon={<University />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="اسم المستفيد" name="bank_beneficiary" icon={<User />} placeholder="أدخل اسم المستفيد" />
              <InputField label="اسم البنك" name="bank_name" icon={<University />} placeholder="أدخل اسم البنك" />
              <InputField label="رقم الحساب" name="bank_account" icon={<CreditCard />} placeholder="أدخل رقم الحساب" />
              <InputField label="رقم الآيبان" name="bank_iban" icon={<CreditCard />} placeholder="أدخل رقم الآيبان" />
            </div>
          </FormSection>

          {/* Section: License */}
          <FormSection title="ترخيص النقل" icon={<FileCheck />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="رقم الترخيص" name="transport_license_number" icon={<FileCheck />} placeholder="أدخل رقم الترخيص" />
              <InputField label="نوع الترخيص" name="transport_license_type" placeholder="أدخل نوع الترخيص" />
              <FileUploadField label="صورة الترخيص" name="license_image" icon={<Upload />} accept="image/*,application/pdf" />
              
              <div className="grid grid-cols-2 gap-4">
                <InputField label="تاريخ البداية" name="license_start" type="date" icon={<Calendar />} />
                <InputField label="تاريخ الانتهاء" name="license_end" type="date" icon={<Calendar />} />
              </div>
            </div>
          </FormSection>

          {/* Section: User Account */}
          <FormSection title="بيانات مستخدم الحساب" icon={<User />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="البريد الإلكتروني" name="user_email" type="email" icon={<Mail />} required placeholder="أدخل البريد الإلكتروني" />
              <div />
              <InputField label="كلمة المرور" name="password" type="password" icon={<Lock />} required placeholder="أدخل كلمة المرور" />
              <InputField label="تأكيد كلمة المرور" name="confirm_password" type="password" icon={<Lock />} required placeholder="أكد كلمة المرور" />
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
              className="w-full relative overflow-hidden group py-6 rounded-[15px] bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-bold text-2xl shadow-[0_8px_25px_rgba(102,126,234,0.4)] transition-all hover:translate-y-[-5px] disabled:opacity-70 flex items-center justify-center gap-4"
            >
              {isLoading ? (
                <div className="h-7 w-7 animate-spin rounded-full border-4 border-white/30 border-t-white" />
              ) : (
                  <>
                    <SendHorizontal size={28} />
                    إرسال طلب التسجيل
                  </>
              )}
            </button>
            <div className="mt-8 text-center text-[var(--text-color)] text-lg p-5 bg-[var(--glass-bg)] backdrop-blur-[var(--frosted-blur)] rounded-[15px] border border-[var(--glass-border)] border-l-4 border-l-[#3498db]">
              <div className="flex items-center justify-center gap-3">
                <AlertCircle className="text-green-500" />
                سيتم مراجعة الطلب من قبل الإدارة وتفعيل الحساب بعد التأكد من صحة المعلومات والمستندات المقدمة
              </div>
            </div>
            <p className="mt-6 text-center text-[var(--text-color)] font-medium">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-[#3498db] font-bold hover:underline">تسجيل الدخول</Link>
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
      className="bg-[var(--glass-bg)] backdrop-blur-[var(--frosted-blur)] rounded-[25px] p-8 border border-[var(--glass-border)] border-r-4 border-r-[#3498db] shadow-[var(--card-shadow)] relative overflow-hidden group hover:translate-y-[-5px] transition-all"
    >
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-[var(--glass-border)]">
        <div className="h-16 w-16 rounded-full bg-[var(--glass-bg)] backdrop-blur-[var(--frosted-blur)] border border-[var(--glass-border)] text-[var(--text-color)] flex items-center justify-center shadow-[var(--glass-shadow)] group-hover:scale-110 group-hover:rotate-12 transition-all">
          {React.cloneElement(icon as React.ReactElement, { size: 32 })}
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-color)]">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

function InputField({ label, icon, className = "", ...props }: any) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
        {icon && React.cloneElement(icon as React.ReactElement, { size: 20, className: "text-green-500" })}
        {label}
      </label>
      <div className="relative group">
        <input
          {...props}
          className="w-full rounded-[15px] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--frosted-blur)] py-4 px-4 text-[var(--text-color)] placeholder:text-gray-500 outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-green-500/5 shadow-inner"
        />
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-all pointer-events-none">
             {React.cloneElement(icon as React.ReactElement, { size: 20 })}
          </span>
        )}
      </div>
    </div>
  );
}

function FileUploadField({ label, icon, ...props }: any) {
  const [fileName, setFileName] = useState("");

  return (
    <div className="space-y-3">
      <label className="text-lg font-bold text-[var(--text-color)] flex items-center gap-2">
        {icon && React.cloneElement(icon as React.ReactElement, { size: 20, className: "text-green-500" })}
        {label}
      </label>
      <div className="relative">
        <label className="flex flex-col items-center justify-center w-full min-h-[54px] border-2 border-dashed border-[var(--glass-border)] rounded-[15px] bg-[var(--glass-bg)] backdrop-blur-[var(--frosted-blur)] hover:bg-green-500/10 hover:border-green-500 transition-all cursor-pointer group">
          <div className="flex items-center gap-3 py-4">
            {fileName ? (
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <CheckCircle2 size={24} />
                <span className="text-lg max-w-[200px] truncate">{fileName}</span>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-[var(--text-color)] group-hover:text-green-500 transition-colors" />
                <p className="text-lg text-[var(--text-color)]">اختر ملف</p>
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
