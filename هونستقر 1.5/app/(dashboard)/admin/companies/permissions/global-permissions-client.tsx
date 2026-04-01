"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Lock,
  Crown,
  Globe,
  Shield,
  Users,
  CheckCircle,
  Settings,
  Save,
  RefreshCw,
  CheckCheck,
  X,
  Sparkles,
  FileText,
  Receipt,
  Car,
  Truck,
  Package,
  Calendar,
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
  Key,
  Search,
  PlusCircle,
  Bell,
  MessageSquare,
  Coins,
  FileSpreadsheet,
  MapPin,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FeatureItem {
  key: string;
  name: string;
  icon: React.ElementType;
  type: "admin" | "general";
  category?: string;
}

const features: FeatureItem[] = [
  { key: "admin_requests", name: "طلبات تسجيل المنشآت", icon: Building2, type: "admin" },
  { key: "admin_create_company", name: "إضافة منشأة جديدة", icon: PlusCircle, type: "admin" },
  { key: "admin_generate_token", name: "توليد رمز الاشتراك", icon: Key, type: "admin" },
  { key: "admin_search_token", name: "البحث عن رمز الاشتراك", icon: Search, type: "admin" },
  { key: "admin_notifications", name: "إشعارات المدير", icon: Bell, type: "admin" },
  { key: "admin_chat", name: "الدعم الفني", icon: MessageSquare, type: "admin" },
  { key: "special_salaries", name: "مسيرات رواتب خاص", icon: Coins, type: "admin" },
  { key: "admin_subscriptions", name: "خطط الاشتراكات", icon: Package, type: "admin" },
  { key: "admin_system_settings", name: "إعدادات النظام", icon: Settings, type: "admin" },

  { key: "employees_module", name: "إدارة الموارد البشرية", icon: Users, type: "general", category: "الموارد البشرية" },
  { key: "driver_tracking_module", name: "متابعة السائقين", icon: MapPin, type: "general", category: "الموارد البشرية" },
  { key: "salary_payrolls_module", name: "مسيرات الرواتب", icon: BadgeDollarSign, type: "general", category: "الموارد البشرية" },
  { key: "anb_payroll_settings", name: "إعدادات بنك ANB", icon: Landmark, type: "general", category: "الموارد البشرية" },
  { key: "anb_payroll_batches", name: "دفعات رواتب ANB", icon: FileSpreadsheet, type: "general", category: "الموارد البشرية" },

  { key: "clients_module", name: "قائمة العملاء", icon: Users, type: "general", category: "العملاء والمبيعات" },

  { key: "receipts_module", name: "السندات المالية", icon: Receipt, type: "general", category: "السندات المالية" },
  { key: "quotations_module", name: "عروض الأسعار", icon: FileText, type: "general", category: "السندات المالية" },
  { key: "sales_module", name: "الفواتير الضريبية", icon: FileText, type: "general", category: "السندات المالية" },
  { key: "income_module", name: "إضافة دخل جديد", icon: Coins, type: "general", category: "السندات المالية" },
  { key: "credit_notes_module", name: "إشعارات الدائن الضريبية", icon: CreditCard, type: "general", category: "السندات المالية" },
  { key: "receipt_vouchers_module", name: "سندات القبض", icon: FileSpreadsheet, type: "general", category: "السندات المالية" },

  { key: "vehicles_list", name: "إدارة المركبات", icon: Car, type: "general", category: "إدارة الأسطول" },

  { key: "ecommerce_orders_module", name: "طلبات التجارة الإلكترونية", icon: Store, type: "general", category: "التجارة الإلكترونية" },
  { key: "daily_orders_module", name: "عرض الطلبات اليومية", icon: Calendar, type: "general", category: "التجارة الإلكترونية" },
  { key: "ecommerce_stores_module", name: "إدارة المتاجر", icon: Store, type: "general", category: "التجارة الإلكترونية" },

  { key: "personal_shipments_module", name: "شحنات الأفراد", icon: Truck, type: "general", category: "الشحن" },
  { key: "manage_shipments_module", name: "إدارة شحنات الأفراد", icon: Package, type: "general", category: "الشحن" },

  { key: "monthly_commissions_module", name: "العمولة الشهرية", icon: HandCoins, type: "general", category: "العمولات" },
  { key: "commissions_summary_module", name: "تقرير العمولة الشهرية", icon: FileSpreadsheet, type: "general", category: "العمولات" },

  { key: "expenses_module", name: "المصروفات الشهرية", icon: BarChart3, type: "general", category: "المحاسبة" },
  { key: "journal_entries_module", name: "قيود اليومية", icon: FileEdit, type: "general", category: "المحاسبة" },
  { key: "income_report_module", name: "عرض الدخل والتقارير", icon: PieChart, type: "general", category: "المحاسبة" },
  { key: "expenses_report_module", name: "تقرير المصروفات", icon: BarChart3, type: "general", category: "المحاسبة" },

  { key: "accounts_module", name: "مركز الحسابات", icon: BookOpen, type: "general", category: "الحسابات" },
  { key: "cost_centers_module", name: "مراكز التكلفة", icon: Landmark, type: "general", category: "الحسابات" },
  { key: "ledger_module", name: "دفتر الأستاذ العام", icon: BookOpen, type: "general", category: "الحسابات" },
  { key: "trial_balance_module", name: "ميزان المراجعة", icon: Scale, type: "general", category: "الحسابات" },
  { key: "income_statement_module", name: "قائمة الأرصدة", icon: BarChart3, type: "general", category: "الحسابات" },
  { key: "balance_sheet_module", name: "الميزانية العمومية", icon: FileText, type: "general", category: "الحسابات" },
  { key: "tax_settings_module", name: "إعدادات الضريبة", icon: Calculator, type: "general", category: "الحسابات" },

  { key: "virtual_accounts_module", name: "الحسابات الافتراضية (VIBAN)", icon: Landmark, type: "general", category: "البنوك والتحصيل" },

  { key: "letters_templates_module", name: "الخطابات الجاهزة", icon: Mail, type: "general", category: "أخرى" },
  { key: "sub_users_module", name: "إدارة المستخدمين", icon: Users, type: "general", category: "الإدارة" },
];

