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
    <div className="h-full flex flex-col">
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => notification.type !== "loading" && setNotification(prev => ({ ...prev, show: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className={`bg-white rounded-3xl p-8 shadow-2xl border-t-4 ${
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-red-500" : "border-blue-500"
              }`}>
                <div className="text-center">
                  <div className={`h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    notification.type === "success" ? "bg-emerald-100 text-emerald-500" :
                    notification.type === "error" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
                  }`}>
                    {notification.type === "success" && <CheckCircle size={40} />}
                    {notification.type === "error" && <AlertCircle size={40} />}
                    {notification.type === "loading" && <Loader2 size={40} className="animate-spin" />}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{notification.title}</h3>
                  <p className="text-gray-500 mb-6">{notification.message}</p>
                  {notification.type !== "loading" && (
                    <button
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      حسناً
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">مسيرات الرواتب</h1>
                    <p className="text-white/60 text-sm">إدارة مسيرات رواتب الموظفين</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black">{stats.total}</div>
                    <div className="text-[10px] text-white/60 font-bold">إجمالي</div>
                  </div>
                  <div className="bg-emerald-500/20 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-lg font-black text-emerald-300">{Number(stats.total_amount).toLocaleString('ar-SA')}</div>
                    <div className="text-[10px] text-white/60 font-bold">ر.س</div>
                  </div>
                  <div className="bg-green-500/20 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-green-300">{stats.confirmed_count}</div>
                    <div className="text-[10px] text-white/60 font-bold">مؤكد</div>
                  </div>
                  <div className="bg-amber-500/20 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-amber-300">{stats.draft_count}</div>
                    <div className="text-[10px] text-white/60 font-bold">مسودة</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="بحث بشهر المسير أو الباقة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href="/salary-payrolls/new">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">
                    <Plus size={16} />
                    <span>إنشاء مسير جديد</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FileText size={18} />
                <h3 className="font-bold text-sm">قائمة مسيرات الرواتب</h3>
              </div>
              <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold">
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
                            {Number(payroll.total_amount || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
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
          </div>
        </div>
      </div>
    </div>
  );
}
