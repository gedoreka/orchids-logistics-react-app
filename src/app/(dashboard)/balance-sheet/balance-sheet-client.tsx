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
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  Landmark,
  Wallet,
  Users,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AccountItem {
  account_name: string;
  account_code: string;
  net_balance: number;
}

interface BalanceSheetClientProps {
  companyId: number;
  companyInfo: {
    name: string;
    logo_path: string | null;
  };
}

export function BalanceSheetClient({ companyId, companyInfo }: BalanceSheetClientProps) {
  const [assets, setAssets] = useState<AccountItem[]>([]);
  const [liabilities, setLiabilities] = useState<AccountItem[]>([]);
  const [equities, setEquities] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquities: 0,
    netIncome: 0,
    totalEquitiesWithIncome: 0,
    difference: 0,
    isBalanced: true,
    assetsCount: 0,
    liabilitiesCount: 0,
    equitiesCount: 0,
  });
  const [period, setPeriod] = useState({
    fromDate: new Date().getFullYear() + "-01-01",
    toDate: new Date().toISOString().split("T")[0],
  });

  const [filters, setFilters] = useState({
    fromDate: new Date().getFullYear() + "-01-01",
    toDate: new Date().toISOString().split("T")[0],
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      params.set("from_date", filters.fromDate);
      params.set("to_date", filters.toDate);

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
      setPeriod(data.period || {});
    } catch (error) {
      console.error("Error fetching balance sheet data:", error);
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

  const handleExportExcel = () => {
    const headers = ["القسم", "رمز الحساب", "اسم الحساب", "الرصيد"];
    const csvRows = [headers.join(",")];

    csvRows.push("الأصول,,,");
    assets.forEach(a => {
      csvRows.push([`""`, a.account_code, `"${a.account_name}"`, a.net_balance.toFixed(2)].join(","));
    });
    csvRows.push([`""`, "", "إجمالي الأصول", stats.totalAssets.toFixed(2)].join(","));

    csvRows.push("الالتزامات,,,");
    liabilities.forEach(l => {
      csvRows.push([`""`, l.account_code, `"${l.account_name}"`, l.net_balance.toFixed(2)].join(","));
    });
    csvRows.push([`""`, "", "إجمالي الالتزامات", stats.totalLiabilities.toFixed(2)].join(","));

    csvRows.push("حقوق الملكية,,,");
    equities.forEach(e => {
      csvRows.push([`""`, e.account_code, `"${e.account_name}"`, e.net_balance.toFixed(2)].join(","));
    });
    if (Math.abs(stats.netIncome) > 0.01) {
      csvRows.push([`""`, "---", stats.netIncome >= 0 ? "صافي الربح" : "صافي الخسارة", Math.abs(stats.netIncome).toFixed(2)].join(","));
    }
    csvRows.push([`""`, "", "إجمالي حقوق الملكية + صافي الدخل", stats.totalEquitiesWithIncome.toFixed(2)].join(","));

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `balance_sheet_${filters.fromDate}_${filters.toDate}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("ar-SA");

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
            <Scale className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 font-bold text-lg">جاري تحميل الميزانية العمومية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6" dir="rtl">
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
                <div className="absolute -bottom-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Scale className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                  الميزانية العمومية
                </h1>
                <p className="text-white/60 font-medium mt-1 text-sm md:text-base">{companyInfo.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold text-xs">
                    <Calendar className="w-3 h-3 ml-1" />
                    {formatDate(period.fromDate)} - {formatDate(period.toDate)}
                  </Badge>
                  {stats.isBalanced ? (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold text-xs animate-pulse">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      متوازنة
                    </Badge>
                  ) : (
                    <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30 font-bold text-xs animate-pulse">
                      <AlertTriangle className="w-3 h-3 ml-1" />
                      غير متوازنة
                    </Badge>
                  )}
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
                <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? "animate-spin" : ""}`} />
                تحديث
              </Button>
              <Button
                onClick={handleExportExcel}
                variant="outline"
                size="sm"
                className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 font-bold rounded-xl"
              >
                <FileSpreadsheet className="w-4 h-4 ml-2" />
                Excel
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30 font-bold rounded-xl"
              >
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-xl border border-emerald-500/20 p-3 md:p-4 group hover:bg-emerald-500/30 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <Landmark className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-lg md:text-2xl font-black text-emerald-300 tabular-nums">
                  {formatNumber(stats.totalAssets)}
                </span>
                <span className="text-[10px] md:text-xs font-medium text-emerald-300/50">إجمالي الأصول</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-600/10 backdrop-blur-xl border border-rose-500/20 p-3 md:p-4 group hover:bg-rose-500/30 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-rose-600" />
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-rose-500/20 rounded-xl">
                  <Wallet className="w-5 h-5 text-rose-400" />
                </div>
                <span className="text-lg md:text-2xl font-black text-rose-300 tabular-nums">
                  {formatNumber(stats.totalLiabilities)}
                </span>
                <span className="text-[10px] md:text-xs font-medium text-rose-300/50">إجمالي الالتزامات</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-blue-500/20 p-3 md:p-4 group hover:bg-blue-500/30 transition-all">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-lg md:text-2xl font-black text-blue-300 tabular-nums">
                  {formatNumber(stats.totalEquitiesWithIncome)}
                </span>
                <span className="text-[10px] md:text-xs font-medium text-blue-300/50">حقوق الملكية + صافي الدخل</span>
              </div>
            </div>

            <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border p-3 md:p-4 group transition-all ${
              stats.isBalanced 
                ? "bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/20 hover:bg-amber-500/30" 
                : "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/20 hover:bg-red-500/30"
            }`}>
              <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stats.isBalanced ? "from-amber-400 to-amber-600" : "from-red-400 to-red-600"}`} />
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`p-2 rounded-xl ${stats.isBalanced ? "bg-amber-500/20" : "bg-red-500/20"}`}>
                  <Scale className={`w-5 h-5 ${stats.isBalanced ? "text-amber-400" : "text-red-400"}`} />
                </div>
                <span className={`text-lg md:text-2xl font-black tabular-nums ${stats.isBalanced ? "text-amber-300" : "text-red-300"}`}>
                  {formatNumber(Math.abs(stats.difference))}
                </span>
                <span className={`text-[10px] md:text-xs font-medium ${stats.isBalanced ? "text-amber-300/50" : "text-red-300/50"}`}>
                  الفرق
                </span>
              </div>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-2xl text-center ${stats.isBalanced ? "bg-emerald-500/20 border border-emerald-500/30" : "bg-rose-500/20 border border-rose-500/30"}`}>
            {stats.isBalanced ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span className="text-lg font-bold text-emerald-300">الميزانية متوازنة - الأصول = الالتزامات + حقوق الملكية</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
                <span className="text-lg font-bold text-rose-300">الميزانية غير متوازنة - الفرق: {formatNumber(stats.difference)} ر.س</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl print:hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-xl font-bold h-12 ${showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : ""}`}
            >
              <Filter className="w-4 h-4 ml-2" />
              تحديد الفترة الزمنية
              {showFilters ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
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
              <div className="flex items-end gap-2">
                <Button
                  onClick={() => fetchData()}
                  className="rounded-xl font-bold h-11 bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="w-4 h-4 ml-2" />
                  تطبيق الفلترة
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFilters({ fromDate: new Date().getFullYear() + "-01-01", toDate: new Date().toISOString().split("T")[0] })}
                  className="rounded-xl font-bold h-11"
                >
                  <X className="w-4 h-4 ml-2" />
                  إعادة تعيين
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl print:shadow-none print:rounded-none">
          <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 print:bg-emerald-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600" />
                الأصول
              </CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 font-bold">
                {formatNumber(stats.totalAssets)} ر.س
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto" style={{ maxHeight: "500px" }}>
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
                    <th className="px-4 py-3 text-right text-sm font-bold w-1/2">اسم الحساب</th>
                    <th className="px-4 py-3 text-center text-sm font-bold w-1/4">الرمز</th>
                    <th className="px-4 py-3 text-left text-sm font-bold w-1/4">الصافي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {assets.length > 0 ? (
                    <>
                      {assets.map((asset, idx) => (
                        <tr key={idx} className={`hover:bg-emerald-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-emerald-50/30"}`}>
                          <td className="px-4 py-3 text-sm font-medium text-slate-700">{asset.account_name}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">{asset.account_code}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-emerald-600 tabular-nums text-left">
                            {formatNumber(asset.net_balance)} ر.س
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gradient-to-r from-emerald-100 to-emerald-50 font-bold">
                        <td colSpan={2} className="px-4 py-4 text-sm text-emerald-800 text-left">إجمالي الأصول:</td>
                        <td className="px-4 py-4 text-sm text-emerald-700 font-black tabular-nums text-left">
                          {formatNumber(stats.totalAssets)} ر.س
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Landmark className="w-12 h-12 text-emerald-200" />
                          <p className="text-slate-400 font-bold">لا توجد حسابات أصول</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl print:shadow-none print:rounded-none">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 print:bg-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                الالتزامات وحقوق الملكية
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 font-bold">
                {formatNumber(stats.totalLiabilities + stats.totalEquitiesWithIncome)} ر.س
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto" style={{ maxHeight: "500px" }}>
              <table className="w-full">
                <thead className="sticky top-0">
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="px-4 py-3 text-right text-sm font-bold w-1/2">اسم الحساب</th>
                    <th className="px-4 py-3 text-center text-sm font-bold w-1/4">الرمز</th>
                    <th className="px-4 py-3 text-left text-sm font-bold w-1/4">الصافي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {liabilities.length > 0 && (
                    <>
                      <tr className="bg-rose-50">
                        <td colSpan={3} className="px-4 py-2 text-sm font-bold text-rose-700">الالتزامات</td>
                      </tr>
                      {liabilities.map((liability, idx) => (
                        <tr key={`l-${idx}`} className={`hover:bg-rose-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-rose-50/30"}`}>
                          <td className="px-4 py-3 text-sm font-medium text-slate-700">{liability.account_name}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            <Badge variant="secondary" className="bg-rose-100 text-rose-700">{liability.account_code}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-rose-600 tabular-nums text-left">
                            {formatNumber(liability.net_balance)} ر.س
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gradient-to-r from-rose-100 to-rose-50">
                        <td colSpan={2} className="px-4 py-3 text-sm text-rose-800 text-left font-bold">إجمالي الالتزامات:</td>
                        <td className="px-4 py-3 text-sm text-rose-700 font-black tabular-nums text-left">
                          {formatNumber(stats.totalLiabilities)} ر.س
                        </td>
                      </tr>
                    </>
                  )}

                  {(equities.length > 0 || Math.abs(stats.netIncome) > 0.01) && (
                    <>
                      <tr className="bg-blue-50">
                        <td colSpan={3} className="px-4 py-2 text-sm font-bold text-blue-700">حقوق الملكية</td>
                      </tr>
                      {equities.map((equity, idx) => (
                        <tr key={`e-${idx}`} className={`hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-blue-50/30"}`}>
                          <td className="px-4 py-3 text-sm font-medium text-slate-700">{equity.account_name}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">{equity.account_code}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-blue-600 tabular-nums text-left">
                            {formatNumber(equity.net_balance)} ر.س
                          </td>
                        </tr>
                      ))}
                      {Math.abs(stats.netIncome) > 0.01 && (
                        <tr className={`hover:bg-amber-50/50 transition-colors bg-amber-50/30`}>
                          <td className="px-4 py-3 text-sm font-medium text-slate-700">
                            صافي {stats.netIncome >= 0 ? "الربح" : "الخسارة"}
                          </td>
                          <td className="px-4 py-3 text-sm text-center">
                            <Badge variant="secondary" className={stats.netIncome >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                              {stats.netIncome >= 0 ? "ربح" : "خسارة"}
                            </Badge>
                          </td>
                          <td className={`px-4 py-3 text-sm font-bold tabular-nums text-left ${stats.netIncome >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {formatNumber(Math.abs(stats.netIncome))} ر.س
                          </td>
                        </tr>
                      )}
                      <tr className="bg-gradient-to-r from-blue-100 to-blue-50">
                        <td colSpan={2} className="px-4 py-3 text-sm text-blue-800 text-left font-bold">إجمالي حقوق الملكية + صافي الدخل:</td>
                        <td className="px-4 py-3 text-sm text-blue-700 font-black tabular-nums text-left">
                          {formatNumber(stats.totalEquitiesWithIncome)} ر.س
                        </td>
                      </tr>
                    </>
                  )}

                  <tr className="bg-gradient-to-r from-slate-100 to-slate-50 font-bold">
                    <td colSpan={2} className="px-4 py-4 text-sm text-slate-800 text-left">الإجمالي (الالتزامات + حقوق الملكية):</td>
                    <td className="px-4 py-4 text-sm text-slate-700 font-black tabular-nums text-left">
                      {formatNumber(stats.totalLiabilities + stats.totalEquitiesWithIncome)} ر.س
                    </td>
                  </tr>

                  {liabilities.length === 0 && equities.length === 0 && Math.abs(stats.netIncome) < 0.01 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Scale className="w-12 h-12 text-blue-200" />
                          <p className="text-slate-400 font-bold">لا توجد حسابات التزامات أو حقوق ملكية</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={`border-none shadow-xl rounded-[2rem] overflow-hidden backdrop-blur-xl print:shadow-none print:rounded-none ${
        stats.isBalanced 
          ? "bg-gradient-to-br from-emerald-50 via-white to-blue-50" 
          : "bg-gradient-to-br from-rose-50 via-white to-red-50"
      }`}>
        <CardContent className="p-6 md:p-8">
          <div className="text-center mb-6">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              stats.isBalanced ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-rose-400 to-rose-600"
            } shadow-xl`}>
              {stats.isBalanced ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-white" />
              )}
            </div>
            <h3 className={`text-2xl font-black ${stats.isBalanced ? "text-emerald-700" : "text-rose-700"}`}>
              {stats.isBalanced ? "الميزانية متوازنة" : "الميزانية غير متوازنة"}
            </h3>
            <p className="text-slate-500 mt-2">الأصول = الالتزامات + حقوق الملكية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 rounded-2xl p-5 text-center shadow-lg border border-emerald-100">
              <p className="text-emerald-600 font-bold text-sm mb-2">الأصول</p>
              <p className="text-2xl font-black text-emerald-700 tabular-nums">{formatNumber(stats.totalAssets)}</p>
              <p className="text-emerald-500 text-xs">ر.س</p>
            </div>
            <div className="bg-white/80 rounded-2xl p-5 text-center shadow-lg border border-blue-100">
              <p className="text-blue-600 font-bold text-sm mb-2">الالتزامات + حقوق الملكية</p>
              <p className="text-2xl font-black text-blue-700 tabular-nums">{formatNumber(stats.totalLiabilities + stats.totalEquitiesWithIncome)}</p>
              <p className="text-blue-500 text-xs">ر.س</p>
            </div>
            <div className={`rounded-2xl p-5 text-center shadow-lg border ${
              stats.isBalanced 
                ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200" 
                : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
            }`}>
              <p className={`font-bold text-sm mb-2 ${stats.isBalanced ? "text-amber-600" : "text-red-600"}`}>
                الفرق
              </p>
              <p className={`text-2xl font-black tabular-nums ${stats.isBalanced ? "text-amber-700" : "text-red-700"}`}>
                {formatNumber(Math.abs(stats.difference))}
              </p>
              <p className={`text-xs ${stats.isBalanced ? "text-amber-500" : "text-red-500"}`}>ر.س</p>
            </div>
          </div>

          {!stats.isBalanced && (
            <div className="mt-6 p-4 bg-rose-100 border border-rose-300 rounded-xl text-center">
              <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
              <p className="text-rose-700 font-bold">تنبيه: هناك اختلاف في توازن الميزانية. يرجى مراجعة القيود المحاسبية.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
