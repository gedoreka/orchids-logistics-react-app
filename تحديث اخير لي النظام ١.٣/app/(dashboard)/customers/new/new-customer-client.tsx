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
import { HierarchicalSearchableSelect } from "@/components/ui/hierarchical-searchable-select";
import { LuxurySearchableSelect } from "@/components/ui/luxury-searchable-select";

interface Account {
  id: number;
  account_code: string;
  account_name: string;
  account_type?: string;
  parent_id?: number | null;
}

interface CostCenter {
  id: number;
  center_code: string;
  center_name: string;
  center_type?: 'main' | 'sub';
  parent_id?: number | null;
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
    account_id: "" as string | number,
    cost_center_id: "" as string | number,
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
      setFormData(prev => ({ ...prev, city: "", district: "" }));
    }
  }, [formData.country, formData.region]);

  useEffect(() => {
    if (formData.country && formData.city) {
      setDistricts(locationLibrary.getDistricts(formData.country, formData.city));
      setFormData(prev => ({ ...prev, district: "" }));
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
    setFormData(prev => ({ ...prev, [name]: value }));
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

  // Format account options for hierarchical view
  const accountOptions = accounts.map(a => {
    const isMain = a.account_type === 'main';
    return {
      value: a.id,
      label: isMain ? `📂 ${a.account_name}` : `└─ ${a.account_name}`,
      subLabel: `${a.account_code}`
    };
  });

  const costCenterOptions = costCenters.map(c => ({
    value: c.id,
    label: `📍 ${c.center_name}`,
    subLabel: `${c.center_code}`
  }));

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1525] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] -ml-96 -mb-96 pointer-events-none" />
      
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0d1525]/80 backdrop-blur-xl z-[10000]"
              onClick={() => notification.type !== "loading" && hideNotification()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10001] w-full max-w-md p-4"
            >
              <div className={`bg-white rounded-[2.5rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] border-t-[12px] ${
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-red-500" : "border-blue-500"
              }`}>
                <div className="text-center">
                  <div className={`h-28 w-28 rounded-full mx-auto mb-8 flex items-center justify-center ${
                    notification.type === "success" ? "bg-emerald-50 text-emerald-500" :
                    notification.type === "error" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                  }`}>
                    {notification.type === "success" && <CheckCircle size={56} strokeWidth={2.5} />}
                    {notification.type === "error" && <AlertCircle size={56} strokeWidth={2.5} />}
                    {notification.type === "loading" && <Loader2 size={56} className="animate-spin" strokeWidth={2.5} />}
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3">{notification.title}</h3>
                  <p className="text-slate-500 mb-10 text-lg leading-relaxed font-bold">{notification.message}</p>
                  {notification.type !== "loading" && (
                    <button
                      onClick={hideNotification}
                      className={`w-full py-5 rounded-2xl font-black text-white text-xl shadow-2xl transition-all active:scale-95 ${
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" : "bg-red-500 hover:bg-red-600 shadow-red-500/30"
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

      <div className="relative z-10 flex-1 p-4 md:p-10">
        <div className="max-w-[1200px] mx-auto space-y-10">
          {/* Header Card */}
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 md:p-14 text-white shadow-2xl border border-white/10">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
                <div className="flex items-center gap-8">
                  <div className="h-24 w-28 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3 border border-white/20">
                    <UserPlus size={48} strokeWidth={2.5} className="-rotate-3" />
                  </div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">إضافة عميل جديد</h1>
                    <div className="flex items-center gap-3">
                      <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-black border border-emerald-500/20">
                        إصدار 2026
                      </span>
                      <p className="text-slate-400 text-xl font-bold">نظام إدارة العملاء الذكي</p>
                    </div>
                  </div>
                </div>
                <Link href="/customers">
                  <button className="group flex items-center gap-4 px-8 py-5 rounded-2xl bg-white/5 text-white font-black text-lg hover:bg-white/10 transition-all border border-white/10 backdrop-blur-xl">
                    <ArrowRight size={24} className="group-hover:-translate-x-1 transition-transform" />
                    <span>العودة للقائمة</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Info */}
            <Section title="المعلومات الأساسية للمنشأة" icon={<Building2 size={28} />} color="blue">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FormField 
                  icon={<User size={20} />} 
                  label="اسم العميل الكامل" 
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="أدخل الاسم الرباعي"
                />
                <FormField 
                  icon={<Building2 size={20} />} 
                  label="اسم المنشأة" 
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="المسمى الرسمي في السجل"
                  required
                />
                <FormField 
                  icon={<FileText size={20} />} 
                  label="رقم السجل التجاري" 
                  name="commercial_number"
                  value={formData.commercial_number}
                  onChange={handleChange}
                  placeholder="رقم السجل (10 أرقام)"
                  required
                />
                <FormField 
                  icon={<Receipt size={20} />} 
                  label="الرقم الضريبي" 
                  name="vat_number"
                  value={formData.vat_number}
                  onChange={handleChange}
                  placeholder="الرقم الضريبي (15 رقم)"
                  required
                />
                <FormField 
                  icon={<Hash size={20} />} 
                  label="الرقم الموحد" 
                  name="unified_number"
                  value={formData.unified_number}
                  onChange={handleChange}
                  placeholder="700xxxxxxx"
                />
              </div>
            </Section>

            {/* Contact Info */}
            <Section title="بيانات التواصل السريع" icon={<Phone size={28} />} color="emerald">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField 
                  icon={<Mail size={20} />} 
                  label="البريد الإلكتروني" 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@zoolspeed.com"
                />
                <FormField 
                  icon={<Phone size={20} />} 
                  label="رقم الجوال" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="05xxxxxxxx"
                />
              </div>
            </Section>

            {/* Address */}
            <Section title="تفاصيل العنوان الوطني الشامل" icon={<MapPin size={28} />} color="purple">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <LuxurySearchableSelect
                  label="الدولة"
                  icon={<Globe size={20} />}
                  value={formData.country}
                  onChange={(val) => handleSelectChange("country", val as string)}
                  options={locationLibrary.countries.map(c => ({ value: c.code, label: c.nativeName }))}
                  placeholder="اختر الدولة"
                />
                <LuxurySearchableSelect
                  label="المنطقة / الولاية"
                  icon={<MapPinned size={20} />}
                  value={formData.region}
                  onChange={(val) => handleSelectChange("region", val as string)}
                  options={regions.map(r => ({ value: r.code, label: r.name }))}
                  placeholder="اختر المنطقة"
                  disabled={!formData.country}
                />
                <LuxurySearchableSelect
                  label="المدينة"
                  icon={<Building size={20} />}
                  value={formData.city}
                  onChange={(val) => handleSelectChange("city", val as string)}
                  options={cities.map(c => ({ value: c.name, label: c.name }))}
                  placeholder="اختر المدينة"
                  disabled={!formData.region}
                />
                <LuxurySearchableSelect
                  label="الحي"
                  icon={<MapPinned size={20} />}
                  value={formData.district}
                  onChange={(val) => handleSelectChange("district", val as string)}
                  options={districts.map(d => ({ value: d, label: d }))}
                  placeholder="اختر الحي"
                  disabled={!formData.city}
                />
                <FormField 
                  icon={<Route size={20} />} 
                  label="اسم الشارع والمبنى" 
                  name="street_name"
                  value={formData.street_name}
                  onChange={handleChange}
                  placeholder="الشارع، رقم المبنى"
                />
                <FormField 
                  icon={<Hash size={20} />} 
                  label="الرمز البريدي" 
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="5 أرقام"
                />
              </div>
            </Section>

              {/* Financial Info */}
              <Section title="الإعدادات المالية (شجرة الحسابات)" icon={<Wallet size={28} />} color="orange">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <HierarchicalSearchableSelect
                    label="شجرة الحسابات"
                    icon={<Wallet size={20} />}
                    value={formData.account_id}
                    onSelect={(val) => handleSelectChange("account_id", val)}
                    items={accounts.map(a => ({
                      id: a.id,
                      code: a.account_code,
                      name: a.account_name,
                      type: a.account_type as any,
                      parent_id: a.parent_id
                    }))}
                    placeholder="ابحث بالاسم أو رقم الحساب"
                  />
                  <HierarchicalSearchableSelect
                    label="مركز التكلفة"
                    icon={<Calculator size={20} />}
                    value={formData.cost_center_id}
                    onSelect={(val) => handleSelectChange("cost_center_id", val)}
                    items={costCenters.map(c => ({
                      id: c.id,
                      code: c.center_code,
                      name: c.center_name,
                      type: c.center_type as any,
                      parent_id: c.parent_id
                    }))}
                    placeholder="ابحث بالاسم أو كود المركز"
                  />
                </div>
              </Section>

            {/* Status & Submit */}
            <div className="flex flex-col lg:flex-row gap-10 items-stretch pb-20">
              <div className="flex-1 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl p-10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-[1.25rem] bg-white/5 flex items-center justify-center text-slate-400 border border-white/10">
                    <Power size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">حالة الحساب</h3>
                    <p className="text-slate-400 font-bold text-lg">تفعيل ظهور العميل في الفواتير</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-[1.5]">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-white/20 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 lg:min-w-[500px]">
                <Link href="/customers" className="flex-1">
                  <button type="button" className="w-full h-full px-10 py-6 rounded-[2rem] bg-white/5 text-white font-black text-xl hover:bg-white/10 transition-all border border-white/10 shadow-2xl active:scale-95">
                    إلغاء
                  </button>
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] flex items-center justify-center gap-4 px-12 py-6 rounded-[2rem] bg-emerald-500 text-white font-black text-2xl hover:bg-emerald-600 transition-all shadow-[0_20px_50px_rgba(16,185,129,0.4)] active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={32} className="animate-spin" />
                  ) : (
                    <Save size={32} strokeWidth={2.5} />
                  )}
                  <span>{loading ? "جاري الحفظ..." : "إضافة العميل"}</span>
                </button>
              </div>
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
    blue: "from-blue-600 to-blue-400 shadow-blue-500/20",
    emerald: "from-emerald-600 to-emerald-400 shadow-emerald-500/20",
    purple: "from-purple-600 to-purple-400 shadow-purple-500/20",
    orange: "from-orange-600 to-orange-400 shadow-orange-500/20",
    gray: "from-slate-600 to-slate-400 shadow-slate-500/20"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${colors[color]} px-10 py-7 flex items-center gap-6 text-white shadow-xl relative overflow-hidden border-b border-white/10`}>
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/20 relative z-10">
          {icon}
        </div>
        <h3 className="text-2xl font-black tracking-tight relative z-10">{title}</h3>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
      </div>
      <div className="p-10 md:p-12">
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
    <div className="space-y-3">
      <label className="flex items-center gap-2.5 text-[14px] font-black text-white mr-1.5">
        <span className="text-emerald-400">{icon}</span>
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
        className="w-full px-6 py-4.5 rounded-[1.25rem] border-2 border-white/10 bg-white/5 focus:bg-white/10 focus:border-emerald-500 focus:ring-[6px] focus:ring-emerald-500/5 outline-none transition-all text-[16px] font-black text-white placeholder:text-white/20 placeholder:font-bold shadow-sm"
      />
    </div>
  );
}
