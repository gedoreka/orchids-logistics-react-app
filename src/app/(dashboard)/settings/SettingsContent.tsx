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
  LayoutGrid,
  ChevronDown,
  Building2,
  Check,
  Smartphone,
  Network,
  History,
  Bug,
  Upload,
  FileCode,
  LockKeyhole
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
  const [activeTab, setActiveTab] = useState("general");
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Tax settings state
  const [zatcaEnabled, setZatcaEnabled] = useState(taxSettings.zatca_enabled || false);
  const [zatcaEnv, setZatcaEnvironment] = useState(taxSettings.zatca_environment || "sandbox");
  const [zatcaApiUrl, setZatcaApiUrl] = useState(taxSettings.zatca_api_url || "");
  const [zatcaClientId, setZatcaClientId] = useState(taxSettings.zatca_client_id || "");
  const [zatcaClientSecret, setZatcaClientSecret] = useState(taxSettings.zatca_client_secret || "");
  const [zatcaVatNumber, setZatcaVatNumber] = useState(taxSettings.zatca_vat_number || "");
  
  const [zatcaCert, setZatcaCert] = useState(taxSettings.zatca_cert || "");
  const [zatcaPrivateKey, setZatcaPrivateKey] = useState(taxSettings.zatca_private_key || "");
  const [zatcaCertPassword, setZatcaCertPassword] = useState(taxSettings.zatca_cert_password || "");
  
  const [zatcaInvoiceTypes, setZatcaInvoiceTypes] = useState<string[]>(taxSettings.zatca_invoice_types || ["standard", "simplified"]);
  const [zatcaPaymentMethods, setZatcaPaymentMethods] = useState<string[]>(taxSettings.zatca_payment_methods || ["cash", "card", "transfer"]);
  
  const [zatcaAutoSignature, setZatcaAutoSignature] = useState(taxSettings.zatca_auto_signature ?? true);
  const [zatcaImmediateSend, setZatcaImmediateSend] = useState(taxSettings.zatca_immediate_send ?? true);
  const [zatcaBackupPeriod, setZatcaBackupPeriod] = useState(taxSettings.zatca_backup_period || 7);
  const [zatcaLogLevel, setZatcaLogLevel] = useState(taxSettings.zatca_log_level || "info");
  const [zatcaTimeout, setZatcaTimeout] = useState(taxSettings.zatca_timeout || 30);
  const [zatcaMaxRetries, setZatcaMaxRetries] = useState(taxSettings.zatca_max_retries || 3);

  const toggleInvoiceType = (type: string) => {
    setZatcaInvoiceTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const togglePaymentMethod = (method: string) => {
    setZatcaPaymentMethods(prev => 
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  };

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
          zatca_api_url: zatcaApiUrl,
          zatca_client_id: zatcaClientId,
          zatca_client_secret: zatcaClientSecret,
          zatca_vat_number: zatcaVatNumber,
          zatca_cert: zatcaCert,
          zatca_private_key: zatcaPrivateKey,
          zatca_cert_password: zatcaCertPassword,
          zatca_invoice_types: zatcaInvoiceTypes,
          zatca_payment_methods: zatcaPaymentMethods,
          zatca_auto_signature: zatcaAutoSignature,
          zatca_immediate_send: zatcaImmediateSend,
          zatca_backup_period: zatcaBackupPeriod,
          zatca_log_level: zatcaLogLevel,
          zatca_timeout: zatcaTimeout,
          zatca_max_retries: zatcaMaxRetries,
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
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-0">
      {/* Luxurious Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-10 rounded-[3rem] bg-gradient-to-br from-slate-900/90 to-slate-950 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110 duration-1000" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -ml-48 -mb-48 transition-transform group-hover:scale-110 duration-1000" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-[2rem] blur-xl animate-pulse" />
              <div className="relative p-5 rounded-[2rem] bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 shadow-2xl border border-white/20">
                <Settings size={40} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                {t("title")}
              </h1>
              <div className="flex items-center gap-3">
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{t("subtitle")}</p>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-blue-400/80 font-black text-xs">V2.0 PRO</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center gap-3 group/chip hover:bg-white/10 transition-all cursor-default">
              <div className="p-1.5 rounded-lg bg-blue-500/20 group-hover/chip:bg-blue-500/30 transition-colors">
                <Cpu className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Status</span>
                <span className="text-sm font-black text-white/90">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Unified Luxurious Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-[3rem] bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 p-8 md:p-12 space-y-16">
            
            {/* Security Section */}
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.4)]" />
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">{t("security")}</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Credentials & Access Control</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Email (Read Only) */}
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("email")}</label>
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center gap-4 p-5 rounded-3xl bg-black/40 border border-white/10 text-white/50 backdrop-blur-xl">
                      <div className="p-2.5 rounded-xl bg-white/5">
                        <Globe size={20} className="text-blue-400/60" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white/80">{userEmail}</span>
                        <span className="text-[10px] font-bold text-slate-600">{t("emailNote")}</span>
                      </div>
                      <Shield size={16} className="ms-auto text-slate-700" />
                    </div>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("currentPassword")}</label>
                  <div className="relative group">
                    <input 
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all placeholder:text-white/10 font-bold"
                    />
                    <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-500/40 transition-colors" size={20} />
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("newPassword")}</label>
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("confirmNewPassword")}</label>
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:border-blue-500/50 focus:ring-8 focus:ring-blue-500/5 outline-none transition-all font-bold"
                      required
                    />
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-12 py-5 rounded-[2rem] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-sm shadow-[0_20px_40px_-12px_rgba(59,130,246,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.6)] transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                >
                  {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6 group-hover:rotate-12 transition-transform" />}
                  <span className="tracking-widest">{t("updatePassword").toUpperCase()}</span>
                </motion.button>
              </form>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ZATCA Phase 2 Section */}
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">{t("taxIntegration")}</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">E-Invoicing & Compliance</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Phase 2 Compliant</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10">
                {/* Enable Switch - Large Card */}
                <div className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center justify-between p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "p-4 rounded-[1.5rem] transition-all duration-500 shadow-2xl",
                        zatcaEnabled ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-white/5 border border-white/5"
                      )}>
                        <Network className={cn("w-8 h-8 transition-colors", zatcaEnabled ? "text-emerald-400" : "text-slate-600")} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-black text-white">{t("zatcaEnabled")}</p>
                        <p className="text-sm font-bold text-slate-500 max-w-md leading-relaxed">{t("zatcaEnabledDesc")}</p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setZatcaEnabled(!zatcaEnabled)}
                      className={cn(
                        "w-20 h-10 rounded-full p-2 transition-colors duration-500 relative",
                        zatcaEnabled ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-slate-800"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full bg-white shadow-xl transition-all duration-500 flex items-center justify-center",
                        zatcaEnabled ? "translate-x-10 rtl:-translate-x-10" : "translate-x-0"
                      )}>
                        {zatcaEnabled && <Check className="w-4 h-4 text-emerald-600 font-black" />}
                      </div>
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {zatcaEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-12 overflow-hidden"
                    >
                      {/* Connection Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("environment")}</label>
                          <div className="flex p-2 rounded-[1.5rem] bg-black/40 border border-white/5 shadow-inner">
                            <button 
                              onClick={() => setZatcaEnvironment("sandbox")}
                              className={cn(
                                "flex-1 py-4 text-xs font-black rounded-2xl transition-all tracking-widest uppercase",
                                zatcaEnv === "sandbox" ? "bg-white/10 text-white shadow-xl" : "text-slate-600 hover:text-slate-400"
                              )}
                            >
                              {t("sandbox")}
                            </button>
                            <button 
                              onClick={() => setZatcaEnvironment("production")}
                              className={cn(
                                "flex-1 py-4 text-xs font-black rounded-2xl transition-all tracking-widest uppercase",
                                zatcaEnv === "production" ? "bg-emerald-500/20 text-emerald-400 shadow-xl" : "text-slate-600 hover:text-slate-400"
                              )}
                            >
                              {t("production")}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("zatcaApiUrl")}</label>
                          <div className="relative group">
                            <input 
                              type="text"
                              value={zatcaApiUrl}
                              onChange={(e) => setZatcaApiUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all font-bold font-mono text-sm"
                            />
                            <Network className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-emerald-500/40 transition-colors" size={20} />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("zatcaClientId")}</label>
                          <div className="relative group">
                            <input 
                              type="text"
                              value={zatcaClientId}
                              onChange={(e) => setZatcaClientId(e.target.value)}
                              placeholder="Enter Client ID"
                              className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all font-bold"
                            />
                            <User className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-emerald-500/40 transition-colors" size={20} />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("zatcaClientSecret")}</label>
                          <div className="relative group">
                            <input 
                              type="password"
                              value={zatcaClientSecret}
                              onChange={(e) => setZatcaClientSecret(e.target.value)}
                              placeholder="••••••••••••"
                              className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:border-emerald-500/50 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all font-bold"
                            />
                            <Key className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-emerald-500/40 transition-colors" size={20} />
                          </div>
                        </div>
                      </div>

                      {/* Certificates Section - Luxurious Grid */}
                      <div className="p-10 rounded-[3rem] bg-gradient-to-br from-black/40 to-black/20 border border-white/5 space-y-10">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                            <Shield className="w-6 h-6 text-amber-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white">{t("zatcaCert")}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security Certificates & Private Keys</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                          <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("zatcaCert")}</label>
                            <textarea 
                              value={zatcaCert}
                              onChange={(e) => setZatcaCert(e.target.value)}
                              placeholder="-----BEGIN CERTIFICATE-----"
                              rows={4}
                              className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all font-mono text-xs leading-relaxed resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("zatcaPrivateKey")}</label>
                              <div className="relative group">
                                <input 
                                  type="password"
                                  value={zatcaPrivateKey}
                                  onChange={(e) => setZatcaPrivateKey(e.target.value)}
                                  placeholder="Private Key String"
                                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all font-bold"
                                />
                                <LockKeyhole className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-amber-500/40" size={20} />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("zatcaCertPassword")}</label>
                              <div className="relative group">
                                <input 
                                  type="password"
                                  value={zatcaCertPassword}
                                  onChange={(e) => setZatcaCertPassword(e.target.value)}
                                  placeholder="Cert Passphrase"
                                  className="w-full p-5 rounded-3xl bg-white/5 border border-white/10 text-white focus:border-amber-500/50 outline-none transition-all font-bold"
                                />
                                <Key className="absolute right-5 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-amber-500/40" size={20} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Invoice Types & Payment Methods */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Invoice Types */}
                        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-emerald-400" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">{t("zatcaInvoiceTypes")}</h3>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { id: "standard", label: t("invoiceStandard") },
                              { id: "simplified", label: t("invoiceSimplified") },
                              { id: "credit", label: t("creditNote") },
                              { id: "debit", label: t("debitNote") },
                            ].map((type) => (
                              <button
                                key={type.id}
                                onClick={() => toggleInvoiceType(type.id)}
                                className={cn(
                                  "flex items-center justify-between p-4 rounded-2xl transition-all border",
                                  zatcaInvoiceTypes.includes(type.id) 
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                    : "bg-black/20 border-white/5 text-slate-500 hover:border-white/10"
                                )}
                              >
                                <span className="text-xs font-bold">{type.label}</span>
                                {zatcaInvoiceTypes.includes(type.id) && <CheckCircle2 className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 space-y-6">
                          <div className="flex items-center gap-3 mb-2">
                            <CreditCard className="w-5 h-5 text-blue-400" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">{t("zatcaPaymentMethods")}</h3>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { id: "cash", label: t("paymentCash") },
                              { id: "card", label: t("paymentCard") },
                              { id: "transfer", label: t("paymentTransfer") },
                              { id: "credit", label: t("paymentCredit") },
                            ].map((method) => (
                              <button
                                key={method.id}
                                onClick={() => togglePaymentMethod(method.id)}
                                className={cn(
                                  "flex items-center justify-between p-4 rounded-2xl transition-all border",
                                  zatcaPaymentMethods.includes(method.id) 
                                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400" 
                                    : "bg-black/20 border-white/5 text-slate-500 hover:border-white/10"
                                )}
                              >
                                <span className="text-xs font-bold">{method.label}</span>
                                {zatcaPaymentMethods.includes(method.id) && <CheckCircle2 className="w-4 h-4" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Advanced Settings */}
                      <div className="space-y-8">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-purple-500/10">
                            <Zap className="w-5 h-5 text-purple-400" />
                          </div>
                          <h3 className="text-lg font-black text-white">{t("zatcaAdvanced")}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/10">
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-white">{t("zatcaAutoSignature")}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-black">Background Processing</p>
                            </div>
                            <button
                              onClick={() => setZatcaAutoSignature(!zatcaAutoSignature)}
                              className={cn(
                                "w-12 h-6 rounded-full p-1 transition-colors",
                                zatcaAutoSignature ? "bg-purple-500" : "bg-slate-800"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded-full bg-white transition-transform",
                                zatcaAutoSignature ? "translate-x-6 rtl:-translate-x-6" : "translate-x-0"
                              )} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/10">
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-white">{t("zatcaImmediateSend")}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-black">Real-time Validation</p>
                            </div>
                            <button
                              onClick={() => setZatcaImmediateSend(!zatcaImmediateSend)}
                              className={cn(
                                "w-12 h-6 rounded-full p-1 transition-colors",
                                zatcaImmediateSend ? "bg-purple-500" : "bg-slate-800"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded-full bg-white transition-transform",
                                zatcaImmediateSend ? "translate-x-6 rtl:-translate-x-6" : "translate-x-0"
                              )} />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("zatcaLogLevel")}</label>
                            <div className="flex p-1.5 rounded-[1.5rem] bg-black/40 border border-white/5">
                              <button 
                                onClick={() => setZatcaLogLevel("info")}
                                className={cn(
                                  "flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase",
                                  zatcaLogLevel === "info" ? "bg-white/10 text-white shadow-lg" : "text-slate-600 hover:text-slate-400"
                                )}
                              >
                                {t("logInfo")}
                              </button>
                              <button 
                                onClick={() => setZatcaLogLevel("debug")}
                                className={cn(
                                  "flex-1 py-3 text-[10px] font-black rounded-xl transition-all uppercase",
                                  zatcaLogLevel === "debug" ? "bg-white/10 text-white shadow-lg" : "text-slate-600 hover:text-slate-400"
                                )}
                              >
                                {t("logDebug")}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">{t("zatcaBackupPeriod")}</label>
                            <div className="relative group">
                              <input 
                                type="number"
                                value={zatcaBackupPeriod}
                                onChange={(e) => setZatcaBackupPeriod(parseInt(e.target.value))}
                                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:border-purple-500/50 outline-none transition-all font-black text-center"
                              />
                              <History className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" size={18} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-6">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveTaxSettings}
                    disabled={loading}
                    className="w-full md:w-auto px-16 py-6 rounded-[2.5rem] bg-white text-slate-950 font-black text-sm shadow-[0_32px_64px_-16px_rgba(255,255,255,0.15)] hover:shadow-[0_40px_80px_-16px_rgba(255,255,255,0.25)] transition-all disabled:opacity-50 flex items-center justify-center gap-4 group"
                  >
                    {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                    <span className="tracking-[0.2em]">{t("saveSettings").toUpperCase()}</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Sidebar Info Area */}
          <div className="lg:col-span-4 bg-white/[0.02] border-l border-white/5 backdrop-blur-3xl p-8 md:p-12 space-y-12 rtl:border-l-0 rtl:border-r">
            
            {/* System Information Panel */}
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <LayoutGrid size={24} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">{t("systemInfo")}</h3>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Instance Metadata</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: t("region"), value: company.region || company.country || "-", icon: MapPin, color: "text-blue-400", bg: "bg-blue-500/5" },
                  { label: t("currency"), value: company.currency || "SAR", icon: Coins, color: "text-amber-400", bg: "bg-amber-500/5" },
                  { label: t("setupDate"), value: company.created_at ? new Date(company.created_at).toLocaleDateString('en-GB') : "-", icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/5" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all duration-500">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-xl", item.bg)}>
                        <item.icon size={18} className={item.color} />
                      </div>
                      <span className="text-xs font-bold text-slate-400">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-white">{item.value}</span>
                  </div>
                ))}

                <div className="p-6 rounded-[2.5rem] bg-black/60 border border-white/10 space-y-4 relative overflow-hidden group/key">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/key:scale-110 transition-transform">
                    <Key size={48} className="text-white" />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t("systemKey")}</label>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-[9px] text-slate-400 font-black tracking-widest border border-white/5">READ ONLY</span>
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-2.5 rounded-xl bg-white/5">
                      <Key size={16} className="text-slate-500" />
                    </div>
                    <code className="text-xs font-mono text-blue-400/80 truncate font-black">{company.access_token || "N/A"}</code>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats / Info */}
            <div className="space-y-10 pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-pink-500/10 border border-pink-500/20">
                  <Zap size={24} className="text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight">{t("otherOptions")}</h3>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Enhanced Features</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: t("autoBackup"), icon: Database, color: "text-slate-500" },
                  { label: t("notifications"), icon: Bell, color: "text-slate-500" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 opacity-40 grayscale group cursor-not-allowed">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-slate-500/5">
                        <item.icon size={18} className={item.color} />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{item.label}</span>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-slate-800 p-1 relative">
                      <div className="w-4 h-4 rounded-full bg-slate-700" />
                    </div>
                  </div>
                ))}

                <div className="relative mt-8 p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 group overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                    <Sparkles size={120} className="text-white" />
                  </div>
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="p-3 w-fit rounded-2xl bg-blue-500/20 border border-blue-500/30">
                      <Zap size={24} className="text-blue-400" />
                    </div>
                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Evolution v2.1</p>
                    <p className="text-sm font-bold text-white/70 leading-relaxed">
                      AI-driven financial auditing and automated reconciliation are coming soon to your workspace.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}

const Sparkles = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);
