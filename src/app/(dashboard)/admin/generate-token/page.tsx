"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Building2,
  Calendar,
  Crown,
  Globe,
  Shield,
  Users,
  CheckCircle,
  Save,
  RefreshCw,
  CheckCheck,
  Copy,
  Sparkles,
  FileText,
  Receipt,
  Car,
  Truck,
  Package,
  HandCoins,
  BarChart3,
  FileEdit,
  CreditCard,
  Landmark,
  Calculator,
  BookOpen,
  Scale,
  PieChart,
  Mail,
  BadgeDollarSign,
  Store,
  Search,
  PlusCircle,
  Bell,
  MessageSquare,
  Coins,
  FileSpreadsheet,
  Clock,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Company {
  id: number;
  name: string;
  status: string;
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

export default function GenerateTokenPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [days, setDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<string | null>(null);

  const adminFeatures = features.filter(f => f.type === 'admin');
  const generalFeatures = features.filter(f => f.type === 'general');
  const categories = Array.from(new Set(generalFeatures.map(f => f.category)));

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies");
      const data = await response.json();
      if (data.companies) {
        setCompanies(data.companies.filter((c: Company) => c.status === 'active'));
      }
    } catch (error) {
      toast.error("فشل في تحميل الشركات");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const toggleFeature = (key: string) => {
    const newSet = new Set(selectedFeatures);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedFeatures(newSet);
  };

  const toggleAllAdmin = () => {
    const allAdminKeys = adminFeatures.map(f => f.key);
    const allSelected = allAdminKeys.every(k => selectedFeatures.has(k));
    const newSet = new Set(selectedFeatures);
    
    if (allSelected) {
      allAdminKeys.forEach(k => newSet.delete(k));
    } else {
      allAdminKeys.forEach(k => newSet.add(k));
    }
    setSelectedFeatures(newSet);
  };

  const toggleAllGeneral = () => {
    const allGeneralKeys = generalFeatures.map(f => f.key);
    const allSelected = allGeneralKeys.every(k => selectedFeatures.has(k));
    const newSet = new Set(selectedFeatures);
    
    if (allSelected) {
      allGeneralKeys.forEach(k => newSet.delete(k));
    } else {
      allGeneralKeys.forEach(k => newSet.add(k));
    }
    setSelectedFeatures(newSet);
  };

  const handleSubmit = async () => {
    if (!selectedCompany) {
      toast.error("الرجاء اختيار الشركة");
      return;
    }

    if (selectedFeatures.size === 0) {
      toast.error("الرجاء اختيار صلاحية واحدة على الأقل");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: selectedCompany,
          days: days,
          features: Array.from(selectedFeatures)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedToken(data.token);
        setTokenExpiry(data.expiry);
        toast.success("تم توليد رمز الاشتراك بنجاح!");
      } else {
        toast.error(data.error || "حدث خطأ أثناء توليد الرمز");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      toast.success("تم نسخ الرمز!");
    }
  };

  return (
    <div className="p-6 md:p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Key size={28} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black">توليد رمز الاشتراك</h1>
              <p className="text-slate-400 text-sm">إنشاء رمز تفعيل جديد مع الصلاحيات المحددة</p>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
              <Building2 size={16} className="text-indigo-400" />
              <span className="text-sm">{companies.length} شركة نشطة</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
              <Shield size={16} className="text-emerald-400" />
              <span className="text-sm">{features.length} صلاحية متاحة</span>
            </div>
          </div>
        </div>

        {/* Token Result */}
        <AnimatePresence>
          {generatedToken && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl"
            >
              <div className="text-center">
                <CheckCircle size={40} className="mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-4">تم توليد الرمز بنجاح!</h3>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 mb-4">
                  <p className="text-xs text-white/70 mb-2">رمز التفعيل</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-mono font-bold tracking-widest">{generatedToken}</code>
                    <button onClick={copyToken} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all">
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-white/80">
                  <Clock size={16} />
                  <span>صالح حتى: {tokenExpiry}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Company & Duration Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Building2 size={20} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">معلومات الاشتراك</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Building2 size={14} className="text-indigo-500" />
                اختر الشركة
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                disabled={loadingCompanies}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 bg-white"
              >
                <option value="">-- اختر الشركة --</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name} (ID: {company.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Calendar size={14} className="text-indigo-500" />
                مدة التفعيل (أيام)
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                min={0}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800"
                placeholder="30"
              />
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Hash size={12} />
                أدخل 0 للتفعيل الدائم
              </p>
            </div>
          </div>
        </div>

        {/* Admin Permissions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <Crown size={20} className="text-rose-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">الصلاحيات الإدارية</h2>
                <span className="text-xs text-slate-500">صلاحيات متقدمة</span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleAllAdmin}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              <CheckCheck size={14} />
              تحديد الكل
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {adminFeatures.map((feature) => (
              <motion.div
                key={feature.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleFeature(feature.key)}
                className={cn(
                  "cursor-pointer rounded-xl p-4 border-2 transition-all duration-200",
                  selectedFeatures.has(feature.key)
                    ? "bg-rose-50 border-rose-300"
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                    selectedFeatures.has(feature.key)
                      ? "bg-rose-500 text-white"
                      : "bg-slate-100 text-slate-500"
                  )}>
                    <feature.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{feature.name}</h3>
                    <span className="text-xs text-rose-500 flex items-center gap-1">
                      <Shield size={10} />
                      إداري
                    </span>
                  </div>
                  <div className={cn(
                    "w-10 h-5 rounded-full transition-all duration-200 relative flex-shrink-0",
                    selectedFeatures.has(feature.key) ? "bg-emerald-500" : "bg-slate-300"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200",
                      selectedFeatures.has(feature.key) ? "right-0.5" : "left-0.5"
                    )} />
                  </div>
                </div>
              </motion.div>
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
                <span className="text-xs text-slate-500">صلاحيات أساسية</span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleAllGeneral}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              <CheckCheck size={14} />
              تحديد الكل
            </button>
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
                    <span className="text-xs font-normal text-slate-400">({categoryFeatures.length})</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryFeatures.map((feature) => (
                      <motion.div
                        key={feature.key}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleFeature(feature.key)}
                        className={cn(
                          "cursor-pointer rounded-xl p-4 border-2 border-r-4 transition-all duration-200",
                          colors.border,
                          selectedFeatures.has(feature.key)
                            ? `bg-gradient-to-br ${colors.bg} border-emerald-300`
                            : "bg-white border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                            selectedFeatures.has(feature.key)
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-500"
                          )}>
                            <feature.icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-800 text-sm truncate">{feature.name}</h3>
                            <span className={cn("text-xs flex items-center gap-1", colors.icon)}>
                              <Sparkles size={10} />
                              {category}
                            </span>
                          </div>
                          <div className={cn(
                            "w-10 h-5 rounded-full transition-all duration-200 relative flex-shrink-0",
                            selectedFeatures.has(feature.key) ? "bg-emerald-500" : "bg-slate-300"
                          )}>
                            <div className={cn(
                              "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200",
                              selectedFeatures.has(feature.key) ? "right-0.5" : "left-0.5"
                            )} />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary & Submit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 px-4 py-2 rounded-xl">
                <span className="text-sm text-indigo-600 font-bold">{selectedFeatures.size} صلاحية محددة</span>
              </div>
              {selectedCompany && (
                <div className="bg-emerald-100 px-4 py-2 rounded-xl">
                  <span className="text-sm text-emerald-600 font-bold">
                    {companies.find(c => c.id.toString() === selectedCompany)?.name}
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !selectedCompany || selectedFeatures.size === 0}
              className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  جاري التوليد...
                </>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  توليد الرمز
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
