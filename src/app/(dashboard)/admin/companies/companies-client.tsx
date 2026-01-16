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
  Eye,
  RefreshCw,
  Percent,
  IdCard,
  Phone,
  PlayCircle,
  PauseCircle,
  Lock,
  Plus,
  Trash2,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  Shield,
  Copy,
  ExternalLink,
  MoreVertical,
  Mail,
  Globe,
  ChevronDown,
  Filter as FilterIcon
} from "lucide-react";
import { toast } from "sonner";
import { Company } from "@/lib/types";
import { approveCompany, rejectCompany, toggleCompanyStatus, generateToken, deleteCompany } from "@/lib/actions/admin";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CompaniesClientProps {
  initialCompanies: Company[];
  statusFilter: string;
  search: string;
}

export function CompaniesClient({ initialCompanies, statusFilter, search }: CompaniesClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [companies, setCompanies] = useState(initialCompanies);
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم النسخ");
  };

  const pendingCount = companies.filter(c => c.status === 'pending').length;
  const approvedCount = companies.filter(c => c.status === 'approved').length;
  const rejectedCount = companies.filter(c => c.status === 'rejected').length;

  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto space-y-6 p-4 lg:p-6">
        
        {/* Compact Premium Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.03\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 via-amber-500 to-blue-500 bg-[length:200%_100%] animate-gradient-x" />
          
          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                    إدارة طلبات المنشآت
                  </h1>
                  <p className="text-slate-400 text-sm font-medium mt-0.5">
                    مراجعة وإدارة طلبات تسجيل الشركات
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2.5 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">الإجمالي</span>
                    <span className="text-lg font-black text-white">{companies.length}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 px-4 py-2.5 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400/70 font-bold uppercase tracking-wider block">قيد المراجعة</span>
                    <span className="text-lg font-black text-amber-400">{pendingCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 px-4 py-2.5 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-wider block">مقبولة</span>
                    <span className="text-lg font-black text-emerald-400">{approvedCount}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 px-4 py-2.5 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-400/70 font-bold uppercase tracking-wider block">مرفوضة</span>
                    <span className="text-lg font-black text-rose-400">{rejectedCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث باسم الشركة، الرقم التجاري، أو الرقم الضريبي..."
                defaultValue={search}
                onChange={(e) => updateQueryParams("search", e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pr-12 pl-4 font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap justify-center">
              {[
                { id: "all", label: "الكل", count: companies.length, color: "slate" },
                { id: "pending", label: "قيد المراجعة", count: pendingCount, color: "amber" },
                { id: "approved", label: "مقبولة", count: approvedCount, color: "emerald" },
                { id: "rejected", label: "مرفوضة", count: rejectedCount, color: "rose" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => updateQueryParams("filter", filter.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all relative",
                    statusFilter === filter.id
                      ? filter.color === "slate" 
                        ? "bg-slate-900 text-white shadow-lg"
                        : filter.color === "amber"
                        ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                        : filter.color === "emerald"
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  )}
                >
                  <span>{filter.label}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[10px] font-black",
                    statusFilter === filter.id 
                      ? "bg-white/20" 
                      : "bg-slate-200 dark:bg-slate-600"
                  )}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Companies Table/Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {companies.map((company, index) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 overflow-hidden"
              >
                {/* Status Bar */}
                <div className={cn(
                  "absolute top-0 left-0 right-0 h-1",
                  company.status === 'approved' ? "bg-gradient-to-r from-emerald-400 to-teal-500" :
                  company.status === 'rejected' ? "bg-gradient-to-r from-rose-400 to-pink-500" :
                  "bg-gradient-to-r from-amber-400 to-orange-500"
                )} />

                <div className="p-5">
                  {/* Main Row - Always Visible */}
                  <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                    {/* Company Info */}
                    <div className="flex-1 flex items-start gap-4">
                      {/* Logo/Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                        <Building2 className="w-6 h-6 text-slate-500 dark:text-slate-400" />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                            {company.name}
                          </h3>
                          {company.is_active ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <IdCard className="w-3.5 h-3.5" />
                            {company.commercial_number}
                          </span>
                          {company.vat_number && (
                            <span className="flex items-center gap-1">
                              <Percent className="w-3.5 h-3.5" />
                              {company.vat_number}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(company.created_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold",
                        company.status === 'approved' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                        company.status === 'rejected' ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" :
                        "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}>
                        {company.status === 'approved' ? <CheckCircle className="w-3.5 h-3.5" /> : 
                         company.status === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> : 
                         <Clock className="w-3.5 h-3.5 animate-pulse" />}
                        {company.status === 'approved' ? 'مقبول' : company.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                      </span>
                      
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold",
                        company.is_active 
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                          : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                      )}>
                        {company.is_active ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
                        {company.is_active ? 'نشط' : 'موقوف'}
                      </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      {/* Approve/Reject for Pending */}
                      {company.status === 'pending' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction(company.id, () => approveCompany(company.id))}
                            disabled={isLoading === company.id}
                            className="w-10 h-10 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 flex items-center justify-center transition-all"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAction(company.id, () => rejectCompany(company.id))}
                            disabled={isLoading === company.id}
                            className="w-10 h-10 rounded-xl bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 flex items-center justify-center transition-all"
                          >
                            <XCircle className="w-5 h-5" />
                          </motion.button>
                        </>
                      )}

                      {/* Approved/Rejected indicator */}
                      {company.status !== 'pending' && (
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          company.status === 'approved' 
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500" 
                            : "bg-rose-100 dark:bg-rose-500/20 text-rose-500"
                        )}>
                          {company.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                      )}

                      <Link href={`/admin/companies/${company.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-10 h-10 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>
                      </Link>

                      <button
                        onClick={() => setExpandedCard(expandedCard === company.id ? null : company.id)}
                        className={cn(
                          "w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all",
                          expandedCard === company.id 
                            ? "bg-slate-900 border-slate-900 text-white" 
                            : "border-slate-200 dark:border-slate-600 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                        )}
                      >
                        <ChevronDown className={cn("w-5 h-5 transition-transform", expandedCard === company.id && "rotate-180")} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Section */}
                  <AnimatePresence>
                    {expandedCard === company.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-700">
                          {/* Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                <Phone className="w-3.5 h-3.5" />
                                الهاتف
                              </div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{company.phone || '---'}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                <MapPin className="w-3.5 h-3.5" />
                                المنطقة
                              </div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{company.region || company.district || '---'}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                <Key className="w-3.5 h-3.5" />
                                رمز التفعيل
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 truncate">
                                  {company.access_token || '---'}
                                </span>
                                {company.access_token && (
                                  <button 
                                    onClick={() => copyToClipboard(company.access_token!)}
                                    className="text-slate-400 hover:text-blue-500 transition-colors"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                <Calendar className="w-3.5 h-3.5" />
                                انتهاء التفعيل
                              </div>
                              <span className="text-sm font-bold">
                                {company.token_expiry && company.token_expiry !== '0000-00-00' ? (
                                  <span className="text-amber-600 dark:text-amber-400">{new Date(company.token_expiry).toLocaleDateString('ar-SA')}</span>
                                ) : (
                                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <Infinity className="w-4 h-4" />
                                    دائم
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/admin/companies/${company.id}/permissions`}>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
                              >
                                <Lock className="w-4 h-4" />
                                الصلاحيات
                              </motion.button>
                            </Link>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAction(company.id, () => toggleCompanyStatus(company.id, company.is_active))}
                              disabled={isLoading === company.id}
                              className={cn(
                                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all",
                                company.is_active 
                                  ? "bg-amber-500 text-white shadow-amber-500/20 hover:shadow-amber-500/40" 
                                  : "bg-cyan-500 text-white shadow-cyan-500/20 hover:shadow-cyan-500/40"
                              )}
                            >
                              <Power className="w-4 h-4" />
                              {company.is_active ? 'إيقاف المنشأة' : 'تفعيل المنشأة'}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAction(company.id, () => generateToken(company.id, 30))}
                              disabled={isLoading === company.id}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all"
                            >
                              <Key className="w-4 h-4" />
                              رمز 30 يوم
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAction(company.id, () => generateToken(company.id, 0))}
                              disabled={isLoading === company.id}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all"
                            >
                              <Infinity className="w-4 h-4" />
                              رمز دائم
                            </motion.button>

                            {company.id !== 1 && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setDeleteConfirm({ id: company.id, name: company.name })}
                                disabled={isLoading === company.id}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                                حذف
                              </motion.button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Loading Overlay */}
                {isLoading === company.id && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="font-bold text-blue-600 text-sm">جاري التنفيذ...</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {companies.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center gap-6 text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">لا توجد منشآت</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">لم يتم العثور على شركات تطابق البحث</p>
              </div>
              <button 
                onClick={() => router.push(pathname)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                عرض الكل
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Delete Modal */}
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
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700"
              >
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">تأكيد الحذف</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      حذف <span className="text-red-600 font-bold">{deleteConfirm.name}</span>؟
                    </p>
                    <p className="text-[11px] text-slate-400">
                      سيتم حذف جميع البيانات المرتبطة نهائياً
                    </p>
                  </div>

                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isLoading === deleteConfirm.id}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/30 hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading === deleteConfirm.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      حذف
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
