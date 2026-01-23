"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/locale-context";
import { 
  User, 
  Lock, 
  ShieldCheck, 
  Settings, 
  Globe, 
  CreditCard, 
  Database, 
  Bell, 
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Info,
  Key,
  Calendar,
  MapPin,
  Coins,
  Shield,
  Zap,
  LayoutGrid
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SettingsContentProps {
  company: any;
  taxSettings: any;
  userEmail: string;
  companyId: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function SettingsContent({ company, taxSettings, userEmail, companyId }: SettingsContentProps) {
  const t = useTranslations("systemSettings");
  const commonT = useTranslations("common");
  
  const { locale, isRTL: isRtl, setLocale } = useLocale();
  
  const [loading, setLoading] = useState(false);
  
  // Language switcher state
  const handleLanguageChange = (newLocale: "ar" | "en") => {
    if (newLocale === locale) return;
    setLocale(newLocale);
    toast.success(newLocale === "ar" ? "تم تغيير اللغة إلى العربية" : "Language changed to English");
  };
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Tax settings state
  const [zatcaEnabled, setZatcaEnabled] = useState(taxSettings.zatca_enabled || false);
  const [zatcaEnv, setZatcaEnvironment] = useState(taxSettings.zatca_environment || "sandbox");
  const [zatcaApiKey, setZatcaApiKey] = useState(taxSettings.zatca_api_key || "");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success(t("passwordChangedSuccess"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error(error.message || commonT("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTaxSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("tax_settings")
        .upsert({
          company_id: companyId,
          zatca_enabled: zatcaEnabled,
          zatca_environment: zatcaEnv,
          zatca_api_key: zatcaApiKey,
          updated_at: new Date().toISOString()
        }, { onConflict: "company_id" });

      if (error) throw error;
      toast.success(commonT("success"));
    } catch (error: any) {
      console.error("Error saving tax settings:", error);
      toast.error(commonT("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Dynamic Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4"
      >
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Settings size={28} className="text-white" />
            </div>
            {t("title")}
          </h1>
          <p className="text-slate-400 mt-2 font-medium ps-16">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3 ps-16 md:ps-0">
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-white/70">{t("version")} 2.0.4</span>
          </div>
        </div>
      </motion.div>

      {/* Unified Luxurious Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-slate-900/40 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]"
      >
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -ml-48 -mb-48" />
        
        <div className="relative grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5 rtl:divide-x-reverse">
          
          {/* Main Settings Section (Left/Center) */}
          <div className="lg:col-span-8 p-8 md:p-12 space-y-12">
            
            {/* 1. Security Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Lock size={20} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">{t("security")}</h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">إدارة حماية الحساب وكلمات المرور</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("email")}</label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all">
                    <Globe size={18} className="text-slate-500" />
                    <span className="text-sm font-bold text-white/40">{userEmail}</span>
                    <div className="ms-auto px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                      <Shield size={12} className="text-slate-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("currentPassword")}</label>
                  <div className="relative group">
                    <input 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-white/10"
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-500/30 transition-colors" size={18} />
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("newPassword")}</label>
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("confirmNewPassword")}</label>
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-12 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                    {t("updatePassword")}
                  </motion.button>
                </div>
              </form>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            {/* 2. ZATCA Integration Section */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <Zap size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white tracking-tight">{t("taxIntegration")}</h2>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">الربط مع هيئة الزكاة والضريبة والجمارك</p>
                  </div>
                </div>
                <div className="hidden sm:flex px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Enterprise Feature</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 flex items-center justify-between p-6 rounded-[2rem] bg-gradient-to-br from-emerald-500/5 to-transparent border border-emerald-500/10">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white">{t("zatcaEnabled")}</p>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-md">{t("zatcaEnabledDesc")}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setZatcaEnabled(!zatcaEnabled)}
                    className={cn(
                      "w-16 h-9 rounded-full p-1.5 transition-all duration-500 ease-in-out",
                      zatcaEnabled ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-slate-800"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full bg-white shadow-xl transition-transform duration-500 transform",
                      zatcaEnabled ? "translate-x-7 rtl:-translate-x-7" : "translate-x-0"
                    )} />
                  </motion.button>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("environment")}</label>
                  <div className="flex p-1.5 rounded-2xl bg-black/40 border border-white/5">
                    <button 
                      onClick={() => setZatcaEnvironment("sandbox")}
                      className={cn(
                        "flex-1 py-3 text-xs font-black rounded-xl transition-all",
                        zatcaEnv === "sandbox" ? "bg-white/10 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {t("sandbox")}
                    </button>
                    <button 
                      onClick={() => setZatcaEnvironment("production")}
                      className={cn(
                        "flex-1 py-3 text-xs font-black rounded-xl transition-all",
                        zatcaEnv === "production" ? "bg-emerald-500/20 text-emerald-400 shadow-lg" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {t("production")}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">{t("apiKey")}</label>
                  <div className="relative">
                    <input 
                      type="password"
                      value={zatcaApiKey}
                      onChange={(e) => setZatcaApiKey(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5" size={18} />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveTaxSettings}
                    disabled={loading}
                    className="w-full md:w-auto px-12 py-4 rounded-2xl bg-white text-slate-950 font-black text-sm shadow-xl shadow-white/5 hover:shadow-white/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {t("saveSettings")}
                  </motion.button>
                </div>
              </div>
            </section>
          </div>

          {/* Side Info Column (Right) */}
          <div className="lg:col-span-4 bg-white/[0.02] p-8 md:p-12 space-y-12">
            
            {/* System Info Panel */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <LayoutGrid size={20} className="text-purple-400" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">{t("systemInfo")}</h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: t("region"), value: company.region || company.country || "السعودية", icon: MapPin, color: "text-blue-400", bg: "bg-blue-500/10" },
                  { label: t("currency"), value: company.currency || "SAR", icon: Coins, color: "text-amber-400", bg: "bg-amber-500/10" },
                  { label: t("setupDate"), value: company.created_at ? new Date(company.created_at).toLocaleDateString(\'en-US\') : "-", icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", item.bg)}>
                        <item.icon size={14} className={item.color} />
                      </div>
                      <span className="text-xs font-bold text-slate-400">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-white">{item.value}</span>
                  </div>
                ))}

                <div className="p-6 rounded-3xl bg-slate-950/50 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("systemKey")}</label>
                    <span className="text-[9px] px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 font-black border border-white/5">PROTECTED</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5">
                      <Key size={14} className="text-slate-500" />
                    </div>
                    <code className="text-[11px] font-mono text-slate-400 truncate tracking-tighter">
                      {company.access_token || "SYSTEM_SECURE_TOKEN_ACT"}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Teasers */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 opacity-60">
                <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <Zap size={20} className="text-pink-400" />
                </div>
                <h3 className="text-lg font-black text-white tracking-tight">{t("otherOptions")}</h3>
              </div>

              <div className="space-y-3">
                {[
                  { label: t("autoBackup"), icon: Database },
                  { label: t("notifications"), icon: Bell },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 opacity-30 grayscale cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-500">{item.label}</span>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-slate-800 p-1">
                      <div className="w-3 h-3 rounded-full bg-slate-700" />
                    </div>
                  </div>
                ))}

                <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex gap-4 mt-6">
                  <Info size={20} className="text-blue-400 shrink-0" />
                  <p className="text-[11px] text-blue-400/70 font-bold leading-relaxed">
                    هذه الخيارات مجدولة للإصدار v2.1 القادم. ترقبوا التحديثات!
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
