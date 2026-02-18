"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Mail,
  Database,
  Key,
  Globe,
  CreditCard,
  MessageSquare,
  Phone,
  Shield,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Copy,
  Server,
  Brain,
  Smartphone,
  Share2,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
  Zap,
  Send,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SystemSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_category: string;
  setting_label: string;
  setting_type: string;
  is_secret: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

interface CategoryConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  borderColor: string;
}

const categories: CategoryConfig[] = [
  {
    key: "smtp",
    label: "البريد الإلكتروني (SMTP)",
    description: "إعدادات خادم البريد الإلكتروني لإرسال الإشعارات والتنبيهات",
    icon: Mail,
    gradient: "from-blue-500 to-cyan-500",
    iconColor: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
  {
    key: "ai",
    label: "الذكاء الاصطناعي (AI)",
    description: "مفاتيح API للذكاء الاصطناعي - ChatGPT, DeepSeek, Gemini",
    icon: Brain,
    gradient: "from-purple-500 to-pink-500",
    iconColor: "text-purple-400",
    borderColor: "border-purple-500/30",
  },
  {
    key: "supabase",
    label: "Supabase (قاعدة البيانات الرئيسية)",
    description: "إعدادات الاتصال بقاعدة بيانات Supabase والمفاتيح السرية",
    icon: Database,
    gradient: "from-emerald-500 to-green-500",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
  },
  {
    key: "mysql",
    label: "MySQL (قاعدة البيانات الثانوية)",
    description: "إعدادات الاتصال بقاعدة بيانات MySQL على Hostinger",
    icon: Server,
    gradient: "from-orange-500 to-amber-500",
    iconColor: "text-orange-400",
    borderColor: "border-orange-500/30",
  },
  {
    key: "stripe",
    label: "Stripe (بوابة الدفع)",
    description: "مفاتيح Stripe للمدفوعات والاشتراكات",
    icon: CreditCard,
    gradient: "from-indigo-500 to-violet-500",
    iconColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
  },
  {
    key: "general",
    label: "إعدادات عامة",
    description: "رابط التطبيق وبريد المدير والإعدادات العامة",
    icon: Globe,
    gradient: "from-sky-500 to-blue-500",
    iconColor: "text-sky-400",
    borderColor: "border-sky-500/30",
  },
  {
    key: "sms",
    label: "الرسائل النصية (SMS)",
    description: "إعدادات خدمة الرسائل النصية القصيرة",
    icon: Phone,
    gradient: "from-teal-500 to-cyan-500",
    iconColor: "text-teal-400",
    borderColor: "border-teal-500/30",
  },
  {
    key: "social",
    label: "تسجيل الدخول الاجتماعي",
    description: "مفاتيح تسجيل الدخول عبر Google, Facebook, Twitter, GitHub",
    icon: Share2,
    gradient: "from-rose-500 to-pink-500",
    iconColor: "text-rose-400",
    borderColor: "border-rose-500/30",
  },
  {
    key: "whatsapp",
    label: "واتساب (WhatsApp)",
    description: "إعدادات API واتساب للإشعارات والرسائل",
    icon: MessageSquare,
    gradient: "from-green-500 to-emerald-500",
    iconColor: "text-green-400",
    borderColor: "border-green-500/30",
  },
  {
    key: "otp",
    label: "التحقق بخطوتين (OTP)",
    description: "رمز التحقق عند تسجيل الدخول عبر واتساب أو البريد الإلكتروني",
    icon: ShieldCheck,
    gradient: "from-violet-500 to-purple-600",
    iconColor: "text-violet-400",
    borderColor: "border-violet-500/30",
  },
];

// Add new setting modal
function AddSettingModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}) {
  const [form, setForm] = useState({
    setting_key: "",
    setting_value: "",
    setting_category: "general",
    setting_label: "",
    setting_type: "text",
    is_secret: false,
    description: "",
  });

  const handleSubmit = () => {
    if (!form.setting_key || !form.setting_label) {
      toast.error("يرجى ملء المفتاح والعنوان");
      return;
    }
    onAdd(form);
    setForm({
      setting_key: "",
      setting_value: "",
      setting_category: "general",
      setting_label: "",
      setting_type: "text",
      is_secret: false,
      description: "",
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg mx-4 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus size={20} className="text-emerald-400" />
              إضافة مفتاح جديد
            </h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/60">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1.5">اسم المفتاح (KEY)</label>
                <input
                  value={form.setting_key}
                  onChange={(e) => setForm({ ...form, setting_key: e.target.value.toUpperCase() })}
                  placeholder="مثال: MY_API_KEY"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none font-mono"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1.5">العنوان</label>
                <input
                  value={form.setting_label}
                  onChange={(e) => setForm({ ...form, setting_label: e.target.value })}
                  placeholder="مثال: مفتاح API"
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1.5">القيمة</label>
              <input
                value={form.setting_value}
                onChange={(e) => setForm({ ...form, setting_value: e.target.value })}
                placeholder="أدخل القيمة"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none font-mono"
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-1.5">التصنيف</label>
                <select
                  value={form.setting_category}
                  onChange={(e) => setForm({ ...form, setting_category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.key} value={cat.key} className="bg-gray-900">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1.5">نوع الحقل</label>
                <select
                  value={form.setting_type}
                  onChange={(e) => setForm({ ...form, setting_type: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 outline-none"
                >
                    <option value="text" className="bg-gray-900">نص عادي</option>
                    <option value="password" className="bg-gray-900">كلمة مرور</option>
                    <option value="url" className="bg-gray-900">رابط URL</option>
                    <option value="number" className="bg-gray-900">رقم</option>
                    <option value="email" className="bg-gray-900">بريد إلكتروني</option>
                    <option value="boolean" className="bg-gray-900">تفعيل/إيقاف</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1.5">الوصف (اختياري)</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف مختصر للمفتاح"
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 outline-none"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm({ ...form, is_secret: !form.is_secret })}
                className={cn(
                  "w-10 h-5 rounded-full transition-all duration-300 relative",
                  form.is_secret ? "bg-blue-500" : "bg-white/10"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300",
                    form.is_secret ? "right-0.5" : "left-0.5"
                  )}
                />
              </div>
              <span className="text-sm text-white/70">مفتاح سري (يتم إخفاء القيمة)</span>
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
            >
              إضافة المفتاح
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-all"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function SystemSettingsClient() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((c) => c.key))
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/system-settings");
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        const values: Record<string, string> = {};
        data.settings.forEach((s: SystemSetting) => {
          values[s.setting_key] = s.setting_value || "";
        });
        setEditedValues(values);
      }
    } catch {
      toast.error("فشل في تحميل الإعدادات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleValueChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const toggleSecret = (key: string) => {
    setVisibleSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("تم النسخ إلى الحافظة");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const changedSettings = settings
        .filter((s) => editedValues[s.setting_key] !== s.setting_value)
        .map((s) => ({
          setting_key: s.setting_key,
          setting_value: editedValues[s.setting_key],
        }));

      if (changedSettings.length === 0) {
        toast.info("لا توجد تغييرات لحفظها");
        return;
      }

      const res = await fetch("/api/admin/system-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: changedSettings }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`تم حفظ ${changedSettings.length} إعداد بنجاح`);
        setHasChanges(false);
        fetchSettings();
      } else {
        toast.error(data.error || "فشل في حفظ الإعدادات");
      }
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async (categoryKey: string) => {
    try {
      setSaving(true);
      const categorySettings = settings
        .filter((s) => s.setting_category === categoryKey)
        .filter((s) => editedValues[s.setting_key] !== s.setting_value)
        .map((s) => ({
          setting_key: s.setting_key,
          setting_value: editedValues[s.setting_key],
        }));

      if (categorySettings.length === 0) {
        toast.info("لا توجد تغييرات في هذا القسم");
        return;
      }

      const res = await fetch("/api/admin/system-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: categorySettings }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`تم حفظ إعدادات القسم بنجاح`);
        fetchSettings();
      } else {
        toast.error(data.error || "فشل في الحفظ");
      }
    } catch {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSetting = async (data: any) => {
    try {
      const res = await fetch("/api/admin/system-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("تمت إضافة المفتاح بنجاح");
        setShowAddModal(false);
        fetchSettings();
      } else {
        toast.error(result.error || "فشل في الإضافة");
      }
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const handleDeleteSetting = async (key: string) => {
    if (!confirm(`هل أنت متأكد من حذف المفتاح: ${key}؟`)) return;
    try {
      const res = await fetch(`/api/admin/system-settings?key=${key}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم حذف المفتاح");
        fetchSettings();
      } else {
        toast.error(data.error || "فشل في الحذف");
      }
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestingEmail(true);
      const smtpSettings = settings.filter((s) => s.setting_category === "smtp");
      const smtpConfig: Record<string, string> = {};
      smtpSettings.forEach((s) => {
        smtpConfig[s.setting_key] = editedValues[s.setting_key] || s.setting_value;
      });

      const res = await fetch("/api/admin/system-settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpConfig),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("تم إرسال بريد تجريبي بنجاح");
      } else {
        toast.error(data.error || "فشل في إرسال البريد التجريبي");
      }
    } catch {
      toast.error("فشل في الاختبار");
    } finally {
      setTestingEmail(false);
    }
  };

  const getSettingsForCategory = (categoryKey: string) =>
    settings.filter((s) => s.setting_category === categoryKey);

  const getCategoryChangesCount = (categoryKey: string) =>
    settings
      .filter((s) => s.setting_category === categoryKey)
      .filter((s) => editedValues[s.setting_key] !== s.setting_value).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Settings size={48} className="text-blue-400" />
        </motion.div>
        <p className="text-white/60 text-lg">جاري تحميل إعدادات النظام...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 backdrop-blur-xl p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
              <Settings size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                إعدادات النظام
                <Sparkles size={20} className="text-amber-400" />
              </h1>
              <p className="text-white/50 text-sm mt-1">
                إدارة جميع المفاتيح والإعدادات الخاصة بالنظام
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <Plus size={16} />
              إضافة مفتاح
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all",
                hasChanges
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/25 hover:shadow-blue-500/40"
                  : "bg-white/5 text-white/30 cursor-not-allowed shadow-none"
              )}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              حفظ جميع التغييرات
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-black text-white">{settings.length}</div>
            <div className="text-xs text-white/40">إجمالي المفاتيح</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-black text-emerald-400">
              {settings.filter((s) => s.setting_value).length}
            </div>
            <div className="text-xs text-white/40">مفاتيح مفعلة</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-black text-amber-400">
              {settings.filter((s) => !s.setting_value).length}
            </div>
            <div className="text-xs text-white/40">تحتاج إعداد</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-2xl font-black text-blue-400">
              {new Set(settings.map((s) => s.setting_category)).size}
            </div>
            <div className="text-xs text-white/40">أقسام</div>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      {categories.map((cat, catIndex) => {
        const catSettings = getSettingsForCategory(cat.key);
        if (catSettings.length === 0) return null;

        const isExpanded = expandedCategories.has(cat.key);
        const changesCount = getCategoryChangesCount(cat.key);
        const CatIcon = cat.icon;

        return (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.05 }}
            className={cn(
              "rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-800/80 backdrop-blur-xl overflow-hidden",
              cat.borderColor
            )}
          >
            {/* Category Header */}
            <div
              onClick={() => toggleCategory(cat.key)}
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-white/[0.02] transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "p-3 rounded-xl bg-gradient-to-br shadow-lg",
                    cat.gradient
                  )}
                >
                  <CatIcon size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {cat.label}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">
                      {catSettings.length} مفتاح
                    </span>
                    {changesCount > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 animate-pulse">
                        {changesCount} تغيير
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-white/40 mt-0.5">{cat.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cat.key === "smtp" && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTestEmail();
                    }}
                    disabled={testingEmail}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-all"
                  >
                    {testingEmail ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Send size={12} />
                    )}
                    اختبار الإرسال
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveCategory(cat.key);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all"
                >
                  <Save size={12} />
                  حفظ القسم
                </motion.button>

                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                  <ChevronDown size={20} className="text-white/40" />
                </motion.div>
              </div>
            </div>

            {/* Category Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 pt-0 space-y-3">
                    {catSettings.map((setting, idx) => {
                      const isSecret = setting.is_secret;
                      const isVisible = visibleSecrets.has(setting.setting_key);
                      const currentValue = editedValues[setting.setting_key] ?? setting.setting_value ?? "";
                      const isChanged = currentValue !== (setting.setting_value ?? "");

                      return (
                        <motion.div
                          key={setting.setting_key}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={cn(
                            "group relative rounded-xl border transition-all duration-300 p-4",
                            isChanged
                              ? "border-amber-500/30 bg-amber-500/5"
                              : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                          )}
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-3">
                            {/* Label & Key */}
                            <div className="md:w-1/3 min-w-0">
                              <div className="flex items-center gap-2">
                                {isSecret && (
                                  <Lock size={12} className="text-amber-400 flex-shrink-0" />
                                )}
                                <span className="text-sm font-bold text-white truncate">
                                  {setting.setting_label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-[11px] text-white/30 font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                  {setting.setting_key}
                                </code>
                                {setting.description && (
                                  <span className="text-[11px] text-white/20 truncate hidden md:block">
                                    {setting.description}
                                  </span>
                                )}
                              </div>
                            </div>

                              {/* Input */}
                              <div className="flex-1 flex items-center gap-2">
                                {setting.setting_type === "boolean" ? (
                                  /* Boolean Toggle */
                                  <div className="flex-1 flex items-center gap-3">
                                    <motion.button
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleValueChange(setting.setting_key, currentValue === "true" ? "false" : "true")}
                                      className={cn(
                                        "relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0",
                                        currentValue === "true"
                                          ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30"
                                          : "bg-white/10"
                                      )}
                                    >
                                      <motion.div
                                        animate={{ x: currentValue === "true" ? 28 : 2 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                                      />
                                    </motion.button>
                                    <span className={cn(
                                      "text-sm font-bold transition-colors",
                                      currentValue === "true" ? "text-emerald-400" : "text-white/30"
                                    )}>
                                      {currentValue === "true" ? "مفعّل" : "موقف"}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="relative flex-1">
                                    <input
                                      type={isSecret && !isVisible ? "password" : "text"}
                                      value={currentValue}
                                      onChange={(e) =>
                                        handleValueChange(setting.setting_key, e.target.value)
                                      }
                                      placeholder="غير مُعيّن"
                                      dir="ltr"
                                      className={cn(
                                        "w-full px-3 py-2.5 rounded-lg bg-black/30 border text-sm text-white font-mono outline-none transition-all placeholder:text-white/15",
                                        isChanged
                                          ? "border-amber-500/30 focus:border-amber-500/50"
                                          : "border-white/5 focus:border-blue-500/50"
                                      )}
                                    />
                                    {!currentValue && (
                                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                        <AlertTriangle
                                          size={14}
                                          className="text-amber-400/50"
                                        />
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                  {isSecret && setting.setting_type !== "boolean" && (
                                    <button
                                      onClick={() => toggleSecret(setting.setting_key)}
                                      className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-all"
                                      title={isVisible ? "إخفاء" : "إظهار"}
                                    >
                                    {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                  </button>
                                )}
                                <button
                                  onClick={() => copyToClipboard(currentValue)}
                                  className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-all"
                                  title="نسخ"
                                >
                                  <Copy size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSetting(setting.setting_key)}
                                  className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                  title="حذف"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Changed indicator */}
                          {isChanged && (
                            <div className="absolute top-2 left-2">
                              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5"
      >
        <div className="flex items-start gap-3">
          <Shield size={24} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-400">تنبيه أمني</h3>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">
              جميع المفاتيح السرية مشفرة ومحمية. يمكن فقط للمدير الرئيسي الوصول إلى
              هذه الصفحة. تأكد من عدم مشاركة هذه المفاتيح مع أي شخص غير مصرح له.
              التغييرات على المفاتيح قد تؤثر على عمل النظام بالكامل.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Add Setting Modal */}
      <AddSettingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSetting}
      />

      {/* Floating save button */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              حفظ جميع التغييرات
              <Zap size={14} className="text-amber-300" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
