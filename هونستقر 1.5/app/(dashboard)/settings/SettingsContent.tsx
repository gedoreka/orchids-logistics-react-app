"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "@/lib/locale-context";
import {
  Lock, ShieldCheck, Settings, Globe, Database, Bell, AlertCircle,
  RefreshCw, Info, Calendar, MapPin, Coins, Shield, LayoutGrid,
  Key, Zap, Landmark, Save, Eye, EyeOff, CheckCircle, Loader2,
  Building2, Hash, CreditCard, Link2, FileKey, Server, Languages,
  ChevronRight, Wifi, WifiOff, Clock, User, Mail, Phone, ArrowRight
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
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-xl", className)}>
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, subtitle, gradient = "from-blue-500 to-indigo-600", badge }: {
  icon: React.ReactNode; title: string; subtitle?: string; gradient?: string; badge?: React.ReactNode;
}) {
  return (
    <div className={cn("px-7 py-5 border-b border-white/5 flex items-center gap-4 bg-gradient-to-r to-transparent from-white/5")}>
      <div className={cn("p-3 bg-gradient-to-br rounded-2xl text-white shadow-lg shrink-0", gradient)}>
        {icon}
      </div>
      <div className="flex-1">
        <h2 className="text-base font-black text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-white/40 mt-0.5 font-medium">{subtitle}</p>}
      </div>
      {badge}
    </div>
  );
}

function SettingInput({ label, type = "text", value, onChange, placeholder, icon, disabled, dir }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-white/50 uppercase tracking-widest px-1">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/50 transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange ? (e: any) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          disabled={disabled}
          dir={dir}
          className={cn(
            "w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-medium",
            "focus:border-blue-500/40 focus:bg-white/8 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all",
            "placeholder:text-white/20",
            icon && "pr-11",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon, color = "text-blue-400", bg = "bg-blue-500/10" }: any) {
  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/8 transition-all group">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-xl", bg)}>
          {icon}
        </div>
        <span className="text-xs font-bold text-white/50">{label}</span>
      </div>
      <span className={cn("text-sm font-black", color)}>{value || "—"}</span>
    </div>
  );
}

