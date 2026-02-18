"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { 
    Lock, 
    ShieldCheck, 
    Settings, 
    Globe, 
    Database, 
    Bell, 
    AlertCircle,
    RefreshCw,
    Info,
    Calendar,
    MapPin,
    Coins,
    Shield,
    LayoutGrid,
    Key,
    Zap,
    Landmark,
    Save,
    Eye,
    EyeOff,
    CheckCircle,
    Loader2
  } from "lucide-react";
import { ThemeCustomizer } from "@/components/theme-customizer";
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

    // ANB Bank settings state
    const [anbCorporateId, setAnbCorporateId] = useState("");
    const [anbApiUrl, setAnbApiUrl] = useState("");
    const [anbCertificate, setAnbCertificate] = useState("");
    const [anbPrivateKey, setAnbPrivateKey] = useState("");
    const [anbSaving, setAnbSaving] = useState(false);
    const [anbLoading, setAnbLoading] = useState(true);
    const [anbSaved, setAnbSaved] = useState(false);
    const [showAnbKey, setShowAnbKey] = useState(false);

    // Load ANB credentials on mount
    useEffect(() => {
      const loadAnbCredentials = async () => {
        try {
          const res = await fetch(`/api/anb-payroll/credentials?company_id=${companyId}`);
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setAnbCorporateId(data.corporate_id || "");
              setAnbApiUrl(data.api_url || "");
              setAnbCertificate(data.certificate ? "****" : "");
              setAnbPrivateKey(data.private_key ? "****" : "");
              setAnbSaved(true);
            }
          }
        } catch (err) {
          console.error("Error loading ANB credentials:", err);
        } finally {
          setAnbLoading(false);
        }
      };
      loadAnbCredentials();
    }, [companyId]);

    const handleSaveAnbCredentials = async () => {
      if (!anbCorporateId.trim()) {
        toast.error("يرجى إدخال معرف الشركة");
        return;
      }
      setAnbSaving(true);
      try {
        const body: any = {
          company_id: companyId,
          corporate_id: anbCorporateId,
          api_url: anbApiUrl || null,
        };
        if (anbCertificate && anbCertificate !== "****") body.certificate = anbCertificate;
        if (anbPrivateKey && anbPrivateKey !== "****") body.private_key = anbPrivateKey;

        const res = await fetch("/api/anb-payroll/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Failed to save");
        toast.success("تم حفظ بيانات بنك ANB بنجاح");
        setAnbSaved(true);
      } catch (err) {
        toast.error("فشل حفظ بيانات بنك ANB");
      } finally {
        setAnbSaving(false);
      }
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

    return (
    <div className="w-[90%] mx-auto space-y-8 pb-20">
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

              {/* 2. Theme Customization Section */}
              <ThemeCustomizer />
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
                  { label: t("setupDate"), value: company.created_at ? new Date(company.created_at).toLocaleDateString( 'en-US' ) : "-", icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10" },
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

            {/* ANB Bank Settings */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <Landmark className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">إعدادات بنك ANB</h3>
                <p className="text-white/50 text-xs">بيانات الربط مع البنك العربي الوطني لتحويل الرواتب</p>
              </div>
              {anbSaved && (
                  <div className="ms-auto flex items-center gap-1 text-green-400 text-xs">
                  <CheckCircle className="w-4 h-4" />
                  <span>متصل</span>
                </div>
              )}
            </div>

            {anbLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1.5">معرف الشركة (Corporate ID) *</label>
                    <input
                      type="text"
                      value={anbCorporateId}
                      onChange={(e) => setAnbCorporateId(e.target.value)}
                      placeholder="أدخل معرف الشركة"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:border-green-500/50 focus:outline-none transition-all text-sm"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1.5">رابط API البنك</label>
                    <input
                      type="text"
                      value={anbApiUrl}
                      onChange={(e) => setAnbApiUrl(e.target.value)}
                      placeholder="https://api.anb.com.sa/wps/v1"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:border-green-500/50 focus:outline-none transition-all text-sm"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1.5">شهادة mTLS (Certificate PEM)</label>
                  <textarea
                    value={anbCertificate}
                    onChange={(e) => setAnbCertificate(e.target.value)}
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:border-green-500/50 focus:outline-none transition-all text-sm font-mono"
                    dir="ltr"
                  />
                </div>

                <div className="relative">
                  <label className="block text-white/70 text-sm mb-1.5">المفتاح الخاص (Private Key PEM)</label>
                  <textarea
                    value={anbPrivateKey}
                    onChange={(e) => setAnbPrivateKey(e.target.value)}
                    placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                    rows={3}
                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:border-green-500/50 focus:outline-none transition-all text-sm font-mono ${!showAnbKey ? 'blur-sm select-none' : ''}`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnbKey(!showAnbKey)}
                    className="absolute top-8 left-3 text-white/50 hover:text-white transition-colors"
                  >
                    {showAnbKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={handleSaveAnbCredentials}
                  disabled={anbSaving || !anbCorporateId.trim()}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl transition-all text-sm font-medium"
                >
                  {anbSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  حفظ بيانات ANB
                </button>
              </div>
            )}
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
