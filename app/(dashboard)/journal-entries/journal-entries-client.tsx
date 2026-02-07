"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  PlusCircle, Save, Trash2, Edit, Book, Calendar,
  Building, User, ArrowDown, ArrowUp, List,
  CheckCircle, AlertCircle, Search, ChevronDown, ChevronUp,
  FileText, Landmark, X, Download, Printer, Shield,
  LayoutDashboard, ArrowRight, Sparkles, Loader2,
  AlertTriangle, CheckCircle2, Clock, Eye, Filter,
  TrendingUp, TrendingDown, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Suspense } from "react";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { HierarchicalSearchableSelect } from "@/components/ui/hierarchical-searchable-select";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────
interface Account {
  id: number;
  account_code: string;
  account_name: string;
  account_level?: number;
  parent_account?: string | null;
}

interface CostCenter {
  id: number;
  center_code: string;
  center_name: string;
}

interface JournalLine {
  id?: number;
  account_id: string;
  cost_center_id?: string;
  description: string;
  debit: string;
  credit: string;
}

interface Entry {
  id: number;
  entry_number: string;
  entry_date: string;
  account_id: number;
  cost_center_id?: number;
  description: string;
  debit: number;
  credit: number;
  created_by: string;
  source_type?: string;
  status?: string;
  accounts: { account_name: string; account_code: string };
  cost_centers?: { center_name: string; center_code: string };
}

interface Stats {
  totalDebit: number;
  totalCredit: number;
  entriesCount: number;
  draftsCount: number;
  approvedCount: number;
}

interface JournalEntriesProps {
  companyId: string | number;
}

type ModalType = "idle" | "delete-confirm" | "deleting" | "delete-success" | "delete-error";

interface ModalState {
  type: ModalType;
  entryNumber: string | null;
  entryDesc?: string;
  errorMessage?: string;
}

