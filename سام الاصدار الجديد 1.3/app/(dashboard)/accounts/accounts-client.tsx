"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Filter,
  BarChart3,
  BookOpen,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Building2,
  Wallet,
  PiggyBank,
  Receipt,
  AlertCircle,
  Hash,
  FileText,
  RefreshCw,
  ChevronRight,
  Layers
} from "lucide-react";
import { toast } from "sonner";
import { Account } from "@/lib/types";
import { createAccount, updateAccount, deleteAccount } from "@/lib/actions/accounting";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/locale-context";

interface AccountsClientProps {
  initialAccounts: Account[];
  companyId: number;
}

  export function AccountsClient({ initialAccounts, companyId }: AccountsClientProps) {
    const t = useTranslations("accounts");
    const { locale, isRTL: isRtl } = useLocale();
    const router = useRouter();
    
    const [accounts, setAccounts] = useState(initialAccounts);

    useEffect(() => {
      setAccounts(initialAccounts);
    }, [initialAccounts]);

    const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const accountTypeConfig: Record<string, { color: string; bgColor: string; borderColor: string; icon: any; label: string }> = {
    "مصروف": { color: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200", icon: TrendingDown, label: t("types.expense") },
    "دخل": { color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", icon: TrendingUp, label: t("types.income") },
    "أصل": { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200", icon: Building2, label: t("types.asset") },
    "خصم": { color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200", icon: Receipt, label: t("types.liability") },
    "حقوق ملكية": { color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200", icon: PiggyBank, label: t("types.equity") },
  };

  const [formData, setFormData] = useState({
    account_code: "",
    account_name: "",
    type: "مصروف",
    parent_id: null as number | null,
    account_type: "sub" as "main" | "sub",
  });

  // Build tree structure
  const accountTree = useMemo(() => {
    const map: Record<number, any> = {};
    const roots: any[] = [];

    const sorted = [...accounts].sort((a, b) => a.account_code.localeCompare(b.account_code));

    sorted.forEach(acc => {
      map[acc.id] = { ...acc, children: [] };
    });

    sorted.forEach(acc => {
      if (acc.parent_id && map[acc.parent_id]) {
        map[acc.parent_id].children.push(map[acc.id]);
      } else {
        roots.push(map[acc.id]);
      }
    });

    return roots;
  }, [accounts]);

  // Flatten tree for rendering based on expanded state
  const flattenTree = (nodes: any[], level = 0): any[] => {
    const result: any[] = [];
    nodes.forEach(node => {
      if (searchTerm && !node.account_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !node.account_code.toLowerCase().includes(searchTerm.toLowerCase())) {
        // If searching and this node doesn't match, check children
        const childrenMatches = flattenTree(node.children, level + 1);
        if (childrenMatches.length > 0) {
          result.push({ ...node, level, hasMatches: true });
          result.push(...childrenMatches);
        }
      } else {
        result.push({ ...node, level });
        if (expandedRows[node.id] || searchTerm) {
          result.push(...flattenTree(node.children, level + 1));
        }
      }
    });
    return result;
  };

  const displayAccounts = useMemo(() => {
    if (searchTerm) {
      // Show all matches and their parents
      return flattenTree(accountTree);
    }
    return flattenTree(accountTree);
  }, [accountTree, expandedRows, searchTerm]);

  const stats = {
    total: accounts.length,
    expenses: accounts.filter(a => a.type === "مصروف").length,
    income: accounts.filter(a => a.type === "دخل").length,
  };

  const handleOpenModal = (account?: Account) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        account_code: account.account_code,
        account_name: account.account_name,
        type: account.type,
        parent_id: account.parent_id || null,
        account_type: account.account_type || "sub",
      });
    } else {
      setEditingAccount(null);
      setFormData({
        account_code: "",
        account_name: "",
        type: "مصروف",
        parent_id: null,
        account_type: "sub",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingAccount) {
        const result = await updateAccount(editingAccount.id, formData);
          if (result.success) {
            toast.success(t("updateSuccess"));
            // Optimistic update
            setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, ...formData } : a));
            setIsModalOpen(false);
            router.refresh();
          } else {
            toast.error(result.error || t("updateError"));
          }
        } else {
          const result = await createAccount({ ...formData, company_id: companyId });
          if (result.success) {
            toast.success(t("addSuccess"));
            setIsModalOpen(false);
            router.refresh();
          } else {
            toast.error(result.error || t("addError"));
          }
        }

    } catch {
      toast.error(t("unexpectedError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteAccount(id);
        if (result.success) {
          toast.success(t("deleteSuccess"));
          setAccounts(prev => prev.filter(a => a.id !== id));
          setDeleteConfirm(null);
          router.refresh();
        } else {

        toast.error(result.error || t("deleteError"));
      }
    } catch {
      toast.error(t("unexpectedError"));
    }
  };

  const handleSeed = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    try {
      const response = await fetch("/api/accounts/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || "تم تهيئة شجرة الحسابات بنجاح");
        router.refresh();
      } else {
        toast.error(data.error || "فشل تهيئة شجرة الحسابات");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تهيئة البيانات");
    } finally {
      setIsSeeding(false);
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full max-w-[98%] mx-auto px-6 py-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="bg-[#1a2234] rounded-[30px] p-8 shadow-2xl border border-white/5 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-4 bg-white/10 rounded-[2rem] backdrop-blur-md border border-white/10 shadow-2xl">
              <BookOpen className="w-10 h-10 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                {t("title") || "شجرة الحسابات"}
              </h1>
              <p className="text-slate-300 max-w-2xl font-medium">
                {t("subtitle") || "إدارة وتنظيم كافة الحسابات المالية للمنشأة بشكل شجري"}
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className={cn("bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-xl flex items-center space-x-4 group hover:border-blue-200 transition-all hover:shadow-2xl hover:-translate-y-1", isRtl ? "space-x-reverse" : "space-x")}>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl text-white shadow-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-black mb-1">{t("totalAccounts")}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.total}</p>
            </div>
          </div>
          <div className={cn("bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-xl flex items-center space-x-4 group hover:border-rose-200 transition-all hover:shadow-2xl hover:-translate-y-1", isRtl ? "space-x-reverse" : "space-x")}>
            <div className="p-4 bg-gradient-to-br from-rose-500 to-rose-700 rounded-2xl text-white shadow-lg">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-black mb-1">{t("expenseAccounts")}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.expenses}</p>
            </div>
          </div>
          <div className={cn("bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-xl flex items-center space-x-4 group hover:border-emerald-200 transition-all hover:shadow-2xl hover:-translate-y-1", isRtl ? "space-x-reverse" : "space-x")}>
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl text-white shadow-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-black mb-1">{t("incomeAccounts")}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.income}</p>
            </div>
          </div>
          <div className={cn("bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-xl flex items-center space-x-4 group hover:border-purple-200 transition-all hover:shadow-2xl hover:-translate-y-1", isRtl ? "space-x-reverse" : "space-x")}>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl text-white shadow-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-black mb-1">{t("others")}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stats.total - stats.expenses - stats.income}</p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/50 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="flex-1 relative w-full md:w-auto">
            <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5", isRtl ? "right-5" : "left-5")} />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "w-full bg-slate-50/50 border border-slate-200 rounded-2xl py-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-bold shadow-sm",
                isRtl ? "pr-14 pl-6" : "pl-14 pr-6"
              )}
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className={cn(
                "bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-black transition-all flex items-center shadow-xl shadow-emerald-500/20 text-sm whitespace-nowrap active:scale-95 disabled:opacity-50",
                isRtl ? "space-x-2 space-x-reverse" : "space-x-2"
              )}
              title="تهيأة شجرة الحسابات الافتراضية"
            >
              <RefreshCw className={cn("w-5 h-5", isSeeding && "animate-spin")} />
              <span>{isSeeding ? "جاري التهيئة..." : "تهيئة الشجرة"}</span>
            </button>
            <button
              onClick={() => handleOpenModal()}
              className={cn("bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center shadow-xl shadow-blue-500/20 text-sm whitespace-nowrap active:scale-95", isRtl ? "space-x-2 space-x-reverse" : "space-x-2")}
            >
              <Plus className="w-5 h-5" />
              <span>{t("addAccount")}</span>
            </button>
          </div>
        </motion.div>

        {/* Accounts Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className={cn("w-full border-collapse min-w-[800px]", isRtl ? "text-right" : "text-left")}>
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t("accountCode")}</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t("accountName")}</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">{t("type")}</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">المستوى</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-center">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {displayAccounts.length > 0 ? (
                    displayAccounts.map((account, index) => {
                      const typeConfig = accountTypeConfig[account.type] || accountTypeConfig["مصروف"];
                      const TypeIcon = typeConfig.icon;
                      const hasChildren = account.children && account.children.length > 0;
                      
                      return (
                        <motion.tr
                          key={account.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className={cn(
                            "border-b border-slate-50/50 hover:bg-blue-50/30 transition-colors group",
                            account.account_type === 'main' ? "bg-slate-50/30 font-bold" : ""
                          )}
                        >
                          <td className="px-8 py-5">
                            <div className={cn("flex items-center space-x-2", isRtl && "space-x-reverse")}>
                              <div style={{ width: `${account.level * 24}px` }} />
                              {hasChildren ? (
                                <button 
                                  onClick={() => toggleRow(account.id)}
                                  className="p-1 hover:bg-slate-200 rounded-md transition-colors"
                                >
                                  <ChevronRight className={cn(
                                    "w-4 h-4 text-slate-500 transition-transform",
                                    expandedRows[account.id] ? "rotate-90" : ""
                                  )} />
                                </button>
                              ) : (
                                <div className="w-6" />
                              )}
                              <Hash className="w-4 h-4 text-slate-300" />
                              <span className="font-mono font-black text-slate-700 bg-slate-100/50 px-4 py-1.5 rounded-xl text-xs border border-slate-200">
                                {account.account_code}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className={cn("flex items-center space-x-4", isRtl && "space-x-reverse")}>
                              <div className={cn("p-2.5 rounded-xl shadow-sm border", typeConfig.bgColor, typeConfig.borderColor)}>
                                <TypeIcon className={cn("w-5 h-5", typeConfig.color)} />
                              </div>
                              <span className={cn(
                                "font-black",
                                account.account_type === 'main' ? "text-slate-900" : "text-slate-700"
                              )}>
                                {account.account_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black border shadow-sm",
                              typeConfig.bgColor,
                              typeConfig.color,
                              typeConfig.borderColor
                            )}>
                              {typeConfig.label}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                              account.account_type === 'main' 
                                ? "bg-indigo-100 text-indigo-700 border border-indigo-200" 
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            )}>
                              {account.account_type === 'main' ? "رئيسي" : "فرعي"}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => handleOpenModal(account)}
                                className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title={t("edit")}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(account.id)}
                                className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title={t("delete")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-32 text-center">
                        <div className="flex flex-col items-center space-y-6 text-slate-400">
                          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                            <FileText className="w-12 h-12 opacity-20" />
                          </div>
                          <div className="space-y-2">
                            <p className="font-black text-2xl text-slate-900">{t("noMatchingAccounts")}</p>
                            <p className="text-sm font-medium">{t("noMatchingAccountsDesc")}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="bg-slate-50/50 px-8 py-6 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500 font-bold">
              {t("view")} <span className="text-slate-900 font-black px-1">{displayAccounts.length}</span> {t("outOf")} <span className="text-slate-900 font-black px-1">{accounts.length}</span> {t("accountsCount")}
            </p>
          </div>
        </motion.div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" dir={isRtl ? "rtl" : "ltr"}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex items-center justify-between">
                  <div className={cn("flex items-center space-x-4", isRtl && "space-x-reverse")}>
                    <div className="p-2.5 bg-white/10 rounded-xl">
                      {editingAccount ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{editingAccount ? t("editAccount") : t("addNewAccount")}</h3>
                      <p className="text-slate-300 text-xs">{t("fillRequiredData")}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">مستوى الحساب</label>
                      <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, account_type: "main" })}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-xs font-black transition-all",
                            formData.account_type === "main" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          رئيسي
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, account_type: "sub" })}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-lg text-xs font-black transition-all",
                            formData.account_type === "sub" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          فرعي
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">الحساب الأب (اختياري)</label>
                      <div className="relative">
                        <Layers className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4", isRtl ? "right-4" : "left-4")} />
                        <select
                          value={formData.parent_id || ""}
                          onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                          className={cn(
                            "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-bold appearance-none",
                            isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                          )}
                        >
                          <option value="">بدون أب (حساب رئيسي)</option>
                          {accounts
                            .filter(a => a.account_type === 'main' && a.id !== editingAccount?.id)
                            .map(a => (
                              <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>
                            ))
                          }
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t("accountCode")}</label>
                      <div className="relative">
                        <Hash className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4", isRtl ? "right-4" : "left-4")} />
                        <input
                          type="text"
                          required
                          value={formData.account_code}
                          onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
                          className={cn(
                            "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold",
                            isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-wider">{t("accountName")}</label>
                      <div className="relative">
                        <FileText className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4", isRtl ? "right-4" : "left-4")} />
                        <input
                          type="text"
                          required
                          value={formData.account_name}
                          onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                          className={cn(
                            "w-full bg-slate-50 border border-slate-200 rounded-xl py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold",
                            isRtl ? "pr-11 pl-4" : "pl-11 pr-4"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">نوع الحساب المالي</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(accountTypeConfig).map(([type, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, type })}
                            className={cn(
                              "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group",
                              formData.type === type
                                ? cn(config.bgColor, config.borderColor, config.color, "shadow-sm")
                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            <Icon className={cn("w-6 h-6", formData.type === type ? config.color : "text-slate-300 group-hover:text-slate-400")} />
                            <span className="text-xs font-black">{config.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center disabled:opacity-50 shadow-xl shadow-slate-200"
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Save className={cn("w-5 h-5", isRtl ? "ml-2" : "mr-2")} />
                          <span>{editingAccount ? t("saveChanges") : t("addAccount")}</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{t("confirmDelete")}</h3>
                <p className="text-slate-500 mb-8 font-medium">سيتم حذف الحساب نهائياً. تأكد من عدم وجود حركات مالية مرتبطة به.</p>
                <div className="flex gap-4">
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black transition-all shadow-xl shadow-red-100">
                    {t("yesDelete")}
                  </button>
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">
                    {t("cancel")}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
