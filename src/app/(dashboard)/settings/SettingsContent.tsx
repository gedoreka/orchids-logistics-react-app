"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
  Info
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
      // Supabase updateUser for password
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

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary">
          <Cpu className="w-4 h-4" />
          <span className="font-semibold">{t("version")} 2.0</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User & Security */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Account Section */}
          <motion.div 
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">{t("userAccount")}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("email")}</label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{userEmail}</span>
                </div>
                <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {t("emailNote")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Security Section */}
          <motion.div 
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">{t("security")}</h2>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="space-y-4 text-start" dir="rtl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("newPassword")}</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("confirmNewPassword")}</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {t("updatePassword")}
              </button>
            </form>
          </motion.div>

          {/* Tax Integration Section */}
          <motion.div 
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <FileText className="w-24 h-24" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">{t("taxIntegration")}</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="space-y-0.5 text-start" dir="rtl">
                  <div className="font-medium">{t("zatcaEnabled")}</div>
                  <div className="text-sm text-muted-foreground">{t("zatcaEnabledDesc")}</div>
                </div>
                <div 
                  onClick={() => setZatcaEnabled(!zatcaEnabled)}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${zatcaEnabled ? 'bg-primary' : 'bg-muted'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${zatcaEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("environment")}</label>
                  <div className="flex p-1 rounded-xl bg-muted border border-border">
                    <button 
                      onClick={() => setZatcaEnvironment("sandbox")}
                      className={`flex-1 py-2 text-sm rounded-lg transition-all ${zatcaEnv === "sandbox" ? 'bg-background shadow-sm text-primary font-semibold' : 'text-muted-foreground'}`}
                    >
                      {t("sandbox")}
                    </button>
                    <button 
                      onClick={() => setZatcaEnvironment("production")}
                      className={`flex-1 py-2 text-sm rounded-lg transition-all ${zatcaEnv === "production" ? 'bg-background shadow-sm text-primary font-semibold' : 'text-muted-foreground'}`}
                    >
                      {t("production")}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-start" dir="rtl">
                  <label className="text-sm font-medium">{t("apiKey")}</label>
                  <input 
                    type="password" 
                    value={zatcaApiKey}
                    onChange={(e) => setZatcaApiKey(e.target.value)}
                    placeholder="Enter ZATCA API Key..."
                    className="w-full p-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleSaveTaxSettings}
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {t("saveSettings")}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column - System Info & Extra */}
        <div className="space-y-8">
          {/* System Info Section */}
          <motion.div 
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="p-6 rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                <Info className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">{t("systemInfo")}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="text-sm text-muted-foreground">{t("region")}</span>
                <span className="text-sm font-medium">{company.region || company.country || "-"}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <span className="text-sm text-muted-foreground">{t("currency")}</span>
                <span className="text-sm font-medium">{company.currency || "SAR"}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors text-start" dir="rtl">
                <span className="text-sm text-muted-foreground">{t("setupDate")}</span>
                <span className="text-sm font-medium">
                  {company.created_at ? new Date(company.created_at).toLocaleDateString('en-GB') : "-"}
                </span>
              </div>
              <div className="space-y-2 mt-4">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("systemKey")}</label>
                <div className="p-3 rounded-xl bg-muted/50 border border-dashed border-border flex items-center justify-between">
                  <code className="text-xs font-mono truncate max-w-[150px]">{company.access_token || "N/A"}</code>
                  <div className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase font-bold">
                    Read Only
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Other Options */}
          <motion.div 
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="p-6 rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-600">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">{t("otherOptions")}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between group cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/5 transition-colors">
                    <Database className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{t("autoBackup")}</span>
                </div>
                <div className="w-10 h-5 rounded-full bg-muted p-1">
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>
              </div>
              
              <div className="flex items-center justify-between group cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/5 transition-colors">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{t("notifications")}</span>
                </div>
                <div className="w-10 h-5 rounded-full bg-muted p-1">
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-600/80 leading-relaxed">
                    These options are scheduled for implementation in the next release (v2.1). Stay tuned for more features!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
