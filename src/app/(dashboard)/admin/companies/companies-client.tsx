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
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Company } from "@/lib/types";
import { approveCompany, rejectCompany, toggleCompanyStatus, generateToken } from "@/lib/actions/admin";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
        // Refresh data
        window.location.reload();
      } else {
        toast.error(result.error || "حدث خطأ");
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <Building2 size={400} className="absolute -left-20 -top-20 rotate-12" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest mb-4"
          >
            <ShieldAlert size={16} className="text-[#3498db]" />
            لوحة تحكم الإدارة
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">إدارة طلبات الشركات</h1>
          <p className="text-white/60 font-bold text-xl max-w-2xl mx-auto italic">
            مراجعة وتفعيل المنشآت الجديدة والتحكم في تراخيص الوصول للنظام
          </p>

          <div className="flex flex-wrap justify-center gap-6 pt-8">
            <div className="bg-white/10 backdrop-blur-md px-10 py-4 rounded-3xl border border-white/10">
              <span className="block text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">إجمالي الشركات</span>
              <span className="text-3xl font-black">{companies.length}</span>
            </div>
            <div className="bg-green-500/20 backdrop-blur-md px-10 py-4 rounded-3xl border border-green-500/20">
              <span className="block text-green-400/70 text-[10px] font-black uppercase tracking-widest mb-1">المقبولة</span>
              <span className="text-3xl font-black text-green-400">
                {companies.filter(c => c.status === 'approved').length}
              </span>
            </div>
            <div className="bg-orange-500/20 backdrop-blur-md px-10 py-4 rounded-3xl border border-orange-500/20">
              <span className="block text-orange-400/70 text-[10px] font-black uppercase tracking-widest mb-1">قيد المراجعة</span>
              <span className="text-3xl font-black text-orange-400">
                {companies.filter(c => c.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border-2 border-gray-100 p-8 shadow-xl flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 group w-full">
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3498db] transition-colors" size={22} />
          <input
            type="text"
            placeholder="ابحث باسم الشركة، الرقم التجاري، أو الرقم الضريبي..."
            defaultValue={search}
            onChange={(e) => updateQueryParams("search", e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-5 pr-16 pl-8 font-bold text-gray-700 focus:border-[#3498db]/30 focus:ring-4 focus:ring-[#3498db]/5 outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { id: "all", label: "الكل", icon: ArrowUpDown },
            { id: "approved", label: "مقبولة", icon: CheckCircle },
            { id: "rejected", label: "مرفوضة", icon: XCircle },
            { id: "pending", label: "قيد المراجعة", icon: RefreshCw },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => updateQueryParams("filter", filter.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-sm transition-all",
                statusFilter === filter.id
                  ? "bg-[#3498db] text-white shadow-lg shadow-[#3498db]/20"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              <filter.icon size={18} />
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Companies List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-[2.5rem] border-2 border-gray-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative"
            >
              <div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center">
                {/* Status Badges */}
                <div className="flex gap-2 mb-4 xl:mb-0">
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border",
                    company.status === 'approved' ? "bg-green-50 text-green-600 border-green-100" :
                    company.status === 'rejected' ? "bg-red-50 text-red-600 border-red-100" :
                    "bg-orange-50 text-orange-600 border-orange-100"
                  )}>
                    {company.status === 'approved' ? 'مقبول' : company.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                  </span>
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border",
                    company.is_active ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-50 text-gray-400 border-gray-100"
                  )}>
                    {company.is_active ? 'نشط' : 'موقوف'}
                  </span>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-[#3498db] transition-colors">{company.name}</h3>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
                      <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                        <Calendar size={14} />
                        <span>تاريخ الانضمام: {new Date(company.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
                        <Key size={14} />
                        <span>الرقم الضريبي: {company.vat_number || '---'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group-hover:bg-white transition-colors">
                      <span className="block text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">السجل التجاري</span>
                      <span className="font-black text-gray-700 text-sm">{company.commercial_number}</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group-hover:bg-white transition-colors">
                      <span className="block text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">الدولة</span>
                      <span className="font-black text-gray-700 text-sm">{company.country || 'السعودية'}</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group-hover:bg-white transition-colors">
                      <span className="block text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">رمز التفعيل</span>
                      <span className="font-black text-[#3498db] text-sm truncate block">{company.access_token || 'لم يتم الإنشاء'}</span>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 group-hover:bg-white transition-colors">
                      <span className="block text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">انتهاء الترخيص</span>
                      <span className="font-black text-orange-600 text-sm italic">{company.token_expiry || 'غير محدد'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap xl:flex-nowrap gap-3 w-full xl:w-auto">
                  {company.status === 'pending' && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction(company.id, () => approveCompany(company.id))}
                        disabled={isLoading === company.id}
                        className="flex-1 xl:w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center gap-2 xl:gap-0 px-4 xl:px-0 font-black shadow-lg shadow-green-500/20"
                      >
                        <CheckCircle size={20} />
                        <span className="xl:hidden text-sm">قبول الطلب</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAction(company.id, () => rejectCompany(company.id))}
                        disabled={isLoading === company.id}
                        className="flex-1 xl:w-12 h-12 rounded-2xl bg-red-500 text-white flex items-center justify-center gap-2 xl:gap-0 px-4 xl:px-0 font-black shadow-lg shadow-red-500/20"
                      >
                        <XCircle size={20} />
                        <span className="xl:hidden text-sm">رفض الطلب</span>
                      </motion.button>
                    </>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAction(company.id, () => toggleCompanyStatus(company.id, company.is_active))}
                    disabled={isLoading === company.id}
                    className={cn(
                      "flex-1 xl:w-12 h-12 rounded-2xl flex items-center justify-center gap-2 xl:gap-0 px-4 xl:px-0 font-black shadow-lg",
                      company.is_active ? "bg-gray-100 text-gray-500 shadow-gray-200/20" : "bg-blue-500 text-white shadow-blue-500/20"
                    )}
                    title={company.is_active ? "إيقاف المنشأة" : "تفعيل المنشأة"}
                  >
                    <Power size={20} />
                    <span className="xl:hidden text-sm">{company.is_active ? 'إيقاف' : 'تفعيل'}</span>
                  </motion.button>

                  <div className="flex gap-2 flex-1 xl:flex-initial">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAction(company.id, () => generateToken(company.id, 30))}
                      disabled={isLoading === company.id}
                      className="flex-1 xl:w-auto px-6 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center gap-2 font-black shadow-lg shadow-purple-500/20 text-xs uppercase tracking-wider"
                    >
                      <Key size={16} />
                      <span>30 يوم</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAction(company.id, () => generateToken(company.id, 0))}
                      disabled={isLoading === company.id}
                      className="flex-1 xl:w-auto px-6 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center gap-2 font-black shadow-lg shadow-teal-500/20 text-xs uppercase tracking-wider"
                    >
                      <Infinity size={16} />
                      <span>دائم</span>
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 xl:w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center gap-2 xl:gap-0 px-4 xl:px-0 font-black shadow-lg shadow-black/20"
                  >
                    <Eye size={20} />
                    <span className="xl:hidden text-sm">عرض التفاصيل</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {companies.length === 0 && (
          <div className="py-24 flex flex-col items-center gap-6 opacity-30 text-center">
            <Building2 size={100} />
            <div className="space-y-2">
              <span className="text-3xl font-black block">لا توجد منشآت مطابقة</span>
              <p className="font-bold">جرب تغيير معايير البحث أو الفلترة</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
