"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Building2,
  TrendingUp,
  TrendingDown,
  Scale,
  Activity,
  Search,
  Filter,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  FileText,
  Wallet,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Clock,
  Hash,
  User,
  Building,
  FileSpreadsheet,
  FileType,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartPie,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface LedgerEntry {
  id: string;
  date: string;
  document_number: string;
  description: string;
  account_code: string;
  account_name: string;
  account_type: string;
  cost_center_code: string;
  cost_center_name: string;
  debit: number;
  credit: number;
  balance: number;
  source: string;
  source_type: string;
  employee_name: string;
  employee_iqama?: string;
  month_reference?: string;
}

interface GeneralLedgerClientProps {
  companyId: number;
  companyInfo: {
    name: string;
    logo_path: string | null;
  };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export function GeneralLedgerClient({ companyId, companyInfo }: GeneralLedgerClientProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalDebit: 0,
    totalCredit: 0,
    finalBalance: 0,
    entriesCount: 0,
    activeAccounts: 0,
  });
  const [chartData, setChartData] = useState<{
    monthlyTrend: any[];
    topAccounts: any[];
    costCenterDistribution: any[];
  }>({
    monthlyTrend: [],
    topAccounts: [],
    costCenterDistribution: [],
  });
  const [metadata, setMetadata] = useState<{
    accounts: any[];
    costCenters: any[];
  }>({
    accounts: [],
    costCenters: [],
  });

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    accountId: "",
    costCenterId: "",
    search: "",
    entryType: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LedgerEntry | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "date",
    direction: "desc",
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      if (filters.fromDate) params.set("from_date", filters.fromDate);
      if (filters.toDate) params.set("to_date", filters.toDate);
      if (filters.accountId) params.set("account_id", filters.accountId);
      if (filters.costCenterId) params.set("cost_center_id", filters.costCenterId);
      if (filters.search) params.set("search", filters.search);
      if (filters.entryType !== "all") params.set("entry_type", filters.entryType);

      const response = await fetch(`/api/general-ledger?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        return;
      }

      setEntries(data.entries || []);
      setStats(data.stats || {});
      setChartData(data.chartData || {});
      setMetadata(data.metadata || { accounts: [], costCenters: [] });
    } catch (error) {
      console.error("Error fetching ledger data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const sortedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof LedgerEntry];
      const bValue = b[sortConfig.key as keyof LedgerEntry];
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue || "");
      const bStr = String(bValue || "");
      return sortConfig.direction === "asc" 
        ? aStr.localeCompare(bStr) 
        : bStr.localeCompare(aStr);
    });
    return sorted;
  }, [entries, sortConfig]);

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEntries.slice(start, start + pageSize);
  }, [sortedEntries, currentPage, pageSize]);

  const totalPages = Math.ceil(entries.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleExportExcel = () => {
    const headers = ["التاريخ", "رقم المستند", "الوصف", "رمز الحساب", "اسم الحساب", "مركز التكلفة", "مدين", "دائن", "الرصيد"];
    const csvContent = [
      headers.join(","),
      ...entries.map(e => [
        e.date,
        e.document_number,
        `"${e.description}"`,
        e.account_code,
        `"${e.account_name}"`,
        e.cost_center_code,
        e.debit.toFixed(2),
        e.credit.toFixed(2),
        e.balance.toFixed(2),
      ].join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `general_ledger_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("ar-SA");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            <BookOpen className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white/70 font-bold text-lg">جاري تحميل دفتر الأستاذ...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4 md:p-6 font-tajawal print:bg-white print:p-0" dir="rtl">
      <motion.div
        className="max-w-[1600px] mx-auto space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-2xl border border-white/10 print:hidden"
          variants={itemVariants}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-purple-500 to-blue-500 animate-gradient-x" />
          
          <div className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  {companyInfo.logo_path ? (
                    <img
                      src={companyInfo.logo_path}
                      alt="Logo"
                      className="w-20 h-20 rounded-2xl border-2 border-white/20 object-cover shadow-2xl"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    دفتر الأستاذ العام
                  </h1>
                  <p className="text-white/60 font-medium mt-1">{companyInfo.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold">
                      <Activity className="w-3 h-3 ml-1" />
                      مباشر
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      {entries.length} حركة
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => fetchData(true)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold rounded-xl"
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? "animate-spin" : ""}`} />
                  تحديث
                </Button>
                <Button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  variant="outline"
                  className="bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30 font-bold rounded-xl"
                >
                  <BarChart3 className="w-4 h-4 ml-2" />
                  التحليلات
                </Button>
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 font-bold rounded-xl"
                >
                  <FileSpreadsheet className="w-4 h-4 ml-2" />
                  Excel
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30 font-bold rounded-xl"
                >
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
              {[
                { label: "إجمالي المدين", value: stats.totalDebit, icon: TrendingUp, color: "from-rose-500 to-red-600", iconBg: "bg-rose-500/20" },
                { label: "إجمالي الدائن", value: stats.totalCredit, icon: TrendingDown, color: "from-emerald-500 to-green-600", iconBg: "bg-emerald-500/20" },
                { label: "الرصيد النهائي", value: stats.finalBalance, icon: Scale, color: "from-blue-500 to-indigo-600", iconBg: "bg-blue-500/20" },
                { label: "عدد الحركات", value: stats.entriesCount, icon: Activity, color: "from-purple-500 to-violet-600", iconBg: "bg-purple-500/20", isCount: true },
                { label: "الحسابات النشطة", value: stats.activeAccounts, icon: Layers, color: "from-amber-500 to-orange-600", iconBg: "bg-amber-500/20", isCount: true },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative z-10 flex flex-col items-center text-center gap-2">
                    <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl md:text-3xl font-black text-white tabular-nums">
                      {stat.isCount ? stat.value : formatNumber(stat.value)}
                    </span>
                    <span className="text-xs font-medium text-white/50">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden print:hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      تطور الحركات الشهرية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData.monthlyTrend}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                        <Tooltip
                          contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "white" }}
                          formatter={(value: number) => [formatNumber(value) + " ر.س", "المبلغ"]}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fill="url(#colorAmount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-600" />
                      توزيع مراكز التكلفة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {chartData.costCenterDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartPie>
                          <Pie
                            data={chartData.costCenterDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="total"
                            nameKey="name"
                          >
                            {chartData.costCenterDistribution.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "white" }}
                            formatter={(value: number) => formatNumber(value) + " ر.س"}
                          />
                          <Legend />
                        </RechartPie>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-slate-400">
                        لا توجد بيانات مراكز تكلفة
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      أكبر 10 حسابات حركة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.topAccounts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                        <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={150} />
                        <Tooltip
                          contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "white" }}
                          formatter={(value: number) => [formatNumber(value) + " ر.س", "المجموع"]}
                        />
                        <Bar dataKey="total" fill="#10b981" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={itemVariants} className="print:hidden">
          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="بحث بالوصف، رقم المستند، رمز الحساب..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pr-12 h-12 rounded-xl border-slate-200 focus:border-blue-500 text-right font-medium"
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`rounded-xl font-bold h-12 ${showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : ""}`}
                  >
                    <Filter className="w-4 h-4 ml-2" />
                    فلاتر متقدمة
                    {showFilters ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                  </Button>

                  <Select value={filters.entryType} onValueChange={(v) => setFilters(prev => ({ ...prev, entryType: v }))}>
                    <SelectTrigger className="w-40 h-12 rounded-xl font-bold">
                      <SelectValue placeholder="نوع الحركة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحركات</SelectItem>
                      <SelectItem value="debit">مدين فقط</SelectItem>
                      <SelectItem value="credit">دائن فقط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">من تاريخ</label>
                        <Input
                          type="date"
                          value={filters.fromDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">إلى تاريخ</label>
                        <Input
                          type="date"
                          value={filters.toDate}
                          onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">الحساب</label>
                        <Select value={filters.accountId} onValueChange={(v) => setFilters(prev => ({ ...prev, accountId: v }))}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="جميع الحسابات" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">جميع الحسابات</SelectItem>
                            {metadata.accounts.map((acc) => (
                              <SelectItem key={acc.id} value={String(acc.id)}>
                                {acc.account_code} - {acc.account_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2">مركز التكلفة</label>
                        <Select value={filters.costCenterId} onValueChange={(v) => setFilters(prev => ({ ...prev, costCenterId: v }))}>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="جميع المراكز" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">جميع المراكز</SelectItem>
                            {metadata.costCenters.map((cc) => (
                              <SelectItem key={cc.id} value={String(cc.id)}>
                                {cc.center_code} - {cc.center_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setFilters({ fromDate: "", toDate: "", accountId: "", costCenterId: "", search: "", entryType: "all" })}
                        className="rounded-xl font-bold"
                      >
                        <X className="w-4 h-4 ml-2" />
                        مسح الفلاتر
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl print:shadow-none print:rounded-none">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 print:bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  سجل الحركات المالية
                </CardTitle>
                <div className="flex items-center gap-3 print:hidden">
                  <span className="text-sm text-slate-500 font-medium">عرض:</span>
                  <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                    <SelectTrigger className="w-20 h-9 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                      {[
                        { key: "date", label: "التاريخ", icon: Calendar },
                        { key: "document_number", label: "رقم المستند", icon: Hash },
                        { key: "description", label: "الوصف", icon: FileText },
                        { key: "account_code", label: "الحساب", icon: Layers },
                        { key: "cost_center_code", label: "مركز التكلفة", icon: Building },
                        { key: "debit", label: "مدين", icon: ArrowUpRight },
                        { key: "credit", label: "دائن", icon: ArrowDownRight },
                        { key: "balance", label: "الرصيد", icon: Scale },
                        { key: "source_type", label: "المصدر", icon: FileType },
                      ].map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className="px-4 py-4 text-right text-xs font-bold cursor-pointer hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <col.icon className="w-4 h-4 opacity-70" />
                            {col.label}
                            {sortConfig.key === col.key && (
                              sortConfig.direction === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-4 text-center text-xs font-bold print:hidden">عرض</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedEntries.length > 0 ? (
                      paginatedEntries.map((entry, idx) => (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          className={`hover:bg-blue-50/50 transition-colors group ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                        >
                          <td className="px-4 py-3.5 text-sm font-medium text-slate-700">
                            {formatDate(entry.date)}
                          </td>
                          <td className="px-4 py-3.5 text-sm">
                            <Badge variant="outline" className="font-bold bg-slate-100 text-slate-700">
                              {entry.document_number}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[200px] truncate" title={entry.description}>
                            {entry.description}
                          </td>
                          <td className="px-4 py-3.5 text-sm">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{entry.account_code}</span>
                              <span className="text-xs text-slate-500 truncate max-w-[120px]">{entry.account_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm">
                            {entry.cost_center_code ? (
                              <Badge variant="secondary" className="font-medium bg-purple-100 text-purple-700">
                                {entry.cost_center_code}
                              </Badge>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-sm">
                            {entry.debit > 0 ? (
                              <span className="font-bold text-rose-600 tabular-nums">{formatNumber(entry.debit)}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-sm">
                            {entry.credit > 0 ? (
                              <span className="font-bold text-emerald-600 tabular-nums">{formatNumber(entry.credit)}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-sm">
                            <span className={`font-black tabular-nums ${entry.balance >= 0 ? "text-blue-600" : "text-rose-600"}`}>
                              {formatNumber(entry.balance)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-sm">
                            <Badge className={`font-bold ${entry.source === "expense" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                              {entry.source_type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-center print:hidden">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEntry(entry)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-4 py-16 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                              <FileText className="w-10 h-10 text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-bold text-lg">لا توجد حركات مطابقة للبحث</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gradient-to-r from-slate-100 to-blue-100 font-bold">
                      <td colSpan={5} className="px-4 py-4 text-sm text-slate-700">
                        الإجمالي
                      </td>
                      <td className="px-4 py-4 text-sm text-rose-600 font-black tabular-nums">
                        {formatNumber(stats.totalDebit)}
                      </td>
                      <td className="px-4 py-4 text-sm text-emerald-600 font-black tabular-nums">
                        {formatNumber(stats.totalCredit)}
                      </td>
                      <td className="px-4 py-4 text-sm text-blue-700 font-black tabular-nums">
                        {formatNumber(stats.finalBalance)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-100 print:hidden">
                  <div className="text-sm text-slate-500 font-medium">
                    عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, entries.length)} من {entries.length} حركة
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="rounded-lg font-bold"
                    >
                      الأول
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg font-bold"
                    >
                      السابق
                    </Button>
                    <span className="px-4 py-2 bg-blue-50 rounded-lg text-blue-700 font-bold text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg font-bold"
                    >
                      التالي
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="rounded-lg font-bold"
                    >
                      الأخير
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-2xl rounded-[2rem] p-0 overflow-hidden" dir="rtl">
            <DialogHeader className="p-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <DialogTitle className="text-xl font-bold flex items-center gap-3">
                <Eye className="w-6 h-6" />
                تفاصيل الحركة
              </DialogTitle>
            </DialogHeader>
            {selectedEntry && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium mb-1">رقم المستند</p>
                    <p className="font-bold text-slate-800">{selectedEntry.document_number}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500 font-medium mb-1">التاريخ</p>
                    <p className="font-bold text-slate-800">{formatDate(selectedEntry.date)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl col-span-2">
                    <p className="text-xs text-slate-500 font-medium mb-1">الوصف</p>
                    <p className="font-bold text-slate-800">{selectedEntry.description}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-600 font-medium mb-1">الحساب</p>
                    <p className="font-bold text-slate-800">{selectedEntry.account_code}</p>
                    <p className="text-sm text-slate-600">{selectedEntry.account_name}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-xs text-purple-600 font-medium mb-1">مركز التكلفة</p>
                    <p className="font-bold text-slate-800">{selectedEntry.cost_center_code || "-"}</p>
                    <p className="text-sm text-slate-600">{selectedEntry.cost_center_name || "-"}</p>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-xl">
                    <p className="text-xs text-rose-600 font-medium mb-1">مدين</p>
                    <p className="font-black text-2xl text-rose-600 tabular-nums">
                      {formatNumber(selectedEntry.debit)}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <p className="text-xs text-emerald-600 font-medium mb-1">دائن</p>
                    <p className="font-black text-2xl text-emerald-600 tabular-nums">
                      {formatNumber(selectedEntry.credit)}
                    </p>
                  </div>
                  {selectedEntry.employee_name && (
                    <div className="p-4 bg-amber-50 rounded-xl col-span-2">
                      <p className="text-xs text-amber-600 font-medium mb-1">الموظف</p>
                      <p className="font-bold text-slate-800">{selectedEntry.employee_name}</p>
                      {selectedEntry.employee_iqama && (
                        <p className="text-sm text-slate-600">رقم الإقامة: {selectedEntry.employee_iqama}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <Badge className={`font-bold ${selectedEntry.source === "expense" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {selectedEntry.source_type}
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedEntry(null)} className="rounded-xl font-bold">
                      إغلاق
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap');
        
        .font-tajawal {
          font-family: 'Tajawal', sans-serif;
        }

        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 3s ease infinite;
        }

        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:p-0 { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
