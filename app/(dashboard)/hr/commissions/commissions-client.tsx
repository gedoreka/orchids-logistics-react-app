"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Trash2, 
  Save, 
    RefreshCw, 
    Eye, 
    TrendingUp, 
    Activity, 
    Calendar, 
    Percent, 
    UserCheck, 
    UserMinus, 
    Briefcase,
    Loader2,
    CheckSquare,
    Square,
    X,
    Mail,
    Clock,
    Info,
    ChevronRight,
    Sparkles,
    Plus
  } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface CommissionEmployee {
  id: string;
  employee_id: string;
  name: string;
  user_code: string;
  iqama_number: string;
  package_id: string;
  start_date: string;
  daily_amount: number;
  days: number;
  total: number;
  percentage: number;
  revenue: number;
  commission: number;
  deduction: number;
  bonus: number;
  status: "paid" | "unpaid";
  selected: boolean;
}

interface SavedGroup {
  package_id: string;
  mode: string;
  month: string;
  total_amount: number;
  status: "paid" | "unpaid";
  created_at: string;
  serial_number?: number;
}

export function CommissionsClient({ packages: initialPackages, companyId }: { packages: any[], companyId: string }) {
  const t = useTranslations("hr.commissions");
  const { locale } = useLocale();
  const isRtl = locale === "ar";

  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [mode, setMode] = useState<"fixed_daily" | "fixed_monthly" | "percentage">("fixed_daily");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [commissions, setCommissions] = useState<CommissionEmployee[]>([]);
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);
  const [activeTab, setActiveTab] = useState<"manage" | "report">("manage");
  const [searchQuery, setSearchQuery] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  const printRef = useRef<HTMLDivElement>(null);

  const packages = useMemo(() => initialPackages || [], [initialPackages]);

  useEffect(() => {
    fetchSavedGroups();
  }, [month]);

  async function fetchSavedGroups() {
    try {
      const res = await fetch(`/api/hr/commissions?company_id=${companyId}&month=${month}`);
      const data = await res.json();
      if (data.savedGroups) {
        setSavedGroups(data.savedGroups || []);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }

  async function fetchData() {
    if (!selectedPackageId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/commissions?company_id=${companyId}&package_id=${selectedPackageId}&mode=${mode}&month=${month}`);
      const data = await res.json();
      
      if (data.employees) {
        // If we have loadedCommissions, use them. Otherwise use raw employees.
        const baseEmployees = data.loadedCommissions && data.loadedCommissions.length > 0 
          ? data.loadedCommissions 
          : data.employees;

        setCommissions(baseEmployees.map((emp: any) => ({
          ...emp,
          employee_id: emp.employee_id || emp.id, // Fallback if it's raw employee
          selected: true,
          status: emp.status || "unpaid"
        })));
        setActiveTab("manage");
      } else {
        toast.error(t("notifications.error"));
      }
    } catch (error) {
      toast.error(t("notifications.error"));
    } finally {
      setLoading(false);
    }
  }

  async function loadGroup(packageId: string, groupMode: any) {
    setSelectedPackageId(packageId);
    setMode(groupMode);
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/commissions?company_id=${companyId}&package_id=${packageId}&mode=${groupMode}&month=${month}`);
      const data = await res.json();
      if (data.loadedCommissions) {
        setCommissions(data.loadedCommissions.map((emp: any) => ({
          ...emp,
          selected: true
        })));
        setActiveTab("report");
      }
    } catch (error) {
      toast.error(t("notifications.error"));
    } finally {
      setLoading(false);
    }
  }

  const handleCommChange = (index: number, field: keyof CommissionEmployee, value: any) => {
    const updated = [...commissions];
    const item = { ...updated[index], [field]: value };

    if (field === "daily_amount" || field === "days") {
      item.total = Number(item.daily_amount || 0) * Number(item.days || 0);
    } else if (field === "percentage" || field === "revenue") {
      item.commission = (Number(item.revenue || 0) * Number(item.percentage || 0)) / 100;
    }

    updated[index] = item;
    setCommissions(updated);
  };

  const saveCommissions = async () => {
    const selectedData = commissions.filter(c => c.selected);
    if (selectedData.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/hr/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          month,
          package_id: selectedPackageId,
          mode,
          commissions: selectedData
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("notifications.success"));
        fetchSavedGroups();
        setActiveTab("report");
      }
    } catch (error) {
      toast.error(t("notifications.error"));
    } finally {
      setSaving(false);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = filteredCommissions.every(c => c.selected);
    const updated = commissions.map(c => {
      const isVisible = filteredCommissions.some(fc => fc.employee_id === c.employee_id);
      return isVisible ? { ...c, selected: !allSelected } : c;
    });
    setCommissions(updated);
  };

  const removeUnselected = () => {
    setCommissions(commissions.filter(c => c.selected));
  };

  const toggleGroupStatus = async (group: SavedGroup) => {
    const newStatus = group.status === "paid" ? "unpaid" : "paid";
    try {
      const res = await fetch("/api/hr/commissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          package_id: group.package_id,
          mode: group.mode,
          month: group.month,
          status: newStatus
        })
      });
      if (res.ok) {
        toast.success(t("notifications.success"));
        fetchSavedGroups();
      }
    } catch (error) {
      toast.error(t("notifications.error"));
    }
  };

  const handleDeleteClick = async (packageId: string, groupMode: string, packageName: string) => {
    if (!confirm(`هل أنت متأكد من حذف تقرير ${packageName}؟`)) return;
    try {
      const res = await fetch(`/api/hr/commissions?company_id=${companyId}&package_id=${packageId}&mode=${groupMode}&month=${month}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success(t("notifications.success"));
        fetchSavedGroups();
        if (selectedPackageId === packageId && mode === groupMode) {
          setCommissions([]);
        }
      }
    } catch (error) {
      toast.error(t("notifications.error"));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenEmailDialog = async (comm: CommissionEmployee) => {
    setSendingEmail(comm.id);
    try {
      const res = await fetch("/api/hr/commissions/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commissionId: comm.id,
          employeeId: comm.employee_id,
          status: comm.status
        })
      });
      if (res.ok) {
        toast.success("تم إرسال البريد بنجاح");
      } else {
        toast.error("فشل إرسال البريد");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الإرسال");
    } finally {
      setSendingEmail(null);
    }
  };

  const filteredCommissions = commissions.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.user_code.includes(searchQuery)
  );

  const getRealIndex = (filteredIdx: number) => {
    const item = filteredCommissions[filteredIdx];
    return commissions.findIndex(c => c.employee_id === item.employee_id);
  };

  const totalDue = commissions.filter(c => c.selected).reduce((sum, c) => {
    const base = mode.startsWith("fixed") ? Number(c.total || 0) : Number(c.commission || 0);
    return sum + base + (Number(c.bonus) || 0) - (Number(c.deduction) || 0);
  }, 0);

  const totalPaid = commissions.filter(c => c.selected && c.status === "paid").length;
  const totalUnpaid = commissions.filter(c => c.selected && c.status === "unpaid").length;
  const selectedCount = commissions.filter(c => c.selected).length;

  const getModeLabel = (m: string) => {
    if (m === "fixed_daily") return t("fixedDaily");
    if (m === "fixed_monthly") return t("fixedMonthly");
    return t("percentage");
  };

  const getModeColor = (m: string) => {
    if (m === "fixed_daily") return "bg-blue-500";
    if (m === "fixed_monthly") return "bg-purple-500";
    return "bg-amber-500";
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 md:p-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-[1600px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Main Container Plate */}
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-[3rem] p-8 border border-white/5 shadow-2xl">
            <div className="flex flex-col gap-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                      <Briefcase size={20} />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">{t("title")}</h1>
                  </div>
                  <p className="text-slate-400 font-medium text-sm max-w-md">
                    {t("subtitle")}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowInstructions(!showInstructions)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all border",
                      showInstructions 
                        ? "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20" 
                        : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                    )}
                  >
                    <Info size={16} />
                    <span>{t("instructionsTrigger")}</span>
                  </button>
                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shadow-inner">
                    <button 
                      onClick={() => setActiveTab("manage")}
                      className={cn(
                        "px-6 py-2 rounded-xl text-xs font-black transition-all",
                        activeTab === "manage" ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-white"
                      )}
                    >
                      {t("manageCommissions")}
                    </button>
                    <button 
                      onClick={() => setActiveTab("report")}
                      className={cn(
                        "px-6 py-2 rounded-xl text-xs font-black transition-all",
                        activeTab === "report" ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-white"
                      )}
                    >
                      {t("commissionsReport")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions Section */}
              <AnimatePresence>
                {showInstructions && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-900/50 rounded-[2.5rem] border border-white/10 p-8 shadow-inner">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500">
                          <Sparkles size={18} />
                        </div>
                        <h3 className="text-lg font-black text-white">{t("instructionsTitle")}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1,2,3,4,5,6,7,8].map((num) => (
                          <div key={num} className="flex gap-4 group">
                            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs font-black group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-400 transition-all shrink-0">
                              {num}
                            </div>
                            <div>
                              <h4 className="text-white text-sm font-black mb-1">{t(`instruction${num}.title`)}</h4>
                              <p className="text-slate-400 text-[11px] leading-relaxed font-medium">{t(`instruction${num}.description`)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  label={t("totalDue")} 
                  value={totalDue.toLocaleString()} 
                  icon={<TrendingUp size={24} />} 
                  color="blue" 
                  isRtl={isRtl}
                  suffix={t("currency")}
                />
                <StatCard 
                  label={t("paidCount")} 
                  value={totalPaid.toString()} 
                  icon={<UserCheck size={24} />} 
                  color="emerald" 
                  isRtl={isRtl}
                  suffix={t("employee")}
                />
                <StatCard 
                  label={t("unpaidCount")} 
                  value={totalUnpaid.toString()} 
                  icon={<UserMinus size={24} />} 
                  color="amber" 
                  isRtl={isRtl}
                  suffix={t("employee")}
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar - Filters */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-6 text-gray-900">
                      <Filter size={20} className="text-blue-500" />
                      <h2 className="font-black text-lg">{t("filters")}</h2>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t("month")}</label>
                        <div className="relative group">
                          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            type="month" 
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-sm transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t("package")}</label>
                        <div className="relative group">
                          <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <select 
                            value={selectedPackageId}
                            onChange={(e) => setSelectedPackageId(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-sm transition-all appearance-none"
                          >
                            <option value="">{t("package")}</option>
                            {packages.map(p => (
                              <option key={p.id} value={p.id}>{p.group_name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link 
                          href="/hr/packages?type=commission&create=true"
                          className="w-full py-3 rounded-2xl bg-purple-50 text-purple-600 font-black text-[10px] border border-purple-100 hover:bg-purple-100 transition-all flex items-center justify-center gap-2 group/btn"
                        >
                          <Plus size={14} className="group-hover/btn:rotate-90 transition-transform" />
                          <span>{t("addPackage")}</span>
                        </Link>
                      </div>
    
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t("commissionType")}</label>
                        <div className="flex flex-col gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                          <button 
                            onClick={() => setMode("fixed_daily")}
                            className={cn(
                              "py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
                              mode === "fixed_daily" ? "bg-white text-blue-600 shadow-md border border-gray-100" : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            <Activity size={14} />
                            <span>{t("fixedDaily")}</span>
                          </button>
                          <button 
                            onClick={() => setMode("fixed_monthly")}
                            className={cn(
                              "py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
                              mode === "fixed_monthly" ? "bg-white text-purple-600 shadow-md border border-gray-100" : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            <Calendar size={14} />
                            <span>{t("fixedMonthly")}</span>
                          </button>
                          <button 
                            onClick={() => setMode("percentage")}
                            className={cn(
                              "py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
                              mode === "percentage" ? "bg-white text-amber-600 shadow-md border border-gray-100" : "text-gray-400 hover:text-gray-600"
                            )}
                          >
                            <Percent size={14} />
                            <span>{t("percentage")}</span>
                          </button>
                        </div>
                      </div>

                      <button 
                        onClick={() => fetchData()}
                        disabled={loading || !selectedPackageId}
                        className="w-full py-4 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                        <span>{t("viewData")}</span>
                      </button>
                    </div>
                  </div>

                  {/* Saved Groups */}
                  <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-2 mb-6 text-gray-900">
                      <Save size={20} className="text-amber-500" />
                      <h2 className="font-black text-lg">{t("savedGroups")}</h2>
                    </div>
                    
                    <div className="space-y-3">
                      {savedGroups.length > 0 ? savedGroups.map((group, i) => {
                        const pkg = packages.find(p => p.id === group.package_id);
                        return (
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={`${group.package_id}-${group.mode}-${group.serial_number}`}
                            className="p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all group"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                   <span className="h-5 w-5 rounded-md bg-gray-900 text-white flex items-center justify-center text-[10px] font-black">
                                    {group.serial_number || i + 1}
                                   </span>
                                   <span className="font-black text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {pkg?.group_name || "باقة غير معروفة"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={cn("px-2 py-0.5 rounded text-[8px] font-black text-white", getModeColor(group.mode))}>
                                    {getModeLabel(group.mode)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => loadGroup(group.package_id, group.mode)}
                                    className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    title="عرض التقرير"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteClick(group.package_id, group.mode, pkg?.group_name || "")}
                                    className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    title="حذف التقرير"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                  <button 
                                    onClick={() => toggleGroupStatus(group)}
                                    className={cn(
                                      "w-10 h-5 rounded-full relative transition-all duration-300 shadow-inner group/toggle",
                                      group.status === "paid" ? "bg-emerald-500" : "bg-gray-300"
                                    )}
                                  >
                                    <div className={cn(
                                      "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-md group-hover/toggle:scale-110",
                                      group.status === "paid" ? "right-0.5" : "left-0.5"
                                    )} />
                                  </button>
                                  <span className={cn(
                                    "text-[7px] font-black uppercase",
                                    group.status === "paid" ? "text-emerald-600" : "text-gray-400"
                                  )}>
                                    {group.status === "paid" ? t("paid") : t("unpaid")}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100/50">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] text-gray-400 font-bold uppercase">{t("totalCommissions")}</span>
                                <span className="text-xs font-black text-gray-900">{Number(group.total_amount).toLocaleString()} {t("currency")}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium self-end">
                                <Clock size={12} />
                                <span>{format(new Date(group.created_at), "yyyy/MM/dd")}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      }) : (
                        <div className="text-center py-10 opacity-40 grayscale flex flex-col items-center gap-3">
                          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Save size={24} />
                          </div>
                          <p className="text-xs font-bold">{t("noSavedCommissions")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                  <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                    {activeTab === "manage" ? (
                      <>
                        {/* Manage Header */}
                        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                              <Users size={24} />
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-gray-900">{t("employeeDetails")}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-sm text-gray-400 font-medium">
                                  {getModeLabel(mode)} • {month}
                                </p>
                                {commissions.length > 0 && (
                                  <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                    {selectedCount} / {commissions.length} {t("selected")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {commissions.length > 0 && (
                              <>
                                <div className="relative group">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                  <input 
                                    type="text" 
                                    placeholder={t("searchPlaceholder")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-xs transition-all w-64"
                                  />
                                  {searchQuery && (
                                    <button 
                                      onClick={() => setSearchQuery("")}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                      <X size={14} />
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={toggleSelectAll}
                                    className="px-4 py-2.5 rounded-xl bg-white text-gray-700 font-black text-[10px] border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                                  >
                                    {filteredCommissions.every(c => c.selected) ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} />}
                                    <span>{filteredCommissions.every(c => c.selected) ? t("cancelAll") : t("selectAll")}</span>
                                  </button>

                                  <button 
                                    onClick={removeUnselected}
                                    disabled={selectedCount === commissions.length || selectedCount === 0}
                                    className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-black text-[10px] border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                                  >
                                    <Trash2 size={16} />
                                    <span>{t("removeUnselected")}</span>
                                  </button>

                                  <button 
                                    onClick={() => fetchData()}
                                    className="px-4 py-2.5 rounded-xl bg-white text-gray-700 font-black text-[10px] border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                                  >
                                    <RefreshCw size={16} />
                                    <span>{t("refresh")}</span>
                                  </button>
                                </div>
                              </>
                            )}
                            
                            <button 
                              onClick={saveCommissions}
                              disabled={saving || commissions.length === 0 || selectedCount === 0}
                              className="px-8 py-3.5 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 ml-auto"
                            >
                              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                              <span>{t("saveData")}</span>
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                          {commissions.length > 0 ? (
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-gray-50/50">
                                  <th className="px-6 py-5 text-center text-xs font-black text-gray-400 border-b border-gray-50 w-10">
                                    <input 
                                      type="checkbox"
                                      checked={filteredCommissions.length > 0 && filteredCommissions.every(c => c.selected)}
                                      onChange={toggleSelectAll}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                  </th>
                                  <th className="px-6 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("employee")}</th>
                                  <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("startDate")}</th>
                                  {mode === "fixed_daily" && (
                                    <>
                                      <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("dailyAmount")}</th>
                                      <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("days")}</th>
                                      <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("total")}</th>
                                    </>
                                  )}
                                  {mode === "fixed_monthly" && (
                                    <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("monthlyAmount")}</th>
                                  )}
                                  {mode === "percentage" && (
                                    <>
                                      <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("commissionPercent")}</th>
                                      <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("revenue")}</th>
                                      <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("commission")}</th>
                                    </>
                                  )}
                                  <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("deductions")}</th>
                                  <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("bonuses")}</th>
                                  <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("total")}</th>
                                  <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("paymentStatus")}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {filteredCommissions.map((comm, fIdx) => {
                                  const realIdx = getRealIndex(fIdx);
                                  const net = (mode.startsWith("fixed") ? Number(comm.total) : Number(comm.commission)) + (Number(comm.bonus) || 0) - (Number(comm.deduction) || 0);
                                  return (
                                    <motion.tr 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: fIdx * 0.05 }}
                                      key={comm.employee_id} 
                                      className={cn(
                                        "hover:bg-blue-50/30 transition-colors",
                                        !comm.selected && "bg-gray-50/50 opacity-60"
                                      )}
                                    >
                                      <td className="px-6 py-4 text-center">
                                        <input 
                                          type="checkbox"
                                          checked={comm.selected}
                                          onChange={(e) => handleCommChange(realIdx, "selected", e.target.checked)}
                                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                          <span className="font-black text-gray-900 text-sm">{comm.name}</span>
                                          <span className="text-[10px] text-gray-400 font-bold mt-0.5 tracking-tighter">{comm.user_code} • {comm.iqama_number}</span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <input 
                                          type="date" 
                                          value={comm.start_date}
                                          onChange={(e) => handleCommChange(realIdx, "start_date", e.target.value)}
                                          className="w-32 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 outline-none text-xs font-bold transition-all"
                                        />
                                      </td>
                                      {mode === "fixed_daily" && (
                                        <>
                                          <td className="px-6 py-4 text-center">
                                            <input 
                                              type="number" 
                                              value={comm.daily_amount}
                                              onChange={(e) => handleCommChange(realIdx, "daily_amount", e.target.value)}
                                              className="w-24 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black transition-all"
                                            />
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                            <input 
                                              type="number" 
                                              value={comm.days}
                                              onChange={(e) => handleCommChange(realIdx, "days", e.target.value)}
                                              className="w-20 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black transition-all"
                                            />
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                            <span className="font-black text-sm text-blue-600">{Number(comm.total || 0).toFixed(2)}</span>
                                          </td>
                                        </>
                                      )}
                                      {mode === "fixed_monthly" && (
                                        <td className="px-6 py-4 text-center">
                                          <input 
                                            type="number" 
                                            value={comm.daily_amount}
                                            onChange={(e) => handleCommChange(realIdx, "daily_amount", e.target.value)}
                                            className="w-32 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black transition-all"
                                          />
                                        </td>
                                      )}
                                      {mode === "percentage" && (
                                        <>
                                          <td className="px-6 py-4 text-center">
                                            <div className="relative inline-block">
                                              <input 
                                                type="number" 
                                                value={comm.percentage}
                                                onChange={(e) => handleCommChange(realIdx, "percentage", e.target.value)}
                                                className="w-24 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black transition-all pr-6"
                                              />
                                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">%</span>
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                            <input 
                                              type="number" 
                                              value={comm.revenue}
                                              onChange={(e) => handleCommChange(realIdx, "revenue", e.target.value)}
                                              className="w-28 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black transition-all"
                                            />
                                          </td>
                                          <td className="px-6 py-4 text-center">
                                            <span className="font-black text-sm text-blue-600">{Number(comm.commission || 0).toFixed(2)}</span>
                                          </td>
                                        </>
                                      )}
                                      <td className="px-6 py-4 text-center">
                                        <input 
                                          type="number" 
                                          value={comm.deduction}
                                          onChange={(e) => handleCommChange(realIdx, "deduction", e.target.value)}
                                          className="w-24 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black text-red-500 transition-all"
                                        />
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <input 
                                          type="number" 
                                          value={comm.bonus}
                                          onChange={(e) => handleCommChange(realIdx, "bonus", e.target.value)}
                                          className="w-24 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black text-emerald-500 transition-all"
                                        />
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <span className="font-black text-sm text-gray-900">{net.toFixed(2)}</span>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                          <button 
                                            onClick={() => handleCommChange(realIdx, "status", comm.status === "paid" ? "unpaid" : "paid")}
                                            className={cn(
                                              "w-10 h-5 rounded-full relative transition-all duration-300 shadow-inner group/toggle",
                                              comm.status === "paid" ? "bg-emerald-500" : "bg-gray-300"
                                            )}
                                          >
                                            <div className={cn(
                                              "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-md group-hover/toggle:scale-110",
                                              comm.status === "paid" ? "right-0.5" : "left-0.5"
                                            )} />
                                          </button>
                                          <span className={cn(
                                            "text-[8px] font-black",
                                            comm.status === "paid" ? "text-emerald-600" : "text-gray-400"
                                          )}>
                                            {comm.status === "paid" ? t("paidStatus") : t("unpaidStatus")}
                                          </span>
                                        </div>
                                      </td>
                                    </motion.tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-32 opacity-20 grayscale">
                              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                                <Users size={48} />
                              </div>
                              <p className="font-black text-lg">{t("noEmployees")}</p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col">
                        {/* Report Header */}
                        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                              <TrendingUp size={24} />
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-gray-900">{t("report.title")}</h3>
                              <p className="text-sm text-gray-400 font-medium">{t("report.subtitle")}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handlePrint()}
                              className="px-6 py-2.5 rounded-xl bg-white text-gray-700 font-black text-sm border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                            >
                              <Printer size={18} />
                              <span>{t("report.print")}</span>
                            </button>
                            <button 
                              className="px-6 py-2.5 rounded-xl bg-[#1d6f42] text-white font-black text-sm hover:bg-[#165a35] active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-green-100"
                            >
                              <Download size={18} />
                              <span>Excel</span>
                            </button>
                          </div>
                        </div>
      
                        {/* Print Content Container */}
                        <div className="flex-1 p-8 overflow-auto" ref={printRef}>
                          <div className="space-y-10 print:space-y-6">
                            {/* Report Statistics Header */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-gray-900 text-white shadow-2xl relative overflow-hidden">
                              <div className="flex flex-col gap-1 relative z-10">
                                <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em]">{t("month")}</span>
                                <span className="text-lg font-black">{month}</span>
                              </div>
                              <div className="flex flex-col gap-1 relative z-10 border-r border-white/10 pr-6">
                                <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em]">{t("report.totalDue")}</span>
                                <span className="text-lg font-black text-blue-400">{totalDue.toLocaleString()} <span className="text-xs opacity-50">{t("currency")}</span></span>
                              </div>
                              <div className="flex flex-col gap-1 relative z-10 border-r border-white/10 pr-6">
                                <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em]">{t("report.includedEmployees")}</span>
                                <span className="text-lg font-black">{commissions.length} <span className="text-xs opacity-50">{t("employee")}</span></span>
                              </div>
                              <div className="flex flex-col gap-1 relative z-10 border-r border-white/10 pr-6">
                                <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em]">{t("report.commissionType")}</span>
                                <span className="text-lg font-black text-emerald-400">
                                  {getModeLabel(mode)}
                                </span>
                              </div>
                              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                            </div>
      
                            {/* Final Report Table */}
                            <div className="rounded-3xl border border-gray-100 overflow-hidden">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("employee")}</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("startDate")}</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("commission")}</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("bonuses")} (+)</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("deductions")} (-)</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("total")}</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("paymentStatus")}</th>
                                    <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest print:hidden">إجراءات</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {commissions.map((comm, idx) => {
                                    const net = (mode.startsWith("fixed") ? Number(comm.total) : Number(comm.commission)) + Number(comm.bonus) - Number(comm.deduction);
                                    return (
                                      <tr key={comm.employee_id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-5 font-black text-gray-900 text-sm">
                                          <div className="flex flex-col">
                                            <span>{comm.name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold">{comm.user_code}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-5 text-center font-medium text-gray-500 text-xs">{comm.start_date || "-"}</td>
                                        <td className="px-6 py-5 text-center font-black text-blue-600">{(mode.startsWith("fixed") ? Number(comm.total) : Number(comm.commission)).toLocaleString()}</td>
                                        <td className="px-6 py-5 text-center font-black text-emerald-500">{(Number(comm.bonus) || 0).toLocaleString()}</td>
                                        <td className="px-6 py-5 text-center font-black text-red-500">{(Number(comm.deduction) || 0).toLocaleString()}</td>
                                        <td className="px-6 py-5 text-center bg-gray-50/50">
                                          <span className="font-black text-gray-900 text-base">{net.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                          <div className="flex flex-col items-center gap-1.5">
                                            <button 
                                              onClick={() => handleCommChange(idx, "status", comm.status === "paid" ? "unpaid" : "paid")}
                                              className={cn(
                                                "w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner group/toggle",
                                                comm.status === "paid" ? "bg-emerald-500" : "bg-gray-300"
                                              )}
                                            >
                                              <div className={cn(
                                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md group-hover/toggle:scale-110",
                                                comm.status === "paid" ? "right-1" : "left-1"
                                              )} />
                                            </button>
                                            <span className={cn(
                                              "text-[9px] font-black uppercase tracking-widest",
                                              comm.status === "paid" ? "text-emerald-600" : "text-gray-400"
                                            )}>
                                              {comm.status === "paid" ? t("paidStatus") : t("unpaidStatus")}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-5 text-center print:hidden">
                                          <div className="flex items-center justify-center gap-2">
                                            <button 
                                              onClick={() => handleOpenEmailDialog(comm)}
                                              disabled={sendingEmail === comm.id}
                                              className={cn(
                                                "p-2 rounded-xl transition-all shadow-sm",
                                                comm.status === 'paid' 
                                                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white" 
                                                  : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                                              )}
                                              title={comm.status === 'paid' ? "إرسال سند سداد" : "إرسال مطالبة مالية"}
                                            >
                                              {sendingEmail === comm.id ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                                            </button>
                                            <button 
                                              onClick={() => handlePrint()}
                                              className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-600 hover:text-white transition-all shadow-sm"
                                              title="طباعة السند"
                                            >
                                              <Printer size={16} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-12 pt-16 mt-16 border-t border-dashed border-gray-200 opacity-0 print:opacity-100 h-0 print:h-auto overflow-hidden">
                              <div className="text-center">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-12">{t("report.accountantSignature")}</span>
                                <div className="w-48 h-px bg-gray-200 mx-auto" />
                              </div>
                              <div className="text-center">
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-12">{t("report.managerApproval")}</span>
                                <div className="w-48 h-px bg-gray-200 mx-auto" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Version Footer */}
          <div className="flex items-center justify-center gap-6 text-slate-500 font-bold text-[10px] uppercase tracking-widest opacity-50">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>Version 1.2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              <span>Support: Info@zoolspeed.com</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, isRtl, suffix }: { label: string; value: string; icon: React.ReactNode; color: "blue" | "emerald" | "amber"; isRtl: boolean; suffix?: string }) {
  const colors = {
    blue: "bg-blue-500 text-blue-600 shadow-blue-500/20 border-blue-500/20",
    emerald: "bg-emerald-500 text-emerald-600 shadow-emerald-500/20 border-emerald-500/20",
    amber: "bg-amber-500 text-amber-600 shadow-amber-500/20 border-amber-500/20"
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div className={cn(
        "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110",
        colors[color].replace("text-", "bg-").split(" ")[0] + "/10",
        colors[color].split(" ")[1]
      )}>
        {icon}
      </div>
      <div className="flex flex-col gap-1 overflow-hidden">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] truncate">{label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-gray-900 tracking-tighter">{value}</span>
          {suffix && <span className="text-xs font-bold text-gray-400">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}
