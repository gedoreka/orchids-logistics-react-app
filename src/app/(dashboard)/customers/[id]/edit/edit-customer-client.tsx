"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Edit,
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
  Power,
  Eye,
  CheckCircle,
  AlertCircle,
  Route
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllCountries, getCitiesByCountry, getDistrictsByCity } from "@/lib/countries-data";

interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  commercial_number: string;
  vat_number: string;
  unified_number?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  district?: string;
  street_name?: string;
  postal_code?: string;
  short_address?: string;
  account_id?: number;
  cost_center_id?: number;
  is_active: number;
}

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

interface EditCustomerClientProps {
  customer: Customer;
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

export function EditCustomerClient({ customer, accounts, costCenters, companyId }: EditCustomerClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });
  const [formData, setFormData] = useState({
    customer_name: customer.customer_name || "",
    company_name: customer.company_name || "",
    commercial_number: customer.commercial_number || "",
    vat_number: customer.vat_number || "",
    unified_number: customer.unified_number || "",
    email: customer.email || "",
    phone: customer.phone || "",
    country: customer.country || "",
    city: customer.city || "",
    district: customer.district || "",
    street_name: customer.street_name || "",
    postal_code: customer.postal_code || "",
    short_address: customer.short_address || "",
    account_id: customer.account_id ? String(customer.account_id) : "",
    cost_center_id: customer.cost_center_id ? String(customer.cost_center_id) : "",
    is_active: customer.is_active === 1
  });

  const [countries] = useState(getAllCountries());
  const [cities, setCities] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (formData.country) {
      const newCities = getCitiesByCountry(formData.country);
      setCities(newCities);
      if (!newCities.includes(formData.city)) {
        setDistricts([]);
      }
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.country && formData.city) {
      setDistricts(getDistrictsByCity(formData.country, formData.city));
    }
  }, [formData.country, formData.city]);

  useEffect(() => {
    if (customer.country) {
      setCities(getCitiesByCountry(customer.country));
    }
    if (customer.country && customer.city) {
      setDistricts(getDistrictsByCity(customer.country, customer.city));
    }
  }, []);

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

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
      showNotification("error", "خطأ في البيانات", "يرجى ملء جميع الحقول الإجبارية");
      return;
    }

    setLoading(true);
    showNotification("loading", "جاري الحفظ", "جاري تحديث بيانات العميل...");

    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          company_id: companyId,
          account_id: formData.account_id || null,
          cost_center_id: formData.cost_center_id || null
        })
      });

      if (res.ok) {
        showNotification("success", "تم التحديث بنجاح", "تم تحديث بيانات العميل بنجاح");
        setTimeout(() => {
          router.push(`/customers/${customer.id}`);
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        showNotification("error", "فشل التحديث", data.error || "فشل تحديث العميل");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => notification.type !== "loading" && hideNotification()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className={`bg-white rounded-3xl p-8 shadow-2xl border-t-4 ${
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-red-500" : "border-blue-500"
              }`}>
                <div className="text-center">
                  <div className={`h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    notification.type === "success" ? "bg-emerald-100 text-emerald-500" :
                    notification.type === "error" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
                  }`}>
                    {notification.type === "success" && <CheckCircle size={40} />}
                    {notification.type === "error" && <AlertCircle size={40} />}
                    {notification.type === "loading" && <Loader2 size={40} className="animate-spin" />}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{notification.title}</h3>
                  <p className="text-gray-500 mb-6">{notification.message}</p>
                  {notification.type !== "loading" && (
                    <button
                      onClick={hideNotification}
                      className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      حسناً
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-2xl p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                    <Edit size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">تعديل بيانات العميل</h1>
                    <p className="text-white/60 text-sm">{customer.customer_name || customer.company_name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/customers">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                      <ArrowRight size={16} />
                      <span>القائمة</span>
                    </button>
                  </Link>
                  <Link href={`/customers/${customer.id}`}>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all">
                      <Eye size={16} />
                      <span>عرض</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-blue-500 px-4 py-3 flex items-center gap-2 text-white">
                <Building2 size={18} />
                <h3 className="font-bold text-sm">المعلومات الأساسية</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  icon={<User size={16} />} 
                  label="اسم العميل" 
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="أدخل اسم العميل"
                />
                <FormField 
                  icon={<Building2 size={16} />} 
                  label="اسم المنشأة" 
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="أدخل اسم المنشأة"
                  required
                />
                <FormField 
                  icon={<FileText size={16} />} 
                  label="السجل التجاري" 
                  name="commercial_number"
                  value={formData.commercial_number}
                  onChange={handleChange}
                  placeholder="أدخل رقم السجل التجاري"
                  required
                />
                <FormField 
                  icon={<Receipt size={16} />} 
                  label="الرقم الضريبي" 
                  name="vat_number"
                  value={formData.vat_number}
                  onChange={handleChange}
                  placeholder="أدخل الرقم الضريبي"
                  required
                />
                <FormField 
                  icon={<Hash size={16} />} 
                  label="الرقم الموحد" 
                  name="unified_number"
                  value={formData.unified_number}
                  onChange={handleChange}
                  placeholder="أدخل الرقم الموحد (اختياري)"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-emerald-500 px-4 py-3 flex items-center gap-2 text-white">
                <Phone size={18} />
                <h3 className="font-bold text-sm">معلومات الاتصال</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  icon={<Mail size={16} />} 
                  label="البريد الإلكتروني" 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@domain.com"
                />
                <FormField 
                  icon={<Phone size={16} />} 
                  label="رقم الهاتف" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+966 5X XXX XXXX"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-purple-500 px-4 py-3 flex items-center gap-2 text-white">
                <MapPin size={18} />
                <h3 className="font-bold text-sm">العنوان</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField 
                  icon={<Globe size={16} />} 
                  label="الدولة" 
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  options={countries.map(c => ({ value: c, label: c }))}
                  placeholder="اختر الدولة"
                />
                <SelectField 
                  icon={<Building size={16} />} 
                  label="المدينة" 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  options={cities.map(c => ({ value: c, label: c }))}
                  placeholder="اختر المدينة"
                  disabled={!formData.country}
                />
                <SelectField 
                  icon={<MapPinned size={16} />} 
                  label="الحي" 
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  options={districts.map(d => ({ value: d, label: d }))}
                  placeholder="اختر الحي"
                  disabled={!formData.city}
                />
                <FormField 
                  icon={<Route size={16} />} 
                  label="اسم الشارع" 
                  name="street_name"
                  value={formData.street_name}
                  onChange={handleChange}
                  placeholder="أدخل اسم الشارع"
                />
                <FormField 
                  icon={<Hash size={16} />} 
                  label="الرمز البريدي" 
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="أدخل الرمز البريدي"
                />
                <FormField 
                  icon={<MapPin size={16} />} 
                  label="العنوان المختصر" 
                  name="short_address"
                  value={formData.short_address}
                  onChange={handleChange}
                  placeholder="أدخل العنوان المختصر"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-orange-500 px-4 py-3 flex items-center gap-2 text-white">
                <Wallet size={18} />
                <h3 className="font-bold text-sm">المعلومات المالية</h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField 
                  icon={<Wallet size={16} />} 
                  label="مركز الحساب" 
                  name="account_id"
                  value={formData.account_id}
                  onChange={handleChange}
                  options={accounts.map(a => ({ value: String(a.id), label: `${a.account_code} - ${a.account_name}` }))}
                  placeholder="اختر مركز الحساب"
                />
                <SelectField 
                  icon={<Calculator size={16} />} 
                  label="مركز التكلفة" 
                  name="cost_center_id"
                  value={formData.cost_center_id}
                  onChange={handleChange}
                  options={costCenters.map(c => ({ value: String(c.id), label: `${c.center_code} - ${c.center_name}` }))}
                  placeholder="اختر مركز التكلفة"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-600 px-4 py-3 flex items-center gap-2 text-white">
                <Power size={18} />
                <h3 className="font-bold text-sm">إعدادات الحساب</h3>
              </div>
              <div className="p-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-6 transition-transform"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Power size={16} className="text-gray-500" />
                    <span className="font-bold text-gray-700 text-sm">الحساب نشط</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-2 pb-6">
              <Link href={`/customers/${customer.id}`}>
                <button type="button" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                  <ArrowRight size={16} />
                  <span>إلغاء</span>
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{loading ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
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
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
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
        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all text-sm"
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
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
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
        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all text-sm disabled:bg-gray-50 disabled:text-gray-400"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
