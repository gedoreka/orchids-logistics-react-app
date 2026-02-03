"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Building2,
  User,
  ArrowRight,
  Trash2,
  Printer,
  CheckCircle,
  AlertCircle,
  Loader2,
  Wallet,
  Percent,
  Truck,
  Stamp,
  Signature,
  QrCode,
  Mail,
  Send,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/locale-context";

interface Voucher {
  id: number;
  voucher_number: string;
  voucher_date: string;
  payee_name: string;
  payee_type: string;
  payee_id: string;
  branch_code: string;
  branch_name: string;
  payment_method: string;
  debit_account_code: string;
  debit_account_name: string;
  credit_account_code: string;
  credit_account_name: string;
  amount: number;
  tax_rate: number;
  tax_value: number;
  total_amount: number;
  currency: string;
  document_number: string;
  document_date: string;
  bank_name: string;
  check_number: string;
  payment_purpose: string;
  description: string;
  notes: string;
  status: string;
  prepared_by: string;
  approved_by: string;
  created_by: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
  commercial_number: string;
  vat_number: string;
  country: string;
  region: string;
  district: string;
  street: string;
  postal_code: string;
  short_address: string;
  logo_path: string;
  stamp_path: string;
  digital_seal_path: string;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

interface PaymentVoucherViewClientProps {
  voucher: Voucher;
  company: Company;
  companyId: number;
}

const getPublicUrl = (path: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-uploads/${path}`;
};

export function PaymentVoucherViewClient({ voucher, company, companyId }: PaymentVoucherViewClientProps) {
  const router = useRouter();
  const tCommon = useTranslations("common");
  const { locale } = useLocale();
  const isRtl = locale === "ar";
  const currency = voucher.currency || (isRtl ? "ر.س" : "SAR");
  const printRef = useRef<HTMLDivElement>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleDelete = async () => {
    if (!confirm(isRtl ? `هل أنت متأكد من حذف سند الصرف رقم ${voucher.voucher_number}؟` : `Are you sure you want to delete voucher ${voucher.voucher_number}?`)) return;
    
    setDeleteLoading(true);
    showNotification("loading", isRtl ? "جاري الحذف" : "Deleting", isRtl ? "جاري حذف سند الصرف..." : "Deleting payment voucher...");
    
    try {
      const res = await fetch(`/api/payment-vouchers/${voucher.id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        showNotification("success", isRtl ? "تم الحذف بنجاح" : "Deleted Successfully", isRtl ? "تم حذف سند الصرف بنجاح" : "Payment voucher has been deleted successfully");
        setTimeout(() => {
          router.push("/payment-vouchers");
          router.refresh();
        }, 1500);
      } else {
        showNotification("error", isRtl ? "فشل الحذف" : "Delete Failed", isRtl ? "فشل حذف سند الصرف" : "Failed to delete payment voucher");
      }
    } catch {
      showNotification("error", isRtl ? "خطأ" : "Error", isRtl ? "حدث خطأ غير متوقع" : "An unexpected error occurred");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSendEmail = async () => {
      if (!emailAddress) return;
      
      setEmailLoading(true);
      showNotification("loading", isRtl ? "جاري الإرسال" : "Sending", isRtl ? "جاري إعداد السند وإرساله..." : "Preparing and sending voucher...");
      
      try {
        // Generate PDF base64
        const element = printRef.current;
        if (!element) throw new Error("Print element not found");
        
        // Sanitize element to replace lab()/oklab()/color-mix() colors
        const sanitizer = await import('@/lib/html2canvas-sanitizer');
        const sanitizedElement = await sanitizer.sanitizeForHtml2Canvas(element);
        
        // Append sanitized clone to body temporarily for html2pdf
        sanitizedElement.style.position = 'absolute';
        sanitizedElement.style.left = '-9999px';
        sanitizedElement.style.top = '0';
        document.body.appendChild(sanitizedElement);
        
        const html2pdf = (await import('html2pdf.js')).default;
        
        const opt = {
          margin: 0,
          filename: `Payment-Voucher-${voucher.voucher_number}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
        };

        const pdfBase64 = await html2pdf().set(opt).from(sanitizedElement).outputPdf('datauristring');
        
        // Remove sanitized clone from DOM
        document.body.removeChild(sanitizedElement);

        const res = await fetch(`/api/payment-vouchers/${voucher.id}/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: emailAddress,
            company_id: companyId,
            pdfBase64: pdfBase64,
            fileName: `Payment-Voucher-${voucher.voucher_number}.pdf`
          })
        });
        
