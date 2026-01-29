"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Search, 
  Printer, 
  Download, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  LayoutDashboard,
  Filter,
  RefreshCw,
  Eye,
  Users,
  Clock,
  Shield,
  XCircle,
  TrendingUp,
  BarChart3,
  FileSpreadsheet,
  ChevronDown,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "@/lib/locale-context";

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
  const tCommon = useTranslations("common");
  const tHr = useTranslations("hr");
  const tNav = useTranslations("navigation");
  const { locale, isRTL } = useLocale();
  const dateLocale = locale === "ar" ? ar : enUS;

  const [search, setSearch] = useState(searchQuery);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);

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

  const getStatusInfo = (days: number) => {
    if (days < 0) return { status: 'expired', label: tHr("packageView.expired"), color: 'red' };
    if (days <= 30) return { status: 'soon', label: tHr("packageView.expiringSoon"), color: 'orange' };
    return { status: 'active', label: tCommon("active"), color: 'green' };
  };

  const expiredPercent = stats.total > 0 ? Math.round((stats.expired / stats.total) * 100) : 0;
  const soonPercent = stats.total > 0 ? Math.round((stats.soon / stats.total) * 100) : 0;
  const activePercent = stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-[1800px] mx-auto px-4 pt-6 space-y-6 print:p-0 print:max-w-full print:space-y-4">
          
          {/* Breadcrumb & Actions Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <FileText className="text-white" size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Link href="/hr" className="hover:text-purple-600 transition-colors flex items-center gap-1">
                    <LayoutDashboard size={12} />
                    {tNav("hr")}
                  </Link>
                  <ArrowRight size={12} className={isRTL ? "rotate-180" : ""} />
                  <span className="text-purple-600">{tHr("iqamaReport")}</span>
                </div>
                <h1 className="text-xl font-black text-gray-900">{tHr("iqamaReport")}</h1>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 flex-wrap"
            >
              <button 
                onClick={() => router.refresh()}
                className="h-11 px-4 rounded-xl bg-white border border-gray-200 text-xs font-black text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <RefreshCw size={15} />
                {tCommon("update")}
              </button>
              
              <button 
                onClick={handlePrint}
                className="h-11 px-5 rounded-xl bg-white border border-gray-200 text-xs font-black text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all flex items-center gap-2 shadow-sm"
              >
                <Printer size={15} />
                {tCommon("print")}
              </button>

              <div className="relative">
                <button 
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40 transition-all flex items-center gap-2"
                >
                  <Download size={15} />
                  {tCommon("export")}
                  <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 bg-white rounded-xl border border-gray-100 shadow-xl p-2 min-w-[160px] z-50`}
                    >
                      <button className={`w-full px-4 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <FileText size={14} />
                        {tCommon("export")} PDF
                      </button>
                      <button className={`w-full px-4 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <FileSpreadsheet size={14} />
                        {tCommon("export")} Excel
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Print Header - Only visible when printing */}
          <div className="hidden print:block mb-8">
            <div className={`flex items-center justify-between border-b-4 border-purple-600 pb-4 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="flex items-center gap-4">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="h-16 w-16 object-contain" />
                ) : (
                  <div className="h-16 w-16 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FileText size={28} className="text-purple-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black text-gray-900">{tHr("iqamaReport")}</h1>
                  <p className="text-sm font-bold text-gray-500">{company.name}</p>
                </div>
              </div>
              <div className={isRTL ? 'text-left' : 'text-right'}>
                <p className="text-xs font-bold text-gray-400">{tCommon("date")}</p>
                <p className="text-sm font-black text-gray-900">{format(new Date(), 'yyyy/MM/dd', { locale: dateLocale })}</p>
                <p className="text-xs text-gray-500">{format(new Date(), 'HH:mm', { locale: dateLocale })}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <StatCard 
                icon={<Users size={22} />}
                label={tHr("totalEmployees")}
                value={stats.total}
                gradient="from-slate-600 to-slate-800"
                shadowColor="slate"
                trend={null}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatCard 
                icon={<XCircle size={22} />}
                label={tHr("expiredIqama")}
                value={stats.expired}
                gradient="from-red-500 to-rose-600"
                shadowColor="red"
                trend={`${expiredPercent}%`}
                trendColor="text-red-100"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <StatCard 
                icon={<Clock size={22} />}
                label={tCommon("remainingTime")}
                value={stats.soon}
                gradient="from-amber-500 to-orange-600"
                shadowColor="amber"
                trend={`${soonPercent}%`}
                trendColor="text-amber-100"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <StatCard 
                icon={<Shield size={22} />}
                label={tCommon("active")}
                value={stats.active}
                gradient="from-emerald-500 to-green-600"
                shadowColor="emerald"
                trend={`${activePercent}%`}
                trendColor="text-emerald-100"
              />
            </motion.div>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm print:hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-gray-500">{tHr("iqamaReportDesc")}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-[10px] font-bold text-gray-500">{tHr("packageView.expired")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-[10px] font-bold text-gray-500">{tHr("packageView.expiringSoon")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-gray-500">{tCommon("active")}</span>
                </div>
              </div>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
              {stats.expired > 0 && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${expiredPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="h-full bg-gradient-to-r from-red-500 to-rose-500"
                />
              )}
              {stats.soon > 0 && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${soonPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                />
              )}
              {stats.active > 0 && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${activePercent}%` }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                />
              )}
            </div>
          </motion.div>

          {/* Search & Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm print:hidden"
          >
            <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={tHr("tasksPage.searchPlaceholder")}
                  className={`w-full h-12 ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} rounded-xl bg-gray-50 border-2 border-transparent text-sm font-bold focus:border-purple-500/30 focus:bg-white outline-none transition-all placeholder:text-gray-400`}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  <FilterButton 
                    active={activeFilter === 'all'} 
                    label={tCommon("all")} 
                    count={stats.total}
                    onClick={() => handleFilterChange('all')}
                    color="gray"
                  />
                  <FilterButton 
                    active={activeFilter === 'expired'} 
                    label={tHr("packageView.expired")} 
                    count={stats.expired}
                    onClick={() => handleFilterChange('expired')}
                    color="red"
                  />
                  <FilterButton 
                    active={activeFilter === 'soon'} 
                    label={tHr("packageView.expiringSoon")} 
                    count={stats.soon}
                    onClick={() => handleFilterChange('soon')}
                    color="amber"
                  />
                  <FilterButton 
                    active={activeFilter === 'active'} 
                    label={tCommon("active")} 
                    count={stats.active}
                    onClick={() => handleFilterChange('active')}
                    color="green"
                  />
                </div>

                <button type="submit" className="h-12 px-6 rounded-xl bg-gray-900 text-white text-sm font-black hover:bg-gray-800 transition-all flex items-center gap-2">
                  <Filter size={16} />
                  {tCommon("filter")}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            ref={reportRef}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:border print:border-gray-300 print:shadow-none print:rounded-none"
          >
            {/* Table Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 print:bg-purple-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <BarChart3 className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-black">{tHr("iqamaDataTitle")}</h3>
                    <p className="text-purple-200 text-xs font-bold">
                      {isRTL ? 'عرض' : 'Showing'} {iqamaData.length} {isRTL ? 'سجل من أصل' : 'records out of'} {stats.total}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-white/80 text-xs font-bold">
                  <Eye size={14} />
                  {activeFilter === 'all' ? tCommon("all") : 
                   activeFilter === 'expired' ? tHr("packageView.expired") :
                   activeFilter === 'soon' ? tHr("packageView.expiringSoon") : tCommon("active")}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}>
                  <thead>
                    <tr className="bg-gray-900 border-b border-gray-800 text-white">
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider w-12 text-center">#</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider">{tCommon("employee")}</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider w-32">{tCommon("iqamaNumber")}</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider w-32">{tCommon("package")}</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider w-32">{tCommon("expiryDate")}</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider w-32">{tCommon("remainingTime")}</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-center w-28">{tCommon("status")}</th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-gray-50">
                  {iqamaData.map((item, idx) => {
                    const statusInfo = getStatusInfo(item.days_remaining);
                    return (
                      <motion.tr 
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * idx }}
                        className="hover:bg-purple-50/30 transition-colors group print:hover:bg-transparent"
                      >
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-xs font-black text-gray-500 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/hr/employees/${item.id}`} className="block group/link">
                            <span className="text-sm font-black text-gray-900 group-hover/link:text-purple-600 transition-colors">
                              {item.name}
                            </span>
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5 flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                              {item.user_code}
                            </p>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-700 font-mono tracking-wider">
                            {item.iqama_number || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-bold text-gray-600">
                            {item.group_name || tCommon("notSpecified")}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-sm font-black text-gray-900">
                              {item.iqama_expiry || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <DaysRemaining days={item.days_remaining} tHr={tHr} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <StatusBadge status={statusInfo.status} label={statusInfo.label} />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {iqamaData.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                            <Search size={28} className="text-gray-300" />
                          </div>
                          <p className="text-gray-400 font-bold">{tCommon("noData")}</p>
                          <button 
                            onClick={() => handleFilterChange('all')}
                            className="text-purple-600 text-sm font-black hover:underline"
                          >
                            {tCommon("viewAll")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            {iqamaData.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 print:bg-gray-100">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                  <span>{tCommon("total")}: {iqamaData.length}</span>
                  <span>{tCommon("date")}: {format(new Date(), 'yyyy/MM/dd - HH:mm', { locale: dateLocale })}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4 print:pt-8 print:border-t print:border-gray-300">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-purple-500" />
              <span>{tHr("packageView.systemManagement")}</span>
            </div>
            <span>{tHr("packageView.allRightsReserved")} © {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body { 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print { display: none !important; }
            @page { 
              size: A4 landscape; 
              margin: 1cm; 
            }
          }
        `}</style>
      </div>
    );
  }

  // ... (StatCard, FilterButton, DaysRemaining, StatusBadge)


function StatCard({ icon, label, value, gradient, shadowColor, trend, trendColor }: any) {
  const shadowColors: any = {
    slate: 'shadow-slate-500/20',
    red: 'shadow-red-500/30',
    amber: 'shadow-amber-500/30',
    emerald: 'shadow-emerald-500/30'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg ${shadowColors[shadowColor]} print:shadow-none print:border print:border-gray-200`}>
      <div className="flex items-start justify-between">
        <div className="text-white/90">{icon}</div>
        {trend && (
          <span className={`text-[10px] font-black ${trendColor || 'text-white/70'} bg-white/10 px-2 py-0.5 rounded-full`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-white mt-1">{value}</p>
      </div>
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );
}

function FilterButton({ active, label, count, onClick, color }: any) {
  const activeColors: any = {
    gray: 'bg-gray-900 text-white',
    red: 'bg-red-500 text-white',
    amber: 'bg-amber-500 text-white',
    green: 'bg-emerald-500 text-white'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
        active 
        ? activeColors[color]
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
        active ? 'bg-white/20' : 'bg-gray-200 text-gray-500'
      }`}>
        {count}
      </span>
    </button>
  );
}

function DaysRemaining({ days, tHr }: { days: number, tHr: any }) {
  if (days < 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <span className="text-sm font-black text-red-600">
          {tHr("expiredSinceCount", { days: Math.abs(days) })}
        </span>
      </div>
    );
  }
  
  if (days <= 30) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
        <span className="text-sm font-black text-amber-600">
          {tHr("daysRemainingCount", { days })}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      <span className="text-sm font-black text-emerald-600">
        {tHr("daysRemainingCount", { days })}
      </span>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const configs: any = {
    expired: {
      bg: 'bg-gradient-to-r from-red-500 to-rose-500',
      icon: <AlertTriangle size={12} className="animate-pulse" />,
      shadow: 'shadow-red-500/30'
    },
    soon: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      icon: <Clock size={12} />,
      shadow: 'shadow-amber-500/30'
    },
    active: {
      bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
      icon: <CheckCircle2 size={12} />,
      shadow: 'shadow-emerald-500/30'
    }
  };

  const config = configs[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} text-white text-[10px] font-black uppercase shadow-lg ${config.shadow} print:shadow-none`}>
      {config.icon}
      {label}
    </span>
  );
}