// ─── Main Content ────────────────────────────────────────────────
function JournalEntriesContent({ companyId }: JournalEntriesProps) {
  const t = useTranslations("journalEntries");
  const tCommon = useTranslations("common");
  const { isRTL, locale } = useLocale();
  const isAr = locale === "ar";

  // Data
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<Stats>({ totalDebit: 0, totalCredit: 0, entriesCount: 0, draftsCount: 0, approvedCount: 0 });
  const [entryNumber, setEntryNumber] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<JournalLine[]>([
    { account_id: "", cost_center_id: "", description: "", debit: "0", credit: "0" },
    { account_id: "", cost_center_id: "", description: "", debit: "0", credit: "0" },
  ]);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // UI
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: "idle", entryNumber: null });

  const formatDateGregorian = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" });
  };

  // ─── Data Fetching (uses the GET route with filters) ───────────
  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ company_id: String(companyId) });
      if (fromDate) params.set("from_date", fromDate);
      if (toDate) params.set("to_date", toDate);
      if (sourceFilter !== "all") params.set("source_type", sourceFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/journal-entries?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAccounts(data.accounts || []);
      setCostCenters(data.costCenters || []);
      setEntries(data.entries || []);
      setStats(data.stats || { totalDebit: 0, totalCredit: 0, entriesCount: 0, draftsCount: 0, approvedCount: 0 });
      if (!isEdit) setEntryNumber(data.entryNumber || "");
    } catch (error) {
      console.error(error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  }, [companyId, fromDate, toDate, sourceFilter, statusFilter, isEdit, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Computed ──────────────────────────────────────────────────
  const totals = useMemo(() => {
    let debit = 0, credit = 0;
    lines.forEach(l => { debit += parseFloat(l.debit) || 0; credit += parseFloat(l.credit) || 0; });
    return { debit, credit, diff: Math.abs(debit - credit) };
  }, [lines]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, Entry[]> = {};
    entries.forEach(e => {
      if (!groups[e.entry_number]) groups[e.entry_number] = [];
      groups[e.entry_number].push(e);
    });
    return groups;
  }, [entries]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedEntries;
    const lower = searchTerm.toLowerCase();
    const filtered: Record<string, Entry[]> = {};
    Object.entries(groupedEntries).forEach(([num, lines]) => {
      const match = num.toLowerCase().includes(lower) ||
        lines.some(l => l.description?.toLowerCase().includes(lower) || l.accounts?.account_name?.toLowerCase().includes(lower));
      if (match) filtered[num] = lines;
    });
    return filtered;
  }, [groupedEntries, searchTerm]);

  const sourceTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(groupedEntries).forEach(lines => {
      const src = lines[0]?.source_type || "manual";
      counts[src] = (counts[src] || 0) + 1;
    });
    return counts;
  }, [groupedEntries]);

  // ─── Handlers ──────────────────────────────────────────────────
  const addRow = () => {
    setLines([...lines, { account_id: "", cost_center_id: "", description: "", debit: "0", credit: "0" }]);
  };

  const removeRow = (index: number) => {
    if (lines.length <= 2) return toast.error(t("minLinesError"));
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof JournalLine, value: string) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const handleSave = async (e: React.FormEvent, saveStatus: "draft" | "approved" = "draft") => {
    e.preventDefault();
    if (totals.diff > 0.01) return toast.error(t("balanceError"));
    const validLines = lines.filter(l => (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0) && l.account_id);
    if (validLines.length < 2) return toast.error(t("minLinesError"));

    try {
      const res = await fetch("/api/journal-entries/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_number: entryNumber,
          entry_date: entryDate,
          lines: validLines,
          company_id: companyId,
          created_by: t("manager"),
          is_edit: isEdit,
          status: saveStatus,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(isEdit ? t("updateSuccess") : t("saveSuccess"));
      resetForm();
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setLines([
      { account_id: "", cost_center_id: "", description: "", debit: "0", credit: "0" },
      { account_id: "", cost_center_id: "", description: "", debit: "0", credit: "0" },
    ]);
    setEntryDate(new Date().toISOString().split("T")[0]);
    setIsEdit(false);
  };

  const handleEdit = (num: string, entryLines: Entry[]) => {
    setEntryNumber(num);
    setEntryDate(entryLines[0].entry_date);
    setLines(entryLines.map(e => ({
      account_id: String(e.account_id),
      cost_center_id: e.cost_center_id ? String(e.cost_center_id) : "",
      description: e.description,
      debit: String(e.debit),
      credit: String(e.credit),
    })));
    setIsEdit(true);
    setShowModal(true);
  };

  const openDeleteConfirm = (num: string, desc: string) => {
    setModal({ type: "delete-confirm", entryNumber: num, entryDesc: desc });
  };

  const closeModal = () => setModal({ type: "idle", entryNumber: null });

  const handleDelete = async () => {
    if (!modal.entryNumber) return;
    const num = modal.entryNumber;
    setModal({ type: "deleting", entryNumber: num });
    try {
      const res = await fetch(`/api/journal-entries/delete?entry_number=${num}&company_id=${companyId}`, { method: "DELETE" });
      if (res.ok) {
        setModal({ type: "delete-success", entryNumber: num });
        fetchData();
      } else {
        const data = await res.json().catch(() => ({}));
        setModal({ type: "delete-error", entryNumber: num, errorMessage: data.error || t("fetchError") });
      }
    } catch {
      setModal({ type: "delete-error", entryNumber: num, errorMessage: t("fetchError") });
    }
  };

  const handleApprove = async (num: string) => {
    try {
      const res = await fetch("/api/journal-entries/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_number: num, company_id: companyId }),
      });
      if (res.ok) {
        toast.success(t("approveSuccess"));
        fetchData();
      }
    } catch {
      toast.error(t("fetchError"));
    }
  };

  const toggleExpand = (num: string) => {
    setExpandedEntries(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const openNewEntryModal = () => {
    resetForm();
    fetchData();
    setShowModal(true);
  };

  // ─── CSV Export ────────────────────────────────────────────────
  const exportCsv = () => {
    const csvRows = ["رقم القيد,التاريخ,الحساب,البيان,مدين,دائن,المصدر,الحالة"];
    entries.forEach(e => {
      csvRows.push([
        e.entry_number,
        e.entry_date,
        `${e.accounts?.account_code} - ${e.accounts?.account_name}`,
        `"${e.description || ""}"`,
        e.debit,
        e.credit,
        e.source_type || "manual",
        e.status || "draft",
      ].join(","));
    });
    const blob = new Blob(["\uFEFF" + csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-entries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Source helpers ────────────────────────────────────────────
  const getSourceLabel = (src?: string) => {
    switch (src) {
      case "payroll": return t("sourcePayroll");
      case "sales_invoice": return t("sourceSalesInvoice");
      case "expense": return t("sourceExpense");
      case "deductions": return t("sourceDeductions");
      default: return t("sourceManual");
    }
  };
  const getSourceColor = (src?: string) => {
    switch (src) {
      case "payroll": return "from-purple-500 to-violet-600";
      case "sales_invoice": return "from-emerald-500 to-teal-600";
      case "expense": return "from-amber-500 to-orange-600";
      default: return "from-blue-500 to-indigo-600";
    }
  };
  const getSourceBadge = (src?: string) => {
    switch (src) {
      case "payroll": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "sales_invoice": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "expense": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default: return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };
  const getStatusBadge = (status?: string) => {
    if (status === "approved") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    return "bg-amber-500/20 text-amber-300 border-amber-500/30";
  };

  // ─── Animation variants ────────────────────────────────────────
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="text-blue-500 animate-spin" />
          <p className="text-slate-400 font-black text-sm">{t("loading")}</p>
        </motion.div>
      </div>
    );
  }

  const sourceTabs = [
    { key: "all", label: t("sourceAll"), color: "from-slate-500 to-slate-600", count: Object.keys(groupedEntries).length },
    { key: "manual", label: t("sourceManual"), color: "from-blue-500 to-indigo-600", count: sourceTypeCounts["manual"] || 0 },
    { key: "payroll", label: t("sourcePayroll"), color: "from-purple-500 to-violet-600", count: sourceTypeCounts["payroll"] || 0 },
    { key: "sales_invoice", label: t("sourceSalesInvoice"), color: "from-emerald-500 to-teal-600", count: sourceTypeCounts["sales_invoice"] || 0 },
    { key: "expense", label: t("sourceExpense"), color: "from-amber-500 to-orange-600", count: sourceTypeCounts["expense"] || 0 },
  ];

  return (
    <div className="min-h-screen pb-20 bg-transparent" dir={isRTL ? "rtl" : "ltr"}>
      {/* ═══════════ Premium Delete Modals ═══════════ */}
      <AnimatePresence>
        {modal.type !== "idle" && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !["deleting"].includes(modal.type) && closeModal()}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
            />

            {/* Delete Confirmation */}
            {modal.type === "delete-confirm" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
              >
                <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                  >
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                      <AlertTriangle size={48} className="text-white drop-shadow-lg" />
                    </motion.div>
                  </motion.div>
                  <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-3xl font-black tracking-tight relative z-10">{t("deleteConfirm")}</motion.h3>
                </div>
                <div className="p-8 text-center space-y-6" dir="rtl">
                  <div className="bg-red-950/30 rounded-2xl p-6 border-2 border-red-900/50">
                    <p className="text-slate-300 font-bold text-lg leading-relaxed">{t("deleteWarning")}</p>
                    <p className="text-red-400 font-black text-xl mt-2 truncate">&quot;{modal.entryNumber}&quot;</p>
                    {modal.entryDesc && <p className="text-slate-400 text-sm mt-1">{modal.entryDesc}</p>}
                  </div>
                  <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-3">
                    <p className="text-amber-400 text-xs font-bold text-center">{t("deleteNote")}</p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                      className="flex-1 flex items-center justify-center gap-3 bg-slate-800 text-slate-300 py-4 rounded-2xl font-black text-lg hover:bg-slate-700 transition-colors">
                      <X size={20} />{t("cancel")}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(239,68,68,0.4)" }} whileTap={{ scale: 0.98 }} onClick={handleDelete}
                      className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50">
                      <Trash2 size={20} />{t("confirmDelete")}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Deleting */}
            {modal.type === "deleting" && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full max-w-md bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20">
                <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-10 text-white text-center">
                  <div className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <Loader2 size={48} className="text-white animate-spin" />
                  </div>
                  <h3 className="text-2xl font-black relative z-10">{t("deleting")}</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">{t("pleaseWait")}</p>
                </div>
                <div className="p-8">
                  <div className="bg-blue-950/30 rounded-2xl p-5 border-2 border-blue-900/50">
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <p className="text-blue-400 font-bold text-center mt-3 text-sm">{t("deletingRecords")}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Delete Success */}
            {modal.type === "delete-success" && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="relative w-full max-w-lg bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden border-4 border-emerald-500/20">
                <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-10 text-white text-center overflow-hidden">
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring", damping: 15 }}
                    className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <CheckCircle2 size={48} className="text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-black relative z-10">{t("deleteSuccessTitle")}</h3>
                  <p className="text-white/80 font-bold mt-2 relative z-10">{t("deleteSuccessDesc")}</p>
                </div>
                <div className="p-8 text-center">
                  <div className="bg-emerald-950/30 rounded-2xl p-6 border-2 border-emerald-900/50 mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/10">
                      <FileText size={14} className="text-emerald-400" />
                      <span className="text-sm font-black text-emerald-300">{modal.entryNumber}</span>
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                    className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg shadow-xl shadow-emerald-500/30">
                    {t("close")}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Delete Error */}
            {modal.type === "delete-error" && (
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full max-w-md bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.2)] overflow-hidden border-4 border-red-500/20">
                <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center">
                  <div className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                    <AlertCircle size={48} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black relative z-10">{t("deleteErrorTitle")}</h3>
                </div>
                <div className="p-8 text-center space-y-4">
                  <div className="bg-red-950/30 rounded-2xl p-4 border border-red-900/50">
                    <p className="text-red-400 font-bold text-sm">{modal.errorMessage}</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={closeModal}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-800 text-white font-black text-lg hover:bg-slate-700 transition-colors">
                    {t("understood")}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════ Main Layout ═══════════ */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[98%] mx-auto px-4 pt-6">
        <div className="bg-slate-900 rounded-3xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">

          {/* ─── Header ───────────────────────────────────────── */}
          <div className="p-8 space-y-8 bg-slate-900 border-b border-white/5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 border border-white/10">
                  <Book className="text-white" size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    <Link href="/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                      <LayoutDashboard size={12} />
                      {t("dashboard")}
                    </Link>
                    <ArrowRight size={10} className={cn(isAr && "rotate-180")} />
                    <span className="text-blue-500">{t("breadcrumb")}</span>
                  </div>
                  <h1 className="text-2xl font-black text-white tracking-tight">{t("title")}</h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                  <span className="text-xs font-black text-blue-400 tracking-wide uppercase">{entryNumber}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openNewEntryModal}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all font-black text-sm shadow-xl shadow-blue-500/25"
                >
                  <PlusCircle size={20} />
                  {t("createEntry")}
                </motion.button>
              </div>
            </div>

            {/* ─── Stats Cards ────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: t("totalDebit"), value: stats.totalDebit, icon: TrendingDown, gradient: "from-red-500 to-rose-600", shadow: "shadow-red-500/20" },
                { label: t("totalCredit"), value: stats.totalCredit, icon: TrendingUp, gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/20" },
                { label: t("entriesCount"), value: stats.entriesCount, icon: BarChart3, gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/20", isCount: true },
                { label: t("drafts"), value: stats.draftsCount, icon: Clock, gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/20", isCount: true },
                { label: t("approved"), value: stats.approvedCount, icon: CheckCircle2, gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/20", isCount: true },
              ].map((card, i) => (
                <motion.div key={i} variants={itemVariants} className="relative group">
                  <div className={`h-full rounded-2xl bg-gradient-to-br ${card.gradient} p-5 shadow-lg ${card.shadow} transition-all group-hover:shadow-xl group-hover:scale-[1.02]`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-white/15 rounded-xl text-white backdrop-blur-md">
                        <card.icon size={18} />
                      </div>
                    </div>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{card.label}</p>
                    <p className="text-xl font-black text-white mt-1 flex items-baseline gap-1">
                      {card.isCount ? card.value : card.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      {!card.isCount && <span className="text-xs text-white/60 font-bold">{t("sar")}</span>}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ─── Filters & Source Tabs ─────────────────────────── */}
          <div className="bg-slate-900/80 px-8 py-5 border-b border-white/5 space-y-4">
            {/* Source Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {sourceTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSourceFilter(tab.key)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all",
                    sourceFilter === tab.key
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                      : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-black", sourceFilter === tab.key ? "bg-white/20" : "bg-white/5")}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500", isRTL ? "right-3" : "left-3")} />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className={cn("w-full py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-blue-500/50 focus:bg-white/10 outline-none transition-all text-sm font-bold", isRTL ? "pr-10 pl-4" : "pl-10 pr-4")}
                />
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-2">
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                  className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:border-blue-500/50 outline-none transition-all [color-scheme:dark]" />
                <span className="text-slate-500 text-xs font-black">→</span>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                  className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:border-blue-500/50 outline-none transition-all [color-scheme:dark]" />
              </div>

              {/* Status Filter */}
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="py-2.5 px-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-bold focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer [color-scheme:dark]">
                <option value="all">{t("statusAll")}</option>
                <option value="draft">{t("statusDraft")}</option>
                <option value="approved">{t("statusApproved")}</option>
              </select>

              {/* Action Buttons */}
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={exportCsv}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-black">
                <Download size={14} />{t("exportCsv")}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-black">
                <Printer size={14} />{t("print")}
              </motion.button>
            </div>
          </div>

          {/* ─── Table Header ─────────────────────────────────── */}
          <div className="bg-slate-900 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <List className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-white font-black tracking-tight">{t("journalLog")}</h3>
                <p className="text-slate-400 text-xs font-bold tracking-wide uppercase">{Object.keys(filteredGroups).length} {t("entriesCount")}</p>
              </div>
            </div>
          </div>

          {/* ─── Entries List ─────────────────────────────────── */}
          <div className="p-6">
            <div className="space-y-3">
              {Object.keys(filteredGroups).length > 0 ? (
                Object.entries(filteredGroups).map(([num, entryLines]) => {
                  const isManual = !entryLines[0].source_type || entryLines[0].source_type === "manual";
                  const isDraft = !entryLines[0].status || entryLines[0].status === "draft";
                  const totalDebit = entryLines.reduce((s, l) => s + l.debit, 0);

                  return (
                    <motion.div key={num} variants={itemVariants}
                      className="rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-all group bg-slate-800/50">
                      <div onClick={() => toggleExpand(num)}
                        className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-all">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className={cn("px-4 py-2 rounded-xl font-black text-sm border", "bg-white/5 text-blue-400 border-blue-500/20")}>
                            {num}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDateGregorian(entryLines[0].entry_date)}
                            </span>
                            <span className="text-slate-300 font-bold text-sm line-clamp-1">{entryLines[0].description || "---"}</span>
                          </div>
                          <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black border", getSourceBadge(entryLines[0].source_type))}>
                            {getSourceLabel(entryLines[0].source_type)}
                          </span>
                          <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black border", getStatusBadge(entryLines[0].status))}>
                            {entryLines[0].status === "approved" ? t("statusApproved") : t("statusDraft")}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 font-black uppercase">{t("total")}</span>
                            <span className="text-lg font-black text-white">
                              {totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              <small className="text-[10px] text-slate-500 font-bold mr-1">{t("sar")}</small>
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isManual && isDraft && (
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={e => { e.stopPropagation(); handleApprove(num); }}
                                className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl hover:bg-emerald-500/30 transition-colors border border-emerald-500/20"
                                title={t("approve")}>
                                <Shield size={16} />
                              </motion.button>
                            )}
                            {isManual && (
                              <>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  onClick={e => { e.stopPropagation(); handleEdit(num, entryLines); }}
                                  className="p-2 bg-amber-500/20 text-amber-400 rounded-xl hover:bg-amber-500/30 transition-colors border border-amber-500/20">
                                  <Edit size={16} />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  onClick={e => { e.stopPropagation(); openDeleteConfirm(num, entryLines[0].description); }}
                                  className="p-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors border border-red-500/20">
                                  <Trash2 size={16} />
                                </motion.button>
                              </>
                            )}
                          </div>

                          {expandedEntries[num]
                            ? <ChevronUp size={18} className="text-slate-500" />
                            : <ChevronDown size={18} className="text-slate-500" />
                          }
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedEntries[num] && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden">
                            <div className="px-5 pb-5 pt-2">
                              <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
                                <table className="w-full">
                                  <thead>
                                    <tr className="text-slate-500 text-[11px] font-black uppercase border-b border-white/5">
                                      <th className="pb-3 pt-4 px-4 text-right">{t("account")}</th>
                                      <th className="pb-3 pt-4 px-4 text-right">{t("costCenter")}</th>
                                      <th className="pb-3 pt-4 px-4 text-right">{t("description")}</th>
                                      <th className="pb-3 pt-4 px-4 text-center">{t("debit")}</th>
                                      <th className="pb-3 pt-4 px-4 text-center">{t("credit")}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {entryLines.map((l, i) => (
                                      <tr key={i} className="text-sm font-medium hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-4 text-blue-400 font-bold">
                                          <div className="flex items-center gap-2">
                                            <Landmark size={12} className="opacity-40" />
                                            {l.accounts?.account_code} - {l.accounts?.account_name}
                                          </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">
                                          {l.cost_centers ? (
                                            <div className="flex items-center gap-2">
                                              <Building size={12} className="opacity-40" />
                                              {l.cost_centers.center_code} - {l.cost_centers.center_name}
                                            </div>
                                          ) : <span className="text-slate-600">---</span>}
                                        </td>
                                        <td className="py-3 px-4 text-slate-400 italic">{l.description || "---"}</td>
                                        <td className="py-3 px-4 text-center font-black text-red-400">{l.debit > 0 ? l.debit.toLocaleString() : "-"}</td>
                                        <td className="py-3 px-4 text-center font-black text-emerald-400">{l.credit > 0 ? l.credit.toLocaleString() : "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                <div className="mt-0 px-4 py-3 border-t border-white/5 flex justify-between text-[10px] font-bold text-slate-600">
                                  <span>{t("createdBy")}: {entryLines[0].created_by}</span>
                                  <span>{t("operationNumber")}: {entryLines[0].id}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-20 rounded-3xl border-2 border-dashed border-white/10 bg-white/5">
                  <Book size={64} className="text-slate-700 mx-auto mb-4" />
                  <h4 className="text-lg font-black text-slate-500">{t("noEntries")}</h4>
                  <p className="text-slate-600 text-sm">{t("noEntriesDesc")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══════════ Create/Edit Modal ═══════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-slate-900 rounded-[2rem] shadow-[0_0_100px_rgba(59,130,246,0.2)] w-full max-w-5xl max-h-[90vh] overflow-hidden border-2 border-blue-500/20"
              onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white flex justify-between items-center overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <h3 className="text-xl font-black flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {isEdit ? <Edit size={20} /> : <PlusCircle size={20} />}
                  </div>
                  {isEdit ? t("editEntry") : t("createEntry")}
                </h3>
                <div className="flex items-center gap-4 relative z-10">
                  <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black border border-white/10">
                    {lines.length} {t("lines")}
                  </span>
                  <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-black border border-white/10">
                    {entryNumber}
                  </span>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <form onSubmit={e => handleSave(e, "draft")} className="space-y-6">
                  {/* Entry Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                        <FileText size={12} className="text-blue-400" />
                        {t("entryNumber")}
                      </label>
                      <input type="text" value={entryNumber} readOnly
                        className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl font-black text-blue-400 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                        <Calendar size={12} className="text-blue-400" />
                        {t("entryDate")}
                      </label>
                      <input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} required
                        className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold focus:border-blue-500/50 outline-none transition-all [color-scheme:dark]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                        <Calendar size={12} className="text-emerald-400" />
                        {t("selectedDate")}
                      </label>
                      <div className="w-full p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl font-black text-emerald-400 text-sm">
                        {formatDateGregorian(entryDate)}
                      </div>
                    </div>
                  </div>

                  {/* Lines Table */}
                  <div className="rounded-2xl overflow-hidden border border-white/10">
                    <table className="w-full border-collapse">
                      <thead className="bg-white/5 text-slate-400 font-black text-[11px] uppercase border-b border-white/10">
                        <tr>
                          <th className="p-3 text-right w-[22%]">{t("account")}</th>
                          <th className="p-3 text-right w-[18%]">{t("costCenter")}</th>
                          <th className="p-3 text-right w-[20%]">{t("description")}</th>
                          <th className="p-3 text-center w-[15%]">{t("debit")}</th>
                          <th className="p-3 text-center w-[15%]">{t("credit")}</th>
                          <th className="p-3 text-center w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {lines.map((line, index) => (
                          <tr key={index} className="hover:bg-white/5 transition-colors">
                            <td className="p-2">
                              <HierarchicalSearchableSelect
                                items={accounts.map(acc => ({ id: acc.id, code: acc.account_code, name: acc.account_name, level: acc.account_level, parent: acc.parent_account }))}
                                value={line.account_id}
                                valueKey="id"
                                onSelect={val => handleLineChange(index, "account_id", val)}
                                placeholder={t("selectAccount")}
                                className="border-white/10 h-11 bg-white/5 text-white"
                              />
                            </td>
                            <td className="p-2">
                              <HierarchicalSearchableSelect
                                items={costCenters.map(cc => ({ id: cc.id, code: cc.center_code, name: cc.center_name }))}
                                value={line.cost_center_id || ""}
                                valueKey="id"
                                onSelect={val => handleLineChange(index, "cost_center_id", val)}
                                placeholder={t("selectCostCenter")}
                                className="border-white/10 h-11 bg-white/5 text-white"
                              />
                            </td>
                            <td className="p-2">
                              <input type="text" value={line.description}
                                onChange={e => handleLineChange(index, "description", e.target.value)}
                                placeholder={t("descriptionPlaceholder")}
                                className="w-full p-2.5 bg-white/5 border border-white/10 rounded-lg focus:border-blue-500/50 outline-none transition-all text-sm text-white placeholder-slate-600" />
                            </td>
                            <td className="p-2">
                              <div className="relative">
                                <ArrowDown className={cn("absolute top-1/2 -translate-y-1/2 w-3 h-3 text-red-400", isRTL ? "right-2" : "left-2")} />
                                <input type="number" step="0.01" value={line.debit}
                                  onChange={e => handleLineChange(index, "debit", e.target.value)}
                                  className={cn("w-full p-2.5 text-center font-bold text-red-400 bg-white/5 border border-white/10 rounded-lg focus:border-red-500/50 outline-none text-sm", isRTL ? "pr-7" : "pl-7")} />
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="relative">
                                <ArrowUp className={cn("absolute top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-400", isRTL ? "right-2" : "left-2")} />
                                <input type="number" step="0.01" value={line.credit}
                                  onChange={e => handleLineChange(index, "credit", e.target.value)}
                                  className={cn("w-full p-2.5 text-center font-bold text-emerald-400 bg-white/5 border border-white/10 rounded-lg focus:border-emerald-500/50 outline-none text-sm", isRTL ? "pr-7" : "pl-7")} />
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <button type="button" onClick={() => removeRow(index)}
                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-white/5 border-t border-white/10">
                        <tr className="font-black text-base">
                          <td colSpan={3} className="p-4 text-slate-400">{t("total")}:</td>
                          <td className="p-4 text-center text-red-400">{totals.debit.toFixed(2)}</td>
                          <td className="p-4 text-center text-emerald-400">{totals.credit.toFixed(2)}</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Balance Status */}
                  {totals.diff > 0.01 ? (
                    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
                      <AlertCircle size={20} className="flex-shrink-0" />
                      <div>
                        <p className="font-black">{t("unbalanced")}!</p>
                        <p className="text-xs font-bold opacity-80">{t("difference")}: {totals.diff.toFixed(2)} {t("sar")}</p>
                      </div>
                    </div>
                  ) : totals.debit > 0 ? (
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
                      <CheckCircle size={20} className="flex-shrink-0" />
                      <div>
                        <p className="font-black">{t("balanced")}</p>
                        <p className="text-xs font-bold opacity-80">{t("balancedDesc")}</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center gap-4 pt-4 border-t border-white/10">
                    <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={addRow}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-xl font-black text-sm border border-indigo-500/20 transition-all">
                      <PlusCircle size={16} />{t("addRow")}
                    </motion.button>

                    <div className="flex gap-3">
                      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => { resetForm(); setShowModal(false); }}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl font-black text-sm border border-white/10 transition-all">
                        {t("cancel")}
                      </motion.button>
                      <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        disabled={totals.diff > 0.01 || totals.debit === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl font-black text-sm border border-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        <Clock size={16} />{t("saveDraft")}
                      </motion.button>
                      <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        disabled={totals.diff > 0.01 || totals.debit === 0}
                        onClick={e => handleSave(e, "approved")}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        <Save size={16} />{isEdit ? t("saveChanges") : t("saveApprove")}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────
export function JournalEntriesClient({ companyId }: JournalEntriesProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={48} className="text-blue-500 animate-spin" />
      </div>
    }>
      <JournalEntriesContent companyId={companyId} />
    </Suspense>
  );
}
