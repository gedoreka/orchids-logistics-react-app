"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Key, Building2, Calendar, Crown, Globe, Shield, Users,
  CheckCircle, Copy, Phone, Mail, MapPin, Hash, Clock, Infinity,
  AlertCircle, XCircle, Play, Pause, FileText, Receipt, Car, Truck,
  Package, HandCoins, BarChart3, FileEdit, CreditCard, Landmark,
  Calculator, BookOpen, Scale, PieChart, BadgeDollarSign, Store,
  PlusCircle, Bell, MessageSquare, Coins, FileSpreadsheet, Sparkles,
  RefreshCw, ToggleLeft, ToggleRight
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Company {
  id: number;
  name: string;
  status: string;
  is_active: number;
  commercial_number: string;
  vat_number: string;
  phone: string;
  country: string;
  region: string;
  street: string;
  access_token: string;
  token_expiry: string;
  created_at: string;
}

interface FeatureItem {
  key: string;
  name: string;
  icon: React.ElementType;
  type: 'admin' | 'general';
  category?: string;
}

const features: FeatureItem[] = [
  { key: 'admin_requests', name: 'طلبات تسجيل المنشآت', icon: Building2, type: 'admin' },
  { key: 'admin_create_company', name: 'إضافة منشأة جديدة', icon: PlusCircle, type: 'admin' },
  { key: 'admin_generate_token', name: 'توليد رمز الاشتراك', icon: Key, type: 'admin' },
  { key: 'admin_search_token', name: 'البحث عن رمز الاشتراك', icon: Search, type: 'admin' },
  { key: 'admin_notifications', name: 'إشعارات المدير', icon: Bell, type: 'admin' },
  { key: 'admin_chat', name: 'الدعم الفني', icon: MessageSquare, type: 'admin' },
  { key: 'special_salaries', name: 'مسيرات رواتب خاص', icon: Coins, type: 'admin' },
  
  { key: 'employees_module', name: 'إدارة الموارد البشرية', icon: Users, type: 'general', category: 'الموارد البشرية' },
  { key: 'salary_payrolls_module', name: 'مسيرات الرواتب', icon: BadgeDollarSign, type: 'general', category: 'الموارد البشرية' },
  { key: 'clients_module', name: 'قائمة العملاء', icon: Users, type: 'general', category: 'العملاء والمبيعات' },
  { key: 'receipts_module', name: 'السندات المالية', icon: Receipt, type: 'general', category: 'السندات المالية' },
  { key: 'quotations_module', name: 'عروض الأسعار', icon: FileText, type: 'general', category: 'السندات المالية' },
  { key: 'sales_module', name: 'الفواتير الضريبية', icon: FileText, type: 'general', category: 'السندات المالية' },
  { key: 'income_module', name: 'إضافة دخل جديد', icon: Coins, type: 'general', category: 'السندات المالية' },
  { key: 'credit_notes_module', name: 'إشعارات الدائن الضريبية', icon: CreditCard, type: 'general', category: 'السندات المالية' },
  { key: 'receipt_vouchers_module', name: 'سندات القبض', icon: FileSpreadsheet, type: 'general', category: 'السندات المالية' },
  { key: 'vehicles_list', name: 'إدارة المركبات', icon: Car, type: 'general', category: 'إدارة الأسطول' },
  { key: 'ecommerce_orders_module', name: 'طلبات التجارة الإلكترونية', icon: Store, type: 'general', category: 'التجارة الإلكترونية' },
  { key: 'daily_orders_module', name: 'عرض الطلبات اليومية', icon: Calendar, type: 'general', category: 'التجارة الإلكترونية' },
  { key: 'ecommerce_stores_module', name: 'إدارة المتاجر', icon: Store, type: 'general', category: 'التجارة الإلكترونية' },
  { key: 'personal_shipments_module', name: 'شحنات الأفراد', icon: Truck, type: 'general', category: 'الشحن' },
  { key: 'manage_shipments_module', name: 'إدارة شحنات الأفراد', icon: Package, type: 'general', category: 'الشحن' },
  { key: 'monthly_commissions_module', name: 'العمولة الشهرية', icon: HandCoins, type: 'general', category: 'العمولات' },
  { key: 'commissions_summary_module', name: 'تقرير العمولة الشهرية', icon: FileSpreadsheet, type: 'general', category: 'العمولات' },
  { key: 'expenses_module', name: 'المصروفات الشهرية', icon: BarChart3, type: 'general', category: 'المحاسبة' },
  { key: 'journal_entries_module', name: 'قيود اليومية', icon: FileEdit, type: 'general', category: 'المحاسبة' },
  { key: 'income_report_module', name: 'عرض الدخل والتقارير', icon: PieChart, type: 'general', category: 'المحاسبة' },
  { key: 'expenses_report_module', name: 'تقرير المصروفات', icon: BarChart3, type: 'general', category: 'المحاسبة' },
  { key: 'accounts_module', name: 'مركز الحسابات', icon: BookOpen, type: 'general', category: 'الحسابات' },
  { key: 'cost_centers_module', name: 'مراكز التكلفة', icon: Landmark, type: 'general', category: 'الحسابات' },
  { key: 'ledger_module', name: 'دفتر الأستاذ العام', icon: BookOpen, type: 'general', category: 'الحسابات' },
  { key: 'trial_balance_module', name: 'ميزان المراجعة', icon: Scale, type: 'general', category: 'الحسابات' },
  { key: 'income_statement_module', name: 'قائمة الأرصدة', icon: BarChart3, type: 'general', category: 'الحسابات' },
  { key: 'balance_sheet_module', name: 'الميزانية العمومية', icon: FileText, type: 'general', category: 'الحسابات' },
  { key: 'tax_settings_module', name: 'إعدادات الضريبة', icon: Calculator, type: 'general', category: 'الحسابات' },
  { key: 'letters_templates_module', name: 'الخطابات الجاهزة', icon: Mail, type: 'general', category: 'أخرى' },
];

