"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Building2,
  Printer,
  Download,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  University,
  Truck,
  ShieldCheck,
  Signature,
  Stamp,
  QrCode,
  Mail,
  Send,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { useTranslations } from "@/lib/locale-context";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, MailCheck, XCircle } from "lucide-react";

interface InvoiceItem {
  id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_before_vat: number;
  vat_amount: number;
  total_with_vat: number;
  period_from: string;
  period_to: string;
  status: string;
}

interface Adjustment {
  id: number;
  title: string;
  type: string;
  amount: number;
  vat_amount: number;
  total_with_vat: number;
  is_gross: number;
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
  logo_path: string;
  stamp_path: string;
  digital_seal_path: string;
  currency: string;
}

interface BankAccount {
  id: number;
  bank_name: string;
  bank_account: string;
  bank_iban: string;
  bank_beneficiary: string;
}

interface Customer {
  id: number;
  name?: string;
  customer_name?: string;
  company_name?: string;
  email: string;
  phone: string;
  address: string;
  short_address?: string;
  vat_number: string;
  commercial_number: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_month: string;
  client_name: string;
  client_vat: string;
  client_address: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  vat_total: number;
  status: string;
}

interface CreatedByUser {
  id: number;
  name: string;
  company_logo: string | null;
}

interface InvoiceViewClientProps {
  invoice: Invoice;
  items: InvoiceItem[];
  adjustments: Adjustment[];
  company: Company;
  bankAccounts: BankAccount[];
  customer: Customer | null;
  createdByUser: CreatedByUser | null;
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
    
    // Parse date properly - handle both "2024-01-15" and "2024-01-15T00:00:00.000Z" formats
    let formattedDate: string;
    if (invoiceDate && invoiceDate !== 'Invalid Date') {
      const d = new Date(invoiceDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString(); // e.g. "2024-01-15T00:00:00.000Z"
      } else {
        formattedDate = new Date().toISOString();
      }
    } else {
      formattedDate = new Date().toISOString();
    }
    
    // ZATCA Phase 1 TLV: 5 mandatory tags
    // Tag 1: Seller Name, Tag 2: VAT Number, Tag 3: Timestamp, Tag 4: Total, Tag 5: VAT
    const values = [
      sellerName || '',
      vatNumber || '',
      formattedDate,
      totalWithVAT || '0.00',
      vatAmount || '0.00'
    ];
    
