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
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  DollarSign,
  PieChart,
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
import { cn } from "@/lib/utils";

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
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
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
    "all"
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
        <p className="text-slate-500 font-medium animate-pulse">جاري تحميل البيانات...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500 font-bold">لا توجد بيانات متاحة حالياً</p>
        <Button onClick={() => window.location.reload()} variant="outline">إعادة المحاولة</Button>
      </div>
    );
  }

  const { companyInfo, stats, expensesGrouped, deductionsGrouped, payrolls } = data;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 rtl" dir="rtl">
      {/* Top Banner & Navigation */}
      <div className="bg-white border-b sticky top-0 z-30 print:static print:border-none">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             {companyInfo?.logo_path ? (
               <img src={companyInfo.logo_path} alt="Logo" className="w-10 h-10 object-contain" />
             ) : (
               <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                 <Building2 className="w-5 h-5 text-white" />
               </div>
             )}
             <div>
               <h1 className="text-sm font-black text-slate-900 leading-tight">التقرير المالي</h1>
               <p className="text-[10px] text-slate-500 font-bold">{companyInfo?.name}</p>
             </div>
          </div>

          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border">
             {[
               { id: 'all', label: 'الكل', icon: PieChart },
               { id: 'expenses', label: 'المنصرفات', icon: Wallet },
               { id: 'deductions', label: 'الاستقطاعات', icon: HandCoins },
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setReportType(tab.id as any)}
                 className={cn(
                   "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                   reportType === tab.id 
                     ? "bg-white text-blue-600 shadow-sm" 
                     : "text-slate-500 hover:text-slate-700"
                 )}
               >
                 <tab.icon className="w-3.5 h-3.5" />
                 {tab.label}
               </button>
             ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-lg h-9 px-3 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
            >
              <Printer className="w-4 h-4 ml-1.5" />
              <span className="hidden sm:inline">طباعة</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="rounded-lg h-9 px-3 border-slate-200 text-emerald-600 hover:bg-emerald-50 font-bold"
            >
              <FileSpreadsheet className="w-4 h-4 ml-1.5" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Button
              size="sm"
              className="rounded-lg h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100"
              onClick={() => window.location.href = "/expenses/new"}
            >
              <Wallet className="w-4 h-4 ml-1.5" />
              إضافة عملية
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Date Selector and Summary Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              تقرير شهر {getMonthName(selectedMonth)}
              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 px-3 py-1 font-bold">
                {reportType === 'all' ? 'تقرير شامل' : reportType === 'expenses' ? 'منصرفات' : 'استقطاعات'}
              </Badge>
            </h2>
            <p className="text-sm text-slate-500 font-medium">ملخص الحركات المالية والالتزامات للفترة المحددة</p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-200 p-1 flex-1 lg:flex-none">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-slate-400 hover:text-slate-900"
                onClick={() => {
                  const date = new Date(selectedMonth + "-01");
                  date.setMonth(date.getMonth() - 1);
                  setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              
              <div className="px-4 text-center min-w-[140px]">
                <span className="text-sm font-black text-slate-800">{getMonthName(selectedMonth)}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-slate-400 hover:text-slate-900"
                onClick={() => {
                  const date = new Date(selectedMonth + "-01");
                  date.setMonth(date.getMonth() + 1);
                  setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
            
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px] h-12 rounded-2xl border-slate-200 font-bold bg-white hidden sm:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="font-bold">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: "إجمالي المصاريف", 
              value: stats.totalExpenses, 
              count: stats.expensesCount,
              icon: Wallet, 
              color: "blue",
              bg: "bg-blue-500",
              light: "bg-blue-50",
              text: "text-blue-600"
            },
            { 
              label: "إجمالي الرواتب", 
              value: stats.totalPayrolls, 
              count: stats.payrollsCount,
              icon: FileText, 
              color: "emerald",
              bg: "bg-emerald-500",
              light: "bg-emerald-50",
              text: "text-emerald-600"
            },
            { 
              label: "إجمالي الاستقطاعات", 
              value: stats.totalDeductions, 
              count: stats.deductionsCount,
              icon: HandCoins, 
              color: "rose",
              bg: "bg-rose-500",
              light: "bg-rose-50",
              text: "text-rose-600"
            },
            { 
              label: "المجموع الكلي", 
              value: stats.totalAll, 
              count: stats.expensesCount + stats.deductionsCount + stats.payrollsCount,
              icon: Calculator, 
              color: "indigo",
              bg: "bg-slate-900",
              light: "bg-slate-100",
              text: "text-slate-900"
            }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all"
            >
              <div className={cn("absolute top-0 left-0 w-1 h-full", stat.bg)} />
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.light, stat.text)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">
                      {formatNumber(stat.value)} <span className="text-xs text-slate-500 mr-1 font-medium">ر.س</span>
                    </h3>
                  </div>
                  <Badge variant="outline" className="border-slate-100 text-[10px] font-bold text-slate-500 px-2 py-0.5">
                    {stat.count} حركات مسجلة
                  </Badge>
                </div>
                <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="w-12 h-12" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="space-y-12">
          {/* Expenses Section */}
          {(reportType === "expenses" || reportType === "all") && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">تفاصيل المنصرفات</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 font-bold hover:bg-blue-50 rounded-xl"
                  onClick={() => setShowAnalysisModal(true)}
                >
                  <BarChart3 className="w-4 h-4 ml-2" />
                  تحليل البيانات
                </Button>
              </div>

              {Object.keys(expensesGrouped).length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(expensesGrouped).map(([group, expenses], idx) => {
                    const groupKey = `expense-${group}`;
                    const isExpanded = expandedGroups[groupKey] !== false;
                    const groupTotal = expenses.reduce((sum, e) => sum + parseFloat(String(e.amount || 0)), 0);

                    return (
                      <Card key={group} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white border border-slate-200">
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all border-b"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              <Folder className="w-5 h-5" />
                            </div>
                            <div className="text-right">
                              <h4 className="text-sm font-black text-slate-800">{group}</h4>
                              <p className="text-[10px] text-slate-500 font-bold">{expenses.length} عملية مسجلة</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-left">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">إجمالي التصنيف</p>
                              <p className="text-base font-black text-slate-900">{formatNumber(groupTotal)} <span className="text-[10px]">ر.س</span></p>
                            </div>
                            <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-300", isExpanded && "rotate-180")} />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                                      <th className="px-6 py-4 text-right">التاريخ</th>
                                      <th className="px-6 py-4 text-right">المستفيد</th>
                                      <th className="px-6 py-4 text-right">المبلغ</th>
                                      <th className="px-6 py-4 text-right">الضريبة</th>
                                      <th className="px-6 py-4 text-right">الصافي</th>
                                      <th className="px-6 py-4 text-right">مركز التكلفة</th>
                                      <th className="px-6 py-4 text-center print:hidden">الإجراءات</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {expenses.map((expense) => (
                                      <tr key={expense.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{formatDate(expense.expense_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{expense.employee_name || "بدون اسم"}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{expense.employee_iqama || "-"}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">{formatNumber(expense.amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">{formatNumber(expense.tax_value)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap font-black text-blue-600">{formatNumber(expense.net_amount || expense.amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold text-[10px] rounded-lg">
                                            {expense.center_code || "-"}
                                          </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center print:hidden">
                                          <div className="flex items-center justify-center gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-100 rounded-lg" onClick={() => showItemDetails(expense)}>
                                              <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:bg-amber-100 rounded-lg" onClick={() => handleEditClick(expense)}>
                                              <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:bg-rose-100 rounded-lg" onClick={() => handleDeleteClick(expense)}>
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <Wallet className="w-10 h-10 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-800">لا توجد منصرفات مسجلة</h4>
                    <p className="text-sm text-slate-500 font-medium">لم يتم العثور على أي حركات مالية في هذا التصنيف للشهر المحدد</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Deductions Section */}
          {(reportType === "deductions" || reportType === "all") && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <HandCoins className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">تفاصيل الاستقطاعات</h3>
              </div>

              {Object.keys(deductionsGrouped).length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(deductionsGrouped).map(([group, deductions]) => {
                    const groupKey = `deduction-${group}`;
                    const isExpanded = expandedGroups[groupKey] !== false;
                    const groupTotal = deductions.reduce((sum, d) => sum + parseFloat(String(d.amount || 0)), 0);

                    return (
                      <Card key={group} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white border border-slate-200">
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-all border-b"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors">
                              <Folder className="w-5 h-5" />
                            </div>
                            <div className="text-right">
                              <h4 className="text-sm font-black text-slate-800">{group}</h4>
                              <p className="text-[10px] text-slate-500 font-bold">{deductions.length} استقطاع مسجل</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-left">
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">إجمالي الاستقطاع</p>
                              <p className="text-base font-black text-rose-600">{formatNumber(groupTotal)} <span className="text-[10px]">ر.س</span></p>
                            </div>
                            <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform duration-300", isExpanded && "rotate-180")} />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                                      <th className="px-6 py-4 text-right">التاريخ</th>
                                      <th className="px-6 py-4 text-right">الموظف</th>
                                      <th className="px-6 py-4 text-right">المبلغ</th>
                                      <th className="px-6 py-4 text-right">الحساب</th>
                                      <th className="px-6 py-4 text-center">حالة الدفع</th>
                                      <th className="px-6 py-4 text-center print:hidden">الإجراءات</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {deductions.map((deduction) => (
                                      <tr key={deduction.id} className="hover:bg-rose-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{formatDate(deduction.expense_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{deduction.employee_name || "بدون اسم"}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{deduction.employee_iqama || "-"}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-black text-rose-600">{formatNumber(deduction.amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-bold">{deduction.account_code || "-"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                           <div className="flex flex-col items-center gap-1.5">
                                             <button
                                              onClick={() => handleToggleDeductionStatus(deduction)}
                                              disabled={statusUpdating === deduction.id}
                                              className={cn(
                                                "relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300",
                                                deduction.status === "completed" ? "bg-emerald-500" : "bg-slate-200",
                                                statusUpdating === deduction.id && "opacity-50 cursor-wait"
                                              )}
                                            >
                                              <span className={cn(
                                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300",
                                                deduction.status === "completed" ? "translate-x-1" : "translate-x-7"
                                              )} />
                                            </button>
                                            <span className={cn(
                                              "text-[9px] font-black uppercase tracking-tighter",
                                              deduction.status === "completed" ? "text-emerald-600" : "text-slate-400"
                                            )}>
                                              {deduction.status === "completed" ? "مدفوع" : "غير مدفوع"}
                                            </span>
                                           </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center print:hidden">
                                          <div className="flex items-center justify-center gap-1">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:bg-rose-100 rounded-lg" onClick={() => showItemDetails(deduction)}>
                                              <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:bg-amber-100 rounded-lg" onClick={() => handleEditClick(deduction)}>
                                              <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:bg-rose-100 rounded-lg" onClick={() => handleDeleteClick(deduction)}>
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                    <HandCoins className="w-10 h-10 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-800">لا توجد استقطاعات مسجلة</h4>
                    <p className="text-sm text-slate-500 font-medium">لم يتم العثور على أي استقطاعات في هذا التصنيف للشهر المحدد</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Payrolls Section */}
          {(reportType === "expenses" || reportType === "all") && payrolls.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-900">مسيرات الرواتب المعتمدة</h3>
              </div>

              <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                        <th className="px-6 py-5 text-right">شهر المسير</th>
                        <th className="px-6 py-5 text-center">المبلغ الإجمالي</th>
                        <th className="px-6 py-5 text-center">عدد الموظفين</th>
                        <th className="px-6 py-5 text-center">تاريخ الاعتماد</th>
                        <th className="px-6 py-5 text-center print:hidden">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payrolls.map((payroll) => (
                        <tr key={payroll.id} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="px-6 py-5 whitespace-nowrap font-black text-slate-900">{payroll.payroll_month}</td>
                          <td className="px-6 py-5 whitespace-nowrap text-center">
                            <span className="text-lg font-black text-emerald-600">{formatNumber(payroll.total_amount)}</span>
                            <span className="text-[10px] text-slate-400 mr-1 font-bold">ر.س</span>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-center">
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black px-3 py-1 rounded-lg">
                              {payroll.employee_count} موظف
                            </Badge>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-center text-slate-500 font-medium">
                            {formatDate(payroll.created_at)}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-center print:hidden">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white font-black px-4 h-9 shadow-sm"
                              onClick={() => window.location.href = `/salary-payrolls/${payroll.id}`}
                            >
                              عرض المسير الكامل
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          )}
        </div>
      </div>

      {/* Item Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2rem] border-none bg-white rtl" dir="rtl">
          <div className="bg-slate-900 px-8 py-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Info className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-black">تفاصيل العملية المالية</h3>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">سجل رقم: #{selectedItem?.id}</p>
              </div>
            </div>
            <button onClick={() => setShowDetailsModal(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {selectedItem && (
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">نوع التصنيف</p>
                    <p className="text-base font-black text-slate-900">{"expense_type" in selectedItem ? selectedItem.expense_type : selectedItem.deduction_type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">المستفيد / الموظف</p>
                    <p className="text-base font-black text-slate-900">{selectedItem.employee_name || "بدون اسم"}</p>
                    <p className="text-xs text-slate-500 font-medium">الإقامة: {selectedItem.employee_iqama || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">التاريخ المرجعي</p>
                    <p className="text-base font-black text-slate-900">{formatDate(selectedItem.expense_date)}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-between">
                  <div className="text-left">
                    <Badge className="bg-blue-600 text-white font-black px-3 py-1 rounded-lg shadow-lg shadow-blue-200">
                      القيمة المالية
                    </Badge>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-left">إجمالي المبلغ</p>
                    <h4 className="text-3xl font-black text-slate-900 text-left">
                      {formatNumber(selectedItem.amount)}
                      <span className="text-sm font-medium text-slate-500 mr-2">ر.س</span>
                    </h4>
                  </div>
                  {"tax_value" in selectedItem && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                       <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">الضريبة:</span>
                          <span className="font-black text-slate-700">{formatNumber(selectedItem.tax_value)} ر.س</span>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-900 font-black">الصافي:</span>
                          <span className="font-black text-blue-600">{formatNumber(selectedItem.net_amount || selectedItem.amount)} ر.س</span>
                       </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest mb-1">الملاحظات والوصف</p>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {selectedItem.description || "لا توجد ملاحظات إضافية مسجلة لهذه العملية."}
                    </p>
                 </div>

                 {selectedItem.attachment && (
                   <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                          <Paperclip className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">المستند المرفق</p>
                          <p className="text-[10px] text-slate-500 font-bold">عرض الوثيقة المؤيدة للعملية</p>
                        </div>
                     </div>
                     <Button 
                       onClick={() => window.open(getAttachmentUrl(selectedItem.attachment) || '', '_blank')}
                       className="bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl"
                     >
                       <ExternalLink className="w-4 h-4 ml-2" />
                       فتح المرفق
                     </Button>
                   </div>
                 )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Analysis Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-[2rem] border-none bg-white rtl" dir="rtl">
          <div className="bg-amber-600 px-8 py-6 text-white">
            <h3 className="text-lg font-black flex items-center gap-3">
              <BarChart3 className="w-6 h-6" />
              تحليل البيانات المالية
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              {[
                { label: "إجمالي المنصرفات", val: stats.totalExpenses, color: "blue" },
                { label: "إجمالي الرواتب", val: stats.totalPayrolls, color: "emerald" },
                { label: "إجمالي الاستقطاعات", val: stats.totalDeductions, color: "rose" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-slate-600">{item.label}</span>
                    <span className="text-sm font-black text-slate-900">{formatNumber(item.val)} ر.س</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.val / stats.totalAll) * 100}%` }}
                      className={cn("h-full", 
                        item.color === 'blue' ? 'bg-blue-500' : 
                        item.color === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">المجموع النهائي</p>
              <h4 className="text-3xl font-black text-slate-900">
                {formatNumber(stats.totalAll)}
                <span className="text-sm font-medium text-slate-500 mr-2">ر.س</span>
              </h4>
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-center gap-4">
                 <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold">متوسط يومي</p>
                    <p className="text-sm font-black text-slate-700">{formatNumber(stats.totalAll / 30)}</p>
                 </div>
                 <div className="w-px h-8 bg-slate-200" />
                 <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold">عدد العمليات</p>
                    <p className="text-sm font-black text-slate-700">{stats.expensesCount + stats.deductionsCount}</p>
                 </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-sm p-8 text-center rounded-[2rem] border-none bg-white rtl" dir="rtl">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-10 h-10 text-rose-500" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">تأكيد الحذف</h3>
          <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
            هل أنت متأكد من رغبتك في حذف هذه العملية؟ سيتم إزالتها نهائياً من سجلات الشهر الحالي.
          </p>
          <div className="flex flex-col gap-3">
             <Button 
               disabled={deleteLoading}
               onClick={handleDelete}
               className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-6 rounded-2xl shadow-lg shadow-rose-100"
             >
               {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "نعم، تأكيد الحذف"}
             </Button>
             <Button 
               variant="ghost" 
               onClick={() => setShowDeleteModal(false)}
               className="w-full text-slate-500 font-bold py-6 rounded-2xl"
             >
               إلغاء التراجع
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-[2.5rem] border-none bg-white rtl" dir="rtl">
           <div className="bg-slate-900 px-8 py-6 text-white">
              <h3 className="text-lg font-black flex items-center gap-3">
                <Pencil className="w-6 h-6 text-amber-400" />
                تعديل بيانات العملية
              </h3>
           </div>
           
           <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-700">تاريخ العملية</Label>
                  <Input type="date" value={editForm.expense_date} onChange={e => setEditForm({...editForm, expense_date: e.target.value})} className="h-12 rounded-xl border-slate-200 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-700">الشهر المرجعي</Label>
                  <Input type="month" value={editForm.month_reference} onChange={e => setEditForm({...editForm, month_reference: e.target.value})} className="h-12 rounded-xl border-slate-200 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-700">اسم المستفيد / الموظف</Label>
                  <Input value={editForm.employee_name} onChange={e => setEditForm({...editForm, employee_name: e.target.value})} className="h-12 rounded-xl border-slate-200 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-700">رقم الإقامة</Label>
                  <Input value={editForm.employee_iqama} onChange={e => setEditForm({...editForm, employee_iqama: e.target.value})} className="h-12 rounded-xl border-slate-200 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-700">المبلغ الإجمالي</Label>
                  <Input type="number" value={editForm.amount} onChange={e => setEditForm({...editForm, amount: parseFloat(e.target.value) || 0})} className="h-12 rounded-xl border-slate-200 font-bold" />
                </div>
                { "tax_value" in editForm && (
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-slate-700">قيمة الضريبة</Label>
                    <Input type="number" value={editForm.tax_value} onChange={e => setEditForm({...editForm, tax_value: parseFloat(e.target.value) || 0})} className="h-12 rounded-xl border-slate-200 font-bold" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-700">الحساب</Label>
                  <Select value={String(editForm.account_id)} onValueChange={v => setEditForm({...editForm, account_id: parseInt(v)})}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {accounts.map(acc => (
                        <SelectItem key={acc.id} value={String(acc.id)} className="font-bold">{acc.account_code} - {acc.account_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-slate-700">مركز التكلفة</Label>
                  <Select value={String(editForm.cost_center_id)} onValueChange={v => setEditForm({...editForm, cost_center_id: parseInt(v)})}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {costCenters.map(cc => (
                        <SelectItem key={cc.id} value={String(cc.id)} className="font-bold">{cc.center_code} - {cc.center_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-700">الوصف والملاحظات</Label>
                <Textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="rounded-2xl border-slate-200 font-medium min-h-[100px]" />
              </div>

              <div className="p-6 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center gap-3">
                 <input type="file" id="edit-file" className="hidden" onChange={e => setEditForm({...editForm, newFile: e.target.files?.[0]})} />
                 <label htmlFor="edit-file" className="flex flex-col items-center cursor-pointer group">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center border group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Paperclip className="w-6 h-6" />
                    </div>
                    <p className="mt-2 text-sm font-black text-slate-700">انقر لتغيير المرفق</p>
                    <p className="text-[10px] text-slate-400 font-bold">{editForm.newFile ? `تم اختيار: ${editForm.newFile.name}` : editForm.attachment ? "يوجد مرفق حالي" : "لم يتم رفع مرفق"}</p>
                 </label>
              </div>
           </div>

           <div className="p-8 bg-slate-50 border-t flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowEditModal(false)} className="rounded-xl font-bold px-6">إلغاء</Button>
              <Button 
                disabled={editLoading}
                onClick={handleEditSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-blue-100"
              >
                {editLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ التعديلات"}
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className={cn(
              "px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 border-2 backdrop-blur-md",
              notification.type === 'success' 
                ? "bg-emerald-500/90 border-emerald-400 text-white" 
                : "bg-rose-500/90 border-rose-400 text-white"
            )}>
              {notification.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              <span className="font-black text-sm">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:static { position: static !important; }
          .print\\:border-none { border: none !important; }
          body { background: white !important; padding: 0 !important; }
          .max-w-\\[1600px\\] { max-width: 100% !important; margin: 0 !important; }
          .rounded-3xl, .rounded-\\[2.5rem\\], .rounded-2xl { border-radius: 0 !important; }
          .shadow-sm, .shadow-lg { box-shadow: none !important; }
          .border { border: 1px solid #e2e8f0 !important; }
          section { page-break-inside: avoid; margin-bottom: 2rem !important; }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