const categoryColors: Record<string, { bg: string; border: string; icon: string; barColor: string }> = {
  "الموارد البشرية": { bg: "from-blue-500/10 to-blue-600/5", border: "border-r-blue-500", icon: "text-blue-500", barColor: "bg-blue-500" },
  "العملاء والمبيعات": { bg: "from-cyan-500/10 to-cyan-600/5", border: "border-r-cyan-500", icon: "text-cyan-500", barColor: "bg-cyan-500" },
  "السندات المالية": { bg: "from-indigo-500/10 to-indigo-600/5", border: "border-r-indigo-500", icon: "text-indigo-500", barColor: "bg-indigo-500" },
  "إدارة الأسطول": { bg: "from-amber-500/10 to-amber-600/5", border: "border-r-amber-500", icon: "text-amber-500", barColor: "bg-amber-500" },
  "التجارة الإلكترونية": { bg: "from-pink-500/10 to-pink-600/5", border: "border-r-pink-500", icon: "text-pink-500", barColor: "bg-pink-500" },
  "الشحن": { bg: "from-sky-500/10 to-sky-600/5", border: "border-r-sky-500", icon: "text-sky-500", barColor: "bg-sky-500" },
  "العمولات": { bg: "from-orange-500/10 to-orange-600/5", border: "border-r-orange-500", icon: "text-orange-500", barColor: "bg-orange-500" },
  "المحاسبة": { bg: "from-emerald-500/10 to-emerald-600/5", border: "border-r-emerald-500", icon: "text-emerald-500", barColor: "bg-emerald-500" },
  "الحسابات": { bg: "from-violet-500/10 to-violet-600/5", border: "border-r-violet-500", icon: "text-violet-500", barColor: "bg-violet-500" },
  "البنوك والتحصيل": { bg: "from-teal-500/10 to-teal-600/5", border: "border-r-teal-500", icon: "text-teal-500", barColor: "bg-teal-500" },
  "أخرى": { bg: "from-slate-500/10 to-slate-600/5", border: "border-r-slate-500", icon: "text-slate-500", barColor: "bg-slate-500" },
  "الإدارة": { bg: "from-purple-500/10 to-purple-600/5", border: "border-r-purple-500", icon: "text-purple-500", barColor: "bg-purple-500" },
};