        if (res.ok) {
          showNotification("success", isRtl ? "تم الإرسال" : "Sent Successfully", isRtl ? "تم إرسال السند بنجاح كملف PDF" : "Voucher sent successfully as PDF");
          setShowEmailModal(false);
          setEmailAddress("");
        } else {
          const data = await res.json();
          showNotification("error", isRtl ? "فشل الإرسال" : "Send Failed", data.error || (isRtl ? "فشل إرسال البريد" : "Failed to send email"));
        }
      } catch (error) {
        console.error("Email error:", error);
        showNotification("error", isRtl ? "خطأ" : "Error", isRtl ? "حدث خطأ أثناء إعداد أو إرسال البريد" : "An error occurred during preparation or sending");
      } finally {
        setEmailLoading(false);
      }
    };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${isRtl ? "سند-صرف" : "Payment-Voucher"}-${voucher.voucher_number}`,
  });

  const qrData = JSON.stringify({
    type: "Payment Voucher",
    number: voucher.voucher_number,
    date: voucher.voucher_date,
    amount: voucher.total_amount,
    payee: voucher.payee_name,
    company: company?.name,
    vat: company?.vat_number
  });

  const companyAddress = [
    company?.country,
    company?.region,
    company?.district,
    company?.street,
    company?.postal_code
  ].filter(Boolean).join(' - ') || company?.short_address;

  return (
    <div className="h-full flex flex-col bg-transparent" dir={isRtl ? "rtl" : "ltr"}>
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
              onClick={() => notification.type !== "loading" && hideNotification()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[111] w-full max-w-md p-4"
            >
              <div className={cn(
                "bg-white rounded-3xl p-8 shadow-2xl border-t-4",
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-red-500" : "border-blue-500"
              )}>
                <div className="text-center">
                  <div className={cn(
                    "h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center",
                    notification.type === "success" ? "bg-emerald-100 text-emerald-500" :
                    notification.type === "error" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
                  )}>
                    {notification.type === "success" && <CheckCircle size={40} />}
                    {notification.type === "error" && <AlertCircle size={40} />}
                    {notification.type === "loading" && <Loader2 size={40} className="animate-spin" />}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{notification.title}</h3>
                  <p className="text-gray-500 mb-6 font-medium">{notification.message}</p>
                  {notification.type !== "loading" && (
                    <button
                      onClick={hideNotification}
                      className={cn(
                        "w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95",
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                      )}
                    >
                      {tCommon("ok")}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}

        {showEmailModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
              onClick={() => !emailLoading && setShowEmailModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-lg p-6"
            >
              <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-16 w-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <Mail size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{isRtl ? "إرسال عبر البريد" : "Send via Email"}</h3>
                    <p className="text-gray-500 text-sm">{isRtl ? "أدخل البريد الإلكتروني" : "Enter email address"}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">{isRtl ? "البريد الإلكتروني" : "Email Address"}</label>
                    <input 
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-6 py-4 rounded-2xl bg-white text-black placeholder:text-gray-400 border border-gray-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold"
                    />
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setShowEmailModal(false)}
                      disabled={emailLoading}
                      className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                      {tCommon("cancel")}
                    </button>
                    <button
                      onClick={handleSendEmail}
                      disabled={emailLoading || !emailAddress}
                      className="flex-1 py-4 rounded-2xl bg-rose-600 text-white font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {emailLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      <span>{isRtl ? "إرسال الآن" : "Send Now"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="no-print p-4 md:p-6 pb-0 flex flex-wrap gap-2 justify-between items-center max-w-[1200px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-500 border border-gray-100">
            <Wallet size={20} />
          </div>
          <div>
            <h1 className="font-black text-white text-lg md:text-xl">
              {isRtl ? `سند صرف رقم ${voucher.voucher_number}` : `Payment Voucher #${voucher.voucher_number}`}
            </h1>
            <p className="text-white/60 text-xs md:text-sm font-medium">{isRtl ? "تفاصيل سند الصرف" : "Payment voucher details"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/payment-vouchers">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-700 font-bold text-xs md:text-sm hover:bg-gray-50 transition-all border border-gray-200 shadow-sm">
              <ArrowRight size={16} className={cn(!isRtl && "rotate-180")} />
              <span>{isRtl ? "العودة" : "Back"}</span>
            </button>
          </Link>
          
          <button 
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-rose-600 font-bold text-xs md:text-sm hover:bg-rose-50 transition-all border border-rose-100 shadow-sm"
          >
            <Mail size={16} />
            <span>{isRtl ? "إرسال بريد" : "Email"}</span>
          </button>

          <button 
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs md:text-sm hover:bg-rose-600 transition-all shadow-md"
          >
            <Printer size={16} />
            <span>{tCommon("print")}</span>
          </button>

          <button 
            onClick={async () => {
              const element = printRef.current;
              if (!element) return;

              const opt = {
                margin: 0,
                filename: `${isRtl ? "سند-صرف" : "payment-voucher"}-${voucher.voucher_number}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
              };

              const stamps = element.querySelector('.print-stamps') as HTMLElement;
              if (stamps) stamps.style.display = 'none';

              const sanitizer = await import('@/lib/html2canvas-sanitizer');
              const clonedElement = await sanitizer.sanitizeForHtml2Canvas(element);

              const html2pdf = (await import('html2pdf.js')).default;

              html2pdf().set(opt).from(clonedElement).save().then(() => {
                if (stamps) stamps.style.display = 'grid';
              });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs md:text-sm hover:bg-emerald-600 transition-all shadow-md"
          >
            <FileText size={16} />
            <span>{isRtl ? "تحميل PDF" : "Download PDF"}</span>
          </button>
          
          <button 
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs md:text-sm hover:bg-red-600 transition-all disabled:opacity-50 shadow-sm"
          >
            <Trash2 size={16} />
            <span className="hidden md:inline">{isRtl ? "حذف" : "Delete"}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8 print:p-0" ref={printRef}>
        <style>{`
          @media print {
            .no-print, .print\\:hidden { display: none !important; }
            html, body { 
              background: white !important; 
              margin: 0 !important; 
              padding: 0 !important;
              color: black !important;
              width: 148mm !important;
              height: 210mm !important;
              overflow: hidden !important;
            }
            .print-content { 
              box-shadow: none !important; 
              margin: 0 !important; 
              width: 148mm !important; 
              height: 210mm !important;
              max-height: 210mm !important;
              max-width: 148mm !important; 
              border: none !important;
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              padding: 4mm !important;
              display: block !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
            }
            @page {
              size: A5 portrait;
              margin: 0;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-stamps {
              display: none !important;
            }
          }
        `}</style>

        <div className="max-w-[210mm] mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden print:rounded-none print:shadow-none print-content invoice-card">
          <div 
            className="text-white p-8 md:p-10 relative overflow-hidden print-header"
            style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
          >
            <div className="flex flex-row justify-between items-center gap-4 relative z-10">
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center p-3 border border-[#ffffff33] shadow-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                {company.logo_path ? (
                  <img 
                    src={getPublicUrl(company.logo_path) || ''} 
                    alt="Logo" 
                    className="max-w-full max-h-full object-contain rounded-md"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <Building2 size={48} className="text-white/40" />
                )}
              </div>

              <div className="text-center flex-1">
                <h1 className="text-3xl font-black mb-1 tracking-wider uppercase">{isRtl ? "سند صرف" : "Payment Voucher"}</h1>
                <p className="text-white/60 text-[14px] uppercase font-light tracking-[0.2em]">{isRtl ? "إيصال دفع مالي" : "Financial Payment"}</p>
                <div className="mt-3 inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-[#ffffff1a]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">Logistics Systems Pro</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#ffffff1a] min-w-[140px]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <Truck size={32} className="text-orange-300" />
                <h2 className="text-[12px] font-black text-white uppercase tracking-tighter">Logistics Systems Pro</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-10 pt-6 border-t border-[#ffffff1a] relative z-10">
              <div className="text-center">
                <span className="text-[#ffffff66] text-[11px] block mb-1 uppercase tracking-wider">{isRtl ? "رقم السند" : "Voucher Number"}</span>
                <p className="font-black text-[15px] tracking-[0.1em]">{voucher.voucher_number}</p>
              </div>
              <div className="text-center border-s border-[#ffffff1a]">
                <span className="text-[#ffffff66] text-[11px] block mb-1 uppercase tracking-wider">{isRtl ? "التاريخ" : "Date"}</span>
                <p className="font-black text-[15px]">{voucher.voucher_date ? format(new Date(voucher.voucher_date), 'yyyy/MM/dd') : '-'}</p>
              </div>
            </div>
            
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
          </div>

          <div className="p-8 md:p-12 space-y-10 flex-grow flex flex-col bg-white print-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-info-grid">
              <div className="relative group">
                <div className="absolute inset-0 bg-rose-50 rounded-3xl -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
                <div className="relative rounded-3xl p-6 border border-rose-100 bg-white shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                    <div className="h-10 w-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-md">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm">{isRtl ? "بيانات المنشأة" : "Facility Info"}</h3>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Company Details</p>
                    </div>
                  </div>
                  <div className="space-y-3.5 flex-1">
                    <DetailItem label={isRtl ? "اسم الشركة" : "Company Name"} value={company.name} isRtl={isRtl} />
                    <DetailItem label={isRtl ? "السجل التجاري" : "Commercial ID"} value={company.commercial_number} isRtl={isRtl} />
                    <DetailItem label={isRtl ? "الرقم الضريبي" : "VAT Number"} value={company.vat_number} isRtl={isRtl} accent />
                    <DetailItem label={isRtl ? "العنوان" : "Address"} value={companyAddress} isRtl={isRtl} />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-orange-50 rounded-3xl rotate-1 group-hover:rotate-0 transition-transform duration-300" />
                <div className="relative rounded-3xl p-6 border border-orange-100 bg-white shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                    <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm">{isRtl ? "صرفنا إلى" : "Paid To"}</h3>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Payee Details</p>
                    </div>
                  </div>
                  <div className="space-y-3.5 flex-1">
                    <DetailItem label={isRtl ? "الاسم" : "Name"} value={voucher.payee_name} isRtl={isRtl} />
                    <DetailItem label={isRtl ? "طريقة الدفع" : "Payment Method"} value={voucher.payment_method} isRtl={isRtl} />
                    <DetailItem label={isRtl ? "البنك" : "Bank"} value={voucher.bank_name || '-'} isRtl={isRtl} />
                    <DetailItem label={isRtl ? "رقم الشيك" : "Check No."} value={voucher.check_number || '-'} isRtl={isRtl} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-gray-50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center text-white shadow-md">
                  <StickyNote size={20} />
                </div>
                <h3 className="font-black text-gray-900 text-sm">{isRtl ? "غرض الدفع / البيان" : "Payment Purpose"}</h3>
              </div>
              <p className="text-gray-700 font-medium leading-relaxed">
                {voucher.payment_purpose || voucher.description || (isRtl ? "لا يوجد بيان" : "No description")}
              </p>
              {voucher.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{isRtl ? "ملاحظات" : "Notes"}</span>
                  <p className="text-gray-600 text-sm mt-1">{voucher.notes}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/30 print-qr-section">
                  <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0 print-qr">
                    {isMounted && (
                      <QRCodeCanvas
                        value={qrData}
                        size={110}
                        level="H"
                        includeMargin={false}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-600">
                      <QrCode size={18} />
                      <span className="font-black text-xs uppercase tracking-widest">Digital Verification</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                      {isRtl ? "يحتوي هذا الرمز على بيانات السند للتحقق الإلكتروني" : "This QR code contains voucher data for digital verification"}
                    </p>
                    <div className="flex items-center gap-1.5 text-rose-600 text-[10px] font-bold">
                      <CheckCircle size={12} />
                      <span>Electronic Document Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-rose-600 rounded-3xl translate-x-1.5 translate-y-1.5 opacity-5" />
                <div className="relative bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden print-totals">
                  <div className="p-6 md:p-8 space-y-4">
                    <div className="flex justify-between items-center text-gray-500 font-bold text-sm print-totals-row">
                      <span className="uppercase tracking-wider">{isRtl ? "المبلغ" : "Amount"}</span>
                      <span>{Number(voucher.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-600 font-bold text-sm">
                      <span className="uppercase tracking-wider flex items-center gap-1.5">
                        <Percent size={14} />
                        {isRtl ? "الضريبة" : "Tax"} ({voucher.tax_rate || 0}%)
                      </span>
                      <span>{Number(voucher.tax_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-100 mt-2">
                      <div className="flex justify-between items-center p-5 bg-rose-600 rounded-2xl text-white shadow-lg shadow-rose-200 print-grand-total">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/50 uppercase font-black tracking-[0.2em] mb-1">{isRtl ? "المبلغ الإجمالي" : "Total Amount"}</span>
                          <span className="font-black text-base">{isRtl ? "شامل الضريبة" : "Incl. Tax"}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-orange-200 font-black mb-1 uppercase tracking-widest">Grand Total</span>
                          <span className="text-2xl md:text-3xl font-black tabular-nums">
                            {Number(voucher.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            <span className="text-[14px] font-bold ms-1.5 opacity-60">{currency}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 pt-12 mt-auto border-t border-gray-50 print-stamps">
              <div className="text-center group">
                <h4 className="text-gray-400 font-black text-[11px] mb-5 uppercase tracking-[0.2em]">{isRtl ? "الختم الرسمي" : "Official Stamp"}</h4>
                <div className="w-36 h-36 mx-auto bg-white rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center p-6 shadow-inner group-hover:border-rose-200 transition-colors">
                  {company.stamp_path ? (
                    <img 
                      src={getPublicUrl(company.stamp_path) || ''} 
                      alt="Stamp" 
                      className="max-w-full max-h-full object-contain grayscale opacity-30 group-hover:opacity-60 transition-opacity"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Stamp size={48} className="text-gray-100" />
                  )}
                </div>
              </div>

              <div className="text-center group">
                <h4 className="text-gray-400 font-black text-[11px] mb-5 uppercase tracking-[0.2em]">{isRtl ? "التوقيع المعتمد" : "Authorized Signature"}</h4>
                <div className="w-36 h-36 mx-auto bg-white rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center p-6 shadow-inner group-hover:border-rose-200 transition-colors">
                  {company.digital_seal_path ? (
                    <img 
                      src={getPublicUrl(company.digital_seal_path) || ''} 
                      alt="Signature" 
                      className="max-w-full max-h-full object-contain opacity-40 group-hover:opacity-80 transition-opacity"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Signature size={48} className="text-gray-100" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 print-footer">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <span>Logistics Systems Pro</span>
              </div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {isRtl ? `جميع الحقوق محفوظة © ${new Date().getFullYear()}` : `All Rights Reserved © ${new Date().getFullYear()}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, isRtl, accent = false }: { label: string; value?: string | null; isRtl: boolean; accent?: boolean }) {
  return (
    <div className={cn("flex flex-col gap-1", isRtl ? "text-right" : "text-left")}>
      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{label}</span>
      <p className={cn(
        "text-[12px] font-black leading-tight",
        accent ? "text-rose-600" : "text-gray-900"
      )}>
        {value || <span className="text-gray-200">{isRtl ? "غير محدد" : "Not Specified"}</span>}
      </p>
    </div>
  );
}
