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
      <div className="max-w-[1600px] mx-auto px-4 pt-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 rounded-[3rem] shadow-2xl border border-slate-500/30 overflow-hidden"
        >
          {/* Top Decorative Line */}
          <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 via-emerald-500 to-blue-500 animate-gradient-x" />

          <div className="p-8 md:p-12 space-y-12">
            {/* Header Section */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/10 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-xl"
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2">
                  <Link href="/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                    <LayoutDashboard size={14} />
                    {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                  </Link>
                  <ArrowRight size={14} className={`${isRTL ? 'rotate-180' : ''} text-slate-500`} />
                  <span className="text-blue-400">{isRTL ? 'الموارد البشرية' : 'HR'}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white">{t('employeesSystem')}</h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-black text-slate-200">{companyName}</span>
                </div>
                <Link href="/hr/packages">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all font-black text-sm shadow-2xl shadow-blue-500/40"
                  >
                    <PlusCircle size={22} />
                    {isRTL ? 'إضافة باقة جديدة' : 'New Package'}
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                    href: "/hr/packages", 
                    color: "from-blue-500 to-indigo-600", 
                    icon: <Users size={24} />, 
                    label: t('totalEmployees'), 
                    value: stats.totalEmployees, 
                    subLabel: `${stats.completionRate}% ${isRTL ? 'نشط' : 'Active'}`
                  },
                { 
                  href: "/hr/packages", 
                  color: "from-emerald-500 to-teal-600", 
                  icon: <Package size={24} />, 
                  label: t('totalPackages'), 
                  value: stats.totalPackages, 
                  subLabel: isRTL ? 'مجموعات العمل' : 'Work Groups' 
                },
                { 
                  href: "/hr/reports/iqama?filter=on_leave", 
                  color: "from-amber-500 to-orange-600", 
                  icon: <Umbrella size={24} />, 
                  label: t('onLeave'), 
                  value: stats.onLeave, 
                  subLabel: isRTL ? 'موظف خارج العمل' : 'Employees off' 
                },
                { 
                  href: "/hr/reports/iqama?filter=expired", 
                  color: "from-rose-500 to-pink-600", 
                  icon: <IdCard size={24} />, 
                  label: t('expiredIqama'), 
                  value: stats.expiredIqama, 
                  subLabel: isRTL ? 'إقامة منتهية' : 'Expired Iqama',
                  alert: stats.expiredIqama > 0
                }
              ].map((stat, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <Link href={stat.href}>
                    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${stat.color} p-6 shadow-2xl transition-all group cursor-pointer hover:-translate-y-1`}>
                      <div className="flex items-start justify-between relative z-10">
                        <div className="text-white/90 bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">{stat.icon}</div>
                        {stat.subLabel && (
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full backdrop-blur-md ${stat.alert ? 'bg-white/20 text-white animate-pulse' : 'bg-white/10 text-white/80'}`}>
                            {stat.subLabel}
                          </span>
                        )}
                      </div>
                      <div className="mt-6 relative z-10">
                        <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                        <p className="text-4xl font-black text-white mt-2">{stat.value}</p>

                      </div>
                      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Tools Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { href: "/hr/packages", icon: <Package size={32} />, title: t('packagesManagement'), desc: t('packagesManagementDesc'), color: "blue", badge: t('startHere') },
                    { href: mostUsedPackageId ? `/hr/packages/${mostUsedPackageId}` : "/hr/packages", icon: <Users size={32} />, title: t('employeesManagement'), desc: t('employeesManagementDesc'), color: "emerald", badge: `${stats.totalEmployees} ${isRTL ? 'موظف' : 'employees'}` },
                    { href: "/hr/reports/iqama", icon: <FileText size={32} />, title: t('iqamaReport'), desc: t('iqamaReportDesc'), color: "purple", badge: `${stats.expiredIqama} ${isRTL ? 'منتهية' : 'expired'}` },
                    { href: "/hr/tasks", icon: <Bolt size={32} />, title: t('tasksManagement'), desc: t('tasksManagementDesc'), color: "orange", badge: t('integratedSystem') },
                    { href: "/letters", icon: <FileSignature size={32} />, title: isRTL ? 'الخطابات الجاهزة' : 'Letter Templates', desc: isRTL ? 'إنشاء وطباعة خطابات رسمية جاهزة للموظفين مثل شهادات الراتب وخطابات العمل' : 'Create and print official letters for employees such as salary certificates and work letters', color: "indigo", badge: isRTL ? 'احترافي' : 'Professional' }
                  ].map((tool, idx) => (
                    <motion.div key={idx} variants={itemVariants}>
                      <Link href={tool.href}>
                        <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 border border-white/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all h-full flex flex-col relative overflow-hidden group">
                          <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br from-${tool.color}-500 to-${tool.color}-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-${tool.color}-500/20 group-hover:scale-110 transition-transform`}>
                            {tool.icon}
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-xl font-black text-slate-900">{tool.title}</h3>
                            <span className={`px-2.5 py-1 rounded-full bg-${tool.color}-50 text-${tool.color}-600 text-[9px] font-black uppercase border border-${tool.color}-100`}>
                              {tool.badge}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-500 line-clamp-3 leading-relaxed">{tool.desc}</p>
                          <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-8 opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <ChevronRight className={`text-${tool.color}-300 ${isRTL ? 'rotate-180' : ''}`} size={28} />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Active Packages Section */}
                <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                          <Package className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-white text-lg font-black">{t('activePackages')}</h3>
                          <p className="text-slate-400 text-xs font-bold">{activePackages.length} {isRTL ? 'باقة نشطة' : 'active packages'}</p>
                        </div>
                      </div>
                      <Link href="/hr/packages" className="text-xs font-black text-slate-400 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-xl border border-white/10">{tCommon('viewAll')}</Link>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <AnimatePresence>
                        {activePackages.map((pkg, index) => (
                          <motion.div key={pkg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                            <Link href={`/hr/packages/${pkg.id}`}>
                              <div className="group p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl transition-all">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <Package size={24} />
                                  </div>
                                  <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase border ${
                                    pkg.work_type === 'salary' 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>
                                    {pkg.work_type === 'salary' ? t('salaryType') : t('targetType')}
                                  </span>
                                </div>
                                <h4 className="text-lg font-black text-slate-900 mb-3">{pkg.group_name}</h4>
                                <div className="flex items-center justify-between text-xs font-bold">
                                  <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-slate-600">
                                    <Target size={14} className="text-blue-500" />
                                    <span>{pkg.monthly_target}</span>
                                  </div>
                                  <div className="flex items-center gap-2 bg-amber-100/50 px-3 py-1.5 rounded-xl text-amber-800">
                                    <Trophy size={14} className="text-amber-600" />
                                    <span>{pkg.bonus_after_target} {isRTL ? 'ر.س' : 'SAR'}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    
                    <Link href="/hr/packages" className="mt-8 w-full py-5 rounded-[1.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center gap-3 text-slate-400 font-black text-base hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50/50 transition-all">
                      <PlusCircle size={22} />
                      <span>{t('createNewPackage')}</span>
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-8">
                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/10">
                        <History className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-white font-black text-lg">{t('recentActivity')}</h3>
                        <p className="text-purple-100 text-xs font-bold opacity-80">{isRTL ? 'آخر التحديثات' : 'Latest updates'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <AnimatePresence>
                      {recentEmployees.map((emp, idx) => (
                        <motion.div key={emp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex gap-4 items-start relative group">
                          {idx !== recentEmployees.length - 1 && (
                            <div className={`absolute top-12 bottom-0 ${isRTL ? 'right-6' : 'left-6'} w-0.5 bg-slate-100 group-hover:bg-purple-200 transition-colors`} />
                          )}
                          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 z-10 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                            <UserPlus size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 truncate">{t('newEmployeeAdded')}</p>
                            <p className="text-xs font-bold text-slate-500 mt-1 truncate">{emp.name} - {emp.group_name || t('withoutPackage')}</p>
                            <span className="text-[10px] font-black text-slate-300 mt-2 block bg-slate-50 px-2 py-1 rounded-lg w-fit">
                              {format(new Date(emp.created_at), 'yyyy-MM-dd HH:mm', { locale: isRTL ? ar : enUS })}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {recentEmployees.length === 0 && (
                      <div className="py-12 text-center">
                        <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                          <History size={40} className="text-slate-200" />
                        </div>
                        <p className="text-sm font-black text-slate-400">{t('noRecentActivity')}</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Quick Tools */}
                <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-white/50 p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center shadow-lg shadow-orange-500/10">
                      <Bolt className="text-orange-600" size={20} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">{t('quickTools')}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { href: "/hr/reports/iqama", icon: <FileText size={22} />, label: t('iqamaReport'), color: "purple" },
                      { href: "/hr/packages", icon: <Search size={22} />, label: t('quickSearch'), color: "blue" },
                      { href: "/hr/packages", icon: <PlusCircle size={22} />, label: isRTL ? 'باقة جديدة' : 'New Package', color: "emerald" },
                      { href: "/hr/packages", icon: <UserPlus size={22} />, label: t('addEmployee'), color: "amber" }
                    ].map((item, idx) => (
                      <Link key={idx} href={item.href} className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-2xl transition-all group">
                        <div className={`text-slate-400 group-hover:text-${item.color}-600 transition-colors`}>{item.icon}</div>
                        <span className="text-xs font-black text-slate-600 group-hover:text-slate-900 text-center">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>


              </div>
            </div>

            {/* Footer Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-black text-slate-400 uppercase tracking-widest pt-8 border-t border-white/10">
              <div className="flex items-center gap-3">
                <Sparkles size={14} className="text-blue-400" />
                <span>{isRTL ? 'نظام الموارد البشرية - ZoolSpeed Logistics' : 'HR System - ZoolSpeed Logistics'}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-white/5 px-3 py-1 rounded-lg">{isRTL ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'} © {new Date().getFullYear()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
