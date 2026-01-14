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
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users,
  Receipt,
  Folder,
  Info,
  X,
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
} from "@/components/ui/dialog";

interface ExpenseItem {
  id: number;
  expense_type: string;
  expense_date: string;
  employee_name: string;
  employee_iqama: string;
  amount: number;
  tax_value: number;
  net_amount: number;
  account_code: string;
  account_name: string;
  center_code: string;
  center_name: string;
  description: string;
  attachment: string;
}

interface DeductionItem {
  id: number;
  deduction_type: string;
  expense_date: string;
  employee_name: string;
  employee_iqama: string;
  amount: number;
  account_code: string;
  account_name: string;
  center_code: string;
  center_name: string;
  description: string;
  status: string;
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
  return new Intl.NumberFormat("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getMonthName = (monthStr: string) => {
  const date = new Date(monthStr + "-01");
  return date.toLocaleDateString("ar-SA", { month: "long", year: "numeric" });
};

const generateMonthOptions = () => {
  const options = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= currentYear - 2; year--) {
    for (let month = 12; month >= 1; month--) {
      const monthStr = `${year}-${month.toString().padStart(2, "0")}`;
      const date = new Date(monthStr + "-01");
      const label = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      options.push({ value: monthStr, label });
    }
  }
  return options;
};

