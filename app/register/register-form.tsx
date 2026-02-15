"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ArrowRight,
  ArrowLeft,
  Save,
  RefreshCw,
  MapPin,
  Landmark,
  FileText,
  User,
  Upload,
  CheckCircle,
  Image as ImageIcon,
  Stamp,
  Phone,
  Globe,
  DollarSign,
  IdCard,
  Receipt,
  Flag,
  Map,
  Home,
  Navigation,
  Hash,
  CreditCard,
  Wallet,
  Calendar,
  FileCheck,
  Camera,
  Sparkles,
  PlusCircle,
  Mail,
  Lock,
  UserCircle,
  Shield,
  Zap,
  Star,
  ChevronDown,
  Layers,
  Truck,
  ShieldCheck,
  BarChart3,
  Briefcase,
  Languages
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { locationLibrary } from "@/lib/location-data";
import { registerAction } from "@/lib/actions/auth";
import { useLocale, useTranslations } from "@/lib/locale-context";
import BrandLogo from "@/components/brand-logo";

const currencies = [
  { code: "SAR", name: "ريال سعودي", en: "Saudi Riyal" },
  { code: "USD", name: "دولار أمريكي", en: "US Dollar" },
  { code: "AED", name: "درهم إماراتي", en: "UAE Dirham" },
  { code: "EUR", name: "يورو", en: "Euro" },
  { code: "EGP", name: "جنيه مصري", en: "Egyptian Pound" },
  { code: "SDG", name: "جنيه سوداني", en: "Sudanese Pound" }
];

interface Plan {
  id: number;
  name: string;
  price: number;
  duration_value: number;
  duration_unit: string;
  description: string;
}

interface FormDataState {
  name: string;
  user_email: string;
  password: string;
  confirm_password: string;
  commercial_number: string;
  vat_number: string;
  phone: string;
  website: string;
  currency: string;
  country: string;
  country_code: string;
  region: string;
  region_code: string;
  city: string;
  district: string;
  street: string;
  postal_code: string;
  short_address: string;
  bank_beneficiary: string;
  bank_name: string;
  bank_account: string;
  bank_iban: string;
  transport_license_number: string;
  transport_license_type: string;
  license_start: string;
  license_end: string;
  plan_id: string;
}

const InputField = ({ 
  label, 
  name, 
  type = "text", 
  placeholder, 
  icon: Icon, 
  required = false,
  accentColor = "indigo",
  value,
  onChange,
  isRTL
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  icon: React.ElementType;
  required?: boolean;
  accentColor?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRTL: boolean;
}) => {
  const colorMap: Record<string, string> = {
    violet: "focus:border-violet-500 focus:ring-violet-500/20",
    indigo: "focus:border-indigo-500 focus:ring-indigo-500/20",
    emerald: "focus:border-emerald-500 focus:ring-emerald-500/20",
    amber: "focus:border-amber-500 focus:ring-amber-500/20",
    rose: "focus:border-rose-500 focus:ring-rose-500/20"
  };
  const iconColorMap: Record<string, string> = {
    violet: "text-violet-500",
    indigo: "text-indigo-500",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    rose: "text-rose-500"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
        <Icon size={16} className={iconColorMap[accentColor]} />
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={cn(
            "w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 transition-all duration-300 text-slate-800 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm",
            "hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800",
            colorMap[accentColor],
            "focus:ring-4 focus:outline-none",
            "placeholder:text-slate-400 dark:placeholder:text-slate-500"
          )}
          placeholder={placeholder}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
      </div>
    </motion.div>
  );
};

const SelectField = ({
  label,
  name,
  options,
  icon: Icon,
  accentColor = "indigo",
  placeholder = "اختر...",
  value,
  onChange,
  isRTL,
  required = false
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  icon: React.ElementType;
  accentColor?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  isRTL: boolean;
  required?: boolean;
}) => {
  const colorMap: Record<string, string> = {
    violet: "focus:border-violet-500 focus:ring-violet-500/20",
    indigo: "focus:border-indigo-500 focus:ring-indigo-500/20",
    emerald: "focus:border-emerald-500 focus:ring-emerald-500/20",
    amber: "focus:border-amber-500 focus:ring-amber-500/20",
    rose: "focus:border-rose-500 focus:ring-rose-500/20"
  };
  const iconColorMap: Record<string, string> = {
    violet: "text-violet-500",
    indigo: "text-indigo-500",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    rose: "text-rose-500"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
        <Icon size={16} className={iconColorMap[accentColor]} />
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={cn(
            "w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 transition-all duration-300 text-slate-800 dark:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm appearance-none cursor-pointer",
            "hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800",
            colorMap[accentColor],
            "focus:ring-4 focus:outline-none"
          )}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className={cn(
          "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none",
          isRTL ? "left-4" : "right-4"
        )} />
      </div>
    </motion.div>
  );
};