export function SettingsContent({ company, taxSettings, userEmail, companyId }: SettingsContentProps) {
  const t = useTranslations("systemSettings");
  const commonT = useTranslations("common");
  const { locale, isRTL: isRtl, setLocale } = useLocale();

  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // ANB Bank state
  const [anbCorporateId, setAnbCorporateId] = useState("");
  const [anbApiUrl, setAnbApiUrl] = useState("");
  const [anbCertificate, setAnbCertificate] = useState("");
  const [anbPrivateKey, setAnbPrivateKey] = useState("");
  const [anbSaving, setAnbSaving] = useState(false);
  const [anbLoading, setAnbLoading] = useState(true);
  const [anbSaved, setAnbSaved] = useState(false);
  const [showAnbKey, setShowAnbKey] = useState(false);
  const [showAnbCert, setShowAnbCert] = useState(false);

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
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(t("passwordChangedSuccess"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || commonT("error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Outer luxury wrapper */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 rounded-[3rem] shadow-2xl border border-slate-500/30 overflow-hidden">
        {/* Rainbow bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 via-emerald-500 to-blue-500" />

        <div className="p-6 md:p-10 space-y-6">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/40 mb-3">
                <a href="/dashboard" className="hover:text-blue-400 transition-colors">لوحة التحكم</a>
                <ArrowRight size={12} className={`${isRtl ? 'rotate-180' : ''} text-white/30`} />
                <span className="text-blue-400">إعدادات النظام</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-[1.1rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                  <Settings size={28} strokeWidth={2.5} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{t("title")}</h1>
                  <p className="text-sm text-white/40 font-medium mt-0.5">إدارة الأمان والتكاملات وإعدادات النظام</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black text-white/70">v2.0.4</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-500/20 border border-blue-500/30">
                <Clock size={14} className="text-blue-400" />
                <span className="text-xs font-black text-blue-300">
                  {new Date().toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── Row 1: Security + System Info ── */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

            {/* Security – col-span-3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="xl:col-span-3"
            >
              <SectionCard>
                <SectionHeader
                  icon={<Lock size={18} />}
                  title="الأمان والحماية"
                  subtitle="تغيير كلمة المرور وبيانات الحساب"
                  gradient="from-blue-500 to-indigo-600"
                />
                <div className="p-6 space-y-5">
                  {/* Email display */}
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/8">
                    <div className="p-2 rounded-xl bg-blue-500/10">
                      <Mail size={15} className="text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-wider mb-0.5">{t("email")}</p>
                      <p className="text-sm font-black text-white/80 dir-ltr">{userEmail}</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/20">
                      <Shield size={11} className="text-emerald-400" />
                      <span className="text-[10px] font-black text-emerald-400">محمي</span>
                    </div>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    {/* Current password */}
                    <SettingInput
                      label={t("currentPassword")}
                      type="password"
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      placeholder="••••••••"
                      icon={<Lock size={15} />}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* New password */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/50 uppercase tracking-widest px-1">{t("newPassword")}</label>
                        <div className="relative">
                          <input
                            type={showNewPwd ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-11 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            required
                          />
                          <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
                            {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm password */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/50 uppercase tracking-widest px-1">{t("confirmNewPassword")}</label>
                        <div className="relative">
                          <input
                            type={showConfirmPwd ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 pr-11 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-medium focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            required
                          />
                          <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
                            {showConfirmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Password strength indicator */}
                    {newPassword && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={cn("flex-1 h-1 rounded-full transition-all",
                              newPassword.length >= i * 3 ? (i <= 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-white/10"
                            )} />
                          ))}
                        </div>
                        <p className="text-[10px] text-white/30 px-1">
                          {newPassword.length < 6 ? "ضعيفة" : newPassword.length < 10 ? "متوسطة" : "قوية"}
                        </p>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      {t("updatePassword")}
                    </motion.button>
                  </form>
                </div>
              </SectionCard>
            </motion.div>

            {/* System Info – col-span-2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="xl:col-span-2 space-y-5"
            >
              <SectionCard>
                <SectionHeader
                  icon={<LayoutGrid size={18} />}
                  title="معلومات النظام"
                  subtitle="بيانات المنشأة والإعدادات الأساسية"
                  gradient="from-purple-500 to-violet-600"
                />
                <div className="p-5 space-y-3">
                  <InfoRow
                    label="اسم المنشأة"
                    value={company.name}
                    icon={<Building2 size={13} className="text-blue-400" />}
                    bg="bg-blue-500/10"
                    color="text-white"
                  />
                  <InfoRow
                    label={t("region")}
                    value={company.region || company.country || "الرياض"}
                    icon={<MapPin size={13} className="text-emerald-400" />}
                    bg="bg-emerald-500/10"
                    color="text-white"
                  />
                  <InfoRow
                    label={t("currency")}
                    value={company.currency || "ريال سعودي (SAR)"}
                    icon={<Coins size={13} className="text-amber-400" />}
                    bg="bg-amber-500/10"
                    color="text-amber-300"
                  />
                  <InfoRow
                    label={t("setupDate")}
                    value={company.created_at ? new Date(company.created_at).toLocaleDateString('ar-SA') : "—"}
                    icon={<Calendar size={13} className="text-purple-400" />}
                    bg="bg-purple-500/10"
                    color="text-white"
                  />
                  <InfoRow
                    label="الإصدار"
                    value="v2.0.4 — Stable"
                    icon={<Server size={13} className="text-teal-400" />}
                    bg="bg-teal-500/10"
                    color="text-teal-300"
                  />

                  {/* System Key */}
                  <div className="mt-2 p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t("systemKey")}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-lg bg-white/5 text-white/30 font-black border border-white/5">PROTECTED</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key size={12} className="text-white/20 shrink-0" />
                      <code className="text-[10px] font-mono text-white/30 truncate">
                        {company.access_token ? `${company.access_token.substring(0, 24)}...` : "SYSTEM_SECURE_TOKEN"}
                      </code>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Language Settings */}
              <SectionCard>
                <SectionHeader
                  icon={<Languages size={18} />}
                  title="اللغة والمنطقة"
                  subtitle="تغيير لغة واجهة النظام"
                  gradient="from-teal-500 to-cyan-600"
                />
                <div className="p-5 space-y-3">
                  {[
                    { code: "ar", label: "العربية", sub: "Arabic — RTL", flag: "🇸🇦" },
                    { code: "en", label: "English", sub: "English — LTR", flag: "🇺🇸" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLocale(lang.code as "ar" | "en");
                        toast.success(lang.code === "ar" ? "تم تغيير اللغة إلى العربية" : "Language changed to English");
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                        locale === lang.code
                          ? "bg-teal-500/15 border-teal-500/40 shadow-lg shadow-teal-500/10"
                          : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8"
                      )}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="text-right flex-1">
                        <p className={cn("text-sm font-black", locale === lang.code ? "text-teal-300" : "text-white/80")}>{lang.label}</p>
                        <p className="text-[10px] text-white/30 font-medium">{lang.sub}</p>
                      </div>
                      {locale === lang.code && (
                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
                          <CheckCircle size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </SectionCard>
            </motion.div>
          </div>

          {/* ── Row 2: ANB Bank Integration (full width) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SectionCard>
              <SectionHeader
                icon={<Landmark size={18} />}
                title="إعدادات بنك ANB — البنك العربي الوطني"
                subtitle="بيانات الربط API لتحويل الرواتب عبر بنك ANB"
                gradient="from-emerald-500 to-teal-600"
                badge={
                  anbSaved ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-black text-emerald-400">متصل</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                      <WifiOff size={12} className="text-white/30" />
                      <span className="text-xs font-black text-white/30">غير مُهيأ</span>
                    </div>
                  )
                }
              />

              {anbLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-7 h-7 text-emerald-400 animate-spin" />
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Row 1: Basic info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <SettingInput
                      label="معرف الشركة (Corporate ID) *"
                      value={anbCorporateId}
                      onChange={setAnbCorporateId}
                      placeholder="أدخل معرف الشركة"
                      icon={<Hash size={15} />}
                      dir="ltr"
                    />
                    <SettingInput
                      label="رابط API البنك"
                      value={anbApiUrl}
                      onChange={setAnbApiUrl}
                      placeholder="https://api.anb.com.sa/wps/v1"
                      icon={<Link2 size={15} />}
                      dir="ltr"
                    />
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-white/50 uppercase tracking-widest px-1">حالة الاتصال</label>
                      <div className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border h-[48px]",
                        anbSaved ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/10"
                      )}>
                        {anbSaved ? (
                          <>
                            <Wifi size={16} className="text-emerald-400" />
                            <span className="text-sm font-black text-emerald-400">الاتصال نشط</span>
                          </>
                        ) : (
                          <>
                            <WifiOff size={16} className="text-white/30" />
                            <span className="text-sm font-black text-white/30">لم يتم الإعداد بعد</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Certificates */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {/* Certificate */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-black text-white/50 uppercase tracking-widest">شهادة mTLS (Certificate PEM)</label>
                        <button
                          type="button"
                          onClick={() => setShowAnbCert(!showAnbCert)}
                          className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                        >
                          {showAnbCert ? <EyeOff size={12} /> : <Eye size={12} />}
                          {showAnbCert ? "إخفاء" : "عرض"}
                        </button>
                      </div>
                      <div className="relative">
                        <FileKey size={14} className="absolute right-3 top-3.5 text-white/20" />
                        <textarea
                          value={anbCertificate}
                          onChange={(e) => setAnbCertificate(e.target.value)}
                          placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                          rows={4}
                          className={cn(
                            "w-full pr-9 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-mono",
                            "focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-white/15 resize-none",
                            !showAnbCert && anbCertificate && anbCertificate !== "****" ? "blur-sm" : ""
                          )}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Private Key */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-black text-white/50 uppercase tracking-widest">المفتاح الخاص (Private Key PEM)</label>
                        <button
                          type="button"
                          onClick={() => setShowAnbKey(!showAnbKey)}
                          className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                        >
                          {showAnbKey ? <EyeOff size={12} /> : <Eye size={12} />}
                          {showAnbKey ? "إخفاء" : "عرض"}
                        </button>
                      </div>
                      <div className="relative">
                        <Key size={14} className="absolute right-3 top-3.5 text-white/20" />
                        <textarea
                          value={anbPrivateKey}
                          onChange={(e) => setAnbPrivateKey(e.target.value)}
                          placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                          rows={4}
                          className={cn(
                            "w-full pr-9 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-mono",
                            "focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-white/15 resize-none",
                            !showAnbKey && anbPrivateKey && anbPrivateKey !== "****" ? "blur-sm" : ""
                          )}
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security notice + Save button */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2 border-t border-white/5">
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex-1">
                      <AlertCircle size={16} className="text-amber-400/70 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-400/60 font-medium leading-relaxed">
                        يتم تشفير جميع بيانات الاعتماد وتخزينها بأمان. لا تشارك مفتاحك الخاص مع أي طرف ثالث.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSaveAnbCredentials}
                      disabled={anbSaving || !anbCorporateId.trim()}
                      className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                    >
                      {anbSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      حفظ إعدادات ANB
                    </motion.button>
                  </div>
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* ── Row 3: Coming Features ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <SectionCard>
              <SectionHeader
                icon={<Zap size={18} />}
                title="خيارات قادمة — الإصدار v2.1"
                subtitle="ميزات مجدولة في التحديث القادم"
                gradient="from-violet-500 to-purple-600"
                badge={
                  <span className="text-[10px] px-3 py-1.5 rounded-xl bg-violet-500/15 border border-violet-500/25 text-violet-300 font-black">COMING SOON</span>
                }
              />
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    { icon: <Database size={20} />, label: "النسخ الاحتياطي التلقائي", desc: "جدولة نسخ احتياطية يومية أو أسبوعية", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/15" },
                    { icon: <Bell size={20} />, label: "الإشعارات والتنبيهات", desc: "إشعارات البريد والرسائل النصية", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/15" },
                    { icon: <Globe size={20} />, label: "التكاملات الخارجية", desc: "ربط مع أنظمة ERP وCRM خارجية", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/15" },
                    { icon: <Shield size={20} />, label: "المصادقة الثنائية 2FA", desc: "تأمين إضافي بالهاتف أو البريد", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/15" },
                  ].map((item, i) => (
                    <div key={i} className={cn("flex flex-col gap-3 p-5 rounded-2xl border opacity-50 grayscale cursor-not-allowed", item.bg, item.border)}>
                      <div className={cn("p-2.5 rounded-xl bg-white/5 w-fit", item.color)}>
                        {item.icon}
                      </div>
                      <div>
                        <p className={cn("text-sm font-black", item.color)}>{item.label}</p>
                        <p className="text-[10px] text-white/30 font-medium mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                  <Info size={16} className="text-blue-400/60 shrink-0" />
                  <p className="text-[11px] text-blue-400/50 font-bold">
                    هذه الميزات قيد التطوير وستكون متاحة في الإصدار 2.1 القادم. ترقبوا التحديثات!
                  </p>
                </div>
              </div>
            </SectionCard>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
