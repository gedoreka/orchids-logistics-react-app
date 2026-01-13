"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Package, 
  UserCheck, 
  AlertCircle, 
  Calendar,
  Building2,
  Clock,
  Ban,
  TrendingUp,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  stats: any;
  user: any;
  company: any;
  initialYear: number;
}

export function DashboardClient({ stats, user, company, initialYear }: DashboardClientProps) {
  const [year, setYear] = useState(initialYear);
  const [showToken, setShowToken] = useState(false);
  const isAdmin = user.role === "admin";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="relative overflow-hidden rounded-[32px] bg-white p-10 shadow-sm border border-gray-100">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3498db]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">
            مرحباً بك، {user.name} 👋
          </h1>
          <p className="text-gray-500 font-bold text-lg mb-8">نظرة عامة على نشاط منشأتك اليوم</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-2.5 rounded-2xl bg-[#3498db]/10 text-[#3498db] text-sm font-black flex items-center gap-2">
              <Calendar size={16} />
              {isAdmin ? "مسؤول النظام" : company?.name}
            </div>
            <div className="px-6 py-2.5 rounded-2xl bg-green-500/10 text-green-600 text-sm font-black flex items-center gap-2">
              <TrendingUp size={16} />
              اشتراك نشط
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info Card */}
        <motion.div variants={item} className="bg-white/80 backdrop-blur-md p-8 rounded-[32px] border border-white shadow-sm hover:shadow-xl transition-all duration-500 group">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-[#3498db]/10 flex items-center justify-center text-[#3498db] group-hover:bg-[#3498db] group-hover:text-white transition-all duration-500">
              <Building2 size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">بيانات المنشأة</h3>
              <p className="text-xs font-bold text-gray-400">المعلومات الأساسية المسجلة</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">الرقم الضريبي</span>
              <span className="text-sm font-bold text-gray-900">{company?.vat_number || "—"}</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">السجل التجاري</span>
              <span className="text-sm font-bold text-gray-900">{company?.commercial_number || "—"}</span>
            </div>
          </div>
        </motion.div>

        {/* System Info Card */}
        <motion.div variants={item} className="bg-white/80 backdrop-blur-md p-8 rounded-[32px] border border-white shadow-sm hover:shadow-xl transition-all duration-500 group">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-14 w-14 rounded-2xl bg-[#764ba2]/10 flex items-center justify-center text-[#764ba2] group-hover:bg-[#764ba2] group-hover:text-white transition-all duration-500">
              <Clock size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">حالة النظام</h3>
              <p className="text-xs font-bold text-gray-400">معلومات الدخول والاشتراك</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">نوع الحساب</span>
              <span className="text-sm font-bold text-gray-900">{isAdmin ? "مسؤول النظام" : "مدير منشأة"}</span>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
              <span className="block text-[10px] font-black text-gray-400 uppercase mb-1">رمز الوصول</span>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-mono font-bold transition-all", !showToken && "blur-sm select-none")}>
                  {company?.access_token || "—"}
                </span>
                <button onClick={() => setShowToken(!showToken)} className="text-gray-400 hover:text-gray-900 transition-colors">
                  {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
          <div className="w-2 h-8 bg-[#3498db] rounded-full" />
          الإحصائيات العامة
        </h2>
        
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
          <span className="text-xs font-black text-gray-400 px-3">السنة المالية</span>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-gray-50 border-none rounded-xl py-1.5 px-4 text-xs font-bold outline-none focus:ring-0 cursor-pointer"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {isAdmin ? (
          <>
            <StatCard icon={Users} title="المستخدمين النشطين" value={stats.users_count} color="blue" />
            <StatCard icon={Clock} title="طلبات التسجيل" value={stats.pending_requests} color="orange" />
            <StatCard icon={Ban} title="شركات موقوفة" value={stats.stopped_companies} color="red" />
            <StatCard icon={Package} title="إجمالي الفواتير" value={stats.invoices_count} color="green" />
          </>
        ) : (
          <>
            <StatCard icon={Users} title="إجمالي الموظفين" value={stats.total_employees} color="blue" />
            <StatCard icon={Package} title="الباقات المفعلة" value={stats.total_packages} color="green" />
            <StatCard icon={UserCheck} title="موظفين نشطين" value={stats.active_employees} color="indigo" />
            <StatCard icon={AlertCircle} title="إقامات منتهية" value={stats.expired_iqama} color="red" />
          </>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, color }: { icon: any, title: string, value: number, color: string }) {
  const colorMap: any = {
    blue: "from-blue-500 to-blue-600 bg-blue-50 text-blue-600",
    green: "from-green-500 to-green-600 bg-green-50 text-green-600",
    red: "from-red-500 to-red-600 bg-red-50 text-red-600",
    orange: "from-orange-500 to-orange-600 bg-orange-50 text-orange-600",
    indigo: "from-indigo-500 to-indigo-600 bg-indigo-50 text-indigo-600",
  };

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
    >
      <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-[0.03] -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150")}>
        <Icon size={128} />
      </div>

      <div className="flex flex-col items-center text-center relative z-10">
        <div className={cn("h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110", colorMap[color])}>
          <Icon size={32} />
        </div>
        <h4 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
          {value?.toLocaleString() || 0}
        </h4>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-1 text-[10px] font-black text-[#3498db] bg-[#3498db]/5 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          عرض التفاصيل
          <ChevronLeft size={10} />
        </div>
      </div>
    </motion.div>
  );
}
