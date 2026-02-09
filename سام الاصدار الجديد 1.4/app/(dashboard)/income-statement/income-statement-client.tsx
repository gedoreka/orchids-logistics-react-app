"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Search,
  Filter,
  Calendar,
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  BarChart3,
  AlertTriangle,
  FileSpreadsheet,
  DollarSign,
  CreditCard,
  Trophy,
  Eye,
  Percent,
  Hash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/locale-context";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";

interface IncomeItem {
  account_id: number | null;
  account_code: string;
  account_name: string;
  account_type: string;
  net_amount: number;
  debit_total: number;
  credit_total: number;
  entries_count: number;
  source_types: string[];
  by_center: Record<string, { name: string; amount: number }>;
}

interface IncomeStatementClientProps {
  companyId: number;
  companyInfo: {
    name: string;
    logo_path: string | null;
  };
}

const SOURCE_KEYS = ["all", "journal", "expense", "deduction", "payroll", "invoice"] as const;

export function IncomeStatementClient({ companyId, companyInfo }: IncomeStatementClientProps) {
  const { t, locale } = useLocale();
  const isRTL = locale === "ar";

  const sourceLabel = (src: string) => {
    const labels: Record<string, Record<string, string>> = {
      all: { ar: "الكل", en: "All" },
      journal: { ar: "قيود يومية", en: "Journal" },
      expense: { ar: "مصروفات", en: "Expenses" },
      deduction: { ar: "استقطاعات", en: "Deductions" },
      payroll: { ar: "رواتب", en: "Payrolls" },
      invoice: { ar: "فواتير", en: "Invoices" },
    };
    return labels[src]?.[locale] || src;
  };

  const [revenues, setRevenues] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<IncomeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    isProfit: true,
    profitMargin: 0,
    revenueAccountsCount: 0,
    expenseAccountsCount: 0,
    totalEntries: 0,
  });
  const [chartData, setChartData] = useState<{
    monthlyTrend: any[];
    topRevenues: any[];
    topExpenses: any[];
  }>({ monthlyTrend: [], topRevenues: [], topExpenses: [] });
  const [sourceTypeCounts, setSourceTypeCounts] = useState<Record<string, number>>({});
  const [period, setPeriod] = useState({
    fromDate: new Date().getFullYear() + "-01-01",
    toDate: new Date().toISOString().split("T")[0],
  });

    const [filters, setFilters] = useState({
      fromDate: new Date().getFullYear() + "-01-01",
      toDate: new Date().toISOString().split("T")[0],
      source: "all",
    });
    const [searchText, setSearchText] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [showCharts, setShowCharts] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ item: IncomeItem; type: "revenue" | "expense" } | null>(null);

    // Pagination
    const [revPage, setRevPage] = useState(1);
    const [expPage, setExpPage] = useState(1);
    const PAGE_SIZE = 15;

    const fetchData = useCallback(async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const params = new URLSearchParams();
        params.set("from_date", filters.fromDate);
        params.set("to_date", filters.toDate);
        if (filters.source !== "all") params.set("source", filters.source);

        const response = await fetch(`/api/income-statement?${params.toString()}`);
        const data = await response.json();

        if (data.error) {
          console.error(data.error);
          return;
        }

        setRevenues(data.revenues || []);
        setExpenses(data.expenses || []);
        setStats(data.stats || {});
        setChartData(data.chartData || { monthlyTrend: [], topRevenues: [], topExpenses: [] });
        setSourceTypeCounts(data.sourceTypeCounts || {});
        setPeriod(data.period || {});
        setRevPage(1);
        setExpPage(1);
      } catch (error) {
        console.error("Error fetching income statement data:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportCSV = () => {
    const headers = [
      t("incomeStatement.accountCode"),
      t("incomeStatement.accountName"),
      t("incomeStatement.amount"),
      t("incomeStatement.entriesCount"),
      t("incomeStatement.sources"),
    ];
    const csvRows = [headers.join(",")];

    csvRows.push(`--- ${t("incomeStatement.revenues")} ---,,,,`);
    revenues.forEach(r => {
      csvRows.push([r.account_code, `"${r.account_name}"`, r.net_amount.toFixed(2), r.entries_count, `"${r.source_types.map(s => sourceLabel(s)).join(", ")}"`].join(","));
    });
    csvRows.push([t("incomeStatement.totalRevenue"), "", stats.totalRevenue.toFixed(2), "", ""].join(","));

    csvRows.push(`--- ${t("incomeStatement.expenses")} ---,,,,`);
    expenses.forEach(e => {
      csvRows.push([e.account_code, `"${e.account_name}"`, e.net_amount.toFixed(2), e.entries_count, `"${e.source_types.map(s => sourceLabel(s)).join(", ")}"`].join(","));
    });
    csvRows.push([t("incomeStatement.totalExpenses"), "", stats.totalExpenses.toFixed(2), "", ""].join(","));

    csvRows.push([t("incomeStatement.netIncome"), "", stats.netIncome.toFixed(2), "", ""].join(","));

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `income_statement_${filters.fromDate}_${filters.toDate}.csv`;
    a.click();
  };

  const handlePrint = () => window.print();

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale === "ar" ? "en-US" : "en-US");

  const paginate = (list: IncomeItem[], page: number) => {
    const start = (page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  };

  const totalPages = (list: IncomeItem[]) => Math.ceil(list.length / PAGE_SIZE);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
            <TrendingUp className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 font-bold text-lg">{t("incomeStatement.loading")}</p>
        </div>
      </div>
    );
  }

    // Client-side search filtering
    const searchLower = searchText.toLowerCase();
    const filteredRevenues = searchText
      ? revenues.filter(r => r.account_code.toLowerCase().includes(searchLower) || r.account_name.toLowerCase().includes(searchLower))
      : revenues;
    const filteredExpenses = searchText
      ? expenses.filter(e => e.account_code.toLowerCase().includes(searchLower) || e.account_name.toLowerCase().includes(searchLower))
      : expenses;

    const revPagedData = paginate(filteredRevenues, revPage);
    const expPagedData = paginate(filteredExpenses, expPage);
    const revTotalPages = totalPages(filteredRevenues);
    const expTotalPages = totalPages(filteredExpenses);

  return (
    <div className="p-4 md:p-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-[#1a2234] p-4 md:p-8 space-y-8">

        {/* ===== HEADER ===== */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-2xl border border-white/10 print:hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500" />

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  {companyInfo.logo_path ? (
                    <img src={companyInfo.logo_path} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-white/20 object-cover shadow-2xl" />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-2xl">
                      <Building2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                    {t("incomeStatement.title")}
                  </h1>
                  <p className="text-white/60 font-medium mt-1 text-sm md:text-base">{companyInfo.name}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold text-xs">
                      <Calendar className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
                      {formatDate(period.fromDate)} - {formatDate(period.toDate)}
                    </Badge>
                    {stats.isProfit ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold text-xs animate-pulse">
                        <TrendingUp className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
                        {t("incomeStatement.profit")}
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold text-xs animate-pulse">
                        <TrendingDown className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
                        {t("incomeStatement.loss")}
                      </Badge>
                    )}
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold text-xs">
                      <Hash className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
                      {stats.totalEntries} {t("incomeStatement.entries")}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <button onClick={() => setShowCharts(!showCharts)} className={`flex items-center gap-2 px-4 py-2 border font-bold rounded-xl transition-all ${showCharts ? "bg-blue-500/30 border-blue-400/50 text-blue-300" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
                  <BarChart3 className="w-4 h-4" />
                  {t("incomeStatement.charts")}
                </button>
                <button onClick={() => fetchData(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white hover:bg-white/20 font-bold rounded-xl transition-all disabled:opacity-50" disabled={refreshing}>
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  {t("common.update")}
                </button>
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 font-bold rounded-xl transition-all">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 font-bold rounded-xl transition-all">
                  <Printer className="w-4 h-4" />
                  {t("common.print")}
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 md:mt-8">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-xl border border-emerald-500/20 p-4 group hover:bg-emerald-500/30 transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <p className="text-emerald-300/70 text-xs font-medium mb-1">{t("incomeStatement.totalRevenue")}</p>
                <p className="text-xl md:text-2xl font-black text-emerald-300 tabular-nums">{formatNumber(stats.totalRevenue)}</p>
                <p className="text-emerald-300/50 text-xs mt-1">{stats.revenueAccountsCount} {t("incomeStatement.accounts")}</p>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 backdrop-blur-xl border border-rose-500/20 p-4 group hover:bg-rose-500/30 transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600" />
                <p className="text-rose-300/70 text-xs font-medium mb-1">{t("incomeStatement.totalExpenses")}</p>
                <p className="text-xl md:text-2xl font-black text-rose-300 tabular-nums">{formatNumber(stats.totalExpenses)}</p>
                <p className="text-rose-300/50 text-xs mt-1">{stats.expenseAccountsCount} {t("incomeStatement.accounts")}</p>
              </div>

              <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border p-4 group transition-all ${stats.isProfit ? "bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/20 hover:bg-amber-500/30" : "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/20 hover:bg-red-500/30"}`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stats.isProfit ? "from-amber-400 to-amber-600" : "from-red-400 to-red-600"}`} />
                <p className={`text-xs font-medium mb-1 ${stats.isProfit ? "text-amber-300/70" : "text-red-300/70"}`}>{t("incomeStatement.netIncome")}</p>
                <p className={`text-xl md:text-2xl font-black tabular-nums ${stats.isProfit ? "text-amber-300" : "text-red-300"}`}>{formatNumber(Math.abs(stats.netIncome))}</p>
                <p className={`text-xs mt-1 ${stats.isProfit ? "text-amber-300/50" : "text-red-300/50"}`}>{stats.isProfit ? t("incomeStatement.isProfit") : t("incomeStatement.isLoss")}</p>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-xl border border-purple-500/20 p-4 group hover:bg-purple-500/30 transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
                <p className="text-purple-300/70 text-xs font-medium mb-1">{t("incomeStatement.profitMargin")}</p>
                <p className="text-xl md:text-2xl font-black text-purple-300 tabular-nums">{stats.profitMargin.toFixed(1)}%</p>
                <p className="text-purple-300/50 text-xs mt-1"><Percent className="w-3 h-3 inline" /> {t("incomeStatement.margin")}</p>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 backdrop-blur-xl border border-cyan-500/20 p-4 group hover:bg-cyan-500/30 transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-cyan-600" />
                <p className="text-cyan-300/70 text-xs font-medium mb-1">{t("incomeStatement.totalEntries")}</p>
                <p className="text-xl md:text-2xl font-black text-cyan-300 tabular-nums">{stats.totalEntries}</p>
                <p className="text-cyan-300/50 text-xs mt-1">{t("incomeStatement.fromAllSources")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== SOURCE TABS ===== */}
        <div className="flex flex-wrap gap-2 print:hidden">
          {SOURCE_KEYS.map((src) => {
            const count = src === "all"
              ? Object.values(sourceTypeCounts).reduce((s, c) => s + c, 0)
              : sourceTypeCounts[src] || 0;
            const isActive = filters.source === src;
            return (
              <button
                key={src}
                onClick={() => setFilters(prev => ({ ...prev, source: src }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all border ${isActive ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"}`}
              >
                {sourceLabel(src)}
                <span className={`px-2 py-0.5 rounded-lg text-xs ${isActive ? "bg-white/20" : "bg-white/10"}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ===== FILTERS ===== */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl print:hidden">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 ${isRTL ? "right-3" : "left-3"}`} />
                  <Input
                    placeholder={t("incomeStatement.searchPlaceholder")}
                    value={searchText}
                    onChange={(e) => { setSearchText(e.target.value); setRevPage(1); setExpPage(1); }}
                    className={`h-12 rounded-xl font-bold text-slate-800 ${isRTL ? "pr-10" : "pl-10"}`}
                  />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={`rounded-xl font-bold h-12 ${showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : ""}`}>
                <Filter className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("incomeStatement.period")}
                {showFilters ? <ChevronUp className={`w-4 h-4 ${isRTL ? "mr-2" : "ml-2"}`} /> : <ChevronDown className={`w-4 h-4 ${isRTL ? "mr-2" : "ml-2"}`} />}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t("generalLedger.fromDate")}</label>
                    <Input type="date" value={filters.fromDate} onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))} className="h-11 rounded-xl text-slate-800 border-slate-300" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t("generalLedger.toDate")}</label>
                    <Input type="date" value={filters.toDate} onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))} className="h-11 rounded-xl text-slate-800 border-slate-300" />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={() => fetchData()} className="rounded-xl font-bold h-11 bg-blue-600 hover:bg-blue-700">
                    <Search className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("incomeStatement.applyFilter")}
                  </Button>
                    <Button variant="outline" onClick={() => { setFilters({ fromDate: new Date().getFullYear() + "-01-01", toDate: new Date().toISOString().split("T")[0], source: "all" }); setSearchText(""); }} className="rounded-xl font-bold h-11">
                    <X className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("incomeStatement.reset")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== CHARTS ===== */}
        {showCharts && chartData.monthlyTrend.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  {t("incomeStatement.monthlyTrend")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "white" }} formatter={(value: number) => formatNumber(value) + " " + t("common.sar")} />
                    <Legend />
                    <Bar dataKey="revenue" name={t("incomeStatement.revenues")} fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="expenses" name={t("incomeStatement.expenses")} fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  {t("incomeStatement.topAccounts")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[...chartData.topRevenues.map(r => ({ ...r, type: "revenue" })), ...chartData.topExpenses.map(e => ({ ...e, type: "expense" }))].slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <YAxis dataKey="name" type="category" width={120} stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "white" }} formatter={(value: number) => formatNumber(value) + " " + t("common.sar")} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== REVENUES TABLE ===== */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl print:shadow-none print:rounded-none">
          <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 print:bg-emerald-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                {t("incomeStatement.revenues")}
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">{filteredRevenues.length}</Badge>
              </CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 font-bold">
                {formatNumber(stats.totalRevenue)} {t("common.sar")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                    <th className={`px-4 py-3 ${isRTL ? "text-right" : "text-left"} text-sm font-bold`}>{t("incomeStatement.accountCode")}</th>
                    <th className={`px-4 py-3 ${isRTL ? "text-right" : "text-left"} text-sm font-bold`}>{t("incomeStatement.accountName")}</th>
                    <th className={`px-4 py-3 ${isRTL ? "text-left" : "text-right"} text-sm font-bold`}>{t("incomeStatement.amount")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("incomeStatement.entriesCount")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("incomeStatement.sources")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {revPagedData.length > 0 ? (
                    <>
                      {revPagedData.map((rev, idx) => (
                        <tr key={idx} className={`hover:bg-emerald-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-emerald-50/30"}`}>
                          <td className={`px-4 py-3 text-sm ${isRTL ? "text-right" : "text-left"}`}>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">{rev.account_code}</Badge>
                          </td>
                          <td className={`px-4 py-3 text-sm font-medium text-slate-700 ${isRTL ? "text-right" : "text-left"}`}>{rev.account_name}</td>
                          <td className={`px-4 py-3 text-sm font-bold text-emerald-600 tabular-nums ${isRTL ? "text-left" : "text-right"}`}>{formatNumber(rev.net_amount)}</td>
                          <td className="px-4 py-3 text-sm text-center text-slate-500">{rev.entries_count}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {rev.source_types.map(s => (
                                <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{sourceLabel(s)}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => setSelectedItem({ item: rev, type: "revenue" })} className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gradient-to-r from-emerald-100 to-emerald-50 font-bold">
                        <td colSpan={2} className={`px-4 py-4 text-sm text-emerald-800 ${isRTL ? "text-left" : "text-right"}`}>{t("incomeStatement.totalRevenue")}</td>
                        <td className={`px-4 py-4 text-sm text-emerald-700 font-black tabular-nums ${isRTL ? "text-left" : "text-right"}`}>{formatNumber(stats.totalRevenue)} {t("common.sar")}</td>
                        <td colSpan={3}></td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <DollarSign className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold">{t("incomeStatement.noRevenues")}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {revTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-emerald-100 bg-emerald-50/50">
                <span className="text-sm text-slate-600">{t("incomeStatement.page")} {revPage} / {revTotalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={revPage === 1} onClick={() => setRevPage(p => p - 1)} className="rounded-lg">
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" disabled={revPage === revTotalPages} onClick={() => setRevPage(p => p + 1)} className="rounded-lg">
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== EXPENSES TABLE ===== */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl print:shadow-none print:rounded-none">
          <CardHeader className="border-b border-rose-100 bg-gradient-to-r from-rose-50 to-red-50 print:bg-rose-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-rose-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-600" />
                {t("incomeStatement.expenses")}
                  <Badge className="bg-rose-100 text-rose-700 border-rose-300 text-xs">{filteredExpenses.length}</Badge>
              </CardTitle>
              <Badge className="bg-rose-100 text-rose-700 border-rose-300 font-bold">
                {formatNumber(stats.totalExpenses)} {t("common.sar")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr className="bg-gradient-to-r from-rose-600 to-rose-700 text-white">
                    <th className={`px-4 py-3 ${isRTL ? "text-right" : "text-left"} text-sm font-bold`}>{t("incomeStatement.accountCode")}</th>
                    <th className={`px-4 py-3 ${isRTL ? "text-right" : "text-left"} text-sm font-bold`}>{t("incomeStatement.accountName")}</th>
                    <th className={`px-4 py-3 ${isRTL ? "text-left" : "text-right"} text-sm font-bold`}>{t("incomeStatement.amount")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("incomeStatement.entriesCount")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("incomeStatement.sources")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold w-14"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {expPagedData.length > 0 ? (
                    <>
                      {expPagedData.map((exp, idx) => (
                        <tr key={idx} className={`hover:bg-rose-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-rose-50/30"}`}>
                          <td className={`px-4 py-3 text-sm ${isRTL ? "text-right" : "text-left"}`}>
                            <Badge variant="secondary" className="bg-rose-100 text-rose-700">{exp.account_code}</Badge>
                          </td>
                          <td className={`px-4 py-3 text-sm font-medium text-slate-700 ${isRTL ? "text-right" : "text-left"}`}>{exp.account_name}</td>
                          <td className={`px-4 py-3 text-sm font-bold text-rose-600 tabular-nums ${isRTL ? "text-left" : "text-right"}`}>{formatNumber(exp.net_amount)}</td>
                          <td className="px-4 py-3 text-sm text-center text-slate-500">{exp.entries_count}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-wrap justify-center gap-1">
                              {exp.source_types.map(s => (
                                <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0">{sourceLabel(s)}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => setSelectedItem({ item: exp, type: "expense" })} className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gradient-to-r from-rose-100 to-rose-50 font-bold">
                        <td colSpan={2} className={`px-4 py-4 text-sm text-rose-800 ${isRTL ? "text-left" : "text-right"}`}>{t("incomeStatement.totalExpenses")}</td>
                        <td className={`px-4 py-4 text-sm text-rose-700 font-black tabular-nums ${isRTL ? "text-left" : "text-right"}`}>{formatNumber(stats.totalExpenses)} {t("common.sar")}</td>
                        <td colSpan={3}></td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <CreditCard className="w-12 h-12 text-rose-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold">{t("incomeStatement.noExpenses")}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {expTotalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-rose-100 bg-rose-50/50">
                <span className="text-sm text-slate-600">{t("incomeStatement.page")} {expPage} / {expTotalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={expPage === 1} onClick={() => setExpPage(p => p - 1)} className="rounded-lg">
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" disabled={expPage === expTotalPages} onClick={() => setExpPage(p => p + 1)} className="rounded-lg">
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== NET INCOME SUMMARY ===== */}
        <Card className={`border-none shadow-xl rounded-[2rem] overflow-hidden backdrop-blur-xl print:shadow-none print:rounded-none ${stats.isProfit ? "bg-gradient-to-br from-emerald-50 via-white to-amber-50" : "bg-gradient-to-br from-rose-50 via-white to-red-50"}`}>
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${stats.isProfit ? "bg-gradient-to-br from-amber-400 to-amber-600" : "bg-gradient-to-br from-rose-400 to-rose-600"} shadow-xl`}>
                {stats.isProfit ? <Trophy className="w-10 h-10 text-white" /> : <AlertTriangle className="w-10 h-10 text-white" />}
              </div>
              <h3 className={`text-2xl font-black ${stats.isProfit ? "text-emerald-700" : "text-rose-700"}`}>
                {stats.isProfit ? t("incomeStatement.isProfit") : t("incomeStatement.isLoss")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 rounded-2xl p-5 text-center shadow-lg border border-emerald-100">
                <p className="text-emerald-600 font-bold text-sm mb-2">{t("incomeStatement.revenues")}</p>
                <p className="text-2xl font-black text-emerald-700 tabular-nums">{formatNumber(stats.totalRevenue)}</p>
                <p className="text-emerald-500 text-xs">{t("common.sar")}</p>
              </div>
              <div className="bg-white/80 rounded-2xl p-5 text-center shadow-lg border border-rose-100">
                <p className="text-rose-600 font-bold text-sm mb-2">{t("incomeStatement.expenses")}</p>
                <p className="text-2xl font-black text-rose-700 tabular-nums">{formatNumber(stats.totalExpenses)}</p>
                <p className="text-rose-500 text-xs">{t("common.sar")}</p>
              </div>
              <div className={`rounded-2xl p-5 text-center shadow-lg border ${stats.isProfit ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200" : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"}`}>
                <p className={`font-bold text-sm mb-2 ${stats.isProfit ? "text-amber-600" : "text-red-600"}`}>{t("incomeStatement.netIncome")}</p>
                <p className={`text-2xl font-black tabular-nums ${stats.isProfit ? "text-amber-700" : "text-red-700"}`}>{formatNumber(Math.abs(stats.netIncome))}</p>
                <p className={`text-xs ${stats.isProfit ? "text-amber-500" : "text-red-500"}`}>{t("common.sar")}</p>
              </div>
              <div className="bg-white/80 rounded-2xl p-5 text-center shadow-lg border border-purple-100">
                <p className="text-purple-600 font-bold text-sm mb-2">{t("incomeStatement.profitMargin")}</p>
                <p className="text-2xl font-black text-purple-700 tabular-nums">{stats.profitMargin.toFixed(1)}%</p>
                <p className="text-purple-500 text-xs">{t("incomeStatement.margin")}</p>
              </div>
            </div>

            {!stats.isProfit && (
              <div className="mt-6 p-4 bg-rose-100 border border-rose-300 rounded-xl text-center">
                <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
                <p className="text-rose-700 font-bold">{t("incomeStatement.lossWarning")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Card>

      {/* ===== DETAIL MODAL ===== */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className={`p-6 border-b ${selectedItem.type === "revenue" ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100" : "bg-gradient-to-r from-rose-50 to-red-50 border-rose-100"}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-black ${selectedItem.type === "revenue" ? "text-emerald-800" : "text-rose-800"}`}>
                  {t("incomeStatement.accountDetails")}
                </h3>
                <button onClick={() => setSelectedItem(null)} className="p-2 rounded-xl hover:bg-white/50 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{t("incomeStatement.accountCode")}</p>
                  <p className="font-bold text-slate-800">{selectedItem.item.account_code}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{t("incomeStatement.accountName")}</p>
                  <p className="font-bold text-slate-800">{selectedItem.item.account_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-xl p-3 ${selectedItem.type === "revenue" ? "bg-emerald-50" : "bg-rose-50"}`}>
                  <p className={`text-xs mb-1 ${selectedItem.type === "revenue" ? "text-emerald-600" : "text-rose-600"}`}>{t("incomeStatement.amount")}</p>
                  <p className={`text-xl font-black ${selectedItem.type === "revenue" ? "text-emerald-700" : "text-rose-700"}`}>{formatNumber(selectedItem.item.net_amount)}</p>
                  <p className={`text-xs ${selectedItem.type === "revenue" ? "text-emerald-500" : "text-rose-500"}`}>{t("common.sar")}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-600 mb-1">{t("incomeStatement.entriesCount")}</p>
                  <p className="text-xl font-black text-blue-700">{selectedItem.item.entries_count}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-2">{t("incomeStatement.sources")}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.item.source_types.map(s => (
                    <Badge key={s} className="bg-blue-100 text-blue-700 border-blue-200">{sourceLabel(s)}</Badge>
                  ))}
                </div>
              </div>

              {selectedItem.item.debit_total > 0 || selectedItem.item.credit_total > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs text-blue-600 mb-1">{t("incomeStatement.totalDebit")}</p>
                    <p className="font-bold text-blue-700 tabular-nums">{formatNumber(selectedItem.item.debit_total)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs text-purple-600 mb-1">{t("incomeStatement.totalCredit")}</p>
                    <p className="font-bold text-purple-700 tabular-nums">{formatNumber(selectedItem.item.credit_total)}</p>
                  </div>
                </div>
              ) : null}

              {Object.keys(selectedItem.item.by_center).length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-2">{t("incomeStatement.costCenters")}</p>
                  <div className="space-y-2">
                    {Object.entries(selectedItem.item.by_center).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm text-slate-700">{val.name}</span>
                        <span className="text-sm font-bold text-slate-800 tabular-nums">{formatNumber(val.amount)} {t("common.sar")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
