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
  
  const [loading, setLoading] = useState(false);
  
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Glass Effect */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900/80 to-slate-950/90 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/20">
              <Settings size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-slate-400 font-medium">{t("subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white/90">{t("version")} 2.0</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Unified Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[2.5rem] bg-slate-900/40 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/5 rtl:divide-x-reverse">
          
          {/* Left Column - Main Settings */}
          <div className="lg:col-span-8 p-8 md:p-10 space-y-12">
            
            {/* Account & Security Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h2 className="text-xl font-bold text-white tracking-tight">{t("security")}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Email (Read Only) */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{t("email")}</label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-white/50">
                    <Globe size={18} className="text-slate-500" />
                    <span className="text-sm font-medium">{userEmail}</span>
                    <div className="ms-auto">
                      <Shield size={14} className="text-slate-600" />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 px-1 font-medium italic">{t("emailNote")}</p>
                </div>

                {/* Password Fields */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{t("currentPassword")}</label>
                  <div className="relative">
                    <input 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-white/10"
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10" size={18} />
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{t("newPassword")}</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{t("confirmNewPassword")}</label>
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    {t("updatePassword")}
                  </motion.button>
                </div>
              </form>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            {/* Tax Integration Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                  <h2 className="text-xl font-bold text-white tracking-tight">{t("taxIntegration")}</h2>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Phase 2 Ready</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/10">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{t("zatcaEnabled")}</p>
                    <p className="text-xs text-slate-400">{t("zatcaEnabledDesc")}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setZatcaEnabled(!zatcaEnabled)}
                    className={cn(
                      "w-14 h-8 rounded-full p-1.5 transition-colors duration-500",
                      zatcaEnabled ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-500",
                      zatcaEnabled ? "translate-x-6 rtl:-translate-x-6" : "translate-x-0"
                    )} />
                  </motion.button>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{t("environment")}</label>
                  <div className="flex p-1.5 rounded-2xl bg-black/40 border border-white/5">
                    <button 
                      onClick={() => setZatcaEnvironment("sandbox")}
                      className={cn(
                        "flex-1 py-3 text-xs font-bold rounded-xl transition-all",
                        zatcaEnv === "sandbox" ? "bg-white/10 text-white shadow-xl" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {t("sandbox")}
                    </button>
                    <button 
                      onClick={() => setZatcaEnvironment("production")}
                      className={cn(
                        "flex-1 py-3 text-xs font-bold rounded-xl transition-all",
                        zatcaEnv === "production" ? "bg-emerald-500/20 text-emerald-400 shadow-xl" : "text-slate-500 hover:text-slate-300"
                      )}
                    >
                      {t("production")}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{t("apiKey")}</label>
                  <div className="relative">
                    <input 
                      type="password"
                      value={zatcaApiKey}
                      onChange={(e) => setZatcaApiKey(e.target.value)}
                      placeholder="Enter Key..."
                      className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                    />
                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10" size={18} />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSaveTaxSettings}
                    disabled={loading}
                    className="w-full md:w-auto px-10 py-4 rounded-2xl bg-white text-slate-900 font-black text-sm shadow-xl shadow-white/5 hover:shadow-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {t("saveSettings")}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info Panels */}
          <div className="lg:col-span-4 bg-white/5 p-8 md:p-10 space-y-10">
            
            {/* System Information Panel */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <LayoutGrid size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">{t("systemInfo")}</h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: t("region"), value: company.region || company.country || "-", icon: MapPin, color: "text-blue-400" },
                  { label: t("currency"), value: company.currency || "SAR", icon: Coins, color: "text-amber-400" },
                  { label: t("setupDate"), value: company.created_at ? new Date(company.created_at).toLocaleDateString('en-GB') : "-", icon: Calendar, color: "text-purple-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className={item.color} />
                      <span className="text-xs font-bold text-slate-400">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-white">{item.value}</span>
                  </div>
                ))}

                <div className="p-5 rounded-2xl bg-slate-950/50 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t("systemKey")}</label>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold border border-white/5">READ ONLY</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Key size={14} className="text-slate-600" />
                    <code className="text-[11px] font-mono text-slate-400 truncate">{company.access_token || "N/A"}</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Features Panel */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                  <Zap size={20} />
                </div>
                <h3 className="text-lg font-bold text-white">{t("otherOptions")}</h3>
              </div>

              <div className="space-y-3">
                {[
                  { label: t("autoBackup"), icon: Database },
                  { label: t("notifications"), icon: Bell },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 opacity-40 grayscale">
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-500">{item.label}</span>
                    </div>
                    <div className="w-10 h-5 rounded-full bg-slate-800 p-1">
                      <div className="w-3 h-3 rounded-full bg-slate-700" />
                    </div>
                  </div>
                ))}

                <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3 mt-4">
                  <AlertCircle size={18} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-500/70 font-bold leading-relaxed">
                    Options scheduled for v2.1. Stay tuned!
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