const FileUploadBox = ({ 
  label, 
  icon: Icon, 
  fileKey,
  accept = "image/*",
  gradient,
  hasFile,
  fileName,
  onChange,
  isRTL
}: { 
  label: string; 
  icon: React.ElementType;
  fileKey: string;
  accept?: string;
  gradient: string;
  hasFile: boolean;
  fileName?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRTL: boolean;
}) => (
  <motion.div 
    className="relative group"
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
  >
    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
      <Icon size={16} className={gradient.includes("indigo") ? "text-indigo-500" : gradient.includes("emerald") ? "text-emerald-500" : "text-purple-500"} />
      {label}
    </label>
    <label className={cn(
      "relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden",
      hasFile 
        ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20" 
        : "border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 hover:border-indigo-400 hover:from-indigo-50 hover:to-violet-50 dark:hover:border-indigo-500/50"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
        {hasFile ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-bold truncate max-w-[150px]">{fileName}</p>
          </motion.div>
        ) : (
          <>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
              "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 group-hover:from-indigo-100 group-hover:to-violet-100 dark:group-hover:from-indigo-900/50 dark:group-hover:to-violet-900/50"
            )}>
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-medium">
              {isRTL ? `اختر ملف ${label}` : `Select ${label} file`}
            </p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG حتى 5MB</p>
          </>
        )}
      </div>
      <input 
        type="file" 
        className="hidden" 
        accept={accept}
        onChange={onChange}
      />
    </label>
  </motion.div>
);

