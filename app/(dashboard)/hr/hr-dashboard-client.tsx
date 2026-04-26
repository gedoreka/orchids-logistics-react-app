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
  Bolt,
  ChevronRight,
  Target,
  Trophy,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  FileSignature
} from "lucide-react";
import Link from "next/link";
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
  const { isRTL } = useLocale();
  const t = useTranslations('hr');
  const tCommon = useTranslations('common');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen pb-20" dir={isRTL ? "rtl" : "ltr"}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full px-3 md:px-6 pt-6 space-y-5"
      >

        {/* ══════════════════════════════════════
            CARD 1 — HEADER
        ══════════════════════════════════════ */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 border border-white/10 shadow-2xl shadow-indigo-500/10 p-6 md:p-8"
        >
          {/* glow orbs */}
          <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 ${isRTL ? '-translate-x-1/3' : 'translate-x-1/3'}`} />
          <div className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-48 h-48 bg-violet-600/15 rounded-full blur-2xl translate-y-1/2 ${isRTL ? 'translate-x-1/4' : '-translate-x-1/4'}`} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: breadcrumb + title */}
            <div className="space-y-3">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Link href="/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                  <LayoutDashboard size={13} />
                  {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                </Link>
                <ArrowRight size={12} className={`${isRTL ? 'rotate-180' : ''} text-slate-600`} />
                <span className="text-indigo-400 font-black">{isRTL ? 'الموارد البشرية' : 'HR'}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                {t('employeesSystem')}
              </h1>

              {/* Subtitle badge */}
              <div className="flex items-center gap-2">
                <Sparkles size={13} className="text-indigo-400" />
                <span className="text-xs font-bold text-slate-400">
                  {isRTL ? 'نظام الموارد البشرية المتكامل' : 'Integrated HR Management System'}
                </span>
              </div>
            </div>

            {/* Right: company chip + button */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Company name chip */}
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/8 border border-white/10 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-black text-slate-200">{companyName}</span>
              </div>

              {/* Add package button */}
              <Link href="/hr/packages">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm shadow-xl shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  <PlusCircle size={18} />
                  {isRTL ? 'إضافة باقة جديدة' : 'New Package'}
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════
            CARD 2 — STATS (glass cards row)
        ══════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { href: "/hr/packages", gradient: "from-blue-500 to-indigo-600", glowColor: "blue-500", icon: <Users size={22} />, label: t('totalEmployees'), value: stats.totalEmployees, sub: `${stats.completionRate}% ${isRTL ? 'نشط' : 'active'}`, border: "border-blue-500/20" },
            { href: "/hr/packages", gradient: "from-emerald-500 to-teal-600", glowColor: "emerald-500", icon: <Package size={22} />, label: t('totalPackages'), value: stats.totalPackages, sub: isRTL ? 'مجموعات العمل' : 'Work Groups', border: "border-emerald-500/20" },
            { href: "/hr/reports/iqama?filter=on_leave", gradient: "from-amber-500 to-orange-600", glowColor: "amber-500", icon: <Umbrella size={22} />, label: t('onLeave'), value: stats.onLeave, sub: isRTL ? 'خارج العمل' : 'Employees off', border: "border-amber-500/20" },
            { href: "/hr/reports/iqama?filter=expired", gradient: "from-rose-500 to-pink-600", glowColor: "rose-500", icon: <IdCard size={22} />, label: t('expiredIqama'), value: stats.expiredIqama, sub: isRTL ? 'هوية منتهية' : 'Expired Iqama', border: "border-rose-500/20", alert: stats.expiredIqama > 0 }
          ].map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Link href={stat.href}>
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.gradient} p-5 shadow-xl border border-white/10 cursor-pointer group hover:-translate-y-1 transition-all`}>
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/15 transition-all" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-white/15 border border-white/10">
                        <span className="text-white">{stat.icon}</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full bg-white/15 text-white/80 ${stat.alert ? 'animate-pulse' : ''}`}>
                        {stat.sub}
                      </span>
                    </div>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                    <p className="text-3xl font-black text-white mt-1">{stat.value}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* ══════════════════════════════════════
            CARD 3 — SERVICES (slightly different bg)
        ══════════════════════════════════════ */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600/40 shadow-lg p-5 md:p-6"
        >
          {/* Header bar */}
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200 dark:border-slate-700/50">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-white">{isRTL ? 'خدمات النظام' : 'System Services'}</h2>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{isRTL ? 'وصول سريع للوحدات الرئيسية' : 'Quick access to main modules'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { href: "/hr/packages", icon: <Package size={20} />, title: t('packagesManagement'), gradient: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/25", badgeBg: "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30", badge: t('startHere') },
              { href: mostUsedPackageId ? `/hr/packages/${mostUsedPackageId}` : "/hr/packages", icon: <Users size={20} />, title: t('employeesManagement'), gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/25", badgeBg: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30", badge: `${stats.totalEmployees} ${isRTL ? 'موظف' : 'emp'}` },
              { href: "/hr/reports/iqama", icon: <FileText size={20} />, title: t('iqamaReport'), gradient: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/25", badgeBg: "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30", badge: `${stats.expiredIqama} ${isRTL ? 'منتهية' : 'expired'}` },
              { href: "/hr/tasks", icon: <Bolt size={20} />, title: t('tasksManagement'), gradient: "from-orange-500 to-amber-600", shadow: "shadow-orange-500/25", badgeBg: "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30", badge: isRTL ? 'نظام متكامل' : 'Integrated' },
              { href: "/letters", icon: <FileSignature size={20} />, title: isRTL ? 'الخطابات الجاهزة' : 'Letter Templates', gradient: "from-indigo-500 to-blue-600", shadow: "shadow-indigo-500/25", badgeBg: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30", badge: isRTL ? 'احترافي' : 'Pro' }
            ].map((tool, idx) => (
              <motion.div key={idx} variants={itemVariants}>
                <Link href={tool.href}>
                  <div className="group relative bg-white dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600/40 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all h-full flex flex-col items-center text-center overflow-hidden cursor-pointer">
                    {/* Top accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${tool.gradient}`} />
                    {/* Arrow - always visible */}
                    <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'}`}>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-300 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-300 group-hover:scale-125 transition-all ${isRTL ? 'rotate-180' : ''}`} />
                    </div>
                    {/* Icon */}
                    <div className={`mt-3 h-10 w-10 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white shadow-md ${tool.shadow} group-hover:scale-110 transition-transform`}>
                      {tool.icon}
                    </div>
                    {/* Title */}
                    <h3 className="mt-2.5 text-[11px] font-black text-slate-700 dark:text-white leading-snug px-1">{tool.title}</h3>
                    {/* Badge */}
                    <span className={`mt-2 mb-2 px-2 py-0.5 rounded-full text-[9px] font-black border ${tool.badgeBg}`}>
                      {tool.badge}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════
            CARDS 4 & 5 — ACTIVE PACKAGES + QUICK TOOLS
        ══════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Active Packages Card */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/50 shadow-lg"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/15">
                  <Package className="text-white" size={18} />
                </div>
                <div>
                  <h3 className="text-white text-sm font-black">{t('activePackages')}</h3>
                  <p className="text-purple-100 text-[10px] font-bold">{activePackages.length} {isRTL ? 'باقة نشطة' : 'active packages'}</p>
                </div>
              </div>
              <Link href="/hr/packages" className="text-[10px] font-black text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg border border-white/20 transition-colors">
                {tCommon('viewAll')}
              </Link>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatePresence>
                  {activePackages.map((pkg, index) => (
                    <motion.div key={pkg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
                      <Link href={`/hr/packages/${pkg.id}`}>
                        <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/40 hover:border-purple-300 dark:hover:border-purple-500/40 hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                              <Package size={16} />
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${pkg.work_type === 'salary' ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30'}`}>
                              {pkg.work_type === 'salary' ? t('salaryType') : t('targetType')}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-white mb-2">{pkg.group_name}</h4>
                          <div className="flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300">
                              <Target size={11} className="text-blue-500" />
                              <span>{pkg.monthly_target}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg text-amber-700 dark:text-amber-300">
                              <Trophy size={11} className="text-amber-500" />
                              <span>{pkg.bonus_after_target} {isRTL ? 'ر.س' : 'SAR'}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <Link href="/hr/packages" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center gap-2 text-white font-black text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20">
                <PlusCircle size={16} />
                <span>{t('createNewPackage')}</span>
              </Link>
            </div>
          </motion.div>

          {/* Quick Tools Card */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/50 shadow-lg"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/15">
                <Bolt className="text-white" size={18} />
              </div>
              <div>
                <h3 className="text-white font-black text-sm">{t('quickTools')}</h3>
                <p className="text-blue-100 text-[10px] font-bold">{isRTL ? 'الأدوات الأكثر استخداماً' : 'Most used tools'}</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                { href: "/hr/reports/iqama", icon: <FileText size={18} />, label: t('iqamaReport'), gradient: "from-purple-500 to-violet-600", shadow: "shadow-purple-500/25" },
                { href: "/hr/packages", icon: <Search size={18} />, label: t('quickSearch'), gradient: "from-blue-500 to-blue-600", shadow: "shadow-blue-500/25" },
                { href: "/hr/packages", icon: <PlusCircle size={18} />, label: isRTL ? 'باقة جديدة' : 'New Package', gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/25" },
                { href: "/hr/packages", icon: <UserPlus size={18} />, label: t('addEmployee'), gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/25" }
              ].map((item, idx) => (
                <Link key={idx} href={item.href} className="group flex flex-col items-center justify-center gap-3 p-5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600/40 hover:border-slate-300 dark:hover:border-slate-500/60 hover:shadow-md hover:-translate-y-0.5 transition-all">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg ${item.shadow} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-black text-slate-700 dark:text-white text-center leading-tight">{item.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

        </div>

        {/* ══════════════════════════════════════
            FOOTER
        ══════════════════════════════════════ */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-5 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/30 text-[10px] font-black text-slate-400 uppercase tracking-widest"
        >
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-indigo-400" />
            <span>{isRTL ? 'نظام الموارد البشرية — Logistics Hub' : 'HR System — Logistics Hub'}</span>
          </div>
          <span>{isRTL ? 'جميع الحقوق محفوظة' : 'All Rights Reserved'} © {new Date().getFullYear()}</span>
        </motion.div>

      </motion.div>
    </div>
  );
}
