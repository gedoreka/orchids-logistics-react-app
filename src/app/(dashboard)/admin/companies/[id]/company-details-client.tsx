"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  ArrowRight,
  CheckCircle, 
  XCircle, 
  PlayCircle,
  PauseCircle,
  Calendar,
  IdCard,
  Percent,
  Phone,
  Mail,
  Globe,
  DollarSign,
  ImageIcon,
  Stamp,
  Flag,
  MapPin,
  Home,
  Navigation,
  Hash,
  Building,
  Landmark,
  CreditCard,
  Wallet,
  FileText,
  Truck,
  CalendarPlus,
  CalendarMinus,
  Save,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Company } from "@/lib/types";
import { updateCompany } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface CompanyDetailsClientProps {
  company: Company;
}

export function CompanyDetailsClient({ company }: CompanyDetailsClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name || "",
    commercial_number: company.commercial_number || "",
    vat_number: company.vat_number || "",
    phone: company.phone || "",
    email: company.email || "",
    website: company.website || "",
    currency: company.currency || "",
    country: company.country || "",
    region: company.region || "",
    district: company.district || "",
    street: company.street || "",
    postal_code: company.postal_code || "",
    short_address: company.short_address || "",
    bank_beneficiary: company.bank_beneficiary || "",
    bank_name: company.bank_name || "",
    bank_account: company.bank_account || "",
    bank_iban: company.bank_iban || "",
    transport_license_number: company.transport_license_number || "",
    transport_license_type: company.transport_license_type || "",
    license_start: company.license_start || "",
    license_end: company.license_end || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await updateCompany(company.id, formData);
      if (result.success) {
        toast.success("تم حفظ التعديلات بنجاح");
        router.refresh();
      } else {
        toast.error(result.error || "حدث خطأ");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const sections = [
    {
      title: "البيانات الأساسية",
      icon: Building2,
      color: "blue",
      fields: [
        { name: "name", label: "اسم المنشأة", icon: Building2, required: true },
        { name: "commercial_number", label: "رقم السجل التجاري", icon: IdCard, required: true },
        { name: "vat_number", label: "الرقم الضريبي", icon: Percent, required: true },
        { name: "phone", label: "رقم الجوال", icon: Phone, required: true },
        { name: "email", label: "البريد الإلكتروني", icon: Mail, type: "email" },
        { name: "website", label: "الموقع الإلكتروني", icon: Globe, type: "url" },
        { name: "currency", label: "العملة", icon: DollarSign },
      ]
    },
    {
      title: "الموقع والعنوان",
      icon: MapPin,
      color: "emerald",
      fields: [
        { name: "country", label: "الدولة", icon: Flag },
        { name: "region", label: "المنطقة", icon: MapPin },
        { name: "district", label: "الحي", icon: Home },
        { name: "street", label: "الشارع", icon: Navigation },
        { name: "postal_code", label: "الرمز البريدي", icon: Hash },
        { name: "short_address", label: "العنوان المختصر", icon: Building },
      ]
    },
    {
      title: "الحساب البنكي",
      icon: Landmark,
      color: "amber",
      fields: [
        { name: "bank_beneficiary", label: "اسم المستفيد", icon: IdCard },
        { name: "bank_name", label: "اسم البنك", icon: Landmark },
        { name: "bank_account", label: "رقم الحساب", icon: Wallet },
        { name: "bank_iban", label: "رقم الآيبان", icon: CreditCard },
      ]
    },
    {
      title: "بيانات ترخيص النقل",
      icon: Truck,
      color: "purple",
      fields: [
        { name: "transport_license_number", label: "رقم الترخيص", icon: FileText },
        { name: "transport_license_type", label: "نوع الترخيص", icon: Truck },
        { name: "license_start", label: "تاريخ بداية الترخيص", icon: CalendarPlus, type: "date" },
        { name: "license_end", label: "تاريخ نهاية الترخيص", icon: CalendarMinus, type: "date" },
      ]
    }
  ];

  const colorClasses: Record<string, { badge: string; border: string; bg: string }> = {
    blue: { badge: "bg-blue-50 text-blue-600 border-blue-100", border: "border-r-blue-500", bg: "from-blue-500/10 to-blue-600/5" },
    emerald: { badge: "bg-emerald-50 text-emerald-600 border-emerald-100", border: "border-r-emerald-500", bg: "from-emerald-500/10 to-emerald-600/5" },
    amber: { badge: "bg-amber-50 text-amber-600 border-amber-100", border: "border-r-amber-500", bg: "from-amber-500/10 to-amber-600/5" },
    purple: { badge: "bg-purple-50 text-purple-600 border-purple-100", border: "border-r-purple-500", bg: "from-purple-500/10 to-purple-600/5" },
  };

  return (
    <div className="space-y-10 pb-20 max-w-[1400px] mx-auto">
      {/* Premium Header */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 via-blue-500 to-slate-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl overflow-hidden border border-white/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 via-red-500 via-yellow-500 via-purple-500 to-blue-500 bg-[length:200%_100%] animate-gradient-x"></div>
          
          <Link 
            href="/admin/companies"
            className="absolute left-8 top-8 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full font-bold text-sm transition-all"
          >
            <ArrowRight size={18} />
            العودة للقائمة
          </Link>

          <div className="relative z-10 space-y-8 text-center pt-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest"
            >
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
              تفاصيل المنشأة
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              {company.name || "منشأة بدون اسم"}
            </h1>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <div className="bg-blue-500/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-blue-500/20 flex items-center gap-3">
                <Hash size={18} className="text-blue-400" />
                <span className="text-blue-100 font-bold">رقم المنشأة: {company.id}</span>
              </div>
              
              <div className={cn(
                "backdrop-blur-md px-6 py-3 rounded-2xl border flex items-center gap-3",
                company.status === 'approved' ? "bg-emerald-500/10 border-emerald-500/20" :
                company.status === 'rejected' ? "bg-rose-500/10 border-rose-500/20" :
                "bg-amber-500/10 border-amber-500/20"
              )}>
                {company.status === 'approved' ? <CheckCircle size={18} className="text-emerald-400" /> :
                 company.status === 'rejected' ? <XCircle size={18} className="text-rose-400" /> :
                 <RefreshCw size={18} className="text-amber-400 animate-spin" />}
                <span className={cn(
                  "font-bold",
                  company.status === 'approved' ? "text-emerald-100" :
                  company.status === 'rejected' ? "text-rose-100" : "text-amber-100"
                )}>
                  {company.status === 'approved' ? 'مقبولة' : company.status === 'rejected' ? 'مرفوضة' : 'قيد المراجعة'}
                </span>
              </div>

              <div className={cn(
                "backdrop-blur-md px-6 py-3 rounded-2xl border flex items-center gap-3",
                company.is_active ? "bg-teal-500/10 border-teal-500/20" : "bg-slate-500/10 border-slate-500/20"
              )}>
                {company.is_active ? <PlayCircle size={18} className="text-teal-400" /> : <PauseCircle size={18} className="text-slate-400" />}
                <span className={company.is_active ? "text-teal-100 font-bold" : "text-slate-300 font-bold"}>
                  {company.is_active ? 'نشطة' : 'موقوفة'}
                </span>
              </div>

              <div className="bg-purple-500/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-purple-500/20 flex items-center gap-3">
                <Calendar size={18} className="text-purple-400" />
                <span className="text-purple-100 font-bold">
                  {new Date(company.created_at).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500"
          >
            <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-100">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                `bg-gradient-to-br ${colorClasses[section.color].bg}`
              )}>
                <section.icon size={28} className={cn(
                  section.color === 'blue' && "text-blue-600",
                  section.color === 'emerald' && "text-emerald-600",
                  section.color === 'amber' && "text-amber-600",
                  section.color === 'purple' && "text-purple-600",
                )} />
              </div>
              <h2 className="text-2xl font-black text-slate-800">{section.title}</h2>
              <span className={cn(
                "px-4 py-2 rounded-full text-xs font-bold border",
                colorClasses[section.color].badge
              )}>
                {section.fields.length} حقول
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.fields.map((field, fieldIndex) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIndex * 0.1 + fieldIndex * 0.03 }}
                  className={cn(
                    "bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 border-2 border-slate-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-r-4",
                    colorClasses[section.color].border
                  )}
                >
                  <label className="flex items-center gap-2 text-slate-600 font-bold text-sm mb-3">
                    <field.icon size={16} className={cn(
                      section.color === 'blue' && "text-blue-500",
                      section.color === 'emerald' && "text-emerald-500",
                      section.color === 'amber' && "text-amber-500",
                      section.color === 'purple' && "text-purple-500",
                    )} />
                    {field.label}
                    {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleChange}
                    required={field.required}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 font-bold text-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Logo Preview Section */}
        {(company.logo || company.logo_path) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-8 md:p-10 shadow-xl"
          >
            <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/10 to-teal-600/5 flex items-center justify-center">
                <ImageIcon size={28} className="text-teal-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-800">الشعار والختم</h2>
            </div>

            <div className="flex flex-wrap gap-8 justify-center">
              {(company.logo || company.logo_path) && (
                <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl p-8 border-2 border-dashed border-blue-200">
                  <img
                    src={company.logo || company.logo_path}
                    alt="شعار الشركة"
                    className="max-h-32 max-w-full rounded-xl shadow-lg border-4 border-white mx-auto hover:scale-105 transition-transform"
                  />
                  <span className="block mt-4 text-blue-600 font-bold text-sm">الشعار الحالي</span>
                </div>
              )}
              {(company.stamp || company.stamp_path) && (
                <div className="text-center bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-3xl p-8 border-2 border-dashed border-purple-200">
                  <img
                    src={company.stamp || company.stamp_path}
                    alt="ختم الشركة"
                    className="max-h-32 max-w-full rounded-xl shadow-lg border-4 border-white mx-auto hover:scale-105 transition-transform"
                  />
                  <span className="block mt-4 text-purple-600 font-bold text-sm">الختم الرسمي</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-8"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="relative group flex items-center gap-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-16 py-5 rounded-full font-black text-xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
            <span className="relative flex items-center gap-3">
              {isLoading ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  حفظ التعديلات
                </>
              )}
            </span>
          </button>
        </motion.div>
      </form>

      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
