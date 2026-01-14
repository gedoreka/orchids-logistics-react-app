"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Calendar,
  Users,
  DollarSign,
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
  Target,
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

      <div className="flex-1 overflow-auto p-6 print:p-0">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 text-white shadow-xl print:hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">تفاصيل مسير الرواتب</h1>
                    <p className="text-white/60 text-sm">{payroll.payroll_month}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/salary-payrolls">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                      <ArrowRight size={16} />
                      <span>القائمة</span>
                    </button>
                  </Link>
                  <Link href={`/payrolls/${payroll.id}/edit`}>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all">
                      <Edit size={16} />
                      <span>تعديل</span>
                    </button>
                  </Link>
                  <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all"
                  >
                    <Printer size={16} />
                    <span>طباعة</span>
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          </div>

          <div className="print:block hidden text-center mb-6">
            <h1 className="text-2xl font-black text-gray-900">مسير رواتب {payroll.payroll_month}</h1>
            <p className="text-gray-500">{company.name}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 print:shadow-none print:border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">شهر المسير</p>
                  <p className="font-bold text-gray-900">{payroll.payroll_month}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 print:shadow-none print:border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                  <Layers size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">الباقة</p>
                  <p className="font-bold text-gray-900">{payroll.package_name || 'غير محدد'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 print:shadow-none print:border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">عدد الموظفين</p>
                  <p className="font-bold text-gray-900">{payroll.items?.length || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 print:shadow-none print:border">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  payroll.is_draft ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                }`}>
                  {payroll.is_draft ? <Clock size={18} /> : <CheckCircle size={18} />}
                </div>
                <div>
                  <p className="text-xs text-gray-500">الحالة</p>
                  <p className="font-bold text-gray-900">{payroll.is_draft ? 'مسودة' : 'تم التأكيد'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 print:shadow-none print:border">
              <div className="flex items-center gap-3 mb-3">
                <Building2 size={18} className="text-gray-400" />
                <h3 className="font-bold text-gray-900">بيانات المنشأة</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm"><span className="text-gray-500">الاسم:</span> <span className="font-bold">{company.name}</span></p>
                <p className="text-sm"><span className="text-gray-500">الرقم الضريبي:</span> <span className="font-bold">{company.vat_number}</span></p>
                <p className="text-sm"><span className="text-gray-500">العنوان:</span> <span className="font-bold">{company.short_address}</span></p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 print:shadow-none print:border">
              <div className="flex items-center gap-3 mb-3">
                <User size={18} className="text-gray-400" />
                <h3 className="font-bold text-gray-900">معلومات المسير</h3>
              </div>
              <div className="space-y-2">
                <p className="text-sm"><span className="text-gray-500">أنشئ بواسطة:</span> <span className="font-bold">{payroll.saved_by || 'مدير النظام'}</span></p>
                <p className="text-sm"><span className="text-gray-500">تاريخ الإنشاء:</span> <span className="font-bold">{payroll.created_at ? format(new Date(payroll.created_at), 'yyyy/MM/dd HH:mm') : '-'}</span></p>
                <p className="text-sm"><span className="text-gray-500">نظام العمل:</span> <span className="font-bold">{getWorkTypeLabel(payroll.work_type)}</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border">
            <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] px-4 py-3 flex justify-between items-center print:bg-gray-100">
              <div className="flex items-center gap-2 text-white print:text-gray-800">
                <FileText size={18} />
                <h3 className="font-bold text-sm">تفاصيل الرواتب</h3>
              </div>
              <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold print:bg-gray-200 print:text-gray-800">
                {payroll.items?.length || 0} موظف
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-100">
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">#</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الاسم</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الإقامة</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الكود</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الراتب</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">التارقت</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الطلبات</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">خصم</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">بونص</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">خ.مشغل</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">خ.داخلي</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">خ.محفظة</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">مكافأة</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">صافي</th>
                    <th className="text-right px-3 py-2 text-xs font-bold text-gray-600">الدفع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payroll.items?.map((item, index) => (
                    <tr key={item.id} className={`hover:bg-gray-50/50 ${item.net_salary < 0 ? 'bg-red-50' : ''}`}>
                      <td className="px-3 py-2 text-gray-500">{index + 1}</td>
                      <td className="px-3 py-2 font-bold text-gray-900 whitespace-nowrap">{item.employee_name}</td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{item.iqama_number}</td>
                      <td className="px-3 py-2 text-gray-600">{item.user_code}</td>
                      <td className="px-3 py-2 font-bold">{Number(item.basic_salary || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-gray-600">{item.target || 0}</td>
                      <td className="px-3 py-2 font-bold text-blue-600">{item.successful_orders || 0}</td>
                      <td className="px-3 py-2 text-red-600">{Number(item.target_deduction || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-emerald-600">{Number(item.monthly_bonus || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-red-600">{Number(item.operator_deduction || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-red-600">{Number(item.internal_deduction || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-red-600">{Number(item.wallet_deduction || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-emerald-600">{Number(item.internal_bonus || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}</td>
                      <td className={`px-3 py-2 font-bold ${item.net_salary < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {Number(item.net_salary || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{item.payment_method}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50 font-bold">
                    <td colSpan={13} className="px-3 py-3 text-left text-emerald-800">الإجمالي:</td>
                    <td className="px-3 py-3 text-emerald-800">{Number(payroll.total_net || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ريال</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center gap-3 pb-6 print:hidden">
            <Link href="/salary-payrolls">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                <ArrowRight size={16} />
                <span>العودة</span>
              </button>
            </Link>
            <Link href={`/payrolls/${payroll.id}/edit`}>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all">
                <Edit size={16} />
                <span>تعديل</span>
              </button>
            </Link>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all"
            >
              <Printer size={16} />
              <span>طباعة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
