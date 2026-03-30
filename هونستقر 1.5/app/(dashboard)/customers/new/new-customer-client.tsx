"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserPlus, Building2, User, Mail, Phone, MapPin, FileText, Receipt,
  Hash, Globe, Building, MapPinned, ArrowRight, Wallet, Calculator,
  Save, Loader2, Power, Route, LayoutDashboard, Users, HelpCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { locationLibrary } from "@/lib/location-data";
import { HierarchicalSearchableSelect } from "@/components/ui/hierarchical-searchable-select";
import { LuxurySearchableSelect } from "@/components/ui/luxury-searchable-select";
import { SuccessModal, LoadingModal, ErrorModal, WarningModal } from "@/components/ui/notification-modals";

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

export function NewCustomerClient({ accounts, costCenters, companyId }: NewCustomerClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; type: 'create' | null; title: string }>({ isOpen: false, type: null, title: '' });
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });
  const [emailWarning, setEmailWarning] = useState(false);
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
    if (formData.country) setRegions(locationLibrary.getRegions(formData.country));
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setEmailWarning(true);
      return;
    }
    if (!formData.company_name || !formData.commercial_number || !formData.vat_number) {
      setErrorModal({ isOpen: true, title: "خطأ في البيانات", message: "يرجى ملء الحقول الإجبارية: اسم المنشأة، السجل التجاري، الرقم الضريبي" });
      return;
    }
    if (!formData.account_id) {
      setErrorModal({ isOpen: true, title: "خطأ في البيانات", message: "يرجى اختيار شجرة الحسابات" });
      return;
    }
    if (!formData.cost_center_id) {
      setErrorModal({ isOpen: true, title: "خطأ في البيانات", message: "يرجى اختيار مركز التكلفة" });
      return;
    }

    setLoading(true);
    setLoadingModal(true);
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
      setLoadingModal(false);
      if (res.ok) {
        setSuccessModal({ isOpen: true, type: 'create', title: formData.company_name || formData.customer_name });
        setTimeout(() => { router.push("/customers"); router.refresh(); }, 2000);
      } else {
        const data = await res.json();
        setErrorModal({ isOpen: true, title: "فشل الحفظ", message: data.error || "فشل حفظ العميل" });
      }
    } catch {
      setLoadingModal(false);
      setErrorModal({ isOpen: true, title: "خطأ", message: "حدث خطأ أثناء الحفظ" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-2 pt-4 pb-6">
      {/* Modals */}
      <WarningModal
        isOpen={emailWarning}
        title="البريد الإلكتروني مطلوب"
        message="إضافة البريد الإلكتروني ضروري حتى تستطيع إرسال الفواتير الضريبية للعميل بشكل فوري من إعدادات إرسال الفاتورة الضريبية الشهرية"
        onClose={() => setEmailWarning(false)}
      />
      <SuccessModal isOpen={successModal.isOpen} type={successModal.type} title={successModal.title} onClose={() => setSuccessModal({ isOpen: false, type: null, title: '' })} />
      <LoadingModal isOpen={loadingModal} title="جاري الحفظ" message="جاري حفظ بيانات العميل..." />
      <ErrorModal isOpen={errorModal.isOpen} title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 rounded-[3rem] shadow-2xl border border-slate-500/30 overflow-hidden"
      >
        {/* Rainbow bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-blue-500 via-indigo-500 via-purple-500 to-emerald-500" />

        <div className="p-5 md:p-8 space-y-5">

          {/* ── Compact Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white/5 backdrop-blur-xl px-6 py-5 rounded-[1.75rem] border border-white/10 shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25 flex-shrink-0">
                <UserPlus size={22} strokeWidth={2.5} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1">
                  <Link href="/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                    <LayoutDashboard size={11} />لوحة التحكم
                  </Link>
                  <ArrowRight size={11} className="text-slate-500 rotate-180" />
                  <Link href="/customers" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                    <Users size={11} />العملاء
                  </Link>
                  <ArrowRight size={11} className="text-slate-500 rotate-180" />
                  <span className="text-emerald-400">إضافة جديد</span>
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">إضافة عميل جديد</h1>
                <p className="text-white/40 text-xs font-semibold mt-0.5">
                  {[formData.city, formData.district && `حي ${formData.district}`, formData.street_name && `شارع ${formData.street_name}`].filter(Boolean).join(' ') || 'تعبئة بيانات المنشأة والعنوان'}
                </p>
              </div>
            </div>
            <Link href="/customers">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-white/70 font-bold text-sm hover:bg-white/10 hover:text-white transition-all border border-white/10"
              >
                <ArrowRight size={16} className="rotate-180" />
                <span>العودة</span>
              </motion.button>
            </Link>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Row 1: Basic Info + Contact (side by side) ── */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

              {/* Basic Info — wider (3/5) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="xl:col-span-3 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-lg overflow-hidden"
              >
                <SectionHeader title="المعلومات الأساسية للمنشأة" icon={<Building2 size={16} />} color="blue" />
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <Field icon={<User size={14} />} label="اسم العميل" name="customer_name" value={formData.customer_name} onChange={handleChange} placeholder="الاسم الرباعي" />
                  <Field icon={<Building2 size={14} />} label="اسم المنشأة *" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="المسمى الرسمي" required />
                  <Field icon={<FileText size={14} />} label="السجل التجاري *" name="commercial_number" value={formData.commercial_number} onChange={handleChange} placeholder="10 أرقام" required />
                  <Field icon={<Receipt size={14} />} label="الرقم الضريبي *" name="vat_number" value={formData.vat_number} onChange={handleChange} placeholder="15 رقم" required />
                  <Field icon={<Hash size={14} />} label="الرقم الموحد" name="unified_number" value={formData.unified_number} onChange={handleChange} placeholder="700xxxxxxx" />
                </div>
              </motion.div>

              {/* Contact Info — narrower (2/5) */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.13 }}
                className="xl:col-span-2 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-lg overflow-hidden"
              >
                <SectionHeader title="بيانات التواصل السريع" icon={<Phone size={16} />} color="emerald" />
                <div className="p-5 space-y-4">
                  <Field icon={<Mail size={14} />} label="البريد الإلكتروني" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="example@domain.com" required tooltip="إضافة البريد الإلكتروني ضروري حتى تستطيع إرسال الفواتير الضريبية للعميل بشكل فوري من إعدادات إرسال الفاتورة الضريبية الشهرية" />
                  <Field icon={<Phone size={14} />} label="رقم الجوال" name="phone" value={formData.phone} onChange={handleChange} placeholder="05xxxxxxxx" />
                </div>
              </motion.div>
            </div>

            {/* ── Row 2: Address ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-lg overflow-hidden"
            >
              <SectionHeader title="تفاصيل العنوان الوطني" icon={<MapPin size={16} />} color="purple" />
              <div className="p-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <LuxurySearchableSelect label="الدولة" icon={<Globe size={14} />} value={formData.country} onChange={(val) => handleSelectChange("country", val as string)} options={locationLibrary.countries.map(c => ({ value: c.code, label: c.nativeName }))} placeholder="الدولة" />
                <LuxurySearchableSelect label="المنطقة" icon={<MapPinned size={14} />} value={formData.region} onChange={(val) => handleSelectChange("region", val as string)} options={regions.map(r => ({ value: r.code, label: r.name }))} placeholder="المنطقة" disabled={!formData.country} />
                <LuxurySearchableSelect label="المدينة" icon={<Building size={14} />} value={formData.city} onChange={(val) => handleSelectChange("city", val as string)} options={cities.map(c => ({ value: c.name, label: c.name }))} placeholder="المدينة" disabled={!formData.region} />
                <LuxurySearchableSelect label="الحي" icon={<MapPinned size={14} />} value={formData.district} onChange={(val) => handleSelectChange("district", val as string)} options={districts.map(d => ({ value: d, label: d }))} placeholder="الحي" disabled={!formData.city} />
                <Field icon={<Route size={14} />} label="اسم الشارع" name="street_name" value={formData.street_name} onChange={handleChange} placeholder="اسم الشارع" />
                <Field icon={<Hash size={14} />} label="الرمز البريدي" name="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="5 أرقام" />
                <Field icon={<MapPin size={14} />} label="العنوان المختصر" name="short_address" value={formData.short_address} onChange={handleChange} placeholder="مثال: RREE1234" />
              </div>
            </motion.div>

            {/* ── Row 3: Financial (2 cols) ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.19 }}
              className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-lg overflow-hidden"
            >
              <SectionHeader title="الإعدادات المالية" icon={<Wallet size={16} />} color="orange" />
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <HierarchicalSearchableSelect label="شجرة الحسابات *" icon={<Wallet size={16} />} value={formData.account_id} onSelect={(val) => handleSelectChange("account_id", val)} items={accounts.map(a => ({ id: a.id, code: a.account_code, name: a.account_name, type: a.account_type as any, parent_id: a.parent_id }))} placeholder="ابحث بالاسم أو رقم الحساب" />
                  {!formData.account_id && <p className="text-red-400 text-[11px] font-bold mt-1.5 mr-1">* إجباري</p>}
                </div>
                <div>
                  <HierarchicalSearchableSelect label="مركز التكلفة *" icon={<Calculator size={16} />} value={formData.cost_center_id} onSelect={(val) => handleSelectChange("cost_center_id", val)} items={costCenters.map(c => ({ id: c.id, code: c.center_code, name: c.center_name, type: c.center_type as any, parent_id: c.parent_id }))} placeholder="ابحث بالاسم أو كود المركز" />
                  {!formData.cost_center_id && <p className="text-red-400 text-[11px] font-bold mt-1.5 mr-1">* إجباري</p>}
                </div>
              </div>
            </motion.div>

            {/* ── Row 4: Status + Actions ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="bg-white/5 backdrop-blur-xl rounded-[1.75rem] border border-white/10 shadow-lg px-6 py-4 flex flex-col sm:flex-row items-center gap-4"
            >
              {/* Status toggle */}
              <div className="flex items-center gap-3 flex-1">
                <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/10">
                  <Power size={16} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">حالة الحساب</p>
                  <p className="text-white/40 text-xs font-medium">تفعيل ظهور العميل في الفواتير</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mr-2">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:start-[3px] after:bg-white after:border-white/20 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                <Link href="/customers">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="px-5 py-2.5 rounded-xl bg-white/5 text-white/70 font-bold text-sm hover:bg-white/10 hover:text-white transition-all border border-white/10"
                  >
                    إلغاء
                  </motion.button>
                </Link>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.04, boxShadow: "0 8px 24px rgba(16,185,129,0.35)" }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2.5 px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
                  <span>{loading ? "جاري الحفظ..." : "إضافة العميل"}</span>
                </motion.button>
              </div>
            </motion.div>

          </form>
        </div>
      </motion.div>
    </div>
  );
}

