"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Scale,
  Building2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Printer,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Landmark,
  Wallet,
  Users,
  Search,
  Filter,
  Eye,
  Hash,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
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
  BarChart,
  Bar,
  Cell,
} from "recharts";

interface BSItem {
  account_id: number | null;
  account_code: string;
  account_name: string;
  account_type: string;
  category: string;
  net_balance: number;
  debit_total: number;
  credit_total: number;
  entries_count: number;
  source_types: string[];
  by_center: Record<string, { name: string; amount: number }>;
}

interface BalanceSheetClientProps {
  companyId: number;
  companyInfo: {
    name: string;
    logo_path: string | null;
  };
}

const SOURCE_KEYS = ["all", "journal", "expense", "deduction", "payroll", "invoice"] as const;
const ITEMS_PER_PAGE = 10;

export function BalanceSheetClient({ companyId, companyInfo }: BalanceSheetClientProps) {
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

  const accountTypeLabel = (type: string) => {
    const labels: Record<string, Record<string, string>> = {
      "اصل": { ar: "أصل", en: "Asset" },
      "أصل": { ar: "أصل", en: "Asset" },
      "asset": { ar: "أصل", en: "Asset" },
      "التزام": { ar: "التزام", en: "Liability" },
      "liability": { ar: "التزام", en: "Liability" },
      "حقوق ملكية": { ar: "حقوق ملكية", en: "Equity" },
      "equity": { ar: "حقوق ملكية", en: "Equity" },
      "ايراد": { ar: "إيراد", en: "Revenue" },
      "revenue": { ar: "إيراد", en: "Revenue" },
      "مصروف": { ar: "مصروف", en: "Expense" },
      "expense": { ar: "مصروف", en: "Expense" },
    };
    return labels[type?.toLowerCase?.() || type]?.[locale] || type;
  };

  const [assets, setAssets] = useState<BSItem[]>([]);
  const [liabilities, setLiabilities] = useState<BSItem[]>([]);
  const [equities, setEquities] = useState<BSItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquities: 0,
    netIncome: 0,
    totalRevenueAmount: 0,
    totalExpenseAmount: 0,
    totalEquitiesWithIncome: 0,
    difference: 0,
    isBalanced: true,
    assetsCount: 0,
    liabilitiesCount: 0,
    equitiesCount: 0,
    totalEntries: 0,
  });
  const [chartData, setChartData] = useState<{
    assetComposition: any[];
    liabilityComposition: any[];
    summary: any[];
  }>({ assetComposition: [], liabilityComposition: [], summary: [] });
  const [sourceTypeCounts, setSourceTypeCounts] = useState<Record<string, number>>({});
  const [period, setPeriod] = useState({ fromDate: "", toDate: "" });

  const [filters, setFilters] = useState({
    fromDate: new Date().getFullYear() + "-01-01",
    toDate: new Date().toISOString().split("T")[0],
    source: "all" as string,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [detailItem, setDetailItem] = useState<BSItem | null>(null);

  // Pagination
  const [assetPage, setAssetPage] = useState(1);
  const [liabilityPage, setLiabilityPage] = useState(1);
  const [equityPage, setEquityPage] = useState(1);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      params.set("from_date", filters.fromDate);
      params.set("to_date", filters.toDate);
      if (filters.source !== "all") params.set("source", filters.source);

      const response = await fetch(`/api/balance-sheet?${params.toString()}`);
      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        return;
      }

      setAssets(data.assets || []);
      setLiabilities(data.liabilities || []);
      setEquities(data.equities || []);
      setStats(data.stats || {});
      setChartData(data.chartData || { assetComposition: [], liabilityComposition: [], summary: [] });
      setSourceTypeCounts(data.sourceTypeCounts || {});
      setPeriod(data.period || {});
    } catch (error) {
      console.error("Error fetching balance sheet data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters.fromDate, filters.toDate, filters.source]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Client-side search filtering
  const filterBySearch = (items: BSItem[]) => {
    if (!searchText.trim()) return items;
    const s = searchText.toLowerCase();
    return items.filter(i =>
      i.account_code.toLowerCase().includes(s) || i.account_name.toLowerCase().includes(s)
    );
  };

  const filteredAssets = filterBySearch(assets);
  const filteredLiabilities = filterBySearch(liabilities);
  const filteredEquities = filterBySearch(equities);

  // Reset page when search changes
  useEffect(() => {
    setAssetPage(1);
    setLiabilityPage(1);
    setEquityPage(1);
  }, [searchText]);

  // Paginated data
  const paginatedAssets = filteredAssets.slice((assetPage - 1) * ITEMS_PER_PAGE, assetPage * ITEMS_PER_PAGE);
  const paginatedLiabilities = filteredLiabilities.slice((liabilityPage - 1) * ITEMS_PER_PAGE, liabilityPage * ITEMS_PER_PAGE);
  const paginatedEquities = filteredEquities.slice((equityPage - 1) * ITEMS_PER_PAGE, equityPage * ITEMS_PER_PAGE);

  const totalAssetPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const totalLiabilityPages = Math.ceil(filteredLiabilities.length / ITEMS_PER_PAGE);
  const totalEquityPages = Math.ceil(filteredEquities.length / ITEMS_PER_PAGE);

  const handleExportCSV = () => {
    const headers = [t("common.category"), t("balanceSheet.accountCode"), t("balanceSheet.accountName"), t("balanceSheet.netBalance"), t("balanceSheet.entries"), t("balanceSheet.sources")];
    const csvRows = [headers.join(",")];

    csvRows.push(`"${t("balanceSheet.assets")}",,,,,`);
    assets.forEach(a => {
      csvRows.push([`""`, a.account_code, `"${a.account_name}"`, a.net_balance.toFixed(2), a.entries_count, `"${a.source_types.map(s => sourceLabel(s)).join(", ")}"`].join(","));
    });
    csvRows.push([`"${t("balanceSheet.totalAssets")}"`, "", "", stats.totalAssets.toFixed(2), "", ""].join(","));

    csvRows.push(`"${t("balanceSheet.liabilities")}",,,,,`);
    liabilities.forEach(l => {
      csvRows.push([`""`, l.account_code, `"${l.account_name}"`, l.net_balance.toFixed(2), l.entries_count, `"${l.source_types.map(s => sourceLabel(s)).join(", ")}"`].join(","));
    });
    csvRows.push([`"${t("balanceSheet.totalLiabilities")}"`, "", "", stats.totalLiabilities.toFixed(2), "", ""].join(","));

    csvRows.push(`"${t("balanceSheet.equities")}",,,,,`);
    equities.forEach(e => {
      csvRows.push([`""`, e.account_code, `"${e.account_name}"`, e.net_balance.toFixed(2), e.entries_count, `"${e.source_types.map(s => sourceLabel(s)).join(", ")}"`].join(","));
    });
    if (Math.abs(stats.netIncome) > 0.01) {
      csvRows.push([`""`, "---", `"${stats.netIncome >= 0 ? t("balanceSheet.netProfit") : t("balanceSheet.netLoss")}"`, Math.abs(stats.netIncome).toFixed(2), "", ""].join(","));
    }
    csvRows.push([`"${t("balanceSheet.totalEquities")}"`, "", "", stats.totalEquitiesWithIncome.toFixed(2), "", ""].join(","));

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `balance_sheet_${filters.fromDate}_${filters.toDate}.csv`;
    a.click();
  };

  const handlePrint = () => window.print();

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString("en-GB") : "";

  const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

  // Pagination component
  const PaginationControls = ({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (p: number) => void }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 border-t border-slate-200">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg h-8 w-8 p-0">
          {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
        <span className="text-sm font-bold text-slate-600 mx-2">
          {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg h-8 w-8 p-0">
          {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            <Scale className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 font-bold text-lg">{t("balanceSheet.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6" dir={isRTL ? "rtl" : "ltr"}>
      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-[#1a2234] p-4 md:p-8 space-y-8">

        {/* ===== HEADER ===== */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-2xl border border-white/10 print:hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  {companyInfo.logo_path ? (
                    <img src={companyInfo.logo_path} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-white/20 object-cover shadow-2xl" />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl">
                      <Building2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Scale className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    {t("balanceSheet.title")}
                  </h1>
                  <p className="text-white/60 font-medium mt-1 text-sm md:text-base">{companyInfo.name}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold text-xs">
                      <Calendar className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
                      {formatDate(period.fromDate)} - {formatDate(period.toDate)}
                    </Badge>
                    {stats.isBalanced ? (
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold text-xs animate-pulse">
                        <CheckCircle2 className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
                        {t("balanceSheet.isBalanced")}
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold text-xs animate-pulse">
                        <AlertTriangle className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
                        {t("balanceSheet.isUnbalanced")}
                      </Badge>
                    )}
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold text-xs">
                      <Hash className={`w-3 h-3 ${isRTL ? "ml-1" : "mr-1"}`} />
                      {stats.totalEntries} {t("balanceSheet.entries")}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <Button onClick={() => fetchData(true)} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold rounded-xl" disabled={refreshing}>
                  <RefreshCw className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"} ${refreshing ? "animate-spin" : ""}`} />
                  {t("common.update")}
                </Button>
                <Button onClick={() => setShowCharts(!showCharts)} variant="outline" size="sm" className={`font-bold rounded-xl ${showCharts ? "bg-purple-500/30 border-purple-400/50 text-purple-200" : "bg-white/10 border-white/20 text-white hover:bg-white/20"}`}>
                  <BarChart3 className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("balanceSheet.charts")}
                </Button>
                <Button onClick={handleExportCSV} variant="outline" size="sm" className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 font-bold rounded-xl">
                  <FileSpreadsheet className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  Excel
                </Button>
                <Button onClick={handlePrint} variant="outline" size="sm" className="bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30 font-bold rounded-xl">
                  <Printer className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("common.print")}
                </Button>
              </div>
            </div>

            {/* ===== STAT CARDS ===== */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mt-6 md:mt-8">
              {/* Total Assets */}
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 md:p-4 group hover:bg-white/10 transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-emerald-500/20 rounded-xl"><Landmark className="w-5 h-5 text-emerald-400" /></div>
                  <span className="text-lg md:text-2xl font-black text-emerald-300 tabular-nums">{formatNumber(stats.totalAssets)}</span>
                  <span className="text-[10px] md:text-xs font-medium text-emerald-300/50">{t("balanceSheet.totalAssets")}</span>
                </div>
              </div>
              {/* Total Liabilities */}
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 md:p-4 group hover:bg-white/10 transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600" />
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-rose-500/20 rounded-xl"><Wallet className="w-5 h-5 text-rose-400" /></div>
                  <span className="text-lg md:text-2xl font-black text-rose-300 tabular-nums">{formatNumber(stats.totalLiabilities)}</span>
                  <span className="text-[10px] md:text-xs font-medium text-rose-300/50">{t("balanceSheet.totalLiabilities")}</span>
                </div>
              </div>
              {/* Total Equity */}
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 md:p-4 group hover:bg-white/10 transition-all">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-2 bg-blue-500/20 rounded-xl"><Users className="w-5 h-5 text-blue-400" /></div>
                  <span className="text-lg md:text-2xl font-black text-blue-300 tabular-nums">{formatNumber(stats.totalEquitiesWithIncome)}</span>
                  <span className="text-[10px] md:text-xs font-medium text-blue-300/50">{t("balanceSheet.totalEquities")}</span>
                </div>
              </div>
              {/* Net Income */}
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-3 md:p-4 group hover:bg-white/10 transition-all">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stats.netIncome >= 0 ? "from-amber-400 to-amber-600" : "from-red-400 to-red-600"}`} />
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`p-2 rounded-xl ${stats.netIncome >= 0 ? "bg-amber-500/20" : "bg-red-500/20"}`}>
                    {stats.netIncome >= 0 ? <TrendingUp className="w-5 h-5 text-amber-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
                  </div>
                  <span className={`text-lg md:text-2xl font-black tabular-nums ${stats.netIncome >= 0 ? "text-amber-300" : "text-red-300"}`}>{formatNumber(Math.abs(stats.netIncome))}</span>
                  <span className={`text-[10px] md:text-xs font-medium ${stats.netIncome >= 0 ? "text-amber-300/50" : "text-red-300/50"}`}>{t("balanceSheet.netIncome")}</span>
                </div>
              </div>
              {/* Difference / Balance */}
              <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/10 p-3 md:p-4 group transition-all ${
                stats.isBalanced ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 hover:bg-emerald-500/30" : "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/20 hover:bg-red-500/30"
              }`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stats.isBalanced ? "from-emerald-400 to-emerald-600" : "from-red-400 to-red-600"}`} />
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`p-2 rounded-xl ${stats.isBalanced ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                    {stats.isBalanced ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
                  </div>
                  <span className={`text-lg md:text-2xl font-black tabular-nums ${stats.isBalanced ? "text-emerald-300" : "text-red-300"}`}>{formatNumber(Math.abs(stats.difference))}</span>
                  <span className={`text-[10px] md:text-xs font-medium ${stats.isBalanced ? "text-emerald-300/50" : "text-red-300/50"}`}>{t("balanceSheet.difference")}</span>
                </div>
              </div>
            </div>

            {/* Balance status banner */}
            <div className={`mt-6 p-4 rounded-2xl text-center ${stats.isBalanced ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-rose-500/20 border border-rose-500/30"}`}>
              {stats.isBalanced ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-300">{t("balanceSheet.balancedDesc")}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                  <span className="text-lg font-bold text-rose-300">{t("balanceSheet.unbalancedDesc")} {formatNumber(stats.difference)} {t("common.sar")}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== FILTERS & SOURCE TABS ===== */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl print:hidden">
          <CardContent className="p-4 md:p-6">
            {/* Source tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {SOURCE_KEYS.map(src => {
                const count = src === "all" ? stats.totalEntries : (sourceTypeCounts[src] || 0);
                const isActive = filters.source === src;
                return (
                  <Button
                    key={src}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilters(prev => ({ ...prev, source: src }))}
                    className={`rounded-xl font-bold text-xs ${isActive ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    {sourceLabel(src)}
                    <Badge variant="secondary" className={`${isRTL ? "mr-1" : "ml-1"} text-[10px] px-1.5 py-0 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* Search + Filter toggle */}
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRTL ? "right-3" : "left-3"}`} />
                <Input
                  placeholder={t("balanceSheet.searchPlaceholder")}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className={`h-11 rounded-xl ${isRTL ? "pr-10" : "pl-10"} text-slate-800 border-slate-300`}
                />
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={`rounded-xl font-bold h-11 ${showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : ""}`}>
                <Filter className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                {t("balanceSheet.period")}
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
                    {t("balanceSheet.applyFilter")}
                  </Button>
                  <Button variant="outline" onClick={() => { setFilters({ fromDate: new Date().getFullYear() + "-01-01", toDate: new Date().toISOString().split("T")[0], source: "all" }); setSearchText(""); }} className="rounded-xl font-bold h-11">
                    <X className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    {t("balanceSheet.reset")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== CHARTS ===== */}
        {showCharts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
            {/* Asset Composition Chart */}
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
              <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-600" />
                  {t("balanceSheet.assetComposition")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {chartData.assetComposition.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.assetComposition} layout="vertical" margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "#334155", fontSize: 11 }} width={120} />
                      <Tooltip formatter={(v: number) => [formatNumber(v) + ` ${t("common.sar")}`, t("balanceSheet.netBalance")]} />
                      <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                        {chartData.assetComposition.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-slate-400">{t("common.noData")}</div>
                )}
              </CardContent>
            </Card>

            {/* Balance Summary Chart */}
            <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
              <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  {t("balanceSheet.balanceSummary")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {chartData.summary.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.summary.map(s => ({ ...s, name: s.name === "assets" ? t("balanceSheet.assets") : s.name === "liabilities" ? t("balanceSheet.liabilities") : t("balanceSheet.equities") }))} margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: "#334155", fontSize: 12, fontWeight: 700 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
                      <Tooltip formatter={(v: number) => [formatNumber(v) + ` ${t("common.sar")}`, ""]} />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                        <Cell fill="#3b82f6" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-slate-400">{t("common.noData")}</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ===== ASSETS TABLE ===== */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl print:shadow-none print:rounded-none">
          <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 print:bg-emerald-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600" />
                {t("balanceSheet.assets")}
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">{filteredAssets.length}</Badge>
              </CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 font-bold">
                {formatNumber(stats.totalAssets)} {t("common.sar")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                    <th className={`px-4 py-3 ${isRTL ? "text-right" : "text-left"} text-sm font-bold`}>{t("balanceSheet.accountName")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("balanceSheet.accountCode")}</th>
                    <th className={`px-4 py-3 ${isRTL ? "text-left" : "text-right"} text-sm font-bold`}>{t("balanceSheet.netBalance")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("balanceSheet.entries")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("balanceSheet.sources")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold w-16">{t("balanceSheet.details")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {paginatedAssets.length > 0 ? (
                    <>
                      {paginatedAssets.map((asset, idx) => (
                        <tr key={idx} className={`hover:bg-emerald-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-emerald-50/30"}`}>
                          <td className={`px-4 py-3 text-sm font-medium text-slate-700 ${isRTL ? "text-right" : "text-left"}`}>{asset.account_name}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">{asset.account_code}</Badge>
                          </td>
                          <td className={`px-4 py-3 text-sm font-bold text-emerald-600 tabular-nums ${isRTL ? "text-left" : "text-right"}`}>
                            {formatNumber(asset.net_balance)} {t("common.sar")}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-slate-500 font-bold">{asset.entries_count}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {asset.source_types.map(s => (
                                <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-600 border-emerald-200">{sourceLabel(s)}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="ghost" size="sm" onClick={() => setDetailItem(asset)} className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-100 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gradient-to-r from-emerald-100 to-emerald-50 font-bold">
                        <td colSpan={2} className={`px-4 py-4 text-sm text-emerald-800 ${isRTL ? "text-left" : "text-right"}`}>{t("balanceSheet.totalAssets")}:</td>
                        <td className={`px-4 py-4 text-sm text-emerald-700 font-black tabular-nums ${isRTL ? "text-left" : "text-right"}`}>{formatNumber(stats.totalAssets)} {t("common.sar")}</td>
                        <td colSpan={3}></td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Landmark className="w-12 h-12 text-emerald-200" />
                          <p className="text-slate-400 font-bold">{t("balanceSheet.noAssets")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls page={assetPage} totalPages={totalAssetPages} setPage={setAssetPage} />
          </CardContent>
        </Card>

        {/* ===== LIABILITIES TABLE ===== */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl print:shadow-none print:rounded-none">
          <CardHeader className="border-b border-rose-100 bg-gradient-to-r from-rose-50 to-red-50 print:bg-rose-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-rose-800 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-rose-600" />
                {t("balanceSheet.liabilities")}
                <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-xs">{filteredLiabilities.length}</Badge>
              </CardTitle>
              <Badge className="bg-rose-100 text-rose-700 border-rose-300 font-bold">
                {formatNumber(stats.totalLiabilities)} {t("common.sar")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr className="bg-gradient-to-r from-rose-600 to-rose-700 text-white">
                    <th className={`px-4 py-3 ${isRTL ? "text-right" : "text-left"} text-sm font-bold`}>{t("balanceSheet.accountName")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("balanceSheet.accountCode")}</th>
                    <th className={`px-4 py-3 ${isRTL ? "text-left" : "text-right"} text-sm font-bold`}>{t("balanceSheet.netBalance")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("balanceSheet.entries")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("balanceSheet.sources")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold w-16">{t("balanceSheet.details")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100">
                  {paginatedLiabilities.length > 0 ? (
                    <>
                      {paginatedLiabilities.map((item, idx) => (
                        <tr key={idx} className={`hover:bg-rose-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-rose-50/30"}`}>
                          <td className={`px-4 py-3 text-sm font-medium text-slate-700 ${isRTL ? "text-right" : "text-left"}`}>{item.account_name}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            <Badge variant="secondary" className="bg-rose-100 text-rose-700">{item.account_code}</Badge>
                          </td>
                          <td className={`px-4 py-3 text-sm font-bold text-rose-600 tabular-nums ${isRTL ? "text-left" : "text-right"}`}>
                            {formatNumber(item.net_balance)} {t("common.sar")}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-slate-500 font-bold">{item.entries_count}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {item.source_types.map(s => (
                                <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0 bg-rose-50 text-rose-600 border-rose-200">{sourceLabel(s)}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="ghost" size="sm" onClick={() => setDetailItem(item)} className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-100 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gradient-to-r from-rose-100 to-rose-50 font-bold">
                        <td colSpan={2} className={`px-4 py-4 text-sm text-rose-800 ${isRTL ? "text-left" : "text-right"}`}>{t("balanceSheet.totalLiabilities")}:</td>
                        <td className={`px-4 py-4 text-sm text-rose-700 font-black tabular-nums ${isRTL ? "text-left" : "text-right"}`}>{formatNumber(stats.totalLiabilities)} {t("common.sar")}</td>
                        <td colSpan={3}></td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Wallet className="w-12 h-12 text-rose-200" />
                          <p className="text-slate-400 font-bold">{t("balanceSheet.noLiabilities")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls page={liabilityPage} totalPages={totalLiabilityPages} setPage={setLiabilityPage} />
          </CardContent>
        </Card>

        {/* ===== EQUITIES TABLE ===== */}
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl print:shadow-none print:rounded-none">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 print:bg-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                {t("balanceSheet.equities")}
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">{filteredEquities.length + (Math.abs(stats.netIncome) > 0.01 ? 1 : 0)}</Badge>
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 font-bold">
                {formatNumber(stats.totalEquitiesWithIncome)} {t("common.sar")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className={`px-4 py-3 ${isRTL ? "text-right" : "text-left"} text-sm font-bold`}>{t("balanceSheet.accountName")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("balanceSheet.accountCode")}</th>
                    <th className={`px-4 py-3 ${isRTL ? "text-left" : "text-right"} text-sm font-bold`}>{t("balanceSheet.netBalance")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("balanceSheet.entries")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold">{t("balanceSheet.sources")}</th>
                    <th className="px-4 py-3 text-center text-sm font-bold w-16">{t("balanceSheet.details")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {paginatedEquities.length > 0 || Math.abs(stats.netIncome) > 0.01 ? (
                    <>
                      {paginatedEquities.map((item, idx) => (
                        <tr key={idx} className={`hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-blue-50/30"}`}>
                          <td className={`px-4 py-3 text-sm font-medium text-slate-700 ${isRTL ? "text-right" : "text-left"}`}>{item.account_name}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">{item.account_code}</Badge>
                          </td>
                          <td className={`px-4 py-3 text-sm font-bold text-blue-600 tabular-nums ${isRTL ? "text-left" : "text-right"}`}>
                            {formatNumber(item.net_balance)} {t("common.sar")}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-slate-500 font-bold">{item.entries_count}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-wrap gap-1 justify-center">
                              {item.source_types.map(s => (
                                <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200">{sourceLabel(s)}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button variant="ghost" size="sm" onClick={() => setDetailItem(item)} className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100 rounded-lg">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {/* Net income row */}
                      {Math.abs(stats.netIncome) > 0.01 && equityPage >= totalEquityPages && (
                        <tr className={`hover:bg-amber-50/50 transition-colors bg-amber-50/30`}>
                          <td className={`px-4 py-3 text-sm font-medium text-slate-700 ${isRTL ? "text-right" : "text-left"}`}>
                            {t("balanceSheet.netIncome")} ({stats.netIncome >= 0 ? t("balanceSheet.netProfit") : t("balanceSheet.netLoss")})
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            <Badge variant="secondary" className={stats.netIncome >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                              {stats.netIncome >= 0 ? t("balanceSheet.netProfit") : t("balanceSheet.netLoss")}
                            </Badge>
                          </td>
                          <td className={`px-4 py-3 text-sm font-bold tabular-nums ${isRTL ? "text-left" : "text-right"} ${stats.netIncome >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {formatNumber(Math.abs(stats.netIncome))} {t("common.sar")}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-slate-400">-</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-600 border-amber-200">
                              {t("balanceSheet.calculated")}
                            </Badge>
                          </td>
                          <td></td>
                        </tr>
                      )}
                      <tr className="bg-gradient-to-r from-blue-100 to-blue-50 font-bold">
                        <td colSpan={2} className={`px-4 py-4 text-sm text-blue-800 ${isRTL ? "text-left" : "text-right"}`}>{t("balanceSheet.totalEquities")}:</td>
                        <td className={`px-4 py-4 text-sm text-blue-700 font-black tabular-nums ${isRTL ? "text-left" : "text-right"}`}>{formatNumber(stats.totalEquitiesWithIncome)} {t("common.sar")}</td>
                        <td colSpan={3}></td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="w-12 h-12 text-blue-200" />
                          <p className="text-slate-400 font-bold">{t("balanceSheet.noEquities")}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls page={equityPage} totalPages={totalEquityPages} setPage={setEquityPage} />
          </CardContent>
        </Card>

        {/* ===== GRAND TOTAL / EQUATION ===== */}
        <Card className={`border-none shadow-xl rounded-[2rem] overflow-hidden backdrop-blur-xl print:shadow-none print:rounded-none ${
          stats.isBalanced ? "bg-gradient-to-br from-emerald-50 via-white to-blue-50" : "bg-gradient-to-br from-rose-50 via-white to-red-50"
        }`}>
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${stats.isBalanced ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-rose-400 to-rose-600"} shadow-xl`}>
                {stats.isBalanced ? <CheckCircle2 className="w-10 h-10 text-white" /> : <AlertTriangle className="w-10 h-10 text-white" />}
              </div>
              <h3 className={`text-2xl font-black ${stats.isBalanced ? "text-emerald-700" : "text-rose-700"}`}>
                {stats.isBalanced ? t("balanceSheet.isBalanced") : t("balanceSheet.isUnbalanced")}
              </h3>
              <p className="text-slate-500 mt-2 text-sm">{t("balanceSheet.equationDesc")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/80 rounded-2xl p-5 text-center shadow-lg border border-emerald-100">
                <p className="text-emerald-600 font-bold text-sm mb-2">{t("balanceSheet.assets")}</p>
                <p className="text-2xl font-black text-emerald-700 tabular-nums">{formatNumber(stats.totalAssets)}</p>
                <p className="text-emerald-500 text-xs">{t("common.sar")}</p>
              </div>
              <div className="bg-white/80 rounded-2xl p-5 text-center shadow-lg border border-rose-100">
                <p className="text-rose-600 font-bold text-sm mb-2">{t("balanceSheet.liabilities")}</p>
                <p className="text-2xl font-black text-rose-700 tabular-nums">{formatNumber(stats.totalLiabilities)}</p>
                <p className="text-rose-500 text-xs">{t("common.sar")}</p>
              </div>
              <div className="bg-white/80 rounded-2xl p-5 text-center shadow-lg border border-blue-100">
                <p className="text-blue-600 font-bold text-sm mb-2">{t("balanceSheet.equities")}</p>
                <p className="text-2xl font-black text-blue-700 tabular-nums">{formatNumber(stats.totalEquitiesWithIncome)}</p>
                <p className="text-blue-500 text-xs">{t("common.sar")}</p>
              </div>
              <div className={`rounded-2xl p-5 text-center shadow-lg border ${stats.isBalanced ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200" : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"}`}>
                <p className={`font-bold text-sm mb-2 ${stats.isBalanced ? "text-amber-600" : "text-red-600"}`}>{t("balanceSheet.difference")}</p>
                <p className={`text-2xl font-black tabular-nums ${stats.isBalanced ? "text-amber-700" : "text-red-700"}`}>{formatNumber(Math.abs(stats.difference))}</p>
                <p className={`text-xs ${stats.isBalanced ? "text-amber-500" : "text-red-500"}`}>{t("common.sar")}</p>
              </div>
            </div>

            {!stats.isBalanced && (
              <div className="mt-6 p-4 bg-rose-100 border border-rose-300 rounded-xl text-center">
                <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
                <p className="text-rose-700 font-bold">{t("balanceSheet.unbalancedDesc")} {formatNumber(stats.difference)} {t("common.sar")}</p>
              </div>
            )}
          </CardContent>
        </Card>

      </Card>

      {/* ===== DETAIL MODAL ===== */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDetailItem(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800">{t("balanceSheet.accountDetails")}</h3>
                <Button variant="ghost" size="sm" onClick={() => setDetailItem(null)} className="h-8 w-8 p-0 rounded-lg">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-slate-500 text-xs font-bold mb-1">{t("balanceSheet.accountCode")}</p>
                  <p className="text-lg font-black text-slate-800">{detailItem.account_code}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-slate-500 text-xs font-bold mb-1">{t("balanceSheet.accountType")}</p>
                  <p className="text-lg font-black text-slate-800">{accountTypeLabel(detailItem.account_type)}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-slate-500 text-xs font-bold mb-1">{t("balanceSheet.accountName")}</p>
                <p className="text-lg font-bold text-slate-800">{detailItem.account_name}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-emerald-500 text-xs font-bold mb-1">{t("balanceSheet.netBalance")}</p>
                  <p className="text-lg font-black text-emerald-700">{formatNumber(detailItem.net_balance)}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-blue-500 text-xs font-bold mb-1">{t("balanceSheet.debit")}</p>
                  <p className="text-lg font-black text-blue-700">{formatNumber(detailItem.debit_total)}</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-3 text-center">
                  <p className="text-rose-500 text-xs font-bold mb-1">{t("balanceSheet.credit")}</p>
                  <p className="text-lg font-black text-rose-700">{formatNumber(detailItem.credit_total)}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-slate-500 text-xs font-bold mb-2">{t("balanceSheet.sources")}</p>
                <div className="flex flex-wrap gap-2">
                  {detailItem.source_types.map(s => (
                    <Badge key={s} className="bg-blue-100 text-blue-700 border-blue-200">{sourceLabel(s)}</Badge>
                  ))}
                </div>
              </div>
              {Object.keys(detailItem.by_center).length > 0 && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-slate-500 text-xs font-bold mb-2">{t("balanceSheet.costCenters")}</p>
                  <div className="space-y-2">
                    {Object.values(detailItem.by_center).map((cc, i) => (
                      <div key={i} className="flex items-center justify-between bg-white rounded-lg p-2 border border-slate-100">
                        <span className="text-sm font-medium text-slate-700">{cc.name}</span>
                        <span className="text-sm font-bold text-slate-800">{formatNumber(cc.amount)} {t("common.sar")}</span>
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
