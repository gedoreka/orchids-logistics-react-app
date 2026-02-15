"use client";

import React, { useState, useRef } from "react";
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
  Target,
  Layers,
  Download
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { SuccessModal, LoadingModal, ErrorModal } from "@/components/ui/notification-modals";

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

interface PayrollViewClientProps {
  payroll: Payroll;
  company: Company;
  companyId: number;
}

export function PayrollViewClient({ payroll, company, companyId }: PayrollViewClientProps) {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; type: 'delete' | 'update' | 'create' | null; title: string }>({ isOpen: false, type: null, title: '' });
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });

  
  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف مسير "${payroll.payroll_month}"؟`)) return;
    
    setDeleteLoading(true);
    setLoadingModal(true);
    
    try {
      const res = await fetch(`/api/payrolls/${payroll.id}`, { method: "DELETE" });
      
      if (res.ok) {
        setSuccessModal({ isOpen: true, type: 'delete', title: 'تم الحذف بنجاح' });
        setTimeout(() => {
          router.push("/payrolls");
          router.refresh();
        }, 1500);
      } else {
        setErrorModal({ isOpen: true, title: 'فشل الحذف', message: 'فشل حذف المسير' });
      }
    } catch {
      setErrorModal({ isOpen: true, title: 'خطأ', message: 'حدث خطأ أثناء الحذف' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `مسير رواتب - ${payroll.payroll_month}`,
  });

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = printRef.current;
      if (!element) return;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `مسير-رواتب-${payroll.payroll_month}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: 'avoid-all' }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      setErrorModal({ isOpen: true, title: 'خطأ', message: 'حدث خطأ أثناء تحميل PDF' });
    } finally {
      setPdfLoading(false);
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

  return (
    <div className="h-full flex flex-col">
      <SuccessModal
          isOpen={successModal.isOpen}
          type={successModal.type}
          title={successModal.title}
          onClose={() => setSuccessModal({ isOpen: false, type: null, title: '' })}
        />
        <LoadingModal isOpen={loadingModal} />
        <ErrorModal
          isOpen={errorModal.isOpen}
          title={errorModal.title}
          message={errorModal.message}
          onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        />

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
                  <Link href="/payrolls">
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
                    onClick={() => handlePrint()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all"
                  >
                    <Printer size={16} />
                    <span>طباعة</span>
                  </button>
                  <button 
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all disabled:opacity-50"
                  >
                    {pdfLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    <span>تحميل PDF</span>
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

          <div ref={printRef} className="space-y-6">
            <style>{`
              @media print {
                .no-print, .print\\:hidden { display: none !important; }
                body { 
                  background: white !important; 
                  margin: 0 !important; 
                  padding: 10mm !important;
                }
                .print-content { 
                  box-shadow: none !important; 
                  margin: 0 !important; 
                  width: 100% !important; 
                  max-width: 100% !important; 
                  border: none !important;
                  background: white !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                @page {
                  size: A4 landscape;
                  margin: 0;
                }
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            `}</style>
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

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:border">
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
                  <table className="w-full text-sm border-collapse">
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gradient-to-l from-[#1a237e] to-[#283593]">
                        <th className="text-center px-3 py-3.5 text-xs font-bold text-white/70 whitespace-nowrap border-l border-white/10">م</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-white whitespace-nowrap border-l border-white/10">اسم الموظف</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-white whitespace-nowrap border-l border-white/10">رقم الهوية</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-white whitespace-nowrap border-l border-white/10">الكود</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-white whitespace-nowrap border-l border-white/10">الراتب</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-white whitespace-nowrap border-l border-white/10">التارقت</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-amber-300 whitespace-nowrap border-l border-white/10">الطلبات</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-red-300 whitespace-nowrap border-l border-white/10">خصم التارجت</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-emerald-300 whitespace-nowrap border-l border-white/10">مكافأة شهرية</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-red-300 whitespace-nowrap border-l border-white/10">خصم المشغل</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-red-300 whitespace-nowrap border-l border-white/10">داخلي</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-red-300 whitespace-nowrap border-l border-white/10">المحفظة</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-emerald-300 whitespace-nowrap border-l border-white/10">مكافأة</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-amber-300 whitespace-nowrap border-l border-white/10">صافي الراتب</th>
                        <th className="text-right px-3 py-3.5 text-xs font-bold text-white whitespace-nowrap">طريقة الدفع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payroll.items?.map((item, index) => (
                        <tr 
                          key={item.id} 
                          className={`transition-colors duration-150 hover:bg-blue-50/50 ${item.net_salary < 0 ? 'bg-red-50 hover:bg-red-100/50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                        >
                        <td className="px-3 py-2.5 text-gray-500 border border-gray-200 text-center">{index + 1}</td>
                        <td className="px-3 py-2.5 font-bold text-gray-900 whitespace-nowrap border border-gray-200">{item.employee_name}</td>
                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap border border-gray-200">{item.iqama_number}</td>
                        <td className="px-3 py-2.5 text-gray-600 border border-gray-200">{item.user_code}</td>
                        <td className="px-3 py-2.5 font-bold border border-gray-200">{Number(item.basic_salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-gray-600 border border-gray-200 text-center">{item.target || 0}</td>
                        <td className="px-3 py-2.5 font-bold text-blue-600 border border-gray-200 text-center">{item.successful_orders || 0}</td>
                        <td className="px-3 py-2.5 text-red-600 border border-gray-200">{Number(item.target_deduction || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-emerald-600 border border-gray-200">{Number(item.monthly_bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-red-600 border border-gray-200">{Number(item.operator_deduction || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-red-600 border border-gray-200">{Number(item.internal_deduction || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-red-600 border border-gray-200">{Number(item.wallet_deduction || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-emerald-600 border border-gray-200">{Number(item.internal_bonus || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className={`px-3 py-2.5 font-bold border border-gray-200 ${item.net_salary < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {Number(item.net_salary || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 border border-gray-200 text-center">{item.payment_method}</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-100 font-bold">
                      <td colSpan={13} className="px-3 py-3 text-left text-emerald-800 border border-gray-200">الإجمالي:</td>
                      <td className="px-3 py-3 text-emerald-800 border border-gray-200">{Number(payroll.total_net || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</td>
                      <td className="border border-gray-200"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pb-6 print:hidden mt-6">
            <Link href="/payrolls">
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
              onClick={() => handlePrint()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all"
            >
              <Printer size={16} />
              <span>طباعة</span>
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all disabled:opacity-50"
            >
              {pdfLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span>تحميل PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