export default function RegisterForm() {
  const { locale, setLocale, isRTL } = useLocale();
  const t = useTranslations('register');
  const tCommon = useTranslations('common');
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeSection, setActiveSection] = useState<number | null>(0);
  const [plans, setPlans] = useState<Plan[]>([]);
  
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    user_email: "",
    password: "",
    confirm_password: "",
    commercial_number: "",
    vat_number: "",
    phone: "",
    website: "",
    currency: "",
    country: "",
    country_code: "",
    region: "",
    region_code: "",
    city: "",
    district: "",
    street: "",
    postal_code: "",
    short_address: "",
    bank_beneficiary: "",
    bank_name: "",
    bank_account: "",
    bank_iban: "",
    transport_license_number: "",
    transport_license_type: "",
    license_start: "",
    license_end: "",
    plan_id: ""
  });

  const [files, setFiles] = useState<{
    logo_path?: File;
    stamp_path?: File;
    digital_seal_path?: File;
    license_image?: File;
  }>({});

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/subscriptions/plans");
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "country_code") {
      const country = locationLibrary.countries.find(c => c.code === value);
      setFormData(prev => ({ 
        ...prev, 
        country_code: value, 
        country: country?.name || "",
        region: "", 
        region_code: "",
        city: "",
        district: "" 
      }));
    } else if (name === "region_code") {
      const regions = locationLibrary.getRegions(formData.country_code);
      const region = regions.find(r => r.code === value);
      setFormData(prev => ({ 
        ...prev, 
        region_code: value, 
        region: region?.name || "",
        city: "",
        district: "" 
      }));
    } else if (name === "city") {
      setFormData(prev => ({ ...prev, city: value, district: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Required fields validation
    const requiredFields: { key: keyof FormDataState; labelAr: string; labelEn: string }[] = [
      { key: 'user_email', labelAr: 'البريد الإلكتروني', labelEn: 'Email' },
      { key: 'name', labelAr: 'اسم المنشأة / اسم المستخدم', labelEn: 'Name' },
      { key: 'password', labelAr: 'كلمة المرور', labelEn: 'Password' },
      { key: 'confirm_password', labelAr: 'تأكيد كلمة المرور', labelEn: 'Confirm Password' },
      { key: 'commercial_number', labelAr: 'رقم السجل التجاري', labelEn: 'CR Number' },
      { key: 'vat_number', labelAr: 'الرقم الضريبي', labelEn: 'VAT Number' },
      { key: 'currency', labelAr: 'العملة', labelEn: 'Currency' },
      { key: 'country_code', labelAr: 'الدولة', labelEn: 'Country' },
      { key: 'region_code', labelAr: 'المنطقة', labelEn: 'Region' },
      { key: 'city', labelAr: 'المدينة', labelEn: 'City' },
      { key: 'district', labelAr: 'الحي', labelEn: 'District' },
      { key: 'street', labelAr: 'الشارع', labelEn: 'Street' },
      { key: 'postal_code', labelAr: 'الرمز البريدي', labelEn: 'Postal Code' },
    ];

    for (const field of requiredFields) {
      if (!formData[field.key] || formData[field.key].trim() === '') {
        toast.error(isRTL ? `الرجاء إدخال ${field.labelAr}` : `Please enter ${field.labelEn}`);
        return;
      }
    }

    if (formData.password !== formData.confirm_password) {
      toast.error(isRTL ? "كلمة المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'confirm_password') {
          submitData.append(key, value);
        }
      });

      if (files.logo_path) submitData.append("logo_path", files.logo_path);
      if (files.stamp_path) submitData.append("stamp_path", files.stamp_path);
      if (files.digital_seal_path) submitData.append("digital_seal_path", files.digital_seal_path);
      if (files.license_image) submitData.append("license_image", files.license_image);

      const result = await registerAction(submitData);

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        toast.error(result.error || (isRTL ? "حدث خطأ أثناء عملية التسجيل" : "Registration error"));
      }
    } catch {
      toast.error(isRTL ? "حدث خطأ غير متوقع" : "Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    {
      id: 0,
      title: isRTL ? "بيانات الحساب" : "Account Info",
      subtitle: isRTL ? "معلومات تسجيل الدخول" : "Login details",
      icon: UserCircle,
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      bgGradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      accentColor: "violet"
    },
    {
      id: 1,
      title: isRTL ? "بيانات المنشأة" : "Facility Info",
      subtitle: isRTL ? "المعلومات الأساسية" : "Basic info",
      icon: Building2,
      gradient: "from-blue-500 via-indigo-500 to-violet-500",
      bgGradient: "from-blue-500 via-indigo-500 to-violet-500",
      accentColor: "indigo"
    },
    {
      id: 2,
      title: isRTL ? "الموقع" : "Location",
      subtitle: isRTL ? "العنوان الرسمي" : "Official address",
      icon: MapPin,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgGradient: "from-emerald-500 via-teal-500 to-cyan-500",
      accentColor: "emerald"
    },
    {
      id: 3,
      title: isRTL ? "البنك" : "Bank",
      subtitle: isRTL ? "الحساب المصرفي" : "Bank account",
      icon: Landmark,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      bgGradient: "from-amber-500 via-orange-500 to-red-500",
      accentColor: "amber"
    },
    {
      id: 4,
      title: isRTL ? "التراخيص" : "Licenses",
      subtitle: isRTL ? "رخصة النشاط" : "Activity license",
      icon: FileCheck,
      gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
      bgGradient: "from-rose-500 via-pink-500 to-fuchsia-500",
      accentColor: "rose"
    }
  ];

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Sidebar Info */}
      <div className={cn(
        "hidden lg:flex lg:w-1/3 relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 items-center justify-center p-12 overflow-hidden",
        !isRTL && "order-2"
      )}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-slate-900/80" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
                <BrandLogo size="lg" />

            <div className="space-y-6">
              <h1 className="text-4xl font-black text-white leading-tight">
                {isRTL ? 'انضم إلى منصة إدارة اللوجستيات الذكية' : 'Join the Smart Logistics Platform'}
              </h1>
              <p className="text-slate-300 text-lg font-medium leading-relaxed">
                {isRTL ? 'تحول رقمي كامل لمنشأتك اللوجستية في دقائق.' : 'Complete digital transformation for your logistics facility in minutes.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: ShieldCheck, label: isRTL ? "أمان وموثوقية عالية" : "High Security" },
                { icon: BarChart3, label: isRTL ? "تحليلات وتقارير متقدمة" : "Advanced Analytics" },
                { icon: Globe, label: isRTL ? "دعم محلي ودولي واسع" : "Global Support" },
                { icon: Briefcase, label: isRTL ? "إدارة شاملة للموارد" : "Resource Management" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <item.icon size={18} className="text-blue-400" />
                  </div>
                  <span className="text-sm font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Registration Form */}
      <div className="w-full lg:w-2/3 flex flex-col p-6 sm:p-10 relative bg-white dark:bg-slate-900 overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto w-full relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t('title')}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {isRTL ? 'أكمل بيانات منشأتك للانضمام إلينا' : 'Complete your facility details to join us'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
            >
              <Languages size={18} className="text-blue-600" />
              <span className="text-sm font-bold">{locale === 'ar' ? 'English' : 'العربية'}</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
            {sections.map((section, idx) => (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                className={cn(
                  "relative p-4 rounded-2xl border-2 transition-all duration-300 text-right overflow-hidden group",
                  activeSection === section.id
                    ? "border-transparent bg-gradient-to-br " + section.bgGradient + " shadow-lg"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
                )}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    activeSection === section.id
                      ? "bg-white/20 backdrop-blur-sm"
                      : "bg-slate-100 dark:bg-slate-700"
                  )}>
                    <section.icon className={cn(
                      "w-5 h-5",
                      activeSection === section.id ? "text-white" : iconColorMap[section.accentColor]
                    )} />
                  </div>
                  <h3 className={cn(
                    "font-bold text-xs truncate",
                    activeSection === section.id ? "text-white" : "text-slate-700 dark:text-slate-300"
                  )}>{section.title}</h3>
                </div>
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <AnimatePresence mode="wait">
              {(activeSection === 0 || activeSection === null) && (
                <motion.div key="account" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
                  <SectionHeader icon={UserCircle} title={isRTL ? "بيانات الحساب" : "Account Details"} subtitle={isRTL ? "معلومات تسجيل الدخول للمدير" : "Login info for admin"} color="violet" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label={isRTL ? "البريد الإلكتروني" : "Email Address"} name="user_email" type="email" placeholder="admin@company.com" icon={Mail} required accentColor="violet" value={formData.user_email} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "اسم المستخدم" : "Username"} name="name" placeholder={isRTL ? "أدخل اسمك الكامل" : "Your full name"} icon={User} required accentColor="violet" value={formData.name} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "كلمة المرور" : "Password"} name="password" type="password" placeholder="••••••••" icon={Lock} required accentColor="violet" value={formData.password} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "تأكيد كلمة المرور" : "Confirm Password"} name="confirm_password" type="password" placeholder="••••••••" icon={Lock} required accentColor="violet" value={formData.confirm_password} onChange={handleInputChange} isRTL={isRTL} />
                  </div>
                </motion.div>
              )}

              {(activeSection === 1 || activeSection === null) && (
                <motion.div key="basic" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
                  <SectionHeader icon={Building2} title={isRTL ? "بيانات المنشأة" : "Facility Info"} subtitle={isRTL ? "المعلومات التجارية والضريبية" : "Commercial & tax details"} color="indigo" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InputField label={isRTL ? "اسم المنشأة" : "Company Name"} name="name" placeholder={isRTL ? "اسم المنشأة كما في السجل" : "Facility name"} icon={Building2} required accentColor="indigo" value={formData.name} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "رقم السجل التجاري" : "CR Number"} name="commercial_number" placeholder="1234567890" icon={IdCard} required accentColor="indigo" value={formData.commercial_number} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "الرقم الضريبي" : "VAT Number"} name="vat_number" placeholder="300000000000003" icon={Receipt} required accentColor="indigo" value={formData.vat_number} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "رقم الهاتف" : "Phone"} name="phone" placeholder="+966 5X XXX XXXX" icon={Phone} accentColor="indigo" value={formData.phone} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "الموقع الإلكتروني" : "Website"} name="website" type="url" placeholder="https://example.com" icon={Globe} accentColor="indigo" value={formData.website} onChange={handleInputChange} isRTL={isRTL} />
                    <SelectField label={isRTL ? "العملة" : "Currency"} name="currency" icon={DollarSign} accentColor="indigo" required value={formData.currency} onChange={handleInputChange} options={currencies.map(c => ({ value: c.code, label: isRTL ? `${c.name} (${c.code})` : `${c.en} (${c.code})` }))} isRTL={isRTL} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <FileUploadBox label={isRTL ? "شعار المنشأة" : "Logo"} icon={ImageIcon} fileKey="logo_path" gradient="indigo" hasFile={!!files.logo_path} fileName={files.logo_path?.name} onChange={(e) => handleFileChange(e, "logo_path")} isRTL={isRTL} />
                    <FileUploadBox label={isRTL ? "الختم الرسمي" : "Stamp"} icon={Stamp} fileKey="stamp_path" gradient="indigo" hasFile={!!files.stamp_path} fileName={files.stamp_path?.name} onChange={(e) => handleFileChange(e, "stamp_path")} isRTL={isRTL} />
                    <FileUploadBox label={isRTL ? "التوقيع الرقمي" : "Seal"} icon={FileText} fileKey="digital_seal_path" gradient="indigo" hasFile={!!files.digital_seal_path} fileName={files.digital_seal_path?.name} onChange={(e) => handleFileChange(e, "digital_seal_path")} isRTL={isRTL} />
                  </div>
                </motion.div>
              )}

              {(activeSection === 2 || activeSection === null) && (
                <motion.div key="location" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
                  <SectionHeader icon={MapPin} title={isRTL ? "الموقع الجغرافي" : "Location"} subtitle={isRTL ? "عنوان المنشأة الرسمي" : "Official address"} color="emerald" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SelectField label={isRTL ? "الدولة" : "Country"} name="country_code" icon={Flag} accentColor="emerald" required placeholder={isRTL ? "اختر الدولة" : "Select Country"} value={formData.country_code} onChange={handleInputChange} options={locationLibrary.countries.map(c => ({ value: c.code, label: isRTL ? c.nativeName : c.name }))} isRTL={isRTL} />
                    <SelectField label={isRTL ? "المنطقة" : "Region"} name="region_code" icon={Map} accentColor="emerald" required placeholder={isRTL ? "اختر المنطقة" : "Select Region"} value={formData.region_code} onChange={handleInputChange} options={locationLibrary.getRegions(formData.country_code).map(r => ({ value: r.code, label: isRTL ? r.name : r.name }))} isRTL={isRTL} />
                    <SelectField label={isRTL ? "المدينة" : "City"} name="city" icon={Navigation} accentColor="emerald" required placeholder={isRTL ? "اختر المدينة" : "Select City"} value={formData.city} onChange={handleInputChange} options={locationLibrary.getCities(formData.country_code, formData.region_code).map(c => ({ value: c.name, label: isRTL ? c.name : c.name }))} isRTL={isRTL} />
                    <InputField label={isRTL ? "الحي" : "District"} name="district" placeholder={isRTL ? "اسم الحي" : "District"} icon={Home} required accentColor="emerald" value={formData.district} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "الشارع" : "Street"} name="street" placeholder={isRTL ? "اسم الشارع" : "Street"} icon={Navigation} required accentColor="emerald" value={formData.street} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "الرمز البريدي" : "Postal Code"} name="postal_code" placeholder="12345" icon={Hash} required accentColor="emerald" value={formData.postal_code} onChange={handleInputChange} isRTL={isRTL} />
                    <div className="md:col-span-2 lg:col-span-3">
                      <InputField label={isRTL ? "العنوان الوطني (Short Address)" : "National Address"} name="short_address" placeholder={isRTL ? "مثال: RRRD2929 - الرياض 12345" : "Ex: RRRD2929 - Riyadh 12345"} icon={MapPin} accentColor="emerald" value={formData.short_address} onChange={handleInputChange} isRTL={isRTL} />
                    </div>
                  </div>
                </motion.div>
              )}

              {(activeSection === 3 || activeSection === null) && (
                <motion.div key="bank" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
                  <SectionHeader icon={Landmark} title={isRTL ? "الحساب البنكي" : "Bank Account"} subtitle={isRTL ? "بيانات التحويل المالي" : "Financial details"} color="amber" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label={isRTL ? "اسم المستفيد" : "Beneficiary Name"} name="bank_beneficiary" placeholder={isRTL ? "الاسم كما في البنك" : "Account holder name"} icon={User} accentColor="amber" value={formData.bank_beneficiary} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "اسم البنك" : "Bank Name"} name="bank_name" placeholder={isRTL ? "مثال: بنك الراجحي" : "Example: SNB"} icon={Landmark} accentColor="amber" value={formData.bank_name} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "رقم الحساب" : "Account Number"} name="bank_account" placeholder="XXXXXXXXXXXX" icon={CreditCard} accentColor="amber" value={formData.bank_account} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "الآيبان (IBAN)" : "IBAN"} name="bank_iban" placeholder="SA0000000000000000000000" icon={Wallet} accentColor="amber" value={formData.bank_iban} onChange={handleInputChange} isRTL={isRTL} />
                  </div>
                </motion.div>
              )}

              {(activeSection === 4 || activeSection === null) && (
                <motion.div key="license" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-xl">
                  <SectionHeader icon={FileCheck} title={isRTL ? "ترخيص النقل" : "Transport License"} subtitle={isRTL ? "بيانات رخصة مزاولة النشاط" : "Official license details"} color="rose" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InputField label={isRTL ? "رقم الترخيص" : "License Number"} name="transport_license_number" placeholder="TL-XXXXX" icon={IdCard} accentColor="rose" value={formData.transport_license_number} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "نوع الترخيص" : "License Type"} name="transport_license_type" placeholder={isRTL ? "نقل بضائع" : "Cargo transport"} icon={FileText} accentColor="rose" value={formData.transport_license_type} onChange={handleInputChange} isRTL={isRTL} />
                    <FileUploadBox label={isRTL ? "صورة الترخيص" : "License Image"} icon={Camera} fileKey="license_image" gradient="rose" hasFile={!!files.license_image} fileName={files.license_image?.name} onChange={(e) => handleFileChange(e, "license_image")} isRTL={isRTL} />
                    <InputField label={isRTL ? "تاريخ البداية" : "Start Date"} name="license_start" type="date" placeholder="" icon={Calendar} accentColor="rose" value={formData.license_start} onChange={handleInputChange} isRTL={isRTL} />
                    <InputField label={isRTL ? "تاريخ الانتهاء" : "End Date"} name="license_end" type="date" placeholder="" icon={Calendar} accentColor="rose" value={formData.license_end} onChange={handleInputChange} isRTL={isRTL} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
              <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex-1">
                <ShieldCheck className="text-blue-600" size={24} />
                <p className="text-sm text-blue-800 dark:text-blue-300 font-bold">
                  {isRTL ? 'بياناتك مشفرة ومحمية وفق أعلى المعايير الأمنية' : 'Your data is encrypted and protected with the highest security standards'}
                </p>
              </div>
              
              <div className="flex gap-4">
                <Link href="/login" className="px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Link>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex items-center gap-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                  {isRTL ? 'إرسال طلب التسجيل' : 'Submit Registration'}
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="w-20 h-20 mx-auto bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 text-white shadow-xl shadow-emerald-500/30">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">
                {isRTL ? 'تم استلام طلبك بنجاح!' : 'Request Received!'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                {isRTL 
                  ? 'طلب تسجيل منشأتك قيد المراجعة حالياً. سيصلك بريد إلكتروني فور تفعيل الحساب.'
                  : 'Your registration request is under review. You will receive an email once your account is activated.'}
              </p>
              <button onClick={() => router.push("/login")} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all">
                {isRTL ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle, color }: any) {
  const iconColors: any = {
    violet: "bg-violet-500 shadow-violet-500/30",
    indigo: "bg-indigo-500 shadow-indigo-500/30",
    emerald: "bg-emerald-500 shadow-emerald-500/30",
    amber: "bg-amber-500 shadow-amber-500/30",
    rose: "bg-rose-500 shadow-rose-500/30"
  };
  return (
    <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", iconColors[color])}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

const iconColorMap: Record<string, string> = {
  violet: "text-violet-500",
  indigo: "text-indigo-500",
  emerald: "text-emerald-500",
  amber: "text-amber-500",
  rose: "text-rose-500"
};
