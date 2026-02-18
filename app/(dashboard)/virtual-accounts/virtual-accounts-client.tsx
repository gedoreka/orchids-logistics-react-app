"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  Plus,
  Search,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Save,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Building2,
  Users,
  TrendingUp,
  Shield,
  Key,
  FileText,
  Download,
  Filter,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Hash,
  Globe,
  Zap,
  Info,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit3,
  Activity,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface VirtualAccount {
  id: number;
  company_id: number;
  account_name: string;
  account_name_en: string | null;
  viban: string | null;
  reference_id: string | null;
  master_iban: string;
  status: "active" | "inactive" | "pending";
  total_received: number;
  transactions_count: number;
  notes: string | null;
  anb_response: any;
  created_at: string;
  updated_at: string;
}

interface VibanSettings {
  id: number;
  company_id: number;
  master_iban: string;
  client_id: string;
  client_secret_masked: string;
  api_base_url: string;
  is_sandbox: number;
  is_active: number;
  auto_reconcile: number;
}

interface Transaction {
  id: number;
  amount: number;
  currency: string;
  sender_name: string;
  narrative: string;
  transaction_date: string;
  account_name?: string;
}

interface Stats {
  totalAccounts: number;
  activeAccounts: number;
  pendingAccounts: number;
  totalReceived: number;
  recentTransactions: Transaction[];
  topAccounts: VirtualAccount[];
}

