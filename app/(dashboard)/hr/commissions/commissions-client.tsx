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
  Clock,
  Hash,
  Activity,
  CreditCard,
  Send,
  Mail,
  PieChart,
  ShieldCheck,
  Zap
} from "lucide-react";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { PageInstructions } from "@/components/page-instructions";

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
  
    const commissionInstructions = [
      {
        icon: <Activity size={24} />,
        title: t("instruction1.title"),
        description: t("instruction1.description")
      },
      {
        icon: <Users size={24} />,
        title: t("instruction2.title"),
        description: t("instruction2.description")
      },
      {
        icon: <Settings size={24} />,
        title: t("instruction3.title"),
        description: t("instruction3.description")
      },
      {
        icon: <Trash2 size={24} />,
        title: t("instruction4.title"),
        description: t("instruction4.description")
      },
      {
        icon: <Save size={24} />,
        title: t("instruction5.title"),
        description: t("instruction5.description")
      },
      {
        icon: <CheckCircle size={24} />,
        title: t("instruction6.title"),
        description: t("instruction6.description")
      },
      {
        icon: <Mail size={24} />,
        title: t("instruction7.title"),
        description: t("instruction7.description")
      },
      {
        icon: <Printer size={24} />,
        title: t("instruction8.title"),
        description: t("instruction8.description")
      }
    ];

  const [activeTab, setActiveTab] = useState<"manage" | "report">("manage");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);
  
  // Email Dialog State
  const [emailDialog, setEmailDialog] = useState<{show: boolean, commission: any, email: string}>({
    show: false,
    commission: null,
    email: ""
  });
  
  // Filters
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [mode, setMode] = useState<"fixed_daily" | "fixed_monthly" | "percentage">("fixed_daily");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data
  const [packages, setPackages] = useState(initialPackages);
  const [savedGroups, setSavedGroups] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  
  // Notification
  const [notification, setNotification] = useState<{show: boolean, type: "success" | "error" | "loading" | "confirm", message: string, detail?: string, onConfirm?: () => void} | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `تقرير العمولات - ${month}`,
  });

  const showNotify = (type: "success" | "error" | "loading" | "confirm", message: string, detail?: string, onConfirm?: () => void) => {
    setNotification({ show: true, type, message, detail, onConfirm });
    if (type !== "loading" && type !== "confirm") {
      setTimeout(() => setNotification(null), 4000);
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

  const loadGroup = async (pkgId: string, groupMode: "fixed_daily" | "fixed_monthly" | "percentage") => {
    setSelectedPackageId(pkgId);
    setMode(groupMode);
    await fetchData(pkgId, groupMode, true);
    setActiveTab("report");
  };

  const fetchData = async (pkgId = selectedPackageId, currentMode = mode, onlySaved = false) => {
    if (!pkgId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/commissions?company_id=${companyId}&month=${month}&package_id=${pkgId}&mode=${currentMode}`);
      const data = await res.json();
      
      const employeeList = data.employees || [];
      const loadedComms = data.loadedCommissions || [];
      
      const commissionMap = new Map();
      loadedComms.forEach((c: any) => commissionMap.set(c.employee_id, c));
      
      let initialComms = [];
      
      if (onlySaved) {
        initialComms = loadedComms.map((c: any) => {
          const emp = employeeList.find((e: any) => e.id === c.employee_id) || {};
          return {
            id: c.id,
            employee_id: c.employee_id,
            name: emp.name || "موظف محذوف",
            iqama_number: emp.iqama_number || "",
            nationality: emp.nationality || "",
            phone: emp.phone || "",
            user_code: emp.user_code || "",
            email: emp.email || "",
            start_date: c.start_date ? format(new Date(c.start_date), "yyyy-MM-dd") : "",
            daily_amount: Number(c.daily_amount) || 0,
            days: Number(c.days) || 0,
            total: Number(c.total) || 0,
            percentage: Number(c.percentage) || 0,
            revenue: Number(c.revenue) || 0,
            commission: Number(c.commission) || 0,
            remaining: Number(c.remaining) || 0,
            deduction: Number(c.deduction) || 0,
            bonus: Number(c.bonus) || 0,
            status: c.status || "unpaid",
            selected: true
          };
        });
      } else {
        initialComms = employeeList.map((emp: any) => {
          const existing = commissionMap.get(emp.id) || {};
          return {
            id: existing.id,
            employee_id: emp.id,
            name: emp.name,
            iqama_number: emp.iqama_number,
            nationality: emp.nationality,
            phone: emp.phone,
            user_code: emp.user_code,
            email: emp.email || "",
            start_date: existing.start_date ? format(new Date(existing.start_date), "yyyy-MM-dd") : "",
            daily_amount: Number(existing.daily_amount) || 0,
            days: Number(existing.days) || 0,
            total: Number(existing.total) || 0,
            percentage: Number(existing.percentage) || 0,
            revenue: Number(existing.revenue) || 0,
            commission: Number(existing.commission) || 0,
            remaining: Number(existing.remaining) || 0,
            deduction: Number(existing.deduction) || 0,
            bonus: Number(existing.bonus) || 0,
            status: existing.status || "unpaid",
            selected: !!existing.id
          };
        });
      }
      
      setEmployees(employeeList);
      setCommissions(initialComms);
    } catch (error) {
      showNotify("error", t("notifications.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCommChange = async (index: number, field: string, value: any) => {
    const updated = [...commissions];
    updated[index][field] = value;
    
    if (field !== "selected" && field !== "status") {
      if (mode === "fixed_daily") {
        if (field === "daily_amount" || field === "days") {
          updated[index].total = (parseFloat(updated[index].daily_amount) || 0) * (parseFloat(updated[index].days) || 0);
        }
      } else if (mode === "fixed_monthly") {
        if (field === "daily_amount") {
          updated[index].total = parseFloat(updated[index].daily_amount) || 0;
          updated[index].days = 1;
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

    if (field === "status" && updated[index].id) {
      try {
        await fetch("/api/hr/commissions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_commission_id: updated[index].id,
            status: value
          })
        });
        showNotify("success", `تم تحديث حالة ${updated[index].name} إلى ${value === 'paid' ? 'تم الدفع' : 'لم يتم الدفع'}`);
      } catch (error) {
        console.error("Update status error:", error);
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
    showNotify("loading", "جاري حفظ البيانات...");
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
        const data = await res.json();
        showNotify("success", `تم حفظ التقرير بنجاح رقم ${data.serial_number}`, `تم حفظ عمولات لعدد ${selectedComms.length} موظف بنجاح.`);
        fetchSavedGroups();
        fetchData(selectedPackageId, mode, true);
        setActiveTab("report");
      } else {
        showNotify("error", t("notifications.error"));
      }
    } catch (error) {
      showNotify("error", t("notifications.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (pkgId: string, groupMode: string, pkgName: string) => {
    showNotify("confirm", "هل أنت متأكد من حذف التقرير؟", `سيتم حذف تقرير ${pkgName} بشكل نهائي ولن يمكن استعادته.`, () => {
      deleteGroup(pkgId, groupMode);
    });
  };

  const deleteGroup = async (pkgId: string, groupMode: string) => {
    try {
      const res = await fetch(`/api/hr/commissions?company_id=${companyId}&month=${month}&package_id=${pkgId}&mode=${groupMode}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showNotify("success", "تم حذف التقرير بنجاح", "تمت إزالة جميع بيانات التقرير من النظام.");
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

  const toggleGroupStatus = async (group: any) => {
    const newStatus = group.status === "paid" ? "unpaid" : "paid";
    try {
      const res = await fetch("/api/hr/commissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          month,
          package_id: group.package_id,
          mode: group.mode,
          status: newStatus
        })
      });
      if (res.ok) {
        showNotify("success", `تم تغيير الحالة إلى ${newStatus === 'paid' ? 'تم الدفع' : 'لم يتم الدفع'}`, "تم تحديث حالة جميع الموظفين في هذا التقرير.");
        fetchSavedGroups();
        if (selectedPackageId === group.package_id && mode === group.mode) {
          setCommissions(prev => prev.map(c => ({ ...c, status: newStatus })));
        }
      }
    } catch (error) {
      showNotify("error", t("notifications.error"));
    }
  };

  const handleOpenEmailDialog = (comm: any) => {
    if (!comm.id) {
      showNotify("error", "يجب حفظ التقرير أولاً قبل إرسال السند");
      return;
    }
    setEmailDialog({
      show: true,
      commission: comm,
      email: comm.email || ""
    });
  };

  const executeSendEmail = async () => {
    const { commission, email } = emailDialog;
    if (!email || !email.includes("@")) {
      showNotify("error", "يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    setSendingEmail(commission.id);
    
    showNotify("loading", "جاري إرسال البريد الإلكتروني...");
    
    try {
      const res = await fetch("/api/hr/commissions/send-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          commission_id: commission.id,
          email: email
        })
      });
      const data = await res.json();
      if (res.ok) {
        showNotify("success", "تم إرسال سند السداد بنجاح", `تم إرسال البريد الإلكتروني إلى ${commission.name} بنجاح.`);
        setEmailDialog({ ...emailDialog, show: false });
      } else {
        showNotify("error", data.error || "فشل إرسال البريد");
      }
    } catch (error) {
      showNotify("error", "حدث خطأ أثناء الإرسال");
    } finally {
      setSendingEmail(null);
    }
  };

  const totalDue = commissions.reduce((sum, c) => sum + (mode.startsWith("fixed") ? (Number(c.total) || 0) : (Number(c.commission) || 0)) + (Number(c.bonus) || 0) - (Number(c.deduction) || 0), 0);
  const totalPaid = commissions.filter(c => c.status === "paid").length;
  const totalUnpaid = commissions.length - totalPaid;

  const getModeLabel = (m: string) => {
    switch (m) {
      case "fixed_daily": return "مبلغ ثابت (يومي)";
      case "fixed_monthly": return "مبلغ ثابت (شهري)";
      case "percentage": return "نسبة مئوية";
      default: return m;
    }
  };

  const getModeColor = (m: string) => {
    switch (m) {
      case "fixed_daily": return "bg-blue-500";
      case "fixed_monthly": return "bg-purple-500";
      case "percentage": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header Section */}
      <div className="relative mb-8 rounded-[2rem] bg-gradient-to-r from-[#1e293b] to-[#334155] p-8 text-white shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <DollarSign size={32} className="text-blue-400" />
              </div>
              <div>
                  <h1 className="text-3xl font-black tracking-tight">{t("title")}</h1>
                  <div className="flex items-center gap-4 mt-1">
                    <p className="text-blue-200 font-medium opacity-80">{t("subtitle")}</p>
                    <div className="h-4 w-px bg-white/10" />
                    <PageInstructions 
                      title={t("instructionsTitle")}
                      instructions={commissionInstructions}
                      triggerText={t("instructionsTrigger")}
                    />
                  </div>
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
                  <span>{t("manageCommissions")}</span>
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
                  <span>{t("commissionsReport")}</span>
                </div>
              </button>
            </div>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-md w-full p-8 text-center overflow-hidden relative">
              <div className={cn(
                "absolute top-0 left-0 w-full h-2",
                notification.type === "success" ? "bg-emerald-500" :
                notification.type === "error" ? "bg-red-500" :
                notification.type === "confirm" ? "bg-amber-500" : "bg-blue-500"
              )} />
              
              <div className={cn(
                "mx-auto h-20 w-20 rounded-3xl flex items-center justify-center mb-6 shadow-lg",
                notification.type === "success" ? "bg-emerald-50 text-emerald-500" :
                notification.type === "error" ? "bg-red-50 text-red-500" :
                notification.type === "confirm" ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
              )}>
                {notification.type === "success" && <CheckCircle size={40} />}
                {notification.type === "error" && <AlertCircle size={40} />}
                {notification.type === "confirm" && <Trash2 size={40} />}
                {notification.type === "loading" && <Loader2 size={40} className="animate-spin" />}
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-2">{notification.message}</h3>
              {notification.detail && <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">{notification.detail}</p>}

              <div className="flex items-center gap-3">
                {notification.type === "confirm" ? (
                  <>
                    <button 
                      onClick={() => setNotification(null)}
                      className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-700 font-black text-sm hover:bg-gray-200 transition-all"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={() => {
                        notification.onConfirm?.();
                        setNotification(null);
                      }}
                      className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 shadow-xl shadow-red-100 transition-all"
                    >
                      تأكيد الحذف
                    </button>
                  </>
                ) : (
                  notification.type !== "loading" && (
                    <button 
                      onClick={() => setNotification(null)}
                      className="w-full py-4 rounded-2xl bg-gray-900 text-white font-black text-sm hover:bg-gray-800 shadow-xl transition-all"
                    >
                      حسناً
                    </button>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Input Dialog */}
      <AnimatePresence>
        {emailDialog.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
                  <div className={cn(
                    "absolute top-0 left-0 w-full h-2",
                    emailDialog.commission?.status === 'paid' ? "bg-emerald-500" : "bg-red-500"
                  )} />
                  <button 
                    onClick={() => setEmailDialog({ ...emailDialog, show: false })}
                    className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-all"
                  >
                    <X size={20} />
                  </button>
    
                  <div className="flex items-center gap-4 mb-8">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm border",
                      emailDialog.commission?.status === 'paid' ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-red-50 text-red-500 border-red-100"
                    )}>
                      <Mail size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">
                        {emailDialog.commission?.status === 'paid' ? 'إرسال سند سداد' : 'إرسال مطالبة مالية'}
                      </h3>
                      <p className="text-sm text-gray-400 font-medium">
                        {emailDialog.commission?.status === 'paid' ? 'سيتم إرسال تأكيد بالصرف للموظف' : 'سيتم إرسال إشعار مطالبة مالية لتنبيه الموظف بسرعة السداد'}
                      </p>
                    </div>
                  </div>
    
                  <div className="space-y-6">
                    <div className={cn(
                      "p-4 rounded-2xl border mb-6",
                      emailDialog.commission?.status === 'paid' ? "bg-emerald-50/30 border-emerald-100/50" : "bg-red-50/30 border-red-100/50"
                    )}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase">الموظف</p>
                        <p className="font-black text-gray-900">{emailDialog.commission?.name}</p>
                      </div>
                    </div>
                  </div>
  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2 block">البريد الإلكتروني</label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="email"
                        value={emailDialog.email}
                        onChange={(e) => setEmailDialog({ ...emailDialog, email: e.target.value })}
                        placeholder="employee@example.com"
                        className="w-full pl-4 pr-12 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold transition-all text-sm text-gray-900"
                        autoFocus
                      />
                    </div>
                  </div>
  
                  <div className="flex items-center gap-3 pt-4">
                    <button 
                      onClick={() => setEmailDialog({ ...emailDialog, show: false })}
                      className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-700 font-black text-sm hover:bg-gray-200 transition-all"
                    >
                      إلغاء
                    </button>
                      <button 
                        onClick={executeSendEmail}
                        className={cn(
                          "flex-2 px-8 py-4 rounded-2xl text-white font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2",
                          emailDialog.commission?.status === 'paid' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-red-600 hover:bg-red-700 shadow-red-100"
                        )}
                      >
                      <Send size={18} />
                        <span>{emailDialog.commission?.status === 'paid' ? 'إرسال السند' : 'إرسال المطالبة'}</span>
                      </button>
                    </div>
                  </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar / Filters */}
          <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8 lg:self-start">
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
                        className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-sm transition-all"
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
                        className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-sm transition-all appearance-none"
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
                      <span>إضافة باقة عمولة جديدة</span>
                    </Link>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">{t("commissionType")}</label>

                  <div className="flex flex-col gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                    <button 
                      onClick={() => setMode("fixed_daily")}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
                        mode === "fixed_daily" ? "bg-white text-blue-600 shadow-md border border-gray-100" : "text-gray-700 hover:text-gray-900"
                      )}
                    >
                      <Activity size={14} />
                      <span>مبلغ ثابت (يومي)</span>
                    </button>
                    <button 
                      onClick={() => setMode("fixed_monthly")}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
                        mode === "fixed_monthly" ? "bg-white text-purple-600 shadow-md border border-gray-100" : "text-gray-700 hover:text-gray-900"
                      )}
                    >
                      <Calendar size={14} />
                      <span>مبلغ ثابت (شهري)</span>
                    </button>
                    <button 
                      onClick={() => setMode("percentage")}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2",
                        mode === "percentage" ? "bg-white text-amber-600 shadow-md border border-gray-100" : "text-gray-700 hover:text-gray-900"
                      )}
                    >
                      <Percent size={14} />
                      <span>نسبة مئوية</span>
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
                                "absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm group-hover/toggle:scale-110",
                                group.status === "paid" ? "right-0.5" : "left-0.5"
                              )} />
                            </button>
                            <span className={cn(
                              "text-[7px] font-black uppercase",
                              group.status === "paid" ? "text-emerald-600" : "text-gray-400"
                            )}>
                              {group.status === "paid" ? "مدفوع" : "معلق"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100/50">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-gray-400 font-bold uppercase">إجمالي العمولات</span>
                          <span className="text-xs font-black text-gray-900">{Number(group.total_amount).toLocaleString()} ر.س</span>
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

          {/* Main Content Area - Stats Only */}
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
          </div>
        </div>

        {/* Employee Details Table - Full Width Below Grid */}
        <div className="mt-8">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
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
                                className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-xs transition-all w-64"
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

                    <div className="flex-1 overflow-auto" style={{ maxHeight: '515px' }}>
                        {commissions.length > 0 ? (
                          <table className="w-full border-collapse">
                            <thead className="sticky top-0 z-10">
                              <tr className="bg-gray-50 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 border-b border-gray-100 w-10 bg-gray-50">
                                  <input 
                                    type="checkbox"
                                    checked={filteredCommissions.length > 0 && filteredCommissions.every(c => c.selected)}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                </th>
                                <th className="px-6 py-5 text-right text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">الموظف</th>
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">تاريخ البداية</th>
                                {mode === "fixed_daily" && (
                                  <>
                                    <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">{t("dailyAmount")}</th>
                                    <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">{t("days")}</th>
                                    <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">{t("total")}</th>
                                  </>
                                )}
                                {mode === "fixed_monthly" && (
                                  <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">المبلغ الشهري</th>
                                )}
                                {mode === "percentage" && (
                                  <>
                                    <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">{t("commissionPercent")}</th>
                                    <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">{t("revenue")}</th>
                                    <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">{t("commission")}</th>
                                  </>
                                )}
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">{t("deductions")}</th>
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">{t("bonuses")}</th>
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">الإجمالي</th>
                                <th className="px-6 py-5 text-center text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">{t("paymentStatus")}</th>
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
                                      className="w-32 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-900 focus:bg-white focus:border-blue-500 outline-none text-xs font-bold transition-all"
                                    />
                                  </td>
                                  {mode === "fixed_daily" && (
                                    <>
                                      <td className="px-6 py-4 text-center">
                                        <input 
                                          type="number" 
                                          value={comm.daily_amount}
                                          onChange={(e) => handleCommChange(realIdx, "daily_amount", e.target.value)}
                                          className="w-24 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-900 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black transition-all"
                                        />
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <input 
                                          type="number" 
                                          value={comm.days}
                                          onChange={(e) => handleCommChange(realIdx, "days", e.target.value)}
                                          className="w-20 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-900 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black transition-all"
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
                                          className="w-32 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-900 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black transition-all"
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
                                              className="w-24 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-900 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black transition-all pr-6"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">%</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                          <input 
                                            type="number" 
                                            value={comm.revenue}
                                            onChange={(e) => handleCommChange(realIdx, "revenue", e.target.value)}
                                            className="w-28 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-gray-900 text-center focus:bg-white focus:border-blue-500 outline-none text-xs font-black transition-all"
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
                                          {comm.status === "paid" ? "تم الدفع" : "معلق"}
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
                      {/* Report Statistics Header */}
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
                          <span className="text-[10px] text-white/40 uppercase font-black tracking-[0.2em]">نوع العمولات</span>
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
                              <th className="px-6 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">الموظف</th>
                              <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ البداية</th>
                              <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">العمولة المستحقة</th>
                              <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">المكافآت (+)</th>
                              <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">الخصومات (-)</th>
                              <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">الصافي النهائي</th>
                              <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">الحالة</th>
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
                                          {comm.status === "paid" ? "تم الدفع" : "معلق"}
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