const categoryColors: Record<string, { bg: string; border: string; icon: string }> = {
  'الموارد البشرية': { bg: 'from-blue-500/10 to-blue-600/5', border: 'border-r-blue-500', icon: 'text-blue-500' },
  'العملاء والمبيعات': { bg: 'from-cyan-500/10 to-cyan-600/5', border: 'border-r-cyan-500', icon: 'text-cyan-500' },
  'السندات المالية': { bg: 'from-indigo-500/10 to-indigo-600/5', border: 'border-r-indigo-500', icon: 'text-indigo-500' },
  'إدارة الأسطول': { bg: 'from-amber-500/10 to-amber-600/5', border: 'border-r-amber-500', icon: 'text-amber-500' },
  'التجارة الإلكترونية': { bg: 'from-pink-500/10 to-pink-600/5', border: 'border-r-pink-500', icon: 'text-pink-500' },
  'الشحن': { bg: 'from-sky-500/10 to-sky-600/5', border: 'border-r-sky-500', icon: 'text-sky-500' },
  'العمولات': { bg: 'from-orange-500/10 to-orange-600/5', border: 'border-r-orange-500', icon: 'text-orange-500' },
  'المحاسبة': { bg: 'from-emerald-500/10 to-emerald-600/5', border: 'border-r-emerald-500', icon: 'text-emerald-500' },
  'الحسابات': { bg: 'from-violet-500/10 to-violet-600/5', border: 'border-r-violet-500', icon: 'text-violet-500' },
  'أخرى': { bg: 'from-slate-500/10 to-slate-600/5', border: 'border-r-slate-500', icon: 'text-slate-500' },
};

