"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Calendar,
  ChevronDown,
  Wallet,
  HandCoins,
  FileText,
  Calculator,
  Printer,
  FileSpreadsheet,
  BarChart3,
  Home,
  Filter,
  Search,
  Eye,
  TrendingUp,
  Folder,
  Info,
  Paperclip,
  ExternalLink,
  FileImage,
  File,
  Trash2,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExpenseItem {
  id: number;
  expense_type: string;
  expense_date: string;
  employee_name: string;
  employee_iqama: string;
  amount: number;
  tax_value: number;
  net_amount: number;
  account_id: number;
  account_code: string;
  account_name: string;
  cost_center_id: number;
  center_code: string;
  center_name: string;
  description: string;
  attachment: string;
  month_reference: string;
}

interface DeductionItem {
  id: number;
  deduction_type: string;
  expense_date: string;
  employee_name: string;
  employee_iqama: string;
  amount: number;
  account_id: number;
  account_code: string;
  account_name: string;
  cost_center_id: number;
  center_code: string;
  center_name: string;
  description: string;
  status: string;
  attachment: string;
  month_reference: string;
}

interface AccountOption {
  id: number;
  account_code: string;
  account_name: string;
}

interface CostCenterOption {
  id: number;
  center_code: string;
  center_name: string;
}

interface PayrollItem {
  id: number;
  payroll_month: string;
  total_amount: number;
  created_at: string;
  employee_count: number;
  items: any[];
}

interface ReportData {
  companyInfo: {
    id: number;
    name: string;
    logo_path: string;
    currency: string;
  };
  month: string;
  reportType: string;
  expensesGrouped: Record<string, ExpenseItem[]>;
  deductionsGrouped: Record<string, DeductionItem[]>;
  payrolls: PayrollItem[];
  stats: {
    totalExpenses: number;
    totalDeductions: number;
    totalPayrolls: number;
    totalAll: number;
    expensesCount: number;
    deductionsCount: number;
    payrollsCount: number;
  };
}

