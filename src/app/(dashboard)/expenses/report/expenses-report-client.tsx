"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
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
  Sparkles,
  ArrowUpRight,
  DollarSign,
  Receipt,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
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

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => 
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(latest)
  );
  const [displayValue, setDisplayValue] = useState("0.00");

  useEffect(() => {
    const controls = animate(count, value, { duration });
    const unsubscribe = rounded.on("change", (v) => setDisplayValue(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, count, rounded]);

  return <span>{displayValue}</span>;
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

interface LuxuryStatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  gradient: string;
  glowColor: string;
  trend?: number;
  count?: number;
}

function LuxuryStatCard({ icon: Icon, value, label, gradient, glowColor, trend, count }: LuxuryStatCardProps) {
  const glowClasses: Record<string, string> = {
    blue: "shadow-blue-500/20 hover:shadow-blue-500/30 dark:shadow-blue-500/10",
    emerald: "shadow-emerald-500/20 hover:shadow-emerald-500/30 dark:shadow-emerald-500/10",
    rose: "shadow-rose-500/20 hover:shadow-rose-500/30 dark:shadow-rose-500/10",
    violet: "shadow-violet-500/20 hover:shadow-violet-500/30 dark:shadow-violet-500/10",
    amber: "shadow-amber-500/20 hover:shadow-amber-500/30 dark:shadow-amber-500/10",
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 shadow-2xl ${glowClasses[glowColor]} border border-white/60 dark:border-slate-700/60 hover:shadow-3xl transition-all duration-500`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100/50 dark:from-slate-700/30 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${trend >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400'}`}>
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h4 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            <AnimatedCounter value={value} />
            <span className="text-sm text-slate-500 dark:text-slate-400 mr-1">ر.س</span>
          </h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{label}</p>
          {count !== undefined && (
            <p className="text-xs text-slate-400 dark:text-slate-500">{count} عملية</p>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(75 + Math.random() * 20, 95)}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full shadow-lg shadow-blue-500/30"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">لا توجد بيانات</p>
      </div>
    );
  }

  const { companyInfo, stats, expensesGrouped, deductionsGrouped, payrolls } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-2 md:p-6 transition-colors duration-300 print:bg-white" dir="rtl">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[98%] mx-auto space-y-6 print:w-full print:p-2"
      >
        {/* Hero Header */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl print:rounded-none print:shadow-none"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-600/20 to-transparent rounded-full blur-3xl" />
          
          <div className="relative z-10 p-6 md:p-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  {companyInfo?.logo_path ? (
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-2 flex items-center justify-center overflow-hidden shadow-xl">
                      <img src={companyInfo.logo_path} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                </motion.div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-400 text-xs font-medium">التقرير المالي الشهري</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">
                    {companyInfo?.name || "اسم الشركة"}
                  </h1>
                  <p className="text-slate-400 text-sm">
                    نظام إدارة المنصرفات والرواتب
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 print:hidden">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center gap-4"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                    onClick={() => {
                      const date = new Date(selectedMonth + "-01");
                      date.setMonth(date.getMonth() - 1);
                      setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
                    }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>

                  <div className="text-center min-w-[120px]">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <p className="text-lg font-bold text-white">
                        {getMonthName(selectedMonth)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                    onClick={() => {
                      const date = new Date(selectedMonth + "-01");
                      date.setMonth(date.getMonth() + 1);
                      setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
                    }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <LuxuryStatCard 
              icon={Wallet} 
              value={stats.totalExpenses} 
              label="إجمالي المنصرفات"
              gradient="from-blue-500 to-indigo-600"
              glowColor="blue"
              count={stats.expensesCount}
            />
            <LuxuryStatCard 
              icon={HandCoins} 
              value={stats.totalDeductions} 
              label="إجمالي الاستقطاعات"
              gradient="from-rose-500 to-pink-600"
              glowColor="rose"
              count={stats.deductionsCount}
            />
            <LuxuryStatCard 
              icon={Receipt} 
              value={stats.totalPayrolls} 
              label="إجمالي الرواتب"
              gradient="from-emerald-500 to-teal-600"
              glowColor="emerald"
              count={stats.payrollsCount}
            />
            <LuxuryStatCard 
              icon={Calculator} 
              value={stats.totalAll} 
              label="الإجمالي الكلي"
              gradient="from-violet-500 to-purple-600"
              glowColor="violet"
            />
          </div>
        </motion.div>

        {/* Report Type Tabs */}
        <motion.div variants={itemVariants} className="print:hidden">
          <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-xl p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[
                {
                  id: "expenses" as const,
                  label: "عرض المنصرفات",
                  icon: Wallet,
                  gradient: "from-blue-500 to-indigo-600",
                  sub: "كشف تفصيلي للمصروفات والرواتب"
                },
                {
                  id: "deductions" as const,
                  label: "عرض الاستقطاعات",
                  icon: HandCoins,
                  gradient: "from-rose-500 to-pink-600",
                  sub: "كشف تفصيلي للخصومات والجزاءات"
                },
                {
                  id: "all" as const,
                  label: "التقرير الشامل",
                  icon: BarChart3,
                  gradient: "from-violet-500 to-purple-600",
                  sub: "رؤية موحدة لجميع الحركات المالية"
                }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setReportType(tab.id)}
                  className={`relative flex items-center gap-4 p-5 rounded-xl transition-all duration-300 group overflow-hidden ${
                    reportType === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl`
                      : "bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    reportType === tab.id
                      ? "bg-white/20"
                      : "bg-white dark:bg-slate-600 shadow-md"
                  }`}>
                    <tab.icon className={`w-6 h-6 ${reportType === tab.id ? 'text-white' : 'text-slate-500 dark:text-slate-300'}`} />
                  </div>
                  
                  <div className="text-right flex-1">
                    <p className={`text-sm font-bold ${reportType === tab.id ? "text-white" : "text-slate-700 dark:text-slate-200"}`}>
                      {tab.label}
                    </p>
                    <p className={`text-xs ${reportType === tab.id ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                      {tab.sub}
                    </p>
                  </div>
                  
                  {reportType === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 -z-10"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Control Bar */}
        <motion.div variants={itemVariants} className="print:hidden">
          <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-xl p-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-bold bg-slate-100 dark:bg-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600">
                  <Filter className="w-4 h-4 text-blue-500" />
                  <span>الفترة:</span>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[160px] border-none bg-transparent font-bold focus:ring-0 text-slate-800 dark:text-slate-100 h-auto p-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-800">
                      {monthOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="font-bold">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={fetchReportData}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-6 h-11 shadow-lg shadow-blue-500/25 font-bold"
                >
                  <Search className="w-4 h-4 ml-2" />
                  تحديث
                </Button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-600"
                >
                  <FileSpreadsheet className="w-4 h-4 ml-2" />
                  Excel
                </Button>
                <Button
                  onClick={() => setShowAnalysisModal(true)}
                  variant="outline"
                  className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-600"
                >
                  <BarChart3 className="w-4 h-4 ml-2" />
                  تحليل
                </Button>
                <Button
                  onClick={() => (window.location.href = "/expenses")}
                  variant="outline"
                  className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600"
                >
                  <Home className="w-4 h-4 ml-2" />
                  الرئيسية
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Expenses Section */}
        {(reportType === "expenses" || reportType === "all") && (
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/5 to-transparent rounded-full -translate-y-32 translate-x-32" />
              
              <div className="relative z-10">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">المنصرفات الشهرية</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">كشف تفصيلي بجميع المصروفات</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-xl font-bold">
                        {stats.expensesCount} عملية
                      </Badge>
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 rounded-xl font-bold shadow-lg shadow-blue-500/25">
                        {formatNumber(stats.totalExpenses)} ر.س
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {Object.keys(expensesGrouped).length > 0 ? (
                    Object.entries(expensesGrouped).map(([group, expenses]) => {
                      const groupKey = `expense-${group}`;
                      const isExpanded = expandedGroups[groupKey] !== false;
                      const groupTotal = expenses.reduce(
                        (sum, e) => sum + parseFloat(String(e.amount || 0)),
                        0
                      );

                      return (
                        <motion.div
                          key={group}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50"
                        >
                          <button
                            onClick={() => toggleGroup(groupKey)}
                            className="w-full p-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-700/50 group-hover:scale-110 transition-transform">
                                <Folder className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{group}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{expenses.length} عملية</span>
                              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatNumber(groupTotal)} ر.س</span>
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="w-5 h-5 text-slate-400" />
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
                                <div className="max-h-[400px] overflow-y-auto scrollbar-thin px-4 pb-4 bg-white dark:bg-slate-800/50">
                                  <table className="w-full text-sm border-separate border-spacing-y-2">
                                    <thead className="sticky top-0 z-10">
                                      <tr className="bg-slate-100/95 dark:bg-slate-700/95 backdrop-blur-sm">
                                        <th className="p-3 text-right text-slate-600 dark:text-slate-300 font-bold text-xs rounded-r-xl">التاريخ</th>
                                        <th className="p-3 text-right text-slate-600 dark:text-slate-300 font-bold text-xs">المستفيد</th>
                                        <th className="p-3 text-center text-slate-600 dark:text-slate-300 font-bold text-xs">المبلغ</th>
                                        <th className="p-3 text-center text-slate-600 dark:text-slate-300 font-bold text-xs">الضريبة</th>
                                        <th className="p-3 text-center text-slate-600 dark:text-slate-300 font-bold text-xs">الصافي</th>
                                        <th className="p-3 text-center text-slate-600 dark:text-slate-300 font-bold text-xs">مركز التكلفة</th>
                                        <th className="p-3 text-center text-slate-600 dark:text-slate-300 font-bold text-xs rounded-l-xl print:hidden">الإجراءات</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {expenses.map((expense, idx) => (
                                        <motion.tr
                                          key={expense.id}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className="bg-slate-50 dark:bg-slate-700/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                                        >
                                          <td className="p-3 text-right text-xs font-medium text-slate-600 dark:text-slate-300 rounded-r-xl">
                                            {formatDate(expense.expense_date)}
                                          </td>
                                          <td className="p-3 text-right">
                                            <div className="flex flex-col">
                                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {expense.employee_name || "-"}
                                              </span>
                                              <span className="text-[10px] text-slate-500 dark:text-slate-400">{expense.employee_iqama || "-"}</span>
                                            </div>
                                          </td>
                                          <td className="p-3 text-center">
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatNumber(expense.amount || 0)}</span>
                                          </td>
                                          <td className="p-3 text-center">
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{formatNumber(expense.tax_value || 0)}</span>
                                          </td>
                                          <td className="p-3 text-center">
                                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{formatNumber(expense.net_amount || expense.amount || 0)}</span>
                                          </td>
                                          <td className="p-3 text-center">
                                            <Badge variant="outline" className="border-slate-200 dark:border-slate-600 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                                              {expense.center_code || "-"}
                                            </Badge>
                                          </td>
                                          <td className="p-3 text-center rounded-l-xl print:hidden">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => showItemDetails(expense)}
                                                className="h-8 w-8 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg"
                                              >
                                                <Eye className="w-4 h-4" />
                                              </Button>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleEditClick(expense)}
                                                className="h-8 w-8 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg"
                                              >
                                                <Pencil className="w-4 h-4" />
                                              </Button>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleDeleteClick(expense)}
                                                className="h-8 w-8 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          </td>
                                        </motion.tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <Wallet className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                      </div>
                      <h4 className="text-base font-bold text-slate-600 dark:text-slate-300">لا توجد منصرفات مسجلة</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">لم يتم العثور على أي بيانات منصرفات للفترة المحددة</p>
                      <Button
                        onClick={() => (window.location.href = "/expenses/new")}
                        className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-8 shadow-lg shadow-blue-500/25"
                      >
                        إضافة منصرف جديد
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Deductions Section */}
        {(reportType === "deductions" || reportType === "all") && (
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-2xl">
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-rose-400/5 to-transparent rounded-full -translate-y-32 -translate-x-32" />
              
              <div className="relative z-10">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30">
                        <HandCoins className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">الاستقطاعات الشهرية</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">كشف تفصيلي بجميع الاستقطاعات</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-4 py-1.5 rounded-xl font-bold">
                        {stats.deductionsCount} عملية
                      </Badge>
                      <Badge className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-1.5 rounded-xl font-bold shadow-lg shadow-rose-500/25">
                        {formatNumber(stats.totalDeductions)} ر.س
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {Object.keys(deductionsGrouped).length > 0 ? (
                    Object.entries(deductionsGrouped).map(([group, deductions]) => {
                      const groupKey = `deduction-${group}`;
                      const isExpanded = expandedGroups[groupKey] !== false;
                      const groupTotal = deductions.reduce(
                        (sum, d) => sum + parseFloat(String(d.amount || 0)),
                        0
                      );

                      return (
                        <motion.div
                          key={group}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50"
                        >
                          <button
                            onClick={() => toggleGroup(groupKey)}
                            className="w-full p-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50 flex items-center justify-center border border-pink-200/50 dark:border-pink-700/50 group-hover:scale-110 transition-transform">
                                <Folder className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                              </div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{group}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{deductions.length} عملية</span>
                              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatNumber(groupTotal)} ر.س</span>
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown className="w-5 h-5 text-slate-400" />
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
                                <div className="max-h-[400px] overflow-y-auto scrollbar-thin px-4 pb-4 bg-white dark:bg-slate-800/50">
                                  <table className="w-full text-sm border-separate border-spacing-y-2">
                                    <thead className="sticky top-0 z-10">
                                      <tr className="bg-slate-100/95 dark:bg-slate-700/95 backdrop-blur-sm">
                                        <th className="p-3 text-right text-slate-600 dark:text-slate-300 font-bold text-xs rounded-r-xl">التاريخ</th>
                                        <th className="p-3 text-right text-slate-600 dark:text-slate-300 font-bold text-xs">الموظف</th>
                                        <th className="p-3 text-center text-slate-600 dark:text-slate-300 font-bold text-xs">المبلغ</th>
                                        <th className="p-3 text-center text-slate-600 dark:text-slate-300 font-bold text-xs">الحساب</th>
                                        <th className="p-3 text-center text-slate-600 dark:text-slate-300 font-bold text-xs">حالة الدفع</th>
                                        <th className="p-3 text-center text-slate-600 dark:text-slate-300 font-bold text-xs rounded-l-xl print:hidden">الإجراءات</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {deductions.map((deduction, idx) => (
                                        <motion.tr
                                          key={deduction.id}
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className="bg-slate-50 dark:bg-slate-700/30 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all group"
                                        >
                                          <td className="p-3 text-right text-xs font-medium text-slate-600 dark:text-slate-300 rounded-r-xl">
                                            {formatDate(deduction.expense_date)}
                                          </td>
                                          <td className="p-3 text-right">
                                            <div className="flex flex-col">
                                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                                {deduction.employee_name || "-"}
                                              </span>
                                              <span className="text-[10px] text-slate-500 dark:text-slate-400">{deduction.employee_iqama || "-"}</span>
                                            </div>
                                          </td>
                                          <td className="p-3 text-center">
                                            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">{formatNumber(deduction.amount || 0)}</span>
                                          </td>
                                          <td className="p-3 text-center">
                                            <span className="text-xs text-slate-600 dark:text-slate-300">{deduction.account_code || "-"}</span>
                                          </td>
                                          <td className="p-3 text-center">
                                            <button
                                              onClick={() => handleToggleDeductionStatus(deduction)}
                                              disabled={statusUpdating === deduction.id}
                                              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 ${
                                                deduction.status === "completed" 
                                                  ? "bg-gradient-to-r from-emerald-400 to-emerald-500" 
                                                  : "bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700"
                                              } ${statusUpdating === deduction.id ? 'opacity-50 cursor-wait' : 'cursor-pointer hover:shadow-lg'}`}
                                            >
                                              <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                                                  deduction.status === "completed" 
                                                    ? "translate-x-1" 
                                                    : "translate-x-7"
                                                }`}
                                              />
                                            </button>
                                            <p className={`text-[9px] mt-1 font-bold ${
                                              deduction.status === "completed" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                                            }`}>
                                              {deduction.status === "completed" ? "مدفوع" : "غير مدفوع"}
                                            </p>
                                          </td>
                                          <td className="p-3 text-center rounded-l-xl print:hidden">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => showItemDetails(deduction)}
                                                className="h-8 w-8 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg"
                                              >
                                                <Eye className="w-4 h-4" />
                                              </Button>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleEditClick(deduction)}
                                                className="h-8 w-8 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-lg"
                                              >
                                                <Pencil className="w-4 h-4" />
                                              </Button>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleDeleteClick(deduction)}
                                                className="h-8 w-8 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </Button>
                                            </div>
                                          </td>
                                        </motion.tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <HandCoins className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                      </div>
                      <h4 className="text-base font-bold text-slate-600 dark:text-slate-300">لا توجد استقطاعات مسجلة</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">لم يتم العثور على أي بيانات استقطاعات للفترة المحددة</p>
                      <Button
                        onClick={() => (window.location.href = "/expenses/deductions")}
                        className="mt-6 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl px-8 shadow-lg shadow-rose-500/25"
                      >
                        إضافة استقطاع جديد
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payrolls Section */}
        {(reportType === "expenses" || reportType === "all") && payrolls.length > 0 && (
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-2xl">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-emerald-400/5 to-transparent rounded-full translate-y-32 translate-x-32" />
              
              <div className="relative z-10">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">مسيرات الرواتب</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">كشف بمسيرات رواتب الموظفين</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-xl font-bold">
                        {payrolls.length} مسير
                      </Badge>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-1.5 rounded-xl font-bold shadow-lg shadow-emerald-500/25">
                        {formatNumber(stats.totalPayrolls)} ر.س
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="overflow-x-auto scrollbar-thin">
                    <table className="w-full text-sm border-separate border-spacing-y-2">
                      <thead>
                        <tr className="bg-slate-100/95 dark:bg-slate-700/95">
                          <th className="p-4 text-right text-slate-600 dark:text-slate-300 font-bold text-xs rounded-r-xl">شهر المسير</th>
                          <th className="p-4 text-center text-slate-600 dark:text-slate-300 font-bold text-xs">المبلغ الإجمالي</th>
                          <th className="p-4 text-center text-slate-600 dark:text-slate-300 font-bold text-xs">الموظفين</th>
                          <th className="p-4 text-center text-slate-600 dark:text-slate-300 font-bold text-xs">تاريخ الإنشاء</th>
                          <th className="p-4 text-center text-slate-600 dark:text-slate-300 font-bold text-xs rounded-l-xl print:hidden">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrolls.map((payroll, idx) => (
                          <motion.tr
                            key={payroll.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-slate-50 dark:bg-slate-700/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all group"
                          >
                            <td className="p-4 text-right rounded-r-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {payroll.payroll_month}
                            </td>
                            <td className="p-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                              {formatNumber(payroll.total_amount || 0)} ر.س
                            </td>
                            <td className="p-4 text-center">
                              <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 font-bold px-3">
                                {payroll.employee_count} موظف
                              </Badge>
                            </td>
                            <td className="p-4 text-center text-slate-600 dark:text-slate-400 text-xs">
                              {formatDate(payroll.created_at)}
                            </td>
                            <td className="p-4 text-center rounded-l-xl print:hidden">
                              <Button
                                size="sm"
                                onClick={() => (window.location.href = `/salary-payrolls/${payroll.id}`)}
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/25 px-4"
                              >
                                <Eye className="w-4 h-4 ml-2" />
                                عرض التفاصيل
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Final Total Card */}
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-600/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-emerald-600/20 to-transparent rounded-full blur-3xl" />
            
            <div className="relative z-10 p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  الإجمالي النهائي لشهر {getMonthName(selectedMonth)}
                </h2>
              </div>
              
              <div className="inline-block px-8 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <span className="text-4xl md:text-5xl font-bold text-white">
                  <AnimatedCounter value={stats.totalAll} />
                </span>
                <span className="text-lg font-medium text-white/60 mr-3">ريال سعودي</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl rtl max-h-[90vh] overflow-y-auto p-0 border-none bg-white dark:bg-slate-900 rounded-2xl" dir="rtl">
          <DialogHeader className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-t-2xl">
            <DialogTitle className="flex items-center gap-3 text-lg font-bold">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              تفاصيل العملية المالية
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "نوع العملية", value: "expense_type" in selectedItem ? selectedItem.expense_type : selectedItem.deduction_type, icon: Folder, color: "text-blue-600 dark:text-blue-400" },
                  { label: "تاريخ العملية", value: formatDate(selectedItem.expense_date), icon: Calendar, color: "text-amber-600 dark:text-amber-400" },
                  { label: "اسم المستفيد", value: selectedItem.employee_name || "-", icon: Info, color: "text-indigo-600 dark:text-indigo-400" },
                  { label: "رقم الإقامة", value: selectedItem.employee_iqama || "-", icon: FileText, color: "text-slate-600 dark:text-slate-400" },
                  { label: "مركز التكلفة", value: (selectedItem as any).center_name || "-", icon: Building2, color: "text-purple-600 dark:text-purple-400" },
                  { label: "الحساب", value: selectedItem.account_name || selectedItem.account_code || "-", icon: Wallet, color: "text-emerald-600 dark:text-emerald-400" },
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all flex items-center gap-4 group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-100 dark:border-slate-600 group-hover:scale-110 transition-transform ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-5 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                  <p className="text-xs font-bold text-blue-500 dark:text-blue-400 mb-1">المبلغ الإجمالي</p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{formatNumber(selectedItem.amount || 0)} <span className="text-[10px]">ر.س</span></p>
                </div>
                {"tax_value" in selectedItem && (
                  <>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">قيمة الضريبة</p>
                      <p className="text-xl font-bold text-slate-600 dark:text-slate-300">{formatNumber(selectedItem.tax_value || 0)} <span className="text-[10px]">ر.س</span></p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 p-5 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center">
                      <p className="text-xs font-bold text-emerald-500 dark:text-emerald-400 mb-1">المبلغ الصافي</p>
                      <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatNumber(selectedItem.net_amount || selectedItem.amount || 0)} <span className="text-[10px]">ر.س</span></p>
                    </div>
                  </>
                )}
              </div>

              {selectedItem.description && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500">الوصف والملاحظات</p>
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>
              )}

              {(() => {
                const attachment = selectedItem.attachment;
                const attachmentUrl = getAttachmentUrl(attachment);
                
                if (!attachmentUrl) return null;
                
                return (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">المرفقات والمستندات</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500">
                        1 ملف
                      </Badge>
                    </div>

                    {isImageFile(attachment || '') ? (
                      <div className="space-y-4">
                        <div className="relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 group">
                          <img 
                            src={attachmentUrl} 
                            alt="المرفق"
                            className="w-full max-h-[400px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="p-12 text-center text-slate-400 dark:text-slate-500 font-bold"><p>لا يمكن تحميل ملف المعاينة</p></div>';
                              }
                            }}
                          />
                        </div>
                        <Button
                          onClick={() => window.open(attachmentUrl, '_blank')}
                          className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-xl py-6 font-bold shadow-lg"
                        >
                          <ExternalLink className="w-4 h-4 ml-2" />
                          فتح المرفق بدقة كاملة
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl flex items-center justify-center border border-blue-200 dark:border-blue-800 group-hover:scale-110 transition-transform">
                          <File className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[250px]">
                            {attachment?.split('/').pop() || 'مستند مالي'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-none text-[8px] font-bold uppercase">
                              {attachment?.split('.').pop() || 'FILE'}
                            </Badge>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">جاهز للمعاينة</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => window.open(attachmentUrl, '_blank')}
                          size="sm"
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl px-6 h-10 font-bold shadow-lg shadow-blue-500/25"
                        >
                          عرض
                        </Button>
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
        <DialogContent className="max-w-md rtl rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              تحليل البيانات
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-2">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              تحليل شهر {getMonthName(selectedMonth)}
            </h4>
            <div className="space-y-3">
              {[
                { label: "إجمالي المنصرفات", value: stats.totalExpenses, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
                { label: "إجمالي الاستقطاعات", value: stats.totalDeductions, color: "from-rose-500 to-pink-600", bg: "bg-rose-50 dark:bg-rose-900/30" },
                { label: "إجمالي الرواتب", value: stats.totalPayrolls, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
                { label: "المجموع الكلي", value: stats.totalAll, color: "from-violet-500 to-purple-600", bg: "bg-violet-50 dark:bg-violet-900/30" },
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex justify-between items-center p-4 ${item.bg} rounded-xl border border-slate-100 dark:border-slate-700`}
                >
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.label}</span>
                  <span className={`font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {formatNumber(item.value)} ر.س
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 rounded-xl">
                <span className="text-slate-600 dark:text-slate-300 font-medium">متوسط المنصرف اليومي</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="max-w-md rtl rounded-2xl" dir="rtl">
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 flex items-center justify-center shadow-lg"
                >
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">هل أنت متأكد؟</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
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
                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-red-500/25"
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
            <DialogContent className="max-w-2xl rtl max-h-[90vh] overflow-y-auto rounded-2xl" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                    <Pencil className="w-4 h-4 text-white" />
                  </div>
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
                          className="rounded-xl bg-slate-50 dark:bg-slate-800"
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
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-300">المرفق الحالي</p>
                    </div>
                    {isImageFile(editForm.attachment) ? (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-900">
                          <img 
                            src={getAttachmentUrl(editForm.attachment) || ''} 
                            alt="المرفق"
                            className="w-full max-h-[200px] object-contain"
                          />
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          سيتم الاحتفاظ بهذا المرفق إذا لم تقم بتغييره
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-700">
                        <File className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{editForm.attachment.split('/').pop()}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">سيتم الاحتفاظ بالمرفق</p>
                        </div>
                        <a
                          href={getAttachmentUrl(editForm.attachment) || ''}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mr-auto text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 mt-4 p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <Label htmlFor="new_file" className="flex items-center gap-2 cursor-pointer">
                    <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-200">تغيير المرفق (اختياري)</span>
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
                    <div className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate max-w-[150px]">{editForm.newFile.name}</span>
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 mr-7">
                      انقر هنا لرفع مستند جديد، أو اتركها فارغة للاحتفاظ بالمستند الحالي
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter className="flex gap-3 mt-4">
                <Button
                  onClick={handleEditSubmit}
                  disabled={editLoading}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 rounded-xl shadow-lg shadow-emerald-500/25"
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
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
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
        
        .dark .scrollbar-thin::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
