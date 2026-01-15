"use client";

import React from "react";
import { motion } from "framer-motion";
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
  AlertTriangle
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

  return (
    <div className="space-y-6 pt-10 pb-20 max-w-[1800px] mx-auto px-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-[2rem] p-8 text-white shadow-2xl">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-[#3498db] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{t('employeesSystem')}</h1>
              <div className="mt-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-xl border border-white/10 inline-block">
                <h2 className="text-xl font-bold text-blue-300">{companyName}</h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <StatCard 
              icon={<Users size={20} />} 
              label={t('totalEmployees')} 
              value={stats.totalEmployees} 
              color="blue"
              progress={stats.completionRate}
              href="/hr/packages"
              isRTL={isRTL}
            />
            <StatCard 
              icon={<Package size={20} />} 
              label={t('totalPackages')} 
              value={stats.totalPackages} 
              color="red"
              progress={100}
              href="/hr/packages"
              isRTL={isRTL}
            />
            <StatCard 
              icon={<Umbrella size={20} />} 
              label={t('onLeave')} 
              value={stats.onLeave} 
              color="orange"
              progress={(stats.onLeave / (stats.totalEmployees || 1)) * 100}
              href="/hr/reports/iqama?filter=on_leave"
              isRTL={isRTL}
            />
            <StatCard 
              icon={<IdCard size={20} />} 
              label={t('expiredIqama')} 
              value={stats.expiredIqama} 
              color="purple"
              progress={(stats.expiredIqama / (stats.totalEmployees || 1)) * 100}
              href="/hr/reports/iqama?filter=expired"
              isRTL={isRTL}
            />
          </div>
        </div>
        
        <div className={`absolute top-0 ${isRTL ? 'left-0 -ml-32' : 'right-0 -mr-32'} w-64 h-64 bg-white/5 rounded-full -mt-32 blur-3xl`} />
        <div className={`absolute bottom-0 ${isRTL ? 'right-0 -mr-32' : 'left-0 -ml-32'} w-64 h-64 bg-blue-500/10 rounded-full -mb-32 blur-3xl`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickNavCard 
              icon={<Package size={28} />} 
              title={t('packagesManagement')} 
              desc={t('packagesManagementDesc')} 
              badge={t('startHere')} 
              color="blue"
              href="/hr/packages"
              isRTL={isRTL}
            />
            <QuickNavCard 
              icon={<Users size={28} />} 
              title={t('employeesManagement')} 
              desc={t('employeesManagementDesc')} 
              badge={`${stats.totalEmployees} ${isRTL ? 'موظف' : 'employees'}`} 
              color="green"
              href={mostUsedPackageId ? `/hr/packages/${mostUsedPackageId}` : "/hr/packages"}
              isRTL={isRTL}
            />
            <QuickNavCard 
              icon={<FileText size={28} />} 
              title={t('iqamaReport')} 
              desc={t('iqamaReportDesc')} 
              badge={`${stats.expiredIqama} ${isRTL ? 'منتهية' : 'expired'}`} 
              color="purple"
              href="/hr/reports/iqama"
              isRTL={isRTL}
            />
            <QuickNavCard 
              icon={<Bolt size={28} />} 
              title={t('tasksManagement')} 
              desc={t('tasksManagementDesc')} 
              badge={t('integratedSystem')} 
              color="orange"
              href="/hr/tasks"
              isRTL={isRTL}
            />
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Package className="text-[#3498db]" size={20} />
                <h3 className="text-lg font-black text-gray-900">{t('activePackages')}</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase">
                  {activePackages.length} {isRTL ? 'باقة' : 'packages'}
                </span>
              </div>
              <Link href="/hr/packages" className="text-xs font-bold text-gray-400 hover:text-blue-500 transition-colors">{tCommon('viewAll')}</Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activePackages.map((pkg) => (
                <Link key={pkg.id} href={`/hr/packages/${pkg.id}`}>
                  <div className="group p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                        <Package size={20} />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        pkg.work_type === 'salary' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {pkg.work_type === 'salary' ? t('salaryType') : t('targetType')}
                      </span>
                    </div>
                    <h4 className="font-black text-gray-900 mb-1">{pkg.group_name}</h4>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                      <div className="flex items-center gap-1">
                        <Target size={10} />
                        <span>{pkg.monthly_target}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy size={10} className="text-orange-400" />
                        <span>{pkg.bonus_after_target} {isRTL ? 'ر.س' : 'SAR'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            <Link href="/hr/packages" className="mt-6 w-full py-3 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-gray-400 font-black text-sm hover:border-blue-300 hover:text-blue-500 transition-all">
              <PlusCircle size={18} />
              <span>{t('createNewPackage')}</span>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center gap-2 mb-6">
              <History className="text-purple-500" size={20} />
              <h3 className="text-lg font-black text-gray-900">{t('recentActivity')}</h3>
            </div>

            <div className="space-y-4">
              {recentEmployees.map((emp, idx) => (
                <div key={emp.id} className="flex gap-3 items-start relative group">
                  {idx !== recentEmployees.length - 1 && (
                    <div className={`absolute top-10 bottom-0 ${isRTL ? 'right-5' : 'left-5'} w-0.5 bg-gray-50 group-hover:bg-purple-100 transition-colors`} />
                  )}
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 z-10 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
                    <UserPlus size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900 truncate">{t('newEmployeeAdded')}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5 truncate">{emp.name} - {emp.group_name || t('withoutPackage')}</p>
                    <span className="text-[9px] font-black text-gray-300 mt-1 block">
                      {format(new Date(emp.created_at), 'yyyy-MM-dd HH:mm', { locale: isRTL ? ar : enUS })}
                    </span>
                  </div>
                </div>
              ))}
              
              {recentEmployees.length === 0 && (
                <div className="py-8 text-center text-gray-300">
                  <History size={40} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-bold">{t('noRecentActivity')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Bolt className="text-orange-500" size={20} />
              <h3 className="text-lg font-black text-gray-900">{t('quickTools')}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ToolBtn icon={<FileText size={16} />} label={t('iqamaReport')} href="/hr/reports/iqama" />
              <ToolBtn icon={<Search size={16} />} label={t('quickSearch')} href="/hr/packages" />
              <ToolBtn icon={<PlusCircle size={16} />} label={isRTL ? 'باقة جديدة' : 'New Package'} href="/hr/packages" />
              <ToolBtn icon={<UserPlus size={16} />} label={t('addEmployee')} href="/hr/packages" />
            </div>
          </div>

          {stats.expiredIqama > 0 && (
            <Link href="/hr/reports/iqama?filter=expired">
              <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex items-center gap-4 group hover:bg-red-100 transition-all cursor-pointer">
                <div className="h-12 w-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-red-900 tracking-tight">{t('expiredIqamaAlert')}</h4>
                  <p className="text-xs font-bold text-red-600 mt-0.5">{t('expiredIqamaAlertDesc').replace('{count}', String(stats.expiredIqama))}</p>
                </div>
              </div>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, progress, href, isRTL }: any) {
  const colors: any = {
    blue: "bg-blue-500 shadow-blue-500/20",
    red: "bg-red-500 shadow-red-500/20",
    orange: "bg-orange-500 shadow-orange-500/20",
    purple: "bg-purple-500 shadow-purple-500/20"
  };

  return (
    <Link href={href} className="block group">
      <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/20 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white ${colors[color]}`}>
            {icon}
          </div>
          <span className="text-xl font-black">{value}</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-2">{label}</p>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full ${colors[color]}`} 
          />
        </div>
      </div>
    </Link>
  );
}

function QuickNavCard({ icon, title, desc, badge, color, href, isRTL }: any) {
  const colors: any = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/20",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/20"
  };

  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all h-full flex flex-col relative overflow-hidden group"
      >
        <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-4 ${colors[color]}`}>
          {icon}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-black text-gray-900">{title}</h3>
          <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[8px] font-black uppercase">
            {badge}
          </span>
        </div>
        <p className="text-xs font-bold text-gray-500 line-clamp-2 leading-relaxed">{desc}</p>
        
        <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} p-6 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <ChevronRight className={`text-gray-200 ${isRTL ? 'rotate-180' : ''}`} />
        </div>
      </motion.div>
    </Link>
  );
}

function ToolBtn({ icon, label, href }: any) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all group">
      <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
        {icon}
      </div>
      <span className="text-[10px] font-black text-gray-600">{label}</span>
    </Link>
  );
}
