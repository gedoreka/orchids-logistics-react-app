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
import { getPublicUrl } from "@/lib/utils";
import { HierarchicalSearchableSelect } from "@/components/ui/hierarchical-searchable-select";
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
import { useTranslations } from "@/lib/locale-context";

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

const UPLOADS_BASE_URL = `${process.env.NEXT_PUBLIC_APP_URL}/uploads/`;
const SUPABASE_STORAGE_URL = "https://xaexoopjqkrzhbochbef.supabase.co/storage/v1/object/public/expenses/";

  const getAttachmentUrl = (attachment: string | null | undefined) => {
    return getPublicUrl(attachment, 'expenses');
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
  const t = useTranslations("expenses");
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

    const getMonthName = (monthStr: string) => {
      const date = new Date(monthStr + "-01");
      const monthNames = [
        "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
        "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
      ];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    const translateType = (type: string) => {
      if (!type) return "-";
      const typeLower = type.toLowerCase().trim();
      
      const mapping: Record<string, string> = {
        "اصدار اقامة": "iqama_renewal",
        "إصدار إقامة": "iqama_renewal",
        "تجديد اقامة": "iqama_renewal",
        "تجديد إقامة": "iqama_renewal",
        "انترنت": "internet",
        "إنترنت": "internet",
        "وقود": "fuel",
        "صيانة": "maintenance",
        "سكن": "housing",
        "إيجار سكن": "housing",
        "مخالفات": "traffic",
        "سلف": "advances",
        "سلفيات": "advances",
        "استقطاع": "deductions",
        "استقطاعات": "deductions"
      };

      const key = mapping[typeLower] || typeLower;
      const translated = t(`types.${key}`);
      
      if (translated === `expenses.types.${key}` || translated.includes('types.')) {
        return type;
      }
      
      return translated;
    };

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
      const [accountsRes, metadataRes] = await Promise.all([
        fetch(`/api/accounts?company_id=${companyId}`),
        fetch(`/api/expenses/metadata?company_id=${companyId}`)
      ]);
      
      if (!accountsRes.ok) {
        console.error('Accounts API error:', accountsRes.status, accountsRes.statusText);
        throw new Error(`Accounts API failed: ${accountsRes.status}`);
      }
      
      if (!metadataRes.ok) {
        console.error('Metadata API error:', metadataRes.status, metadataRes.statusText);
        throw new Error(`Metadata API failed: ${metadataRes.status}`);
      }
      
      const accountsData = await accountsRes.json();
      const metadataData = await metadataRes.json();
      
      console.log('Raw Accounts Data:', accountsData);
      console.log('Raw Metadata Data:', metadataData);
      
        // Transform accounts data to match HierarchicalSearchableSelect format
        // The API returns parent_account as the parent's account_code (e.g., "1" for assets)
        if (accountsData.success && accountsData.accounts && Array.isArray(accountsData.accounts)) {
          const transformedAccounts = accountsData.accounts.map((acc: any) => ({
            id: acc.account_code, // Use code as id for selector
            code: acc.account_code,
            name: acc.account_name,
            type: acc.account_type || (acc.account_level === 1 ? 'main' : 'sub'),
            parent_id: acc.parent_account || null // parent_account is already the parent code
          }));
          
          console.log('Transformed Accounts:', transformedAccounts);
          setAccounts(transformedAccounts);
        } else {
          console.warn('Accounts data not in expected format:', accountsData);
          setAccounts([]);
        }
        
        // Transform cost centers data to match HierarchicalSearchableSelect format
        // The API returns parent_center as the parent's ID, we need to map it to code
        if (metadataData.costCenters && Array.isArray(metadataData.costCenters)) {
          // Build id->code map for cost centers
          const centerIdToCodeMap: Record<any, string> = {};
          metadataData.costCenters.forEach((center: any) => {
            centerIdToCodeMap[center.id] = center.center_code;
          });
          
          const transformedCenters = metadataData.costCenters.map((center: any) => ({
            id: center.center_code, // Use code as id for selector
            code: center.center_code,
            name: center.center_name,
            type: center.center_level === 1 ? 'main' : 'sub',
            parent_id: center.parent_center ? centerIdToCodeMap[center.parent_center] || null : null
          }));
          
          console.log('Transformed Cost Centers:', transformedCenters);
          setCostCenters(transformedCenters);
        } else {
          console.warn('Cost centers data not in expected format:', metadataData);
          setCostCenters([]);
        }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setAccounts([]);
      setCostCenters([]);
    }
  };

  const handleDeleteClick = (item: ExpenseItem | DeductionItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleEditClick = async (item: ExpenseItem | DeductionItem) => {
    setSelectedItem(item);
    
    // Fetch metadata first
    await fetchMetadata();
    
    setEditForm({
      id: item.id,
      expense_date: item.expense_date?.split('T')[0] || '',
      employee_name: item.employee_name || '',
      employee_iqama: item.employee_iqama || '',
      amount: item.amount || 0,
      tax_value: 'tax_value' in item ? item.tax_value || 0 : 0,
      net_amount: 'net_amount' in item ? item.net_amount || item.amount || 0 : item.amount || 0,
      account_code: item.account_code || '',
      cost_center_code: item.center_code || '',
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
      formData.append('account_code', editForm.account_code || '');
      formData.append('cost_center_code', editForm.cost_center_code || '');
      formData.append('expense_type', editForm.expense_type);
      formData.append('description', editForm.description);
      if ('tax_value' in editForm) {
        formData.append('tax_value', editForm.tax_value.toString());
        formData.append('net_amount', (editForm.net_amount || (editForm.amount - editForm.tax_value)).toString());
      }
      if (editForm.status) formData.append('status', editForm.status);
      if (editForm.newFile) formData.append('attachment', editForm.newFile);
      else formData.append('attachment', editForm.attachment || '');

      const res = await fetch('/api/expenses/report', { method: 'PUT', body: formData });
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
      formData.append('account_code', deduction.account_code || '');
      formData.append('cost_center_code', deduction.center_code || '');
      formData.append('expense_type', deduction.deduction_type || '');
      formData.append('description', deduction.description || '');
      formData.append('attachment', deduction.attachment || '');
      formData.append('status', newStatus);

      const res = await fetch('/api/expenses/report', { method: 'PUT', body: formData });
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

  const { stats, expensesGrouped, deductionsGrouped, payrolls } = data;

  return (
    <div className="min-h-screen bg-transparent rtl print:bg-white" dir="rtl">
      <div className="max-w-[97%] w-[97%] mx-auto py-4 space-y-2 print:w-full print:p-2">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="print:shadow-none">
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] text-white rounded-3xl print:rounded-none print:shadow-none">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x print:hidden" />
            <CardContent className="p-5">
              <div className="flex flex-col items-center justify-center gap-2">
                <h1 className="text-xl lg:text-2xl font-bold flex items-center justify-center gap-3">
                  <TrendingUp className="w-7 h-7 text-amber-400" />
                  {t("report.title")}
                </h1>
                <p className="text-blue-200 text-sm">{t("report.subtitle")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: t("dashboard.totalExpenses"), value: stats.totalExpenses, count: stats.expensesCount, icon: Wallet, gradient: "from-blue-600 to-blue-700", bgGradient: "from-blue-50 to-white", accent: "blue" },
            { label: t("dashboard.totalDeductions"), value: stats.totalDeductions, count: stats.deductionsCount, icon: HandCoins, gradient: "from-rose-600 to-rose-700", bgGradient: "from-rose-50 to-white", accent: "rose" },
            { label: t("dashboard.totalSalaries"), value: stats.totalPayrolls, count: stats.payrollsCount, icon: FileText, gradient: "from-emerald-600 to-emerald-700", bgGradient: "from-emerald-50 to-white", accent: "emerald", link: "/salary-payrolls" },
            { label: t("dashboard.grandTotal"), value: stats.totalAll, count: stats.expensesCount + stats.deductionsCount + stats.payrollsCount, icon: Calculator, gradient: "from-amber-600 to-amber-700", bgGradient: "from-amber-50 to-white", accent: "amber" },
          ].map((stat, idx) => (
            <motion.div key={idx} whileHover={{ y: -5, scale: 1.02 }} onClick={() => stat.link && (window.location.href = stat.link)} className={`relative group ${stat.link ? "cursor-pointer" : ""}`}>
              <Card className={`border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-gradient-to-br ${stat.bgGradient} h-full border-b-4 border-${stat.accent}-500/30`}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className={`text-sm font-bold text-${stat.accent}-700`}>{stat.label}</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-2xl font-black text-slate-800">{formatNumber(stat.value)}</span>
                        <span className="text-[10px] font-bold text-slate-400">SAR</span>
                      </div>
                    </div>
                    <div className="w-full pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">{stat.count}</span>
                      <Info className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="print:hidden">
          <div className="bg-gradient-to-r from-blue-100/80 via-rose-100/80 via-emerald-100/80 to-amber-100/80 backdrop-blur-xl p-2 rounded-[3rem] shadow-inner border border-white/50 inline-flex w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                {[
                  { id: "expenses", label: t("dashboard.expensesReport"), icon: Wallet, color: "blue", gradient: "from-blue-500 to-blue-700" },
                  { id: "deductions", label: t("dashboard.deductionsReport"), icon: HandCoins, color: "rose", gradient: "from-rose-500 to-rose-700" },
                  { id: "all", label: t("report.title"), icon: BarChart3, color: "purple", gradient: "from-blue-600 via-purple-600 to-rose-600" }
                ].map((tab) => (
                <button key={tab.id} onClick={() => setReportType(tab.id as any)} className={`relative flex items-center justify-center gap-4 p-4 rounded-[2.2rem] transition-all duration-500 ${reportType === tab.id ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl scale-[1.02]` : "bg-transparent text-slate-600 hover:bg-white/60"}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${reportType === tab.id ? "bg-white/20" : `bg-${tab.color}-100 text-${tab.color}-600`}`}>
                    <tab.icon className="w-6 h-6" />
                  </div>
                  <span className="text-base font-bold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="print:hidden">
          <Card className="border-none shadow-md rounded-[2rem] bg-gradient-to-r from-blue-100/80 via-rose-100/80 via-emerald-100/80 to-amber-100/80 backdrop-blur-md border border-white/50">
            <CardContent className="p-3">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-slate-700 text-sm font-bold bg-white/80 px-5 py-2.5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span>{t("report.filters")}:</span>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-[180px] border-none bg-transparent font-black focus:ring-0 text-slate-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-2xl bg-white/95 backdrop-blur-lg">
                        {monthOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="font-bold text-slate-700">{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={fetchReportData} className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-[1.5rem] px-8 py-6 shadow-xl shadow-blue-200 transition-all active:scale-95 font-bold">
                    <Search className="w-5 h-5 ml-2" />
                    {t("report.search")}
                  </Button>
                </div>
                <div className="flex items-center gap-1 flex-wrap bg-white p-1.5 rounded-[1.8rem] border border-slate-100 shadow-inner">
                  <Button onClick={handlePrint} variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl px-5 h-10 font-bold">
                    <Printer className="w-4 h-4 ml-2" />
                    {t("fleet.print")}
                  </Button>
                  <Button onClick={handleExportExcel} variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl px-5 h-10 font-bold">
                    <FileSpreadsheet className="w-4 h-4 ml-2" />
                    {t("report.export")}
                  </Button>
                  <Button onClick={() => setShowAnalysisModal(true)} variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl px-5 h-10 font-bold">
                    <BarChart3 className="w-4 h-4 ml-2" />
                    {t("dashboard.analytics")}
                  </Button>
                  <div className="w-px h-8 bg-slate-200 mx-2" />
                  <Button onClick={() => (window.location.href = "/expenses")} variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl px-5 h-10 font-bold">
                    <Home className="w-4 h-4 ml-2" />
                    {t("form.backToCenter")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expenses Table */}
        {(reportType === "expenses" || reportType === "all") && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-none shadow-lg rounded-3xl overflow-hidden">
              <CardContent className="p-4 space-y-4">
                {Object.keys(expensesGrouped).length > 0 ? (
                  Object.entries(expensesGrouped).map(([group, expenses]) => {
                    const groupKey = `expense-${group}`;
                    const isExpanded = expandedGroups[groupKey] !== false;
                    const groupTotal = expenses.reduce((sum, e) => sum + parseFloat(String(e.amount || 0)), 0);
                    return (
                      <div key={group} className="border border-slate-200 rounded-3xl overflow-hidden">
                        <button onClick={() => toggleGroup(groupKey)} className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-3 flex items-center justify-between hover:opacity-95 transition-all">
                          <div className="flex items-center gap-3">
                            <Folder className="w-5 h-5" />
                            <span className="text-sm font-bold">{group}</span>
                          </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-white/20 text-white text-xs px-2 py-0.5">{t("common.operationCount", { count: expenses.length })}</Badge>
                              <Badge className="bg-white/20 text-white text-xs px-2 py-0.5">{formatNumber(groupTotal)} SAR</Badge>
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}><ChevronDown className="w-4 h-4" /></motion.div>
                            </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                              <div className="max-h-[300px] overflow-y-auto bg-white">
                                    <table className="w-full text-sm">
                                        <thead className="bg-blue-50/50 sticky top-0 z-10 border-b-2 border-blue-100 text-[10px] text-blue-900/70 uppercase tracking-wider">
                                          <tr>
                                            <th className="p-2 text-center font-black w-[40px] border-l border-blue-100/50">#</th>
                                            <th className="p-2 text-center font-black border-l border-blue-100/50">{t("form.date")}</th>
                                            <th className="p-2 text-center font-black border-l border-blue-100/50">{t("form.employee")}</th>
                                            <th className="p-2 text-center font-black border-l border-blue-100/50">{t("form.iqamaNumber")}</th>
                                            <th className="p-2 text-center font-black border-l border-blue-100/50">{t("form.amount")}</th>
                                            <th className="p-2 text-center font-black border-l border-blue-100/50">{t("form.tax")}</th>
                                            <th className="p-2 text-center font-black border-l border-blue-100/50">{t("form.net")}</th>
                                            <th className="p-2 text-center font-black border-l border-blue-100/50">{t("form.account")}</th>
                                            <th className="p-2 text-center font-black border-l border-blue-100/50">{t("form.costCenter")}</th>
                                            <th className="p-2 text-center font-black print:hidden w-[150px]">{t("actions.title")}</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {expenses.map((expense, idx) => (
                                            <tr key={expense.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors bg-white text-[11px]">
                                              <td className="p-1 text-center border-l border-slate-50">{idx + 1}</td>
                                              <td className="p-1 text-center border-l border-slate-50">{formatDate(expense.expense_date)}</td>
                                              <td className="p-1 text-center font-bold border-l border-slate-50">{expense.employee_name || "-"}</td>
                                              <td className="p-1 text-center border-l border-slate-50">{expense.employee_iqama || "-"}</td>
                                              <td className="p-1 text-center font-black text-red-600 border-l border-slate-50">{formatNumber(expense.amount || 0)}</td>
                                              <td className="p-1 text-center font-bold text-red-500 border-l border-slate-50">{formatNumber(expense.tax_value || 0)}</td>
                                              <td className="p-1 text-center font-black text-red-700 border-l border-slate-50">{formatNumber(expense.net_amount || expense.amount || 0)}</td>
                                              <td className="p-1 text-center border-l border-slate-50">
                                                <div className="flex flex-col">
                                                  <span className="font-bold text-slate-700">{expense.account_code || "-"}</span>
                                                  <span className="text-[8px] text-slate-400 truncate max-w-[80px]">{expense.account_name}</span>
                                                </div>
                                              </td>
                                              <td className="p-1 text-center border-l border-slate-50">
                                                <div className="flex flex-col">
                                                  <span className="font-bold text-slate-700">{expense.center_code || "-"}</span>
                                                  <span className="text-[8px] text-slate-400 truncate max-w-[80px]">{expense.center_name}</span>
                                                </div>
                                              </td>
                                                <td className="p-1 text-center print:hidden">
                                                  <div className="flex items-center justify-center -space-x-px">
                                                    <Button 
                                                      variant="outline" 
                                                      onClick={() => showItemDetails(expense)} 
                                                      className="h-9 px-3 text-xs font-bold text-blue-600 border-slate-200 rounded-none rounded-r-md hover:bg-blue-50 hover:border-blue-200 z-10"
                                                    >
                                                      {t("actions.view")}
                                                    </Button>
                                                    <Button 
                                                      variant="outline" 
                                                      onClick={() => handleEditClick(expense)} 
                                                      className="h-9 px-3 text-xs font-bold text-amber-600 border-slate-200 rounded-none border-r-0 hover:bg-amber-50 hover:border-amber-200 z-20"
                                                    >
                                                      {t("actions.edit")}
                                                    </Button>
                                                    <Button 
                                                      variant="outline" 
                                                      onClick={() => handleDeleteClick(expense)} 
                                                      className="h-9 px-3 text-xs font-bold text-rose-600 border-slate-200 rounded-none rounded-l-md border-r-0 hover:bg-rose-50 hover:border-rose-200 z-30"
                                                    >
                                                      {t("actions.delete")}
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
                  <div className="text-center py-10">
                    <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">{t("dashboard.noActivity")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Deductions Table */}
        {(reportType === "deductions" || reportType === "all") && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-none shadow-lg rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-rose-100/80 p-4 border-b border-rose-200/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base font-extrabold">
                    <HandCoins className="w-5 h-5 text-rose-600" />
                    {t("expenses.totalDeductions")}
                  </CardTitle>
                    <Badge className="bg-rose-600 text-white text-sm px-3 py-1">
                      {t("common.operationCount", { count: stats.deductionsCount })} - {formatNumber(stats.totalDeductions)} SAR
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {Object.keys(deductionsGrouped).length > 0 ? (
                  Object.entries(deductionsGrouped).map(([group, deductions]) => {
                    const groupKey = `deduction-${group}`;
                    const isExpanded = expandedGroups[groupKey] !== false;
                    const groupTotal = deductions.reduce((sum, d) => sum + parseFloat(String(d.amount || 0)), 0);
                    return (
                      <div key={group} className="border border-slate-200 rounded-3xl overflow-hidden">
                        <button onClick={() => toggleGroup(groupKey)} className="w-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Folder className="w-5 h-5" />
                            <span className="text-sm font-bold">{group}</span>
                          </div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-white/20 text-white text-xs px-2 py-0.5">{t("common.operationCount", { count: deductions.length })}</Badge>
                              <Badge className="bg-white/20 text-white text-xs px-2 py-0.5">{formatNumber(groupTotal)} SAR</Badge>
                              <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}><ChevronDown className="w-4 h-4" /></motion.div>
                            </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                              <div className="max-h-[300px] overflow-y-auto bg-white">
                                    <table className="w-full text-sm">
                                        <thead className="bg-rose-50/50 sticky top-0 z-10 border-b-2 border-rose-100 text-[10px] text-rose-900/70 uppercase tracking-wider">
                                          <tr>
                                            <th className="p-2 text-center font-black w-[40px] border-l border-rose-100/50">#</th>
                                            <th className="p-2 text-center font-black border-l border-rose-100/50">{t("form.date")}</th>
                                            <th className="p-2 text-center font-black border-l border-rose-100/50">{t("form.employee")}</th>
                                            <th className="p-2 text-center font-black border-l border-rose-100/50">{t("form.iqamaNumber")}</th>
                                            <th className="p-2 text-center font-black border-l border-rose-100/50">{t("form.amount")}</th>
                                            <th className="p-2 text-center font-black border-l border-rose-100/50">{t("form.account")}</th>
                                            <th className="p-2 text-center font-black border-l border-rose-100/50">{t("form.costCenter")}</th>
                                            <th className="p-2 text-center font-black border-l border-rose-100/50">{t("common.status")}</th>
                                            <th className="p-2 text-center font-black print:hidden w-[150px]">{t("actions.title")}</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {deductions.map((deduction, idx) => (
                                            <tr key={deduction.id} className="border-b border-slate-100 hover:bg-rose-50/30 transition-colors bg-white text-[11px]">
                                              <td className="p-1 text-center border-l border-slate-50">{idx + 1}</td>
                                              <td className="p-1 text-center border-l border-slate-50">{formatDate(deduction.expense_date)}</td>
                                              <td className="p-1 text-center font-bold border-l border-slate-50">{deduction.employee_name || "-"}</td>
                                              <td className="p-1 text-center border-l border-slate-50">{deduction.employee_iqama || "-"}</td>
                                              <td className="p-1 text-center font-black text-red-600 border-l border-slate-50">{formatNumber(deduction.amount || 0)}</td>
                                              <td className="p-1 text-center border-l border-slate-50">
                                                <div className="flex flex-col">
                                                  <span className="font-bold text-slate-700">{deduction.account_code || "-"}</span>
                                                  <span className="text-[8px] text-slate-400 truncate max-w-[80px]">{deduction.account_name}</span>
                                                </div>
                                              </td>
                                              <td className="p-1 text-center border-l border-slate-50">
                                                <div className="flex flex-col">
                                                  <span className="font-bold text-slate-700">{deduction.center_code || "-"}</span>
                                                  <span className="text-[8px] text-slate-400 truncate max-w-[80px]">{deduction.center_name}</span>
                                                </div>
                                              </td>
                                              <td className="p-1 text-center border-l border-slate-50">
                                                <div 
                                                  onClick={() => !statusUpdating && handleToggleDeductionStatus(deduction)} 
                                                  className={`relative w-20 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-500 shadow-inner mx-auto group ${deduction.status === "completed" ? "bg-emerald-500" : "bg-rose-500"}`}
                                                >
                                                  <div className={`absolute inset-0 flex items-center justify-center text-[8px] font-black text-white transition-opacity duration-300 ${statusUpdating === deduction.id ? "opacity-0" : "opacity-100"}`}>
                                                    <span className={`transition-transform duration-500 ${deduction.status === "completed" ? "translate-x-2" : "-translate-x-2"}`}>
                                                      {deduction.status === "completed" ? "مدفوع" : "غير مدفوع"}
                                                    </span>
                                                  </div>
                                                  <motion.div 
                                                    layout
                                                    className="bg-white w-5 h-5 rounded-full shadow-lg z-20 flex items-center justify-center"
                                                    animate={{ x: deduction.status === "completed" ? (document.dir === 'rtl' ? 52 : -52) : 0 }}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                  >
                                                    {statusUpdating === deduction.id ? (
                                                      <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-400" />
                                                    ) : (
                                                      <div className={`w-1 h-1 rounded-full ${deduction.status === "completed" ? "bg-emerald-500" : "bg-rose-500"}`} />
                                                    )}
                                                  </motion.div>
                                                </div>
                                              </td>
                                                <td className="p-1 text-center print:hidden">
                                                  <div className="flex items-center justify-center -space-x-px">
                                                    <Button 
                                                      variant="outline" 
                                                      onClick={() => showItemDetails(deduction)} 
                                                      className="h-9 px-3 text-xs font-bold text-blue-600 border-slate-200 rounded-none rounded-r-md hover:bg-blue-50 hover:border-blue-200 z-10"
                                                    >
                                                      {t("actions.view")}
                                                    </Button>
                                                    <Button 
                                                      variant="outline" 
                                                      onClick={() => handleEditClick(deduction)} 
                                                      className="h-9 px-3 text-xs font-bold text-amber-600 border-slate-200 rounded-none border-r-0 hover:bg-amber-50 hover:border-amber-200 z-20"
                                                    >
                                                      {t("actions.edit")}
                                                    </Button>
                                                    <Button 
                                                      variant="outline" 
                                                      onClick={() => handleDeleteClick(deduction)} 
                                                      className="h-9 px-3 text-xs font-bold text-rose-600 border-slate-200 rounded-none rounded-l-md border-r-0 hover:bg-rose-50 hover:border-rose-200 z-30"
                                                    >
                                                      {t("actions.delete")}
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
                  <div className="text-center py-10">
                    <HandCoins className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-600">{t("dashboard.noActivity")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 text-white">
            <CardContent className="p-5 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Calculator className="w-7 h-7 text-amber-300" />
                <h2 className="text-lg font-bold">{t("report.summary")} {getMonthName(selectedMonth)}</h2>
              </div>
              <p className="text-3xl font-bold">{formatNumber(stats.totalAll)} SAR</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dialogs & Notifications */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl rtl" dir="rtl">
            <DialogHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-rose-600 text-white p-4 -m-6 mb-4 rounded-t-lg">
              <DialogTitle className="flex items-center gap-2 text-lg font-bold"><Eye className="w-6 h-6" /> {t("common.details")}</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4 p-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="p-3 bg-white border rounded-xl shadow-sm">
                        <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t("common.type")}</p>
                        <p className="font-bold text-slate-800">
                          {translateType("expense_type" in selectedItem ? selectedItem.expense_type : selectedItem.deduction_type)}
                        </p>
                      </div>
                    <div className="p-3 bg-white border rounded-xl shadow-sm"><p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t("form.date")}</p><p className="font-bold text-slate-800">{formatDate(selectedItem.expense_date)}</p></div>
                  <div className="p-3 bg-white border rounded-xl shadow-sm"><p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t("form.employee")}</p><p className="font-bold text-slate-800">{selectedItem.employee_name || "-"}</p></div>
                  <div className="p-3 bg-white border rounded-xl shadow-sm"><p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t("form.iqamaNumber")}</p><p className="font-bold text-slate-800">{selectedItem.employee_iqama || "-"}</p></div>
                  <div className="p-3 bg-white border rounded-xl shadow-sm"><p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-wider">{t("form.account")}</p><p className="font-bold text-slate-800">{selectedItem.account_code || "-"}</p></div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl shadow-sm"><p className="text-[10px] text-blue-600 font-bold mb-1 uppercase tracking-wider">{t("form.amount")}</p><p className="font-bold text-lg text-blue-700">{formatNumber(selectedItem.amount || 0)} SAR</p></div>
                </div>
                
                {selectedItem.description && (
                  <div className="p-4 bg-slate-50 border rounded-2xl">
                    <p className="text-[10px] text-slate-500 font-bold mb-2 uppercase tracking-wider">{t("form.description")}</p>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedItem.description}</p>
                  </div>
                )}

                {"status" in selectedItem && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-rose-500 font-bold mb-1 uppercase tracking-wider">{t("common.status")}</p>
                      <p className={`text-base font-black ${selectedItem.status === "completed" ? "text-emerald-600" : "text-rose-600"}`}>
                        {selectedItem.status === "completed" ? "تم الخصم (مدفوع)" : "لم يتم الخصم (غير مدفوع)"}
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleToggleDeductionStatus(selectedItem as DeductionItem)}
                      disabled={statusUpdating === selectedItem.id}
                      className={`${selectedItem.status === "completed" ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white rounded-xl px-6 font-bold h-12 shadow-lg transition-all active:scale-95`}
                    >
                      {statusUpdating === selectedItem.id ? <Loader2 className="animate-spin w-5 h-5" /> : (selectedItem.status === "completed" ? "تغيير لغير مدفوع" : "تأكيد السداد")}
                    </Button>
                  </div>
                )}

                {selectedItem.attachment && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <p className="text-[10px] text-blue-500 font-bold mb-3 uppercase tracking-wider">{t("form.document")}</p>
                    <div className="flex flex-col gap-4">
                      {isImageFile(selectedItem.attachment) ? (
                        <div className="relative group overflow-hidden rounded-xl border border-blue-200 bg-white">
                          <img 
                            src={getAttachmentUrl(selectedItem.attachment) || ''} 
                            alt="Attachment" 
                            className="max-h-[300px] w-full object-contain p-2"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              variant="secondary" 
                              onClick={() => window.open(getAttachmentUrl(selectedItem.attachment) || '', '_blank')}
                              className="rounded-full h-12 w-12 p-0"
                            >
                              <ExternalLink className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full h-16 rounded-xl border-blue-200 bg-white hover:bg-blue-50 flex items-center justify-center gap-3 text-blue-700 font-bold"
                          onClick={() => window.open(getAttachmentUrl(selectedItem.attachment) || '', '_blank')}
                        >
                          <FileText className="w-6 h-6" />
                          <span>عرض وتحميل الملف المرفق</span>
                          <ExternalLink className="w-4 h-4 mr-auto" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
          </Dialog>

        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-3xl rtl" dir="rtl">
            <DialogHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 -m-6 mb-4 rounded-t-lg">
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Pencil className="w-6 h-6" /> {t("actions.edit")}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-2 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold">{t("form.date")}</Label>
                <Input 
                  type="date" 
                  value={editForm.expense_date || ""} 
                  onChange={(e) => setEditForm({...editForm, expense_date: e.target.value})}
                  className="text-gray-900"
                />
              </div>
                <div className="space-y-2">
                  <Label className="text-gray-900 font-semibold">{t("common.type")}</Label>
                  <Input 
                    disabled 
                    value={translateType(editForm.expense_type)} 
                    className="text-gray-900 bg-gray-50"
                  />
                </div>
              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold">{t("form.employee")}</Label>
                <Input 
                  value={editForm.employee_name || ""} 
                  onChange={(e) => setEditForm({...editForm, employee_name: e.target.value})}
                  className="text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold">{t("form.iqamaNumber")}</Label>
                <Input 
                  value={editForm.employee_iqama || ""} 
                  onChange={(e) => setEditForm({...editForm, employee_iqama: e.target.value})}
                  className="text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold">{t("form.amount")}</Label>
                <Input 
                  type="number" 
                  value={editForm.amount || 0} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const tax = "tax_value" in editForm ? val * 0.15 : 0;
                    setEditForm({
                      ...editForm, 
                      amount: val, 
                      tax_value: tax,
                      net_amount: "tax_value" in editForm ? val - tax : val
                    });
                  }}
                  className="text-gray-900"
                />
              </div>
              {"tax_value" in editForm && (
                <>
                  <div className="space-y-2">
                    <Label className="text-gray-900 font-semibold">{t("form.tax")}</Label>
                    <Input disabled value={formatNumber(editForm.tax_value || 0)} className="text-gray-900 bg-gray-50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-900 font-semibold">{t("form.net")}</Label>
                    <Input disabled value={formatNumber(editForm.net_amount || 0)} className="text-gray-900 bg-gray-50" />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold">{t("form.account")}</Label>
                <HierarchicalSearchableSelect 
                  value={editForm.account_code || ""}
                  onSelect={(value) => setEditForm({...editForm, account_code: value})}
                  items={accounts}
                  placeholder={t("form.account")}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-900 font-semibold">{t("form.costCenter")}</Label>
                <HierarchicalSearchableSelect 
                  value={editForm.cost_center_code || ""}
                  onSelect={(value) => setEditForm({...editForm, cost_center_code: value})}
                  items={costCenters}
                  placeholder={t("form.costCenter")}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-gray-900 font-semibold">{t("form.description")}</Label>
                <Textarea 
                  value={editForm.description || ""} 
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="text-gray-900 min-h-[80px]"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label className="text-gray-900 font-semibold">{t("form.document")}</Label>
                <div className="space-y-2">
                  {editForm.attachment && !editForm.newFile && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                      <Paperclip className="w-4 h-4" />
                      <span className="font-semibold">مستند محفوظ مسبقاً</span>
                    </div>
                  )}
                  {editForm.newFile && (
                    <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                      <FileText className="w-4 h-4" />
                      <span className="font-semibold">مستند جديد: {editForm.newFile.name}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Input 
                      type="file" 
                      onChange={(e) => setEditForm({...editForm, newFile: e.target.files?.[0] || null})}
                      className="text-gray-900"
                    />
                    <p className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded border border-gray-200">
                      <strong>ملاحظة:</strong> المستند المحفوظ سيبقى كما هو إلا إذا قمت باختيار مستند جديد من جهازك.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button onClick={handleEditSubmit} disabled={editLoading} className="bg-amber-600 hover:bg-amber-700 text-white">
                {editLoading ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                {t("common.save")}
              </Button>
              <Button onClick={() => setShowEditModal(false)} variant="outline">{t("common.cancel")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

  <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
    <DialogContent className="max-w-md rtl text-center" dir="rtl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold flex flex-col items-center gap-4">
          <AlertTriangle className="w-16 h-16 text-red-500" />
          {t("accounts.confirmDelete")}
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p className="text-slate-500">{t("accounts.confirmDeleteMessage")}</p>
      </div>
      <DialogFooter className="flex gap-3 justify-center sm:justify-center">
        <Button onClick={handleDelete} disabled={deleteLoading} className="bg-red-600 hover:bg-red-700 text-white">
          {deleteLoading ? <Loader2 className="animate-spin" /> : t("accounts.yesDelete")}
        </Button>
        <Button onClick={() => setShowDeleteModal(false)} variant="outline">{t("common.cancel")}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

      <AnimatePresence>
        {notification.show && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="fixed top-10 left-1/2 -translate-x-1/2 z-[100]">
            <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-white ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              {notification.type === 'success' ? <CheckCircle2 /> : <X />}
              <span className="font-bold">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <style jsx global>{`
      .animate-gradient-x { background-size: 200% 100%; animation: gradient-x 3s ease infinite; }
      @keyframes gradient-x { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      @media print { .print\\:hidden { display: none !important; } }
    `}</style>
  </div>
);
}