    const tlvParts: number[] = [];
    values.forEach((value, index) => {
      const encoded = encoder.encode(String(value));
      tlvParts.push(index + 1); // Tag number
      tlvParts.push(encoded.length); // Length
      tlvParts.push(...encoded); // Value
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

const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr === 'Invalid Date') return '-';
  try {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
};

const getClaimMonth = (dateStr: string) => {
  if (!dateStr || dateStr === 'Invalid Date') return '-';
  try {
    const d = new Date(dateStr);
    return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
  } catch (e) {
    return '-';
  }
};

export function InvoiceViewClient({
  invoice,
  items,
  adjustments,
  company,
  bankAccounts,
  customer,
  createdByUser
}: InvoiceViewClientProps) {
  const t = useTranslations("invoices");
  const tc = useTranslations("common");
  const printRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(bankAccounts[0]?.id);
  const [showBankSelector, setShowBankSelector] = useState(false);
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

    // Close bank selector on outside click
    useEffect(() => {
      if (!showBankSelector) return;
      const handler = () => setShowBankSelector(false);
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }, [showBankSelector]);

    // Fetch company email accounts
    useEffect(() => {
      if (company?.id) {
        fetch(`/api/email/accounts?company_id=${company.id}`)
          .then(r => r.json())
          .then(data => {
            if (data.accounts?.length > 0) {
              setEmailAccounts(data.accounts);
              setSelectedAccountId(data.accounts[0].id);
            }
          })
          .catch(() => {});
      }
    }, [company?.id]);

  const selectedBank = bankAccounts.find(b => b.id === selectedBankId) || bankAccounts[0];

  const totalBeforeVat = items.reduce((sum, item) => sum + parseFloat(String(item.total_before_vat || 0)), 0);
  const totalVat = items.reduce((sum, item) => sum + parseFloat(String(item.vat_amount || 0)), 0);
  
  let discountTotal = 0;
  let additionTotal = 0;
  adjustments.forEach(adj => {
    if (adj.type === 'discount') {
      discountTotal += parseFloat(String(adj.total_with_vat || 0));
    } else {
      additionTotal += parseFloat(String(adj.total_with_vat || 0));
    }
  });

  const grandTotal = parseFloat(String(invoice.total_amount || 0));
  const invoiceStatus = items[0]?.status || invoice.status || 'due';

  const qrData = generateQRCodeTLV(
    company?.name || '',
    company?.vat_number || '',
    invoice.issue_date || '',
    grandTotal.toFixed(2),
    totalVat.toFixed(2)
  );

  const companyAddress = [
    company?.country,
    company?.region,
    company?.district,
    company?.street,
    company?.postal_code
  ].filter(Boolean).join(' - ');

    const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${t("vatInvoice")} - ${invoice.invoice_number}`,
  });

    // Convert cross-origin images to data URLs for foreignObjectRendering
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
        
        // Wait for all fonts to be loaded
        await document.fonts.ready;
        
        // Convert images to data URLs for foreignObjectRendering
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
          
          // Scale image to fit exactly on one A4 page
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
          const yOffset = 0;
          
          pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalImgWidth, finalImgHeight);
          pdf.save(`${t("vatInvoice")}-${invoice.invoice_number}.pdf`);


    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPdfLoading(false);
    }
    };

    // Generate PDF as base64 for email attachment (optimized for smaller file size)
      const generatePDFBase64 = async (): Promise<string | null> => {
        try {
          const html2canvas = (await import('html2canvas-pro')).default;
          const { jsPDF } = await import('jspdf');
          const element = printRef.current;
          if (!element) return null;

            // Wait for all fonts to be loaded
            await document.fonts.ready;

            // Convert images to data URLs for foreignObjectRendering
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

        // Get base64 without the data:... prefix
        const pdfOutput = pdf.output('datauristring');
        const base64 = pdfOutput.split(',')[1];
        return base64;
      } catch (error) {
        console.error('Error generating PDF base64:', error);
        return null;
      }
    };

    // Handle "Send Invoice via Email" button click
    const handleEmailInvoiceClick = () => {
      if (emailAccounts.length === 0) {
        toast.error('لا يوجد حساب بريد مسجل للشركة. يرجى إضافة حساب بريد أولاً', {
          duration: 5000,
        });
        return;
      }
      setEmailTo(customer?.email || '');
      setEmailSubject(`فاتورة ضريبية رقم ${invoice.invoice_number} - ${company?.name || ''}`);
      setEmailBody(
        `<p style="direction:rtl;text-align:right;font-family:Arial,sans-serif;">` +
        `السلام عليكم ورحمة الله وبركاته،<br/><br/>` +
        `نرفق لكم الفاتورة الضريبية رقم <strong>${invoice.invoice_number}</strong> بمبلغ إجمالي <strong>${grandTotal.toFixed(2)} ${company?.currency || 'SAR'}</strong>.<br/><br/>` +
        `تاريخ الإصدار: ${formatDate(invoice.issue_date)}<br/>` +
        `تاريخ الاستحقاق: ${formatDate(invoice.due_date)}<br/><br/>` +
        `مع خالص التحية،<br/>` +
        `${company?.name || ''}</p>`
      );
      setShowEmailDialog('confirm');
    };

    // Handle send email after compose
    const handleSendInvoiceEmail = async () => {
        if (!emailTo || !selectedAccountId) {
          toast.error('يرجى إدخال بريد المستلم');
          return;
        }

        setEmailSending(true);
        setPdfGenerating(true);
        setShowEmailDialog(null);
        setEmailOverlay({ show: true, type: 'loading', title: 'جاري تجهيز الفاتورة', message: `يتم الآن إنشاء ملف PDF للفاتورة رقم ${invoice.invoice_number}` });

        try {
          const pdfBase64 = await generatePDFBase64();
          setPdfGenerating(false);

          if (!pdfBase64) {
            setEmailOverlay({ show: true, type: 'error', title: 'فشل إنشاء الملف', message: 'تعذر إنشاء ملف PDF للفاتورة. يرجى المحاولة مرة أخرى.' });
            return;
          }

          setEmailOverlay({ show: true, type: 'loading', title: 'جاري إرسال البريد الإلكتروني', message: `يتم الآن إرسال الفاتورة إلى ${emailTo}` });

          const res = await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accountId: selectedAccountId,
              company_id: company?.id,
              to: emailTo,
              subject: emailSubject,
              body: emailBody,
              attachments: [{
                filename: `Invoice-${invoice.invoice_number}.pdf`,
                content: pdfBase64,
                contentType: 'application/pdf',
              }]
            })
          });

          const data = await res.json();

          if (data.success) {
            setEmailOverlay({ show: true, type: 'success', title: 'تم الإرسال بنجاح', message: `تم إرسال الفاتورة رقم ${invoice.invoice_number} بنجاح إلى\n${emailTo}` });
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

  // ZATCA submit handler
  const handleZatcaSubmit = async () => {
    setZatcaSubmitting(true);
    setZatcaStatus(null);
    try {
      const invoiceData = {
        id: String(invoice.id),
        invoiceNumber: invoice.invoice_number,
        invoiceTypeCode: "388",
        invoiceSubType: customer?.vat_number ? "0100000" : "0200000",
        issueDate: invoice.issue_date?.split("T")[0] || new Date().toISOString().split("T")[0],
        issueTime: "00:00:00",
        currency: "SAR",
        sellerName: company?.name || "",
        sellerVatNumber: company?.vat_number || "",
        sellerCRNumber: company?.commercial_number || "",
        sellerStreet: company?.street || "",
        sellerDistrict: company?.district || "",
        sellerCity: company?.region || "",
        sellerPostalCode: company?.postal_code || "",
        sellerCountry: "SA",
        buyerName: customer?.name || customer?.customer_name || customer?.company_name || invoice.client_name || "",
        buyerVatNumber: customer?.vat_number || invoice.client_vat || "",
        buyerStreet: customer?.address || invoice.client_address || "",
        buyerCity: "",
        buyerDistrict: "",
        buyerPostalCode: "",
        buyerCountry: "SA",
        totalBeforeVat: totalBeforeVat,
        totalVat: totalVat,
        totalWithVat: grandTotal,
        paymentMeansCode: "10",
        items: items.map((item, idx) => ({
          id: String(idx + 1),
          name: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          vatRate: 15,
          vatAmount: item.vat_amount,
          totalBeforeVat: item.total_before_vat,
          totalWithVat: item.total_with_vat,
          vatCategory: "S",
        })),
      };

      const res = await fetch("/api/zatca/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: company?.id,
          document_type: "invoice",
          document_id: String(invoice.id),
          invoice_data: invoiceData,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setZatcaStatus("success");
        toast.success("تم إرسال الفاتورة إلى ZATCA بنجاح");
      } else {
        setZatcaStatus("failed");
        toast.error(data.error || "فشل إرسال الفاتورة");
      }
    } catch (err: any) {
      setZatcaStatus("failed");
      toast.error("خطأ في الاتصال بـ ZATCA");
    } finally {
      setZatcaSubmitting(false);
    }
  };

    return (
      <>
      <div className="min-h-screen bg-transparent overflow-y-auto">
        <div className="w-full max-w-[210mm] mx-auto py-6 space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center no-print px-4">
          <Link href="/sales-invoices">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#334155] hover:bg-[#f8fafc] border border-[#e2e8f0] font-bold text-sm transition-all shadow-sm">
              <ArrowRight size={18} />
              {tc("back")}
            </button>
          </Link>
          <button
            onClick={() => handlePrint()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e293b] text-white hover:bg-[#0f172a] font-bold text-sm transition-all shadow-md"
          >
            <Printer size={18} />
            {tc("print")}
          </button>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] font-bold text-sm transition-all shadow-md disabled:opacity-50"
            >
              <Download size={18} />
              {pdfLoading ? tc("loading") : tc("export") + " PDF"}
            </button>
            <button
              onClick={handleEmailInvoiceClick}
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
              {zatcaSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {zatcaSubmitting ? "جاري الإرسال..." : zatcaStatus === "success" ? "تم الإرسال" : "إرسال ZATCA"}
            </button>
          </div>

            {/* Invoice Layout */}
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
              className="text-white p-8 relative overflow-hidden flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
            >
              <div className="flex flex-row justify-between items-center gap-4 relative z-10">
                {/* Company Logo */}
                <div 
                  className="w-24 h-24 rounded-xl flex items-center justify-center p-3 border border-[#ffffff33]"
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
                    <Building2 size={40} className="text-white/60" />
                  )}
                </div>

                {/* Title Center */}
                <div className="text-center flex-1">
                  <h1 className="text-3xl font-black mb-0 tracking-wider">{t("vatInvoice")}</h1>
                  <p className="text-white/60 text-sm uppercase font-light">{t("vatInvoiceEn")}</p>
                  <div className="mt-2 inline-flex items-center gap-2 px-5 py-1.5 rounded-lg border border-[#ffffff1a]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="font-bold text-xs">{t("electronicInvoicingSystem")}</span>
                  </div>
                </div>

                {/* Representative Photo Circle */}
                <div className="flex flex-col items-center gap-1.5">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center border-2 border-[#ffffff44] overflow-hidden"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  >
                    {createdByUser?.company_logo ? (
                      <img 
                        src={getPublicUrl(createdByUser.company_logo) || ''} 
                        alt="المندوب" 
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white/40">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="currentColor"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-white/50 text-[10px] font-medium">المندوب</span>
                </div>

                {/* System Logo */}
                <div className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-[#ffffff1a] min-w-[130px]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Truck size={28} className="text-[#3b82f6]" />
                  <h2 className="text-xs font-black text-white uppercase">Logistics Systems</h2>
                </div>
              </div>

              {/* Header Meta */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-[#ffffff1a] relative z-10">
                <div className="text-center">
                  <span className="text-[#ffffff66] text-xs block">{t("claimMonth")}</span>
                  <p className="font-bold text-base">{invoice.invoice_month || getClaimMonth(invoice.issue_date)}</p>
                </div>
                <div className="text-center">
                  <span className="text-[#ffffff66] text-xs block">{t("invoiceNumber")}:</span>
                  <p className="font-bold text-base tracking-widest">{invoice.invoice_number}</p>
                </div>
                <div className="text-center">
                  <span className="text-[#ffffff66] text-xs block">{t("issueDateLabel")}</span>
                  <p className="font-bold text-base">{formatDate(invoice.issue_date)}</p>
                </div>
              </div>
            </div>

            <div className="invoice-content p-8 space-y-6 flex flex-col">
              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-5 flex-shrink-0">
                {/* Company Info */}
                <div className="info-card rounded-2xl p-5 border border-[#f1f5f9]" style={{ backgroundColor: '#f8fafc' }}>
                  <h3 className="font-black text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0] flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-5 bg-[#2563eb] rounded-full"></div>
                    {t("facilityData")}
                  </h3>
                  <div className="space-y-2.5 text-[13px]">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[#64748b]">{tc("name")}:</span>
                      <span className="font-bold text-[#0f172a] text-right">{company?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748b]">{tc("commercialNumber")}:</span>
                      <span className="font-bold text-[#0f172a]">{company?.commercial_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748b]">{tc("vatNumber")}:</span>
                      <span className="font-bold text-[#2563eb]">{company?.vat_number}</span>
                    </div>
                    <div className="flex justify-start gap-2">
                      <span className="text-[#64748b] whitespace-nowrap">{tc("address")}:</span>
                      <span className="font-bold text-[#0f172a] leading-tight text-right">{companyAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="info-card rounded-2xl p-5 border border-[#f1f5f9]" style={{ backgroundColor: '#f8fafc' }}>
                  <h3 className="font-black text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0] flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-5 bg-[#059669] rounded-full"></div>
                    {t("customerData")}
                  </h3>
                  <div className="space-y-2.5 text-[13px]">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[#64748b]">{tc("name")}:</span>
                      <span className="font-bold text-[#0f172a] text-right">{customer?.company_name || customer?.name || invoice.client_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748b]">{tc("commercialNumber")}:</span>
                      <span className="font-bold text-[#0f172a]">{customer?.commercial_number || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748b]">{tc("vatNumber")}:</span>
                      <span className="font-bold text-[#059669]">{customer?.vat_number || invoice.client_vat || '-'}</span>
                    </div>
                      <div className="flex justify-start gap-2">
                        <span className="text-[#64748b] whitespace-nowrap">{tc("address")}:</span>
                        <span className="font-bold text-[#0f172a] leading-tight text-right">{customer?.short_address || customer?.address || invoice.client_address || "-"}</span>
                      </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-xl border border-[#f1f5f9] overflow-hidden shadow-sm flex-shrink-0">
                <table className="items-table w-full text-[13px] border-collapse">
                  <thead style={{ background: '#1e293b', color: '#ffffff' }}>
                    <tr>
                      <th className="px-4 py-3 text-right font-bold">{t("itemNameHeader")}</th>
                      <th className="px-4 py-3 text-center font-bold">{t("quantity")}</th>
                      <th className="px-4 py-3 text-center font-bold">{t("unitPrice")}</th>
                      <th className="px-4 py-3 text-center font-bold">{t("beforeTax")}</th>
                      <th className="px-4 py-3 text-center font-bold">{t("taxRateHeader")}</th>
                      <th className="px-4 py-3 text-center font-bold">{tc("total")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9] bg-white">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#f8fafc]">
                        <td className="px-4 py-2.5 text-[#0f172a] font-medium">{item.product_name}</td>
                        <td className="px-4 py-2.5 text-center">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-center">{parseFloat(String(item.unit_price)).toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-center">{parseFloat(String(item.total_before_vat)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2.5 text-center text-[#2563eb] font-bold">{parseFloat(String(item.vat_amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-2.5 text-center font-black text-[#0f172a]">{parseFloat(String(item.total_with_vat)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    
                    {adjustments.map((adj) => (
                      <tr key={adj.id} style={{ backgroundColor: adj.type === 'discount' ? '#fff1f2' : '#f0fdf4' }}>
                        <td className="px-4 py-2.5 font-bold text-[#1e293b]">
                          {adj.title} <span className="text-[11px] opacity-60">({adj.type === 'discount' ? t("adjustmentDiscount") : t("adjustmentAddition")})</span>
                        </td>
                        <td className="px-4 py-2.5 text-center opacity-40">-</td>
                        <td className="px-4 py-2.5 text-center opacity-40">-</td>
                        <td className={`px-4 py-2.5 text-center font-bold ${adj.type === 'discount' ? 'text-[#e11d48]' : 'text-[#059669]'}`}>
                          {adj.type === 'discount' ? '-' : ''}{parseFloat(String(adj.amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2.5 text-center opacity-40">-</td>
                        <td className={`px-4 py-2.5 text-center font-black ${adj.type === 'discount' ? 'text-[#be123c]' : 'text-[#047857]'}`}>
                          {adj.type === 'discount' ? '-' : ''}{parseFloat(String(adj.total_with_vat)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary and QR Section */}
              <div className="summary-section grid grid-cols-2 gap-5 items-stretch flex-shrink-0">
                {/* Summary Box */}
                <div 
                  className="rounded-2xl p-5 border border-[#f1f5f9] flex flex-col justify-between"
                  style={{ background: '#f8fafc' }}
                >
                  <div>
                    <h3 className="font-black text-[#0f172a] mb-3 flex items-center gap-2 text-sm">
                      <CreditCard size={16} className="text-[#2563eb]" />
                      {t("summary")}
                    </h3>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#e2e8f0]">
                        <span className="text-[#64748b] text-[13px]">{t("beforeTax")}:</span>
                        <span className="font-bold text-[#0f172a] text-[13px]">{totalBeforeVat.toLocaleString('en-US', { minimumFractionDigits: 2 })} {tc("sar")}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#e2e8f0]">
                        <span className="text-[#64748b] text-[13px]">{t("taxRateHeader")}:</span>
                        <span className="font-bold text-[#2563eb] text-[13px]">{totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })} {tc("sar")}</span>
                      </div>
                      {(discountTotal > 0 || additionTotal > 0) && (
                        <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#e2e8f0]">
                          <span className="text-[#64748b] text-[13px]">{tc("discount")}/{tc("add")}:</span>
                          <span className={`font-bold text-[13px] ${additionTotal - discountTotal < 0 ? 'text-[#e11d48]' : 'text-[#059669]'}`}>
                            {(additionTotal - discountTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} {tc("sar")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className="flex justify-between items-center py-3 px-5 rounded-xl mt-3 shadow-md"
                    style={{ background: '#059669' }}
                  >
                    <span className="font-black text-white text-sm">{t("amountDue")}</span>
                    <span className="font-black text-base text-white">
                      {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} {tc("sar")}
                    </span>
                  </div>
                </div>

                {/* QR and Period */}
                <div className="rounded-2xl p-5 border border-[#f1f5f9] bg-white text-center flex flex-col justify-between shadow-sm">
                  <div>
                    <h3 className="font-black text-[#0f172a] mb-3 flex items-center justify-center gap-2 text-sm">
                      <QrCode size={16} className="text-[#2563eb]" />
                      {t("zatcaBarcode")}
                    </h3>
                    <div className="flex justify-center mb-2">
                      <div className="p-2 bg-white rounded-xl shadow-sm border border-[#f8fafc]">
                        {isMounted && (
                          <QRCodeCanvas
                              value={qrData}
                              size={140}
                              level="H"
                              includeMargin={false}
                            />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-[#f1f5f9]">
                    <p className="font-bold text-[#2563eb] text-xs">
                      {t("period")} {formatDate(items[0]?.period_from)} - {formatDate(items[0]?.period_to)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Info */}
              {selectedBank && (
                <div 
                  className="bank-info-box rounded-2xl p-5 border border-[#ccfbf1] flex-shrink-0"
                  style={{ background: '#f0fdfa' }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <University size={16} className="text-[#059669]" />
                      <h3 className="font-black text-[#0f172a] text-sm">{t("bankInfo")}</h3>
                    </div>
                    {/* Bank Selector - hidden in print */}
                    {bankAccounts.length > 1 && (
                      <div className="relative no-print">
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowBankSelector(!showBankSelector); }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#059669] text-[#059669] rounded-lg text-xs font-bold hover:bg-[#059669] hover:text-white transition-all"
                        >
                          <RefreshCw size={12} />
                          تبديل الحساب
                          <ChevronDown size={12} className={`transition-transform ${showBankSelector ? 'rotate-180' : ''}`} />
                        </button>
                        {showBankSelector && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-20 overflow-hidden min-w-[220px]">
                            {bankAccounts.map((bank) => (
                              <button
                                key={bank.id}
                                onClick={() => {
                                  setSelectedBankId(bank.id);
                                  setShowBankSelector(false);
                                }}
                                className={`w-full text-right px-3 py-2.5 text-xs hover:bg-[#f0fdfa] transition-colors border-b border-[#f1f5f9] last:border-0 ${
                                  bank.id === selectedBankId ? 'bg-[#f0fdfa] font-bold text-[#059669]' : 'text-[#0f172a]'
                                }`}
                              >
                                <div className="font-bold">{bank.bank_name}</div>
                                <div className="text-[10px] text-[#94a3b8]">{bank.bank_beneficiary}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Row 1: Bank Name & Beneficiary */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded-xl p-3 border border-[#f1f5f9] shadow-sm text-center">
                      <p className="text-[11px] text-[#94a3b8] mb-1">البنك</p>
                      <p className="font-bold text-[#0f172a] text-sm">{selectedBank.bank_name}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-[#f1f5f9] shadow-sm text-center">
                      <p className="text-[11px] text-[#94a3b8] mb-1">المستفيد</p>
                      <p className="font-bold text-[#0f172a] text-sm">{selectedBank.bank_beneficiary}</p>
                    </div>
                  </div>
                  {/* Row 2: Account Number & IBAN */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-[#f1f5f9] shadow-sm text-center">
                      <p className="text-[11px] text-[#94a3b8] mb-1">رقم الحساب</p>
                      <p className="font-bold text-[#2563eb] text-sm tracking-wide">{selectedBank.bank_account}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-[#f1f5f9] shadow-sm text-center">
                      <p className="text-[11px] text-[#94a3b8] mb-1">الآيبان</p>
                      <p className="font-bold text-[#0f172a] text-xs break-all leading-relaxed tracking-wide">{selectedBank.bank_iban}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stamp and Signature Section */}
              <div className="stamp-sig-section grid grid-cols-2 gap-8 pt-4 border-t border-[#f1f5f9] flex-shrink-0">
                {/* Stamp */}
                <div className="text-center">
                  <h4 className="text-[#64748b] font-bold text-xs mb-3 uppercase tracking-tight">{t("companyStamp")}</h4>
                  <div className="w-32 h-32 mx-auto bg-white rounded-2xl border border-dashed border-[#e2e8f0] flex items-center justify-center p-3 shadow-sm transition-all">
                    {company.stamp_path ? (
                      <img 
                        src={getPublicUrl(company.stamp_path) || ''} 
                        alt="Stamp" 
                        className="max-w-full max-h-full object-contain grayscale opacity-80"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <Stamp size={44} className="text-[#e2e8f0]" />
                    )}
                  </div>
                </div>

                {/* Signature */}
                <div className="text-center">
                  <h4 className="text-[#64748b] font-bold text-xs mb-3 uppercase tracking-tight">{t("digitalSignature")}</h4>
                  <div className="w-32 h-32 mx-auto bg-white rounded-2xl border border-dashed border-[#e2e8f0] flex items-center justify-center p-3 shadow-sm transition-all">
                    {company.digital_seal_path ? (
                      <img 
                        src={getPublicUrl(company.digital_seal_path) || ''} 
                        alt="Signature" 
                        className="max-w-full max-h-full object-contain"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <Signature size={44} className="text-[#e2e8f0]" />
                    )}
                  </div>
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
                      <h3 className="text-white font-bold text-base">إرسال الفاتورة عبر البريد</h3>
                      <p className="text-white/80 text-xs">فاتورة رقم {invoice.invoice_number}</p>
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
                        <p className="text-emerald-800 font-semibold text-sm">سيتم إرسال الفاتورة الضريبية كملف PDF</p>
                        <p className="text-emerald-600 text-xs mt-1">
                          سيتم إنشاء ملف PDF للفاتورة وإرساله كمرفق من بريد الشركة المسجل
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">رقم الفاتورة</span>
                        <span className="font-bold text-gray-900">{invoice.invoice_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">المبلغ الإجمالي</span>
                        <span className="font-bold text-gray-900">{grandTotal.toFixed(2)} {company?.currency || 'SAR'}</span>
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
                          {emailAccounts.map(acc => (
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
                        <p className="text-blue-800 font-semibold text-xs">مرفق: Invoice-{invoice.invoice_number}.pdf</p>
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
                        onClick={handleSendInvoiceEmail}
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
                            إرسال الفاتورة
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
        </div>
      </>
      );
  }
