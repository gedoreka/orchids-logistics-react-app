"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Scale, 
  Printer, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface BalanceSheetClientProps {
  assets: any[];
  liabilities: any[];
  equities: any[];
  netIncome: number;
  companyName: string;
  fromDate: string;
  toDate: string;
}

export function BalanceSheetClient({ 
  assets, 
  liabilities, 
  equities, 
  netIncome, 
  companyName,
  fromDate,
  toDate
}: BalanceSheetClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateDateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const calculateTotal = (list: any[]) => {
    return list.reduce((sum, item) => sum + Math.abs(Number(item.net_balance)), 0);
  };

  const totalAssets = calculateTotal(assets);
  const totalLiabilities = calculateTotal(liabilities);
  const totalEquities = calculateTotal(equities);
  const totalEquitiesWithIncome = totalEquities + netIncome;

  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquitiesWithIncome)) < 0.01;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-20 print:p-0 print:bg-white">
      {/* Header - Hidden in Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#2c3e50] to-[#34495e] flex items-center justify-center text-white shadow-lg shadow-black/10">
            <Scale size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">الميزانية العمومية</h1>
            <p className="text-gray-500 font-bold mt-1">تقرير المركز المالي للمنشأة</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-700 px-6 py-3 rounded-2xl font-black shadow-sm hover:border-[#3498db] hover:text-[#3498db] transition-all"
          >
            <Printer size={20} />
            <span>طباعة التقرير</span>
          </button>
        </div>
      </div>

      {/* Date Filters - Hidden in Print */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border-2 border-gray-100 p-8 shadow-xl flex flex-col md:flex-row gap-6 items-center print:hidden">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-2">
              <Calendar size={12} />
              من تاريخ
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => updateDateFilter("from_date", e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:border-[#3498db]/30 focus:ring-4 focus:ring-[#3498db]/5 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-2">
              <Calendar size={12} />
              إلى تاريخ
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => updateDateFilter("to_date", e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:border-[#3498db]/30 focus:ring-4 focus:ring-[#3498db]/5 outline-none transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="bg-gray-100 p-4 rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-gray-400">
            <Filter size={18} />
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">الشركة</span>
            <span className="font-black text-gray-900 text-sm">{companyName}</span>
          </div>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block text-center border-b-4 border-black pb-8 mb-8">
        <h1 className="text-4xl font-black mb-2">{companyName}</h1>
        <h2 className="text-2xl font-black text-gray-600">تقرير الميزانية العمومية</h2>
        <p className="text-lg font-bold text-gray-500 mt-2">للفترة من {fromDate} إلى {toDate}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <TrendingUp size={80} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">إجمالي الأصول</span>
          <div className="text-3xl font-black text-green-600 tracking-tighter">
            {totalAssets.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} <span className="text-sm font-black opacity-60">ريال</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2.5rem] p-8 border-2 border-gray-100 shadow-sm relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <TrendingDown size={80} />
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">الالتزامات + حقوق الملكية</span>
          <div className="text-3xl font-black text-blue-600 tracking-tighter">
            {(totalLiabilities + totalEquitiesWithIncome).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} <span className="text-sm font-black opacity-60">ريال</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-[2.5rem] p-8 border-2 shadow-sm relative overflow-hidden",
            isBalanced ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
          )}
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            {isBalanced ? <CheckCircle2 size={80} /> : <AlertTriangle size={80} />}
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest block mb-2",
            isBalanced ? "text-green-600" : "text-red-600"
          )}>حالة التوازن</span>
          <div className={cn(
            "text-3xl font-black tracking-tighter",
            isBalanced ? "text-green-700" : "text-red-700"
          )}>
            {isBalanced ? "متوازنة" : "غير متوازنة"}
          </div>
          <div className="text-xs font-bold mt-2 opacity-60">
            الفرق: {(totalAssets - (totalLiabilities + totalEquitiesWithIncome)).toFixed(2)} ريال
          </div>
        </motion.div>
      </div>

      {/* Main Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start print:grid-cols-2 print:gap-4">
        {/* Assets Table */}
        <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-xl overflow-hidden print:shadow-none print:border-black">
          <div className="bg-[#2ecc71] p-6 text-white flex items-center justify-between">
            <h3 className="text-xl font-black flex items-center gap-3">
              <TrendingUp size={24} />
              الأصول
            </h3>
            <span className="px-4 py-1.5 rounded-full bg-white/20 font-black text-xs uppercase">Assets</span>
          </div>
          <div className="p-2 overflow-x-auto">
            <table className="w-full text-right border-separate border-spacing-y-2">
              <thead>
                <tr>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">الحساب</th>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">الرمز</th>
                  <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">الصافي (ريال)</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((item, i) => (
                  <tr key={i} className="group hover:bg-gray-50 transition-colors">
                    <td className="p-4 bg-gray-50/50 rounded-r-2xl font-black text-gray-700 group-hover:bg-gray-100 transition-colors">{item.account_name}</td>
                    <td className="p-4 bg-gray-50/50 text-center font-bold text-gray-400 group-hover:bg-gray-100 transition-colors">
                      <span className="px-2 py-1 rounded-lg bg-white border border-gray-100">{item.account_code}</span>
                    </td>
                    <td className="p-4 bg-gray-50/50 rounded-l-2xl text-left font-black text-gray-900 group-hover:bg-gray-100 transition-colors">
                      {Math.abs(Number(item.net_balance)).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {assets.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-gray-400 font-bold italic">لا توجد حركات مسجلة</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="p-6 text-xl font-black text-gray-900">إجمالي الأصول</td>
                  <td className="p-6 text-xl font-black text-green-600 text-left border-t-2 border-green-100">
                    {totalAssets.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Liabilities & Equity Table */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-xl overflow-hidden print:shadow-none print:border-black">
            <div className="bg-[#3498db] p-6 text-white flex items-center justify-between">
              <h3 className="text-xl font-black flex items-center gap-3">
                <ArrowRightLeft size={24} />
                الالتزامات وحقوق الملكية
              </h3>
              <span className="px-4 py-1.5 rounded-full bg-white/20 font-black text-xs uppercase">Liabilities & Equity</span>
            </div>
            <div className="p-2 overflow-x-auto">
              <table className="w-full text-right border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest">الحساب</th>
                    <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">الرمز</th>
                    <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-left">الصافي (ريال)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Liabilities */}
                  {liabilities.map((item, i) => (
                    <tr key={`l-${i}`} className="group hover:bg-gray-50 transition-colors">
                      <td className="p-4 bg-red-50/20 rounded-r-2xl font-black text-gray-700 group-hover:bg-red-50 transition-colors">{item.account_name}</td>
                      <td className="p-4 bg-red-50/20 text-center font-bold text-gray-400 group-hover:bg-red-50 transition-colors">
                        <span className="px-2 py-1 rounded-lg bg-white border border-gray-100">{item.account_code}</span>
                      </td>
                      <td className="p-4 bg-red-50/20 rounded-l-2xl text-left font-black text-red-600 group-hover:bg-red-50 transition-colors">
                        {Math.abs(Number(item.net_balance)).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {/* Equities */}
                  {equities.map((item, i) => (
                    <tr key={`e-${i}`} className="group hover:bg-gray-50 transition-colors">
                      <td className="p-4 bg-blue-50/20 rounded-r-2xl font-black text-gray-700 group-hover:bg-blue-50 transition-colors">{item.account_name}</td>
                      <td className="p-4 bg-blue-50/20 text-center font-bold text-gray-400 group-hover:bg-blue-50 transition-colors">
                        <span className="px-2 py-1 rounded-lg bg-white border border-gray-100">{item.account_code}</span>
                      </td>
                      <td className="p-4 bg-blue-50/20 rounded-l-2xl text-left font-black text-blue-600 group-hover:bg-blue-50 transition-colors">
                        {Math.abs(Number(item.net_balance)).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {/* Net Income */}
                  {Math.abs(netIncome) > 0.01 && (
                    <tr className="group">
                      <td className="p-4 bg-purple-50 rounded-r-2xl font-black text-gray-900 border-r-4 border-purple-500">
                        صافي {netIncome >= 0 ? "الربح" : "الخسارة"} للفترة
                      </td>
                      <td className="p-4 bg-purple-50 text-center font-bold text-gray-400 italic">Retained Earnings</td>
                      <td className={cn(
                        "p-4 bg-purple-50 rounded-l-2xl text-left font-black",
                        netIncome >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {Math.abs(netIncome).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="p-6 text-xl font-black text-gray-900">إجمالي الالتزامات وحقوق الملكية</td>
                    <td className="p-6 text-xl font-black text-blue-600 text-left border-t-2 border-blue-100">
                      {(totalLiabilities + totalEquitiesWithIncome).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding - Only in Print */}
      <div className="hidden print:flex justify-between items-center mt-20 pt-8 border-t border-gray-200">
        <div className="text-gray-400 text-sm font-black uppercase tracking-widest">
          Generated by ZOOL SYSTEM PRO
        </div>
        <div className="text-gray-400 text-sm font-black">
          {new Date().toLocaleString('ar-SA')}
        </div>
      </div>
    </div>
  );
}