export function ExpensesReportClient({ companyId }: ExpensesReportClientProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReportData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [reportType, setReportType] = useState<"expenses" | "deductions" | "all">(
    "expenses"
  );
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | DeductionItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
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
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 rtl print:bg-white"
      dir="rtl"
    >
      <div className="max-w-[98%] mx-auto py-6 space-y-6 print:max-w-full print:p-4">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="print:shadow-none"
        >
          <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-[#1e3a5f] via-[#2d4a6f] to-[#1e3a5f] text-white rounded-[2rem] print:rounded-none print:shadow-none">
            {/* Top Gradient Bar */}
            <div className="h-1.5 bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 via-rose-400 to-purple-400 print:hidden" />
            
            <CardContent className="p-8">
              {/* Company & Title Section */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Company Info */}
                <div className="flex items-center gap-5">
                  {companyInfo?.logo_path ? (
                    <img
                      src={companyInfo.logo_path}
                      alt="Logo"
                      className="w-24 h-24 rounded-full border-4 border-white/20 object-cover shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl border-4 border-white/20">
                      <Building2 className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white/90">
                      {companyInfo?.name || "اسم الشركة"}
                    </h2>
                    <p className="text-blue-200 text-sm mt-1">
                      نظام إدارة المنصرفات والرواتب
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center flex-1">
                  <h1 className="text-3xl lg:text-4xl font-black flex items-center justify-center gap-4">
                    <TrendingUp className="w-10 h-10 text-amber-400" />
                    التقرير الشامل للمنصرفات
                  </h1>
                </div>

                {/* Month Selector */}
                <div
                  className="bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-4 border border-white/20 cursor-pointer hover:bg-white/20 transition-all print:hidden"
                  onClick={() =>
                    document.getElementById("monthSelect")?.click()
                  }
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="w-8 h-8 text-amber-400" />
                    <div>
                      <p className="text-xs text-blue-200">الشهر المحدد</p>
                      <p className="text-xl font-bold">
                        {getMonthName(selectedMonth)}
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-blue-200" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="print:hidden"
        >
          <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-3 divide-x divide-slate-100 rtl:divide-x-reverse">
                {[
                  {
                    type: "expenses" as const,
                    label: "المنصرفات الشهرية",
                    sub: "عرض جميع المنصرفات",
                    icon: Wallet,
                    count: stats.expensesCount,
                    color: "blue",
                  },
                  {
                    type: "deductions" as const,
                    label: "الاستقطاعات الشهرية",
                    sub: "عرض جميع الاستقطاعات",
                    icon: HandCoins,
                    count: stats.deductionsCount,
                    color: "rose",
                  },
                  {
                    type: "all" as const,
                    label: "التقرير الشامل",
                    sub: "عرض جميع البيانات معاً",
                    icon: BarChart3,
                    count: stats.expensesCount + stats.deductionsCount,
                    color: "purple",
                  },
                ].map((tab) => (
                  <button
                    key={tab.type}
                    onClick={() => setReportType(tab.type)}
                    className={`relative p-6 text-center transition-all duration-300 group ${
                      reportType === tab.type
                        ? `bg-gradient-to-b from-${tab.color}-50 to-white`
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {reportType === tab.type && (
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600`}
                      />
                    )}
                    <Badge
                      className={`absolute top-3 left-3 ${
                        reportType === tab.type
                          ? `bg-${tab.color}-500`
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {tab.count}
                    </Badge>
                    <tab.icon
                      className={`w-8 h-8 mx-auto mb-3 ${
                        reportType === tab.type
                          ? `text-${tab.color}-600`
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <h3
                      className={`font-bold ${
                        reportType === tab.type
                          ? `text-${tab.color}-700`
                          : "text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{tab.sub}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Control Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="print:hidden"
        >
          <Card className="border-none shadow-lg rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Date Filter */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Filter className="w-5 h-5 text-blue-600" />
                    <span>اختر الشهر:</span>
                  </div>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger
                      id="monthSelect"
                      className="w-[200px] rounded-xl border-slate-200"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={fetchReportData}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl"
                  >
                    <Search className="w-4 h-4 ml-2" />
                    تصفية
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    onClick={handlePrint}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl"
                  >
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة
                  </Button>
                  <Button
                    onClick={handleExportExcel}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl"
                  >
                    <FileSpreadsheet className="w-4 h-4 ml-2" />
                    تصدير Excel
                  </Button>
                  <Button
                    onClick={() => setShowAnalysisModal(true)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl"
                  >
                    <BarChart3 className="w-4 h-4 ml-2" />
                    تحليل
                  </Button>
                  <Button
                    onClick={() => (window.location.href = "/expenses")}
                    className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl"
                  >
                    <Home className="w-4 h-4 ml-2" />
                    الرئيسية
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {[
            {
              label: "المنصرفات الشهرية",
              value: stats.totalExpenses,
              count: stats.expensesCount,
              countLabel: "عملية",
              icon: Wallet,
              gradient: "from-blue-500 to-blue-600",
              bgGradient: "from-blue-50 to-blue-100/50",
              borderColor: "border-l-blue-500",
            },
            {
              label: "الاستقطاعات الشهرية",
              value: stats.totalDeductions,
              count: stats.deductionsCount,
              countLabel: "عملية",
              icon: HandCoins,
              gradient: "from-rose-500 to-rose-600",
              bgGradient: "from-rose-50 to-rose-100/50",
              borderColor: "border-l-rose-500",
            },
            {
              label: "مسيرات الرواتب",
              value: stats.totalPayrolls,
              count: stats.payrollsCount,
              countLabel: "مسير",
              icon: FileText,
              gradient: "from-emerald-500 to-emerald-600",
              bgGradient: "from-emerald-50 to-emerald-100/50",
              borderColor: "border-l-emerald-500",
              link: "/salary-payrolls",
            },
            {
              label: "المجموع الكلي",
              value: stats.totalAll,
              count: null,
              countLabel: "إجمالي جميع المصروفات",
              icon: Calculator,
              gradient: "from-amber-500 to-amber-600",
              bgGradient: "from-amber-50 to-amber-100/50",
              borderColor: "border-l-amber-500",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={() => stat.link && (window.location.href = stat.link)}
              className={stat.link ? "cursor-pointer" : ""}
            >
              <Card
                className={`border-none shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br ${stat.bgGradient} border-l-4 ${stat.borderColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-800 tabular-nums">
                        {formatNumber(stat.value)}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">ر.س</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-700">{stat.label}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {stat.count !== null
                          ? `${stat.count} ${stat.countLabel}`
                          : stat.countLabel}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Expenses Section */}
        {(reportType === "expenses" || reportType === "all") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Wallet className="w-7 h-7" />
                    المنصرفات الشهرية
                  </CardTitle>
                  <Badge className="bg-white/20 text-white text-base px-4 py-2">
                    {stats.expensesCount} عملية - {formatNumber(stats.totalExpenses)}{" "}
                    ر.س
                  </Badge>
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
                        className="border border-slate-200 rounded-2xl overflow-hidden"
                      >
                        {/* Group Header */}
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-5 flex items-center justify-between hover:opacity-95 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <Folder className="w-6 h-6" />
                            <span className="text-lg font-bold">{group}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className="bg-white/20 text-white px-3 py-1">
                              {expenses.length} عملية
                            </Badge>
                            <Badge className="bg-white/20 text-white px-3 py-1">
                              {formatNumber(groupTotal)} ر.س
                            </Badge>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                            >
                              <ChevronDown className="w-5 h-5" />
                            </motion.div>
                          </div>
                        </button>

                        {/* Group Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="max-h-[400px] overflow-y-auto">
                                <table className="w-full">
                                  <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        #
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        التاريخ
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        اسم المستفيد
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        رقم الإقامة
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        المبلغ
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        الضريبة
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        الصافي
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        الحساب
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        مركز التكلفة
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold print:hidden">
                                        التفاصيل
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {expenses.map((expense, idx) => (
                                      <tr
                                        key={expense.id}
                                        className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors"
                                      >
                                        <td className="p-4 text-center text-slate-500">
                                          {idx + 1}
                                        </td>
                                        <td className="p-4 text-center">
                                          {formatDate(expense.expense_date)}
                                        </td>
                                        <td className="p-4 text-center font-medium">
                                          {expense.employee_name || "-"}
                                        </td>
                                        <td className="p-4 text-center text-slate-500">
                                          {expense.employee_iqama || "-"}
                                        </td>
                                        <td className="p-4 text-center font-bold text-blue-600">
                                          {formatNumber(expense.amount || 0)}
                                        </td>
                                        <td className="p-4 text-center text-slate-500">
                                          {formatNumber(expense.tax_value || 0)}
                                        </td>
                                        <td className="p-4 text-center font-bold text-emerald-600">
                                          {formatNumber(
                                            expense.net_amount || expense.amount || 0
                                          )}
                                        </td>
                                        <td className="p-4 text-center">
                                          <div className="text-sm">
                                            {expense.account_code || "-"}
                                          </div>
                                          {expense.account_name && (
                                            <div className="text-xs text-slate-400">
                                              {expense.account_name}
                                            </div>
                                          )}
                                        </td>
                                        <td className="p-4 text-center">
                                          <div className="text-sm">
                                            {expense.center_code || "-"}
                                          </div>
                                          {expense.center_name && (
                                            <div className="text-xs text-slate-400">
                                              {expense.center_name}
                                            </div>
                                          )}
                                        </td>
                                        <td className="p-4 text-center print:hidden">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => showItemDetails(expense)}
                                            className="text-blue-600 hover:bg-blue-100"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Group Subtotal */}
                              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-t border-slate-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Calculator className="w-5 h-5" />
                                    <span className="font-bold">
                                      الإجمالي الفرعي لـ {group}:
                                    </span>
                                  </div>
                                  <span className="text-xl font-black text-slate-800">
                                    {formatNumber(groupTotal)} ريال سعودي
                                  </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                  ({expenses.length} عملية)
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wallet className="w-10 h-10 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-600">
                      لا توجد منصرفات لهذا الشهر
                    </h4>
                    <p className="text-slate-400 mt-2">
                      لم يتم إضافة أي منصرفات للشهر المحدد
                    </p>
                    <Button
                      className="mt-6 bg-blue-600 hover:bg-blue-700"
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
            <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <HandCoins className="w-7 h-7" />
                    الاستقطاعات الشهرية
                  </CardTitle>
                  <Badge className="bg-white/20 text-white text-base px-4 py-2">
                    {stats.deductionsCount} عملية -{" "}
                    {formatNumber(stats.totalDeductions)} ر.س
                  </Badge>
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
                        className="border border-slate-200 rounded-2xl overflow-hidden"
                      >
                        {/* Group Header */}
                        <button
                          onClick={() => toggleGroup(groupKey)}
                          className="w-full bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 text-white p-5 flex items-center justify-between hover:opacity-95 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <Folder className="w-6 h-6" />
                            <span className="text-lg font-bold">{group}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className="bg-white/20 text-white px-3 py-1">
                              {deductions.length} عملية
                            </Badge>
                            <Badge className="bg-white/20 text-white px-3 py-1">
                              {formatNumber(groupTotal)} ر.س
                            </Badge>
                            <motion.div
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                            >
                              <ChevronDown className="w-5 h-5" />
                            </motion.div>
                          </div>
                        </button>

                        {/* Group Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="max-h-[400px] overflow-y-auto">
                                <table className="w-full">
                                  <thead className="bg-slate-50 sticky top-0 z-10">
                                    <tr>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        #
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        التاريخ
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        اسم الموظف
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        رقم الإقامة
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        المبلغ
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        الحساب
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        مركز التكلفة
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold">
                                        الحالة
                                      </th>
                                      <th className="p-4 text-center text-slate-600 font-bold print:hidden">
                                        التفاصيل
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {deductions.map((deduction, idx) => (
                                      <tr
                                        key={deduction.id}
                                        className="border-b border-slate-100 hover:bg-rose-50/50 transition-colors"
                                      >
                                        <td className="p-4 text-center text-slate-500">
                                          {idx + 1}
                                        </td>
                                        <td className="p-4 text-center">
                                          {formatDate(deduction.expense_date)}
                                        </td>
                                        <td className="p-4 text-center font-medium">
                                          {deduction.employee_name || "-"}
                                        </td>
                                        <td className="p-4 text-center text-slate-500">
                                          {deduction.employee_iqama || "-"}
                                        </td>
                                        <td className="p-4 text-center font-bold text-rose-600">
                                          {formatNumber(deduction.amount || 0)}
                                        </td>
                                        <td className="p-4 text-center">
                                          <div className="text-sm">
                                            {deduction.account_code || "-"}
                                          </div>
                                          {deduction.account_name && (
                                            <div className="text-xs text-slate-400">
                                              {deduction.account_name}
                                            </div>
                                          )}
                                        </td>
                                        <td className="p-4 text-center">
                                          <div className="text-sm">
                                            {deduction.center_code || "-"}
                                          </div>
                                          {deduction.center_name && (
                                            <div className="text-xs text-slate-400">
                                              {deduction.center_name}
                                            </div>
                                          )}
                                        </td>
                                        <td className="p-4 text-center">
                                          <Badge
                                            className={`${
                                              deduction.status === "completed"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-amber-100 text-amber-700"
                                            }`}
                                          >
                                            {deduction.status === "completed"
                                              ? "مدفوع"
                                              : "غير مدفوع"}
                                          </Badge>
                                        </td>
                                        <td className="p-4 text-center print:hidden">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                              showItemDetails(deduction)
                                            }
                                            className="text-rose-600 hover:bg-rose-100"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Group Subtotal */}
                              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-t border-slate-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Calculator className="w-5 h-5" />
                                    <span className="font-bold">
                                      الإجمالي الفرعي لـ {group}:
                                    </span>
                                  </div>
                                  <span className="text-xl font-black text-slate-800">
                                    {formatNumber(groupTotal)} ريال سعودي
                                  </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                  ({deductions.length} عملية)
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HandCoins className="w-10 h-10 text-slate-300" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-600">
                      لا توجد استقطاعات لهذا الشهر
                    </h4>
                    <p className="text-slate-400 mt-2">
                      لم يتم إضافة أي استقطاعات للشهر المحدد
                    </p>
                    <Button
                      className="mt-6 bg-rose-600 hover:bg-rose-700"
                      onClick={() =>
                        (window.location.href = "/expenses/deductions")
                      }
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
        {(reportType === "expenses" || reportType === "all") &&
          payrolls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <FileText className="w-7 h-7" />
                      مسيرات الرواتب
                    </CardTitle>
                    <Badge className="bg-white/20 text-white text-base px-4 py-2">
                      {payrolls.length} مسير - {formatNumber(stats.totalPayrolls)}{" "}
                      ر.س
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-4 text-center text-slate-600 font-bold">
                          #
                        </th>
                        <th className="p-4 text-center text-slate-600 font-bold">
                          شهر المسير
                        </th>
                        <th className="p-4 text-center text-slate-600 font-bold">
                          المبلغ الإجمالي
                        </th>
                        <th className="p-4 text-center text-slate-600 font-bold">
                          عدد الموظفين
                        </th>
                        <th className="p-4 text-center text-slate-600 font-bold">
                          تاريخ الإنشاء
                        </th>
                        <th className="p-4 text-center text-slate-600 font-bold print:hidden">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payrolls.map((payroll, idx) => (
                        <tr
                          key={payroll.id}
                          className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors"
                        >
                          <td className="p-4 text-center text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="p-4 text-center font-medium">
                            {payroll.payroll_month}
                          </td>
                          <td className="p-4 text-center font-bold text-emerald-600">
                            {formatNumber(payroll.total_amount || 0)} ر.س
                          </td>
                          <td className="p-4 text-center">
                            <Badge className="bg-emerald-100 text-emerald-700">
                              {payroll.employee_count} موظف
                            </Badge>
                          </td>
                          <td className="p-4 text-center text-slate-500">
                            {formatDate(payroll.created_at)}
                          </td>
                          <td className="p-4 text-center print:hidden">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                (window.location.href = `/salary-payrolls/${payroll.id}`)
                              }
                              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            >
                              <Eye className="w-4 h-4 ml-2" />
                              عرض التفاصيل
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
          <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-gradient-to-r from-rose-600 via-rose-700 to-red-700 text-white">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Calculator className="w-10 h-10 text-amber-300" />
                <h2 className="text-2xl font-bold">
                  الإجمالي النهائي لشهر {getMonthName(selectedMonth)}
                </h2>
              </div>
              <p className="text-5xl font-black tabular-nums mb-4">
                {formatNumber(stats.totalAll)} ريال سعودي
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-lg">
                <span className="bg-white/10 px-4 py-2 rounded-xl">
                  منصرفات: {formatNumber(stats.totalExpenses)} ر.س
                </span>
                <span className="bg-white/10 px-4 py-2 rounded-xl">
                  استقطاعات: {formatNumber(stats.totalDeductions)} ر.س
                </span>
                <span className="bg-white/10 px-4 py-2 rounded-xl">
                  رواتب: {formatNumber(stats.totalPayrolls)} ر.س
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl rtl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <Info className="w-6 h-6 text-blue-600" />
                التفاصيل الكاملة
              </DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">النوع</p>
                    <p className="font-bold text-slate-800">
                      {"expense_type" in selectedItem
                        ? selectedItem.expense_type
                        : selectedItem.deduction_type}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">التاريخ</p>
                    <p className="font-bold text-slate-800">
                      {formatDate(selectedItem.expense_date)}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">اسم المستفيد</p>
                    <p className="font-bold text-slate-800">
                      {selectedItem.employee_name || "-"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">رقم الإقامة</p>
                    <p className="font-bold text-slate-800">
                      {selectedItem.employee_iqama || "-"}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm text-blue-600">المبلغ</p>
                    <p className="font-black text-2xl text-blue-700">
                      {formatNumber(selectedItem.amount || 0)} ر.س
                    </p>
                  </div>
                  {"tax_value" in selectedItem && (
                    <>
                      <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-sm text-slate-500">الضريبة</p>
                        <p className="font-bold text-slate-800">
                          {formatNumber(selectedItem.tax_value || 0)} ر.س
                        </p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-xl">
                        <p className="text-sm text-emerald-600">الصافي</p>
                        <p className="font-black text-xl text-emerald-700">
                          {formatNumber(
                            selectedItem.net_amount || selectedItem.amount || 0
                          )}{" "}
                          ر.س
                        </p>
                      </div>
                    </>
                  )}
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">الحساب</p>
                    <p className="font-bold text-slate-800">
                      {selectedItem.account_code || "-"}
                    </p>
                    {selectedItem.account_name && (
                      <p className="text-sm text-slate-500">
                        {selectedItem.account_name}
                      </p>
                    )}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">مركز التكلفة</p>
                    <p className="font-bold text-slate-800">
                      {selectedItem.center_code || "-"}
                    </p>
                    {selectedItem.center_name && (
                      <p className="text-sm text-slate-500">
                        {selectedItem.center_name}
                      </p>
                    )}
                  </div>
                </div>
                {selectedItem.description && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500">الوصف</p>
                    <p className="font-medium text-slate-800">
                      {selectedItem.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Analysis Modal */}
        <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
          <DialogContent className="max-w-lg rtl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-xl">
                <BarChart3 className="w-6 h-6 text-amber-600" />
                تحليل البيانات
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <h4 className="font-bold text-slate-800 text-lg">
                تحليل شهر {getMonthName(selectedMonth)}
              </h4>
              <hr />
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-slate-600">إجمالي المنصرفات:</span>
                  <span className="font-bold text-blue-700">
                    {formatNumber(stats.totalExpenses)} ر.س
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl">
                  <span className="text-slate-600">إجمالي الاستقطاعات:</span>
                  <span className="font-bold text-rose-700">
                    {formatNumber(stats.totalDeductions)} ر.س
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="text-slate-600">إجمالي الرواتب:</span>
                  <span className="font-bold text-emerald-700">
                    {formatNumber(stats.totalPayrolls)} ر.س
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
                  <span className="text-slate-600">المجموع الكلي:</span>
                  <span className="font-black text-amber-700">
                    {formatNumber(stats.totalAll)} ر.س
                  </span>
                </div>
              </div>
              <hr />
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                <span className="text-slate-600">متوسط المنصرف اليومي:</span>
                <span className="font-bold text-purple-700">
                  {formatNumber(
                    stats.totalExpenses /
                      new Date(
                        parseInt(selectedMonth.split("-")[0]),
                        parseInt(selectedMonth.split("-")[1]),
                        0
                      ).getDate()
                  )}{" "}
                  ر.س
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Print Styles */}
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

          .print\\:max-w-full {
            max-width: 100% !important;
          }

          .print\\:p-4 {
            padding: 1rem !important;
          }

          .print\\:bg-white {
            background: white !important;
          }

          @page {
            size: A4 portrait;
            margin: 1cm;
          }
        }

        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