interface ExpensesReportClientProps {
  companyId: number;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const UPLOADS_BASE_URL = "https://accounts.zoolspeed.com/uploads/";

const getAttachmentUrl = (attachment: string | null | undefined) => {
  if (!attachment) return null;
  if (attachment.startsWith('http')) return attachment;
  const cleanPath = attachment.replace(/^uploads\//, '');
  return `${UPLOADS_BASE_URL}${cleanPath}`;
};

const isImageFile = (filename: string) => {
  const ext = filename.toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getMonthName = (monthStr: string) => {
  const date = new Date(monthStr + "-01");
  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const generateMonthOptions = () => {
  const options = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  for (let year = currentYear; year >= currentYear - 2; year--) {
    const startMonth = year === currentYear ? currentMonth : 12;
    for (let month = startMonth; month >= 1; month--) {
      const monthStr = `${year}-${month.toString().padStart(2, "0")}`;
      const label = `${monthNames[month - 1]} ${year}`;
      options.push({ value: monthStr, label });
    }
  }
  return options;
};

export function ExpensesReportClient({ companyId }: ExpensesReportClientProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [reportType, setReportType] = useState<"expenses" | "deductions" | "all">(
    "expenses"
  );
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | DeductionItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [notification, setNotification] = useState<{show: boolean; type: 'success' | 'error'; message: string}>({show: false, type: 'success', message: ''});
  const [editForm, setEditForm] = useState<any>({});
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterOption[]>([]);
  const [statusUpdating, setStatusUpdating] = useState<number | null>(null);

  const monthOptions = generateMonthOptions();

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/expenses/report?month=${selectedMonth}&report_type=${reportType}`
      );
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        const groups: Record<string, boolean> = {};
        Object.keys(json.data.expensesGrouped || {}).forEach((key) => {
          groups[`expense-${key}`] = true;
        });
        Object.keys(json.data.deductionsGrouped || {}).forEach((key) => {
          groups[`deduction-${key}`] = true;
        });
        setExpandedGroups(groups);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, reportType]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    alert("جاري تصدير التقرير إلى Excel...");
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const showItemDetails = (item: ExpenseItem | DeductionItem) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({show: true, type, message});
    setTimeout(() => setNotification({show: false, type: 'success', message: ''}), 3000);
  };

  const fetchMetadata = async () => {
    try {
      const [accountsRes, centersRes] = await Promise.all([
        fetch(`/api/accounts?company_id=${companyId}`),
        fetch(`/api/expenses/metadata?company_id=${companyId}`)
      ]);
      const accountsData = await accountsRes.json();
      const centersData = await centersRes.json();
      
      if (accountsData.success) {
        setAccounts(accountsData.accounts || []);
      }
      
      // metadata API returns costCenters directly in the root or centersData.costCenters
      if (centersData.costCenters) {
        setCostCenters(centersData.costCenters);
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  const handleDeleteClick = (item: ExpenseItem | DeductionItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleEditClick = async (item: ExpenseItem | DeductionItem) => {
    setSelectedItem(item);
    // Fetch metadata first to ensure lists are populated
    await fetchMetadata();
    
    setEditForm({
      id: item.id,
      expense_date: item.expense_date?.split('T')[0] || '',
      employee_name: item.employee_name || '',
      employee_iqama: item.employee_iqama || '',
      amount: item.amount || 0,
      tax_value: 'tax_value' in item ? item.tax_value || 0 : 0,
      net_amount: 'net_amount' in item ? item.net_amount || item.amount || 0 : item.amount || 0,
      account_id: item.account_id || '',
      cost_center_id: item.cost_center_id || '',
      expense_type: 'expense_type' in item ? item.expense_type : (item as any).deduction_type,
      description: item.description || '',
      month_reference: item.month_reference || selectedMonth,
      attachment: item.attachment || '',
      status: 'status' in item ? item.status : undefined,
      newFile: null as File | null
    });
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setDeleteLoading(true);
    try {
      const isExpense = 'expense_type' in selectedItem;
      const endpoint = isExpense 
        ? `/api/expenses/report?id=${selectedItem.id}&type=expense`
        : `/api/expenses/report?id=${selectedItem.id}&type=deduction`;
      
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        showNotification('success', 'تم حذف العملية بنجاح');
        setShowDeleteModal(false);
        fetchReportData();
      } else {
        showNotification('error', data.message || 'حدث خطأ أثناء الحذف');
      }
    } catch (error) {
      showNotification('error', 'حدث خطأ أثناء الحذف');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedItem) return;
    setEditLoading(true);
    try {
      const isExpense = 'expense_type' in selectedItem;
      const formData = new FormData();
      
      formData.append('id', editForm.id.toString());
      formData.append('type', isExpense ? 'expense' : 'deduction');
      formData.append('expense_date', editForm.expense_date);
      formData.append('month_reference', editForm.month_reference);
      formData.append('employee_name', editForm.employee_name);
      formData.append('employee_iqama', editForm.employee_iqama);
      formData.append('amount', editForm.amount.toString());
      formData.append('account_id', editForm.account_id?.toString() || '');
      formData.append('cost_center_id', editForm.cost_center_id?.toString() || '');
      formData.append('expense_type', editForm.expense_type);
      formData.append('description', editForm.description);
      
      if ('tax_value' in editForm) {
        formData.append('tax_value', editForm.tax_value.toString());
        formData.append('net_amount', (editForm.net_amount || (editForm.amount - editForm.tax_value)).toString());
      }
      
      if (editForm.status) {
        formData.append('status', editForm.status);
      }

      if (editForm.newFile) {
        formData.append('attachment', editForm.newFile);
      } else {
        formData.append('attachment', editForm.attachment || '');
      }

      const res = await fetch('/api/expenses/report', {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        showNotification('success', 'تم تعديل العملية بنجاح');
        setShowEditModal(false);
        fetchReportData();
      } else {
        showNotification('error', data.message || 'حدث خطأ أثناء التعديل');
      }
    } catch (error) {
      console.error('Update error:', error);
      showNotification('error', 'حدث خطأ أثناء التعديل');
    } finally {
      setEditLoading(false);
    }
  };

  const calculateNetAmount = (amount: number, taxValue: number) => {
    return amount - taxValue;
  };

  const handleToggleDeductionStatus = async (deduction: DeductionItem) => {
    setStatusUpdating(deduction.id);
    try {
      const newStatus = deduction.status === 'completed' ? 'pending' : 'completed';
      
      const formData = new FormData();
      formData.append('id', deduction.id.toString());
      formData.append('type', 'deduction');
      formData.append('expense_date', deduction.expense_date?.split('T')[0] || '');
      formData.append('month_reference', deduction.month_reference || selectedMonth);
      formData.append('employee_name', deduction.employee_name || '');
      formData.append('employee_iqama', deduction.employee_iqama || '');
      formData.append('amount', (deduction.amount || 0).toString());
      formData.append('account_id', (deduction.account_id || '').toString());
      formData.append('cost_center_id', (deduction.cost_center_id || '').toString());
      formData.append('expense_type', deduction.deduction_type || '');
      formData.append('description', deduction.description || '');
      formData.append('attachment', deduction.attachment || '');
      formData.append('status', newStatus);

      const res = await fetch('/api/expenses/report', {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        showNotification('success', newStatus === 'completed' ? 'تم تحديث الحالة إلى: مدفوع' : 'تم تحديث الحالة إلى: غير مدفوع');
        fetchReportData();
      } else {
        showNotification('error', data.message || 'حدث خطأ أثناء تغيير الحالة');
      }
    } catch (error) {
      console.error('Status update error:', error);
      showNotification('error', 'حدث خطأ أثناء تغيير الحالة');
    } finally {
      setStatusUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">لا توجد بيانات</p>
      </div>
    );
  }

  const { companyInfo, stats, expensesGrouped, deductionsGrouped, payrolls } = data;

    return (
      <div
        className="min-h-screen bg-transparent rtl print:bg-white"
        dir="rtl"
      >

      <div className="w-[98%] mx-auto py-4 space-y-4 print:w-full print:p-2">
        {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="print:shadow-none"
          >
            <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] text-white rounded-3xl print:rounded-none print:shadow-none">
              <div className="h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x print:hidden" />

            
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {companyInfo?.logo_path ? (
                    <img
                      src={companyInfo.logo_path}
                      alt="Logo"
                      className="w-16 h-16 rounded-full border-2 border-white/20 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg border-2 border-white/20">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-lg font-bold text-white/90">
                      {companyInfo?.name || "اسم الشركة"}
                    </h2>
                    <p className="text-blue-200 text-xs">
                      نظام إدارة المنصرفات والرواتب
                    </p>
                  </div>
                </div>

                <div className="text-center flex-1">
                  <h1 className="text-xl lg:text-2xl font-bold flex items-center justify-center gap-3">
                    <TrendingUp className="w-7 h-7 text-amber-400" />
                    التقرير المالي الشهري
                  </h1>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl px-4 py-3 border border-white/20 print:hidden">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-amber-400" />
                    <div>
                      <p className="text-xs text-blue-200">الشهر المختار</p>
                      <p className="text-base font-bold">
                        {getMonthName(selectedMonth)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards - Main Totals (Always Visible) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              label: "إجمالي المنصرفات",
              value: stats.totalExpenses,
              count: stats.expensesCount,
              countLabel: "عملية",
              icon: Wallet,
              gradient: "from-blue-600 to-blue-700",
              bgGradient: "from-blue-50 to-white",
              accent: "blue",
              description: "تشمل المنصرفات التشغيلية والرواتب"
            },
            {
              label: "إجمالي الاستقطاعات",
              value: stats.totalDeductions,
              count: stats.deductionsCount,
              countLabel: "عملية",
              icon: HandCoins,
              gradient: "from-rose-600 to-rose-700",
              bgGradient: "from-rose-50 to-white",
              accent: "rose",
              description: "إجمالي الخصومات والاستقطاعات"
            },
            {
              label: "مسيرات الرواتب",
              value: stats.totalPayrolls,
              count: stats.payrollsCount,
              countLabel: "مسير",
              icon: FileText,
              gradient: "from-emerald-600 to-emerald-700",
              bgGradient: "from-emerald-50 to-white",
              accent: "emerald",
              description: "كشوفات الرواتب المعتمدة",
              link: "/salary-payrolls"
            },
            {
              label: "المجموع الكلي",
              value: stats.totalAll,
              count: stats.expensesCount + stats.deductionsCount + stats.payrollsCount,
              countLabel: "عملية إجمالية",
              icon: Calculator,
              gradient: "from-amber-600 to-amber-700",
              bgGradient: "from-amber-50 to-white",
              accent: "amber",
              description: "صافي التدفقات المالية للشهر"
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => stat.link && (window.location.href = stat.link)}
              className={`relative group ${stat.link ? "cursor-pointer" : ""}`}
            >
              <Card className={`border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-gradient-to-br ${stat.bgGradient} relative z-10 h-full border-b-4 border-${stat.accent}-500/30`}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className={`text-sm font-bold text-${stat.accent}-700 tracking-wide`}>{stat.label}</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl font-black text-slate-800">{formatNumber(stat.value)}</span>
                        <span className="text-[10px] font-bold text-slate-400">ر.س</span>
                      </div>
                    </div>

                    <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full bg-${stat.accent}-500 animate-pulse`} />
                        <span className="text-xs font-bold text-slate-600">{stat.count} {stat.countLabel}</span>
                      </div>
                      <Info className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Tabs - Selection Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="print:hidden"
        >
          <div className="bg-white/40 backdrop-blur-xl p-2 rounded-[3rem] shadow-inner border border-white/50 inline-flex w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
              {[
                {
                  id: "expenses" as const,
                  label: "عرض المنصرفات",
                  icon: Wallet,
                  color: "blue",
                  gradient: "from-blue-500 to-blue-700",
                  sub: "كشف تفصيلي للمصروفات والرواتب"
                },
                {
                  id: "deductions" as const,
                  label: "عرض الاستقطاعات",
                  icon: HandCoins,
                  color: "rose",
                  gradient: "from-rose-500 to-rose-700",
                  sub: "كشف تفصيلي للخصومات والجزاءات"
                },
                {
                  id: "all" as const,
                  label: "التقرير الشامل",
                  icon: BarChart3,
                  color: "purple",
                  gradient: "from-blue-600 via-purple-600 to-rose-600",
                  sub: "رؤية موحدة لجميع الحركات المالية"
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReportType(tab.id)}
                  className={`relative flex items-center gap-4 p-4 rounded-[2.2rem] transition-all duration-500 group overflow-hidden ${
                    reportType === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl scale-[1.02] z-10`
                      : "bg-transparent text-slate-600 hover:bg-white/60"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    reportType === tab.id
                      ? "bg-white/20 rotate-6"
                      : `bg-${tab.color}-100 text-${tab.color}-600 group-hover:rotate-12`
                  }`}>
                    <tab.icon className="w-6 h-6" />
                  </div>
                  
                  <div className="text-right flex-1">
                    <p className={`text-base font-bold ${reportType === tab.id ? "text-white" : "text-slate-800"}`}>
                      {tab.label}
                    </p>
                    <p className={`text-[10px] ${reportType === tab.id ? "text-white/70" : "text-slate-500"}`}>
                      {tab.sub}
                    </p>
                  </div>

                  {reportType === tab.id && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-white/10 blur-xl rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Control Bar - Advanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="print:hidden"
        >
          <Card className="border-none shadow-md rounded-[2.5rem] bg-white/60 backdrop-blur-md border border-white/50">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-slate-700 text-sm font-bold bg-white/80 px-5 py-2.5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span>اختر الفترة:</span>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-[180px] border-none bg-transparent font-black focus:ring-0 text-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-2xl bg-white/95 backdrop-blur-lg">
                        {monthOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="font-bold text-slate-700">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={fetchReportData}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-[1.5rem] px-8 py-6 shadow-xl shadow-blue-200 transition-all active:scale-95 font-bold"
                  >
                    <Search className="w-5 h-5 ml-2" />
                    تحديث التقرير
                  </Button>
                </div>

                <div className="flex items-center gap-1 flex-wrap bg-white/80 p-1.5 rounded-[1.8rem] border border-slate-100 shadow-inner">
                  <Button
                    onClick={handlePrint}
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl px-5 h-10 font-bold transition-colors"
                  >
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة
                  </Button>
                  <Button
                    onClick={handleExportExcel}
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl px-5 h-10 font-bold transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 ml-2" />
                    تصدير Excel
                  </Button>
                  <Button
                    onClick={() => setShowAnalysisModal(true)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl px-5 h-10 font-bold transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 ml-2" />
                    تحليل ذكي
                  </Button>
                  <div className="w-px h-8 bg-slate-200 mx-2" />
                  <Button
                    onClick={() => (window.location.href = "/expenses")}
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-5 h-10 font-bold transition-colors"
                  >
                    <Home className="w-4 h-4 ml-2" />
                    الرئيسية
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expenses Section */}
        {(reportType === "expenses" || reportType === "all") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Wallet className="w-5 h-5" />
                    المنصرفات الشهرية
                  </CardTitle>
                  <Badge className="bg-white/20 text-white text-sm px-3 py-1">
                    {stats.expensesCount} عملية - {formatNumber(stats.totalExpenses)} ر.س
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {Object.keys(expensesGrouped).length > 0 ? (
                  Object.entries(expensesGrouped).map(([group, expenses]) => {
                    const groupKey = `expense-${group}`;
                    const isExpanded = expandedGroups[groupKey] !== false;
                    const groupTotal = expenses.reduce(
                      (sum, e) => sum + parseFloat(String(e.amount || 0)),
                      0
                    );

                    return (
                      <div
                        key={group}
                        className="border border-slate-200 rounded-3xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-3 flex items-center justify-between hover:opacity-95 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Folder className="w-5 h-5" />
                            <span className="text-sm font-bold">{group}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 text-white text-xs px-2 py-0.5">
                              {expenses.length} عملية
                            </Badge>
                            <Badge className="bg-white/20 text-white text-xs px-2 py-0.5">
                              {formatNumber(groupTotal)} ر.س
                            </Badge>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
                                <table className="w-full text-sm">
                                  <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">#</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">التاريخ</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">المستفيد</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">رقم الإقامة</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">المبلغ</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">الضريبة</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">الصافي</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">الحساب</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">م.التكلفة</th>
                                        <th className="p-2 text-center text-slate-600 font-bold text-xs print:hidden">الإجراءات</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {expenses.map((expense, idx) => (
                                        <tr
                                          key={expense.id}
                                          className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"
                                        >
                                          <td className="p-2 text-center text-slate-500 text-xs">{idx + 1}</td>
                                          <td className="p-2 text-center text-xs">{formatDate(expense.expense_date)}</td>
                                          <td className="p-2 text-center font-medium text-xs">{expense.employee_name || "-"}</td>
                                          <td className="p-2 text-center text-slate-500 text-xs">{expense.employee_iqama || "-"}</td>
                                          <td className="p-2 text-center font-bold text-blue-600 text-xs">{formatNumber(expense.amount || 0)}</td>
                                          <td className="p-2 text-center text-slate-500 text-xs">{formatNumber(expense.tax_value || 0)}</td>
                                          <td className="p-2 text-center font-bold text-emerald-600 text-xs">{formatNumber(expense.net_amount || expense.amount || 0)}</td>
                                          <td className="p-2 text-center text-xs">{expense.account_code || "-"}</td>
                                          <td className="p-2 text-center text-xs">{expense.center_code || "-"}</td>
                                          <td className="p-2 text-center print:hidden">
                                            <div className="flex items-center justify-center gap-1">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => showItemDetails(expense)}
                                                className="text-blue-600 hover:bg-blue-100 h-7 px-2"
                                                title="عرض التفاصيل"
                                              >
                                                <Eye className="w-3.5 h-3.5" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEditClick(expense)}
                                                className="text-amber-600 hover:bg-amber-100 h-7 px-2"
                                                title="تعديل"
                                              >
                                                <Pencil className="w-3.5 h-3.5" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteClick(expense)}
                                                className="text-rose-600 hover:bg-rose-100 h-7 px-2"
                                                title="حذف"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 border-t border-slate-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <Calculator className="w-4 h-4" />
                                    <span className="font-bold">الإجمالي الفرعي لـ {group}:</span>
                                  </div>
                                  <span className="text-base font-bold text-slate-800">
                                    {formatNumber(groupTotal)} ريال سعودي
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">({expenses.length} عملية)</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet className="w-7 h-7 text-slate-300" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-600">لا توجد منصرفات لهذا الشهر</h4>
                    <p className="text-xs text-slate-400 mt-1">لم يتم إضافة أي منصرفات للشهر المحدد</p>
                    <Button
                      size="sm"
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                      onClick={() => (window.location.href = "/expenses/new")}
                    >
                      إضافة منصرف جديد
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Deductions Section */}
        {(reportType === "deductions" || reportType === "all") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HandCoins className="w-5 h-5" />
                    الاستقطاعات الشهرية
                  </CardTitle>
                  <Badge className="bg-white/20 text-white text-sm px-3 py-1">
                    {stats.deductionsCount} عملية - {formatNumber(stats.totalDeductions)} ر.س
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {Object.keys(deductionsGrouped).length > 0 ? (
                  Object.entries(deductionsGrouped).map(([group, deductions]) => {
                    const groupKey = `deduction-${group}`;
                    const isExpanded = expandedGroups[groupKey] !== false;
                    const groupTotal = deductions.reduce(
                      (sum, d) => sum + parseFloat(String(d.amount || 0)),
                      0
                    );

                    return (
                      <div
                        key={group}
                        className="border border-slate-200 rounded-3xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white p-3 flex items-center justify-between hover:opacity-95 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Folder className="w-5 h-5" />
                            <span className="text-sm font-bold">{group}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 text-white text-xs px-2 py-0.5">
                              {deductions.length} عملية
                            </Badge>
                            <Badge className="bg-white/20 text-white text-xs px-2 py-0.5">
                              {formatNumber(groupTotal)} ر.س
                            </Badge>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                              <ChevronDown className="w-4 h-4" />
                            </motion.div>
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="max-h-[300px] overflow-y-auto scrollbar-thin">
                                <table className="w-full text-sm">
                                  <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">#</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">التاريخ</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">الموظف</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">رقم الإقامة</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">المبلغ</th>
                                      <th className="p-2 text-center text-slate-600 font-bold text-xs">الحساب</th>
                                        <th className="p-2 text-center text-slate-600 font-bold text-xs">م.التكلفة</th>
                                        <th className="p-2 text-center text-slate-600 font-bold text-xs">حالة الدفع</th>
                                        <th className="p-2 text-center text-slate-600 font-bold text-xs print:hidden">الإجراءات</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {deductions.map((deduction, idx) => (
                                        <tr
                                          key={deduction.id}
                                          className="border-b border-slate-100 hover:bg-rose-50/50 transition-colors"
                                        >
                                          <td className="p-2 text-center text-slate-500 text-xs">{idx + 1}</td>
                                          <td className="p-2 text-center text-xs">{formatDate(deduction.expense_date)}</td>
                                          <td className="p-2 text-center font-medium text-xs">{deduction.employee_name || "-"}</td>
                                          <td className="p-2 text-center text-slate-500 text-xs">{deduction.employee_iqama || "-"}</td>
                                          <td className="p-2 text-center font-bold text-rose-600 text-xs">{formatNumber(deduction.amount || 0)}</td>
                                          <td className="p-2 text-center text-xs">{deduction.account_code || "-"}</td>
                                          <td className="p-2 text-center text-xs">{deduction.center_code || "-"}</td>
                                          <td className="p-2 text-center">
                                            <button
                                              onClick={() => handleToggleDeductionStatus(deduction)}
                                              disabled={statusUpdating === deduction.id}
                                              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                deduction.status === "completed"
                                                  ? "bg-emerald-500 focus:ring-emerald-500"
                                                  : "bg-rose-500 focus:ring-rose-500"
                                              } ${statusUpdating === deduction.id ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:shadow-lg'}`}
                                              title={deduction.status === "completed" ? "مدفوع - انقر للتغيير" : "غير مدفوع - انقر للتغيير"}
                                            >
                                              <span
                                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                                  deduction.status === "completed" ? "translate-x-1" : "translate-x-8"
                                                }`}
                                              />
                                              {statusUpdating === deduction.id && (
                                                <span className="absolute inset-0 flex items-center justify-center">
                                                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                                                </span>
                                              )}
                                            </button>
                                            <p className={`text-[9px] mt-0.5 font-bold ${
                                              deduction.status === "completed" ? "text-emerald-600" : "text-rose-600"
                                            }`}>
                                              {deduction.status === "completed" ? "مدفوع" : "غير مدفوع"}
                                            </p>
                                          </td>
                                          <td className="p-2 text-center print:hidden">
                                            <div className="flex items-center justify-center gap-1">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => showItemDetails(deduction)}
                                                className="text-rose-600 hover:bg-rose-100 h-7 px-2"
                                                title="عرض التفاصيل"
                                              >
                                                <Eye className="w-3.5 h-3.5" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEditClick(deduction)}
                                                className="text-amber-600 hover:bg-amber-100 h-7 px-2"
                                                title="تعديل"
                                              >
                                                <Pencil className="w-3.5 h-3.5" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteClick(deduction)}
                                                className="text-red-600 hover:bg-red-100 h-7 px-2"
                                                title="حذف"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 border-t border-slate-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <Calculator className="w-4 h-4" />
                                    <span className="font-bold">الإجمالي الفرعي لـ {group}:</span>
                                  </div>
                                  <span className="text-base font-bold text-slate-800">
                                    {formatNumber(groupTotal)} ريال سعودي
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">({deductions.length} عملية)</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <HandCoins className="w-7 h-7 text-slate-300" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-600">لا توجد استقطاعات لهذا الشهر</h4>
                    <p className="text-xs text-slate-400 mt-1">لم يتم إضافة أي استقطاعات للشهر المحدد</p>
                    <Button
                      size="sm"
                      className="mt-4 bg-rose-600 hover:bg-rose-700"
                      onClick={() => (window.location.href = "/expenses/deductions")}
                    >
                      إضافة استقطاع جديد
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Payrolls Section */}
        {(reportType === "expenses" || reportType === "all") && payrolls.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-5 h-5" />
                    مسيرات الرواتب
                  </CardTitle>
                  <Badge className="bg-white/20 text-white text-sm px-3 py-1">
                    {payrolls.length} مسير - {formatNumber(stats.totalPayrolls)} ر.س
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2 text-center text-slate-600 font-bold text-xs">#</th>
                      <th className="p-2 text-center text-slate-600 font-bold text-xs">شهر المسير</th>
                      <th className="p-2 text-center text-slate-600 font-bold text-xs">المبلغ الإجمالي</th>
                      <th className="p-2 text-center text-slate-600 font-bold text-xs">عدد الموظفين</th>
                      <th className="p-2 text-center text-slate-600 font-bold text-xs">تاريخ الإنشاء</th>
                      <th className="p-2 text-center text-slate-600 font-bold text-xs print:hidden">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((payroll, idx) => (
                      <tr
                        key={payroll.id}
                        className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors"
                      >
                        <td className="p-2 text-center text-slate-500 text-xs">{idx + 1}</td>
                        <td className="p-2 text-center font-medium text-xs">{payroll.payroll_month}</td>
                        <td className="p-2 text-center font-bold text-emerald-600 text-xs">{formatNumber(payroll.total_amount || 0)} ر.س</td>
                        <td className="p-2 text-center">
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs">{payroll.employee_count} موظف</Badge>
                        </td>
                        <td className="p-2 text-center text-slate-500 text-xs">{formatDate(payroll.created_at)}</td>
                        <td className="p-2 text-center print:hidden">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => (window.location.href = `/salary-payrolls/${payroll.id}`)}
                            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs h-7"
                          >
                            <Eye className="w-3 h-3 ml-1" />
                            عرض
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Final Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 text-white">
            <CardContent className="p-5 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Calculator className="w-7 h-7 text-amber-300" />
                <h2 className="text-lg font-bold">
                  الإجمالي النهائي لشهر {getMonthName(selectedMonth)}
                </h2>
              </div>
              <p className="text-3xl font-bold mb-3">
                {formatNumber(stats.totalAll)} ريال سعودي
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                <span className="bg-white/10 px-3 py-1.5 rounded-xl">
                  منصرفات: {formatNumber(stats.totalExpenses)} ر.س
                </span>
                <span className="bg-white/10 px-3 py-1.5 rounded-xl">
                  استقطاعات: {formatNumber(stats.totalDeductions)} ر.س
                </span>
                <span className="bg-white/10 px-3 py-1.5 rounded-xl">
                  رواتب: {formatNumber(stats.totalPayrolls)} ر.س
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details Modal */}
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-2xl rtl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <Eye className="w-5 h-5 text-blue-600" />
                  عرض تفاصيل العملية
                </DialogTitle>
              </DialogHeader>
            {selectedItem && (
              <div className="space-y-3 p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500">النوع</p>
                    <p className="font-bold text-slate-800 text-sm">
                      {"expense_type" in selectedItem
                        ? selectedItem.expense_type
                        : selectedItem.deduction_type}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500">التاريخ</p>
                    <p className="font-bold text-slate-800 text-sm">{formatDate(selectedItem.expense_date)}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500">اسم المستفيد</p>
                    <p className="font-bold text-slate-800 text-sm">{selectedItem.employee_name || "-"}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500">رقم الإقامة</p>
                    <p className="font-bold text-slate-800 text-sm">{selectedItem.employee_iqama || "-"}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <p className="text-xs text-blue-600">المبلغ</p>
                    <p className="font-bold text-lg text-blue-700">{formatNumber(selectedItem.amount || 0)} ر.س</p>
                  </div>
                  {"tax_value" in selectedItem && (
                    <>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-xs text-slate-500">الضريبة</p>
                        <p className="font-bold text-slate-800 text-sm">{formatNumber(selectedItem.tax_value || 0)} ر.س</p>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-xl">
                        <p className="text-xs text-emerald-600">الصافي</p>
                        <p className="font-bold text-base text-emerald-700">
                          {formatNumber(selectedItem.net_amount || selectedItem.amount || 0)} ر.س
                        </p>
                      </div>
                    </>
                  )}
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500">الحساب</p>
                    <p className="font-bold text-slate-800 text-sm">{selectedItem.account_code || "-"}</p>
                  </div>
                </div>
                {selectedItem.description && (
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <p className="text-xs text-slate-500">الوصف</p>
                    <p className="font-medium text-slate-800 text-sm">{selectedItem.description}</p>
                  </div>
                )}
                
                {(() => {
                    const attachment = selectedItem.attachment;
                    const attachmentUrl = getAttachmentUrl(attachment);
                  
                  if (!attachmentUrl) return null;
                  
                  return (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Paperclip className="w-5 h-5 text-amber-600" />
                        <p className="text-sm font-bold text-amber-800">المرفقات</p>
                      </div>
                      
                      {isImageFile(attachment || '') ? (
                        <div className="space-y-3">
                          <div className="relative rounded-xl overflow-hidden border border-amber-200 bg-white">
                            <img 
                              src={attachmentUrl} 
                              alt="المرفق"
                              className="w-full max-h-[400px] object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const parent = (e.target as HTMLImageElement).parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="p-8 text-center text-slate-500"><p>لا يمكن تحميل الصورة</p></div>';
                                }
                              }}
                            />
                          </div>
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            فتح في نافذة جديدة
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-amber-200">
                          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <File className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">
                              {attachment?.split('/').pop() || 'مرفق'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {attachment?.split('.').pop()?.toUpperCase() || 'ملف'}
                            </p>
                          </div>
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            عرض
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Analysis Modal */}
        <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
          <DialogContent className="max-w-md rtl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="w-5 h-5 text-amber-600" />
                تحليل البيانات
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 p-3">
              <h4 className="font-bold text-slate-800 text-sm">
                تحليل شهر {getMonthName(selectedMonth)}
              </h4>
              <hr />
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded-xl text-sm">
                  <span className="text-slate-600">إجمالي المنصرفات:</span>
                  <span className="font-bold text-blue-700">{formatNumber(stats.totalExpenses)} ر.س</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-rose-50 rounded-xl text-sm">
                  <span className="text-slate-600">إجمالي الاستقطاعات:</span>
                  <span className="font-bold text-rose-700">{formatNumber(stats.totalDeductions)} ر.س</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-xl text-sm">
                  <span className="text-slate-600">إجمالي الرواتب:</span>
                  <span className="font-bold text-emerald-700">{formatNumber(stats.totalPayrolls)} ر.س</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded-xl text-sm">
                  <span className="text-slate-600">المجموع الكلي:</span>
                  <span className="font-bold text-amber-700">{formatNumber(stats.totalAll)} ر.س</span>
                </div>
              </div>
              <hr />
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded-xl text-sm">
                <span className="text-slate-600">متوسط المنصرف اليومي:</span>
                <span className="font-bold text-purple-700">
                  {formatNumber(
                    stats.totalExpenses /
                      new Date(
                        parseInt(selectedMonth.split("-")[0]),
                        parseInt(selectedMonth.split("-")[1]),
                        0
                      ).getDate()
                  )} ر.س
                </span>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogContent className="max-w-md rtl" dir="rtl">
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center"
                  >
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">هل أنت متأكد؟</h3>
                  <p className="text-slate-500 mb-6">
                    سيتم حذف{" "}
                    {selectedItem && "expense_type" in selectedItem ? "المنصرف" : "الاستقطاع"}{" "}
                    "{selectedItem && ("expense_type" in selectedItem ? selectedItem.expense_type : selectedItem?.deduction_type)}" نهائياً.
                    <br />
                    <span className="text-red-500 font-medium">لا يمكن التراجع عن هذا الإجراء!</span>
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      onClick={handleDelete}
                      disabled={deleteLoading}
                      className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-2 rounded-xl"
                    >
                      {deleteLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جاري الحذف...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 ml-2" />
                          نعم، احذفها
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowDeleteModal(false)}
                      variant="outline"
                      className="px-6 py-2 rounded-xl"
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {showEditModal && selectedItem && (
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
              <DialogContent className="max-w-2xl rtl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base">
                    <Pencil className="w-5 h-5 text-amber-600" />
                    تعديل {("expense_type" in selectedItem) ? "المنصرف" : "الاستقطاع"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expense_date">تاريخ العملية</Label>
                      <Input
                        id="expense_date"
                        type="date"
                        value={editForm.expense_date || ''}
                        onChange={(e) => setEditForm({...editForm, expense_date: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="month_reference">الشهر المرجعي</Label>
                      <Input
                        id="month_reference"
                        type="month"
                        value={editForm.month_reference || ''}
                        onChange={(e) => setEditForm({...editForm, month_reference: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employee_name">اسم المستفيد</Label>
                      <Input
                        id="employee_name"
                        type="text"
                        value={editForm.employee_name || ''}
                        onChange={(e) => setEditForm({...editForm, employee_name: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employee_iqama">رقم الإقامة</Label>
                      <Input
                        id="employee_iqama"
                        type="text"
                        value={editForm.employee_iqama || ''}
                        onChange={(e) => setEditForm({...editForm, employee_iqama: e.target.value})}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">المبلغ</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={editForm.amount || 0}
                        onChange={(e) => {
                          const amount = parseFloat(e.target.value) || 0;
                          const taxValue = editForm.tax_value || 0;
                          setEditForm({
                            ...editForm,
                            amount,
                            net_amount: amount - taxValue
                          });
                        }}
                        className="rounded-xl"
                      />
                    </div>
                    {"tax_value" in selectedItem && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="tax_value">قيمة الضريبة</Label>
                          <Input
                            id="tax_value"
                            type="number"
                            step="0.01"
                            value={editForm.tax_value || 0}
                            onChange={(e) => {
                              const taxValue = parseFloat(e.target.value) || 0;
                              const amount = editForm.amount || 0;
                              setEditForm({
                                ...editForm,
                                tax_value: taxValue,
                                net_amount: amount - taxValue
                              });
                            }}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="net_amount">المبلغ الصافي</Label>
                          <Input
                            id="net_amount"
                            type="number"
                            step="0.01"
                            value={editForm.net_amount || 0}
                            readOnly
                            className="rounded-xl bg-slate-50"
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="account_id">الحساب</Label>
                      <Select 
                        value={String(editForm.account_id || '')} 
                        onValueChange={(value) => setEditForm({...editForm, account_id: parseInt(value)})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="اختر الحساب" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={String(acc.id)}>
                              {acc.account_code} - {acc.account_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost_center_id">مركز التكلفة</Label>
                      <Select 
                        value={String(editForm.cost_center_id || '')} 
                        onValueChange={(value) => setEditForm({...editForm, cost_center_id: parseInt(value)})}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="اختر مركز التكلفة" />
                        </SelectTrigger>
                        <SelectContent>
                          {costCenters.map((cc) => (
                            <SelectItem key={cc.id} value={String(cc.id)}>
                              {cc.center_code} - {cc.center_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {"status" in selectedItem && (
                      <div className="space-y-2">
                        <Label htmlFor="status">الحالة</Label>
                        <Select 
                          value={editForm.status || ''} 
                          onValueChange={(value) => setEditForm({...editForm, status: value})}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">غير مدفوع</SelectItem>
                            <SelectItem value="completed">مدفوع</SelectItem>
                            <SelectItem value="approved">معتمد</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="rounded-xl min-h-[80px]"
                    />
                  </div>
                  
                  {editForm.attachment && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Paperclip className="w-5 h-5 text-amber-600" />
                        <p className="text-sm font-bold text-amber-800">المرفق الحالي</p>
                      </div>
                      {isImageFile(editForm.attachment) ? (
                        <div className="space-y-3">
                          <div className="relative rounded-xl overflow-hidden border border-amber-200 bg-white">
                            <img 
                              src={getAttachmentUrl(editForm.attachment) || ''} 
                              alt="المرفق"
                              className="w-full max-h-[200px] object-contain"
                            />
                          </div>
                          <p className="text-xs text-amber-700">
                            سيتم الاحتفاظ بهذا المرفق إذا لم تقم بتغييره
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-200">
                          <File className="w-8 h-8 text-amber-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-800">{editForm.attachment.split('/').pop()}</p>
                            <p className="text-xs text-slate-500">سيتم الاحتفاظ بالمرفق</p>
                          </div>
                          <a
                              href={getAttachmentUrl(editForm.attachment) || ''}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mr-auto text-amber-600 hover:text-amber-700"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 mt-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <Label htmlFor="new_file" className="flex items-center gap-2 cursor-pointer">
                        <Paperclip className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-slate-700">تغيير المرفق (اختياري)</span>
                      </Label>
                      <Input
                        id="new_file"
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEditForm({ ...editForm, newFile: file });
                          }
                        }}
                      />
                      {editForm.newFile ? (
                        <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-xl border border-blue-100">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          <span className="text-sm font-medium text-blue-700 truncate max-w-[150px]">{editForm.newFile.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            className="mr-auto text-rose-500 hover:text-rose-600"
                            onClick={() => setEditForm({ ...editForm, newFile: null })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mr-7">
                          انقر هنا لرفع مستند جديد، أو اتركها فارغة للاحتفاظ بالمستند الحالي
                        </p>
                      )}
                    </div>
                  </div>
                <DialogFooter className="flex gap-3 mt-4">
                  <Button
                    onClick={handleEditSubmit}
                    disabled={editLoading}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 rounded-xl"
                  >
                    {editLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ التعديلات
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowEditModal(false)}
                    variant="outline"
                    className="rounded-xl"
                  >
                    إلغاء
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Notification */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -50 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100]"
            >
              <div className={`px-8 py-6 rounded-2xl shadow-2xl flex items-center gap-4 ${
                notification.type === 'success' 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white' 
                  : 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
              }`}>
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                  {notification.type === 'success' ? (
                    <CheckCircle2 className="w-8 h-8" />
                  ) : (
                    <X className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-lg">
                    {notification.type === 'success' ? 'تمت العملية بنجاح' : 'حدث خطأ'}
                  </h4>
                  <p className="text-white/90">{notification.message}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:w-full {
            width: 100% !important;
          }
          .print\\:p-2 {
            padding: 0.5rem !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          @page {
            size: A4 portrait;
            margin: 0.5cm;
          }
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
