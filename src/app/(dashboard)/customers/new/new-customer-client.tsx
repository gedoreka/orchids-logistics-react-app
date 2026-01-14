"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  UserPlus,
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Receipt,
  Hash,
  Globe,
  Building,
  MapPinned,
  Route,
  ArrowRight,
  Wallet,
  Calculator,
  Save,
  Loader2,
  CheckCircle,
  Power
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Account {
  id: number;
  account_code: string;
  account_name: string;
}

interface CostCenter {
  id: number;
  center_code: string;
  center_name: string;
}

interface NewCustomerClientProps {
  accounts: Account[];
  costCenters: CostCenter[];
  companyId: number;
}

const countriesData: Record<string, Record<string, string[]>> = {
  "السعودية": {
    "الرياض": ["الملز", "العليا", "النسيم", "الروضة", "الربوة", "المروج", "الشفا", "العارض", "الندوة", "الفيصلية", "المربع", "الربيع"],
    "جدة": ["الشرفية", "النسيم", "الروضة", "الحمراء", "الثغر", "الزهراء", "السلامة", "البغدادية", "الفيصلية", "الخالدية", "الرحاب", "النهضة"],
    "مكة المكرمة": ["العزيزية", "النسيم", "الشوقية", "الزاهر", "الهجرة", "الشرائع", "الجموم", "العوالي", "الخنساء", "الرصيفة"],
    "المدينة المنورة": ["العنبرية", "السيح", "العالية", "المناخة", "قربان", "الخالدية", "العهد", "الزهراء", "النهضة", "السلام"],
    "الدمام": ["الفيصليه", "الروضة", "النهضة", "المنار", "الخبر", "الظهران", "القطيف", "الجبيل", "الدانة", "المرجان"],
    "الطائف": ["الشوقية", "الخالدية", "القروة", "المنصور", "الردف", "الشفا", "الهنداوية", "الروضة", "النزهة"]
  },
  "مصر": {
    "القاهرة": ["مدينة نصر", "مصر الجديدة", "المعادي", "الزمالك", "الدقي", "المهندسين", "المنيل", "العباسية", "الزيتون", "شبرا"],
    "الإسكندرية": ["المنتزه", "اللبان", "العصافرة", "سيدي جابر", "السيوف", "المنشية", "الجمرك", "المعمورة", "العجمي"],
    "الجيزة": ["الدقي", "المهندسين", "العجوزة", "الهرم", "الكيت كات", "الوراق", "أبو رواش", "البدرشين"]
  },
  "الإمارات العربية المتحدة": {
    "دبي": ["ديرة", "البرشاء", "القصيص", "الخبيصي", "الراشدية", "المرر", "الطوار", "النهدة", "الخوانيج", "الورقاء"],
    "أبو ظبي": ["الخالدية", "المرفأ", "البطين", "النهضة", "المصفح", "الشهامة", "البدع", "الرئاسة", "الكاسر"],
    "الشارقة": ["النهدة", "القاسمية", "الموالح", "اليرموك", "السبخة", "الرقة", "المنطقة الصناعية", "الرملة"]
  },
  "الأردن": {
    "عمان": ["الشمايسة", "الجبيهة", "الصويفية", "الشميساني", "الرابية", "اليرموك", "الوزارة", "الطفيحية", "المرج"],
    "الزرقاء": ["الزرقاء الجديدة", "الرصيفة", "الهاشمية", "الظليل", "الأحياء الشرقية", "الأحياء الغربية"],
    "إربد": ["إربد", "الرمثا", "الحصن", "الكورة", "بني كنانة", "الطيبة", "الشونة الشمالية"]
  }
};

