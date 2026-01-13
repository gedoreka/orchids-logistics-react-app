"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Search, 
  Printer, 
  Download, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useRouter } from "next/navigation";

interface IqamaReportClientProps {
  company: any;
  iqamaData: any[];
  stats: {
    total: number;
    expired: number;
    soon: number;
    active: number;
  };
  activeFilter: string;
  searchQuery: string;
}

export function IqamaReportClient({ 
  company, 
  iqamaData, 
  stats, 
  activeFilter,
  searchQuery
}: IqamaReportClientProps) {
  const [search, setSearch] = useState(searchQuery);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/hr/reports/iqama?search=${search}&filter=${activeFilter}`);
  };

  const handleFilterChange = (filter: string) => {
    router.push(`/hr/reports/iqama?search=${search}&filter=${filter}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1800px] mx-auto px-4 print:p-0 print:max-w-full">
      
      {/* Header & Navigation - Hidden on print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <Link href="/hr" className="hover:text-[#9b59b6] transition-colors flex items-center gap-1">
            <LayoutDashboard size={14} />
            شؤون الموظفين
          </Link>
          <ArrowRight size={14} />
          <span className="text-[#9b59b6]">تقرير الإقامات</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="h-10 px-5 rounded-xl bg-white border border-gray-100 text-xs font-black text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all flex items-center gap-2 shadow-sm"
          >
            <Printer size={16} />
            طباعة التقرير
          </button>
          <button className="h-10 px-5 rounded-xl bg-gray-900 text-white text-xs font-black shadow-lg shadow-gray-900/20 hover:bg-black transition-all flex items-center gap-2">
            <Download size={16} />
            تصدير PDF
          </button>
        </div>
      </div>

      {/* Report Header - Visible on print */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
          <div className="h-24 w-24 rounded-[2rem] bg-gray-50 p-2 border border-gray-100 shadow-inner flex items-center justify-center">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="h-full w-full object-contain" />
            ) : (
              <FileText size={40} className="text-gray-200" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">تقرير صلاحية الإقامات</h1>
            <p className="text-gray-500 font-bold text-sm">شركة {company.name}</p>
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
              بتاريخ: {format(new Date(), 'yyyy-MM-dd HH:mm', { locale: ar })}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <ReportStat label="إجمالي الإقامات" value={stats.total} color="gray" />
            <ReportStat label="منتهية" value={stats.expired} color="red" />
            <ReportStat label="تنتهي قريباً" value={stats.soon} color="orange" />
            <ReportStat label="سارية" value={stats.active} color="green" />
          </div>
        </div>
      </div>

      {/* Search & Filter - Hidden on print */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm print:hidden">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم، رقم الإقامة..."
              className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border-2 border-gray-50 text-sm font-bold focus:border-[#9b59b6]/30 focus:bg-white outline-none transition-all"
            />
          </div>
          
          <div className="flex bg-gray-50 p-1 rounded-xl gap-1">
            <FilterTab active={activeFilter === 'expired'} label="منتهية" onClick={() => handleFilterChange('expired')} />
            <FilterTab active={activeFilter === 'soon'} label="قريباً" onClick={() => handleFilterChange('soon')} />
            <FilterTab active={activeFilter === 'active'} label="سارية" onClick={() => handleFilterChange('active')} />
            <FilterTab active={activeFilter === 'all'} label="الكل" onClick={() => handleFilterChange('all')} />
          </div>

          <button type="submit" className="h-12 px-8 rounded-xl bg-gray-900 text-white text-sm font-black hover:bg-gray-800 transition-all">
            تطبيق
          </button>
        </form>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 print:bg-gray-100">
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest w-12">#</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">الموظف</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم الإقامة</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">الباقة</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ الانتهاء</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">المتبقي</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {iqamaData.map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors print:hover:bg-transparent">
                <td className="px-6 py-4 text-xs font-bold text-gray-400">{idx + 1}</td>
                <td className="px-6 py-4">
                  <Link href={`/hr/employees/${item.id}`} className="text-sm font-black text-gray-900 hover:text-[#9b59b6] transition-colors">
                    {item.name}
                  </Link>
                  <p className="text-[10px] font-bold text-gray-400 mt-0.5">#{item.user_code}</p>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-600">{item.iqama_number}</td>
                <td className="px-6 py-4 text-xs font-bold text-gray-500">{item.group_name}</td>
                <td className="px-6 py-4 text-sm font-black text-gray-900">{item.iqama_expiry}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-black ${
                    item.days_remaining < 0 ? 'text-red-600' : 
                    item.days_remaining <= 30 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {item.days_remaining < 0 
                      ? `منتهية منذ ${Math.abs(item.days_remaining)} يوم` 
                      : `متبقي ${item.days_remaining} يوم`}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {item.days_remaining < 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase">
                        <AlertTriangle size={12} className="animate-pulse" />
                        منتهية
                      </span>
                    ) : item.days_remaining <= 30 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase">
                        <Calendar size={12} />
                        تجديد عاجل
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase">
                        <CheckCircle2 size={12} />
                        سارية
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {iqamaData.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-gray-400 font-bold">لا توجد بيانات تطابق البحث الحالي</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Report Footer */}
      <div className="flex justify-between items-center text-[10px] font-black text-gray-300 uppercase tracking-widest pt-4">
        <span>إصدار آلي من نظام Logistics Systems Pro</span>
        <span>صفحة 1 من 1</span>
      </div>
    </div>
  );
}

function ReportStat({ label, value, color }: any) {
  const colors: any = {
    gray: "bg-gray-50 text-gray-900 border-gray-100",
    red: "bg-red-50 text-red-600 border-red-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    green: "bg-green-50 text-green-600 border-green-100"
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]} text-center min-w-[120px]`}>
      <p className="text-[9px] font-black uppercase tracking-wider opacity-60 mb-1">{label}</p>
      <div className="text-xl font-black">{value}</div>
    </div>
  );
}

function FilterTab({ active, label, onClick }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
        active 
        ? 'bg-white text-gray-900 shadow-sm' 
        : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      {label}
    </button>
  );
}
