"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Building2,
  Printer,
  Download,
  ArrowRight,
  FileText,
  Calculator,
  Calendar,
  AlertTriangle,
  Truck,
  QrCode,
  CreditCard,
  Mail,
  Send,
  X,
  Loader2,
  AlertCircle,
  MailCheck,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useReactToPrint } from "react-to-print";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface CreditNoteViewClientProps {
  creditNote: any;
  qrData: string;
}

export function CreditNoteViewClient({ creditNote, qrData }: CreditNoteViewClientProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [zatcaSubmitting, setZatcaSubmitting] = useState(false);
  const [zatcaStatus, setZatcaStatus] = useState<string | null>(null);

  // Email sending states
  const [showEmailDialog, setShowEmailDialog] = useState<'confirm' | 'compose' | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [emailOverlay, setEmailOverlay] = useState<{
    show: boolean;
    type: 'loading' | 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'loading', title: '', message: '' });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch company email accounts
  useEffect(() => {
    if (creditNote?.company_id) {
      fetch(`/api/email/accounts?company_id=${creditNote.company_id}`)
        .then(r => r.json())
        .then(data => {
          if (data.accounts?.length > 0) {
            setEmailAccounts(data.accounts);
            setSelectedAccountId(data.accounts[0].id);
          }
        })
        .catch(() => {});
    }
  }, [creditNote?.company_id]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `إشعار دائن - ${creditNote.credit_note_number}`,
  });

  // Convert cross-origin images to data URLs
  const convertImagesToDataURLs = async (container: HTMLElement) => {
    const images = container.querySelectorAll('img');
    await Promise.all(Array.from(images).map(async (img) => {
      if (!img.src || img.src.startsWith('data:')) return;
      try {
        const response = await fetch(img.src, { mode: 'cors' });
        const blob = await response.blob();
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        img.src = dataUrl;
        img.removeAttribute('crossorigin');
      } catch (e) {
        console.warn('Could not convert image:', img.src, e);
      }
    }));
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');
      
      const element = printRef.current;
      if (!element) return;
      
      await document.fonts.ready;
      await convertImagesToDataURLs(element);
      
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
        foreignObjectRendering: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgAspect = canvas.width / canvas.height;
      const pageAspect = pdfWidth / pdfHeight;
      
      let finalImgWidth: number, finalImgHeight: number;
      if (imgAspect > pageAspect) {
        finalImgWidth = pdfWidth;
        finalImgHeight = pdfWidth / imgAspect;
      } else {
        finalImgHeight = pdfHeight;
        finalImgWidth = pdfHeight * imgAspect;
      }
      
      const xOffset = (pdfWidth - finalImgWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, 0, finalImgWidth, finalImgHeight);
      pdf.save(`إشعار-دائن-${creditNote.credit_note_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  // Generate PDF as base64 for email attachment
  const generatePDFBase64 = async (): Promise<string | null> => {
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');
      const element = printRef.current;
      if (!element) return null;

      await document.fonts.ready;
      await convertImagesToDataURLs(element);

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
        foreignObjectRendering: false,
      });

      // Use PNG to avoid black page issues with transparency
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgAspect = canvas.width / canvas.height;
      const pageAspect = pdfWidth / pdfHeight;
      
      let finalImgWidth: number, finalImgHeight: number;
      if (imgAspect > pageAspect) {
        finalImgWidth = pdfWidth;
        finalImgHeight = pdfWidth / imgAspect;
      } else {
        finalImgHeight = pdfHeight;
        finalImgWidth = pdfHeight * imgAspect;
      }
      
      const xOffset = (pdfWidth - finalImgWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, 0, finalImgWidth, finalImgHeight);

      const pdfOutput = pdf.output('datauristring');
      const base64 = pdfOutput.split(',')[1];
      return base64;
    } catch (error) {
      console.error('Error generating PDF base64:', error);
      return null;
    }
  };

  const grandTotal = parseFloat(creditNote.total_amount);

  // Handle "Send Credit Note via Email" button click
  const handleEmailClick = () => {
    if (emailAccounts.length === 0) {
      toast.error('لا يوجد حساب بريد مسجل للشركة. يرجى إضافة حساب بريد أولاً', {
        duration: 5000,
      });
      return;
    }
    setEmailTo(creditNote.client_email || '');
    setEmailSubject(`إشعار دائن ضريبي رقم ${creditNote.credit_note_number} - ${creditNote.company_name || ''}`);
    setEmailBody(
      `<p style="direction:rtl;text-align:right;font-family:Arial,sans-serif;">` +
      `السلام عليكم ورحمة الله وبركاته،<br/><br/>` +
      `نرفق لكم إشعار الدائن الضريبي رقم <strong>${creditNote.credit_note_number}</strong> بمبلغ إجمالي <strong>${grandTotal.toFixed(2)} ريال</strong>.<br/><br/>` +
      `مرجع الفاتورة: ${creditNote.invoice_number}<br/>` +
      `تاريخ الإصدار: ${formatDate(creditNote.created_at)}<br/><br/>` +
      `مع خالص التحية،<br/>` +
      `${creditNote.company_name || ''}</p>`
    );
    setShowEmailDialog('confirm');
  };

  // Handle send email after compose
  const handleSendEmail = async () => {
    if (!emailTo || !selectedAccountId) {
      toast.error('يرجى إدخال بريد المستلم');
      return;
    }

    setEmailSending(true);
    setPdfGenerating(true);
    setShowEmailDialog(null);
    setEmailOverlay({ show: true, type: 'loading', title: 'جاري تجهيز الإشعار', message: `يتم الآن إنشاء ملف PDF للإشعار رقم ${creditNote.credit_note_number}` });

    try {
      const pdfBase64 = await generatePDFBase64();
      setPdfGenerating(false);

      if (!pdfBase64) {
        setEmailOverlay({ show: true, type: 'error', title: 'فشل إنشاء الملف', message: 'تعذر إنشاء ملف PDF للإشعار. يرجى المحاولة مرة أخرى.' });
        return;
      }

      setEmailOverlay({ show: true, type: 'loading', title: 'جاري إرسال البريد الإلكتروني', message: `يتم الآن إرسال الإشعار إلى ${emailTo}` });

      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccountId,
          company_id: creditNote.company_id,
          to: emailTo,
          subject: emailSubject,
          body: emailBody,
          attachments: [{
            filename: `CreditNote-${creditNote.credit_note_number}.pdf`,
            content: pdfBase64,
            contentType: 'application/pdf',
          }]
        })
      });

      const data = await res.json();

      if (data.success) {
        setEmailOverlay({ show: true, type: 'success', title: 'تم الإرسال بنجاح', message: `تم إرسال الإشعار رقم ${creditNote.credit_note_number} بنجاح إلى\n${emailTo}` });
        setTimeout(() => setEmailOverlay(prev => ({ ...prev, show: false })), 3500);
        setEmailTo('');
        setEmailSubject('');
        setEmailBody('');
      } else {
        setEmailOverlay({ show: true, type: 'error', title: 'فشل الإرسال', message: data.error || 'تعذر إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.' });
      }
    } catch (error) {
      console.error('Email send error:', error);
      setEmailOverlay({ show: true, type: 'error', title: 'خطأ في الإرسال', message: 'حدث خطأ غير متوقع أثناء إرسال البريد الإلكتروني.' });
    } finally {
      setEmailSending(false);
      setPdfGenerating(false);
    }
  };

  const getPublicUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-uploads/${path}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd-MM-yyyy', { locale: ar });
    } catch (e) {
      return dateStr;
    }
    };

  // ZATCA submit handler
  const handleZatcaSubmit = async () => {
    setZatcaSubmitting(true);
    setZatcaStatus(null);
    try {
      const cn = creditNote;
      const items = cn.items || [];
      const invoiceData = {
        id: String(cn.id),
        invoiceNumber: cn.credit_note_number,
        invoiceTypeCode: "381",
        invoiceSubType: cn.customer_vat ? "0100000" : "0200000",
        issueDate: cn.issue_date?.split("T")[0] || new Date().toISOString().split("T")[0],
        issueTime: "00:00:00",
        currency: "SAR",
        sellerName: cn.company_name || "",
        sellerVatNumber: cn.company_vat || "",
        sellerCRNumber: cn.company_cr || "",
        sellerStreet: cn.company_street || "",
        sellerDistrict: cn.company_district || "",
        sellerCity: cn.company_city || "",
        sellerPostalCode: cn.company_postal || "",
        sellerCountry: "SA",
        buyerName: cn.customer_name || "",
        buyerVatNumber: cn.customer_vat || "",
        buyerStreet: cn.customer_address || "",
        buyerCity: "",
        buyerDistrict: "",
        buyerPostalCode: "",
        buyerCountry: "SA",
        totalBeforeVat: parseFloat(cn.total_before_vat || 0),
        totalVat: parseFloat(cn.vat_total || 0),
        totalWithVat: parseFloat(cn.total_amount || 0),
        billingReferenceId: cn.original_invoice_number || "",
        paymentMeansCode: "10",
        items: items.map((item: any, idx: number) => ({
          id: String(idx + 1),
          name: item.product_name || item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          vatRate: 15,
          vatAmount: item.vat_amount || 0,
          totalBeforeVat: item.total_before_vat || 0,
          totalWithVat: item.total_with_vat || 0,
          vatCategory: "S",
        })),
      };

      const res = await fetch("/api/zatca/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: cn.company_id,
          document_type: "credit_note",
          document_id: String(cn.id),
          invoice_data: invoiceData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setZatcaStatus("success");
        toast.success("تم إرسال الإشعار الدائن إلى ZATCA بنجاح");
      } else {
        setZatcaStatus("failed");
        toast.error(data.error || "فشل إرسال الإشعار الدائن");
      }
    } catch {
      setZatcaStatus("failed");
      toast.error("خطأ في الاتصال بـ ZATCA");
    } finally {
      setZatcaSubmitting(false);
    }
  };

    return (
      <>
      <div className="min-h-screen bg-transparent overflow-y-auto font-tajawal">
        <div className="w-full max-w-[210mm] mx-auto py-6 space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center no-print px-4">
          <Link href="/credit-notes">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#334155] hover:bg-[#f8fafc] border border-[#e2e8f0] font-bold text-sm transition-all shadow-sm">
              <ArrowRight size={18} />
              العودة
            </button>
          </Link>
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e293b] text-white hover:bg-[#0f172a] font-bold text-sm transition-all shadow-md"
          >
            <Printer size={18} />
            طباعة
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] font-bold text-sm transition-all shadow-md disabled:opacity-50"
          >
            <Download size={18} />
            {pdfLoading ? 'جاري...' : 'تحميل PDF'}
          </button>
          <button
              onClick={handleEmailClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#059669] text-white hover:bg-[#047857] font-bold text-sm transition-all shadow-md"
            >
              <Mail size={18} />
              إرسال عبر البريد
            </button>
            <button
              onClick={handleZatcaSubmit}
              disabled={zatcaSubmitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md ${
                zatcaStatus === "success"
                  ? "bg-emerald-600 text-white"
                  : zatcaStatus === "failed"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              } disabled:opacity-50`}
            >
              {zatcaSubmitting ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
              {zatcaSubmitting ? "جاري الإرسال..." : zatcaStatus === "success" ? "تم الإرسال" : "إرسال ZATCA"}
            </button>
        </div>

        {/* Credit Note Layout */}
        <div 
          ref={printRef} 
          className="invoice-container bg-white shadow-xl overflow-hidden border border-[#f1f5f9] mx-auto"
          style={{ 
            width: '210mm', 
            backgroundColor: '#ffffff',
            color: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          <style>{`
            @media print {
              .no-print { display: none !important; }
              body { 
                background: white !important; 
                margin: 0 !important; 
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .invoice-container { 
                box-shadow: none !important; 
                margin: 0 !important; 
                width: 100% !important; 
                max-width: 210mm !important; 
                border: none !important;
                padding: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                background: white !important;
                position: relative !important;
                box-sizing: border-box !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
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

          {/* Header */}
          <div 
            className="text-white p-6 relative overflow-hidden flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #1e293b 0%, #2c3e50 100%)' }}
          >
            <div className="flex flex-row justify-between items-center gap-4 relative z-10">
              {/* Company Logo */}
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center p-3 border border-[#ffffff33]"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                {creditNote.company_logo ? (
                  <img 
                    src={getPublicUrl(creditNote.company_logo) || ''} 
                    alt="Logo" 
                    className="max-w-full max-h-full object-contain rounded-md"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <Building2 size={36} className="text-white/60" />
                )}
              </div>

              {/* Title Center */}
              <div className="text-center flex-1">
                <h1 className="text-2xl font-black mb-0 tracking-wider">إشعار دائن ضريبي</h1>
                <p className="text-white/60 text-[12px] uppercase font-light">Credit Note</p>
                <div className="mt-2 inline-flex items-center gap-2 px-4 py-1 rounded-lg border border-[#ffffff1a]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="font-bold text-[10px]">نظام الفواتير الإلكترونية</span>
                </div>
              </div>

              {/* System Logo */}
              <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-[#ffffff1a] min-w-[120px]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <Truck size={24} className="text-[#3b82f6]" />
                <h2 className="text-[10px] font-black text-white uppercase">Logistics Systems</h2>
              </div>
            </div>

            {/* Header Meta */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#ffffff1a] relative z-10">
              <div className="text-center">
                <span className="text-[#ffffff66] text-[10px] block">رقم الإشعار:</span>
                <p className="font-bold text-[13px] tracking-widest">{creditNote.credit_note_number}</p>
              </div>
              <div className="text-center">
                <span className="text-[#ffffff66] text-[10px] block">تاريخ الإصدار:</span>
                <p className="font-bold text-[13px]">{formatDate(creditNote.created_at)}</p>
              </div>
              <div className="text-center">
                <span className="text-[#ffffff66] text-[10px] block">الحالة:</span>
                <p className={cn(
                  "font-bold text-[13px]",
                  creditNote.status === 'cancelled' ? "text-red-400" : "text-green-400"
                )}>
                  {creditNote.status === 'cancelled' ? 'ملغي' : 'نشط'}
                </p>
              </div>
            </div>
          </div>

            <div className="invoice-content p-6 space-y-4 flex-grow flex flex-col">
              {/* Info Cards */}
              <div className="info-grid grid grid-cols-2 gap-4">
                {/* Company Info */}
                <div className="info-card rounded-2xl p-4 border-2 border-[#f1f5f9] relative overflow-hidden group transition-all shadow-sm" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563eb]/5 rounded-bl-[4rem] -z-0"></div>
                  <h3 className="font-black text-[#0f172a] mb-3 pb-1 border-b-2 border-[#e2e8f0] flex items-center gap-2 text-xs relative z-10">
                    <div className="w-1.5 h-4 bg-[#2563eb] rounded-full"></div>
                    بيانات البائع <span className="text-[9px] text-slate-400 font-bold opacity-50">Seller Details</span>
                  </h3>
                  <div className="space-y-1.5 text-[11px] relative z-10">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[#64748b] font-bold">اسم الشركة:</span>
                      <span className="font-black text-[#0f172a] text-right">{creditNote.company_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-y border-dashed border-slate-200">
                      <span className="text-[#64748b] font-bold">السجل التجاري:</span>
                      <span className="font-black text-[#0f172a] tracking-wider">{creditNote.company_cr || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748b] font-bold">الرقم الضريبي:</span>
                      <span className="font-black text-[#2563eb] text-xs">{creditNote.company_vat}</span>
                    </div>
                    <div className="flex justify-start gap-2 mt-1 pt-1 border-t border-slate-100">
                      <span className="text-[#64748b] font-bold whitespace-nowrap">العنوان:</span>
                      <span className="font-bold text-[#0f172a] leading-tight text-right text-[10px]">{creditNote.company_address}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="info-card rounded-2xl p-4 border-2 border-[#f1f5f9] relative overflow-hidden group transition-all shadow-sm" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#059669]/5 rounded-bl-[4rem] -z-0"></div>
                  <h3 className="font-black text-[#0f172a] mb-3 pb-1 border-b-2 border-[#e2e8f0] flex items-center gap-2 text-xs relative z-10">
                    <div className="w-1.5 h-4 bg-[#059669] rounded-full"></div>
                    بيانات العميل <span className="text-[9px] text-slate-400 font-bold opacity-50">Customer Details</span>
                  </h3>
                  <div className="space-y-1.5 text-[11px] relative z-10">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[#64748b] font-bold">اسم العميل:</span>
                      <span className="font-black text-[#0f172a] text-right">{creditNote.client_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-y border-dashed border-slate-200">
                      <span className="text-[#64748b] font-bold">السجل التجاري:</span>
                      <span className="font-black text-[#0f172a] tracking-wider">{creditNote.client_cr || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748b] font-bold">الرقم الضريبي:</span>
                      <span className="font-black text-[#059669] text-xs">{creditNote.client_vat || '-'}</span>
                    </div>
                      <div className="flex justify-start gap-2 mt-1 pt-1 border-t border-slate-100">
                        <span className="text-[#64748b] font-bold whitespace-nowrap">العنوان:</span>
                        <span className="font-bold text-[#0f172a] leading-tight text-right text-[10px]">{creditNote.client_short_address || '-'}</span>
                      </div>
                  </div>
                </div>
              </div>

              {/* Reference Invoice Info */}
              <div className="bg-[#1e293b] p-4 rounded-[1.25rem] border-2 border-slate-200 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden shadow-lg shadow-slate-200/50 flex-shrink-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-transparent opacity-50"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                    <FileText size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">مرجع الفاتورة الأصلية</p>
                    <p className="text-base font-black text-white">{creditNote.invoice_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                    <Calendar size={16} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">تاريخ الفاتورة</p>
                    <p className="text-base font-black text-white">{formatDate(creditNote.invoice_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-inner">
                    <Calculator size={16} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">إجمالي الفاتورة</p>
                    <p className="text-base font-black text-white">{parseFloat(creditNote.invoice_total_amount).toLocaleString()} <span className="text-xs font-normal opacity-50">ريال</span></p>
                  </div>
                </div>
              </div>

            {/* Reason */}
            <div className="space-y-2 flex-shrink-0">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={12} className="text-amber-500" />
                سبب إصدار الإشعار
              </h3>
              <div className="bg-white p-4 rounded-xl border border-slate-200 italic text-slate-600 font-medium text-[12px]">
                {creditNote.reason}
              </div>
            </div>

              {/* Amount Table */}
              <div className="rounded-xl border border-[#f1f5f9] overflow-hidden shadow-sm flex-shrink-0">
                <table className="amount-table w-full text-[10px] border-collapse">
                  <thead style={{ background: '#1e293b', color: '#ffffff' }}>
                    <tr>
                      <th className="px-3 py-2 text-right font-bold text-[9px]">الوصف</th>
                      <th className="px-3 py-2 text-center font-bold text-[9px]">قبل الضريبة</th>
                      <th className="px-3 py-2 text-center font-bold text-[9px]">الضريبة 15%</th>
                      <th className="px-3 py-2 text-center font-bold text-[9px]">الإجمالي المسترجع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] bg-white">
                    <tr>
                      <td className="px-3 py-2 font-bold text-[#0f172a]">
                        مبلغ إشعار الدائن المسترجع
                        <p className="text-[8px] text-slate-400 font-medium mt-0.5">خصم من الفاتورة رقم {creditNote.invoice_number}</p>
                      </td>
                      <td className="px-3 py-2 text-center font-medium">{parseFloat(creditNote.total_before_vat).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</td>
                      <td className="px-3 py-2 text-center text-[#2563eb] font-bold">{parseFloat(creditNote.vat_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</td>
                      <td className="px-3 py-2 text-center font-black text-red-600 text-[12px]">{parseFloat(creditNote.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            {/* Summary and QR Section */}
            <div className="summary-section grid grid-cols-2 gap-6 items-stretch mt-auto flex-shrink-0">
              {/* Summary Box */}
              <div 
                className="rounded-2xl p-4 border border-[#f1f5f9] flex flex-col justify-between shadow-sm"
                style={{ background: '#f8fafc' }}
              >
                <div>
                  <h3 className="font-black text-[#0f172a] mb-3 flex items-center gap-2 text-[12px]">
                    <CreditCard size={14} className="text-[#2563eb]" />
                    ملخص الإشعار
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-dashed border-[#e2e8f0]">
                      <span className="text-[#64748b] text-[10px]">قبل الضريبة:</span>
                      <span className="font-bold text-[#0f172a] text-[10px]">{parseFloat(creditNote.total_before_vat).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-dashed border-[#e2e8f0]">
                      <span className="text-[#64748b] text-[10px]">الضريبة 15%:</span>
                      <span className="font-bold text-[#2563eb] text-[10px]">{parseFloat(creditNote.vat_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</span>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="flex justify-between items-center py-2.5 px-4 rounded-xl mt-3 shadow-md"
                  style={{ background: '#dc2626' }}
                >
                  <span className="font-black text-white text-[11px]">الإجمالي المسترجع:</span>
                  <span className="font-black text-[13px] text-white">
                    {parseFloat(creditNote.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
                  </span>
                </div>
              </div>

              {/* QR and Compliance */}
              <div className="rounded-2xl p-4 border border-[#f1f5f9] bg-white text-center flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="font-black text-[#0f172a] mb-2 flex items-center justify-center gap-2 text-[12px]">
                    <QrCode size={14} className="text-[#2563eb]" />
                    باركود ZATCA
                  </h3>
                  <div className="flex justify-center mb-1">
                    <div className="p-1.5 bg-white rounded-xl shadow-sm border border-[#f8fafc]">
                      {isMounted && (
                        <QRCodeCanvas
                          value={qrData}
                          size={110}
                          level="H"
                          includeMargin={false}
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-[#f1f5f9]">
                  <p className="text-[9px] font-bold text-slate-400">
                    مستند ضريبي معتمد - المرحلة الأولى
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance Footer */}
            <div className="pt-4 border-t border-[#f1f5f9] flex-shrink-0">
              <p className="text-[9px] text-center text-slate-400 font-medium">
                هذا المستند تم إنشاؤه آلياً وهو متوافق مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Email Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print" onClick={() => !emailSending && setShowEmailDialog(null)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-[#059669] to-[#047857] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Mail size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base">إرسال الإشعار عبر البريد</h3>
                  <p className="text-white/80 text-xs">إشعار رقم {creditNote.credit_note_number}</p>
                </div>
              </div>
              {!emailSending && (
                <button onClick={() => setShowEmailDialog(null)} className="text-white/70 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>

            {showEmailDialog === 'confirm' ? (
              /* Confirmation Step */
              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
                  <AlertCircle size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-800 font-semibold text-sm">سيتم إرسال إشعار الدائن الضريبي كملف PDF</p>
                    <p className="text-emerald-600 text-xs mt-1">
                      سيتم إنشاء ملف PDF للإشعار وإرساله كمرفق من بريد الشركة المسجل
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">رقم الإشعار</span>
                    <span className="font-bold text-gray-900">{creditNote.credit_note_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">المبلغ الإجمالي</span>
                    <span className="font-bold text-gray-900">{grandTotal.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">مرجع الفاتورة</span>
                    <span className="font-bold text-blue-600 text-xs">{creditNote.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">البريد المرسل منه</span>
                    <span className="font-bold text-blue-600 text-xs">{emailAccounts.find(a => a.id === selectedAccountId)?.email || '-'}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowEmailDialog(null)}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => setShowEmailDialog('compose')}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#059669] text-white font-bold text-sm hover:bg-[#047857] transition-all flex items-center justify-center gap-2"
                  >
                    <Mail size={16} />
                    موافق، تكملة الإرسال
                  </button>
                </div>
              </div>
            ) : (
              /* Compose Step */
              <div className="p-6 space-y-4">
                {/* Email Account Selector */}
                {emailAccounts.length > 1 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">الحساب المرسل</label>
                    <select
                      value={selectedAccountId || ''}
                      onChange={e => setSelectedAccountId(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      disabled={emailSending}
                    >
                      {emailAccounts.map((acc: any) => (
                        <option key={acc.id} value={acc.id}>{acc.email}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* To Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">إلى (البريد الإلكتروني) *</label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={e => setEmailTo(e.target.value)}
                    placeholder="example@company.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    disabled={emailSending}
                    dir="ltr"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">الموضوع</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    disabled={emailSending}
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">نص الرسالة</label>
                  <textarea
                    value={emailBody.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')}
                    onChange={e => setEmailBody(`<p style="direction:rtl;text-align:right;font-family:Arial,sans-serif;">${e.target.value.replace(/\n/g, '<br/>')}</p>`)}
                    rows={5}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    disabled={emailSending}
                  />
                </div>

                {/* Attachment info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-blue-800 font-semibold text-xs">مرفق: CreditNote-{creditNote.credit_note_number}.pdf</p>
                    <p className="text-blue-500 text-[10px]">سيتم إنشاء الملف وإرفاقه تلقائياً</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => !emailSending && setShowEmailDialog('confirm')}
                    disabled={emailSending}
                    className="px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    رجوع
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={emailSending || !emailTo}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#059669] text-white font-bold text-sm hover:bg-[#047857] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {emailSending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {pdfGenerating ? 'جاري تجهيز PDF...' : 'جاري الإرسال...'}
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        إرسال الإشعار
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Premium Email Notification Overlay */}
      <AnimatePresence>
        {emailOverlay.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
              onClick={() => emailOverlay.type !== 'loading' && setEmailOverlay(prev => ({ ...prev, show: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md p-4"
              dir="rtl"
            >
              <div className={`bg-white rounded-[2rem] p-8 shadow-2xl border-t-4 ${
                emailOverlay.type === 'success' ? 'border-emerald-500' :
                emailOverlay.type === 'error' ? 'border-red-500' : 'border-blue-500'
              }`}>
                <div className="text-center">
                  <div className={`h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    emailOverlay.type === 'success' ? 'bg-emerald-100 text-emerald-500' :
                    emailOverlay.type === 'error' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
                  }`}>
                    {emailOverlay.type === 'loading' && <Loader2 size={40} className="animate-spin" />}
                    {emailOverlay.type === 'success' && <MailCheck size={40} />}
                    {emailOverlay.type === 'error' && <XCircle size={40} />}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{emailOverlay.title}</h3>
                  <p className="text-gray-500 mb-6 font-medium whitespace-pre-line">{emailOverlay.message}</p>

                  {emailOverlay.type === 'loading' && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 8, ease: 'linear' }}
                      />
                    </div>
                  )}

                  {emailOverlay.type !== 'loading' && (
                    <button
                      onClick={() => setEmailOverlay(prev => ({ ...prev, show: false }))}
                      className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg active:scale-95 ${
                        emailOverlay.type === 'success' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'
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
    </>
    );
}
