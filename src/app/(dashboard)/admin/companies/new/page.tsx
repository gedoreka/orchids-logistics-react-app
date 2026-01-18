"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  ArrowRight,
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
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

const regions: Record<string, string[]> = {
  "السعودية": [
    "الرياض", "مكة المكرمة", "المدينة المنورة", "المنطقة الشرقية", "القصيم", "عسير",
    "تبوك", "حائل", "الجوف", "الباحة", "نجران", "جازان", "الحدود الشمالية"
  ],
  "السودان": ["الخرطوم", "بحري", "أم درمان"],
  "مصر": ["القاهرة", "الإسكندرية", "الجيزة"]
};

const districts: Record<string, string[]> = {
  "الرياض": ["الربيع", "الندى", "الصحافة", "النرجس", "العارض", "النفل", "العقيق", "الوادي",
              "الغدير", "الياسمين", "الفلاح", "بنبان", "القيروان", "حطين", "الملقا", "الروضة"],
  "مكة المكرمة": ["التنعيم", "الخالدية", "الرصيفة", "الزاهر", "الزهراء", "السليمانية", "الشامية"],
  "المدينة المنورة": ["العزيزية", "الملك فهد", "الربوة", "سيد الشهداء", "قباء", "العنابس"],
  "المنطقة الشرقية": ["السوق", "الربيع", "النخيل", "الدانة", "النهضة", "البادية", "الجلوية"],
  "القصيم": ["خضراء", "الصباخ", "واسط", "الجنوب", "الخليج", "الضاحي", "السادة"],
  "عسير": ["المروج", "العزيزية", "الهضبة", "الوردتين", "القابل", "الخشع", "السروات"],
  "تبوك": ["سلطانة", "رايس", "طيبة", "الورود", "الهجن", "النهضة", "الندى", "النخيل"],
  "حائل": ["النسية", "برزان", "حدري البلاد", "الوسيطاء", "الوادي", "النقرة"],
  "الجوف": ["السليمانية", "الفاروق", "الربوة", "الناصفة", "الحماد", "الوادي"],
  "الباحة": ["الباهر", "شهبة", "رغدان", "الحازم", "بني سعد", "البارك", "الروضة"],
  "نجران": ["الشرفة الشمالية", "الشرفة الجنوبية", "الشبهان", "الرويكبة"],
  "جازان": ["القلعة", "النور", "الصفا", "الشاطئ", "السويس", "السهيلية", "الروابي"],
  "الحدود الشمالية": ["المساعدية", "المروج", "الصالحية", "الناصرية", "الفيصلية"],
  "الخرطوم": ["كافوري", "الصحافة", "جبرة", "اللاماب", "المنشية"],
  "بحري": ["شمبات", "الدناقلة", "الختمية"],
  "أم درمان": ["الثورة", "أبو سعد", "الصالحة", "الفتيحاب"],
  "القاهرة": ["مدينة نصر", "المعادي", "الزمالك", "شبرا", "مصر الجديدة"],
  "الإسكندرية": ["سيدي جابر", "محرم بك", "العجمي", "سموحة"],
  "الجيزة": ["الدقي", "العجوزة", "الهرم", "فيصل"]
};

const currencies = [
  { code: "SAR", name: "ريال سعودي" },
  { code: "USD", name: "دولار أمريكي" },
  { code: "AED", name: "درهم إماراتي" },
  { code: "EUR", name: "يورو" },
  { code: "EGP", name: "جنيه مصري" },
  { code: "SDG", name: "جنيه سوداني" }
];

interface FormData {
  admin_name: string;
  email: string;
  password: string;
  confirm_password: string;
  name: string;
  commercial_number: string;
  vat_number: string;
  phone: string;
  website: string;
  currency: string;
  country: string;
  region: string;
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
}