export default function SearchTokenPage() {
  const [token, setToken] = useState("");
  const [company, setCompany] = useState<Company | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [togglingFeature, setTogglingFeature] = useState<string | null>(null);

  const adminFeatures = features.filter(f => f.type === 'admin');
  const generalFeatures = features.filter(f => f.type === 'general');
  const categories = Array.from(new Set(generalFeatures.map(f => f.category)));

  const handleSearch = async () => {
    if (!token.trim()) {
      toast.error("الرجاء إدخال رمز الاشتراك");
      return;
    }

    setIsSearching(true);
    setError("");
    setCompany(null);
    setPermissions({});

    try {
      const response = await fetch(`/api/admin/search-token?token=${encodeURIComponent(token.trim())}`);
      const data = await response.json();

      if (response.ok && data.company) {
        setCompany(data.company);
        setPermissions(data.permissions || {});
        toast.success("تم العثور على الشركة!");
      } else {
        setError(data.error || "لم يتم العثور على رمز الاشتراك");
        toast.error("لم يتم العثور على رمز الاشتراك");
      }
    } catch (err) {
      setError("حدث خطأ أثناء البحث");
      toast.error("حدث خطأ أثناء البحث");
    } finally {
      setIsSearching(false);
    }
  };

  const togglePermission = async (featureKey: string) => {
    if (!company) return;
    
    setTogglingFeature(featureKey);
    const newValue = !permissions[featureKey];

    try {
      const response = await fetch("/api/admin/search-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: company.id,
          feature_key: featureKey,
          is_enabled: newValue
        })
      });

      if (response.ok) {
        setPermissions(prev => ({ ...prev, [featureKey]: newValue }));
        toast.success(newValue ? "تم تفعيل الصلاحية" : "تم إلغاء الصلاحية");
      } else {
        toast.error("فشل في تحديث الصلاحية");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء تحديث الصلاحية");
    } finally {
      setTogglingFeature(null);
    }
  };

  const toggleCompanyStatus = async () => {
    if (!company) return;
    
    try {
      const response = await fetch("/api/admin/search-token", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: company.id,
          is_active: company.is_active === 1 ? 0 : 1
        })
      });

      if (response.ok) {
        setCompany(prev => prev ? { ...prev, is_active: prev.is_active === 1 ? 0 : 1 } : null);
        toast.success(company.is_active === 1 ? "تم تجميد الشركة" : "تم تنشيط الشركة");
      } else {
        toast.error("فشل في تحديث حالة الشركة");
      }
    } catch (err) {
      toast.error("حدث خطأ");
    }
  };

  const copyToken = () => {
    if (company?.access_token) {
      navigator.clipboard.writeText(company.access_token);
      toast.success("تم نسخ الرمز!");
    }
  };

  const getSubscriptionStatus = () => {
    if (!company) return { text: "", color: "", icon: AlertCircle };
    
    if (!company.token_expiry) {
      return { text: "نسخة دائمة", color: "text-indigo-600 bg-indigo-100", icon: Infinity };
    }
    
    const remaining = (new Date(company.token_expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    
    if (remaining > 30) {
      return { text: `متبقي ${Math.floor(remaining)} يوم`, color: "text-emerald-600 bg-emerald-100", icon: CheckCircle };
    } else if (remaining > 0) {
      return { text: `متبقي ${Math.floor(remaining)} يوم`, color: "text-amber-600 bg-amber-100", icon: Clock };
    } else {
      return { text: "انتهى الاشتراك", color: "text-red-600 bg-red-100", icon: XCircle };
    }
  };

  const enabledCount = Object.values(permissions).filter(Boolean).length;
  const subscriptionStatus = getSubscriptionStatus();

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Search size={28} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black">البحث عن رمز الاشتراك</h1>
              <p className="text-slate-400 text-sm">البحث عن معلومات الشركة والصلاحيات</p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Key size={20} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">البحث بالرمز</h2>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="أدخل رمز الاشتراك..."
                className="w-full px-5 py-4 pr-12 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-lg"
              />
              <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSearching ? <RefreshCw className="animate-spin" size={20} /> : <Search size={20} />}
              بحث
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results */}
        <AnimatePresence>
          {company && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Company Info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Building2 size={20} className="text-emerald-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">معلومات الشركة</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1", subscriptionStatus.color)}>
                      <subscriptionStatus.icon size={14} />
                      {subscriptionStatus.text}
                    </span>
                    <button
                      onClick={toggleCompanyStatus}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        company.is_active === 1
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      )}
                    >
                      {company.is_active === 1 ? <Pause size={16} /> : <Play size={16} />}
                      {company.is_active === 1 ? "تجميد" : "تنشيط"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard icon={Building2} label="اسم المنشأة" value={company.name} />
                  <InfoCard icon={Hash} label="السجل التجاري" value={company.commercial_number || "غير متوفر"} />
                  <InfoCard icon={FileText} label="الرقم الضريبي" value={company.vat_number || "غير متوفر"} />
                  <InfoCard icon={Phone} label="الهاتف" value={company.phone || "غير متوفر"} />
                  <InfoCard icon={MapPin} label="الدولة" value={company.country || "غير معروفة"} />
                  <InfoCard icon={MapPin} label="المنطقة" value={company.region || "غير معروفة"} />
                  <InfoCard icon={Calendar} label="تاريخ الإنشاء" value={company.created_at ? new Date(company.created_at).toLocaleDateString( 'en-US' ) : "غير معروف"} />
                  <InfoCard icon={Clock} label="انتهاء الاشتراك" value={company.token_expiry || "دائم"} />
                </div>
              </div>

              {/* Token Display */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-center">
                  <p className="text-indigo-200 text-sm mb-2 flex items-center justify-center gap-2">
                    <Key size={16} />
                    رمز الاشتراك
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <code className="text-2xl font-mono font-bold tracking-widest bg-white/20 px-6 py-3 rounded-xl">
                      {company.access_token}
                    </code>
                    <button
                      onClick={copyToken}
                      className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Permissions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <Crown size={20} className="text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">الصلاحيات الإدارية</h2>
                    <span className="text-xs text-slate-500">صلاحيات متقدمة</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {adminFeatures.map((feature) => (
                    <PermissionItem
                      key={feature.key}
                      feature={feature}
                      isEnabled={permissions[feature.key] || false}
                      isToggling={togglingFeature === feature.key}
                      onToggle={() => togglePermission(feature.key)}
                      colorClass="rose"
                    />
                  ))}
                </div>
              </div>

              {/* General Permissions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Globe size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">الصلاحيات العامة</h2>
                      <span className="text-xs text-slate-500">{enabledCount} صلاحية مفعلة</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {categories.filter(Boolean).map((category) => {
                    const categoryFeatures = generalFeatures.filter(f => f.category === category);
                    const colors = categoryColors[category!] || categoryColors['أخرى'];
                    
                    return (
                      <div key={category} className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <div className={cn("w-1.5 h-5 rounded-full", colors.border.replace('border-r-', 'bg-'))} />
                          {category}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categoryFeatures.map((feature) => (
                            <PermissionItem
                              key={feature.key}
                              feature={feature}
                              isEnabled={permissions[feature.key] || false}
                              isToggling={togglingFeature === feature.key}
                              onToggle={() => togglePermission(feature.key)}
                              colorClass="emerald"
                              category={category}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
        <Icon size={14} />
        {label}
      </div>
      <p className="font-bold text-slate-800">{value}</p>
    </div>
  );
}

function PermissionItem({
  feature,
  isEnabled,
  isToggling,
  onToggle,
  colorClass,
  category
}: {
  feature: FeatureItem;
  isEnabled: boolean;
  isToggling: boolean;
  onToggle: () => void;
  colorClass: string;
  category?: string;
}) {
  const colors = category ? categoryColors[category] || categoryColors['أخرى'] : null;
  
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        "cursor-pointer rounded-xl p-4 border-2 transition-all duration-200",
        colors ? `border-r-4 ${colors.border}` : "",
        isEnabled
          ? colorClass === 'rose' ? "bg-rose-50 border-rose-300" : "bg-emerald-50 border-emerald-300"
          : "bg-white border-slate-200 hover:border-slate-300"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
          isEnabled
            ? colorClass === 'rose' ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
            : "bg-slate-100 text-slate-500"
        )}>
          {isToggling ? <RefreshCw className="animate-spin" size={18} /> : <feature.icon size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-800 text-sm truncate">{feature.name}</h3>
          <span className={cn(
            "text-xs flex items-center gap-1",
            feature.type === 'admin' ? "text-rose-500" : colors?.icon || "text-emerald-500"
          )}>
            {feature.type === 'admin' ? <Shield size={10} /> : <Sparkles size={10} />}
            {feature.type === 'admin' ? "إداري" : category}
          </span>
        </div>
        <div className={cn(
          "w-10 h-5 rounded-full transition-all duration-200 relative flex-shrink-0",
          isEnabled ? "bg-emerald-500" : "bg-slate-300"
        )}>
          <div className={cn(
            "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200",
            isEnabled ? "right-0.5" : "left-0.5"
          )} />
        </div>
      </div>
    </motion.div>
  );
}
