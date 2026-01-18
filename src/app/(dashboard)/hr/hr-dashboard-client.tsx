"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Package, 
  Umbrella, 
  IdCard, 
  PlusCircle, 
  UserPlus, 
  FileText, 
  Search, 
  History, 
  Bolt,
  ChevronRight,
  Target,
  Trophy,
  AlertTriangle,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  BadgeCheck,
  TrendingUp,
  Calendar,
  Shield,
  Building2,
  Clock,
  CheckCircle2,
  Activity,
  Mail,
  FileSignature
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useLocale, useTranslations } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

interface HRDashboardClientProps {
  stats: {
    totalEmployees: number;
    totalPackages: number;
    onLeave: number;
    expiredIqama: number;
    completionRate: number;
  };
  activePackages: any[];
  recentEmployees: any[];
  companyName: string;
  mostUsedPackageId: number | null;
}

export function HRDashboardClient({ stats, activePackages, recentEmployees, companyName, mostUsedPackageId }: HRDashboardClientProps) {
  const { isRTL, locale } = useLocale();
  const t = useTranslations('hr');
  const tCommon = useTranslations('common');

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

  return (
    <div className="min-h-screen pb-20 bg-gray-50/50" dir={isRTL ? "rtl" : "ltr"}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[95%] mx-auto px-4 pt-6 space-y-6"
      >
        {/* Simplified Compact Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1">
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <LayoutDashboard size={12} />
                {isRTL ? 'لوحة التحكم' : 'Dashboard'}
              </Link>
              <ArrowRight size={12} className={isRTL ? 'rotate-180' : ''} />
              <span className="text-blue-600">{isRTL ? 'الموارد البشرية' : 'HR'}</span>
            </div>
            <h1 className="text-xl font-black text-gray-900">{t('employeesSystem')}</h1>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs font-black text-blue-700">{companyName}</span>
            </div>
            <Link href="/hr/packages">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all font-black text-sm shadow-lg shadow-blue-500/30"
              >
                <PlusCircle size={18} />
                {isRTL ? 'إضافة باقة جديدة' : 'New Package'}
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <Link href="/hr/packages">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-5 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="text-white/90"><Users size={22} /></div>
                  <span className="text-[10px] font-black text-white/70 bg-white/10 px-2 py-0.5 rounded-full">{stats.completionRate}% {isRTL ? 'نشط' : 'Active'}</span>
                </div>
                <div className="mt-4">
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">{t('totalEmployees')}</p>
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="text-3xl font-black text-white mt-1"
                  >
                    {stats.totalEmployees}
                  </motion.p>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mt-3">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.completionRate}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="h-full bg-white/60 rounded-full"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/hr/packages">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="text-white/90"><Package size={22} /></div>
                  <span className="text-[10px] font-black text-white/90 bg-white/20 px-2 py-0.5 rounded-full">{isRTL ? 'باقات' : 'Packages'}</span>
                </div>
                <div className="mt-4">
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">{t('totalPackages')}</p>
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="text-3xl font-black text-white mt-1"
                  >
                    {stats.totalPackages}
                  </motion.p>
                  <p className="text-white/60 text-[10px] font-bold mt-1">{isRTL ? 'مجموعات العمل' : 'Work Groups'}</p>
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/hr/reports/iqama?filter=on_leave">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="text-white/90"><Umbrella size={22} /></div>
                  <span className="text-[10px] font-black text-white/90 bg-white/20 px-2 py-0.5 rounded-full">{isRTL ? 'إجازة' : 'Leave'}</span>
                </div>
                <div className="mt-4">
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">{t('onLeave')}</p>
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="text-3xl font-black text-white mt-1"
                  >
                    {stats.onLeave}
                  </motion.p>
                  <p className="text-white/60 text-[10px] font-bold mt-1">{isRTL ? 'موظف خارج العمل' : 'Employees off'}</p>
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/hr/reports/iqama?filter=expired">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-5 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="text-white/90"><IdCard size={22} /></div>
                  {stats.expiredIqama > 0 && (
                    <span className="text-[10px] font-black text-white bg-white/20 px-2 py-0.5 rounded-full animate-pulse">{isRTL ? 'تنبيه' : 'Alert'}</span>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">{t('expiredIqama')}</p>
                  <motion.p 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="text-3xl font-black text-white mt-1"
                  >
                    {stats.expiredIqama}
                  </motion.p>
                  <p className="text-white/60 text-[10px] font-bold mt-1">{isRTL ? 'إقامة منتهية' : 'Expired Iqama'}</p>
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Actions & Packages */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div variants={itemVariants}>
                <Link href="/hr/packages">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all h-full flex flex-col relative overflow-hidden group">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                      <Package size={28} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-black text-gray-900">{t('packagesManagement')}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[8px] font-black uppercase">
                        {t('startHere')}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed">{t('packagesManagementDesc')}</p>
                    <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-6 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <ChevronRight className={`text-blue-300 ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Link href={mostUsedPackageId ? `/hr/packages/${mostUsedPackageId}` : "/hr/packages"}>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all h-full flex flex-col relative overflow-hidden group">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                      <Users size={28} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-black text-gray-900">{t('employeesManagement')}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase">
                        {stats.totalEmployees} {isRTL ? 'موظف' : 'employees'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed">{t('employeesManagementDesc')}</p>
                    <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-6 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <ChevronRight className={`text-emerald-300 ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Link href="/hr/reports/iqama">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all h-full flex flex-col relative overflow-hidden group">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                      <FileText size={28} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-black text-gray-900">{t('iqamaReport')}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[8px] font-black uppercase">
                        {stats.expiredIqama} {isRTL ? 'منتهية' : 'expired'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed">{t('iqamaReportDesc')}</p>
                    <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-6 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <ChevronRight className={`text-purple-300 ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Link href="/hr/tasks">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all h-full flex flex-col relative overflow-hidden group">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                      <Bolt size={28} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-black text-gray-900">{t('tasksManagement')}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[8px] font-black uppercase">
                        {isRTL ? 'نظام متكامل' : 'Integrated System'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed">{t('tasksManagementDesc')}</p>
                    <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-6 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <ChevronRight className={`text-orange-300 ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link href="/letters">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all h-full flex flex-col relative overflow-hidden group">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                      <FileSignature size={28} />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-black text-gray-900">{isRTL ? 'الخطابات الجاهزة' : 'Letter Templates'}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase">
                        {isRTL ? 'احترافي' : 'Professional'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed">{isRTL ? 'إنشاء وطباعة خطابات رسمية جاهزة للموظفين مثل شهادات الراتب وخطابات العمل' : 'Create and print official letters for employees such as salary certificates and work letters'}</p>
                    <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-6 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <ChevronRight className={`text-indigo-300 ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
            
            {/* Active Packages List */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Package className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-black">{t('activePackages')}</h3>
                    <p className="text-gray-400 text-[10px] font-bold">{activePackages.length} {isRTL ? 'باقة نشطة' : 'active packages'}</p>
                  </div>
                </div>
                <Link href="/hr/packages" className="text-xs font-black text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                  {tCommon('viewAll')}
                  <ArrowRight size={14} className={isRTL ? 'rotate-180' : ''} />
                </Link>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {activePackages.map((pkg, index) => (
                    <Link key={pkg.id} href={`/hr/packages/${pkg.id}`}>
                      <div className="group p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all border border-gray-100">
                            <Package size={20} />
                          </div>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black uppercase border shadow-sm",
                            pkg.work_type === 'salary' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                              : 'bg-amber-50 text-amber-600 border-amber-100'
                          )}>
                            {pkg.work_type === 'salary' ? t('salaryType') : t('targetType')}
                          </span>
                        </div>
                        <h4 className="font-black text-gray-900 text-sm mb-2">{pkg.group_name}</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-100 text-[10px] font-black text-gray-700">
                            <Target size={12} className="text-blue-500" />
                            {pkg.monthly_target}
                          </div>
                          <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 text-[10px] font-black text-amber-700">
                            <Trophy size={12} />
                            {pkg.bonus_after_target} {isRTL ? 'ر.س' : 'SAR'}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                <Link href="/hr/packages" className="mt-4 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 font-black text-xs hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                  <PlusCircle size={18} />
                  <span>{t('createNewPackage')}</span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Activity & Tools */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="bg-blue-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/10">
                    <History className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-black">{t('recentActivity')}</h3>
                    <p className="text-blue-100 text-[10px] font-bold">{isRTL ? 'آخر التحديثات' : 'Latest updates'}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {recentEmployees.map((emp, idx) => (
                  <div key={emp.id} className="flex gap-3 items-start relative group">
                    {idx !== recentEmployees.length - 1 && (
                      <div className={cn(
                        "absolute top-10 bottom-0 w-0.5 bg-gray-100 group-hover:bg-blue-100 transition-colors",
                        isRTL ? 'right-5' : 'left-5'
                      )} />
                    )}
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 z-10 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm border border-blue-100">
                      <UserPlus size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-gray-800 truncate">{t('newEmployeeAdded')}</p>
                      <p className="text-[10px] font-bold text-gray-500 mt-0.5 truncate">{emp.name} - {emp.group_name || t('withoutPackage')}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar size={10} className="text-gray-300" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">
                          {format(new Date(emp.created_at), 'yyyy-MM-dd HH:mm', { locale: isRTL ? ar : enUS })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {recentEmployees.length === 0 && (
                  <div className="py-8 text-center">
                    <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto border border-gray-100 shadow-inner mb-3">
                      <History size={24} className="text-gray-300" />
                    </div>
                    <p className="text-xs font-black text-gray-400">{t('noRecentActivity')}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Tools */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Bolt className="text-orange-600" size={16} />
                </div>
                <h3 className="text-sm font-black text-gray-900">{t('quickTools')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link href="/hr/reports/iqama" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-purple-50 hover:border-purple-200 hover:shadow-lg transition-all group">
                  <div className="text-gray-400 group-hover:text-purple-600 transition-colors">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-black text-gray-600 group-hover:text-purple-700">{t('iqamaReport')}</span>
                </Link>
                <Link href="/hr/packages" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:shadow-lg transition-all group">
                  <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
                    <Search size={20} />
                  </div>
                  <span className="text-[10px] font-black text-gray-600 group-hover:text-blue-700">{t('quickSearch')}</span>
                </Link>
                <Link href="/hr/packages" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-lg transition-all group">
                  <div className="text-gray-400 group-hover:text-emerald-600 transition-colors">
                    <PlusCircle size={20} />
                  </div>
                  <span className="text-[10px] font-black text-gray-600 group-hover:text-emerald-700">{isRTL ? 'باقة جديدة' : 'New Package'}</span>
                </Link>
                <Link href="/hr/packages" className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-amber-50 hover:border-amber-200 hover:shadow-lg transition-all group">
                  <div className="text-gray-400 group-hover:text-amber-600 transition-colors">
                    <UserPlus size={20} />
                  </div>
                  <span className="text-[10px] font-black text-gray-600 group-hover:text-amber-700">{t('addEmployee')}</span>
                </Link>
              </div>
            </motion.div>

            {/* Alert Widget */}
            {stats.expiredIqama > 0 && (
              <motion.div variants={itemVariants}>
                <Link href="/hr/reports/iqama?filter=expired">
                  <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 rounded-2xl p-5 flex items-center gap-4 group hover:shadow-lg hover:border-rose-300 transition-all cursor-pointer">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
                      <AlertTriangle size={26} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-rose-900 tracking-tight">{t('expiredIqamaAlert')}</h4>
                      <p className="text-xs font-bold text-rose-600 mt-0.5">{t('expiredIqamaAlertDesc').replace('{count}', String(stats.expiredIqama))}</p>
                    </div>
                    <ChevronRight className={`text-rose-300 group-hover:text-rose-500 transition-colors ${isRTL ? 'rotate-180' : ''}`} size={24} />
                  </div>
                </Link>
              </motion.div>
            )}

            {/* System Status */}
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <BadgeCheck className="text-emerald-400" size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm">{isRTL ? 'حالة النظام' : 'System Status'}</h4>
                  <p className="text-slate-400 text-[10px] font-bold">{isRTL ? 'جميع الأنظمة تعمل' : 'All systems operational'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">{isRTL ? 'قاعدة البيانات' : 'Database'}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-black">
                    <CheckCircle2 size={12} />
                    {isRTL ? 'متصل' : 'Connected'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">{isRTL ? 'التزامن' : 'Sync'}</span>
                  <span className="flex items-center gap-1 text-emerald-400 font-black">
                    <Activity size={12} />
                    {isRTL ? 'محدث' : 'Updated'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-blue-500" />
            <span>{isRTL ? 'نظام الموارد البشرية - ZoolSpeed Logistics' : 'HR System - ZoolSpeed Logistics'}</span>
          </div>
          <span>{isRTL ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'} © {new Date().getFullYear()}</span>
        </div>
      </motion.div>
    </div>
  );
}
