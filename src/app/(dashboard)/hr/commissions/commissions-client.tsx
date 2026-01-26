"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Filter, 
  Save, 
  Trash2, 
  Download, 
  Printer, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ChevronRight,
  Search,
  Plus,
  ArrowLeft,
  Settings,
  MoreVertical,
  Eye,
  Percent,
  TrendingDown,
  UserCheck,
  UserMinus,
  Briefcase,
  CheckSquare,
  Square,
  RefreshCw,
  X,
  Clock
} from "lucide-react";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useReactToPrint } from "react-to-print";

interface CommissionsClientProps {
  companyId: number;
  initialPackages: any[];
}

export function CommissionsClient({ companyId, initialPackages }: CommissionsClientProps) {
  const router = useRouter();
  const t = useTranslations("hr.commissions");
  const tCommon = useTranslations("common");
  const { locale } = useLocale();
  const isRtl = locale === "ar";
  
  const [activeTab, setActiveTab] = useState<"manage" | "report">("manage");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Filters
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [mode, setMode] = useState<"fixed" | "percentage">("fixed");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data
  const [packages, setPackages] = useState(initialPackages);
  const [savedGroups, setSavedGroups] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  
  // Notification
  const [notification, setNotification] = useState<{show: boolean, type: "success" | "error" | "loading", message: string} | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `تقرير العمولات - ${month}`,
  });

  const showNotify = (type: "success" | "error" | "loading", message: string) => {
    setNotification({ show: true, type, message });
    if (type !== "loading") {
      setTimeout(() => setNotification(null), 3000);
    }
  };

  useEffect(() => {
    fetchSavedGroups();
  }, [month]);

  const fetchSavedGroups = async () => {
    try {
      const res = await fetch(`/api/hr/commissions?company_id=${companyId}&month=${month}`);
      const data = await res.json();
      setSavedGroups(data.savedGroups || []);
    } catch (error) {
      console.error("Error fetching saved groups:", error);
    }
  };

  const loadGroup = async (pkgId: string, groupMode: "fixed" | "percentage") => {
    setSelectedPackageId(pkgId);
    setMode(groupMode);
    await fetchData(pkgId, groupMode);
  };

  const fetchData = async (pkgId = selectedPackageId, currentMode = mode) => {
    if (!pkgId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/commissions?company_id=${companyId}&month=${month}&package_id=${pkgId}&mode=${currentMode}`);
      const data = await res.json();
      
      const employeeList = data.employees || [];
      const loadedComms = data.loadedCommissions || [];
      
      const commissionMap = new Map();
      loadedComms.forEach((c: any) => commissionMap.set(c.employee_id, c));
      
      const initialComms = employeeList.map((emp: any) => {
        const existing = commissionMap.get(emp.id) || {};
        return {
          employee_id: emp.id,
          name: emp.name,
          iqama_number: emp.iqama_number,
          nationality: emp.nationality,
          phone: emp.phone,
          user_code: emp.user_code,
          start_date: existing.start_date ? format(new Date(existing.start_date), "yyyy-MM-dd") : "",
          daily_amount: existing.daily_amount || 0,
          days: existing.days || 0,
          total: existing.total || 0,
          percentage: existing.percentage || 0,
          revenue: existing.revenue || 0,
          commission: existing.commission || 0,
          remaining: existing.remaining || 0,
          deduction: existing.deduction || 0,
          bonus: existing.bonus || 0,
          status: existing.status || "unpaid",
          selected: true
        };
      });
      
      setEmployees(employeeList);
      setCommissions(initialComms);
    } catch (error) {
      showNotify("error", t("notifications.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCommChange = (index: number, field: string, value: any) => {
    const updated = [...commissions];
    updated[index][field] = value;
    
    // Recalculate
    if (field !== "selected") {
      if (mode === "fixed") {
        if (field === "daily_amount" || field === "days") {
          updated[index].total = (parseFloat(updated[index].daily_amount) || 0) * (parseFloat(updated[index].days) || 0);
        }
      } else {
        if (field === "percentage" || field === "revenue") {
          const revenue = parseFloat(updated[index].revenue) || 0;
          const percentage = parseFloat(updated[index].percentage) || 0;
          updated[index].commission = (revenue * percentage) / 100;
          updated[index].remaining = revenue - updated[index].commission;
        }
      }
    }
    
    setCommissions(updated);
  };

  const filteredCommissions = useMemo(() => {
    if (!searchQuery.trim()) return commissions;
    const q = searchQuery.toLowerCase().trim();
    return commissions.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.iqama_number.includes(q) || 
      c.user_code.includes(q)
    );
  }, [commissions, searchQuery]);

  const toggleSelectAll = () => {
    const allSelected = filteredCommissions.every(c => c.selected);
    setCommissions(prev => {
      const filteredIds = new Set(filteredCommissions.map(c => c.employee_id));
      return prev.map(c => {
        if (filteredIds.has(c.employee_id)) {
          return { ...c, selected: !allSelected };
        }
        return c;
      });
    });
  };

  const removeUnselected = () => {
    setCommissions(prev => prev.filter(c => c.selected));
  };

  const getRealIndex = (filteredIdx: number) => {
    const filteredItem = filteredCommissions[filteredIdx];
    return commissions.findIndex(c => c.employee_id === filteredItem.employee_id);
  };

  const selectedCount = commissions.filter(c => c.selected).length;

  const saveCommissions = async () => {
    if (!selectedPackageId) {
      showNotify("error", t("notifications.error"));
      return;
    }

    const selectedComms = commissions.filter(c => c.selected);
    if (selectedComms.length === 0) {
      showNotify("error", "يرجى تحديد موظف واحد على الأقل");
      return;
    }

    setSaving(true);
    showNotify("loading", tCommon("loading"));
    try {
      const res = await fetch("/api/hr/commissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          month,
          mode,
          package_id: selectedPackageId,
          commissions: selectedComms
        })
      });
      
      if (res.ok) {
        showNotify("success", t("notifications.saveSuccess"));
        fetchSavedGroups();
      } else {
        showNotify("error", t("notifications.error"));
      }
    } catch (error) {
      showNotify("error", t("notifications.error"));
    } finally {
      setSaving(false);
    }
  };

  const deleteGroup = async (pkgId: string, groupMode: string) => {
    if (!confirm(t("notifications.deleteConfirm"))) return;
    
    try {
      const res = await fetch(`/api/hr/commissions?company_id=${companyId}&month=${month}&package_id=${pkgId}&mode=${groupMode}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showNotify("success", t("notifications.deleteSuccess"));
        fetchSavedGroups();
        if (selectedPackageId === pkgId && mode === groupMode) {
          setEmployees([]);
          setCommissions([]);
          setSelectedPackageId("");
        }
      }
    } catch (error) {
      showNotify("error", t("notifications.error"));
    }
  };

  // Stats
  const totalDue = commissions.reduce((sum, c) => sum + (mode === "fixed" ? (Number(c.total) || 0) : (Number(c.commission) || 0)) + (Number(c.bonus) || 0) - (Number(c.deduction) || 0), 0);
  const totalPaid = commissions.filter(c => c.status === "paid").length;
  const totalUnpaid = commissions.length - totalPaid;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="relative mb-8 rounded-[2rem] bg-gradient-to-r from-[#1e293b] to-[#334155] p-8 text-white shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <DollarSign size={32} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
              <p className="text-blue-200 font-medium opacity-80">{t("subtitle")}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm p-1.5 rounded-2xl border border-white/10">
            <button 
              onClick={() => setActiveTab("manage")}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300",
                activeTab === "manage" ? "bg-blue-500 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-2">
                <Settings size={16} />
                <span>إدارة العمولات</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab("report")}
              className={cn(
                "px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-300",
                activeTab === "report" ? "bg-blue-500 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span>تقرير العمولات</span>
              </div>
            </button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className={cn(
              "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-b-4 backdrop-blur-md",
              notification.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-500" :
              notification.type === "error" ? "bg-red-50 text-red-800 border-red-500" :
              "bg-blue-50 text-blue-800 border-blue-500"
            )}>
              {notification.type === "success" && <CheckCircle size={24} className="text-emerald-500" />}
              {notification.type === "error" && <AlertCircle size={24} className="text-red-500" />}
              {notification.type === "loading" && <Loader2 size={24} className="animate-spin text-blue-500" />}
              <span className="font-black text-sm">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar / Filters */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Filter Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
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

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t("commissionType")}</label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                  <button 
                    onClick={() => setMode("fixed")}
                    className={cn(
                      "py-2.5 rounded-xl text-xs font-black transition-all",
                      mode === "fixed" ? "bg-white text-blue-600 shadow-md border border-gray-100" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {t("fixedAmount")}
                  </button>
                  <button 
                    onClick={() => setMode("percentage")}
                    className={cn(
                      "py-2.5 rounded-xl text-xs font-black transition-all",
                      mode === "percentage" ? "bg-white text-blue-600 shadow-md border border-gray-100" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {t("percentage")}
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

          {/* Saved Groups Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
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
                    key={`${group.package_id}-${group.mode}`}
                    className="p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                          {pkg?.group_name || "باقة غير معروفة"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                          {group.mode === "fixed" ? t("fixedAmount") : t("percentage")}
                        </span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => loadGroup(group.package_id, group.mode)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-all"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => deleteGroup(group.package_id, group.mode)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100/50">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                        <Clock size={12} />
                        <span>{format(new Date(group.created_at), "yyyy/MM/dd HH:mm")}</span>
                      </div>
                      <ChevronRight size={14} className={cn("text-gray-300", isRtl && "rotate-180")} />
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

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              label="إجمالي المستحقات" 
              value={totalDue.toLocaleString()} 
              icon={<DollarSign size={24} />} 
              color="blue" 
              isRtl={isRtl}
              suffix="ر.س"
            />
            <StatCard 
              label="تم دفعها" 
              value={totalPaid.toString()} 
              icon={<UserCheck size={24} />} 
              color="emerald" 
              isRtl={isRtl}
              suffix="موظف"
            />
            <StatCard 
              label="بانتظار الدفع" 
              value={totalUnpaid.toString()} 
              icon={<UserMinus size={24} />} 
              color="amber" 
              isRtl={isRtl}
              suffix="موظف"
            />
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
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
                            {mode === "fixed" ? t("fixedSystem") : t("percentageSystem")} • {month}
                          </p>
                          {commissions.length > 0 && (
                            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                              {selectedCount} / {commissions.length} مختار
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
                              placeholder="بحث بالاسم أو الكود..."
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
                              title={filteredCommissions.every(c => c.selected) ? "إلغاء تحديد الكل" : "تحديد الكل"}
                            >
                              {filteredCommissions.every(c => c.selected) ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} />}
                              <span>{filteredCommissions.every(c => c.selected) ? "إلغاء الكل" : "تحديد الكل"}</span>
                            </button>

                            <button 
                              onClick={removeUnselected}
                              disabled={selectedCount === commissions.length || selectedCount === 0}
                              className="px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-black text-[10px] border border-red-100 hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                              <span>حذف غير المختار</span>
                            </button>

                            <button 
                              onClick={() => fetchData()}
                              className="px-4 py-2.5 rounded-xl bg-white text-gray-700 font-black text-[10px] border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                            >
                              <RefreshCw size={16} />
                              <span>تحديث</span>
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


                  {/* Table Content */}
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
                            <th className="px-6 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">الموظف</th>
                            <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">تاريخ البداية</th>
                            {mode === "fixed" ? (
                              <>
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("dailyAmount")}</th>
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("days")}</th>
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("total")}</th>
                              </>
                            ) : (
                              <>
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("commissionPercent")}</th>
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("revenue")}</th>
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("commission")}</th>
                              </>
                            )}
                            <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("deductions")}</th>
                            <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("bonuses")}</th>
                            <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">{t("paymentStatus")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredCommissions.map((comm, fIdx) => {
                            const realIdx = getRealIndex(fIdx);
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
                                {mode === "fixed" ? (
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
                                      <span className="font-black text-sm text-blue-600">{(comm.total).toFixed(2)}</span>
                                    </td>
                                  </>
                                ) : (
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
                                      <span className="font-black text-sm text-blue-600">{(comm.commission).toFixed(2)}</span>
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
                                  <select 
                                    value={comm.status}
                                    onChange={(e) => handleCommChange(realIdx, "status", e.target.value)}
                                    className={cn(
                                      "px-4 py-2 rounded-xl text-[10px] font-black outline-none border transition-all appearance-none cursor-pointer",
                                      comm.status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                    )}
                                  >
                                    <option value="unpaid">{t("unpaid")}</option>
                                    <option value="paid">{t("paid")}</option>
                                  </select>
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
                        <p className="font-black text-lg">لم يتم اختيار باقة أو لا يوجد موظفين</p>
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
                    {/* Report Statistics Header (Printable) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-gray-900 text-white shadow-2xl relative overflow-hidden">
                      <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em]">{t("month")}</span>
                        <span className="text-lg font-black">{month}</span>
                      </div>
                      <div className="flex flex-col gap-1 relative z-10 border-r border-white/10 pr-6">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em]">إجمالي المستحقات</span>
                        <span className="text-lg font-black text-blue-400">{totalDue.toLocaleString()} <span className="text-xs opacity-50">ر.س</span></span>
                      </div>
                      <div className="flex flex-col gap-1 relative z-10 border-r border-white/10 pr-6">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em]">الموظفين المشمولين</span>
                        <span className="text-lg font-black">{commissions.length} <span className="text-xs opacity-50">موظف</span></span>
                      </div>
                      <div className="flex flex-col gap-1 relative z-10 border-r border-white/10 pr-6">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em]">نسبة الإنجاز</span>
                        <span className="text-lg font-black text-emerald-400">
                          {commissions.length > 0 ? Math.round((totalPaid / commissions.length) * 100) : 0}%
                        </span>
                      </div>
                      
                      {/* Decorative elements for print/screen */}
                      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
                    </div>

                    {/* Final Report Table */}
                    <div className="rounded-3xl border border-gray-100 overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">الموظف</th>
                            <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ البداية</th>
                            <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">العمولة المستحقة</th>
                            <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">المكافآت (+)</th>
                            <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">الخصومات (-)</th>
                            <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">الصافي النهائي</th>
                            <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {commissions.map((comm, idx) => {
                            const net = (mode === "fixed" ? comm.total : comm.commission) + Number(comm.bonus) - Number(comm.deduction);
                            return (
                              <tr key={comm.employee_id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-5 font-black text-gray-900 text-sm">{comm.name}</td>
                                <td className="px-6 py-5 text-center font-medium text-gray-500 text-xs">{comm.start_date || "-"}</td>
                                <td className="px-6 py-5 text-center font-black text-blue-600">{(mode === "fixed" ? comm.total : comm.commission).toLocaleString()}</td>
                                <td className="px-6 py-5 text-center font-black text-emerald-500">{(Number(comm.bonus) || 0).toLocaleString()}</td>
                                <td className="px-6 py-5 text-center font-black text-red-500">{(Number(comm.deduction) || 0).toLocaleString()}</td>
                                <td className="px-6 py-5 text-center bg-gray-50/50">
                                  <span className="font-black text-gray-900 text-base">{net.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                  <span className={cn(
                                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                                    comm.status === "paid" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "bg-gray-200 text-gray-500"
                                  )}>
                                    {comm.status === "paid" ? "تم الدفع" : "معلق"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Signature Section for Report */}
                    <div className="grid grid-cols-2 gap-12 pt-16 mt-16 border-t border-dashed border-gray-200 opacity-0 print:opacity-100 h-0 print:h-auto overflow-hidden">
                      <div className="text-center">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-12">توقيع المحاسب</span>
                        <div className="w-48 h-px bg-gray-200 mx-auto" />
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-12">اعتماد المدير</span>
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
  );
}

function StatCard({ label, value, icon, color, isRtl, suffix }: { label: string; value: string; icon: React.ReactNode; color: "blue" | "emerald" | "amber"; isRtl: boolean; suffix?: string }) {
  const colors = {
    blue: "bg-blue-500 text-blue-600 shadow-blue-100 border-blue-100",
    emerald: "bg-emerald-500 text-emerald-600 shadow-emerald-100 border-emerald-100",
    amber: "bg-amber-500 text-amber-600 shadow-amber-100 border-amber-100"
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div className={cn(
        "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110",
        colors[color].replace("text-", "bg-").replace("shadow-", "shadow-").split(" ")[0] + "/10",
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
