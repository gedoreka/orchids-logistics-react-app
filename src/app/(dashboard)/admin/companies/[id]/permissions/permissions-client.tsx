"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  ArrowRight,
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
  Home
} from "lucide-react";
import { toast } from "sonner";
import { Company } from "@/lib/types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface PermissionsClientProps {
  company: Company;
  enabledFeatures: string[];
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

export function PermissionsClient({ company, enabledFeatures }: PermissionsClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set(enabledFeatures));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedFeatures, setSavedFeatures] = useState<string[]>([]);

  const adminFeatures = features.filter(f => f.type === 'admin');
  const generalFeatures = features.filter(f => f.type === 'general');

  const categories = Array.from(new Set(generalFeatures.map(f => f.category)));

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
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/companies/${company.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: Array.from(selectedFeatures) }),
      });
      
      if (response.ok) {
        setSavedFeatures(Array.from(selectedFeatures));
        setShowSuccessModal(true);
        router.refresh();
      } else {
        toast.error("حدث خطأ أثناء حفظ الصلاحيات");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <>
      <div className="space-y-10 pb-20 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 via-indigo-500 to-slate-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl overflow-hidden border border-white/10">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 via-amber-500 via-emerald-500 to-indigo-500 bg-[length:200%_100%] animate-gradient-x"></div>
            
            <Link 
              href={`/admin/companies/${company.id}`}
              className="absolute left-8 top-8 flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full font-bold text-sm transition-all"
            >
              <ArrowRight size={18} />
              العودة للتفاصيل
            </Link>

            <div className="relative z-10 space-y-8 text-center pt-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                نظام إدارة الصلاحيات
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                {company.name || "منشأة بدون اسم"}
              </h1>
              
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <div className="bg-indigo-500/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-indigo-500/20 flex items-center gap-3">
                  <Building2 size={18} className="text-indigo-400" />
                  <span className="text-indigo-100 font-bold">{company.name}</span>
                </div>
                
                <div className="bg-emerald-500/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-emerald-500/20 flex items-center gap-3">
                  <CheckCircle size={18} className="text-emerald-400" />
                  <span className="text-emerald-100 font-bold">{selectedFeatures.size} صلاحية مفعلة</span>
                </div>

                <div className="bg-purple-500/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-purple-500/20 flex items-center gap-3">
                  <Settings size={18} className="text-purple-400" />
                  <span className="text-purple-100 font-bold">{features.length} صلاحية متاحة</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Permissions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b-2 border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 flex items-center justify-center">
                <Crown size={28} className="text-rose-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">الصلاحيات الإدارية</h2>
                <span className="text-sm text-slate-500">صلاحيات متقدمة للمشرفين</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                <Shield size={14} />
                صلاحيات متقدمة
              </span>
              <button
                type="button"
                onClick={toggleAllAdmin}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm font-bold transition-all"
              >
                <CheckCheck size={16} />
                تحديد الكل
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminFeatures.map((feature) => (
              <motion.div
                key={feature.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleFeature(feature.key)}
                className={cn(
                  "relative cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300",
                  selectedFeatures.has(feature.key)
                    ? "bg-gradient-to-br from-rose-50 to-rose-100/50 border-rose-300 shadow-lg shadow-rose-500/10"
                    : "bg-white border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-rose-500 to-pink-500 opacity-0 transition-opacity" 
                     style={{ opacity: selectedFeatures.has(feature.key) ? 1 : 0 }} />
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                    selectedFeatures.has(feature.key)
                      ? "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg"
                      : "bg-slate-100 text-slate-500"
                  )}>
                    <feature.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{feature.name}</h3>
                    <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                      <Shield size={10} />
                      إداري
                    </span>
                  </div>
                  <div className={cn(
                    "w-12 h-7 rounded-full transition-all duration-300 relative",
                    selectedFeatures.has(feature.key) ? "bg-emerald-500" : "bg-slate-300"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300",
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
          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500"
        >
          <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b-2 border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
                <Globe size={28} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800">الصلاحيات العامة</h2>
                <span className="text-sm text-slate-500">صلاحيات أساسية للمستخدمين</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                <Users size={14} />
                صلاحيات عامة
              </span>
              <button
                type="button"
                onClick={toggleAllGeneral}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full text-sm font-bold transition-all"
              >
                <CheckCheck size={16} />
                تحديد الكل
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {categories.filter(Boolean).map((category) => {
              const categoryFeatures = generalFeatures.filter(f => f.category === category);
              const colors = categoryColors[category!] || categoryColors['أخرى'];
              
              return (
                <div key={category} className="space-y-4">
                  <h3 className="text-lg font-black text-slate-700 flex items-center gap-3">
                    <div className={cn("w-2 h-8 rounded-full", colors.border.replace('border-r-', 'bg-'))} />
                    {category}
                    <span className="text-xs font-normal text-slate-400">({categoryFeatures.length} صلاحيات)</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryFeatures.map((feature) => (
                      <motion.div
                        key={feature.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleFeature(feature.key)}
                        className={cn(
                          "relative cursor-pointer rounded-2xl p-5 border-2 border-r-4 transition-all duration-300",
                          colors.border,
                          selectedFeatures.has(feature.key)
                            ? `bg-gradient-to-br ${colors.bg} border-emerald-300 shadow-lg`
                            : "bg-white border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                            selectedFeatures.has(feature.key)
                              ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
                              : "bg-slate-100 text-slate-500"
                          )}>
                            <feature.icon size={22} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800">{feature.name}</h3>
                            <span className={cn("text-xs font-semibold flex items-center gap-1", colors.icon)}>
                              <Sparkles size={10} />
                              {category}
                            </span>
                          </div>
                          <div className={cn(
                            "w-12 h-7 rounded-full transition-all duration-300 relative",
                            selectedFeatures.has(feature.key) ? "bg-emerald-500" : "bg-slate-300"
                          )}>
                            <div className={cn(
                              "absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300",
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

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center pt-8"
        >
          <button
            type="button"
            onClick={handleSubmit}
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
                  حفظ الصلاحيات
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
          .animate-gradient-x {
            animation: gradient-x 3s ease infinite;
          }
        `}</style>
      </div>

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
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 md:p-10 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
              
              <button
                onClick={() => setShowSuccessModal(false)}
                className="absolute top-4 left-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>

              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">تم حفظ الصلاحيات بنجاح!</h3>
                <p className="text-slate-500">تم تفعيل الصلاحيات التالية للمنشأة</p>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 mb-8 bg-slate-50 rounded-2xl p-4">
                {savedFeatures.length > 0 ? (
                  savedFeatures.map(key => {
                    const feature = features.find(f => f.key === key);
                    if (!feature) return null;
                    return (
                      <div key={key} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
                        <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                        <span className="font-bold text-slate-700">{feature.name}</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-slate-400 py-4">لم يتم تفعيل أي صلاحيات</p>
                )}
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                موافق
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