interface Props {
  companyId: number;
  settings: VibanSettings | null;
  accounts: VirtualAccount[];
  stats: Stats;
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */
type Tab = "overview" | "accounts" | "transactions" | "settings";

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "نظرة عامة", icon: BarChart3 },
  { key: "accounts", label: "الحسابات الافتراضية", icon: CreditCard },
  { key: "transactions", label: "الحركات المالية", icon: Activity },
  { key: "settings", label: "الإعدادات والربط", icon: Settings },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function VirtualAccountsClient({ companyId, settings: initialSettings, accounts: initialAccounts, stats: initialStats }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [accounts, setAccounts] = useState<VirtualAccount[]>(initialAccounts);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [settings, setSettings] = useState<VibanSettings | null>(initialSettings);
  const [loading, setLoading] = useState(false);

  /* ---- Settings form ---- */
  const [settingsForm, setSettingsForm] = useState({
    master_iban: settings?.master_iban || "",
    client_id: settings?.client_id || "",
    client_secret: "",
    api_base_url: settings?.api_base_url || "https://api.anb.com.sa",
    is_sandbox: settings?.is_sandbox ?? 1,
    auto_reconcile: settings?.auto_reconcile ?? 1,
  });
  const [showSecret, setShowSecret] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  /* ---- New account modal ---- */
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({
    account_name: "",
    account_name_en: "",
    notes: "",
  });
  const [creatingAccount, setCreatingAccount] = useState(false);

  /* ---- Search & filter ---- */
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "pending">("all");

  /* ---- Helpers ---- */
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR" }).format(amount);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Intl.DateTimeFormat("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(dateStr));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ");
  };

  const statusConfig = {
    active: { label: "نشط", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    inactive: { label: "غير نشط", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
    pending: { label: "قيد المراجعة", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  };

  /* ---- Save settings ---- */
  const handleSaveSettings = async () => {
    if (!settingsForm.master_iban || !settingsForm.client_id) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setSavingSettings(true);
    try {
      const res = await fetch("/api/anb-viban/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settingsForm, company_id: companyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || settings);
        toast.success("تم حفظ الإعدادات بنجاح");
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل في الحفظ");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setSavingSettings(false);
    }
  };

  /* ---- Create account ---- */
  const handleCreateAccount = async () => {
    if (!newAccountForm.account_name) {
      toast.error("يرجى إدخال اسم الحساب");
      return;
    }
    setCreatingAccount(true);
    try {
      const res = await fetch("/api/anb-viban/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAccountForm, company_id: companyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts((prev) => [data.account, ...prev]);
        setStats((prev) => ({
          ...prev,
          totalAccounts: prev.totalAccounts + 1,
          pendingAccounts: prev.pendingAccounts + 1,
        }));
        setNewAccountForm({ account_name: "", account_name_en: "", notes: "" });
        setShowNewAccount(false);
        toast.success("تم إنشاء الحساب بنجاح");
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل في إنشاء الحساب");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setCreatingAccount(false);
    }
  };

  /* ---- Filtered accounts ---- */
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      !searchQuery ||
      acc.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.viban?.includes(searchQuery) ||
      acc.reference_id?.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */
  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto">
      {/* ── Header ── */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000" />
        <div className="relative bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl overflow-hidden border border-white/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 via-cyan-500 to-emerald-500 bg-[length:200%_100%] animate-[gradient-x_3s_ease_infinite]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />

          <div className="relative z-10 space-y-4 text-center">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest">
              <Landmark className="w-4 h-4 text-emerald-400" />
              البنك العربي الوطني - ANB
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              الحسابات الافتراضية (VIBAN)
            </h1>
            <p className="text-sm text-white/50 max-w-xl mx-auto">
              نظام إدارة الآيبان الافتراضي لإنشاء حسابات فرعية لعملائك مع تتبع التحويلات والمطابقة التلقائية
            </p>

            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {[
                { label: "إجمالي الحسابات", value: stats.totalAccounts, icon: CreditCard, color: "indigo" },
                { label: "حسابات نشطة", value: stats.activeAccounts, icon: CheckCircle, color: "emerald" },
                { label: "قيد المراجعة", value: stats.pendingAccounts, icon: Clock, color: "amber" },
                { label: "إجمالي المحصّل", value: formatCurrency(stats.totalReceived), icon: Wallet, color: "cyan" },
              ].map((s) => (
                <div key={s.label} className={`bg-${s.color}-500/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-${s.color}-500/20 flex items-center gap-3`}>
                  <div className={`w-9 h-9 rounded-xl bg-${s.color}-500/20 flex items-center justify-center text-${s.color}-400`}>
                    <s.icon size={18} />
                  </div>
                  <div className="text-right">
                    <span className={`block text-${s.color}-400/50 text-[10px] font-black uppercase tracking-widest`}>{s.label}</span>
                    <span className={`text-lg font-black text-${s.color}-100`}>{s.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 p-1.5 shadow-lg flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300",
              activeTab === tab.key
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && <OverviewTab key="overview" stats={stats} accounts={accounts} formatCurrency={formatCurrency} formatDate={formatDate} statusConfig={statusConfig} />}
        {activeTab === "accounts" && (
          <AccountsTab
            key="accounts"
            filteredAccounts={filteredAccounts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            showNewAccount={showNewAccount}
            setShowNewAccount={setShowNewAccount}
            newAccountForm={newAccountForm}
            setNewAccountForm={setNewAccountForm}
            handleCreateAccount={handleCreateAccount}
            creatingAccount={creatingAccount}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            copyToClipboard={copyToClipboard}
            statusConfig={statusConfig}
            settings={settings}
          />
        )}
        {activeTab === "transactions" && <TransactionsTab key="transactions" stats={stats} formatCurrency={formatCurrency} formatDate={formatDate} />}
        {activeTab === "settings" && (
          <SettingsTab
            key="settings"
            settingsForm={settingsForm}
            setSettingsForm={setSettingsForm}
            showSecret={showSecret}
            setShowSecret={setShowSecret}
            handleSaveSettings={handleSaveSettings}
            savingSettings={savingSettings}
            settings={settings}
          />
        )}
      </AnimatePresence>

      {/* ── Animated gradient keyframe ── */}
      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

/* ================================================================== */
/*  OVERVIEW TAB                                                       */
/* ================================================================== */
function OverviewTab({ stats, accounts, formatCurrency, formatDate, statusConfig }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* How it works */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Info size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">كيف يعمل نظام VIBAN؟</h2>
            <p className="text-xs text-slate-500">الآيبان الافتراضي من البنك العربي الوطني</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { step: "1", title: "إنشاء حساب افتراضي", desc: "أنشئ حساب فرعي باسم عميلك وسيتم تعيين رقم آيبان فريد له", icon: Plus, color: "emerald" },
            { step: "2", title: "مشاركة الآيبان", desc: "شارك رقم الآيبان الافتراضي مع العميل ليقوم بالتحويل عليه", icon: Globe, color: "blue" },
            { step: "3", title: "استلام التحويلات", desc: "التحويلات تصل لحسابك الرئيسي مع تحديد المصدر تلقائياً", icon: ArrowDownLeft, color: "cyan" },
            { step: "4", title: "المطابقة التلقائية", desc: "النظام يحدد تلقائياً أي عميل حوّل المبلغ ويسجله في السجلات", icon: CheckCircle, color: "teal" },
          ].map((item) => (
            <div key={item.step} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl bg-${item.color}-100 flex items-center justify-center mb-3`}>
                <item.icon size={20} className={`text-${item.color}-600`} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-6 h-6 rounded-full bg-${item.color}-500 text-white text-xs font-black flex items-center justify-center`}>{item.step}</span>
                <h3 className="font-bold text-slate-800 text-sm">{item.title}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
            <Activity size={22} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">آخر الحركات المالية</h2>
            <span className="text-xs text-slate-500">آخر 5 تحويلات واردة</span>
          </div>
        </div>

        {stats.recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {stats.recentTransactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <ArrowDownLeft size={18} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{tx.sender_name || tx.account_name || "تحويل وارد"}</p>
                  <p className="text-xs text-slate-400">{formatDate(tx.transaction_date)}</p>
                </div>
                <span className="font-black text-emerald-600">{formatCurrency(tx.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <Activity size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold">لا توجد حركات مالية بعد</p>
            <p className="text-xs mt-1">ستظهر هنا عند استلام أول تحويل</p>
          </div>
        )}
      </div>

      {/* Top accounts */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
            <TrendingUp size={22} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">أكثر الحسابات تحصيلاً</h2>
            <span className="text-xs text-slate-500">ترتيب حسب المبالغ المحصّلة</span>
          </div>
        </div>

        {stats.topAccounts.length > 0 ? (
          <div className="space-y-3">
            {stats.topAccounts.map((acc: any, idx: number) => (
              <div key={acc.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{acc.account_name}</p>
                  <p className="text-xs text-slate-400 font-mono">{acc.viban || "بانتظار التعيين"}</p>
                </div>
                <div className="text-left">
                  <span className="font-black text-slate-800 block">{formatCurrency(acc.total_received || 0)}</span>
                  <span className="text-[10px] text-slate-400">{acc.transactions_count || 0} حركة</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold">لا توجد بيانات بعد</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  ACCOUNTS TAB                                                       */
/* ================================================================== */
function AccountsTab({
  filteredAccounts,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  showNewAccount,
  setShowNewAccount,
  newAccountForm,
  setNewAccountForm,
  handleCreateAccount,
  creatingAccount,
  formatCurrency,
  formatDate,
  copyToClipboard,
  statusConfig,
  settings,
}: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 p-4 shadow-lg flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو رقم الآيبان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="all">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="pending">قيد المراجعة</option>
          <option value="inactive">غير نشط</option>
        </select>

        <button
          onClick={() => setShowNewAccount(true)}
          disabled={!settings}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          حساب جديد
        </button>
      </div>

      {!settings && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-amber-800 text-sm">يجب إعداد الربط أولاً</p>
            <p className="text-xs text-amber-600 mt-1">انتقل لتبويب &quot;الإعدادات والربط&quot; لإدخال بيانات اعتماد ANB API قبل إنشاء حسابات افتراضية.</p>
          </div>
        </div>
      )}

      {/* Accounts list */}
      {filteredAccounts.length > 0 ? (
        <div className="grid gap-4">
          {filteredAccounts.map((acc: VirtualAccount) => {
            const status = statusConfig[acc.status];
            return (
              <div key={acc.id} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 p-5 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white flex-shrink-0">
                    <CreditCard size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-slate-800 text-lg">{acc.account_name}</h3>
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5", status.color)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                        {status.label}
                      </span>
                    </div>
                    {acc.account_name_en && <p className="text-xs text-slate-400 mb-2">{acc.account_name_en}</p>}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">رقم الآيبان الافتراضي</span>
                        {acc.viban ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-700 truncate">{acc.viban}</span>
                            <button onClick={() => copyToClipboard(acc.viban!)} className="p-1 hover:bg-slate-200 rounded transition-colors flex-shrink-0">
                              <Copy size={12} className="text-slate-400" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-500 font-bold">بانتظار التعيين من ANB</span>
                        )}
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">المرجع الداخلي</span>
                        <span className="font-mono text-xs font-bold text-slate-700">{acc.reference_id || "-"}</span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">إجمالي المحصّل</span>
                        <span className="font-bold text-emerald-600 text-sm">{formatCurrency(acc.total_received || 0)}</span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3">
                        <span className="text-[10px] text-slate-400 font-bold block mb-1">تاريخ الإنشاء</span>
                        <span className="text-xs text-slate-600">{formatDate(acc.created_at)}</span>
                      </div>
                    </div>

                    {acc.notes && (
                      <p className="text-xs text-slate-400 mt-3 bg-slate-50 rounded-lg p-2 border border-slate-100">{acc.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-12 text-center shadow-lg">
          <CreditCard size={56} className="mx-auto mb-4 text-slate-300" />
          <h3 className="font-black text-slate-600 text-lg mb-2">
            {searchQuery || statusFilter !== "all" ? "لا توجد نتائج مطابقة" : "لا توجد حسابات افتراضية بعد"}
          </h3>
          <p className="text-sm text-slate-400">
            {searchQuery || statusFilter !== "all" ? "جرب تغيير معايير البحث" : "أنشئ أول حساب افتراضي لعملائك"}
          </p>
        </div>
      )}

      {/* New Account Modal */}
      <AnimatePresence>
        {showNewAccount && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowNewAccount(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e: React.MouseEvent) => e.stopPropagation()} className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <Plus size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">حساب افتراضي جديد</h3>
                    <p className="text-xs text-slate-500">إنشاء آيبان افتراضي جديد لعميل</p>
                  </div>
                </div>
                <button onClick={() => setShowNewAccount(false)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">اسم الحساب / العميل (عربي) *</label>
                  <input
                    type="text"
                    value={newAccountForm.account_name}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, account_name: e.target.value })}
                    placeholder="مثال: شركة الأمل للتجارة"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">اسم الحساب (إنجليزي)</label>
                  <input
                    type="text"
                    value={newAccountForm.account_name_en}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, account_name_en: e.target.value })}
                    placeholder="Example: Al Amal Trading Co."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ملاحظات</label>
                  <textarea
                    value={newAccountForm.notes}
                    onChange={(e) => setNewAccountForm({ ...newAccountForm, notes: e.target.value })}
                    placeholder="ملاحظات اختيارية..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowNewAccount(false)} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                  إلغاء
                </button>
                <button onClick={handleCreateAccount} disabled={creatingAccount || !newAccountForm.account_name} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                  {creatingAccount ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                  {creatingAccount ? "جاري الإنشاء..." : "إنشاء الحساب"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ================================================================== */
/*  TRANSACTIONS TAB                                                   */
/* ================================================================== */
function TransactionsTab({ stats, formatCurrency, formatDate }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
              <Activity size={22} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">سجل الحركات المالية</h2>
              <span className="text-xs text-slate-500">جميع التحويلات الواردة على الحسابات الافتراضية</span>
            </div>
          </div>
        </div>

        {stats.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-wider">التاريخ</th>
                  <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-wider">الحساب</th>
                  <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-wider">المحوّل</th>
                  <th className="text-right py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-wider">الوصف</th>
                  <th className="text-left py-3 px-4 text-xs font-black text-slate-500 uppercase tracking-wider">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-xs text-slate-600">{formatDate(tx.transaction_date)}</td>
                    <td className="py-3 px-4 text-sm font-bold text-slate-800">{tx.account_name || "-"}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{tx.sender_name || "-"}</td>
                    <td className="py-3 px-4 text-xs text-slate-400 max-w-[200px] truncate">{tx.narrative || "-"}</td>
                    <td className="py-3 px-4 text-sm font-black text-emerald-600">{formatCurrency(tx.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Activity size={56} className="mx-auto mb-4 opacity-30" />
            <h3 className="font-black text-lg mb-2">لا توجد حركات مالية</h3>
            <p className="text-sm">سيتم عرض التحويلات الواردة هنا تلقائياً عند ربط الخدمة مع ANB</p>
          </div>
        )}
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
        <Info size={20} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-bold text-blue-800 text-sm">كيف يتم تسجيل الحركات؟</p>
          <p className="text-xs text-blue-600 mt-1">
            عند ربط API البنك العربي الوطني، يقوم النظام بسحب كشف الحساب الرئيسي بشكل دوري ومطابقة كل تحويل
            وارد مع الحساب الافتراضي المناسب عبر قراءة آخر 15 رقم من الآيبان في حقل narrative2.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================================================== */
/*  SETTINGS TAB                                                       */
/* ================================================================== */
function SettingsTab({ settingsForm, setSettingsForm, showSecret, setShowSecret, handleSaveSettings, savingSettings, settings }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      {/* Connection status */}
      <div className={cn("rounded-2xl p-5 flex items-center gap-4 border", settings?.is_active ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200")}>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", settings?.is_active ? "bg-emerald-100" : "bg-amber-100")}>
          {settings?.is_active ? <CheckCircle size={24} className="text-emerald-600" /> : <AlertCircle size={24} className="text-amber-600" />}
        </div>
        <div>
          <p className={cn("font-black text-sm", settings?.is_active ? "text-emerald-800" : "text-amber-800")}>
            {settings?.is_active ? "الربط نشط ويعمل" : "لم يتم الربط بعد"}
          </p>
          <p className={cn("text-xs", settings?.is_active ? "text-emerald-600" : "text-amber-600")}>
            {settings?.is_active ? "تم الربط مع خدمة VIBAN من ANB بنجاح" : "أدخل بيانات الاعتماد من بوابة مطوري ANB لتفعيل الخدمة"}
          </p>
        </div>
      </div>

      {/* API credentials form */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center">
            <Key size={22} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">بيانات اعتماد ANB API</h2>
            <span className="text-xs text-slate-500">بيانات الربط مع بوابة المطورين connect.anb.com.sa</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Hash size={14} className="text-slate-400" />
                رقم الآيبان الرئيسي (Master IBAN) *
              </span>
            </label>
            <input
              type="text"
              value={settingsForm.master_iban}
              onChange={(e) => setSettingsForm({ ...settingsForm, master_iban: e.target.value })}
              placeholder="SA0000000000000000000000"
              dir="ltr"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
            />
            <p className="text-[10px] text-slate-400 mt-1">رقم الآيبان الرئيسي لحسابك في البنك العربي الوطني</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Key size={14} className="text-slate-400" />
                Client ID *
              </span>
            </label>
            <input
              type="text"
              value={settingsForm.client_id}
              onChange={(e) => setSettingsForm({ ...settingsForm, client_id: e.target.value })}
              placeholder="أدخل Client ID من ANB"
              dir="ltr"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Shield size={14} className="text-slate-400" />
                Client Secret *
              </span>
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={settingsForm.client_secret}
                onChange={(e) => setSettingsForm({ ...settingsForm, client_secret: e.target.value })}
                placeholder={settings ? "اتركه فارغاً إذا لم يتغير" : "أدخل Client Secret"}
                dir="ltr"
                className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
              />
              <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Globe size={14} className="text-slate-400" />
                API Base URL
              </span>
            </label>
            <input
              type="text"
              value={settingsForm.api_base_url}
              onChange={(e) => setSettingsForm({ ...settingsForm, api_base_url: e.target.value })}
              placeholder="https://api.anb.com.sa"
              dir="ltr"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="grid md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-700 text-sm">وضع الاختبار (Sandbox)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">استخدم بيئة الاختبار بدلاً من الإنتاج</p>
            </div>
            <button
              type="button"
              onClick={() => setSettingsForm({ ...settingsForm, is_sandbox: settingsForm.is_sandbox ? 0 : 1 })}
              className={cn("w-12 h-7 rounded-full transition-all duration-300 relative", settingsForm.is_sandbox ? "bg-emerald-500" : "bg-slate-300")}
            >
              <div className={cn("absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300", settingsForm.is_sandbox ? "right-1" : "left-1")} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <p className="font-bold text-slate-700 text-sm">المطابقة التلقائية</p>
              <p className="text-[10px] text-slate-400 mt-0.5">مطابقة التحويلات الواردة تلقائياً مع الحسابات</p>
            </div>
            <button
              type="button"
              onClick={() => setSettingsForm({ ...settingsForm, auto_reconcile: settingsForm.auto_reconcile ? 0 : 1 })}
              className={cn("w-12 h-7 rounded-full transition-all duration-300 relative", settingsForm.auto_reconcile ? "bg-emerald-500" : "bg-slate-300")}
            >
              <div className={cn("absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300", settingsForm.auto_reconcile ? "right-1" : "left-1")} />
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-10 py-3.5 rounded-full font-black text-sm shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all disabled:opacity-50"
          >
            {savingSettings ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
            {savingSettings ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </button>
        </div>
      </div>

      {/* API Documentation Reference */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
            <FileText size={22} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">مرجع API المستخدم</h2>
            <span className="text-xs text-slate-500">نقاط الاتصال المستخدمة من ANB Connect</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { method: "POST", endpoint: "/auth/token", desc: "المصادقة والحصول على رمز الوصول (OAuth 2.0)", color: "emerald" },
            { method: "POST", endpoint: "/virtual-iban-management/create", desc: "إنشاء آيبان افتراضي جديد", color: "blue" },
            { method: "GET", endpoint: "/virtual-iban-management/list", desc: "عرض قائمة الآيبانات الافتراضية", color: "purple" },
            { method: "GET", endpoint: "/account-statement/general-statement", desc: "كشف حساب للمطابقة التلقائية", color: "amber" },
            { method: "PUT", endpoint: "/virtual-iban-management/update", desc: "تحديث بيانات آيبان افتراضي", color: "cyan" },
            { method: "DELETE", endpoint: "/virtual-iban-management/deactivate", desc: "تعطيل آيبان افتراضي", color: "red" },
          ].map((api) => (
            <div key={api.endpoint} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-colors">
              <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black text-white min-w-[55px] text-center", api.method === "GET" ? "bg-blue-500" : api.method === "POST" ? "bg-emerald-500" : api.method === "PUT" ? "bg-amber-500" : "bg-red-500")}>
                {api.method}
              </span>
              <code className="text-xs font-mono text-slate-700 flex-1" dir="ltr">{api.endpoint}</code>
              <span className="text-xs text-slate-400">{api.desc}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-xs text-indigo-700 font-bold flex items-center gap-2">
            <Globe size={14} />
            بوابة المطورين:
            <a href="https://connect.anb.com.sa/apis" target="_blank" rel="noopener noreferrer" className="text-indigo-500 underline hover:text-indigo-700">
              connect.anb.com.sa/apis
            </a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
