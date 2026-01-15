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
  UserCircle
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
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const FileUploadBox = ({ 
    label, 
    icon: Icon, 
    fileKey,
    accept = "image/*"
  }: { 
    label: string; 
    icon: React.ElementType;
    fileKey: keyof typeof files;
    accept?: string;
  }) => (
    <div className="relative">
      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
        <Icon size={16} className="text-indigo-500" />
        {label}
      </label>
      <label className={cn(
        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300",
        files[fileKey] 
          ? "border-emerald-400 bg-emerald-50" 
          : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50"
      )}>
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {files[fileKey] ? (
            <>
              <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-sm text-emerald-600 font-bold">{files[fileKey]?.name}</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">اختر ملف {label}</p>
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
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/companies"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl font-bold text-sm transition-all text-slate-700"
          >
            <ArrowRight size={18} />
            العودة للقائمة
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800">إضافة منشأة جديدة</h1>
            <p className="text-slate-500">قم بملء البيانات لتسجيل منشأة جديدة مع حساب المدير</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-indigo-50 px-6 py-3 rounded-2xl">
          <PlusCircle className="text-indigo-600" size={24} />
          <span className="text-indigo-700 font-bold">تسجيل يدوي بواسطة المدير</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* بيانات حساب المدير */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 flex items-center justify-center">
              <UserCircle size={24} className="text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">بيانات حساب مدير المنشأة</h2>
              <span className="text-sm text-slate-500">معلومات تسجيل الدخول للمستخدم المسؤول</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <User size={16} className="text-rose-500" />
                اسم مدير الحساب <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="admin_name"
                value={formData.admin_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all text-slate-800"
                placeholder="أدخل اسم مدير الحساب"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-rose-500" />
                البريد الإلكتروني <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all text-slate-800"
                placeholder="example@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Lock size={16} className="text-rose-500" />
                كلمة المرور <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all text-slate-800"
                placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Lock size={16} className="text-rose-500" />
                تأكيد كلمة المرور <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all text-slate-800"
                placeholder="أعد إدخال كلمة المرور"
              />
            </div>
          </div>
        </motion.div>

        {/* بيانات المنشأة الأساسية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 flex items-center justify-center">
              <Building2 size={24} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">بيانات المنشأة الأساسية</h2>
              <span className="text-sm text-slate-500">معلومات المنشأة الرئيسية</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-indigo-500" />
                اسم المنشأة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800"
                placeholder="أدخل اسم المنشأة"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <IdCard size={16} className="text-indigo-500" />
                رقم السجل التجاري
              </label>
              <input
                type="text"
                name="commercial_number"
                value={formData.commercial_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800"
                placeholder="أدخل رقم السجل التجاري"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Receipt size={16} className="text-indigo-500" />
                الرقم الضريبي
              </label>
              <input
                type="text"
                name="vat_number"
                value={formData.vat_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800"
                placeholder="أدخل الرقم الضريبي"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-indigo-500" />
                رقم الهاتف
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800"
                placeholder="أدخل رقم الهاتف"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Globe size={16} className="text-indigo-500" />
                الموقع الإلكتروني
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <DollarSign size={16} className="text-indigo-500" />
                العملة
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            <FileUploadBox label="شعار المنشأة" icon={ImageIcon} fileKey="logo" />
            <FileUploadBox label="الختم الرسمي" icon={Stamp} fileKey="stamp" />
            <FileUploadBox label="التوقيع الرقمي" icon={FileText} fileKey="digital_seal" />
          </div>
        </motion.div>

        {/* الموقع الجغرافي */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
              <MapPin size={24} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">الموقع الجغرافي</h2>
              <span className="text-sm text-slate-500">عنوان المنشأة</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Flag size={16} className="text-emerald-500" />
                الدولة
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800"
              >
                <option value="">اختر الدولة</option>
                <option value="السعودية">السعودية</option>
                <option value="السودان">السودان</option>
                <option value="مصر">مصر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Map size={16} className="text-emerald-500" />
                المنطقة
              </label>
              <select
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800"
              >
                <option value="">اختر المنطقة</option>
                {availableRegions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Home size={16} className="text-emerald-500" />
                الحي
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800"
              >
                <option value="">اختر الحي</option>
                {availableDistricts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Navigation size={16} className="text-emerald-500" />
                الشارع
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800"
                placeholder="أدخل اسم الشارع"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Hash size={16} className="text-emerald-500" />
                الرمز البريدي
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800"
                placeholder="أدخل الرمز البريدي"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-500" />
                العنوان المختصر
              </label>
              <input
                type="text"
                name="short_address"
                value={formData.short_address}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800"
                placeholder="أدخل العنوان المختصر"
              />
            </div>
          </div>
        </motion.div>

        {/* الحساب البنكي */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
              <Landmark size={24} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">الحساب البنكي</h2>
              <span className="text-sm text-slate-500">معلومات الحساب المصرفي</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <User size={16} className="text-amber-500" />
                اسم المستفيد
              </label>
              <input
                type="text"
                name="bank_beneficiary"
                value={formData.bank_beneficiary}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-slate-800"
                placeholder="أدخل اسم المستفيد"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Landmark size={16} className="text-amber-500" />
                اسم البنك
              </label>
              <input
                type="text"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-slate-800"
                placeholder="أدخل اسم البنك"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <CreditCard size={16} className="text-amber-500" />
                رقم الحساب
              </label>
              <input
                type="text"
                name="bank_account"
                value={formData.bank_account}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-slate-800"
                placeholder="أدخل رقم الحساب"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Wallet size={16} className="text-amber-500" />
                رقم الآيبان
              </label>
              <input
                type="text"
                name="bank_iban"
                value={formData.bank_iban}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-slate-800"
                placeholder="أدخل رقم الآيبان"
              />
            </div>
          </div>
        </motion.div>

        {/* ترخيص النقل */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
              <FileCheck size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">ترخيص النقل</h2>
              <span className="text-sm text-slate-500">معلومات رخصة النشاط</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <IdCard size={16} className="text-purple-500" />
                رقم الترخيص
              </label>
              <input
                type="text"
                name="transport_license_number"
                value={formData.transport_license_number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-slate-800"
                placeholder="أدخل رقم الترخيص"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-purple-500" />
                نوع الترخيص
              </label>
              <input
                type="text"
                name="transport_license_type"
                value={formData.transport_license_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-slate-800"
                placeholder="أدخل نوع الترخيص"
              />
            </div>

            <FileUploadBox label="صورة الترخيص" icon={Camera} fileKey="license_image" />

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-purple-500" />
                تاريخ البداية
              </label>
              <input
                type="date"
                name="license_start"
                value={formData.license_start}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-purple-500" />
                تاريخ الانتهاء
              </label>
              <input
                type="date"
                name="license_end"
                value={formData.license_end}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-slate-800"
              />
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end gap-4 pt-4"
        >
          <Link
            href="/admin/companies"
            className="px-8 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
          </button>
        </motion.div>

        {/* Note */}
        <div className="bg-indigo-50 border-r-4 border-indigo-500 rounded-xl p-4">
          <p className="text-slate-700 flex items-center gap-2 text-sm">
            <Sparkles className="text-indigo-500" size={18} />
            سيتم إنشاء المنشأة مع حساب مدير بحالة نشطة مباشرة، وسيتمكن المستخدم من تسجيل الدخول فوراً
          </p>
        </div>
      </form>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.3 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">تم إنشاء المنشأة بنجاح!</h3>
                <p className="text-slate-500 mb-6">تم تسجيل منشأة "{createdCompanyName}" مع حساب المدير في النظام</p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => router.push("/admin/companies")}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 px-6 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    عرض القائمة
                  </button>
                  <button
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
                    className="bg-slate-100 text-slate-700 py-2.5 px-6 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                  >
                    <PlusCircle size={18} />
                    إضافة أخرى
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
