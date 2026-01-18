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
    <div className="min-h-screen pb-20" dir={isRTL ? "rtl" : "ltr"}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[95%] mx-auto px-4 pt-8 space-y-8"
      >
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                <Users className="text-blue-400" size={36} />
              </div>
              <div>
                <div className="flex items-center gap-3 text-xs font-black text-blue-200/60 uppercase tracking-widest mb-1">
                  <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
                    <LayoutDashboard size={14} />
                    {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                  </Link>
                  <ArrowRight size={14} className={isRTL ? 'rotate-180' : ''} />
                  <span className="text-white">{isRTL ? 'الموارد البشرية' : 'HR'}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  {t('employeesSystem')}
                </h1>
                <div className="mt-2 bg-white/5 backdrop-blur-sm px-4 py-1.5 rounded-xl border border-white/5 inline-block">
                  <p className="text-sm font-bold text-slate-300">{companyName}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/hr/packages">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  <PlusCircle size={20} />
                  {isRTL ? 'إضافة باقة جديدة' : 'New Package'}
                </motion.button>
              </Link>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        </motion.div>


        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants}>
            <Link href="/hr/packages">
              <div className="relative overflow-hidden rounded-[2rem] bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600 group-hover:scale-110 transition-transform"><Users size={24} /></div>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{stats.completionRate}% {isRTL ? 'نشط' : 'Active'}</span>
                </div>
                <div className="mt-6">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t('totalEmployees')}</p>
                  <p className="text-4xl font-black text-slate-900 mt-1">{stats.totalEmployees}</p>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.completionRate}%` }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                  />
                </div>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/hr/packages">
              <div className="relative overflow-hidden rounded-[2rem] bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform"><Package size={24} /></div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">{isRTL ? 'باقات' : 'Packages'}</span>
                </div>
                <div className="mt-6">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t('totalPackages')}</p>
                  <p className="text-4xl font-black text-slate-900 mt-1">{stats.totalPackages}</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-1">{isRTL ? 'مجموعات العمل' : 'Work Groups'}</p>
                </div>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/hr/reports/iqama?filter=on_leave">
              <div className="relative overflow-hidden rounded-[2rem] bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-amber-100 rounded-xl text-amber-600 group-hover:scale-110 transition-transform"><Umbrella size={24} /></div>
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">{isRTL ? 'إجازة' : 'Leave'}</span>
                </div>
                <div className="mt-6">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t('onLeave')}</p>
                  <p className="text-4xl font-black text-slate-900 mt-1">{stats.onLeave}</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-1">{isRTL ? 'موظف خارج العمل' : 'Employees off'}</p>
                </div>
              </div>
            </Link>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Link href="/hr/reports/iqama?filter=expired">
              <div className="relative overflow-hidden rounded-[2rem] bg-white/80 backdrop-blur-xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-rose-100 rounded-xl text-rose-600 group-hover:scale-110 transition-transform"><IdCard size={24} /></div>
                  {stats.expiredIqama > 0 && (
                    <span className="text-[10px] font-black text-white bg-rose-500 px-3 py-1 rounded-full animate-pulse shadow-lg shadow-rose-500/20">{isRTL ? 'تنبيه' : 'Alert'}</span>
                  )}
                </div>
                <div className="mt-6">
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t('expiredIqama')}</p>
                  <p className="text-4xl font-black text-slate-900 mt-1">{stats.expiredIqama}</p>
                  <p className="text-slate-400 text-[10px] font-bold mt-1">{isRTL ? 'إقامة منتهية' : 'Expired Iqama'}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { href: "/hr/packages", icon: Package, color: "blue", title: t('packagesManagement'), label: t('startHere'), desc: t('packagesManagementDesc') },
                { href: mostUsedPackageId ? `/hr/packages/${mostUsedPackageId}` : "/hr/packages", icon: Users, color: "emerald", title: t('employeesManagement'), label: `${stats.totalEmployees} ${isRTL ? 'موظف' : 'employees'}`, desc: t('employeesManagementDesc') },
                { href: "/hr/reports/iqama", icon: FileText, color: "purple", title: t('iqamaReport'), label: `${stats.expiredIqama} ${isRTL ? 'منتهية' : 'expired'}`, desc: t('iqamaReportDesc') },
                { href: "/hr/tasks", icon: Bolt, color: "orange", title: t('tasksManagement'), label: t('integratedSystem'), desc: t('tasksManagementDesc') },
                { href: "/letters", icon: FileSignature, color: "indigo", title: isRTL ? 'الخطابات الجاهزة' : 'Letter Templates', label: isRTL ? 'احترافي' : 'Professional', desc: isRTL ? 'إنشاء وطباعة خطابات رسمية جاهزة للموظفين مثل شهادات الراتب وخطابات العمل' : 'Create and print official letters for employees such as salary certificates and work letters' },
              ].map((tool, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <Link href={tool.href}>
                    <div className={cn(
                      "bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all h-full flex flex-col relative overflow-hidden group",
                      `hover:border-${tool.color}-200`
                    )}>
                      <div className={cn(
                        "h-16 w-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl transition-all duration-300 group-hover:scale-110",
                        `bg-gradient-to-br from-${tool.color}-500 to-${tool.color}-600 shadow-${tool.color}-500/20`
                      )}>
                        <tool.icon size={32} />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-lg font-black text-slate-800">{tool.title}</h3>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase border",
                          `bg-${tool.color}-50 text-${tool.color}-600 border-${tool.color}-100`
                        )}>
                          {tool.label}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 line-clamp-2 leading-relaxed">{tool.desc}</p>
                      <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-8 opacity-0 group-hover:opacity-100 transition-opacity`}>
                        <ChevronRight className={cn(
                          `text-${tool.color}-300`,
                          isRTL ? 'rotate-180' : ''
                        )} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-800 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                      <Package className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-black">{t('activePackages')}</h3>
                      <p className="text-slate-400 text-sm font-bold">{activePackages.length} {isRTL ? 'باقة نشطة' : 'active packages'}</p>
                    </div>
                  </div>
                  <Link href="/hr/packages" className="text-sm font-black text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    {tCommon('viewAll')}
                    <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                  </Link>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {activePackages.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/hr/packages/${pkg.id}`}>
                        <div className="group p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-md group-hover:bg-blue-600 group-hover:text-white transition-all border border-slate-100">
                              <Package size={24} />
                            </div>
                            <span className={cn(
                              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase border shadow-sm",
                              pkg.work_type === 'salary' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            )}>
                              {pkg.work_type === 'salary' ? t('salaryType') : t('targetType')}
                            </span>
                          </div>
                          <h4 className="font-black text-slate-800 text-lg mb-3">{pkg.group_name}</h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">
                              <Target size={14} className="text-blue-500" />
                              <span className="text-xs font-black text-slate-700">{pkg.monthly_target}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 text-amber-700 shadow-sm">
                              <Trophy size={14} />
                              <span className="text-xs font-black">{pkg.bonus_after_target} {isRTL ? 'ر.س' : 'SAR'}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                
                <Link href="/hr/packages" className="mt-8 w-full py-5 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center gap-3 text-slate-400 font-black text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all active:scale-[0.99]">
                  <PlusCircle size={24} />
                  <span>{t('createNewPackage')}</span>
                </Link>
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden"
            >
              <div className="bg-purple-600 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/10">
                    <History className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-black">{t('recentActivity')}</h3>
                    <p className="text-purple-200 text-xs font-bold">{isRTL ? 'آخر التحديثات' : 'Latest updates'}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {recentEmployees.map((emp, idx) => (
                  <motion.div 
                    key={emp.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-4 items-start relative group"
                  >
                    {idx !== recentEmployees.length - 1 && (
                      <div className={cn(
                        "absolute top-12 bottom-0 w-0.5 bg-slate-100 group-hover:bg-purple-200 transition-colors",
                        isRTL ? 'right-6' : 'left-6'
                      )} />
                    )}
                    <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 z-10 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-md border border-purple-100">
                      <UserPlus size={20} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm font-black text-slate-800 truncate">{t('newEmployeeAdded')}</p>
                      <p className="text-xs font-bold text-slate-500 mt-1 truncate">{emp.name} - {emp.group_name || t('withoutPackage')}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar size={12} className="text-slate-300" />
                        <span className="text-[10px] font-black text-slate-400">
                          {format(new Date(emp.created_at), 'yyyy-MM-dd HH:mm', { locale: isRTL ? ar : enUS })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {recentEmployees.length === 0 && (
                  <div className="py-12 text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto border border-slate-100 shadow-inner">
                      <History size={36} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-black text-slate-400">{t('noRecentActivity')}</p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 p-8 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center border border-orange-100 shadow-sm">
                  <Bolt className="text-orange-600" size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-800">{t('quickTools')}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { href: "/hr/reports/iqama", icon: FileText, color: "purple", label: t('iqamaReport') },
                  { href: "/hr/packages", icon: Search, color: "blue", label: t('quickSearch') },
                  { href: "/hr/packages", icon: PlusCircle, color: "emerald", label: isRTL ? 'باقة جديدة' : 'New Package' },
                  { href: "/hr/packages", icon: UserPlus, color: "amber", label: t('addEmployee') },
                ].map((tool, idx) => (
                  <Link key={idx} href={tool.href} className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all group">
                    <div className={cn(
                      "transition-all duration-300 group-hover:scale-110",
                      `text-slate-400 group-hover:text-${tool.color}-500`
                    )}>
                      <tool.icon size={28} />
                    </div>
                    <span className="text-xs font-black text-slate-600 group-hover:text-slate-900">{tool.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="space-y-8 pt-4">
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
