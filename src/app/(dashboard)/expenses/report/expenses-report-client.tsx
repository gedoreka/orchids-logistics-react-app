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
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <p className="text-slate-500">لا توجد بيانات</p>
      </div>
    );
  }

  const { companyInfo, stats, expensesGrouped, deductionsGrouped, payrolls } = data;

  return (
    <div
      className="rtl print:bg-white pb-10 min-h-screen bg-[#030712]"
      dir="rtl"
    >
      <div className="w-[98%] mx-auto py-4 space-y-6 print:w-full print:p-2">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="print:shadow-none"
        >
          <Card className="overflow-hidden border-none shadow-xl bg-[#111827] text-white rounded-2xl border border-white/5 print:rounded-none print:shadow-none">
            
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {companyInfo?.logo_path ? (
                      <div className="relative w-12 h-12 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
                        <img
                          src={companyInfo.logo_path}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="relative w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg border border-white/10">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      {companyInfo?.name || "اسم الشركة"}
                    </h2>
                    <p className="text-slate-400 text-[10px] font-medium">
                      نظام إدارة المنصرفات والرواتب
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <h1 className="text-lg font-bold text-white">
                    التقرير المالي الشهري
                  </h1>
                </div>

                <div className="flex items-center gap-3 print:hidden">
                  <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/10 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      onClick={() => {
                        const date = new Date(selectedMonth + "-01");
                        date.setMonth(date.getMonth() - 1);
                        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
                      }}
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </Button>

                    <div className="text-center min-w-[90px]">
                      <p className="text-sm font-bold text-white leading-none">
                        {getMonthName(selectedMonth)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      onClick={() => {
                        const date = new Date(selectedMonth + "-01");
                        date.setMonth(date.getMonth() + 1);
                        setSelectedMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
                      }}
                    >
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Tabs - Selection Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="print:hidden"
        >
          <div className="bg-[#111827] p-2 rounded-[2.5rem] shadow-2xl border border-white/5 inline-flex w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
              {[
                {
                  id: "expenses" as const,
                  label: "عرض المنصرفات",
                  icon: Wallet,
                  color: "blue",
                  gradient: "from-blue-600 to-blue-700",
                  sub: "كشف تفصيلي للمصروفات والرواتب"
                },
                {
                  id: "deductions" as const,
                  label: "عرض الاستقطاعات",
                  icon: HandCoins,
                  color: "rose",
                  gradient: "from-rose-600 to-rose-700",
                  sub: "كشف تفصيلي للخصومات والجزاءات"
                },
                {
                  id: "all" as const,
                  label: "التقرير الشامل",
                  icon: BarChart3,
                  color: "purple",
                  gradient: "from-indigo-600 to-purple-700",
                  sub: "رؤية موحدة لجميع الحركات المالية"
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReportType(tab.id)}
                  className={`relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group overflow-hidden ${
                    reportType === tab.id
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl scale-[1.01] z-10`
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    reportType === tab.id
                      ? "bg-white/20"
                      : `bg-white/5 text-slate-300 group-hover:bg-white/10`
                  }`}>
                    <tab.icon className="w-5 h-5" />
                  </div>
                  
                  <div className="text-right flex-1">
                    <p className={`text-sm font-black ${reportType === tab.id ? "text-white" : "text-white/90"}`}>
                      {tab.label}
                    </p>
                    <p className={`text-[10px] font-medium ${reportType === tab.id ? "text-white/80" : "text-slate-500"}`}>
                      {tab.sub}
                    </p>
                  </div>
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
          <Card className="border-none shadow-2xl rounded-[2rem] bg-[#111827] border border-white/5">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 shadow-inner">
                    <Filter className="w-4 h-4 text-blue-400" />
                    <span>الفترة:</span>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-[160px] border-none bg-transparent font-black focus:ring-0 text-white h-auto p-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/10 shadow-2xl bg-[#0d1525] text-white backdrop-blur-xl">
                        {monthOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="font-bold hover:bg-white/10 focus:bg-white/10">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={fetchReportData}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-11 shadow-xl transition-all active:scale-95 font-bold text-sm"
                  >
                    <Search className="w-4 h-4 ml-2" />
                    تحديث
                  </Button>
                </div>

                <div className="flex items-center gap-1 flex-wrap bg-white/5 p-1.5 rounded-2xl border border-white/5">
                  <Button
                    onClick={handlePrint}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl px-4 h-9 font-bold transition-all"
                  >
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة
                  </Button>
                  <Button
                    onClick={handleExportExcel}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-xl px-4 h-9 font-bold transition-all"
                  >
                    <FileSpreadsheet className="w-4 h-4 ml-2" />
                    Excel
                  </Button>
                  <Button
                    onClick={() => setShowAnalysisModal(true)}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl px-4 h-9 font-bold transition-all"
                  >
                    <BarChart3 className="w-4 h-4 ml-2" />
                    تحليل
                  </Button>
                  <div className="w-px h-6 bg-white/10 mx-2" />
                  <Button
                    onClick={() => (window.location.href = "/expenses")}
                    variant="ghost"
                    size="sm"
                    className="text-slate-300 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl px-4 h-9 font-bold transition-all"
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
            <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-[#111827] border border-white/5">
              <CardHeader className="bg-white/5 border-b border-white/5 p-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-white text-lg font-black">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <Wallet className="w-5 h-5 text-blue-400" />
                    </div>
                    المنصرفات الشهرية
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5 px-4 py-1.5 rounded-xl font-bold">
                      {stats.expensesCount} عملية
                    </Badge>
                    <Badge className="bg-blue-600 text-white px-4 py-1.5 rounded-xl font-black shadow-lg shadow-blue-600/20">
                      {formatNumber(stats.totalExpenses)} ر.س
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
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
                        className="rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02]"
                      >
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full bg-white/5 p-4 flex items-center justify-between hover:bg-white/10 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 group-hover:rotate-12 transition-transform">
                              <Folder className="w-4 h-4 text-indigo-400" />
                            </div>
                            <span className="text-sm font-black text-slate-200">{group}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-500">{expenses.length} عملية</span>
                            <div className="h-4 w-px bg-white/10" />
                            <span className="text-sm font-black text-white">{formatNumber(groupTotal)} ر.س</span>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                              <ChevronDown className="w-4 h-4 text-slate-500" />
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
                              <div className="max-h-[400px] overflow-y-auto scrollbar-thin px-2 pb-2">
                                <table className="w-full text-sm border-separate border-spacing-y-1.5">
                                  <thead className="sticky top-0 z-10">
                                    <tr className="bg-[#0d1525]/80 backdrop-blur-md">
                                      <th className="p-3 text-right text-slate-500 font-bold text-[10px] uppercase tracking-wider rounded-r-xl">التاريخ</th>
                                      <th className="p-3 text-right text-slate-500 font-bold text-[10px] uppercase tracking-wider">المستفيد</th>
                                      <th className="p-3 text-center text-slate-500 font-bold text-[10px] uppercase tracking-wider">المبلغ</th>
                                      <th className="p-3 text-center text-slate-500 font-bold text-[10px] uppercase tracking-wider">الضريبة</th>
                                      <th className="p-3 text-center text-slate-500 font-bold text-[10px] uppercase tracking-wider">الصافي</th>
                                      <th className="p-3 text-center text-slate-500 font-bold text-[10px] uppercase tracking-wider">مركز التكلفة</th>
                                      <th className="p-3 text-center text-slate-500 font-bold text-[10px] uppercase tracking-wider rounded-l-xl print:hidden">الإجراءات</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expenses.map((expense) => (
                                      <tr
                                        key={expense.id}
                                        className="bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
                                      >
                                        <td className="p-3 text-right text-xs font-medium text-slate-400 rounded-r-xl">
                                          {formatDate(expense.expense_date)}
                                        </td>
                                        <td className="p-3 text-right">
                                          <div className="flex flex-col">
                                            <span className="text-xs font-black text-white group-hover:text-blue-400 transition-colors">
                                              {expense.employee_name || "-"}
                                            </span>
                                            <span className="text-[10px] text-slate-500">{expense.employee_iqama || "-"}</span>
                                          </div>
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className="text-xs font-bold text-slate-300">{formatNumber(expense.amount || 0)}</span>
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className="text-xs text-slate-500">{formatNumber(expense.tax_value || 0)}</span>
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className="text-xs font-black text-blue-400">{formatNumber(expense.net_amount || expense.amount || 0)}</span>
                                        </td>
                                        <td className="p-3 text-center">
                                          <Badge variant="outline" className="border-white/5 text-[10px] text-slate-500 font-medium">
                                            {expense.center_code || "-"}
                                          </Badge>
                                        </td>
                                          <td className="p-3 text-center rounded-l-xl print:hidden">
                                            <div className="flex items-center justify-center gap-1 transition-opacity">
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => showItemDetails(expense)}
                                                className="h-7 w-7 text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 rounded-lg"
                                              >
                                                <Eye className="w-3.5 h-3.5" />
                                              </Button>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleEditClick(expense)}
                                                className="h-7 w-7 text-amber-400 hover:bg-amber-400/10 hover:text-amber-300 rounded-lg"
                                              >
                                                <Pencil className="w-3.5 h-3.5" />
                                              </Button>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleDeleteClick(expense)}
                                                className="h-7 w-7 text-rose-400 hover:bg-rose-400/10 hover:text-rose-300 rounded-lg"
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
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 border-2 border-dashed border-white/5 rounded-3xl">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <Wallet className="w-10 h-10 text-slate-600" />
                    </div>
                    <h4 className="text-base font-black text-slate-300">لا توجد منصرفات مسجلة</h4>
                    <p className="text-sm text-slate-500 mt-2">لم يتم العثور على أي بيانات منصرفات للفترة المحددة</p>
                    <Button
                      onClick={() => (window.location.href = "/expenses/new")}
                      className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8"
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
            <Card className={`border-none shadow-2xl rounded-[2rem] overflow-hidden ${isDark ? 'bg-[#111827] border-white/5' : 'bg-white border-slate-200'}`}>
              <CardHeader className={`border-b p-5 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className={`flex items-center gap-3 text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                      <HandCoins className="w-5 h-5 text-rose-400" />
                    </div>
                    الاستقطاعات الشهرية
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-rose-500/30 text-rose-400 bg-rose-500/5 px-4 py-1.5 rounded-xl font-bold">
                      {stats.deductionsCount} عملية
                    </Badge>
                    <Badge className="bg-rose-600 text-white px-4 py-1.5 rounded-xl font-black shadow-lg shadow-rose-600/20">
                      {formatNumber(stats.totalDeductions)} ر.س
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
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
                        className={`rounded-3xl overflow-hidden border ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50'}`}
                      >
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className={`w-full p-4 flex items-center justify-between transition-all group ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center border border-pink-500/30 group-hover:rotate-12 transition-transform">
                              <Folder className="w-4 h-4 text-pink-400" />
                            </div>
                            <span className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{group}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{deductions.length} عملية</span>
                            <div className={`h-4 w-px ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />
                            <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatNumber(groupTotal)} ر.س</span>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                              <ChevronDown className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
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
                              <div className="max-h-[400px] overflow-y-auto scrollbar-thin px-2 pb-2">
                                <table className="w-full text-sm border-separate border-spacing-y-1.5">
                                  <thead className="sticky top-0 z-10">
                                    <tr className={`${isDark ? 'bg-[#0d1525]/80' : 'bg-slate-100/80'} backdrop-blur-md`}>
                                      <th className={`p-3 text-right font-bold text-[10px] uppercase tracking-wider rounded-r-xl ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>التاريخ</th>
                                      <th className={`p-3 text-right font-bold text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>الموظف</th>
                                      <th className={`p-3 text-center font-bold text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>المبلغ</th>
                                      <th className={`p-3 text-center font-bold text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>الحساب</th>
                                      <th className={`p-3 text-center font-bold text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>حالة الدفع</th>
                                      <th className={`p-3 text-center font-bold text-[10px] uppercase tracking-wider rounded-l-xl print:hidden ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>الإجراءات</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {deductions.map((deduction) => (
                                      <tr
                                        key={deduction.id}
                                        className={`transition-all group ${isDark ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-white hover:bg-slate-50'}`}
                                      >
                                        <td className={`p-3 text-right text-xs font-medium rounded-r-xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                          {formatDate(deduction.expense_date)}
                                        </td>
                                        <td className="p-3 text-right">
                                          <div className="flex flex-col">
                                            <span className={`text-xs font-black transition-colors ${isDark ? 'text-white group-hover:text-rose-400' : 'text-slate-900 group-hover:text-rose-600'}`}>
                                              {deduction.employee_name || "-"}
                                            </span>
                                            <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{deduction.employee_iqama || "-"}</span>
                                          </div>
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className="text-xs font-black text-rose-400">{formatNumber(deduction.amount || 0)}</span>
                                        </td>
                                        <td className="p-3 text-center">
                                          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{deduction.account_code || "-"}</span>
                                        </td>
                                        <td className="p-3 text-center">
                                          <button
                                            onClick={() => handleToggleDeductionStatus(deduction)}
                                            disabled={statusUpdating === deduction.id}
                                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all duration-300 ${
                                              deduction.status === "completed" ? "bg-emerald-500/20" : "bg-rose-500/20"
                                            } ${statusUpdating === deduction.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                          >
                                            <span
                                              className={`inline-block h-3.5 w-3.5 transform rounded-full transition-transform duration-300 ${
                                                deduction.status === "completed" 
                                                  ? "translate-x-1 bg-emerald-500" 
                                                  : "translate-x-5.5 bg-rose-500"
                                              }`}
                                            />
                                          </button>
                                          <p className={`text-[8px] mt-1 font-black uppercase ${
                                            deduction.status === "completed" ? "text-emerald-400" : "text-rose-400"
                                          }`}>
                                            {deduction.status === "completed" ? "مدفوع" : "غير مدفوع"}
                                          </p>
                                        </td>
                                          <td className="p-3 text-center rounded-l-xl print:hidden">
                                            <div className="flex items-center justify-center gap-1 transition-opacity">
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => showItemDetails(deduction)}
                                                className="h-7 w-7 text-rose-400 hover:bg-rose-400/10 hover:text-rose-300 rounded-lg"
                                              >
                                                <Eye className="w-3.5 h-3.5" />
                                              </Button>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleEditClick(deduction)}
                                                className="h-7 w-7 text-amber-400 hover:bg-amber-400/10 hover:text-amber-300 rounded-lg"
                                              >
                                                <Pencil className="w-3.5 h-3.5" />
                                              </Button>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleDeleteClick(deduction)}
                                                className="h-7 w-7 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg"
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
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className={`text-center py-16 border-2 border-dashed rounded-3xl ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                      <HandCoins className={`w-10 h-10 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                    </div>
                    <h4 className={`text-base font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>لا توجد استقطاعات مسجلة</h4>
                    <p className={`text-sm mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>لم يتم العثور على أي بيانات استقطاعات للفترة المحددة</p>
                    <Button
                      onClick={() => (window.location.href = "/expenses/deductions")}
                      className="mt-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-8"
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
            <Card className={`border-none shadow-2xl rounded-[2rem] overflow-hidden ${isDark ? 'bg-[#111827] border-white/5' : 'bg-white border-slate-200'}`}>
              <CardHeader className={`border-b p-5 ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className={`flex items-center gap-3 text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                      <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    مسيرات الرواتب
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 px-4 py-1.5 rounded-xl font-bold">
                      {payrolls.length} مسير
                    </Badge>
                    <Badge className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl font-black shadow-lg shadow-emerald-600/20">
                      {formatNumber(stats.totalPayrolls)} ر.س
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm border-separate border-spacing-y-1.5">
                    <thead>
                      <tr className={`rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <th className={`p-4 text-right font-bold text-[10px] uppercase rounded-r-xl ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>شهر المسير</th>
                        <th className={`p-4 text-center font-bold text-[10px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>المبلغ الإجمالي</th>
                        <th className={`p-4 text-center font-bold text-[10px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>الموظفين</th>
                        <th className={`p-4 text-center font-bold text-[10px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>تاريخ الإنشاء</th>
                        <th className={`p-4 text-center font-bold text-[10px] uppercase rounded-l-xl print:hidden ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrolls.map((payroll) => (
                        <tr
                          key={payroll.id}
                          className={`transition-all group ${isDark ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-white hover:bg-slate-50'}`}
                        >
                          <td className={`p-4 text-right rounded-r-xl font-black transition-colors ${isDark ? 'text-white group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-emerald-600'}`}>
                            {payroll.payroll_month}
                          </td>
                          <td className="p-4 text-center font-black text-emerald-400">
                            {formatNumber(payroll.total_amount || 0)} ر.س
                          </td>
                          <td className="p-4 text-center">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-3">
                              {payroll.employee_count} موظف
                            </Badge>
                          </td>
                          <td className={`p-4 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {formatDate(payroll.created_at)}
                          </td>
                          <td className="p-4 text-center rounded-l-xl print:hidden">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => (window.location.href = `/salary-payrolls/${payroll.id}`)}
                              className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all rounded-xl font-bold"
                            >
                              <Eye className="w-4 h-4 ml-2" />
                              عرض التفاصيل
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
          <Card className={`border-none shadow-xl rounded-2xl overflow-hidden relative ${isDark ? 'bg-[#111827] text-white border-white/5' : 'bg-white text-slate-900 border-slate-200'}`}>
            <CardContent className="p-6 text-center relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    الإجمالي النهائي لشهر {getMonthName(selectedMonth)}
                  </h2>
                </div>
              </div>
              
              <div className={`inline-block px-6 py-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {formatNumber(stats.totalAll)}
                </span>
                <span className={`text-sm font-medium mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ريال سعودي</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

          {/* Details Modal */}
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-2xl rtl max-h-[90vh] overflow-y-auto p-0 border-none bg-slate-50" dir="rtl">
              <DialogHeader className="p-6 bg-[#111827] text-white">
                <DialogTitle className="flex items-center gap-3 text-lg font-black">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <Eye className="w-5 h-5 text-blue-400" />
                  </div>
                  تفاصيل العملية المالية
                </DialogTitle>
              </DialogHeader>

              {selectedItem && (
                <div className="p-6 space-y-6">
                  {/* Info Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "نوع العملية", value: "expense_type" in selectedItem ? selectedItem.expense_type : selectedItem.deduction_type, icon: Folder, color: "text-blue-600" },
                      { label: "تاريخ العملية", value: formatDate(selectedItem.expense_date), icon: Calendar, color: "text-amber-600" },
                      { label: "اسم المستفيد", value: selectedItem.employee_name || "-", icon: Info, color: "text-indigo-600" },
                      { label: "رقم الإقامة", value: selectedItem.employee_iqama || "-", icon: FileText, color: "text-slate-600" },
                      { label: "مركز التكلفة", value: (selectedItem as any).center_name || "-", icon: Building2, color: "text-purple-600" },
                      { label: "الحساب", value: selectedItem.account_name || selectedItem.account_code || "-", icon: Wallet, color: "text-emerald-600" },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                        <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all ${item.color}`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                          <p className="text-sm font-black text-slate-800">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm text-center">
                      <p className="text-xs font-bold text-blue-500 mb-1">المبلغ الإجمالي</p>
                      <p className="text-xl font-black text-blue-700">{formatNumber(selectedItem.amount || 0)} <span className="text-[10px]">ر.س</span></p>
                    </div>
                    {"tax_value" in selectedItem && (
                      <>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-center">
                          <p className="text-xs font-bold text-slate-400 mb-1">قيمة الضريبة</p>
                          <p className="text-xl font-black text-slate-600">{formatNumber(selectedItem.tax_value || 0)} <span className="text-[10px]">ر.س</span></p>
                        </div>
                        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm text-center">
                          <p className="text-xs font-bold text-emerald-500 mb-1">المبلغ الصافي</p>
                          <p className="text-xl font-black text-emerald-700">{formatNumber(selectedItem.net_amount || selectedItem.amount || 0)} <span className="text-[10px]">ر.س</span></p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  {selectedItem.description && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <p className="text-xs font-bold text-slate-400">الوصف والملاحظات</p>
                      </div>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">
                        {selectedItem.description}
                      </p>
                    </div>
                  )}

                  {/* Attachments Section */}
                  {(() => {
                    const attachment = selectedItem.attachment;
                    const attachmentUrl = getAttachmentUrl(attachment);
                    
                    if (!attachmentUrl) return null;
                    
                    return (
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Paperclip className="w-5 h-5 text-blue-600" />
                            <p className="text-sm font-black text-slate-800">المرفقات والمستندات</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-400">
                            1 ملف
                          </Badge>
                        </div>

                        {isImageFile(attachment || '') ? (
                          <div className="space-y-4">
                            <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group">
                              <img 
                                src={attachmentUrl} 
                                alt="المرفق"
                                className="w-full max-h-[400px] object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const parent = (e.target as HTMLImageElement).parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="p-12 text-center text-slate-400 font-bold"><p>لا يمكن تحميل ملف المعاينة</p></div>';
                                  }
                                }}
                              />
                            </div>
                            <Button
                              onClick={() => window.open(attachmentUrl, '_blank')}
                              className="w-full bg-[#111827] hover:bg-slate-800 text-white rounded-xl py-6 font-bold shadow-lg"
                            >
                              <ExternalLink className="w-4 h-4 ml-2" />
                              فتح المرفق بدقة كاملة
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-slate-200 group-hover:rotate-6 transition-transform">
                              <File className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-slate-800 truncate max-w-[250px]">
                                {attachment?.split('/').pop() || 'مستند مالي'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-blue-100 text-blue-600 border-none text-[8px] font-black uppercase">
                                  {attachment?.split('.').pop() || 'FILE'}
                                </Badge>
                                <span className="text-[10px] text-slate-400 font-bold">جاهز للمعاينة</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => window.open(attachmentUrl, '_blank')}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-10 font-black shadow-lg shadow-blue-600/20"
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
