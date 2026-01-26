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
  Info
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "@/lib/locale-context";

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

interface QuotationViewClientProps {
  quotation: Quotation;
  company: Company;
  companyId: number;
}

function generateQRCodeTLV(
  sellerName: string,
  vatNumber: string,
  invoiceDate: string,
  totalWithVAT: string,
  vatAmount: string
): string {
    try {
      const encoder = new TextEncoder();
      
      // Fix: Handle Date objects and ensure we have a valid ISO string before split
      let dateStr = '';
      if (invoiceDate instanceof Date) {
        dateStr = invoiceDate.toISOString();
      } else if (typeof invoiceDate === 'string') {
        dateStr = invoiceDate;
      } else if (invoiceDate) {
        dateStr = new Date(invoiceDate).toISOString();
      }
      
      const safeDate = dateStr && dateStr !== 'Invalid Date' ? dateStr.split('T')[0] : new Date().toISOString().split('T')[0];
      const values = [

      sellerName || '',
      vatNumber || '',
      safeDate + 'T00:00:00Z',
      totalWithVAT || '0.00',
      vatAmount || '0.00'
    ];
    
    const tlvParts: number[] = [];
    values.forEach((value, index) => {
      const encoded = encoder.encode(String(value));
      tlvParts.push(index + 1);
      tlvParts.push(encoded.length);
      tlvParts.push(...encoded);
    });
    
    const bytes = new Uint8Array(tlvParts);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  } catch (e) {
    console.error('QR generation error:', e);
    return '';
  }
}

