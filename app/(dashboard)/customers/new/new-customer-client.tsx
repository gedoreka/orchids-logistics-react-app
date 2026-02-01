"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight,
  Wallet,
  Calculator,
  Save,
  Loader2,
  CheckCircle,
  Power,
  AlertCircle,
  Route
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { locationLibrary } from "@/lib/location-data";
import { LuxurySearchableSelect } from "@/components/ui/luxury-searchable-select";

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

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function NewCustomerClient({ accounts, costCenters, companyId }: NewCustomerClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });
  const [formData, setFormData] = useState({
    customer_name: "",
    company_name: "",
    commercial_number: "",
    vat_number: "",
    unified_number: "",
    email: "",
    phone: "",
    country: "SA",
    region: "",
    city: "",
    district: "",
    street_name: "",
    postal_code: "",
    short_address: "",
    account_id: "",
    cost_center_id: "",
    is_active: true
  });

  const [regions, setRegions] = useState<{ code: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ name: string }[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (formData.country) {
      setRegions(locationLibrary.getRegions(formData.country));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.country && formData.region) {
      setCities(locationLibrary.getCities(formData.country, formData.region));
      setDistricts([]);
    }
  }, [formData.country, formData.region]);

  useEffect(() => {
    if (formData.country && formData.city) {
      setDistricts(locationLibrary.getDistricts(formData.country, formData.city));
    }
  }, [formData.country, formData.city]);

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === "checkbox" ? checked : value 
    }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === "country") {
        newData.region = "";
        newData.city = "";
        newData.district = "";
      } else if (name === "region") {
        newData.city = "";
        newData.district = "";
      } else if (name === "city") {
        newData.district = "";
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_name || !formData.commercial_number || !formData.vat_number) {
      showNotification("error", "خطأ في البيانات", "يرجى ملء جميع الحقول الإجبارية (اسم المنشأة، السجل التجاري، الرقم الضريبي)");
      return;
    }

    setLoading(true);
    showNotification("loading", "جاري الحفظ", "جاري حفظ بيانات العميل...");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          company_id: companyId,
          account_id: formData.account_id || null,
          cost_center_id: formData.cost_center_id || null,
          country: locationLibrary.countries.find(c => c.code === formData.country)?.nativeName || formData.country
        })
      });

      if (res.ok) {
        showNotification("success", "تم الحفظ بنجاح", "تم إضافة العميل بنجاح");
        setTimeout(() => {
          router.push("/customers");
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        showNotification("error", "فشل الحفظ", data.error || "فشل حفظ العميل");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc]">
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              onClick={() => notification.type !== "loading" && hideNotification()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md p-4"
            >
              <div className={`bg-white rounded-[2rem] p-8 shadow-2xl border-t-8 ${
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-red-500" : "border-blue-500"
              }`}>
                <div className="text-center">
                  <div className={`h-24 w-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    notification.type === "success" ? "bg-emerald-100 text-emerald-500" :
                    notification.type === "error" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
                  }`}>
                    {notification.type === "success" && <CheckCircle size={48} />}
                    {notification.type === "error" && <AlertCircle size={48} />}
                    {notification.type === "loading" && <Loader2 size={48} className="animate-spin" />}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{notification.title}</h3>
                  <p className="text-gray-500 mb-8 leading-relaxed font-medium">{notification.message}</p>
                  {notification.type !== "loading" && (
                    <button
                      onClick={hideNotification}
                      className={`w-full py-4 rounded-2xl font-black text-white text-lg shadow-xl shadow-opacity-20 transition-all active:scale-95 ${
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                      }`}
                    >
                      موافق
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-[1100px] mx-auto space-y-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl border border-white/10">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-24 rounded-3xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20 rotate-3">
                    <UserPlus size={40} className="-rotate-3" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">إضافة عميل جديد</h1>
                    <p className="text-white/60 text-lg font-medium">قم بتعبئة بيانات العميل أو المنشأة بدقة</p>
                  </div>
                </div>
                <Link href="/customers">
                  <button className="flex items-center gap-3 px-6 py-4 rounded-[1.5rem] bg-white/10 text-white font-black text-sm hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md">
                    <ArrowRight size={20} />
                    <span>العودة للقائمة</span>
                  </button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-24 -mb-24 blur-3xl animate-pulse" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <Section title="المعلومات الأساسية" icon={<Building2 size={24} />} color="blue">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  icon={<User size={18} />} 
                  label="اسم العميل" 
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="أدخل الاسم الكامل للعميل"
                />
                <FormField 
                  icon={<Building2 size={18} />} 
                  label="اسم المنشأة" 
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="أدخل المسمى الرسمي للمنشأة"
                  required
                />
                <FormField 
                  icon={<FileText size={18} />} 
                  label="السجل التجاري" 
                  name="commercial_number"
                  value={formData.commercial_number}
                  onChange={handleChange}
                  placeholder="رقم السجل التجاري المكون من 10 أرقام"
                  required
                />
                <FormField 
                  icon={<Receipt size={18} />} 
                  label="الرقم الضريبي" 
                  name="vat_number"
                  value={formData.vat_number}
                  onChange={handleChange}
                  placeholder="الرقم الضريبي المكون من 15 رقم"
                  required
                />
                <FormField 
                  icon={<Hash size={18} />} 
                  label="الرقم الموحد" 
                  name="unified_number"
                  value={formData.unified_number}
                  onChange={handleChange}
                  placeholder="الرقم الموحد للمنشأة (700xxxxxxx)"
                />
              </div>
            </Section>

            {/* Contact Info */}
            <Section title="معلومات الاتصال" icon={<Phone size={24} />} color="emerald">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="05xxxxxxxx"
                />
              </div>
            </Section>

            {/* Address */}
            <Section title="العنوان والمنطقة" icon={<MapPin size={24} />} color="purple">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LuxurySearchableSelect
                  label="الدولة"
                  icon={<Globe size={18} />}
                  value={formData.country}
                  onChange={(val) => handleSelectChange("country", val as string)}
                  options={locationLibrary.countries.map(c => ({ value: c.code, label: c.nativeName }))}
                  placeholder="اختر الدولة"
                />
                <LuxurySearchableSelect
                  label="المنطقة / الولاية"
                  icon={<MapPinned size={18} />}
                  value={formData.region}
                  onChange={(val) => handleSelectChange("region", val as string)}
                  options={regions.map(r => ({ value: r.code, label: r.name }))}
                  placeholder="اختر المنطقة"
                  disabled={!formData.country}
                />
                <LuxurySearchableSelect
                  label="المدينة"
                  icon={<Building size={18} />}
                  value={formData.city}
                  onChange={(val) => handleSelectChange("city", val as string)}
                  options={cities.map(c => ({ value: c.name, label: c.name }))}
                  placeholder="اختر المدينة"
                  disabled={!formData.region}
                />
                <LuxurySearchableSelect
                  label="الحي"
                  icon={<MapPinned size={18} />}
                  value={formData.district}
                  onChange={(val) => handleSelectChange("district", val as string)}
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
                  placeholder="اسم الشارع ورقم المبنى"
                />
                <FormField 
                  icon={<Hash size={18} />} 
                  label="الرمز البريدي" 
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="الرمز البريدي المكون من 5 أرقام"
                />
                <FormField 
                  icon={<MapPin size={18} />} 
                  label="العنوان المختصر" 
                  name="short_address"
                  value={formData.short_address}
                  onChange={handleChange}
                  placeholder="مثال: AB1234"
                />
              </div>
            </Section>

            {/* Financial Info */}
            <Section title="المعلومات المالية" icon={<Wallet size={24} />} color="orange">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LuxurySearchableSelect
                  label="شجرة الحسابات"
                  icon={<Wallet size={18} />}
                  value={formData.account_id}
                  onChange={(val) => handleSelectChange("account_id", val)}
                  options={accounts.map(a => ({ 
                    value: a.id, 
                    label: a.account_name,
                    subLabel: `رقم الحساب: ${a.account_code}`
                  }))}
                  placeholder="اختر الحساب المحاسبي"
                />
                <LuxurySearchableSelect
                  label="مركز التكلفة"
                  icon={<Calculator size={18} />}
                  value={formData.cost_center_id}
                  onChange={(val) => handleSelectChange("cost_center_id", val)}
                  options={costCenters.map(c => ({ 
                    value: c.id, 
                    label: c.center_name,
                    subLabel: `رقم المركز: ${c.center_code}`
                  }))}
                  placeholder="اختر مركز التكلفة"
                />
              </div>
            </Section>

            {/* Account Status */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500">
                    <Power size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">حالة الحساب</h3>
                    <p className="text-gray-500 font-medium">تفعيل أو تعطيل حساب العميل في النظام</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-125">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                </label>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex flex-col md:flex-row justify-center gap-6 pt-4 pb-12">
              <Link href="/customers" className="order-2 md:order-1">
                <button type="button" className="w-full md:w-auto px-10 py-5 rounded-[1.5rem] bg-white text-gray-700 font-black text-lg hover:bg-gray-50 transition-all border-2 border-gray-100 shadow-lg active:scale-95">
                  إلغاء العملية
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto order-1 md:order-2 flex items-center justify-center gap-3 px-12 py-5 rounded-[1.5rem] bg-emerald-500 text-white font-black text-lg hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Save size={24} />
                )}
                <span>{loading ? "جاري الحفظ..." : "حفظ بيانات العميل"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, color, children }: { 
  title: string; 
  icon: React.ReactNode; 
  color: "blue" | "emerald" | "purple" | "orange" | "gray";
  children: React.ReactNode;
}) {
  const colors = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    gray: "bg-gray-600"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden"
    >
      <div className={`${colors[color]} px-8 py-5 flex items-center gap-4 text-white shadow-lg`}>
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
        <h3 className="text-xl font-black">{title}</h3>
      </div>
      <div className="p-8">
        {children}
      </div>
    </motion.div>
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
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-black text-gray-700 mr-1">
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
        className="w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-base font-bold placeholder:text-gray-300 shadow-sm"
      />
    </div>
  );
}
