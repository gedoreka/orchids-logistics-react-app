"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Calendar,
  Users,
  ArrowRight,
  Trash2,
  Printer,
  Edit,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2,
  Clock,
  User,
  Layers
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface PayrollItem {
  id: number;
  employee_name: string;
  iqama_number: string;
  user_code: string;
  basic_salary: number;
  target: number;
  successful_orders: number;
  target_deduction: number;
  monthly_bonus: number;
  operator_deduction: number;
  internal_deduction: number;
  wallet_deduction: number;
  internal_bonus: number;
  net_salary: number;
  payment_method: string;
  housing_allowance: number;
  nationality: string;
}

interface Payroll {
  id: number;
  payroll_month: string;
  package_id: number;
  package_name: string;
  work_type: string;
  monthly_target: number;
  bonus_after_target: number;
  saved_by: string;
  created_at: string;
  is_draft: number;
  total_amount: number;
  total_net: number;
  items: PayrollItem[];
}

interface Company {
  name: string;
  vat_number: string;
  short_address: string;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

interface PayrollViewClientProps {
  payroll: Payroll;
  company: Company;
  companyId: number;
}

export function PayrollViewClient({ payroll, company, companyId }: PayrollViewClientProps) {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });

  const workType = payroll.work_type || 'salary';
  const isSalaryType = workType === 'salary';

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف مسير "${payroll.payroll_month}"؟`)) return;
    
    setDeleteLoading(true);
    showNotification("loading", "جاري الحذف", "جاري حذف المسير...");
    
    try {
      const res = await fetch(`/api/payrolls/${payroll.id}`, { method: "DELETE" });
      
      if (res.ok) {
        showNotification("success", "تم الحذف بنجاح", "تم حذف المسير بنجاح");
        setTimeout(() => {
          router.push("/salary-payrolls");
          router.refresh();
        }, 1500);
      } else {
        showNotification("error", "فشل الحذف", "فشل حذف المسير");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحذف");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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

  const getColSpan = () => {
    if (isSalaryType) return 5;
    return 13;
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 print:hidden"
              onClick={() => notification.type !== "loading" && hideNotification()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md print:hidden"
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
                      onClick={hideNotification}
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

        <div className="flex-1 overflow-auto p-4 md:p-8 print:p-0" dir="rtl">
          <div className="max-w-[1600px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-8 text-white shadow-2xl border border-white/10 print:bg-white print:text-gray-900 print:shadow-none print:border-gray-200 print:rounded-none"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x print:hidden" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 print:hidden">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl">
                      <FileText size={28} className="text-amber-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">تفاصيل مسير الرواتب</h1>
                      <p className="text-slate-400 font-medium text-sm">{payroll.payroll_month} - {getWorkTypeLabel(workType)}</p>
                    </div>
                  </div>
                    <div className="flex flex-wrap gap-2 print:hidden">
                      <Link href="/salary-payrolls">
                        <button className="h-8 px-3 rounded-xl bg-white/10 text-white font-black text-xs hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2">
                          <ArrowRight size={14} />
                          <span>العودة للقائمة</span>
                        </button>
                      </Link>
                      <Link href={`/salary-payrolls/${payroll.id}/edit`}>
                        <button className="h-8 px-3 rounded-xl bg-amber-500/20 text-amber-400 font-black text-xs hover:bg-amber-500 hover:text-white transition-all border border-amber-500/30 flex items-center gap-2">
                          <Edit size={14} />
                          <span>تعديل المسير</span>
                        </button>
                      </Link>
                      <button 
                        onClick={handlePrint}
                        className="h-8 px-3 rounded-xl bg-blue-500/20 text-blue-400 font-black text-xs hover:bg-blue-500 hover:text-white transition-all border border-blue-500/30 flex items-center gap-2"
                      >
                        <Printer size={14} />
                        <span>طباعة المسير</span>
                      </button>
                      <button 
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="h-8 px-3 rounded-xl bg-red-500/20 text-red-400 font-black text-xs hover:bg-red-500 hover:text-white transition-all border border-red-500/30 disabled:opacity-50 flex items-center gap-2"
                      >
                        {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        <span>حذف المسير</span>
                      </button>
                    </div>
                </div>

                <div className="hidden print:block text-center mb-6">
                  <h1 className="text-2xl font-black text-gray-900">مسير رواتب {payroll.payroll_month}</h1>
                  <p className="text-gray-500">{company.name}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 print:bg-gray-50 print:border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 print:bg-blue-100 print:text-blue-600">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 print:text-gray-500">شهر المسير</p>
                        <p className="font-bold text-white print:text-gray-900">{payroll.payroll_month}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 print:bg-gray-50 print:border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 print:bg-purple-100 print:text-purple-600">
                        <Layers size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 print:text-gray-500">الباقة</p>
                        <p className="font-bold text-white print:text-gray-900">{payroll.package_name || 'غير محدد'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 print:bg-gray-50 print:border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400 print:bg-teal-100 print:text-teal-600">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 print:text-gray-500">عدد الموظفين</p>
                        <p className="font-bold text-white print:text-gray-900">{payroll.items?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 print:bg-gray-50 print:border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                        payroll.is_draft ? 'bg-amber-500/20 text-amber-400 print:bg-amber-100 print:text-amber-600' : 'bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-600'
                      }`}>
                        {payroll.is_draft ? <Clock size={18} /> : <CheckCircle size={18} />}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 print:text-gray-500">الحالة</p>
                        <p className="font-bold text-white print:text-gray-900">{payroll.is_draft ? 'مسودة' : 'تم التأكيد'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 print:bg-gray-50 print:border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Building2 size={18} className="text-slate-400 print:text-gray-500" />
                      <h3 className="font-bold text-white print:text-gray-900">بيانات المنشأة</h3>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm"><span className="text-slate-400 print:text-gray-500">الاسم:</span> <span className="font-bold text-white print:text-gray-900">{company.name}</span></p>
                      <p className="text-sm"><span className="text-slate-400 print:text-gray-500">الرقم الضريبي:</span> <span className="font-bold text-white print:text-gray-900">{company.vat_number}</span></p>
                      <p className="text-sm"><span className="text-slate-400 print:text-gray-500">العنوان:</span> <span className="font-bold text-white print:text-gray-900">{company.short_address}</span></p>
                    </div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 print:bg-gray-50 print:border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <User size={18} className="text-slate-400 print:text-gray-500" />
                      <h3 className="font-bold text-white print:text-gray-900">معلومات المسير</h3>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm"><span className="text-slate-400 print:text-gray-500">أنشئ بواسطة:</span> <span className="font-bold text-white print:text-gray-900">{payroll.saved_by || 'مدير النظام'}</span></p>
                      <p className="text-sm"><span className="text-slate-400 print:text-gray-500">تاريخ الإنشاء:</span> <span className="font-bold text-white print:text-gray-900">{payroll.created_at ? format(new Date(payroll.created_at), 'yyyy/MM/dd HH:mm') : '-'}</span></p>
                      <p className="text-sm"><span className="text-slate-400 print:text-gray-500">نظام العمل:</span> <span className="font-bold text-white print:text-gray-900">{getWorkTypeLabel(payroll.work_type)}</span></p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden print:bg-white print:border-gray-200">
                  <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center print:bg-gray-100 print:border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg print:bg-blue-100">
                        <FileText size={16} className="text-blue-400 print:text-blue-600" />
                      </div>
                      <h3 className="font-black text-white text-sm print:text-gray-900">تفاصيل الرواتب</h3>
                    </div>
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-[10px] font-black border border-blue-500/30 print:bg-blue-100 print:text-blue-700 print:border-blue-200">
                      {payroll.items?.length || 0} موظف
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5 print:bg-gray-50">
                        <tr className="border-b border-white/10 print:border-gray-200">
                          <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">#</th>
                          <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">الاسم</th>
                          <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">الإقامة</th>
                          {!isSalaryType && (
                            <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">الكود</th>
                          )}
                          <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">الراتب</th>
                          {isSalaryType ? (
                            <>
                              <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">السكن</th>
                              <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">خصم داخلي</th>
                              <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">مكافأة</th>
                            </>
                          ) : (
                            <>
                              <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">التارقت</th>
                              <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">الطلبات</th>
                              <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">خصم تارقت</th>
                              <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">بونص</th>
                              <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">خ.مشغل</th>
                              <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">خ.داخلي</th>
                              <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">خ.محفظة</th>
                              <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">مكافأة</th>
                            </>
                          )}
                          <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">صافي</th>
                          <th className="text-right px-3 py-3 text-xs font-bold text-slate-400 print:text-gray-600">الدفع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 print:divide-gray-100">
                        {payroll.items?.map((item, index) => (
                          <tr key={item.id} className={`hover:bg-white/5 transition-colors ${Number(item.net_salary) < 0 ? 'bg-red-500/10 print:bg-red-50' : ''}`}>
                            <td className="px-3 py-3 text-slate-400 print:text-gray-500">{index + 1}</td>
                            <td className="px-3 py-3 font-bold text-white whitespace-nowrap print:text-gray-900">{item.employee_name}</td>
                            <td className="px-3 py-3 text-slate-300 whitespace-nowrap print:text-gray-600">{item.iqama_number}</td>
                            {!isSalaryType && (
                              <td className="px-3 py-3 text-slate-300 print:text-gray-600">{item.user_code}</td>
                            )}
                            <td className="px-3 py-3 font-bold text-white print:text-gray-900">{Number(item.basic_salary || 0).toLocaleString('en-US')}</td>
                            {isSalaryType ? (
                              <>
                                <td className="px-3 py-3 text-slate-300 print:text-gray-600">{Number(item.housing_allowance || 0).toLocaleString('en-US')}</td>
                                <td className="px-3 py-3 text-red-400 print:text-red-600">{Number(item.internal_deduction || 0).toLocaleString('en-US')}</td>
                                <td className="px-3 py-3 text-emerald-400 print:text-emerald-600">{Number(item.internal_bonus || 0).toLocaleString('en-US')}</td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 py-3 text-slate-300 print:text-gray-600">{item.target || 0}</td>
                                <td className="px-3 py-3 font-bold text-blue-400 print:text-blue-600">{item.successful_orders || 0}</td>
                                <td className="px-3 py-3 text-red-400 print:text-red-600">{Number(item.target_deduction || 0).toLocaleString('en-US')}</td>
                                <td className="px-3 py-3 text-emerald-400 print:text-emerald-600">{Number(item.monthly_bonus || 0).toLocaleString('en-US')}</td>
                                <td className="px-3 py-3 text-red-400 print:text-red-600">{Number(item.operator_deduction || 0).toLocaleString('en-US')}</td>
                                <td className="px-3 py-3 text-red-400 print:text-red-600">{Number(item.internal_deduction || 0).toLocaleString('en-US')}</td>
                                <td className="px-3 py-3 text-red-400 print:text-red-600">{Number(item.wallet_deduction || 0).toLocaleString('en-US')}</td>
                                <td className="px-3 py-3 text-emerald-400 print:text-emerald-600">{Number(item.internal_bonus || 0).toLocaleString('en-US')}</td>
                              </>
                            )}
                            <td className={`px-3 py-3 font-bold ${Number(item.net_salary) < 0 ? 'text-red-400 print:text-red-600' : 'text-emerald-400 print:text-emerald-600'}`}>
                              {Number(item.net_salary || 0).toLocaleString('en-US')}
                            </td>
                            <td className="px-3 py-3 text-slate-300 print:text-gray-600">{item.payment_method}</td>
                          </tr>
                        ))}
                        <tr className="bg-emerald-500/10 font-bold print:bg-emerald-50">
                          <td colSpan={getColSpan()} className="px-3 py-4 text-left text-emerald-400 print:text-emerald-700">الإجمالي:</td>
                          <td className="px-3 py-4 text-emerald-400 print:text-emerald-700">{Number(payroll.total_net || 0).toLocaleString('en-US')} ريال</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                  <div className="flex justify-center gap-3 print:hidden">
                    <Link href="/salary-payrolls">
                      <button className="h-9 px-4 rounded-xl bg-white/10 text-white font-black text-xs hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2">
                        <ArrowRight size={14} />
                        <span>العودة للقائمة</span>
                      </button>
                    </Link>
                    <Link href={`/salary-payrolls/${payroll.id}/edit`}>
                      <button className="h-9 px-4 rounded-xl bg-amber-500/20 text-amber-400 font-black text-xs hover:bg-amber-500 hover:text-white transition-all border border-amber-500/30 flex items-center gap-2">
                        <Edit size={14} />
                        <span>تعديل المسير</span>
                      </button>
                    </Link>
                    <button 
                      onClick={handlePrint}
                      className="h-9 px-4 rounded-xl bg-blue-500/20 text-blue-400 font-black text-xs hover:bg-blue-500 hover:text-white transition-all border border-blue-500/30 flex items-center gap-2"
                    >
                      <Printer size={14} />
                      <span>طباعة المسير</span>
                    </button>
                  </div>
              </div>

              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl print:hidden" />
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl print:hidden" />
            </motion.div>
          </div>
        </div>
    </div>
  );
}
