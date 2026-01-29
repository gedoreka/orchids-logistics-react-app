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
  ArrowLeft,
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
import { useTranslations, useLocale } from "@/lib/locale-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  const t = useTranslations("customers.editPage");
  const { isRTL } = useLocale();
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
      showNotification("error", t("validationError"), t("requiredFieldsError"));
      return;
    }

    setLoading(true);
    showNotification("loading", t("savingTitle"), t("savingMessage"));

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
        showNotification("success", t("saveSuccess"), t("saveSuccessMessage"));
        setTimeout(() => {
          router.push(`/customers/${customer.id}`);
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        showNotification("error", t("saveFailed"), data.error || t("errorMessage"));
      }
    } catch {
      showNotification("error", t("errorTitle"), t("errorMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8" dir={isRTL ? "rtl" : "ltr"}>
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
                      {t("okBtn")}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-[#1a2234]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-8 md:p-12">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-center md:text-right">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl rotate-3">
                  <Edit className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-amber-200 to-white bg-clip-text text-transparent">
                    {t("title")}
                  </h1>
                  <p className="text-white/60 font-medium mt-2 text-lg">
                    {customer.customer_name || customer.company_name}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/customers">
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl font-bold">
                    {isRTL ? <ArrowRight className="ml-2 w-4 h-4" /> : <ArrowLeft className="mr-2 w-4 h-4" />}
                    {t("backToList")}
                  </Button>
                </Link>
                <Link href={`/customers/${customer.id}`}>
                  <Button className="bg-blue-500/80 border-blue-500/30 text-white hover:bg-blue-500 font-bold rounded-xl">
                    <Eye className="w-4 h-4 ml-2" />
                    {t("viewBtn")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-blue-800">{t("basicInfo")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                icon={<User size={18} />} 
                label={t("customerName")} 
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder={t("customerNamePlaceholder")}
              />
              <FormField 
                icon={<Building2 size={18} />} 
                label={t("facilityName")} 
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder={t("facilityNamePlaceholder")}
                required
              />
              <FormField 
                icon={<FileText size={18} />} 
                label={t("commercialNumber")} 
                name="commercial_number"
                value={formData.commercial_number}
                onChange={handleChange}
                placeholder={t("commercialNumberPlaceholder")}
                required
              />
              <FormField 
                icon={<Receipt size={18} />} 
                label={t("vatNumber")} 
                name="vat_number"
                value={formData.vat_number}
                onChange={handleChange}
                placeholder={t("vatNumberPlaceholder")}
                required
              />
              <FormField 
                icon={<Hash size={18} />} 
                label={t("unifiedNumber")} 
                name="unified_number"
                value={formData.unified_number}
                onChange={handleChange}
                placeholder={t("unifiedNumberPlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-xl">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-emerald-800">{t("contactInfo")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField 
                icon={<Mail size={18} />} 
                label={t("email")} 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t("emailPlaceholder")}
              />
              <FormField 
                icon={<Phone size={18} />} 
                label={t("phone")} 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t("phonePlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-xl">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-purple-800">{t("addressInfo")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField 
                icon={<Globe size={18} />} 
                label={t("country")} 
                name="country"
                value={formData.country}
                onChange={handleChange}
                options={countries.map(c => ({ value: c, label: c }))}
                placeholder={t("countryPlaceholder")}
              />
              <SelectField 
                icon={<Building size={18} />} 
                label={t("city")} 
                name="city"
                value={formData.city}
                onChange={handleChange}
                options={cities.map(c => ({ value: c, label: c }))}
                placeholder={t("cityPlaceholder")}
                disabled={!formData.country}
              />
              <SelectField 
                icon={<MapPinned size={18} />} 
                label={t("district")} 
                name="district"
                value={formData.district}
                onChange={handleChange}
                options={districts.map(d => ({ value: d, label: d }))}
                placeholder={t("districtPlaceholder")}
                disabled={!formData.city}
              />
              <FormField 
                icon={<Route size={18} />} 
                label={t("street")} 
                name="street_name"
                value={formData.street_name}
                onChange={handleChange}
                placeholder={t("streetPlaceholder")}
              />
              <FormField 
                icon={<Hash size={18} />} 
                label={t("postalCode")} 
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder={t("postalCodePlaceholder")}
              />
              <FormField 
                icon={<MapPin size={18} />} 
                label={t("shortAddress")} 
                name="short_address"
                value={formData.short_address}
                onChange={handleChange}
                placeholder={t("shortAddressPlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-xl">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-amber-800">{t("financialInfo")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField 
                icon={<Wallet size={18} />} 
                label={t("accountCenter")} 
                name="account_id"
                value={formData.account_id}
                onChange={handleChange}
                options={accounts.map(a => ({ value: String(a.id), label: `${a.account_code} - ${a.account_name}` }))}
                placeholder={t("accountCenterPlaceholder")}
              />
              <SelectField 
                icon={<Calculator size={18} />} 
                label={t("costCenter")} 
                name="cost_center_id"
                value={formData.cost_center_id}
                onChange={handleChange}
                options={costCenters.map(c => ({ value: String(c.id), label: `${c.center_code} - ${c.center_name}` }))}
                placeholder={t("costCenterPlaceholder")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-500 rounded-xl">
                <Power className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-800">{t("accountSettings")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <label className="flex items-center gap-4 cursor-pointer p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
              <div className="relative">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                <div className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow peer-checked:translate-x-7 transition-transform"></div>
              </div>
              <div className="flex items-center gap-3">
                <Power size={20} className="text-slate-500" />
                <span className="font-bold text-slate-700">{t("isActive")}</span>
              </div>
            </label>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8">
          <Link href={`/customers/${customer.id}`}>
            <Button 
              type="button"
              variant="outline"
              className="min-w-[180px] h-14 border-slate-200 bg-white text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all"
            >
              {isRTL ? <ArrowRight className="ml-2 w-5 h-5" /> : <ArrowLeft className="mr-2 w-5 h-5" />}
              {t("cancelBtn")}
            </Button>
          </Link>
          
          <Button 
            type="submit"
            disabled={loading}
            className="min-w-[180px] h-14 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 ml-2" />
            )}
            {loading ? t("saving") : t("saveBtn")}
          </Button>
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
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
        <span className="text-slate-400">{icon}</span>
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
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 font-medium bg-slate-50/50"
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
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
        <span className="text-slate-400">{icon}</span>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 font-medium bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