export function NewCustomerClient({ accounts, costCenters, companyId }: NewCustomerClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: "",
    company_name: "",
    commercial_number: "",
    vat_number: "",
    unified_number: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    district: "",
    street_name: "",
    postal_code: "",
    short_address: "",
    account_id: "",
    cost_center_id: "",
    is_active: true
  });

  const countries = Object.keys(countriesData);
  const cities = formData.country ? Object.keys(countriesData[formData.country] || {}) : [];
  const districts = formData.country && formData.city ? countriesData[formData.country]?.[formData.city] || [] : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === "country") {
      setFormData(prev => ({ ...prev, country: value, city: "", district: "" }));
    } else if (name === "city") {
      setFormData(prev => ({ ...prev, city: value, district: "" }));
    } else if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name || !formData.commercial_number || !formData.vat_number) {
      alert("يرجى ملء جميع الحقول الإجبارية");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          company_id: companyId,
          account_id: formData.account_id || null,
          cost_center_id: formData.cost_center_id || null
        })
      });

      if (res.ok) {
        router.push("/customers");
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "فشل حفظ العميل");
      }
    } catch (error) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1200px] mx-auto px-4">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-[2rem] p-8 text-white shadow-2xl">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <UserPlus size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">إضافة عميل جديد</h1>
              <p className="text-white/60 text-sm mt-2">تسجيل بيانات عميل أو منشأة جديدة في النظام</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Link href="/customers">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                <ArrowRight size={18} />
                <span>العودة للقائمة</span>
              </button>
            </Link>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-4 flex items-center gap-2 text-white">
            <Building2 size={20} />
            <h3 className="font-black">المعلومات الأساسية</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              icon={<User size={18} />} 
              label="اسم العميل" 
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              placeholder="أدخل اسم العميل"
            />
            <FormField 
              icon={<Building2 size={18} />} 
              label="اسم المنشأة" 
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="أدخل اسم المنشأة"
              required
            />
            <FormField 
              icon={<FileText size={18} />} 
              label="السجل التجاري" 
              name="commercial_number"
              value={formData.commercial_number}
              onChange={handleChange}
              placeholder="أدخل رقم السجل التجاري"
              required
            />
            <FormField 
              icon={<Receipt size={18} />} 
              label="الرقم الضريبي" 
              name="vat_number"
              value={formData.vat_number}
              onChange={handleChange}
              placeholder="أدخل الرقم الضريبي"
              required
            />
            <FormField 
              icon={<Hash size={18} />} 
              label="الرقم الموحد" 
              name="unified_number"
              value={formData.unified_number}
              onChange={handleChange}
              placeholder="أدخل الرقم الموحد (اختياري)"
            />
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-4 flex items-center gap-2 text-white">
            <Phone size={20} />
            <h3 className="font-black">معلومات الاتصال</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              icon={<Mail size={18} />} 
              label="البريد الإلكتروني" 
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@domain.com"
            />
            <FormField 
              icon={<Phone size={18} />} 
              label="رقم الهاتف" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+966 5X XXX XXXX"
            />
          </div>
        </motion.div>

        {/* Address Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-6 py-4 flex items-center gap-2 text-white">
            <MapPin size={20} />
            <h3 className="font-black">العنوان</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <SelectField 
              icon={<Globe size={18} />} 
              label="الدولة" 
              name="country"
              value={formData.country}
              onChange={handleChange}
              options={countries.map(c => ({ value: c, label: c }))}
              placeholder="اختر الدولة"
            />
            <SelectField 
              icon={<Building size={18} />} 
              label="المدينة" 
              name="city"
              value={formData.city}
              onChange={handleChange}
              options={cities.map(c => ({ value: c, label: c }))}
              placeholder="اختر المدينة"
              disabled={!formData.country}
            />
            <SelectField 
              icon={<MapPinned size={18} />} 
              label="الحي" 
              name="district"
              value={formData.district}
              onChange={handleChange}
              options={districts.map(d => ({ value: d, label: d }))}
              placeholder="اختر الحي"
              disabled={!formData.city}
            />
            <FormField 
              icon={<Route size={18} />} 
              label="اسم الشارع" 
              name="street_name"
              value={formData.street_name}
              onChange={handleChange}
              placeholder="أدخل اسم الشارع"
            />
            <FormField 
              icon={<Hash size={18} />} 
              label="الرمز البريدي" 
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              placeholder="أدخل الرمز البريدي"
            />
            <FormField 
              icon={<MapPin size={18} />} 
              label="العنوان المختصر" 
              name="short_address"
              value={formData.short_address}
              onChange={handleChange}
              placeholder="أدخل العنوان المختصر"
            />
          </div>
        </motion.div>

        {/* Financial Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-4 flex items-center gap-2 text-white">
            <Wallet size={20} />
            <h3 className="font-black">المعلومات المالية</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField 
              icon={<Wallet size={18} />} 
              label="مركز الحساب" 
              name="account_id"
              value={formData.account_id}
              onChange={handleChange}
              options={accounts.map(a => ({ value: String(a.id), label: `${a.account_code} - ${a.account_name}` }))}
              placeholder="اختر مركز الحساب"
            />
            <SelectField 
              icon={<Calculator size={18} />} 
              label="مركز التكلفة" 
              name="cost_center_id"
              value={formData.cost_center_id}
              onChange={handleChange}
              options={costCenters.map(c => ({ value: String(c.id), label: `${c.center_code} - ${c.center_name}` }))}
              placeholder="اختر مركز التكلفة"
            />
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-br from-gray-600 to-gray-700 px-6 py-4 flex items-center gap-2 text-white">
            <Power size={20} />
            <h3 className="font-black">إعدادات الحساب</h3>
          </div>
          <div className="p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                <div className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow peer-checked:translate-x-6 transition-transform"></div>
              </div>
              <div className="flex items-center gap-2">
                <Power size={18} className="text-gray-500" />
                <span className="font-bold text-gray-700">الحساب نشط</span>
              </div>
            </label>
          </div>
        </motion.div>

        {/* Submit Buttons */}
        <div className="flex justify-center gap-4 pt-4">
          <Link href="/customers">
            <button type="button" className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
              <ArrowRight size={18} />
              <span>إلغاء</span>
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{loading ? "جاري الحفظ..." : "حفظ العميل"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ icon, label, name, value, onChange, placeholder, required, type = "text" }: {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
        <span className="text-gray-400">{icon}</span>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
      />
    </div>
  );
}

function SelectField({ icon, label, name, value, onChange, options, placeholder, disabled, required }: {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
        <span className="text-gray-400">{icon}</span>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium disabled:bg-gray-50 disabled:text-gray-400"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
