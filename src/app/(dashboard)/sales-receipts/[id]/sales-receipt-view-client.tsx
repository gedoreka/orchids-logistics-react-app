"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt,
  Building2,
  User,
  Calendar,
  Hash,
  DollarSign,
  ArrowRight,
  Trash2,
  Printer,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Link as LinkIcon,
  Unlink,
  StickyNote,
  UserCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";

interface SalesReceipt {
  id: number;
  receipt_number: string;
  client_id: number;
  client_name: string;
  client_vat: string;
  client_address: string;
  client_phone: string;
  client_email: string;
  customer_name: string;
  invoice_id: number | null;
  invoice_number: string | null;
  receipt_date: string;
  amount: number;
  notes: string;
  created_by: string;
  created_at: string;
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

interface SalesReceiptViewClientProps {
  receipt: SalesReceipt;
  company: Company;
  companyId: number;
}

export function SalesReceiptViewClient({ receipt, company, companyId }: SalesReceiptViewClientProps) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
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
    if (!confirm(`هل أنت متأكد من حذف الإيصال "${receipt.receipt_number}"؟`)) return;
    
    setDeleteLoading(true);
    showNotification("loading", "جاري الحذف", "جاري حذف الإيصال...");
    
    try {
      const res = await fetch(`/api/sales-receipts/${receipt.id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        showNotification("success", "تم الحذف بنجاح", "تم حذف الإيصال بنجاح");
        setTimeout(() => {
          router.push("/sales-receipts");
          router.refresh();
        }, 1500);
      } else {
        showNotification("error", "فشل الحذف", "فشل حذف الإيصال");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحذف");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `إيصال مبيعات - ${receipt.receipt_number}`,
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

      <style>{`
        @media print {
          .no-print, .print\\:hidden { display: none !important; }
          html, body { 
            background: white !important; 
            padding: 0 !important; 
            margin: 0 !important; 
            width: 210mm !important;
          }
          .print-content { 
            box-shadow: none !important; 
            margin: 0 !important; 
            width: 210mm !important; 
            padding: 15mm !important;
            max-width: 100% !important; 
            border: none !important;
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

      <div className="flex-1 overflow-auto p-6 print:p-0" ref={printRef}>
        <div className="max-w-[900px] mx-auto space-y-6 print-content">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 text-white shadow-xl print:hidden">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg">
                    <Receipt size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">إيصال مبيعات</h1>
                    <p className="text-white/60 text-sm">{receipt.receipt_number}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/sales-receipts">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                      <ArrowRight size={16} />
                      <span>القائمة</span>
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
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          </div>

          <div className="print:block hidden text-center mb-6">
            <h1 className="text-2xl font-black text-gray-900">إيصال مبيعات رقم {receipt.receipt_number}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border">
              <div className="bg-blue-500 px-4 py-3 flex items-center gap-2 text-white print:bg-blue-100 print:text-blue-800">
                <Building2 size={18} />
                <h3 className="font-bold text-sm">بيانات المنشأة</h3>
              </div>
              <div className="p-4 space-y-3">
                <InfoRow icon={<Building2 size={16} />} label="الاسم" value={company.name} />
                <InfoRow icon={<FileText size={16} />} label="الرقم الضريبي" value={company.vat_number} />
                <InfoRow icon={<MapPin size={16} />} label="العنوان" value={company.short_address} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border">
              <div className="bg-purple-500 px-4 py-3 flex items-center gap-2 text-white print:bg-purple-100 print:text-purple-800">
                <User size={18} />
                <h3 className="font-bold text-sm">بيانات العميل</h3>
              </div>
              <div className="p-4 space-y-3">
                <InfoRow icon={<User size={16} />} label="الاسم" value={receipt.client_name || receipt.customer_name} />
                <InfoRow icon={<FileText size={16} />} label="الرقم الضريبي" value={receipt.client_vat} />
                <InfoRow icon={<MapPin size={16} />} label="العنوان" value={receipt.client_address} />
                <InfoRow icon={<Phone size={16} />} label="الهاتف" value={receipt.client_phone} />
                <InfoRow icon={<Mail size={16} />} label="البريد" value={receipt.client_email} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center print:shadow-none print:border">
              <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500 mx-auto mb-2">
                <Hash size={18} />
              </div>
              <p className="text-xs text-gray-500 mb-1">رقم الإيصال</p>
              <p className="font-bold text-gray-900 font-mono">{receipt.receipt_number}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center print:shadow-none print:border">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto mb-2">
                <Calendar size={18} />
              </div>
              <p className="text-xs text-gray-500 mb-1">تاريخ الإيصال</p>
              <p className="font-bold text-gray-900">{receipt.receipt_date ? format(new Date(receipt.receipt_date), 'yyyy/MM/dd') : '-'}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center print:shadow-none print:border">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 mx-auto mb-2">
                {receipt.invoice_number ? <LinkIcon size={18} /> : <Unlink size={18} />}
              </div>
              <p className="text-xs text-gray-500 mb-1">الفاتورة المرتبطة</p>
              <p className="font-bold text-gray-900">{receipt.invoice_number || 'غير مرتبط'}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-4 text-white print:bg-emerald-100 print:text-emerald-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} />
                  <h3 className="font-bold">المبلغ المستلم</h3>
                </div>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="inline-flex items-center gap-3 bg-emerald-50 rounded-2xl px-8 py-4">
                <DollarSign size={32} className="text-emerald-500" />
                <span className="text-4xl font-black text-emerald-600">
                  {Number(receipt.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xl font-bold text-emerald-400">ر.س</span>
              </div>
              <p className="text-gray-500 text-sm mt-3">فقط {numberToArabicWords(receipt.amount)} ريال سعودي لا غير</p>
            </div>
          </div>

          {receipt.notes && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border">
              <div className="bg-amber-500 px-4 py-3 flex items-center gap-2 text-white print:bg-amber-100 print:text-amber-800">
                <StickyNote size={18} />
                <h3 className="font-bold text-sm">الملاحظات</h3>
              </div>
              <div className="p-4">
                <p className="text-gray-700">{receipt.notes}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:shadow-none print:border">
            <div className="bg-gray-500 px-4 py-3 flex items-center gap-2 text-white print:bg-gray-100 print:text-gray-800">
              <UserCircle size={18} />
              <h3 className="font-bold text-sm">معلومات الإنشاء</h3>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-600">
                <UserCircle size={16} />
                <span className="text-sm">أنشئ بواسطة: <strong>{receipt.created_by || 'مدير النظام'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar size={14} />
                {receipt.created_at ? format(new Date(receipt.created_at), 'yyyy/MM/dd HH:mm') : '-'}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pb-6 print:hidden">
            <Link href="/sales-receipts">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                <ArrowRight size={16} />
                <span>العودة</span>
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

function numberToArabicWords(num: number): string {
  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
  const teens = ['أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  
  if (num === 0) return 'صفر';
  
  const intPart = Math.floor(num);
  if (intPart < 11) return ones[intPart];
  if (intPart < 20) return teens[intPart - 11];
  if (intPart < 100) {
    const t = Math.floor(intPart / 10);
    const o = intPart % 10;
    return o === 0 ? tens[t] : ones[o] + ' و' + tens[t];
  }
  if (intPart < 1000) {
    const h = Math.floor(intPart / 100);
    const remainder = intPart % 100;
    if (remainder === 0) return hundreds[h];
    return hundreds[h] + ' و' + numberToArabicWords(remainder);
  }
  if (intPart < 1000000) {
    const thousands = Math.floor(intPart / 1000);
    const remainder = intPart % 1000;
    let result = '';
    if (thousands === 1) result = 'ألف';
    else if (thousands === 2) result = 'ألفان';
    else if (thousands < 11) result = ones[thousands] + ' آلاف';
    else result = numberToArabicWords(thousands) + ' ألف';
    
    if (remainder > 0) result += ' و' + numberToArabicWords(remainder);
    return result;
  }
  
  return intPart.toString();
}