function SectionHeader({ title, icon, color }: { title: string; icon: React.ReactNode; color: "blue" | "emerald" | "purple" | "orange" }) {
  const gradients = {
    blue: "from-blue-600 to-indigo-600",
    emerald: "from-emerald-600 to-teal-600",
    purple: "from-purple-600 to-violet-600",
    orange: "from-orange-500 to-amber-600",
  };
  return (
    <div className={`bg-gradient-to-r ${gradients[color]} px-5 py-3.5 flex items-center gap-3 text-white relative overflow-hidden`}>
      <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-xl border border-white/20 relative z-10">
        {icon}
      </div>
      <h3 className="text-sm font-black tracking-tight relative z-10">{title}</h3>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
    </div>
  );
}

function Field({ icon, label, name, value, onChange, placeholder, required, type = "text", tooltip }: {
  icon: React.ReactNode; label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; type?: string; tooltip?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-black text-white/70">
        <span className="text-emerald-400">{icon}</span>
        {label}
        {required && <span className="text-red-400">*</span>}
        {tooltip && (
          <span className="relative group inline-flex items-center cursor-help">
            <HelpCircle size={12} className="text-white/30 hover:text-emerald-400 transition-colors" />
            <span className="absolute bottom-full mb-2 right-0 z-50 hidden group-hover:flex w-64 text-[11px] font-semibold text-white/90 bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 shadow-xl leading-relaxed pointer-events-none">
              {tooltip}
            </span>
          </span>
        )}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all text-sm font-bold text-white placeholder:text-white/20 placeholder:font-medium"
      />
    </div>
  );
}