export default function NewCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdCompanyName, setCreatedCompanyName] = useState("");
  const [activeSection, setActiveSection] = useState<number | null>(0);
  
  const [formData, setFormData] = useState<FormData>({
    admin_name: "",
    email: "",
    password: "",
    confirm_password: "",
    name: "",
    commercial_number: "",
    vat_number: "",
    phone: "",
    website: "",
    currency: "SAR",
    country: "السعودية",
    region: "",
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
    license_end: ""
  });

  const [files, setFiles] = useState<{
    logo?: File;
    stamp?: File;
    digital_seal?: File;
    license_image?: File;
  }>({});

  const [availableRegions, setAvailableRegions] = useState<string[]>(regions["السعودية"] || []);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === "country") {
      setAvailableRegions(regions[value] || []);
      setAvailableDistricts([]);
      setFormData(prev => ({ ...prev, region: "", district: "" }));
    }

    if (name === "region") {
      setAvailableDistricts(districts[value] || []);
      setFormData(prev => ({ ...prev, district: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: keyof typeof files) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error("الرجاء إدخال اسم المنشأة");
      return;
    }

    if (!formData.admin_name) {
      toast.error("الرجاء إدخال اسم مدير الحساب");
      return;
    }

    if (!formData.email) {
      toast.error("الرجاء إدخال البريد الإلكتروني");
      return;
    }

    if (!formData.password) {
      toast.error("الرجاء إدخال كلمة المرور");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
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

      if (files.logo) submitData.append("logo", files.logo);
      if (files.stamp) submitData.append("stamp", files.stamp);
      if (files.digital_seal) submitData.append("digital_seal", files.digital_seal);
      if (files.license_image) submitData.append("license_image", files.license_image);

      const response = await fetch("/api/admin/companies/create", {
        method: "POST",
        body: submitData
      });

      const result = await response.json();

      if (response.ok) {
        setCreatedCompanyName(formData.name);
        setShowSuccessModal(true);
      } else {
        toast.error(result.error || "حدث خطأ أثناء إنشاء المنشأة");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const FileUploadBox = ({ 
    label, 
    icon: Icon, 
    fileKey,
    accept = "image/*",
    gradient
  }: { 
    label: string; 
    icon: React.ElementType;
    fileKey: keyof typeof files;
    accept?: string;
    gradient: string;
  }) => (
    <motion.div 
      className="relative group"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
        <Icon size={16} className={gradient.includes("indigo") ? "text-indigo-500" : gradient.includes("emerald") ? "text-emerald-500" : "text-purple-500"} />
        {label}
      </label>
      <label className={cn(
        "relative flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden",
        files[fileKey] 
          ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50" 
          : "border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:border-indigo-400 hover:from-indigo-50 hover:to-violet-50"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
          {files[fileKey] ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-emerald-700 font-bold truncate max-w-[150px]">{files[fileKey]?.name}</p>
            </motion.div>
          ) : (
            <>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                "bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-indigo-100 group-hover:to-violet-100"
              )}>
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <p className="text-sm text-slate-500 group-hover:text-indigo-600 transition-colors font-medium">اختر ملف {label}</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG حتى 5MB</p>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept={accept}
          onChange={(e) => handleFileChange(e, fileKey)}
        />
      </label>
    </motion.div>
  );

  const sections = [
    {
      id: 0,
      title: "بيانات حساب مدير المنشأة",
      subtitle: "معلومات تسجيل الدخول للمستخدم المسؤول",
      icon: UserCircle,
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      bgGradient: "from-violet-500/10 via-purple-500/5 to-fuchsia-500/10",
      iconBg: "from-violet-500/20 to-purple-600/20",
      accentColor: "violet"
    },
    {
      id: 1,
      title: "بيانات المنشأة الأساسية",
      subtitle: "معلومات المنشأة الرئيسية",
      icon: Building2,
      gradient: "from-blue-500 via-indigo-500 to-violet-500",
      bgGradient: "from-blue-500/10 via-indigo-500/5 to-violet-500/10",
      iconBg: "from-blue-500/20 to-indigo-600/20",
      accentColor: "indigo"
    },
    {
      id: 2,
      title: "الموقع الجغرافي",
      subtitle: "عنوان المنشأة الرسمي",
      icon: MapPin,
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bgGradient: "from-emerald-500/10 via-teal-500/5 to-cyan-500/10",
      iconBg: "from-emerald-500/20 to-teal-600/20",
      accentColor: "emerald"
    },
    {
      id: 3,
      title: "الحساب البنكي",
      subtitle: "معلومات الحساب المصرفي",
      icon: Landmark,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      bgGradient: "from-amber-500/10 via-orange-500/5 to-red-500/10",
      iconBg: "from-amber-500/20 to-orange-600/20",
      accentColor: "amber"
    },
    {
      id: 4,
      title: "ترخيص النقل",
      subtitle: "معلومات رخصة النشاط",
      icon: FileCheck,
      gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
      bgGradient: "from-rose-500/10 via-pink-500/5 to-fuchsia-500/10",
      iconBg: "from-rose-500/20 to-pink-600/20",
      accentColor: "rose"
    }
  ];

  const InputField = ({ 
    label, 
    name, 
    type = "text", 
    placeholder, 
    icon: Icon, 
    required = false,
    accentColor = "indigo"
  }: {
    label: string;
    name: string;
    type?: string;
    placeholder: string;
    icon: React.ElementType;
    required?: boolean;
    accentColor?: string;
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
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
          <Icon size={16} className={iconColorMap[accentColor]} />
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={formData[name as keyof FormData]}
            onChange={handleInputChange}
            required={required}
            className={cn(
              "w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 transition-all duration-300 text-slate-800 bg-white/80 backdrop-blur-sm",
              "hover:border-slate-300 hover:bg-white",
              colorMap[accentColor],
              "focus:ring-4 focus:outline-none",
              "placeholder:text-slate-400"
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
    placeholder = "اختر..."
  }: {
    label: string;
    name: string;
    options: { value: string; label: string }[];
    icon: React.ElementType;
    accentColor?: string;
    placeholder?: string;
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
        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
          <Icon size={16} className={iconColorMap[accentColor]} />
          {label}
        </label>
        <div className="relative">
          <select
            name={name}
            value={formData[name as keyof FormData]}
            onChange={handleInputChange}
            className={cn(
              "w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 transition-all duration-300 text-slate-800 bg-white/80 backdrop-blur-sm appearance-none cursor-pointer",
              "hover:border-slate-300 hover:bg-white",
              colorMap[accentColor],
              "focus:ring-4 focus:outline-none"
            )}
          >
            <option value="">{placeholder}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative space-y-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTItNC0yLTQtMi00IDItNCAyLTQgMi0yIDQtMiA0LTIgNCAyIDQgMiA0IDQgMiA0IDIgNC0yIDQtMiA0LTIgNC0yIDQgMiA0IDIgMiA0LTIgNC00IDItNCIvPjwvZz48L2c+PC9zdmc+')] opacity-30 rounded-3xl" />
          
          <div className="relative px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link 
                  href="/admin/companies"
                  className="group flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-2.5 rounded-xl font-bold text-sm transition-all text-white border border-white/20"
                >
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  العودة للقائمة
                </Link>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black text-white tracking-tight">إضافة منشأة جديدة</h1>
                      <p className="text-white/80 text-sm">قم بملء البيانات لتسجيل منشأة جديدة مع حساب المدير</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-white font-bold text-sm">تسجيل يدوي بواسطة المدير</span>
                  <p className="text-white/60 text-xs">إنشاء فوري مع تفعيل مباشر</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-5 gap-3 mb-8">
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
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
              )}
            >
              <div className={cn(
                "absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity",
                section.gradient
              )} />
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  activeSection === section.id
                    ? "bg-gradient-to-br " + section.gradient + " shadow-lg"
                    : "bg-slate-100 group-hover:bg-slate-200"
                )}>
                  <section.icon className={cn(
                    "w-5 h-5 transition-colors",
                    activeSection === section.id ? "text-white" : "text-slate-500"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-bold text-sm truncate transition-colors",
                    activeSection === section.id ? "text-slate-800" : "text-slate-700"
                  )}>{section.title}</h3>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {(activeSection === 0 || activeSection === null) && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/3 to-fuchsia-500/5 rounded-3xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-3xl" />
                  
                  <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100 relative">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <UserCircle size={28} className="text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                        <Zap size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">بيانات حساب مدير المنشأة</h2>
                      <p className="text-slate-500 text-sm mt-1">معلومات تسجيل الدخول للمستخدم المسؤول عن إدارة المنشأة</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <InputField label="اسم مدير الحساب" name="admin_name" placeholder="أدخل اسم مدير الحساب" icon={User} required accentColor="violet" />
                    <InputField label="البريد الإلكتروني" name="email" type="email" placeholder="example@company.com" icon={Mail} required accentColor="violet" />
                    <InputField label="كلمة المرور" name="password" type="password" placeholder="أدخل كلمة المرور (6 أحرف على الأقل)" icon={Lock} required accentColor="violet" />
                    <InputField label="تأكيد كلمة المرور" name="confirm_password" type="password" placeholder="أعد إدخال كلمة المرور" icon={Lock} required accentColor="violet" />
                  </div>
                </div>
              </motion.div>
            )}

            {(activeSection === 1 || activeSection === null) && (
              <motion.div
                key="company"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/3 to-violet-500/5 rounded-3xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-3xl" />
                  
                  <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100 relative">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Building2 size={28} className="text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <Star size={12} className="text-white" />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">بيانات المنشأة الأساسية</h2>
                      <p className="text-slate-500 text-sm mt-1">معلومات المنشأة الرئيسية والهوية التجارية</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                    <InputField label="اسم المنشأة" name="name" placeholder="أدخل اسم المنشأة" icon={Building2} required accentColor="indigo" />
                    <InputField label="رقم السجل التجاري" name="commercial_number" placeholder="أدخل رقم السجل التجاري" icon={IdCard} accentColor="indigo" />
                    <InputField label="الرقم الضريبي" name="vat_number" placeholder="أدخل الرقم الضريبي" icon={Receipt} accentColor="indigo" />
                    <InputField label="رقم الهاتف" name="phone" placeholder="أدخل رقم الهاتف" icon={Phone} accentColor="indigo" />
                    <InputField label="الموقع الإلكتروني" name="website" type="url" placeholder="https://example.com" icon={Globe} accentColor="indigo" />
                    <SelectField 
                      label="العملة" 
                      name="currency" 
                      icon={DollarSign} 
                      accentColor="indigo"
                      options={currencies.map(c => ({ value: c.code, label: `${c.name} (${c.code})` }))}
                    />
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                      <ImageIcon size={18} className="text-indigo-500" />
                      ملفات الهوية البصرية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FileUploadBox label="شعار المنشأة" icon={ImageIcon} fileKey="logo" gradient="indigo" />
                      <FileUploadBox label="الختم الرسمي" icon={Stamp} fileKey="stamp" gradient="indigo" />
                      <FileUploadBox label="التوقيع الرقمي" icon={FileText} fileKey="digital_seal" gradient="indigo" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {(activeSection === 2 || activeSection === null) && (
              <motion.div
                key="location"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/3 to-cyan-500/5 rounded-3xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8">
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl" />
                  
                  <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100 relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <MapPin size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">الموقع الجغرافي</h2>
                      <p className="text-slate-500 text-sm mt-1">عنوان المنشأة الرسمي والتفاصيل الجغرافية</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                    <SelectField 
                      label="الدولة" 
                      name="country" 
                      icon={Flag} 
                      accentColor="emerald"
                      placeholder="اختر الدولة"
                      options={[
                        { value: "السعودية", label: "السعودية" },
                        { value: "السودان", label: "السودان" },
                        { value: "مصر", label: "مصر" }
                      ]}
                    />
                    <SelectField 
                      label="المنطقة" 
                      name="region" 
                      icon={Map} 
                      accentColor="emerald"
                      placeholder="اختر المنطقة"
                      options={availableRegions.map(r => ({ value: r, label: r }))}
                    />
                    <SelectField 
                      label="الحي" 
                      name="district" 
                      icon={Home} 
                      accentColor="emerald"
                      placeholder="اختر الحي"
                      options={availableDistricts.map(d => ({ value: d, label: d }))}
                    />
                    <InputField label="الشارع" name="street" placeholder="أدخل اسم الشارع" icon={Navigation} accentColor="emerald" />
                    <InputField label="الرمز البريدي" name="postal_code" placeholder="أدخل الرمز البريدي" icon={Hash} accentColor="emerald" />
                    <InputField label="العنوان المختصر" name="short_address" placeholder="أدخل العنوان المختصر" icon={MapPin} accentColor="emerald" />
                  </div>
                </div>
              </motion.div>
            )}

            {(activeSection === 3 || activeSection === null) && (
              <motion.div
                key="bank"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-orange-500/3 to-red-500/5 rounded-3xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />
                  
                  <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100 relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                      <Landmark size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">الحساب البنكي</h2>
                      <p className="text-slate-500 text-sm mt-1">معلومات الحساب المصرفي للمعاملات المالية</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <InputField label="اسم المستفيد" name="bank_beneficiary" placeholder="أدخل اسم المستفيد" icon={User} accentColor="amber" />
                    <InputField label="اسم البنك" name="bank_name" placeholder="أدخل اسم البنك" icon={Landmark} accentColor="amber" />
                    <InputField label="رقم الحساب" name="bank_account" placeholder="أدخل رقم الحساب" icon={CreditCard} accentColor="amber" />
                    <InputField label="رقم الآيبان" name="bank_iban" placeholder="أدخل رقم الآيبان" icon={Wallet} accentColor="amber" />
                  </div>
                </div>
              </motion.div>
            )}

            {(activeSection === 4 || activeSection === null) && (
              <motion.div
                key="license"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-pink-500/3 to-fuchsia-500/5 rounded-3xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8">
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full blur-3xl" />
                  
                  <div className="flex items-center gap-5 mb-8 pb-6 border-b border-slate-100 relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                      <FileCheck size={28} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">ترخيص النقل</h2>
                      <p className="text-slate-500 text-sm mt-1">معلومات رخصة النشاط والتراخيص الرسمية</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                    <InputField label="رقم الترخيص" name="transport_license_number" placeholder="أدخل رقم الترخيص" icon={IdCard} accentColor="rose" />
                    <InputField label="نوع الترخيص" name="transport_license_type" placeholder="أدخل نوع الترخيص" icon={FileText} accentColor="rose" />
                    <FileUploadBox label="صورة الترخيص" icon={Camera} fileKey="license_image" gradient="rose" />
                    <InputField label="تاريخ البداية" name="license_start" type="date" placeholder="" icon={Calendar} accentColor="rose" />
                    <InputField label="تاريخ الانتهاء" name="license_end" type="date" placeholder="" icon={Calendar} accentColor="rose" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6"
          >
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <p className="text-slate-700 text-sm">
                سيتم إنشاء المنشأة مع حساب مدير بحالة نشطة مباشرة، وسيتمكن المستخدم من تسجيل الدخول فوراً
              </p>
            </div>
            
            <div className="flex gap-3">
              <Link
                href="/admin/companies"
                className="px-8 py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                إلغاء
              </Link>
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ المنشأة والحساب
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </form>

        <AnimatePresence>
          {showSuccessModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                transition={{ type: "spring", bounce: 0.3 }}
                className="relative bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-teal-500/20 to-transparent rounded-full blur-3xl" />
                
                <div className="text-center relative">
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/40"
                  >
                    <CheckCircle size={40} className="text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">تم إنشاء المنشأة بنجاح!</h3>
                  <p className="text-slate-500 mb-8">تم تسجيل منشأة "<span className="font-bold text-slate-700">{createdCompanyName}</span>" مع حساب المدير في النظام</p>

                  <div className="flex gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push("/admin/companies")}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-8 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-indigo-500/30"
                    >
                      <CheckCircle size={18} />
                      عرض القائمة
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowSuccessModal(false);
                        setFormData({
                          admin_name: "",
                          email: "",
                          password: "",
                          confirm_password: "",
                          name: "",
                          commercial_number: "",
                          vat_number: "",
                          phone: "",
                          website: "",
                          currency: "SAR",
                          country: "السعودية",
                          region: "",
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
                          license_end: ""
                        });
                        setFiles({});
                      }}
                      className="bg-slate-100 text-slate-700 py-3 px-8 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                    >
                      <PlusCircle size={18} />
                      إضافة أخرى
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
