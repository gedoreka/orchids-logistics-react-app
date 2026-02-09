"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Scale,
  Building2,
  TrendingUp,
  TrendingDown,
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
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  BookOpen,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Hash,
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartPie,
  Pie,
  Cell,
} from "recharts";

interface BalanceItem {
  account_id: number | null;
  account_code: string;
  account_name: string;
  account_type: string;
  total_debit: number;
  total_credit: number;
  closing_debit: number;
  closing_credit: number;
  entries_count: number;
  source_types: string[];
}

interface TrialBalanceClientProps {
  companyId: number;
  companyInfo: {
    name: string;
    logo_path: string | null;
  };
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export function TrialBalanceClient({ companyId, companyInfo }: TrialBalanceClientProps) {
  const { t, locale } = useLocale();

  const sourceLabel = useCallback((src: string): string => {
    const map: Record<string, string> = {
      journal: t("trialBalance.journals"),
      expense: t("trialBalance.expenses"),
      deduction: t("trialBalance.deductions"),
      payroll: t("trialBalance.payrolls"),
      invoice: t("trialBalance.invoices"),
    };
    return map[src] || src;
  }, [t]);

  const accountTypeLabel = useCallback((type: string): string => {
    const map: Record<string, string> = {
      // English raw values from MySQL sources
      expense: t("trialBalance.expenseType"),
      deduction: t("trialBalance.deductions"),
      payroll: t("trialBalance.payrolls"),
      revenue: t("trialBalance.revenue"),
      // Arabic raw values from Supabase accounts.type
      "اصل": t("trialBalance.assets"),
      "أصل": t("trialBalance.assets"),
      "التزام": t("trialBalance.liabilities"),
      "ايراد": t("trialBalance.revenue"),
      "إيراد": t("trialBalance.revenue"),
      "مصروف": t("trialBalance.expenseType"),
      "حقوق ملكية": t("trialBalance.equity"),
      // English alternatives
      asset: t("trialBalance.assets"),
      assets: t("trialBalance.assets"),
      liability: t("trialBalance.liabilities"),
      liabilities: t("trialBalance.liabilities"),
      equity: t("trialBalance.equity"),
    };
    return map[type] || type;
  }, [t]);

  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalDebit: 0,
    totalCredit: 0,
    totalClosingDebit: 0,
    totalClosingCredit: 0,
    difference: 0,
    isBalanced: false,
    accountsCount: 0,
    totalEntries: 0,
  });
  const [chartData, setChartData] = useState<{
    typeDistribution: any[];
    topAccounts: any[];
  }>({
    typeDistribution: [],
    topAccounts: [],
  });
  const [metadata, setMetadata] = useState<{
    accounts: any[];
    costCenters: any[];
  }>({ accounts: [], costCenters: [] });

  const [sourceFilter, setSourceFilter] = useState("all");
  const [sourceTypeCounts, setSourceTypeCounts] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    search: "",
    accountType: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<BalanceItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "account_code",
    direction: "asc",
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.fromDate) params.set("from_date", filters.fromDate);
      if (filters.toDate) params.set("to_date", filters.toDate);
      if (filters.search) params.set("search", filters.search);
      if (filters.accountType !== "all") params.set("account_type", filters.accountType);
      if (sourceFilter !== "all") params.set("source", sourceFilter);

      const response = await fetch(`/api/trial-balance?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setBalances(data.balances || []);
      setStats(data.stats || {
        totalDebit: 0, totalCredit: 0, totalClosingDebit: 0, totalClosingCredit: 0,
        difference: 0, isBalanced: false, accountsCount: 0, totalEntries: 0,
      });
      setChartData(data.chartData || { typeDistribution: [], topAccounts: [] });
      setMetadata(data.metadata || { accounts: [], costCenters: [] });
      setSourceTypeCounts(data.sourceTypeCounts || {});
    } catch (error) {
      console.error("Error fetching trial balance data:", error);
      setError(t("trialBalance.errorLoading"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, sourceFilter, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const sortedBalances = useMemo(() => {
    return [...balances].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof BalanceItem];
      const bValue = b[sortConfig.key as keyof BalanceItem];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue || "");
      const bStr = String(bValue || "");
      return sortConfig.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [balances, sortConfig]);

  const paginatedBalances = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedBalances.slice(start, start + pageSize);
  }, [sortedBalances, currentPage, pageSize]);

  const totalPages = Math.ceil(balances.length / pageSize);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const handleExportExcel = () => {
    const headers = [
      t("trialBalance.accountCode"),
      t("trialBalance.accountName"),
      t("trialBalance.accountType"),
      t("trialBalance.debit"),
      t("trialBalance.credit"),
      t("trialBalance.closingDebit"),
      t("trialBalance.closingCredit"),
      t("trialBalance.entriesCount"),
    ];
    const csvContent = [
      headers.join(","),
        ...sortedBalances.map(b => [
          b.account_code,
          `"${b.account_name}"`,
          `"${accountTypeLabel(b.account_type)}"`,
        b.total_debit.toFixed(2),
        b.total_credit.toFixed(2),
        b.closing_debit.toFixed(2),
        b.closing_credit.toFixed(2),
        b.entries_count,
      ].join(",")),
      ["", t("trialBalance.total"), "",
        stats.totalDebit.toFixed(2), stats.totalCredit.toFixed(2),
        stats.totalClosingDebit.toFixed(2), stats.totalClosingCredit.toFixed(2), stats.totalEntries
      ].join(","),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trial_balance_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const handlePrint = () => window.print();

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
            <Scale className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 font-bold text-lg">{t("trialBalance.loading")}</p>
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
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{t("trialBalance.errorLoading")}</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <Button
            onClick={() => fetchData()}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
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
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-2xl border border-white/10 print:hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          </div>

          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500" />

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
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl">
                      <Building2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Scale className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                    {t("trialBalance.title")}
                  </h1>
                  <p className="text-white/60 font-medium mt-1 text-sm md:text-base">{companyInfo.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {stats.isBalanced ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold text-xs">
                        <CheckCircle2 className={`w-3 h-3 ${locale === "ar" ? "ml-1" : "mr-1"}`} />
                        {t("trialBalance.balanced")}
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold text-xs">
                        <AlertTriangle className={`w-3 h-3 ${locale === "ar" ? "ml-1" : "mr-1"}`} />
                        {t("trialBalance.unbalanced")}
                      </Badge>
                    )}
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold text-xs">
                      <Layers className={`w-3 h-3 ${locale === "ar" ? "ml-1" : "mr-1"}`} />
                      {stats.accountsCount} {t("trialBalance.accountsCount")}
                    </Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold text-xs">
                      <CheckCircle2 className={`w-3 h-3 ${locale === "ar" ? "ml-1" : "mr-1"}`} />
                      {stats.totalEntries} {t("trialBalance.totalEntries")}
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

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-6 md:mt-8">
              {[
                { label: t("trialBalance.totalDebit"), value: stats.totalDebit, icon: TrendingUp, color: "from-rose-500 to-red-600", iconBg: "bg-rose-500/20", textColor: "text-rose-300" },
                { label: t("trialBalance.totalCredit"), value: stats.totalCredit, icon: TrendingDown, color: "from-emerald-500 to-green-600", iconBg: "bg-emerald-500/20", textColor: "text-emerald-300" },
                { label: t("trialBalance.closingDebit"), value: stats.totalClosingDebit, icon: ArrowUpRight, color: "from-amber-500 to-orange-600", iconBg: "bg-amber-500/20", textColor: "text-amber-300" },
                { label: t("trialBalance.closingCredit"), value: stats.totalClosingCredit, icon: ArrowDownRight, color: "from-blue-500 to-indigo-600", iconBg: "bg-blue-500/20", textColor: "text-blue-300" },
                { label: t("trialBalance.difference"), value: Math.abs(stats.difference), icon: Scale, color: "from-purple-500 to-violet-600", iconBg: "bg-purple-500/20", textColor: stats.isBalanced ? "text-emerald-300" : "text-rose-300" },
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
                    <span className={`text-lg md:text-2xl font-black tabular-nums ${stat.textColor}`}>
                      {formatNumber(stat.value)}
                    </span>
                    <span className="text-[10px] md:text-xs font-medium text-white/50">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Balance Status */}
            <div className={`mt-6 p-4 rounded-2xl text-center ${stats.isBalanced ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-rose-500/20 border border-rose-500/30"}`}>
              {stats.isBalanced ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-300">{t("trialBalance.isBalancedDesc")}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                  <span className="text-lg font-bold text-rose-300">
                    {t("trialBalance.isUnbalancedDesc")} - {t("trialBalance.difference")}: {formatNumber(stats.difference)} {t("common.sar")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        {showAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  {t("trialBalance.typeDistribution")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {chartData.typeDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.typeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="type" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                      <Tooltip
                        contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "white" }}
                        formatter={(value: number) => formatNumber(value) + " " + t("common.sar")}
                      />
                      <Legend />
                      <Bar dataKey="debit" name={t("trialBalance.debit")} fill="#ef4444" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="credit" name={t("trialBalance.credit")} fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-slate-400">
                    {t("common.noData")}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  {t("trialBalance.topAccounts")}
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
            { key: "all", label: t("trialBalance.allSources"), color: "bg-slate-600", count: Object.values(sourceTypeCounts).reduce((s, v) => s + v, 0) || stats.totalEntries },
            { key: "journal", label: t("trialBalance.journals"), color: "bg-blue-600", count: sourceTypeCounts.journal || 0 },
            { key: "expense", label: t("trialBalance.expenses"), color: "bg-amber-600", count: sourceTypeCounts.expense || 0 },
            { key: "deduction", label: t("trialBalance.deductions"), color: "bg-red-600", count: sourceTypeCounts.deduction || 0 },
            { key: "payroll", label: t("trialBalance.payrolls"), color: "bg-purple-600", count: sourceTypeCounts.payroll || 0 },
            { key: "invoice", label: t("trialBalance.invoices"), color: "bg-emerald-600", count: sourceTypeCounts.invoice || 0 },
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

        {/* Search & Filters */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl print:hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className={`absolute ${locale === "ar" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
                <Input
                  placeholder={t("trialBalance.searchPlaceholder")}
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className={`${locale === "ar" ? "pr-12 text-right" : "pl-12 text-left"} h-12 rounded-xl border-slate-200 focus:border-emerald-500 font-medium text-slate-900 placeholder:text-slate-400`}
                />
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`rounded-xl font-bold h-12 ${showFilters ? "bg-emerald-50 border-emerald-300 text-emerald-700" : ""}`}
                >
                  <Filter className={`w-4 h-4 ${locale === "ar" ? "ml-2" : "mr-2"}`} />
                  {t("generalLedger.advancedFilters")}
                  {showFilters ? <ChevronUp className={`w-4 h-4 ${locale === "ar" ? "mr-2" : "ml-2"}`} /> : <ChevronDown className={`w-4 h-4 ${locale === "ar" ? "mr-2" : "ml-2"}`} />}
                </Button>

                <Select value={filters.accountType} onValueChange={(v) => setFilters(prev => ({ ...prev, accountType: v }))}>
                  <SelectTrigger className="w-44 h-12 rounded-xl font-bold">
                    <SelectValue placeholder={t("trialBalance.accountType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("trialBalance.allTypes")}</SelectItem>
                    <SelectItem value="اصل">{t("trialBalance.assets")}</SelectItem>
                    <SelectItem value="التزام">{t("trialBalance.liabilities")}</SelectItem>
                    <SelectItem value="ايراد">{t("trialBalance.revenue")}</SelectItem>
                    <SelectItem value="مصروف">{t("trialBalance.expenseType")}</SelectItem>
                    <SelectItem value="حقوق ملكية">{t("trialBalance.equity")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
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
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ fromDate: "", toDate: "", search: "", accountType: "all" })}
                    className="rounded-xl font-bold w-full h-11"
                  >
                    <X className={`w-4 h-4 ${locale === "ar" ? "ml-2" : "mr-2"}`} />
                    {t("generalLedger.clearFilters")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl print:shadow-none print:rounded-none">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-emerald-50 print:bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                {t("trialBalance.tableTitle")}
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
                      { key: "account_code", label: t("trialBalance.accountCode"), icon: Hash },
                      { key: "account_name", label: t("trialBalance.accountName"), icon: BookOpen },
                      { key: "account_type", label: t("trialBalance.accountType"), icon: Layers },
                      { key: "total_debit", label: t("trialBalance.debit"), icon: ArrowUpRight },
                      { key: "total_credit", label: t("trialBalance.credit"), icon: ArrowDownRight },
                      { key: "closing_debit", label: t("trialBalance.closingDebit"), icon: TrendingUp },
                      { key: "closing_credit", label: t("trialBalance.closingCredit"), icon: TrendingDown },
                      { key: "entries_count", label: t("trialBalance.entriesCount"), icon: Activity },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={`px-3 md:px-4 py-4 ${locale === "ar" ? "text-right" : "text-left"} text-xs font-bold cursor-pointer hover:bg-white/10 transition-colors whitespace-nowrap`}
                      >
                        <div className="flex items-center gap-1 md:gap-2">
                          <col.icon className="w-3 h-3 md:w-4 md:h-4 opacity-70" />
                          <span className="hidden md:inline">{col.label}</span>
                          <span className="md:hidden">{col.label.substring(0, 8)}</span>
                          {sortConfig.key === col.key && (
                            sortConfig.direction === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-3 md:px-4 py-4 text-center text-xs font-bold print:hidden">{t("trialBalance.details")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedBalances.length > 0 ? (
                    paginatedBalances.map((balance, idx) => (
                      <tr
                        key={balance.account_code}
                        className={`hover:bg-emerald-50/50 transition-colors group ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                      >
                        <td className="px-3 md:px-4 py-3.5 text-xs md:text-sm">
                          <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">
                            {balance.account_code}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-3.5 text-xs md:text-sm text-slate-700 font-medium max-w-[180px] truncate" title={balance.account_name}>
                          {balance.account_name}
                        </td>
                        <td className="px-3 md:px-4 py-3.5 text-xs md:text-sm">
            <Badge variant="outline" className="font-bold text-xs bg-purple-50 text-purple-700 border-purple-200">
                              {accountTypeLabel(balance.account_type)}
                            </Badge>
                        </td>
                        <td className="px-3 md:px-4 py-3.5 text-xs md:text-sm">
                          {balance.total_debit > 0 ? (
                            <span className="font-bold text-rose-600 tabular-nums">{formatNumber(balance.total_debit)}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-3.5 text-xs md:text-sm">
                          {balance.total_credit > 0 ? (
                            <span className="font-bold text-emerald-600 tabular-nums">{formatNumber(balance.total_credit)}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-3.5 text-xs md:text-sm">
                          {balance.closing_debit > 0 ? (
                            <span className="font-black text-rose-700 tabular-nums bg-rose-50 px-2 py-0.5 rounded-lg">{formatNumber(balance.closing_debit)}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-3.5 text-xs md:text-sm">
                          {balance.closing_credit > 0 ? (
                            <span className="font-black text-emerald-700 tabular-nums bg-emerald-50 px-2 py-0.5 rounded-lg">{formatNumber(balance.closing_credit)}</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-3 md:px-4 py-3.5 text-xs md:text-sm text-center">
                          <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{balance.entries_count}</span>
                        </td>
                        <td className="px-3 md:px-4 py-3.5 text-center print:hidden">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBalance(balance)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                          >
                            <Eye className="w-4 h-4 text-emerald-600" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                            <Scale className="w-10 h-10 text-slate-300" />
                          </div>
                          <p className="text-slate-400 font-bold text-lg">{t("trialBalance.noMatching")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-slate-100 to-emerald-100 font-bold">
                    <td colSpan={3} className="px-3 md:px-4 py-4 text-xs md:text-sm text-slate-700">
                      {t("trialBalance.total")}
                    </td>
                    <td className="px-3 md:px-4 py-4 text-xs md:text-sm text-rose-600 font-black tabular-nums">
                      {formatNumber(stats.totalDebit)}
                    </td>
                    <td className="px-3 md:px-4 py-4 text-xs md:text-sm text-emerald-600 font-black tabular-nums">
                      {formatNumber(stats.totalCredit)}
                    </td>
                    <td className="px-3 md:px-4 py-4 text-xs md:text-sm text-rose-700 font-black tabular-nums">
                      {formatNumber(stats.totalClosingDebit)}
                    </td>
                    <td className="px-3 md:px-4 py-4 text-xs md:text-sm text-emerald-700 font-black tabular-nums">
                      {formatNumber(stats.totalClosingCredit)}
                    </td>
                    <td className="px-3 md:px-4 py-4 text-xs md:text-sm text-blue-700 font-black tabular-nums text-center">
                      {stats.totalEntries}
                    </td>
                    <td className="print:hidden"></td>
                  </tr>
                  <tr className={`font-bold ${stats.isBalanced ? "bg-emerald-50" : "bg-rose-50"}`}>
                    <td colSpan={5} className="px-3 md:px-4 py-3 text-xs md:text-sm text-slate-700">
                      {t("trialBalance.diffLabel")}
                    </td>
                    <td colSpan={3} className={`px-3 md:px-4 py-3 text-xs md:text-sm font-black tabular-nums text-center ${stats.isBalanced ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatNumber(stats.difference)} {t("common.sar")}
                      {stats.isBalanced && <CheckCircle2 className="w-4 h-4 inline-block mx-2" />}
                      {!stats.isBalanced && <AlertTriangle className="w-4 h-4 inline-block mx-2" />}
                    </td>
                    <td className="print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between p-4 border-t border-slate-100 print:hidden gap-3">
                <div className="text-sm text-slate-500 font-medium">
                  {locale === "ar" ? (
                    <>عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, balances.length)} من {balances.length} حساب</>
                  ) : (
                    <>Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, balances.length)} of {balances.length} accounts</>
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
                    {locale === "ar" ? "الأول" : "First"}
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
                  <span className="px-4 py-2 bg-emerald-50 rounded-lg text-emerald-700 font-bold text-sm">
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
                    {locale === "ar" ? "الأخير" : "Last"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedBalance} onOpenChange={(open) => !open && setSelectedBalance(null)}>
        <DialogContent className="max-w-lg p-0 border-none rounded-[2rem] overflow-hidden shadow-2xl bg-white">
          {selectedBalance && (() => {
            const DetailIcon = ({ icon: Icon, color }: { icon: any; color: string }) => (
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            );

            const netBalance = selectedBalance.closing_debit - selectedBalance.closing_credit;

            return (
              <>
                {/* Header */}
                <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-6 pb-8">
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
                  </div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-500" />
                  <div className="relative z-10">
                    <DialogTitle className="text-xl font-black text-white mb-1">
                      {t("trialBalance.accountDetails")}
                    </DialogTitle>
                    <p className="text-white/50 text-sm font-medium">{selectedBalance.account_code} - {selectedBalance.account_name}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold text-xs">
                          {accountTypeLabel(selectedBalance.account_type)}
                        </Badge>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs font-bold">
                        {selectedBalance.entries_count} {t("trialBalance.entriesCount")}
                      </Badge>
                      {selectedBalance.source_types.map(src => (
                        <Badge key={src} className="bg-white/10 text-white/70 border-white/20 text-xs font-bold">
                          {sourceLabel(src)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Debit / Credit cards */}
                <div className="px-6 -mt-4 relative z-10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 rounded-2xl p-4 text-center">
                      <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <ArrowUpRight className="w-5 h-5 text-rose-600" />
                      </div>
                      <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">{t("trialBalance.debit")}</p>
                      <p className="text-xl font-black text-rose-600 tabular-nums mt-1">{formatNumber(selectedBalance.total_debit)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 text-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">{t("trialBalance.credit")}</p>
                      <p className="text-xl font-black text-emerald-600 tabular-nums mt-1">{formatNumber(selectedBalance.total_credit)}</p>
                    </div>
                  </div>
                </div>

                {/* Detail rows */}
                <div className="px-6 py-5 space-y-0">
                  <div className="flex items-start gap-3 py-3 border-b border-slate-100">
                    <DetailIcon icon={Layers} color="text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("trialBalance.accountType")}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{accountTypeLabel(selectedBalance.account_type)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-3 border-b border-slate-100">
                    <DetailIcon icon={Activity} color="text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("trialBalance.entriesCount")}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedBalance.entries_count}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-3 border-b border-slate-100">
                    <DetailIcon icon={FileText} color="text-amber-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t("trialBalance.sources")}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedBalance.source_types.map(src => (
                          <Badge key={src} variant="outline" className="text-xs font-bold">
                            {sourceLabel(src)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Closing balance cards */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-3 text-center">
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">{t("trialBalance.closingDebit")}</p>
                      <p className="text-lg font-black text-rose-700 tabular-nums mt-1">{formatNumber(selectedBalance.closing_debit)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3 text-center">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t("trialBalance.closingCredit")}</p>
                      <p className="text-lg font-black text-emerald-700 tabular-nums mt-1">{formatNumber(selectedBalance.closing_credit)}</p>
                    </div>
                  </div>

                  {/* Net balance bar */}
                  <div className={`mt-4 border rounded-2xl p-4 flex items-center justify-between ${
                    netBalance >= 0
                      ? "bg-gradient-to-r from-rose-50 to-red-50 border-rose-200"
                      : "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${netBalance >= 0 ? "bg-rose-100" : "bg-emerald-100"}`}>
                        <Scale className={`w-5 h-5 ${netBalance >= 0 ? "text-rose-600" : "text-emerald-600"}`} />
                      </div>
                      <span className={`text-sm font-bold ${netBalance >= 0 ? "text-rose-700" : "text-emerald-700"}`}>
                        {netBalance >= 0 ? t("trialBalance.debitBalance") : t("trialBalance.creditBalance")}
                      </span>
                    </div>
                    <span className={`text-xl font-black tabular-nums ${netBalance >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                      {formatNumber(Math.abs(netBalance))} <span className="text-xs font-bold text-slate-400">{t("common.sar")}</span>
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
