"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Printer,
  Download,
  Clock
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Payroll {
  id: number;
  payroll_month: string;
  package_id: number;
  package_name: string;
  work_type: string;
  saved_by: string;
  created_at: string;
  is_draft: number;
  total_amount: number;
  employee_count: number;
}

interface PayrollsListClientProps {
  payrolls: Payroll[];
  stats: {
    total: number;
    total_amount: number;
    draft_count: number;
    confirmed_count: number;
  };
  companyId: number;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function PayrollsListClient({ payrolls: initialPayrolls, stats, companyId }: PayrollsListClientProps) {
  const [payrolls, setPayrolls] = useState(initialPayrolls);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });
  const router = useRouter();

  const filteredPayrolls = payrolls.filter(p => {
    const search = searchTerm.toLowerCase();
    return (
      p.payroll_month?.toLowerCase().includes(search) ||
      p.package_name?.toLowerCase().includes(search) ||
      p.saved_by?.toLowerCase().includes(search)
    );
  });

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    if (type !== "loading") {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    }
  };

  const handleDelete = async (id: number, month: string) => {
    if (!confirm(`هل أنت متأكد من حذف مسير "${month}"؟`)) return;
    
    setDeleteLoading(id);
    showNotification("loading", "جاري الحذف", "جاري حذف المسير...");
    
    try {
      const res = await fetch(`/api/payrolls/${id}`, { method: "DELETE" });
      
      if (res.ok) {
        setPayrolls(prev => prev.filter(p => p.id !== id));
        showNotification("success", "تم الحذف بنجاح", "تم حذف المسير بنجاح");
        router.refresh();
      } else {
        showNotification("error", "فشل الحذف", "فشل حذف المسير");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحذف");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getWorkTypeLabel = (type: string) => {
    switch (type) {
      case 'salary': return 'الراتب الثابت';
      case 'target': return 'نظام التارقت';
      case 'tiers': return 'نظام الشرائح';
      case 'commission': return 'نظام العمولة';
      default: return type;
    }
  };

  const getWorkTypeBadge = (type: string) => {
    switch (type) {
      case 'salary': return 'bg-emerald-100 text-emerald-700';
      case 'target': return 'bg-blue-100 text-blue-700';
      case 'tiers': return 'bg-purple-100 text-purple-700';
      case 'commission': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

    return (
      <div className="min-h-screen p-4 md:p-8 space-y-8" dir="rtl">
        <AnimatePresence>
          {/* ... notification code ... */}
        </AnimatePresence>
  
        <div className="max-w-[1600px] mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                    <FileText size={32} className="text-amber-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">مسيرات الرواتب</h1>
                    <p className="text-slate-300 font-medium">إدارة مسيرات رواتب الموظفين وتنظيم الدفعات المالية</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 text-center">
                    <div className="text-xl font-black text-white">{stats.total}</div>
                    <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">إجمالي</div>
                  </div>
                  <div className="bg-emerald-500/10 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 text-center">
                    <div className="text-xl font-black text-emerald-400">{Number(stats.total_amount).toLocaleString()}</div>
                    <div className="text-[9px] text-emerald-200/60 font-bold uppercase tracking-wider">ر.س</div>
                  </div>
                  <div className="bg-blue-500/10 backdrop-blur-md rounded-2xl p-4 border border-blue-500/20 text-center">
                    <div className="text-xl font-black text-blue-400">{stats.confirmed_count}</div>
                    <div className="text-[9px] text-blue-200/60 font-bold uppercase tracking-wider">مؤكد</div>
                  </div>
                  <div className="bg-amber-500/10 backdrop-blur-md rounded-2xl p-4 border border-amber-500/20 text-center">
                    <div className="text-xl font-black text-amber-400">{stats.draft_count}</div>
                    <div className="text-[9px] text-amber-200/60 font-bold uppercase tracking-wider">مسودة</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
          </motion.div>
  
          <motion.div 
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 p-6 shadow-2xl"
            whileHover={{ y: -2 }}
          >
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="بحث بشهر المسير أو الباقة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-14 pl-6 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold transition-all shadow-sm"
                />
              </div>
              <div className="flex gap-4">
                <Link href="/salary-payrolls/new">
                  <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                    <Plus size={20} />
                    <span>إنشاء مسير جديد</span>
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
  
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden"
          >
            <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText size={18} className="text-blue-600" />
                </div>
                <h3 className="font-black text-slate-800 text-sm">قائمة مسيرات الرواتب</h3>
              </div>
              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black shadow-lg">
                {filteredPayrolls.length} مسير
              </span>
            </div>


            {filteredPayrolls.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-100">
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">#</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">شهر المسير</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">الباقة</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">عدد الموظفين</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">إجمالي الرواتب</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">الحالة</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredPayrolls.map((payroll) => (
                      <tr key={payroll.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-500">{payroll.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                              <Calendar size={14} />
                            </div>
                            <span className="font-bold text-gray-900 text-sm">{payroll.payroll_month}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-gray-900 text-sm">{payroll.package_name || 'غير محدد'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${getWorkTypeBadge(payroll.work_type)}`}>
                              {getWorkTypeLabel(payroll.work_type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Users size={14} className="text-gray-400" />
                            <span className="font-bold">{payroll.employee_count}</span>
                            <span className="text-gray-400 text-xs">موظف</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                            <DollarSign size={14} />
                            {Number(payroll.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            <span className="text-xs text-gray-400">ر.س</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {payroll.is_draft ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                              <Clock size={10} />
                              مسودة
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                              <CheckCircle size={10} />
                              تم التأكيد
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1 flex-wrap">
                            <Link href={`/payrolls/${payroll.id}`}>
                              <button className="h-7 w-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all" title="عرض">
                                <Eye size={14} />
                              </button>
                            </Link>
                            <Link href={`/payrolls/${payroll.id}/edit`}>
                              <button className="h-7 w-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all" title="تعديل">
                                <Edit size={14} />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(payroll.id, payroll.payroll_month)}
                              disabled={deleteLoading === payroll.id}
                              className="h-7 w-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                              title="حذف"
                            >
                              {deleteLoading === payroll.id ? (
                                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                <h4 className="text-lg font-bold text-gray-600 mb-2">لا توجد مسيرات رواتب</h4>
                <p className="text-gray-400 text-sm mb-4">ابدأ بإنشاء مسير رواتب جديد</p>
                <Link href="/salary-payrolls/new">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">
                    <Plus size={16} />
                    <span>إنشاء مسير جديد</span>
                  </button>
                </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
    );
}
