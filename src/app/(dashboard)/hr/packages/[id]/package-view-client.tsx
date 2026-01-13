"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  MoreVertical, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  AlertTriangle,
  Umbrella,
  CheckCircle2,
  UserPlus,
  Package,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import { deleteEmployee, updateIqamaExpiry, toggleEmployeeStatus } from "@/lib/actions/hr";
import { useRouter } from "next/navigation";

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
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState(searchQuery);
  const [filter, setFilter] = useState(activeFilter);
  const router = useRouter();

  // Navigation logic
  const currentIndex = allPackages.findIndex(p => p.id === packageData.id);
  const prevPackage = currentIndex > 0 ? allPackages[currentIndex - 1] : null;
  const nextPackage = currentIndex < allPackages.length - 1 ? allPackages[currentIndex + 1] : null;

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;
    const result = await deleteEmployee(id);
    if (result.success) {
      toast.success("تم حذف الموظف");
      setEmployees(prev => prev.filter(e => e.id !== id));
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdateExpiry = async (id: number, date: string) => {
    const result = await updateIqamaExpiry(id, date);
    if (result.success) {
      toast.success("تم تحديث تاريخ انتهاء الإقامة");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/hr/packages/${packageData.id}?search=${search}&filter=${filter}`);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    router.push(`/hr/packages/${packageData.id}?search=${search}&filter=${newFilter}`);
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4">
      
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <Link href="/hr" className="hover:text-[#9b59b6] transition-colors flex items-center gap-1">
            <LayoutDashboard size={14} />
            شؤون الموظفين
          </Link>
          <ArrowRight size={14} />
          <Link href="/hr/packages" className="hover:text-[#9b59b6] transition-colors">الباقات</Link>
          <ArrowRight size={14} />
          <span className="text-[#9b59b6]">{packageData.group_name}</span>
        </div>

        <div className="flex items-center gap-2">
          {prevPackage && (
            <Link href={`/hr/packages/${prevPackage.id}`}>
              <button className="h-9 px-4 rounded-lg bg-white border border-gray-100 text-xs font-black text-gray-500 hover:border-[#9b59b6] hover:text-[#9b59b6] transition-all flex items-center gap-2 shadow-sm">
                <ChevronRight size={14} />
                الباقة السابقة
              </button>
            </Link>
          )}
          {nextPackage && (
            <Link href={`/hr/packages/${nextPackage.id}`}>
              <button className="h-9 px-4 rounded-lg bg-white border border-gray-100 text-xs font-black text-gray-500 hover:border-[#9b59b6] hover:text-[#9b59b6] transition-all flex items-center gap-2 shadow-sm">
                الباقة التالية
                <ChevronLeft size={14} />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Package Info Banner */}
      <div className="bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-[#3498db]/20 border border-white/10 flex items-center justify-center text-white">
              <Package size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{packageData.group_name}</h1>
              <div className="flex items-center gap-3 mt-1 opacity-70 text-xs font-bold">
                <span>نظام {packageData.work_type === 'salary' ? 'الراتب' : 'التارجت'}</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>{stats.total_employees} موظف</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatPill label="اكتمال الإقامات" value={`${stats.iqama_complete}/${stats.total_employees}`} />
            <StatPill label="اكتمال الصور" value={`${stats.photo_complete}/${stats.total_employees}`} />
            <Link href={`/hr/packages/${packageData.id}/add-employees`}>
              <button className="h-12 px-6 rounded-xl bg-[#9b59b6] text-white text-sm font-black shadow-lg shadow-[#9b59b6]/20 hover:bg-[#8e44ad] transition-all flex items-center gap-2">
                <UserPlus size={18} />
                إضافة موظفين
              </button>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن موظف بالاسم، رقم الإقامة، أو الكود..."
              className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border-2 border-gray-50 text-sm font-bold focus:border-[#9b59b6]/30 focus:bg-white outline-none transition-all"
            />
          </div>
          
          <select 
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="h-12 px-4 rounded-xl bg-gray-50 border-2 border-gray-50 text-sm font-bold focus:border-[#9b59b6]/30 focus:bg-white outline-none transition-all md:w-48"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">إقامات سارية</option>
            <option value="soon">تنتهي قريباً</option>
            <option value="expired">إقامات منتهية</option>
            <option value="on_leave">في إجازة</option>
          </select>

          <button type="submit" className="h-12 px-8 rounded-xl bg-gray-900 text-white text-sm font-black hover:bg-gray-800 transition-all">
            تطبيق
          </button>
        </form>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">الموظف</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم الإقامة</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">انتهاء الإقامة</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">الراتب</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">الحالة</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp) => (
                <tr key={emp.id} className={`hover:bg-gray-50/50 transition-colors group ${emp.is_active === 0 ? 'bg-orange-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xs">
                        {emp.personal_photo ? (
                          <img src={emp.personal_photo} alt="" className="h-full w-full object-cover rounded-xl" />
                        ) : (
                          emp.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{emp.name}</p>
                        <p className="text-[10px] font-bold text-gray-400">#{emp.user_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-600">{emp.iqama_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="date"
                        defaultValue={emp.iqama_expiry ? format(new Date(emp.iqama_expiry), 'yyyy-MM-dd') : ''}
                        onChange={(e) => handleUpdateExpiry(emp.id, e.target.value)}
                        className="bg-transparent border-none text-xs font-bold text-gray-600 focus:ring-0 cursor-pointer hover:text-[#9b59b6] transition-colors"
                      />
                      <ExpiryIcon date={emp.iqama_expiry} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-gray-900">{Number(emp.basic_salary).toLocaleString()} ر.س</span>
                  </td>
                  <td className="px-6 py-4">
                    {emp.is_active === 1 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-600 text-[9px] font-black uppercase">
                        <CheckCircle2 size={10} />
                        نشط
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50 text-orange-600 text-[9px] font-black uppercase">
                        <Umbrella size={10} />
                        في إجازة
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/hr/employees/${emp.id}`}>
                        <button className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          <Eye size={14} />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Users size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-lg font-black text-gray-400">لا يوجد موظفين يطابقون البحث</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 flex flex-col items-center min-w-[100px]">
      <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black">{value}</span>
    </div>
  );
}

function ExpiryIcon({ date }: { date: string }) {
  if (!date) return null;
  const days = Math.round((new Date(date).getTime() - new Date().getTime()) / 86400000);
  
  if (days <= 0) return <AlertTriangle size={14} className="text-red-500" />;
  if (days <= 30) return <AlertTriangle size={14} className="text-orange-500" />;
  return <CheckCircle2 size={14} className="text-green-500" />;
}
