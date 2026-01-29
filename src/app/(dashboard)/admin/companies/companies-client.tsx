"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Search, 
  CheckCircle, 
  XCircle, 
  Power, 
  Key, 
  Infinity,
  Calendar,
  Filter,
  Eye,
  ShieldAlert,
  ArrowUpDown,
  RefreshCw,
  Percent,
  IdCard,
  Flag,
  Phone,
  PlayCircle,
  PauseCircle,
  Lock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { Company } from "@/lib/types";
import { approveCompany, rejectCompany, toggleCompanyStatus, generateToken, deleteCompany } from "@/lib/actions/admin";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Package, Crown } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  price: number;
  duration_value: number;
  duration_unit: string;
}

interface CompaniesClientProps {
  initialCompanies: Company[];
  statusFilter: string;
  search: string;
  plans?: Plan[];
}

export function CompaniesClient({ initialCompanies, statusFilter, search, plans = [] }: CompaniesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState(initialCompanies);
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [assignPlanModal, setAssignPlanModal] = useState<{ companyId: number; companyName: string } | null>(null);
  const [assigningPlan, setAssigningPlan] = useState(false);

  const updateQueryParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAction = async (id: number, action: () => Promise<any>) => {
    setIsLoading(id);
    try {
      const result = await action();
      if (result.success) {
        toast.success("تم تنفيذ العملية بنجاح");
        if (result.token) {
          toast.info(`رمز التفعيل الجديد: ${result.token}`, { duration: 10000 });
        }
        router.refresh();
      } else {
        toast.error(result.error || "حدث خطأ");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsLoading(deleteConfirm.id);
    try {
      const result = await deleteCompany(deleteConfirm.id);
      if (result.success) {
        toast.success(result.message || "تم حذف الشركة بنجاح");
        setDeleteConfirm(null);
        router.refresh();
      } else {
        toast.error(result.error || "حدث خطأ أثناء الحذف");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(null);
    }
  };

  const handleAssignPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!assignPlanModal) return;
    setAssigningPlan(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/admin/subscriptions/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: assignPlanModal.companyId,
          plan_id: formData.get('plan_id'),
          start_date: formData.get('start_date'),
          end_date: formData.get('end_date'),
          assigned_by: 1,
          notes: formData.get('notes')
        })
      });
      const result = await res.json();
      if (result.success) {
        toast.success('تم تعيين الباقة بنجاح');
        setAssignPlanModal(null);
        router.refresh();
      } else {
        toast.error(result.error || 'حدث خطأ');
      }
    } catch {
      toast.error('حدث خطأ');
    }
    setAssigningPlan(false);
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto">
      {/* Premium Header Glass */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl overflow-hidden text-center border border-white/10">
          {/* Animated top border line like PHP code */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-green-500 via-red-500 via-yellow-500 via-purple-500 to-blue-500 bg-[length:200%_100%] animate-gradient-x"></div>
          
          <div className="relative z-10 space-y-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              نظام إدارة طلبات الشركات
            </motion.div>
            
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              إدارة طلبات المنشآت
            </h1>
            
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <div className="bg-blue-500/10 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-blue-500/20 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Building2 size={20} />
                </div>
                <div className="text-right">
                  <span className="block text-blue-400/50 text-[10px] font-black uppercase tracking-widest">إجمالي الشركات</span>
                  <span className="text-xl font-black text-blue-100">{companies.length}</span>
                </div>
              </div>
              
              <div className="bg-emerald-500/10 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle size={20} />
                </div>
                <div className="text-right">
                  <span className="block text-emerald-400/50 text-[10px] font-black uppercase tracking-widest">المقبولة</span>
                  <span className="text-xl font-black text-emerald-100">
                    {companies.filter(c => c.status === 'approved').length}
                  </span>
                </div>
              </div>

              <div className="bg-amber-500/10 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-amber-500/20 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <RefreshCw size={20} className="animate-spin-slow" />
                  </div>
                  <div className="text-right">
                    <span className="block text-amber-400/50 text-[10px] font-black uppercase tracking-widest">قيد المراجعة</span>
                    <span className="text-xl font-black text-amber-100">
                      {companies.filter(c => c.status === 'pending').length}
                    </span>
                  </div>
                </div>
              </div>
              

            </div>
          </div>
        </div>

        {/* Search & Filter Glass Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
          <div className="grid lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 relative group">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="ابحث باسم الشركة، الرقم التجاري، أو الرقم الضريبي..."
                defaultValue={search}
                onChange={(e) => updateQueryParams("search", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pr-16 pl-8 font-bold text-slate-700 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
              />
            </div>
  
            <div className="lg:col-span-5 flex flex-wrap gap-2 justify-center lg:justify-end">
              {[
                { id: "all", label: "الكل", icon: ArrowUpDown, color: "bg-slate-800" },
                { id: "approved", label: "مقبولة", icon: CheckCircle, color: "bg-emerald-600" },
                { id: "rejected", label: "مرفوضة", icon: XCircle, color: "bg-rose-600" },
                { id: "pending", label: "قيد المراجعة", icon: RefreshCw, color: "bg-amber-600" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => updateQueryParams("filter", filter.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all relative overflow-hidden group",
                    statusFilter === filter.id
                      ? `${filter.color} text-white shadow-lg shadow-black/10 scale-105`
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >

                <filter.icon size={16} className={cn(statusFilter === filter.id && "animate-pulse")} />
                <span>{filter.label}</span>
                {statusFilter === filter.id && (
                  <motion.div
                    layoutId="filter-active"
                    className="absolute inset-0 bg-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="group relative bg-white rounded-[2rem] border border-slate-200 p-6 md:p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden"
            >
              {/* Top border indicator */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r",
                company.status === 'approved' ? "from-emerald-500 to-teal-400" :
                company.status === 'rejected' ? "from-rose-500 to-pink-400" :
                "from-amber-500 to-orange-400"
              )} />

              <div className="flex flex-col gap-6">
                {/* Company Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-3">
                      {company.name}
                      {company.is_active ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-slate-400 font-bold text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-blue-500" />
                        <span>منذ {new Date(company.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag size={12} className="text-blue-500" />
                        <span>{company.country || 'المملكة العربية السعودية'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border",
                      company.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      company.status === 'rejected' ? "bg-rose-50 text-rose-600 border-rose-100" :
                      "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                      {company.status === 'approved' ? <CheckCircle size={12}/> : company.status === 'rejected' ? <XCircle size={12}/> : <RefreshCw size={12} className="animate-spin-slow"/>}
                      {company.status === 'approved' ? 'مقبول' : company.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border",
                      company.is_active ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                      {company.is_active ? <PlayCircle size={12}/> : <PauseCircle size={12}/>}
                      {company.is_active ? 'نشط' : 'موقوف'}
                    </div>
                  </div>
                </div>

                {/* Company Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "رقم السجل التجاري", value: company.commercial_number, icon: IdCard, color: "border-blue-500" },
                    { label: "الرقم الضريبي", value: company.vat_number || '---', icon: Percent, color: "border-indigo-500" },
                    { label: "رقم الهاتف", value: company.phone || '---', icon: Phone, color: "border-teal-500" },
                    { label: "المنطقة/المدينة", value: `${company.region || ''} ${company.district || ''}` || '---', icon: Flag, color: "border-purple-500" },
                  ].map((info, i) => (
                    <div key={i} className={cn(
                      "bg-slate-50/50 rounded-xl p-4 border-2 border-slate-100 transition-all hover:bg-white hover:shadow-lg hover:-translate-y-1 border-r-4",
                      info.color
                    )}>
                      <div className="flex items-center gap-2 mb-1.5 text-slate-500">
                        <info.icon size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{info.label}</span>
                      </div>
                      <span className="font-black text-slate-800 text-base block">{info.value}</span>
                    </div>
                  ))}
                </div>

                {/* Token Section with Premium Glassy look */}
                <div className="bg-slate-900/5 rounded-2xl p-5 border-2 border-dashed border-slate-200">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <Key size={12} className="text-blue-500" />
                          رمز التفعيل
                        </span>
                        <span className={cn(
                          "font-mono text-lg font-black tracking-widest",
                          company.access_token ? "text-blue-600" : "text-slate-300 italic text-xs"
                        )}>
                          {company.access_token || 'غير منشأ بعد'}
                        </span>
                      </div>
                      {company.access_token && (
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(company.access_token!);
                            toast.success("تم نسخ الرمز");
                          }}
                          className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center"
                        >
                          <Plus size={18} className="rotate-45" />
                        </button>
                      )}
                    </div>

                    <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                          <Calendar size={12} className="text-amber-500" />
                          مدة التفعيل
                        </span>
                        <span className="font-black text-slate-800 text-base">
                          {company.token_expiry && company.token_expiry !== '0000-00-00' ? (
                            <span className="text-amber-600">{new Date(company.token_expiry).toLocaleDateString('en-GB')}</span>
                          ) : (
                            <span className="text-emerald-600 flex items-center gap-2">
                              تفعيل دائم
                              <Infinity size={18} />
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

{/* Action Buttons with Gradients */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
                      <Link href={`/admin/companies/${company.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-black shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
                        >
                          <Eye size={18} />
                          <span className="text-[9px] uppercase tracking-wider text-center">عرض التفاصيل</span>
                        </motion.button>
                      </Link>

                    <Link href={`/admin/companies/${company.id}/permissions`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-black shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
                        >
                          <Lock size={18} />
                          <span className="text-[9px] uppercase tracking-wider text-center">الصلاحيات</span>
                        </motion.button>
                      </Link>

<motion.button
                          whileHover={company.status === 'pending' ? { scale: 1.02 } : {}}
                          whileTap={company.status === 'pending' ? { scale: 0.98 } : {}}
                          onClick={() => company.status === 'pending' && handleAction(company.id, () => approveCompany(company.id))}
                          disabled={isLoading === company.id || company.status !== 'pending'}
                          className={cn(
                            "w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl font-black shadow-lg transition-all",
                            company.status === 'pending' 
                              ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40 cursor-pointer"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                          )}
                        >
                          <CheckCircle size={18} />
                          <span className="text-[9px] uppercase tracking-wider text-center">
                            {company.status === 'approved' ? 'تم القبول' : 'قبول الطلب'}
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={company.status === 'pending' ? { scale: 1.02 } : {}}
                          whileTap={company.status === 'pending' ? { scale: 0.98 } : {}}
                          onClick={() => company.status === 'pending' && handleAction(company.id, () => rejectCompany(company.id))}
                          disabled={isLoading === company.id || company.status !== 'pending'}
                          className={cn(
                            "w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl font-black shadow-lg transition-all",
                            company.status === 'pending' 
                              ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-500/20 hover:shadow-rose-500/40 cursor-pointer"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                          )}
                        >
                          <XCircle size={18} />
                          <span className="text-[9px] uppercase tracking-wider text-center">
                            {company.status === 'rejected' ? 'تم الرفض' : 'رفض الطلب'}
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAction(company.id, () => toggleCompanyStatus(company.id, company.is_active))}
                          disabled={isLoading === company.id}
                          className={cn(
                            "w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl font-black shadow-lg transition-all",
                            company.is_active 
                            ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20 hover:shadow-amber-500/40" 
                            : "bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/20 hover:shadow-blue-500/40"
                          )}
                        >
                          <Power size={18} />
                          <span className="text-[9px] uppercase tracking-wider text-center">{company.is_active ? 'إيقاف المنشأة' : 'تفعيل المنشأة'}</span>
                        </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(company.id, () => generateToken(company.id, 30))}
                      disabled={isLoading === company.id}
                      className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white font-black shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                    >
                      <Key size={18} />
                      <span className="text-[9px] uppercase tracking-wider text-center">رمز 30 يوم</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAction(company.id, () => generateToken(company.id, 0))}
                      disabled={isLoading === company.id}
                      className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-white font-black shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all"
                    >
                      <Infinity size={18} />
                      <span className="text-[9px] uppercase tracking-wider text-center">رمز دائم</span>
                    </motion.button>

                    {company.id !== 1 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setDeleteConfirm({ id: company.id, name: company.name })}
                          disabled={isLoading === company.id}
                          className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white font-black shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all"
                        >
                          <Trash2 size={18} />
                          <span className="text-[9px] uppercase tracking-wider text-center">حذف الشركة</span>
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAssignPlanModal({ companyId: company.id, companyName: company.name || '' })}
                        className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-white font-black shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                      >
                        <Crown size={18} />
                        <span className="text-[9px] uppercase tracking-wider text-center">تعيين باقة</span>
                      </motion.button>
                    </div>
              </div>

              {/* Loading overlay for card */}
              {isLoading === company.id && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
                    <span className="font-black text-blue-600 text-xs uppercase tracking-widest">جاري التنفيذ...</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {companies.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 flex flex-col items-center gap-8 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
              <Building2 size={48} />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-slate-800">لا توجد منشآت مطابقة</h3>
              <p className="font-bold text-slate-400 text-lg">لم يتم العثور على أي شركات تطابق معايير البحث الحالية.</p>
              <button 
                onClick={() => router.push(pathname)}
                className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                عرض جميع الشركات
              </button>
            </div>
          </motion.div>
)}
        </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100"
              >
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertTriangle size={40} className="text-red-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">تأكيد الحذف</h3>
                    <p className="text-slate-500 font-bold">
                      هل أنت متأكد من حذف شركة <span className="text-red-600 font-black">{deleteConfirm.name}</span>؟
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      سيتم حذف جميع المستخدمين المرتبطين بهذه الشركة نهائياً ولا يمكن استرجاعهم.
                    </p>
                  </div>

                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black hover:bg-slate-200 transition-all"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isLoading === deleteConfirm.id}
                      className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 text-white font-black shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading === deleteConfirm.id ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                      حذف نهائي
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Assign Plan Modal */}
          <AnimatePresence>
            {assignPlanModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setAssignPlanModal(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-100"
                >
                  <div className="flex flex-col items-center text-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
                      <Crown size={40} className="text-purple-600" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-slate-900">تعيين باقة اشتراك</h3>
                      <p className="text-slate-500 font-bold">
                        لشركة <span className="text-purple-600 font-black">{assignPlanModal.companyName}</span>
                      </p>
                    </div>

                    <form onSubmit={handleAssignPlan} className="w-full space-y-4 text-right" dir="rtl">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">اختر الباقة</label>
                        <select name="plan_id" required className="w-full px-4 py-3 bg-slate-100 rounded-xl font-bold">
                          <option value="">-- اختر الباقة --</option>
                          {plans.map(plan => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name} - {plan.price} ر.س / {plan.duration_value} {plan.duration_unit === 'days' ? 'يوم' : plan.duration_unit === 'months' ? 'شهر' : 'سنة'}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ البداية</label>
                          <input 
                            type="date" 
                            name="start_date" 
                            required 
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-slate-100 rounded-xl font-bold" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ النهاية</label>
                          <input 
                            type="date" 
                            name="end_date" 
                            required 
                            defaultValue={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-slate-100 rounded-xl font-bold" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">ملاحظات (اختياري)</label>
                        <textarea name="notes" rows={2} className="w-full px-4 py-3 bg-slate-100 rounded-xl font-bold" placeholder="أي ملاحظات إضافية..." />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setAssignPlanModal(null)}
                          className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 text-slate-700 font-black hover:bg-slate-200 transition-all"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          disabled={assigningPlan}
                          className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-white font-black shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {assigningPlan ? <RefreshCw size={18} className="animate-spin" /> : <Crown size={18} />}
                          تعيين الباقة
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