const getPublicUrl = (path: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-uploads/${path}`;
};

export function QuotationViewClient({ quotation, company, companyId }: QuotationViewClientProps) {
  const router = useRouter();
  const t = useTranslations("financialVouchersPage.quotationsPage");
  const tCommon = useTranslations("common");
  const { locale } = useLocale();
  const isRtl = locale === "ar";
  const currency = t("common.sar");
  const printRef = useRef<HTMLDivElement>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  const subtotal = quotation.items?.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0) || 0;
  const totalVat = quotation.items?.reduce((sum, item) => sum + Number(item.vat_amount || 0), 0) || 0;

  const qrData = generateQRCodeTLV(
    company?.name || '',
    company?.vat_number || '',
    quotation.issue_date || '',
    Number(quotation.total_amount).toFixed(2),
    totalVat.toFixed(2)
  );

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleDelete = async () => {
    if (!confirm(t("notifications.deleteConfirm", { number: quotation.quotation_number }))) return;
    
    setDeleteLoading(true);
    showNotification("loading", t("notifications.deleting"), t("notifications.deletingMsg"));
    
    try {
      const res = await fetch(`/api/quotations/${quotation.id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        showNotification("success", t("notifications.deleteSuccess"), t("notifications.deleteSuccessMsg"));
        setTimeout(() => {
          router.push("/quotations");
          router.refresh();
        }, 1500);
      } else {
        showNotification("error", t("notifications.deleteFailed"), t("notifications.deleteFailedMsg"));
      }
    } catch {
      showNotification("error", t("notifications.error"), t("notifications.errorMsg"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${t("view.title", { number: quotation.quotation_number })}`,
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => notification.type !== "loading" && hideNotification()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md p-4"
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
                      {t("notifications.ok")}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="no-print p-4 md:p-6 pb-0 flex flex-wrap gap-2 justify-between items-center max-w-[1200px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500 border border-gray-100">
            <FileText size={20} />
          </div>
            <div>
              <h1 className="font-black text-white text-lg md:text-xl">{t("view.title", { number: quotation.quotation_number })}</h1>
              <p className="text-white/60 text-xs md:text-sm font-medium">{t("view.details")}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/quotations">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-700 font-bold text-xs md:text-sm hover:bg-gray-50 transition-all border border-gray-200 shadow-sm">
              <ArrowRight size={16} className={cn(!isRtl && "rotate-180")} />
              <span>{t("table.back")}</span>
            </button>
          </Link>
          <Link href={`/quotations/${quotation.id}/edit`}>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs md:text-sm hover:bg-amber-600 transition-all shadow-sm">
              <Edit size={16} />
              <span>{t("table.edit")}</span>
            </button>
          </Link>
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
                
                // Dynamically import html2pdf.js
                const html2pdf = (await import('html2pdf.js')).default;
                
                const opt = {
                  margin: 0,
                  filename: `${isRtl ? "عرض-سعر" : "quotation"}-${quotation.quotation_number}.pdf`,
                  image: { type: 'jpeg', quality: 0.98 },
                  html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                  jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
                };
                
                const stamps = element.querySelector('.print-stamps') as HTMLElement;
                if (stamps) stamps.style.display = 'none';
                
                html2pdf().set(opt).from(element).save().then(() => {
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
            <span className="hidden md:inline">{t("table.delete")}</span>
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
                <h1 className="text-3xl font-black mb-1 tracking-wider uppercase">عرض سعر</h1>
                <p className="text-white/60 text-[14px] uppercase font-light tracking-[0.2em]">Price Quotation</p>
                <div className="mt-3 inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-[#ffffff1a]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <span className="font-bold text-[11px] uppercase tracking-wider">{t("footer.system")}</span>
                </div>
              </div>

              {/* System Logo */}
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-[#ffffff1a] min-w-[140px]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <Truck size={32} className="text-blue-400" />
                <h2 className="text-[12px] font-black text-white uppercase tracking-tighter">Logistics Systems Pro</h2>
              </div>
            </div>

            {/* Header Meta */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-6 border-t border-[#ffffff1a] relative z-10">
              <div className="text-center">
                <span className="text-[#ffffff66] text-[11px] block mb-1 uppercase tracking-wider">{t("form.number")}</span>
                <p className="font-black text-[15px] tracking-[0.1em]">{quotation.quotation_number}</p>
              </div>
              <div className="text-center border-x border-[#ffffff1a]">
                <span className="text-[#ffffff66] text-[11px] block mb-1 uppercase tracking-wider">{t("form.issueDate")}</span>
                <p className="font-black text-[15px]">{quotation.issue_date ? format(new Date(quotation.issue_date), 'yyyy/MM/dd') : '-'}</p>
              </div>
              <div className="text-center">
                <span className="text-[#ffffff66] text-[11px] block mb-1 uppercase tracking-wider">{t("form.expiryDate")}</span>
                <p className="font-black text-[15px]">{quotation.due_date ? format(new Date(quotation.due_date), 'yyyy/MM/dd') : '-'}</p>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
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
                      <h3 className="font-black text-gray-900 text-sm">{t("view.facilityInfo")}</h3>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Provider Details</p>
                    </div>
                  </div>
                  <div className="space-y-3.5 flex-1">
                    <DetailItem label={t("form.customerName")} value={company.name} isRtl={isRtl} />
                    <DetailItem label={t("form.commercialNumber")} value={company.commercial_number} isRtl={isRtl} />
                    <DetailItem label={tCommon("vatNumber")} value={company.vat_number} isRtl={isRtl} accent />
                    <DetailItem label={t("form.address")} value={companyAddress} isRtl={isRtl} />
                  </div>
                </div>
              </div>

              {/* Client Details */}
              <div className="relative group">
                <div className="absolute inset-0 bg-purple-50 rounded-3xl rotate-1 group-hover:rotate-0 transition-transform duration-300" />
                <div className="relative rounded-3xl p-6 border border-purple-100 bg-white shadow-sm flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-50">
                    <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center text-white shadow-md">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm">{t("view.customerData")}</h3>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Client Details</p>
                    </div>
                  </div>
                  <div className="space-y-3.5 flex-1">
                    <DetailItem label={t("form.customerName")} value={quotation.client_name || quotation.customer_name} isRtl={isRtl} />
                    <DetailItem label={t("form.commercialNumber")} value={quotation.client_vat || '-'} isRtl={isRtl} />
                    <DetailItem label={tCommon("vatNumber")} value={quotation.client_vat || '-'} isRtl={isRtl} accent />
                    <DetailItem label={t("form.address")} value={quotation.client_address || '-'} isRtl={isRtl} />
                  </div>
                </div>
              </div>
            </div>

            {/* High-End Items Table */}
            <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full text-[12px] border-collapse print-table">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className={cn("px-6 py-4 font-black uppercase tracking-wider", isRtl ? "text-right" : "text-left")}>{t("form.table.productName")}</th>
                    <th className={cn("px-6 py-4 font-black uppercase tracking-wider", isRtl ? "text-right" : "text-left")}>{t("common.description")}</th>
                    <th className="px-6 py-4 text-center font-black uppercase tracking-wider">{t("form.table.quantity")}</th>
                    <th className="px-6 py-4 text-center font-black uppercase tracking-wider">{t("form.table.price")}</th>
                    <th className="px-6 py-4 text-center font-black uppercase tracking-wider">{tCommon("vat")} (15%)</th>
                    <th className="px-6 py-4 text-center font-black uppercase tracking-wider bg-blue-600">{t("common.total")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {quotation.items?.map((item, index) => (
                    <tr key={item.id} className={cn("hover:bg-gray-50 transition-colors", index % 2 === 0 ? "bg-white" : "bg-gray-50/30")}>
                      <td className={cn("px-6 py-5 font-bold text-gray-900", isRtl ? "text-right" : "text-left")}>{item.product_name}</td>
                      <td className={cn("px-6 py-5 text-gray-500", isRtl ? "text-right" : "text-left")}>{item.description || '-'}</td>
                      <td className="px-6 py-5 text-center font-medium text-gray-700">{item.quantity}</td>
                      <td className="px-6 py-5 text-center font-medium text-gray-700">{Number(item.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-5 text-center font-bold text-amber-600">{Number(item.vat_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-5 text-center font-black text-gray-900 bg-blue-50/30">{Number(item.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Section: QR and Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end">
              {/* QR and Legal Info */}
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
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex gap-3">
                  <Info size={18} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                    هذا العرض سارٍ لمدة محددة من تاريخ الإصدار. الأسعار الموضحة أعلاه خاضعة للتغيير بناءً على توفر المواد أو تعديلات بنطاق العمل.
                  </p>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-3xl translate-x-1.5 translate-y-1.5 opacity-5" />
                <div className="relative bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden print-totals">
                  <div className="p-6 md:p-8 space-y-4">
                    <div className="flex justify-between items-center text-gray-500 font-bold text-sm print-totals-row">
                      <span className="uppercase tracking-wider">{t("form.subtotal")}</span>
                      <span>{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-600 font-bold text-sm">
                      <span className="uppercase tracking-wider flex items-center gap-1.5">
                        <Percent size={14} />
                        {tCommon("vat")} (15%)
                      </span>
                      <span>{totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-100 mt-2">
                      <div className="flex justify-between items-center p-5 bg-gray-900 rounded-2xl text-white shadow-lg shadow-gray-200 print-grand-total">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-white/50 uppercase font-black tracking-[0.2em] mb-1">{t("common.total")}</span>
                          <span className="font-black text-base">{t("view.inclTax")}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] text-blue-400 font-black mb-1 uppercase tracking-widest">Grand Total</span>
                          <span className="text-2xl md:text-3xl font-black tabular-nums">
                            {Number(quotation.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            <span className="text-[14px] font-bold mr-1.5 opacity-60">{currency}</span>
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
                <h4 className="text-gray-400 font-black text-[11px] mb-5 uppercase tracking-[0.2em]">{tCommon("stamp")}</h4>
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
                <h4 className="text-gray-400 font-black text-[11px] mb-5 uppercase tracking-[0.2em]">{tCommon("signature")}</h4>
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
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>{t("footer.system")}</span>
              </div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {t("footer.rights", { year: new Date().getFullYear() })}
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
        {value || <span className="text-gray-200">Not Specified</span>}
      </p>
    </div>
  );
}
