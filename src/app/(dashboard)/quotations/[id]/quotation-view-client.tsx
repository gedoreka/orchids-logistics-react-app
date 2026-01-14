"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Building2,
  User,
  Calendar,
  Clock,
  Hash,
  DollarSign,
  ArrowRight,
  Edit,
  Trash2,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Receipt,
  Package,
  Percent
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";

interface QuotationItem {
  id: number;
  product_name: string;
  description: string;
  quantity: number;
  price: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
}

interface Quotation {
  id: number;
  quotation_number: string;
  client_id: number;
  client_name: string;
  client_vat: string;
  client_address: string;
  customer_name: string;
  client_email: string;
  client_phone: string;
  issue_date: string;
  due_date: string;
  expiry_date: string;
  total_amount: number;
  status: string;
  items: QuotationItem[];
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

interface QuotationViewClientProps {
  quotation: Quotation;
  company: Company;
  companyId: number;
}

export function QuotationViewClient({ quotation, company, companyId }: QuotationViewClientProps) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });

  const subtotal = quotation.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
  const totalVat = quotation.items?.reduce((sum, item) => sum + Number(item.vat_amount || 0), 0) || 0;

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف عرض السعر "${quotation.quotation_number}"؟`)) return;
    
    setDeleteLoading(true);
    showNotification("loading", "جاري الحذف", "جاري حذف عرض السعر...");
    
    try {
      const res = await fetch(`/api/quotations/${quotation.id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        showNotification("success", "تم الحذف بنجاح", "تم حذف عرض السعر بنجاح");
        setTimeout(() => {
          router.push("/quotations");
          router.refresh();
        }, 1500);
      } else {
        showNotification("error", "فشل الحذف", "فشل حذف عرض السعر");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحذف");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `عرض سعر - ${quotation.quotation_number}`,
  });

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
              onClick={() => notification.type !== "loading" && hideNotification()}
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

        <div className="flex-1 overflow-auto p-6 print:p-0" ref={printRef}>
          <style>{`
            @media print {
              .no-print, .print\\:hidden { display: none !important; }
              body { 
                background: white !important; 
                margin: 0 !important; 
                padding: 0 !important;
              }
              .print-content { 
                box-shadow: none !important; 
                margin: 0 !important; 
                width: 210mm !important; 
                padding: 15mm !important;
                max-width: 100% !important; 
                border: none !important;
                background: white !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              @page {
                size: A4 portrait;
                margin: 0;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}</style>
          <div className="max-w-[1200px] mx-auto space-y-6 print-content">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 text-white shadow-xl print:hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">عرض سعر رقم {quotation.quotation_number}</h1>
                    <p className="text-white/60 text-sm">تفاصيل عرض السعر</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/quotations">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                      <ArrowRight size={16} />
                      <span>القائمة</span>
                    </button>
                  </Link>
                  <Link href={`/quotations/${quotation.id}/edit`}>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all">
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
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          </div>

          <div className="print:block hidden text-center mb-6">
            <h1 className="text-2xl font-black text-gray-900">عرض سعر رقم {quotation.quotation_number}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border">
              <div className="bg-blue-500 px-4 py-3 flex items-center gap-2 text-white print:bg-blue-100 print:text-blue-800">
                <Building2 size={18} />
                <h3 className="font-bold text-sm">بيانات المنشأة</h3>
              </div>
              <div className="p-4 space-y-3">
                <InfoRow icon={<Building2 size={16} />} label="الاسم" value={company.name} />
                <InfoRow icon={<Receipt size={16} />} label="الرقم الضريبي" value={company.vat_number} />
                <InfoRow icon={<MapPin size={16} />} label="العنوان" value={company.short_address} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border">
              <div className="bg-purple-500 px-4 py-3 flex items-center gap-2 text-white print:bg-purple-100 print:text-purple-800">
                <User size={18} />
                <h3 className="font-bold text-sm">بيانات العميل</h3>
              </div>
              <div className="p-4 space-y-3">
                <InfoRow icon={<User size={16} />} label="الاسم" value={quotation.client_name || quotation.customer_name} />
                <InfoRow icon={<Receipt size={16} />} label="الرقم الضريبي" value={quotation.client_vat} />
                <InfoRow icon={<MapPin size={16} />} label="العنوان" value={quotation.client_address} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center print:shadow-none print:border">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mx-auto mb-2">
                <Hash size={18} />
              </div>
              <p className="text-xs text-gray-500 mb-1">رقم العرض</p>
              <p className="font-bold text-gray-900">{quotation.quotation_number}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center print:shadow-none print:border">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto mb-2">
                <Calendar size={18} />
              </div>
              <p className="text-xs text-gray-500 mb-1">تاريخ الإصدار</p>
              <p className="font-bold text-gray-900">{quotation.issue_date ? format(new Date(quotation.issue_date), 'yyyy/MM/dd') : '-'}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center print:shadow-none print:border">
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 mx-auto mb-2">
                <Clock size={18} />
              </div>
              <p className="text-xs text-gray-500 mb-1">تاريخ الانتهاء</p>
              <p className="font-bold text-gray-900">{quotation.due_date ? format(new Date(quotation.due_date), 'yyyy/MM/dd') : '-'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border">
            <div className="bg-emerald-500 px-4 py-3 flex items-center gap-2 text-white print:bg-emerald-100 print:text-emerald-800">
              <Package size={18} />
              <h3 className="font-bold text-sm">المنتجات / الخدمات</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-100">
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">المنتج / الخدمة</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">الوصف</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600">الكمية</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600">السعر</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600">الضريبة 15%</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-600">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {quotation.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-bold text-gray-900 text-sm">{item.product_name}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{item.description || '-'}</td>
                      <td className="px-4 py-3 text-center text-sm">{item.quantity}</td>
                      <td className="px-4 py-3 text-center text-sm">{Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</td>
                      <td className="px-4 py-3 text-center text-sm text-amber-600">{Number(item.vat_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</td>
                      <td className="px-4 py-3 text-center text-sm font-bold text-emerald-600">{Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border">
            <div className="bg-amber-500 px-4 py-3 flex items-center gap-2 text-white print:bg-amber-100 print:text-amber-800">
              <DollarSign size={18} />
              <h3 className="font-bold text-sm">ملخص المبالغ</h3>
            </div>
            <div className="p-5">
              <div className="max-w-md mr-auto space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">المجموع الفرعي:</span>
                  <span className="font-bold text-gray-900">{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm flex items-center gap-1">
                    <Percent size={12} />
                    ضريبة القيمة المضافة (15%):
                  </span>
                  <span className="font-bold text-amber-600">{totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-emerald-50 rounded-lg px-4">
                  <span className="text-emerald-800 font-bold">الإجمالي شامل الضريبة:</span>
                  <span className="font-black text-2xl text-emerald-600">{Number(quotation.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pb-6 print:hidden">
            <Link href="/quotations">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                <ArrowRight size={16} />
                <span>العودة</span>
              </button>
            </Link>
            <Link href={`/quotations/${quotation.id}/edit`}>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all">
                <Edit size={16} />
                <span>تعديل</span>
              </button>
            </Link>
            <button 
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {deleteLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-400 mb-0.5">{label}</p>
        {value ? (
          <p className="text-sm font-bold text-gray-900">{value}</p>
        ) : (
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">غير محدد</span>
        )}
      </div>
    </div>
  );
}
