"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  MoreVertical, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight, 
  ChevronLeft,
  Calendar,
  AlertTriangle,
  Umbrella,
  CheckCircle2,
  UserPlus,
  Package,
  LayoutDashboard,
  Target,
  Trophy,
DollarSign,
IdCard,
FileImage,
FileCheck,
Car,
  Sparkles,
  Download,
  Settings,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { toast } from "sonner";
import { deleteEmployee, updateIqamaExpiry, toggleEmployeeStatus } from "@/lib/actions/hr";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

const getPublicUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (path.includes('supabase')) {
    return path;
  }

  return `${process.env.NEXT_PUBLIC_APP_URL}/${cleanPath}`;
};

interface PackageViewClientProps {
  packageData: any;
  allPackages: any[];
  stats: any;
  initialEmployees: any[];
  searchQuery: string;
  activeFilter: string;
}

export function PackageViewClient({ 
  packageData, 
  allPackages, 
  stats, 
  initialEmployees,
  searchQuery,
  activeFilter
}: PackageViewClientProps) {
  const { isRTL } = useLocale();
  const t = useTranslations('packages.packageView');
  
    const [employees, setEmployees] = useState(initialEmployees);
    const [search, setSearch] = useState(searchQuery);
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    const [filter, setFilter] = useState(activeFilter);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
  
    // Update local employees when initialEmployees prop changes (from server)
    useEffect(() => {
      setEmployees(initialEmployees);
    }, [initialEmployees]);
  
    // Handle debounce
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(search);
      }, 300); // Reduced to 300ms for faster response
  
      return () => clearTimeout(timer);
    }, [search]);
  
    // Sync search and filter with URL
    useEffect(() => {
      if (!mounted) return;
      
      const trimmedSearch = debouncedSearch.trim();
      const params = new URLSearchParams();
      if (trimmedSearch) params.set('search', trimmedSearch);
      if (filter !== 'all') params.set('filter', filter);
      
      const queryStr = params.toString();
      const url = `/hr/packages/${packageData.id}${queryStr ? `?${queryStr}` : ''}`;
      
      router.replace(url, { scroll: false });
    }, [debouncedSearch, filter, packageData.id, router, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentIndex = allPackages.findIndex(p => p.id === packageData.id);
  const prevPackage = currentIndex > 0 ? allPackages[currentIndex - 1] : null;
  const nextPackage = currentIndex < allPackages.length - 1 ? allPackages[currentIndex + 1] : null;

  const handleDelete = async (id: number) => {
    if (!confirm(t('confirmDeleteEmployee'))) return;
    const result = await deleteEmployee(id);
    if (result.success) {
      toast.success(t('employeeDeleted'));
      setEmployees(prev => prev.filter(e => e.id !== id));
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdateExpiry = async (id: number, date: string) => {
    const result = await updateIqamaExpiry(id, date);
    if (result.success) {
      toast.success(t('iqamaExpiryUpdated'));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearch = search.trim();
    router.push(`/hr/packages/${packageData.id}?search=${encodeURIComponent(trimmedSearch)}&filter=${filter}`, { scroll: false });
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const getWorkTypeLabel = (workType: string) => {
    switch (workType) {
      case 'target': return t('targetSystemType');
      case 'salary': return t('salarySystemType');
      case 'commission': return t('commissionSystemType');
      default: return workType;
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col h-full space-y-4 max-w-[95%] mx-auto px-4 overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-100 rounded-[2rem]" />
        <div className="h-20 bg-gray-100 rounded-2xl" />
        <div className="flex-1 bg-gray-100 rounded-3xl" />
      </div>
    );
  }

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen pb-20 max-w-[95%] mx-auto px-4 pt-6"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Package className="text-white" size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                      <Link href="/hr" className="hover:text-white transition-colors flex items-center gap-1">
                        <LayoutDashboard size={12} />
                        {t('hrAffairs')}
                      </Link>
                      {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                      <Link href="/hr/packages" className="hover:text-white transition-colors">{t('packages')}</Link>
                      {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                      <span className="text-purple-300">{packageData.group_name}</span>
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                  <span className="text-xs font-black text-white/80">{stats.total_employees} {t('employee')}</span>
                </div>
                
                {prevPackage && (
                  <Link href={`/hr/packages/${prevPackage.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="h-10 px-4 rounded-xl bg-white/10 border border-white/10 text-xs font-black text-white hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                      {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                      {t('previous')}
                    </motion.button>
                  </Link>
                )}
                {nextPackage && (
                  <Link href={`/hr/packages/${nextPackage.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="h-10 px-4 rounded-xl bg-white/10 border border-white/10 text-xs font-black text-white hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                      {t('next')}
                      {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </motion.button>
                  </Link>
                )}
                
                <Link href={`/hr/packages/${packageData.id}/add-employees`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600 transition-all font-black text-sm shadow-lg"
                  >
                    <UserPlus size={18} />
                    {t('addEmployees')}
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <Package size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black tracking-tight text-white">{packageData.group_name}</h2>
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                      packageData.work_type === 'target' 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                        : packageData.work_type === 'salary'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {getWorkTypeLabel(packageData.work_type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Target size={14} className="text-blue-400" />
                      {t('target')}: {packageData.monthly_target}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-600" />
                    <span className="flex items-center gap-1.5">
                      <Trophy size={14} className="text-amber-400" />
                      {t('bonus')}: {packageData.bonus_after_target} {isRTL ? 'ر.س' : 'SAR'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <StatCard 
                  icon={<Users size={18} />}
                  label={t('totalEmployees')}
                  value={stats.total_employees}
                  color="purple"
                />
                <StatCard 
                  icon={<IdCard size={18} />}
                  label={t('iqamaCompletion')}
                  value={`${stats.iqama_complete}/${stats.total_employees}`}
                  color="blue"
                />
                <StatCard 
                  icon={<FileImage size={18} />}
                  label={t('photoCompletion')}
                  value={`${stats.photo_complete}/${stats.total_employees}`}
                  color="emerald"
                />
                <StatCard 
                  icon={<FileCheck size={18} />}
                  label={t('licenseCompletion')}
                  value={`${stats.license_complete}/${stats.total_employees}`}
                  color="amber"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-white/10">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-4" : "left-4")} size={18} />
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className={cn(
                    "w-full h-12 rounded-xl bg-white/10 border border-white/10 text-sm font-bold text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/30 focus:bg-white/20 outline-none transition-all",
                    isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                  )}
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {['all', 'active', 'soon', 'expired', 'on_leave'].map((f) => (
                  <motion.button
                    key={f}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFilterChange(f)}
                    className={`h-12 px-4 rounded-xl text-xs font-black transition-all ${
                      filter === f 
                        ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {f === 'all' && t('all')}
                    {f === 'active' && t('active')}
                    {f === 'soon' && t('expiringSoon')}
                    {f === 'expired' && t('expired')}
                    {f === 'on_leave' && t('onLeave')}
                  </motion.button>
                ))}
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="h-12 px-8 rounded-xl bg-white text-gray-900 text-xs font-black hover:bg-gray-100 transition-all shadow-lg"
              >
                {t('search')}
              </motion.button>
            </form>
          </div>

          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black">{t('employeesList')}</h3>
                  <p className="text-slate-400 text-xs font-bold">{employees.length} {t('employeesInList')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-9 px-4 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Download size={14} />
                  {t('export')}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50">
            <div className="overflow-auto max-h-[650px] scrollbar-hide">
              <table className={cn("w-full border-separate border-spacing-0", isRTL ? "text-right" : "text-left")}>
                <thead className="sticky top-0 z-20">
                  <tr className="bg-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('employeeCol')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('employeeCode')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('iqamaNumber')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('iqamaExpiry')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('salary')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('status')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-b border-gray-200">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {employees.map((emp, index) => (
                      <motion.tr 
                        key={emp.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`hover:bg-purple-50/30 transition-colors group bg-white ${emp.is_active === 0 ? 'bg-orange-50/30' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center text-purple-600 font-black text-sm overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                              {emp.personal_photo ? (
                                <img src={getPublicUrl(emp.personal_photo) || ""} alt="" className="h-full w-full object-cover" />
                              ) : (
                                emp.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900">{emp.name}</p>
                              <p className="text-[10px] font-bold text-gray-400">{emp.nationality || t('notSpecified')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">#{emp.user_code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-600">{emp.iqama_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input 
                              type="date"
                              defaultValue={emp.iqama_expiry ? (() => {
                                const d = new Date(emp.iqama_expiry);
                                return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : "";
                              })() : ""}
                              onChange={(e) => handleUpdateExpiry(emp.id, e.target.value)}
                              className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 cursor-pointer hover:border-purple-200 transition-all"
                            />
                            <ExpiryBadge date={emp.iqama_expiry} isRTL={isRTL} t={t} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-gray-900">{Number(emp.basic_salary).toLocaleString('en-US')} <span className="text-gray-400 text-xs">{isRTL ? 'ر.س' : 'SAR'}</span></span>
                        </td>
                        <td className="px-6 py-4">
                          {emp.is_active === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-200">
                              <CheckCircle2 size={12} />
                              {t('activeStatus')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 text-[10px] font-black uppercase border border-orange-200">
                              <Umbrella size={12} />
                              {t('onLeaveStatus')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/hr/employees/${emp.id}`}>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              >
                                <Eye size={16} />
                              </motion.button>
                            </Link>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(emp.id)}
                              className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center bg-white">
                        <div className="h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <Users size={48} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-black text-gray-400 mb-2">{t('noMatchingEmployees')}</p>
                        <p className="text-sm font-bold text-gray-300">{t('tryDifferentSearch')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-600 px-6 py-4">
            <div className="flex items-center justify-between text-xs font-bold text-white/70">
              <span>{t('totalEmployeesFooter')}: {employees.length}</span>
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-purple-400" />
                <span>{t('package')} {packageData.group_name}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-purple-500" />
            <span>{t('systemManagement')}</span>
          </div>
          <span>{t('allRightsReserved')} © {new Date().getFullYear()}</span>
        </div>
      </motion.div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-300',
    blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300',
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
    amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md border rounded-xl px-4 py-3 min-w-[120px]`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="opacity-70">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <span className="text-lg font-black text-white">{value}</span>
    </div>
  );
}

function ExpiryBadge({ date, isRTL, t }: { date: string; isRTL: boolean; t: (key: string) => string }) {
  if (!date) return <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{t('notSpecified')}</span>;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  const days = Math.round((d.getTime() - new Date().getTime()) / 86400000);
  
  if (days <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-black border border-red-200">
        <AlertTriangle size={12} />
        {t('expiryExpired')}
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black border border-orange-200">
        <AlertTriangle size={12} />
        {days} {t('expiryDays')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-200">
      <CheckCircle2 size={12} />
      {t('expiryValid')}
    </span>
  );
}
