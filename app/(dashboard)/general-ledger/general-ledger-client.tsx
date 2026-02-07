"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Hash,
  Building,
  FileSpreadsheet,
    FileType,
    CheckCircle2,
    Eye,
  } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/locale-context";
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
  const { t, locale } = useLocale();
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

  const [sourceFilter, setSourceFilter] = useState("all");
  const [sourceTypeCounts, setSourceTypeCounts] = useState<Record<string, number>>({});
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

    const [error, setError] = useState<string | null>(null);

      const fetchData = useCallback(async (isRefresh = false) => {
        try {
          if (isRefresh) setRefreshing(true);
          else setLoading(true);
          setError(null);

          const params = new URLSearchParams();
          if (filters.fromDate) params.set("from_date", filters.fromDate);
          if (filters.toDate) params.set("to_date", filters.toDate);
          if (filters.accountId) params.set("account_id", filters.accountId);
          if (filters.costCenterId) params.set("cost_center_id", filters.costCenterId);
          if (filters.search) params.set("search", filters.search);
          if (filters.entryType !== "all") params.set("entry_type", filters.entryType);
          if (sourceFilter !== "all") params.set("source", sourceFilter);

          const response = await fetch(`/api/general-ledger?${params.toString()}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
          }
          const data = await response.json();

          if (data.error) {
            setError(data.error);
            return;
          }

          setEntries(data.entries || []);
          setStats(data.stats || {
            totalDebit: 0,
            totalCredit: 0,
            finalBalance: 0,
            entriesCount: 0,
            activeAccounts: 0,
          });
          setChartData(data.chartData || {
            monthlyTrend: [],
            topAccounts: [],
            costCenterDistribution: [],
          });
          setMetadata(data.metadata || { accounts: [], costCenters: [] });
          setSourceTypeCounts(data.sourceTypeCounts || {});
        } catch (error) {
          console.error("Error fetching ledger data:", error);
          setError(t("generalLedger.errorLoading"));
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      }, [filters, sourceFilter, t]);

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
      // Compute running balance
      let runningBalance = 0;
      const withBalance = sorted.map(e => {
        runningBalance += e.debit - e.credit;
        return { ...e, balance: runningBalance };
      });
      return withBalance;
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
    const headers = [
      t("generalLedger.date"),
      t("generalLedger.docNumber"),
      t("generalLedger.description"),
      t("accounts.accountCode"),
      t("accounts.accountName"),
      t("costCenters.centerCode"),
      t("generalLedger.debit"),
      t("generalLedger.credit"),
      t("generalLedger.balance")
    ];
    const csvContent = [
      headers.join(","),
      ...sortedEntries.map(e => [
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

  const formatNumber = (num: number) => new Intl.NumberFormat(locale === "ar" ? "en-US" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale === "ar" ?  'en-US'  : "en-US");

    if (loading) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
              <BookOpen className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-slate-600 font-bold text-lg">{t("generalLedger.loading")}</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-none shadow-2xl rounded-[2rem] bg-white p-8 text-center">
            <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{t("generalLedger.errorLoading")}</h2>
            <p className="text-slate-600 mb-8">{error}</p>
            <Button 
              onClick={() => fetchData()} 
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {t("profitLoss.retry")}
            </Button>
          </Card>
        </div>
      );
    }

  return (
    <div className="p-4 md:p-6" dir={locale === "ar" ? "rtl" : "ltr"}>
      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-[#1a2234] p-4 md:p-8 space-y-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-2xl border border-white/10 print:hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500" />
          
          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  {companyInfo.logo_path ? (
                    <img
                      src={companyInfo.logo_path}
                      alt="Logo"
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-white/20 object-cover shadow-2xl"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl">
                      <Building2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    {t("generalLedger.title")}
                  </h1>
                  <p className="text-white/60 font-medium mt-1 text-sm md:text-base">{companyInfo.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold text-xs">
                      <Activity className="w-3 h-3 ml-1" />
                      {t("common.active")}
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold text-xs">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      {entries.length} {t("common.records")}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Button
                  onClick={() => fetchData(true)}
                  variant="outline"
                  size="sm"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold rounded-xl"
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 ${locale === "ar" ? "ml-2" : "mr-2"} ${refreshing ? "animate-spin" : ""}`} />
                  {t("generalLedger.update")}
                </Button>
                <Button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  variant="outline"
                  size="sm"
                  className="bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30 font-bold rounded-xl"
                >
                  <BarChart3 className={`w-4 h-4 ${locale === "ar" ? "ml-2" : "mr-2"}`} />
                  {t("generalLedger.analytics")}
                </Button>
                <Button
                  onClick={handleExportExcel}
                  variant="outline"
                  size="sm"
                  className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 font-bold rounded-xl"
                >
                  <FileSpreadsheet className={`w-4 h-4 ${locale === "ar" ? "ml-2" : "mr-2"}`} />
                  {t("generalLedger.excel")}
                </Button>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="sm"
                  className="bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30 font-bold rounded-xl"
                >
                  <Printer className={`w-4 h-4 ${locale === "ar" ? "ml-2" : "mr-2"}`} />
                  {t("generalLedger.print")}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-6 md:mt-8">
              {[
                { label: t("generalLedger.totalDebit"), value: stats.totalDebit, icon: TrendingUp, color: "from-rose-500 to-red-600", iconBg: "bg-rose-500/20" },
                { label: t("generalLedger.totalCredit"), value: stats.totalCredit, icon: TrendingDown, color: "from-emerald-500 to-green-600", iconBg: "bg-emerald-500/20" },
                { label: t("generalLedger.finalBalance"), value: stats.finalBalance, icon: Scale, color: "from-blue-500 to-indigo-600", iconBg: "bg-blue-500/20" },
                { label: t("generalLedger.entriesCount"), value: stats.entriesCount, icon: Activity, color: "from-purple-500 to-violet-600", iconBg: "bg-purple-500/20", isCount: true },
                { label: t("generalLedger.activeAccounts"), value: stats.activeAccounts, icon: Layers, color: "from-amber-500 to-orange-600", iconBg: "bg-amber-500/20", isCount: true },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 md:p-4 group hover:bg-white/10 transition-all"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative z-10 flex flex-col items-center text-center gap-2">
                    <div className={`p-2 md:p-2.5 rounded-xl ${stat.iconBg}`}>
                      <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <span className="text-lg md:text-2xl font-black text-white tabular-nums">
                      {stat.isCount ? stat.value : formatNumber(stat.value)}
                    </span>
                    <span className="text-[10px] md:text-xs font-medium text-white/50">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
            <Card className="lg:col-span-2 border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  {t("generalLedger.monthlyTrend")}
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
                      formatter={(value: number) => [formatNumber(value) + " " + t("common.sar"), t("common.amount")]}
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
                  {t("generalLedger.costCenterDistribution")}
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
                        formatter={(value: number) => formatNumber(value) + " " + t("common.sar")}
                      />
                      <Legend />
                    </RechartPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-400">
                    {t("common.noData")}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  {t("generalLedger.topAccounts")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {chartData.topAccounts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.topAccounts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={150} />
                      <Tooltip
                        contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "white" }}
                        formatter={(value: number) => [formatNumber(value) + " " + t("common.sar"), t("common.total")]}
                      />
                      <Bar dataKey="total" fill="#10b981" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-400">
                    {t("common.noData")}
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
          )}

          {/* Source Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {[
              { key: "all", label: "الكل", color: "bg-slate-600", count: Object.values(sourceTypeCounts).reduce((s, v) => s + v, 0) || entries.length },
              { key: "journal", label: "قيود يومية", color: "bg-blue-600", count: sourceTypeCounts.journal || 0 },
              { key: "expense", label: "مصروفات", color: "bg-amber-600", count: sourceTypeCounts.expense || 0 },
              { key: "deduction", label: "استقطاعات", color: "bg-red-600", count: sourceTypeCounts.deduction || 0 },
              { key: "payroll", label: "رواتب", color: "bg-purple-600", count: sourceTypeCounts.payroll || 0 },
              { key: "invoice", label: "فواتير", color: "bg-emerald-600", count: sourceTypeCounts.invoice || 0 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setSourceFilter(tab.key); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  sourceFilter === tab.key
                    ? `${tab.color} text-white shadow-lg scale-105`
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  sourceFilter === tab.key ? "bg-white/20" : "bg-white/10"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl print:hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className={`absolute ${locale === "ar" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
                <Input
                  placeholder={t("generalLedger.searchPlaceholder")}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className={`${locale === "ar" ? "pr-12 text-right" : "pl-12 text-left"} h-12 rounded-xl border-slate-200 focus:border-blue-500 font-medium`}
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`rounded-xl font-bold h-12 ${showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : ""}`}
                >
                  <Filter className={`w-4 h-4 ${locale === "ar" ? "ml-2" : "mr-2"}`} />
                  {t("generalLedger.advancedFilters")}
                  {showFilters ? <ChevronUp className={`w-4 h-4 ${locale === "ar" ? "mr-2" : "ml-2"}`} /> : <ChevronDown className={`w-4 h-4 ${locale === "ar" ? "mr-2" : "ml-2"}`} />}
                </Button>

                <Select value={filters.entryType} onValueChange={(v) => setFilters(prev => ({ ...prev, entryType: v }))}>
                  <SelectTrigger className="w-40 h-12 rounded-xl font-bold">
                    <SelectValue placeholder={t("generalLedger.entryType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("generalLedger.allEntries")}</SelectItem>
                    <SelectItem value="debit">{t("generalLedger.debitOnly")}</SelectItem>
                    <SelectItem value="credit">{t("generalLedger.creditOnly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t("generalLedger.fromDate")}</label>
                  <Input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t("generalLedger.toDate")}</label>
                  <Input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t("generalLedger.account")}</label>
                  <Select value={filters.accountId} onValueChange={(v) => setFilters(prev => ({ ...prev, accountId: v }))}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder={t("generalLedger.allAccounts")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t("generalLedger.allAccounts")}</SelectItem>
                      {metadata.accounts.map((acc) => (
                        <SelectItem key={acc.id} value={String(acc.id)}>
                          {acc.account_code} - {acc.account_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t("generalLedger.costCenter")}</label>
                  <Select value={filters.costCenterId} onValueChange={(v) => setFilters(prev => ({ ...prev, costCenterId: v }))}>
                    <SelectTrigger className="h-11 rounded-xl">
                      <SelectValue placeholder={t("generalLedger.allCenters")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t("generalLedger.allCenters")}</SelectItem>
                      {metadata.costCenters.map((cc) => (
                        <SelectItem key={cc.id} value={String(cc.id)}>
                          {cc.center_code} - {cc.center_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ fromDate: "", toDate: "", accountId: "", costCenterId: "", search: "", entryType: "all" })}
                    className="rounded-xl font-bold"
                  >
                    <X className={`w-4 h-4 ${locale === "ar" ? "ml-2" : "mr-2"}`} />
                    {t("generalLedger.clearFilters")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl print:shadow-none print:rounded-none">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50 print:bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                {t("generalLedger.financialLog")}
              </CardTitle>
              <div className="flex items-center gap-3 print:hidden">
                <span className="text-sm text-slate-500 font-medium">{t("common.view")}:</span>
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
                      { key: "date", label: t("generalLedger.date"), icon: Calendar },
                      { key: "document_number", label: t("generalLedger.docNumber"), icon: Hash },
                      { key: "description", label: t("generalLedger.description"), icon: FileText },
                      { key: "account_code", label: t("generalLedger.account"), icon: Layers },
                      { key: "cost_center_code", label: t("generalLedger.costCenter"), icon: Building },
                      { key: "debit", label: t("generalLedger.debit"), icon: ArrowUpRight },
                      { key: "credit", label: t("generalLedger.credit"), icon: ArrowDownRight },
                      { key: "balance", label: t("generalLedger.balance"), icon: Scale },
                      { key: "source_type", label: t("generalLedger.source"), icon: FileType },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={`px-3 md:px-4 py-4 ${locale === "ar" ? "text-right" : "text-left"} text-xs font-bold cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap`}
                      >
                        <div className="flex items-center gap-1 md:gap-2">
                          <col.icon className="w-3 h-3 md:w-4 md:h-4 opacity-70" />
                          <span className="hidden md:inline">{col.label}</span>
                          <span className="md:hidden">{col.label.substring(0, 6)}</span>
                          {sortConfig.key === col.key && (
                            sortConfig.direction === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-3 md:px-4 py-4 text-center text-xs font-bold print:hidden">{t("generalLedger.view")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedEntries.length > 0 ? (
                    paginatedEntries.map((entry, idx) => (
                      <tr
                        key={entry.id}
                        className={`hover:bg-blue-50/50 transition-colors group ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                      >
                        <td className="px-3 md:px-4 py-3 text-xs md:text-sm font-medium text-slate-700 whitespace-nowrap">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-3 md:px-4 py-3 text-xs md:text-sm">
                          <Badge variant="outline" className="font-bold bg-slate-100 text-slate-700 text-xs">
                            {entry.document_number}
                          </Badge>
                        </td>
                        <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-slate-600 max-w-[150px] md:max-w-[200px] truncate" title={entry.description}>
                          {entry.description}
                        </td>
                        <td className="px-3 md:px-4 py-3 text-xs md:text-sm">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs">{entry.account_code || "-"}</span>
                            <span className="text-[10px] md:text-xs text-slate-500 truncate max-w-[100px] md:max-w-[120px]">{entry.account_name}</span>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3 text-xs md:text-sm">
                          {entry.cost_center_code ? (
                            <Badge variant="secondary" className="font-medium bg-purple-100 text-purple-700 text-xs">
                              {entry.cost_center_code}
                            </Badge>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-3 text-xs md:text-sm">
                          {entry.debit > 0 ? (
                            <span className="font-bold text-rose-600 tabular-nums">{formatNumber(entry.debit)}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-3 text-xs md:text-sm">
                          {entry.credit > 0 ? (
                            <span className="font-bold text-emerald-600 tabular-nums">{formatNumber(entry.credit)}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-3 text-xs md:text-sm">
                          <span className={`font-black tabular-nums ${entry.balance >= 0 ? "text-blue-600" : "text-rose-600"}`}>
                            {formatNumber(entry.balance)}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-3 text-xs md:text-sm">
                            <Badge className={`font-bold text-xs ${
                              entry.source === "expense" ? "bg-amber-100 text-amber-700" :
                              entry.source === "deduction" ? "bg-red-100 text-red-700" :
                              entry.source === "payroll" ? "bg-purple-100 text-purple-700" :
                              entry.source === "invoice" ? "bg-emerald-100 text-emerald-700" :
                              "bg-blue-100 text-blue-700"
                            }`}>
                              {entry.source_type}
                            </Badge>
                          </td>
                        <td className="px-3 md:px-4 py-3 text-center print:hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEntry(entry)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                            <FileText className="w-10 h-10 text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-bold text-lg">{t("generalLedger.noMatching")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-slate-100 to-blue-100 font-bold">
                    <td colSpan={5} className="px-3 md:px-4 py-4 text-xs md:text-sm text-slate-700">
                      {t("common.total")}
                    </td>
                    <td className="px-3 md:px-4 py-4 text-xs md:text-sm text-rose-600 font-black tabular-nums">
                      {formatNumber(stats.totalDebit)}
                    </td>
                    <td className="px-3 md:px-4 py-4 text-xs md:text-sm text-emerald-600 font-black tabular-nums">
                      {formatNumber(stats.totalCredit)}
                    </td>
                    <td className="px-3 md:px-4 py-4 text-xs md:text-sm text-blue-700 font-black tabular-nums">
                      {formatNumber(stats.finalBalance)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-slate-100 print:hidden gap-3">
                <div className="text-sm text-slate-500 font-medium">
                  {locale === "ar" ? (
                    <>عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, entries.length)} من {entries.length} حركة</>
                  ) : (
                    <>Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, entries.length)} of {entries.length} records</>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="rounded-lg font-bold"
                  >
                    {t("common.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg font-bold"
                  >
                    {t("common.previous")}
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
                    {t("common.next")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg font-bold"
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Card>
    </div>
  );
}
