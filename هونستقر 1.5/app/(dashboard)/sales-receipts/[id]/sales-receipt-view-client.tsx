"use client";

import React, { useState, useRef, useEffect } from "react";
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
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Receipt,
  Package,
  Percent,
  Truck,
  Stamp,
  Signature,
  QrCode,
  Info,
  Mail,
  Send,
  StickyNote
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { SuccessModal, ErrorModal, LoadingModal } from "@/components/ui/notification-modals";

interface ReceiptItem {
  id: number;
  product_name: string;
  product_desc: string;
  quantity: number;
  amount_before_vat: number;
  unit_price: number;
  vat_rate: number;
  vat_amount: number;
  total_with_vat: number;
}

interface SalesReceipt {
  id: number;
  receipt_number: string;
  client_id: number;
  client_name: string;
  client_vat: string;
  client_commercial_number: string;
  client_address: string;
  receipt_date: string;
  amount: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  zatca_qr: string;
  notes: string;
  use_custom_client: boolean;
  items: ReceiptItem[];
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


interface SalesReceiptViewClientProps {
  receipt: SalesReceipt;
  company: Company;
  companyId: number;
}

const getPublicUrl = (path: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-uploads/${path}`;
};

export function SalesReceiptViewClient({ receipt, company, companyId }: SalesReceiptViewClientProps) {
  const router = useRouter();
  const t = useTranslations("financialVouchersPage.salesReceiptsPage");
  const tCommon = useTranslations("common");
  const { locale } = useLocale();
  const isRtl = locale === "ar";
  const currency = isRtl ? "ر.س" : "SAR";
  const printRef = useRef<HTMLDivElement>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    if (type === "success") setSuccessModal({ isOpen: true, title, message });
    else if (type === "error") setErrorModal({ isOpen: true, title, message });
    else if (type === "loading") setLoadingModal(true);
  };

  const hideNotification = () => setLoadingModal(false);

  const handleDelete = async () => {
    if (!confirm(isRtl ? `هل أنت متأكد من حذف الإيصال رقم ${receipt.receipt_number}؟` : `Are you sure you want to delete receipt ${receipt.receipt_number}?`)) return;
    
    setDeleteLoading(true);
    showNotification("loading", isRtl ? "جاري الحذف" : "Deleting", isRtl ? "جاري حذف إيصال المبيعات..." : "Deleting sales receipt...");
    
    try {
      const res = await fetch(`/api/sales-receipts/${receipt.id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        showNotification("success", isRtl ? "تم الحذف بنجاح" : "Deleted Successfully", isRtl ? "تم حذف إيصال المبيعات بنجاح" : "Sales receipt has been deleted successfully");
        setTimeout(() => {
          router.push("/sales-receipts");
          router.refresh();
        }, 1500);
      } else {
        showNotification("error", isRtl ? "فشل الحذف" : "Delete Failed", isRtl ? "فشل حذف إيصال المبيعات" : "Failed to delete sales receipt");
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
    showNotification("loading", isRtl ? "جاري الإرسال" : "Sending", isRtl ? "جاري إعداد الإيصال وإرساله..." : "Preparing and sending receipt...");
    
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
        filename: `Sales-Receipt-${receipt.receipt_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, allowTaint: true },
        jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
      };

      // Get PDF as base64 from sanitized element
      const pdfBase64 = await html2pdf().set(opt).from(sanitizedElement).outputPdf('datauristring');
      
      // Remove sanitized clone from DOM
      document.body.removeChild(sanitizedElement);

      const res = await fetch(`/api/sales-receipts/${receipt.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailAddress,
          company_id: companyId,
          pdfBase64: pdfBase64,
          fileName: `Sales-Receipt-${receipt.receipt_number}.pdf`
        })
      });
      
      if (res.ok) {
        showNotification("success", isRtl ? "تم الإرسال" : "Sent Successfully", isRtl ? "تم إرسال الإيصال بنجاح كملف PDF" : "Receipt sent successfully as PDF");
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
    documentTitle: `${isRtl ? "إيصال مبيعات" : "Sales Receipt"} - ${receipt.receipt_number}`,
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
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
      />
      <LoadingModal isOpen={loadingModal} />

        {showEmailModal && (
          <React.Fragment key="emailModal">
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
                  <div className="h-16 w-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Mail size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{isRtl ? "إرسال عبر البريد" : "Send via Email"}</h3>
                    <p className="text-gray-500 text-sm">{isRtl ? "أدخل البريد الإلكتروني للعميل" : "Enter customer email address"}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">{isRtl ? "البريد الإلكتروني" : "Email Address"}</label>
                    <input 
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full px-6 py-4 rounded-2xl bg-white text-black placeholder:text-gray-400 border border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold"
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
                      className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {emailLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      <span>{isRtl ? "إرسال الآن" : "Send Now"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>

      <div className="no-print p-4 md:p-6 pb-0 flex flex-wrap gap-2 justify-between items-center max-w-[1200px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-teal-500 border border-gray-100">
            <Receipt size={20} />
          </div>
          <div>
            <h1 className="font-black text-white text-lg md:text-xl">
              {isRtl ? `إيصال مبيعات رقم ${receipt.receipt_number}` : `Sales Receipt #${receipt.receipt_number}`}
            </h1>
            <p className="text-white/60 text-xs md:text-sm font-medium">{isRtl ? "تفاصيل إيصال المبيعات والبنود" : "Sales receipt details and items"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sales-receipts">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-700 font-bold text-xs md:text-sm hover:bg-gray-50 transition-all border border-gray-200 shadow-sm">
              <ArrowRight size={16} className={cn(!isRtl && "rotate-180")} />
              <span>{isRtl ? "العودة" : "Back"}</span>
            </button>
          </Link>
          
          <button 
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-blue-600 font-bold text-xs md:text-sm hover:bg-blue-50 transition-all border border-blue-100 shadow-sm"
          >
            <Mail size={16} />
            <span>{isRtl ? "إرسال بريد" : "Email"}</span>
          </button>

            <button 
              onClick={() => handlePrint()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white font-bold text-xs md:text-sm hover:bg-blue-600 transition-all shadow-md"
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
                    filename: `${isRtl ? "إيصال-مبيعات" : "sales-receipt"}-${receipt.receipt_number}.pdf`,
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
              .invoice-card {
                border: 1px solid #e2e8f0 !important;
                box-shadow: none !important;
              }
              .bg-blue-gradient {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
                color: white !important;
              }
              .print-header {
                padding: 8px 12px !important;
              }
              .print-header h1 {
                font-size: 14px !important;
              }
              .print-header p {
                font-size: 8px !important;
              }
              .print-body {
                padding: 8px 12px !important;
                gap: 8px !important;
              }
              .print-info-grid {
                gap: 8px !important;
              }
              .print-info-card {
                padding: 8px !important;
              }
              .print-info-card h3 {
                font-size: 9px !important;
              }
              .print-detail-label {
                font-size: 7px !important;
              }
              .print-detail-value {
                font-size: 8px !important;
              }
              .print-table {
                font-size: 7px !important;
              }
              .print-table th, .print-table td {
                padding: 4px 6px !important;
              }
              .print-qr-section {
                gap: 8px !important;
                padding: 6px !important;
              }
              .print-qr canvas {
                width: 50px !important;
                height: 50px !important;
              }
              .print-totals {
                padding: 8px !important;
              }
              .print-totals-row {
                font-size: 8px !important;
              }
              .print-grand-total {
                padding: 6px !important;
              }
              .print-grand-total span {
                font-size: 12px !important;
              }
              .print-stamps {
                display: none !important;
              }
              .print-footer {
                padding-top: 4px !important;
                margin-top: 4px !important;
                font-size: 6px !important;
              }
            }
          `}</style>

        <div className="max-w-[210mm] mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden print:rounded-none print:shadow-none print-content invoice-card">
          {/* Professional Header */}
          <div 
            className="bg-blue-gradient text-white p-8 md:p-10 relative overflow-hidden print-header"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
          >
            <div className="flex flex-row justify-between items-center gap-4 relative z-10">
              {/* Company Logo */}
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

                {/* Title Center */}
                <div className="text-center flex-1">
                  <h1 className="text-3xl font-black mb-1 tracking-wider uppercase">{isRtl ? "إيصال مبيعات" : "Sales Receipt"}</h1>
                    <p className="text-white/60 text-[14px] uppercase font-light tracking-[0.2em]">{isRtl ? "إيصال مبيعات ضريبي" : "Tax Sales Receipt"}</p>
                  <div className="mt-3 inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-[#ffffff1a]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                    <span className="font-bold text-[11px] uppercase tracking-wider">Logistics Systems Pro</span>
                  </div>
                </div>

              {/* System Logo */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#ffffff1a] min-w-[140px]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <Truck size={32} className="text-blue-400" />
                <h2 className="text-[12px] font-black text-white uppercase tracking-tighter">Logistics Systems Pro</h2>
              </div>
            </div>

            {/* Header Meta */}
            <div className="grid grid-cols-2 gap-6 mt-10 pt-6 border-t border-[#ffffff1a] relative z-10">
              <div className="text-center">
                <span className="text-[#ffffff66] text-[11px] block mb-1 uppercase tracking-wider">{isRtl ? "رقم الإيصال" : "Receipt Number"}</span>
                <p className="font-black text-[15px] tracking-[0.1em]">{receipt.receipt_number}</p>
              </div>
              <div className="text-center border-s border-[#ffffff1a]">
                <span className="text-[#ffffff66] text-[11px] block mb-1 uppercase tracking-wider">{isRtl ? "تاريخ الإصدار" : "Issue Date"}</span>
                <p className="font-black text-[15px]">{receipt.receipt_date ? format(new Date(receipt.receipt_date), 'yyyy/MM/dd') : '-'}</p>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
          </div>

            <div className="p-8 md:p-12 space-y-10 flex-grow flex flex-col bg-white print-body">
            {/* Professional Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print-info-grid">
              {/* Company Details */}
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-50 rounded-3xl -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
                <div className="relative rounded-3xl p-6 border border-blue-100 bg-white shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                    <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-md">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm">{isRtl ? "بيانات المنشأة" : "Facility Info"}</h3>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Provider Details</p>
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

              {/* Client Details */}
              <div className="relative group">
                <div className="absolute inset-0 bg-teal-50 rounded-3xl rotate-1 group-hover:rotate-0 transition-transform duration-300" />
                <div className="relative rounded-3xl p-6 border border-teal-100 bg-white shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                    <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shadow-md">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm">{isRtl ? "بيانات العميل" : "Customer Data"}</h3>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Client Details</p>
                    </div>
                  </div>
                  <div className="space-y-3.5 flex-1">
                    <DetailItem label={isRtl ? "اسم العميل" : "Customer Name"} value={receipt.client_name} isRtl={isRtl} />
                    <DetailItem label={isRtl ? "رقم السجل / الهوية" : "ID / CR Number"} value={receipt.client_commercial_number || '-'} isRtl={isRtl} />
                    <DetailItem label={isRtl ? "الرقم الضريبي" : "VAT Number"} value={receipt.client_vat || '-'} isRtl={isRtl} accent />
                    <DetailItem label={isRtl ? "العنوان" : "Address"} value={receipt.client_address || '-'} isRtl={isRtl} />
                  </div>
                </div>
              </div>
            </div>

            {/* High-End Items Table */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-[12px] border-collapse print-table">
                  <thead>
                    <tr className="bg-gray-900 text-white">
                      <th className={cn("px-6 py-4 font-black uppercase tracking-wider", isRtl ? "text-right" : "text-left")}>{isRtl ? "البند" : "Item"}</th>
                      <th className={cn("px-6 py-4 font-black uppercase tracking-wider", isRtl ? "text-right" : "text-left")}>{isRtl ? "الوصف" : "Description"}</th>
                      <th className="px-6 py-4 text-center font-black uppercase tracking-wider">{isRtl ? "الكمية" : "Qty"}</th>
                      <th className="px-6 py-4 text-center font-black uppercase tracking-wider">{isRtl ? "المبلغ قبل الضريبة" : "Amount"}</th>
                      <th className="px-6 py-4 text-center font-black uppercase tracking-wider">{isRtl ? "سعر الوحدة" : "Unit Price"}</th>
                      <th className="px-6 py-4 text-center font-black uppercase tracking-wider">{isRtl ? "الضريبة" : "VAT"} (15%)</th>
                      <th className="px-6 py-4 text-center font-black uppercase tracking-wider bg-teal-600">{isRtl ? "الإجمالي" : "Total"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {receipt.items?.map((item, index) => (
                      <tr key={item.id} className={cn("hover:bg-gray-50 transition-colors", index % 2 === 0 ? "bg-white" : "bg-gray-50/30")}>
                        <td className={cn("px-6 py-5 font-bold text-gray-900", isRtl ? "text-right" : "text-left")}>{item.product_name}</td>
                        <td className={cn("px-6 py-5 text-gray-500", isRtl ? "text-right" : "text-left")}>{item.product_desc || '-'}</td>
                        <td className="px-6 py-5 text-center font-medium text-gray-700">{item.quantity}</td>
                        <td className="px-6 py-5 text-center font-medium text-gray-700">{Number(item.amount_before_vat || (item.quantity * item.unit_price)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-5 text-center font-medium text-gray-500">{Number(item.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-5 text-center font-bold text-amber-600">{Number(item.vat_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-5 text-center font-black text-gray-900 bg-teal-50/30">{Number(item.total_with_vat).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    {(!receipt.items || receipt.items.length === 0) && (
                      <tr>
                        <td colSpan={6} className={cn("px-6 py-5 font-bold text-gray-900", isRtl ? "text-right" : "text-left")}>{isRtl ? "مبيعات عامة" : "General Sales"}</td>
                        <td className="px-6 py-5 text-center font-black text-gray-900 bg-teal-50/30">{Number(receipt.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            {/* Bottom Section: QR and Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
              {/* QR and Legal Info */}
              <div className="space-y-6">
                  <div className="flex items-center gap-6 p-6 rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/30 print-qr-section">
                    <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0 print-qr">
                    {isMounted && receipt.zatca_qr && (
                      <QRCodeCanvas
                        value={receipt.zatca_qr}
                        size={110}
                        level="H"
                        includeMargin={false}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                      <QrCode size={18} />
                      <span className="font-black text-xs uppercase tracking-widest">ZATCA Compliant</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                      هذا الرمز مشفر ومتوافق مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) للفوترة الإلكترونية في المملكة العربية السعودية.
                    </p>
                    <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold">
                      <CheckCircle size={12} />
                      <span>Electronic Document Verified</span>
                    </div>
                  </div>
                </div>
                
                {receipt.notes && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
                    <StickyNote size={18} className="text-amber-500 shrink-0" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">{isRtl ? "ملاحظات" : "Notes"}</span>
                      <p className="text-[10px] text-amber-700 leading-relaxed font-medium">{receipt.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Totals Summary */}
              <div className="relative">
                <div className="absolute inset-0 bg-teal-600 rounded-3xl translate-x-1.5 translate-y-1.5 opacity-5" />
                  <div className="relative bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden print-totals">
                    <div className="p-6 md:p-8 space-y-4">
                      <div className="flex justify-between items-center text-gray-500 font-bold text-sm print-totals-row">
                      <span className="uppercase tracking-wider">{isRtl ? "المجموع الفرعي" : "Subtotal"}</span>
                      <span>{Number(receipt.subtotal || receipt.amount / 1.15).toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-600 font-bold text-sm">
                      <span className="uppercase tracking-wider flex items-center gap-1.5">
                        <Percent size={14} />
                        {isRtl ? "الضريبة" : "VAT"} (15%)
                      </span>
                      <span>{Number(receipt.tax_amount || receipt.amount - (receipt.amount / 1.15)).toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-100 mt-2">
                        <div className="flex justify-between items-center p-5 bg-gray-900 rounded-2xl text-white shadow-lg shadow-gray-200 print-grand-total">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/50 uppercase font-black tracking-[0.2em] mb-1">{isRtl ? "المبلغ الإجمالي" : "Total Amount"}</span>
                          <span className="font-black text-base">{isRtl ? "شامل الضريبة" : "Incl. VAT"}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-teal-400 font-black mb-1 uppercase tracking-widest">Grand Total</span>
                          <span className="text-2xl md:text-3xl font-black tabular-nums">
                            {Number(receipt.total_amount || receipt.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            <span className="text-[14px] font-bold ms-1.5 opacity-60">{currency}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Stamps Footer */}
            <div className="grid grid-cols-2 gap-12 pt-12 mt-auto border-t border-gray-50 print-stamps">
              {/* Authorized Stamp */}
              <div className="text-center group">
                <h4 className="text-gray-400 font-black text-[11px] mb-5 uppercase tracking-[0.2em]">{isRtl ? "الختم الرسمي" : "Official Stamp"}</h4>
                <div className="w-36 h-36 mx-auto bg-white rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center p-6 shadow-inner group-hover:border-blue-200 transition-colors">
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

              {/* Authorized Signature */}
              <div className="text-center group">
                <h4 className="text-gray-400 font-black text-[11px] mb-5 uppercase tracking-[0.2em]">{isRtl ? "التوقيع المعتمد" : "Authorized Signature"}</h4>
                <div className="w-36 h-36 mx-auto bg-white rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center p-6 shadow-inner group-hover:border-blue-200 transition-colors">
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

            {/* System Footer Info */}
            <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 print-footer">
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-500" />
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
        accent ? "text-blue-600" : "text-gray-900"
      )}>
        {value || <span className="text-gray-200">{isRtl ? "غير محدد" : "Not Specified"}</span>}
      </p>
    </div>
  );
}
