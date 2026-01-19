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
  Clock,
  X,
  AlertTriangle,
  ShieldAlert
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

interface DeleteConfirmState {
  show: boolean;
  payrollId: number | null;
  payrollMonth: string;
  employeeCount: number;
  totalAmount: number;
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
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    show: false,
    payrollId: null,
    payrollMonth: "",
    employeeCount: 0,
    totalAmount: 0
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
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
    }
  };

  const openDeleteConfirm = (payroll: Payroll) => {
    setDeleteConfirm({
      show: true,
      payrollId: payroll.id,
      payrollMonth: payroll.payroll_month,
      employeeCount: payroll.employee_count,
      totalAmount: payroll.total_amount
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({
      show: false,
      payrollId: null,
      payrollMonth: "",
      employeeCount: 0,
      totalAmount: 0
    });
  };

    const handleDelete = async () => {
      if (!deleteConfirm.payrollId) return;
      
      const id = deleteConfirm.payrollId;
      const payrollMonth = deleteConfirm.payrollMonth;
      setDeleteLoading(id);
      closeDeleteConfirm();
      showNotification("loading", "جاري الحذف", `جاري حذف مسير ${payrollMonth}...`);
      
      try {
        const res = await fetch(`/api/payrolls/${id}`, { method: "DELETE" });
        
        if (res.ok) {
          setPayrolls(prev => prev.filter(p => p.id !== id));
          showNotification("success", "تم الحذف بنجاح", `تم حذف مسير "${payrollMonth}" بشكل صحيح`);
          router.refresh();
        } else {
          const data = await res.json().catch(() => ({}));
          showNotification("error", "فشل الحذف", data.error || "فشل حذف المسير، يرجى المحاولة مرة أخرى");
        }
      } catch {
        showNotification("error", "خطأ في الاتصال", "حدث خطأ أثناء الحذف، يرجى التحقق من الاتصال");
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
        <div className="min-h-screen p-4 md:p-8" dir="rtl">
          <AnimatePresence>
            {notification.show && (
              <motion.div
                initial={{ opacity: 0, y: -50, x: 50 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={`fixed top-6 left-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
                  notification.type === "success"
                    ? "bg-emerald-500/90 border-emerald-400/50 text-white"
                    : notification.type === "error"
                    ? "bg-rose-500/90 border-rose-400/50 text-white"
                    : "bg-blue-500/90 border-blue-400/50 text-white"
                }`}
              >
                {notification.type === "success" && <CheckCircle size={20} />}
                {notification.type === "error" && <AlertCircle size={20} />}
                {notification.type === "loading" && <Loader2 size={20} className="animate-spin" />}
                <div>
                  <p className="font-black text-sm">{notification.title}</p>
                  <p className="text-xs opacity-90">{notification.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {deleteConfirm.show && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                  onClick={closeDeleteConfirm}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                >
                  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                          <ShieldAlert size={32} />
                        </div>
                        <div>
                          <h2 className="text-xl font-black">تأكيد الحذف</h2>
                          <p className="text-white/70 text-sm">هل أنت متأكد من هذا الإجراء؟</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle size={24} className="text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-red-900 text-sm">أنت على وشك حذف مسير الرواتب التالي:</p>
                            <p className="text-red-700 font-black text-lg mt-1">{deleteConfirm.payrollMonth}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                            <Users size={14} />
                            <span className="text-xs font-bold">عدد الموظفين</span>
                          </div>
                          <p className="text-lg font-black text-gray-900">{deleteConfirm.employeeCount}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                            <DollarSign size={14} />
                            <span className="text-xs font-bold">إجمالي المسير</span>
                          </div>
                          <p className="text-lg font-black text-gray-900">{Number(deleteConfirm.totalAmount || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-amber-800 text-xs font-bold text-center">
                          سيتم حذف جميع بيانات المسير بشكل نهائي ولا يمكن التراجع عن هذا الإجراء
                        </p>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={closeDeleteConfirm}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all"
                        >
                          <X size={16} />
                          <span>إلغاء</span>
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25"
                        >
                          <Trash2 size={16} />
                          <span>تأكيد الحذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
    
          <div className="max-w-[1600px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-8 text-white shadow-2xl border border-white/10"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x" />
              
              <div className="relative z-10 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                      <FileText size={28} className="text-amber-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">مسيرات الرواتب</h1>
                      <p className="text-slate-400 font-medium text-sm">إدارة مسيرات رواتب الموظفين وتنظيم الدفعات المالية</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/5 text-center">
                      <div className="text-lg font-black text-white">{stats.total}</div>
                      <div className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">إجمالي</div>
                    </div>
                    <div className="bg-emerald-500/10 backdrop-blur-md rounded-xl p-3 border border-emerald-500/20 text-center">
                      <div className="text-lg font-black text-emerald-400">{Number(stats.total_amount).toLocaleString()}</div>
                      <div className="text-[9px] text-emerald-200/60 font-bold uppercase tracking-wider">ر.س</div>
                    </div>
                    <div className="bg-blue-500/10 backdrop-blur-md rounded-xl p-3 border border-blue-500/20 text-center">
                      <div className="text-lg font-black text-blue-400">{stats.confirmed_count}</div>
                      <div className="text-[9px] text-blue-200/60 font-bold uppercase tracking-wider">مؤكد</div>
                    </div>
                    <div className="bg-amber-500/10 backdrop-blur-md rounded-xl p-3 border border-amber-500/20 text-center">
                      <div className="text-lg font-black text-amber-400">{stats.draft_count}</div>
                      <div className="text-[9px] text-amber-200/60 font-bold uppercase tracking-wider">مسودة</div>
                    </div>
                  </div>
                </div>
              
                {/* Search and Action Section */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="بحث بشهر المسير أو الباقة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-12 pl-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold transition-all"
                    />
                  </div>
                  <Link href="/salary-payrolls/new">
                    <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-black text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                      <Plus size={18} />
                      <span>إنشاء مسير جديد</span>
                    </button>
                  </Link>
                </div>

                {/* Payrolls List Section */}
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FileText size={16} className="text-blue-400" />
                      </div>
                      <h3 className="font-black text-white text-sm">قائمة مسيرات الرواتب</h3>
                    </div>
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-[10px] font-black border border-blue-500/30">
                      {filteredPayrolls.length} مسير
                    </span>
                  </div>


            {filteredPayrolls.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr className="border-b border-white/10">
                      <th className="text-right px-4 py-3 text-xs font-bold text-slate-400">#</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-slate-400">شهر المسير</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-slate-400">الباقة</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-slate-400">عدد الموظفين</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-slate-400">إجمالي الرواتب</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-slate-400">الحالة</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-slate-400">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPayrolls.map((payroll) => (
                      <tr key={payroll.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-400">{payroll.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                              <Calendar size={14} />
                            </div>
                            <span className="font-bold text-white text-sm">{payroll.payroll_month}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-white text-sm">{payroll.package_name || 'غير محدد'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full inline-block w-fit ${getWorkTypeBadge(payroll.work_type)}`}>
                              {getWorkTypeLabel(payroll.work_type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Users size={14} className="text-slate-400" />
                            <span className="font-bold text-white">{payroll.employee_count}</span>
                            <span className="text-slate-400 text-xs">موظف</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                            <DollarSign size={14} />
                            {Number(payroll.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            <span className="text-xs text-slate-400">ر.س</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {payroll.is_draft ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                              <Clock size={10} />
                              مسودة
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                              <CheckCircle size={10} />
                              تم التأكيد
                            </span>
                          )}
                        </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <Link href={`/salary-payrolls/${payroll.id}`}>
                                <button className="h-7 px-2.5 rounded-lg bg-blue-500/10 text-blue-400 flex items-center gap-1.5 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/30 whitespace-nowrap" title="عرض المسير">
                                  <Eye size={12} />
                                  <span className="text-[11px] font-black">عرض المسير</span>
                                </button>
                              </Link>
                              <Link href={`/salary-payrolls/${payroll.id}/edit`}>
                                <button className="h-7 px-2.5 rounded-lg bg-amber-500/10 text-amber-400 flex items-center gap-1.5 hover:bg-amber-500 hover:text-white transition-all border border-amber-500/30 whitespace-nowrap" title="تعديل المسير">
                                  <Edit size={12} />
                                  <span className="text-[11px] font-black">تعديل المسير</span>
                                </button>
                              </Link>
                              <button 
                                onClick={() => openDeleteConfirm(payroll)}
                                disabled={deleteLoading === payroll.id}
                                className="h-7 px-2.5 rounded-lg bg-red-500/10 text-red-400 flex items-center gap-1.5 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 border border-red-500/30 whitespace-nowrap"
                                title="حذف المسير"
                              >
                                {deleteLoading === payroll.id ? (
                                  <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 size={12} />
                                    <span className="text-[11px] font-black">حذف المسير</span>
                                  </>
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
                <FileText size={48} className="mx-auto text-slate-600 mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">لا توجد مسيرات رواتب</h4>
                <p className="text-slate-400 text-sm mb-4">ابدأ بإنشاء مسير رواتب جديد</p>
                <Link href="/salary-payrolls/new">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">
                    <Plus size={16} />
                    <span>إنشاء مسير جديد</span>
                  </button>
                </Link>
              </div>
            )}
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
    );
  }