export function GlobalPermissionsClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [updatedCount, setUpdatedCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/companies/global-permissions")
      .then(r => r.json())
      .then(data => {
        if (data.defaultFeatures) {
          setSelectedFeatures(new Set(data.defaultFeatures));
        }
        setTotalCompanies(data.totalCompanies || 0);
      })
      .catch(() => toast.error("تعذر تحميل بيانات الصلاحيات"))
      .finally(() => setIsFetching(false));
  }, []);

  const adminFeatures = features.filter(f => f.type === "admin");
  const generalFeatures = features.filter(f => f.type === "general");
  const categories = Array.from(new Set(generalFeatures.map(f => f.category)));

  const toggleFeature = (key: string) => {
    const newSet = new Set(selectedFeatures);
    if (newSet.has(key)) newSet.delete(key);
    else newSet.add(key);
    setSelectedFeatures(newSet);
  };

  const toggleAllAdmin = () => {
    const allKeys = adminFeatures.map(f => f.key);
    const allSelected = allKeys.every(k => selectedFeatures.has(k));
    const newSet = new Set(selectedFeatures);
    if (allSelected) allKeys.forEach(k => newSet.delete(k));
    else allKeys.forEach(k => newSet.add(k));
    setSelectedFeatures(newSet);
  };

  const toggleAllGeneral = () => {
    const allKeys = generalFeatures.map(f => f.key);
    const allSelected = allKeys.every(k => selectedFeatures.has(k));
    const newSet = new Set(selectedFeatures);
    if (allSelected) allKeys.forEach(k => newSet.delete(k));
    else allKeys.forEach(k => newSet.add(k));
    setSelectedFeatures(newSet);
  };

  const handleApply = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/companies/global-permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: Array.from(selectedFeatures) }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUpdatedCount(data.updatedCount);
        setShowSuccessModal(true);
      } else {
        toast.error("حدث خطأ أثناء تطبيق الصلاحيات");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
          <p className="text-slate-500 font-bold">جاري تحميل الصلاحيات...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-20 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 via-indigo-500 to-slate-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000" />
          <div className="relative bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl overflow-hidden border border-white/10">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 via-amber-500 via-emerald-500 to-indigo-500 bg-[length:200%_100%] animate-gradient-x" />

            <div className="relative z-10 space-y-4 text-center pt-2">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                الصلاحيات الافتراضية العامة
              </motion.div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                إدارة الصلاحيات الكاملة
              </h1>
              <p className="text-white/50 text-sm max-w-2xl mx-auto">
                اختر الصلاحيات ثم اضغط "تطبيق على جميع الشركات" لتطبيقها على كل الشركات المفعلة دفعة واحدة
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <div className="bg-indigo-500/10 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-indigo-500/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Building2 size={20} />
                  </div>
                  <div className="text-right">
                    <span className="block text-indigo-400/50 text-[10px] font-black uppercase tracking-widest">الشركات المفعلة</span>
                    <span className="text-xl font-black text-indigo-100">{totalCompanies}</span>
                  </div>
                </div>

                <div className="bg-emerald-500/10 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle size={20} />
                  </div>
                  <div className="text-right">
                    <span className="block text-emerald-400/50 text-[10px] font-black uppercase tracking-widest">صلاحية محددة</span>
                    <span className="text-xl font-black text-emerald-100">{selectedFeatures.size}</span>
                  </div>
                </div>

                <div className="bg-purple-500/10 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-purple-500/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Settings size={20} />
                  </div>
                  <div className="text-right">
                    <span className="block text-purple-400/50 text-[10px] font-black uppercase tracking-widest">إجمالي الصلاحيات</span>
                    <span className="text-xl font-black text-purple-100">{features.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800 text-sm">تنبيه مهم</p>
            <p className="text-amber-700 text-xs mt-1">
              الضغط على "تطبيق على جميع الشركات" سيحذف الصلاحيات الحالية لجميع الشركات المفعلة ({totalCompanies} شركة) ويستبدلها بالصلاحيات المحددة هنا.
              يُستخدم هذا لتوحيد الصلاحيات عبر كل الشركات دفعة واحدة.
            </p>
          </div>
        </motion.div>

        {/* Admin Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl"
        >
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 flex items-center justify-center">
                <Crown size={22} className="text-rose-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">الصلاحيات الإدارية</h2>
                <span className="text-xs text-slate-500">صلاحيات متقدمة للمشرفين</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2">
                <Shield size={12} />
                صلاحيات متقدمة
              </span>
              <button
                type="button"
                onClick={toggleAllAdmin}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              >
                <CheckCheck size={14} />
                تحديد الكل
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {adminFeatures.map((feature) => (
              <motion.div
                key={feature.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleFeature(feature.key)}
                className={cn(
                  "relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-300",
                  selectedFeatures.has(feature.key)
                    ? "bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-300 shadow-lg shadow-rose-500/10"
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-rose-500 to-pink-500 transition-opacity"
                  style={{ opacity: selectedFeatures.has(feature.key) ? 1 : 0 }}
                />
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                    selectedFeatures.has(feature.key)
                      ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-500"
                  )}>
                    <feature.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-sm">{feature.name}</h3>
                    <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                      <Shield size={8} />
                      إداري
                    </span>
                  </div>
                  <div className={cn(
                    "w-10 h-6 rounded-full transition-all duration-300 relative",
                    selectedFeatures.has(feature.key) ? "bg-emerald-500" : "bg-slate-300"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300",
                      selectedFeatures.has(feature.key) ? "right-1" : "left-1"
                    )} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* General Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl"
        >
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                <Globe size={22} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">الصلاحيات العامة</h2>
                <span className="text-xs text-slate-500">صلاحيات أساسية للمستخدمين</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-2">
                <Users size={12} />
                صلاحيات عامة
              </span>
              <button
                type="button"
                onClick={toggleAllGeneral}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              >
                <CheckCheck size={14} />
                تحديد الكل
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {categories.filter(Boolean).map((category) => {
              const categoryFeatures = generalFeatures.filter(f => f.category === category);
              const colors = categoryColors[category!] || categoryColors["أخرى"];

              return (
                <div key={category} className="space-y-3">
                  <h3 className="text-base font-black text-slate-700 flex items-center gap-3">
                    <div className={cn("w-1.5 h-6 rounded-full", colors.barColor)} />
                    {category}
                    <span className="text-[10px] font-normal text-slate-400">({categoryFeatures.length} صلاحيات)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryFeatures.map((feature) => (
                      <motion.div
                        key={feature.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleFeature(feature.key)}
                        className={cn(
                          "relative cursor-pointer rounded-xl p-4 border-2 border-r-4 transition-all duration-300",
                          colors.border,
                          selectedFeatures.has(feature.key)
                            ? `bg-gradient-to-br ${colors.bg} border-emerald-300 shadow-lg`
                            : "bg-white border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                            selectedFeatures.has(feature.key)
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
                              : "bg-slate-100 text-slate-500"
                          )}>
                            <feature.icon size={18} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-sm">{feature.name}</h3>
                            <span className={cn("text-[10px] font-semibold flex items-center gap-1", colors.icon)}>
                              <Sparkles size={8} />
                              {category}
                            </span>
                          </div>
                          <div className={cn(
                            "w-10 h-6 rounded-full transition-all duration-300 relative",
                            selectedFeatures.has(feature.key) ? "bg-emerald-500" : "bg-slate-300"
                          )}>
                            <div className={cn(
                              "absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300",
                              selectedFeatures.has(feature.key) ? "right-1" : "left-1"
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
        </motion.div>

        {/* Apply Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-4"
        >
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            disabled={isLoading}
            className="relative group flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-12 py-4 rounded-full font-black text-lg shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            <span className="relative flex items-center gap-3">
              {isLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  جاري التطبيق...
                </>
              ) : (
                <>
                  <Globe className="w-5 h-5" />
                  تطبيق على جميع الشركات ({totalCompanies})
                </>
              )}
            </span>
          </button>
        </motion.div>

        <style jsx global>{`
          @keyframes gradient-x {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-x { animation: gradient-x 3s ease infinite; }
        `}</style>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.3 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <AlertTriangle size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">تأكيد التطبيق</h3>
                <p className="text-slate-500 text-sm">
                  سيتم تطبيق <span className="font-bold text-indigo-600">{selectedFeatures.size} صلاحية</span> على{" "}
                  <span className="font-bold text-orange-600">{totalCompanies} شركة</span> مفعلة.
                  <br />
                  هذا الإجراء سيحل محل الصلاحيات الحالية لجميع الشركات.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  تأكيد التطبيق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.3 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>

              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">تم التطبيق بنجاح!</h3>
                <p className="text-slate-500 mb-6">
                  تم تطبيق <span className="font-bold text-emerald-600">{selectedFeatures.size} صلاحية</span> على{" "}
                  <span className="font-bold text-indigo-600">{updatedCount} شركة</span>
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} />
                  موافق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
