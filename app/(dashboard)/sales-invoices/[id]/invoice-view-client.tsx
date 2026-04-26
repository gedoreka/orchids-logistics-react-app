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

  QrCode,
  Mail,
  Send,
  X,
  Loader2,
    AlertCircle,
    RefreshCw,
    ChevronDown,
    Settings,
    Layers,
    Check
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
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

    // Email sending states
  const [showEmailDialog, setShowEmailDialog] = useState<'confirm' | 'compose' | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState<Array<{ id: number; email: string }>>([]);
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
          
          // Convert images to data URLs
          await convertImagesToDataURLs(element);
          
          // Convert QR <canvas> elements to <img> so html2canvas can capture them
          const canvasElements = element.querySelectorAll('canvas');
          const canvasRestoreFns: (() => void)[] = [];
          canvasElements.forEach((cvs) => {
            try {
              const dataUrl = cvs.toDataURL('image/png');
              const img = document.createElement('img');
              img.src = dataUrl;
              img.width = cvs.width;
              img.height = cvs.height;
              img.style.width = cvs.style.width || `${cvs.width}px`;
              img.style.height = cvs.style.height || `${cvs.height}px`;
              const parent = cvs.parentNode;
              if (parent) {
                parent.replaceChild(img, cvs);
                canvasRestoreFns.push(() => parent.replaceChild(cvs, img));
              }
            } catch (e) {
              console.warn('Could not convert canvas:', e);
            }
          });
          
          const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: 794,
            windowWidth: 794,
            foreignObjectRendering: false,
          });
          
          // Restore original canvas elements
          canvasRestoreFns.forEach(fn => fn());
            
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
          pdf.save(`${t("vatInvoice")}-${invoice.invoice_number}.pdf`);

      } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('فشل تصدير PDF');
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

            // Convert images to data URLs
            await convertImagesToDataURLs(element);

            // Convert QR <canvas> elements to <img>
            const canvasElements = element.querySelectorAll('canvas');
            const canvasRestoreFns: (() => void)[] = [];
            canvasElements.forEach((cvs) => {
              try {
                const dataUrl = cvs.toDataURL('image/png');
                const img = document.createElement('img');
                img.src = dataUrl;
                img.width = cvs.width;
                img.height = cvs.height;
                img.style.width = cvs.style.width || `${cvs.width}px`;
                img.style.height = cvs.style.height || `${cvs.height}px`;
                const parent = cvs.parentNode;
                if (parent) {
                  parent.replaceChild(img, cvs);
                  canvasRestoreFns.push(() => parent.replaceChild(cvs, img));
                }
              } catch (e) {
                console.warn('Could not convert canvas:', e);
              }
            });

            const canvas = await html2canvas(element, {
              scale: 2,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff',
              width: 794,
              windowWidth: 794,
              foreignObjectRendering: false,
            });

            // Restore original canvas elements
            canvasRestoreFns.forEach(fn => fn());

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
    } catch {
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
            onClick={() => setShowTemplateSelector(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6d28d9] text-white hover:bg-[#5b21b6] font-bold text-sm transition-all shadow-md"
          >
            <Layers size={18} />
            القوالب {selectedTemplate > 0 ? `(${selectedTemplate})` : ''}
          </button>
          {/* Bank Account Selector — works for all templates */}
          {bankAccounts.length >= 1 && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowBankSelector(!showBankSelector); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0369a1] text-white hover:bg-[#0284c7] font-bold text-sm transition-all shadow-md"
              >
                <University size={18} />
                {selectedBank?.bank_name || 'الحساب البنكي'}
                <ChevronDown size={14} className={`transition-transform ${showBankSelector ? 'rotate-180' : ''}`} />
              </button>
              {showBankSelector && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-[#e2e8f0] rounded-xl shadow-xl z-30 overflow-hidden min-w-[230px]" onClick={(e) => e.stopPropagation()}>
                  {bankAccounts.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => { setSelectedBankId(bank.id); setShowBankSelector(false); }}
                      className={`w-full text-right px-4 py-3 text-xs hover:bg-[#f0f9ff] transition-colors border-b border-[#f1f5f9] last:border-0 ${
                        bank.id === selectedBankId ? 'bg-[#f0f9ff] font-bold text-[#0369a1]' : 'text-[#0f172a]'
                      }`}
                    >
                      <div className="font-bold text-sm">{bank.bank_name}</div>
                      <div className="text-[10px] text-[#94a3b8] mt-0.5">{bank.bank_beneficiary}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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
                  minHeight: '297mm',
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


            {selectedTemplate === 0 && (<>
            {/* Header */}
            <div
                className="text-white px-6 py-4 relative overflow-hidden flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
              >
              <div className="flex flex-row items-center gap-4 relative z-10">
                {/* Company Logo */}
                <div 
                  className="w-20 h-20 rounded-xl flex items-center justify-center p-2.5 border border-[#ffffff33] flex-shrink-0"
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
                    <Building2 size={36} className="text-white/60" />
                  )}
                </div>

                {/* Title Center */}
                <div className="text-center flex-1">
                    <h1 className="text-xl font-black mb-0.5 tracking-wider">VAT Invoice</h1>
                    <span className="font-bold text-[11px] text-white/60">{t("electronicInvoicingSystem")}</span>
                  </div>

                {/* System Logo */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl border border-[#ffffff1a] min-w-[90px] max-w-[110px] flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                  <img src="/logo.png" alt="System Logo" className="max-h-12 max-w-full object-contain" />
                </div>
              </div>

              {/* Header Meta */}
              <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-[#ffffff1a] relative z-10">
                <div className="text-center">
                  <span className="text-[#ffffff55] text-[10px] block">{t("claimMonth")}</span>
                  <p className="font-bold text-sm">{invoice.invoice_month || getClaimMonth(invoice.issue_date)}</p>
                </div>
                <div className="text-center">
                  <span className="text-[#ffffff55] text-[10px] block">{t("invoiceNumber")}</span>
                  <p className="font-bold text-sm tracking-widest">{invoice.invoice_number}</p>
                </div>
                <div className="text-center">
                  <span className="text-[#ffffff55] text-[10px] block">{t("issueDateLabel")}</span>
                  <p className="font-bold text-sm">{formatDate(invoice.issue_date)}</p>
                </div>
                <div className="text-center">
                  <span className="text-[#ffffff55] text-[10px] block">{t("period")}</span>
                  <p className="font-bold text-sm">{formatDate(items[0]?.period_from)} - {formatDate(items[0]?.period_to)}</p>
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
                    <div className="flex justify-center">
                      <div className="bg-white rounded-xl shadow-sm border border-[#f8fafc] inline-block">
                          {isMounted && (
                            <QRCodeCanvas
                                value={qrData}
                                size={220}
                                level="H"
                                includeMargin={true}
                              />
                          )}
                        </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Bank Info */}
                {selectedBank ? (
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
                      {bankAccounts.length >= 1 && (
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
                ) : (
                  <div className="rounded-2xl p-5 border border-amber-300 bg-amber-50 flex-shrink-0">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle size={18} className="text-amber-700 mt-0.5" />
                      <div>
                        <h3 className="font-black text-amber-900 text-sm">الفاتورة غير مكتملة</h3>
                        <p className="text-xs font-bold text-amber-800 leading-relaxed mt-1">
                          لم يتم عرض معلومات الحساب البنكي في الفاتورة لأن بيانات الحساب البنكي غير مضافة في إعدادات المنشأة.
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-amber-700 leading-relaxed mb-4">
                      يمكنك إضافة أكثر من حساب بنكي، ثم التحكم بالحساب الذي يظهر في الفاتورة من صفحة عرض الفاتورة بعد الإضافة.
                    </p>
                    <Link
                      href="/user_profile"
                      className="no-print inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-black hover:bg-amber-700 transition-colors"
                    >
                      <Settings size={14} />
                      الانتقال إلى إعدادات المنشأة
                    </Link>
                  </div>
                )}



            </div>
            </>)}

            {/* ═══════════ TEMPLATE 1 — Blue Professional ═══════════ */}
            {selectedTemplate === 1 && (<>
              <div style={{height:'6px',background:'linear-gradient(90deg,#1e40af,#3b82f6,#1e40af)'}} />
              <div style={{background:'#fff',padding:'20px 28px',borderBottom:'1px solid #e2e8f0'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <div style={{width:'56px',height:'56px',borderRadius:'10px',overflow:'hidden',border:'2px solid #dbeafe',background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {company.logo_path?<img src={getPublicUrl(company.logo_path)||''}alt="Logo"style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}crossOrigin="anonymous"/>:<Building2 size={24}color="#1e40af"/>}
                    </div>
                    <div>
                      <p style={{fontWeight:900,fontSize:'15px',color:'#0f172a',margin:0}}>{company.name}</p>
                      <p style={{fontSize:'10px',color:'#64748b',margin:'2px 0 0'}}>CR: {company.commercial_number}</p>
                      <p style={{fontSize:'10px',color:'#3b82f6',margin:'1px 0 0'}}>VAT: {company.vat_number}</p>
                    </div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <p style={{fontWeight:900,fontSize:'22px',color:'#1e40af',margin:0,letterSpacing:'2px'}}>فاتورة ضريبية</p>
                    <p style={{fontSize:'11px',color:'#94a3b8',fontWeight:700,margin:'2px 0 0',letterSpacing:'3px'}}>VAT INVOICE</p>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{background:'#1e40af',color:'#fff',padding:'8px 18px',borderRadius:'10px',display:'inline-block'}}>
                      <p style={{fontSize:'9px',color:'#93c5fd',margin:0,letterSpacing:'1px'}}>INVOICE NO.</p>
                      <p style={{fontWeight:900,fontSize:'17px',margin:0}}>{invoice.invoice_number}</p>
                    </div>
                    <p style={{fontSize:'11px',color:'#64748b',margin:'5px 0 0',fontWeight:700}}>{formatDate(invoice.issue_date)}</p>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginTop:'14px',paddingTop:'14px',borderTop:'1px solid #f1f5f9'}}>
                  {[{label:'شهر المطالبة',value:invoice.invoice_month||getClaimMonth(invoice.issue_date)},{label:'تاريخ الاستحقاق',value:formatDate(invoice.due_date)},{label:'الفترة من',value:formatDate(items[0]?.period_from)},{label:'الفترة إلى',value:formatDate(items[0]?.period_to)}].map((m,i)=>(
                    <div key={i} style={{background:'#f8fafc',borderRadius:'8px',padding:'8px 10px',border:'1px solid #e2e8f0'}}>
                      <p style={{fontSize:'9px',color:'#94a3b8',fontWeight:700,margin:0}}>{m.label}</p>
                      <p style={{fontWeight:800,fontSize:'12px',color:'#0f172a',margin:'2px 0 0'}}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{padding:'24px 32px',display:'flex',flexDirection:'column',gap:'20px'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                  {[{title:'بيانات العميل',border:'#bfdbfe',bg:'#eff6ff',accent:'#1e40af',rows:[{label:'الاسم',value:customer?.company_name||customer?.name||invoice.client_name},{label:'السجل التجاري',value:customer?.commercial_number||'-'},{label:'الرقم الضريبي',value:customer?.vat_number||invoice.client_vat||'-'},{label:'العنوان',value:customer?.short_address||customer?.address||invoice.client_address||'-'}]},{title:'بيانات المنشأة',border:'#e2e8f0',bg:'#f8fafc',accent:'#0f172a',rows:[{label:'الاسم',value:company.name},{label:'السجل التجاري',value:company.commercial_number},{label:'الرقم الضريبي',value:company.vat_number},{label:'العنوان',value:companyAddress||'-'}]}].map((card,ci)=>(
                    <div key={ci} style={{borderRadius:'12px',padding:'14px',border:`1px solid ${card.border}`,background:card.bg}}>
                      <h3 style={{fontWeight:900,fontSize:'11px',color:card.accent,margin:'0 0 8px',paddingBottom:'6px',borderBottom:`1px solid ${card.border}`}}>{card.title}</h3>
                      {card.rows.map((row,ri)=>(
                        <div key={ri} style={{display:'flex',justifyContent:'space-between',marginBottom:'5px',fontSize:'11px'}}>
                          <span style={{color:'#64748b'}}>{row.label}:</span>
                          <span style={{fontWeight:700,color:'#0f172a',textAlign:'right',maxWidth:'60%'}}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div style={{borderRadius:'10px',overflow:'hidden',border:'1px solid #e2e8f0'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                    <thead><tr style={{background:'#1e40af',color:'#fff'}}>{['البيان','الكمية','السعر','قبل الضريبة','ضريبة 15%','الإجمالي'].map((h,i)=>(<th key={i} style={{padding:'10px 12px',textAlign:i===0?'right':'center',fontWeight:800}}>{h}</th>))}</tr></thead>
                    <tbody>
                      {items.map((item,i)=>(<tr key={item.id} style={{background:i%2===0?'#fff':'#f8fafc',borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 12px',color:'#0f172a',fontWeight:600}}>{item.product_name}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{item.quantity}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{parseFloat(String(item.unit_price)).toFixed(2)}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{parseFloat(String(item.total_before_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',color:'#1e40af',fontWeight:700}}>{parseFloat(String(item.vat_amount)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',fontWeight:900}}>{parseFloat(String(item.total_with_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td></tr>))}
                      {adjustments.map((adj)=>(<tr key={adj.id} style={{background:adj.type==='discount'?'#fff1f2':'#f0fdf4',borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 12px',fontWeight:700}}>{adj.title} <span style={{fontSize:'10px',opacity:0.6}}>({adj.type==='discount'?'خصم':'إضافة'})</span></td><td style={{padding:'8px 12px',textAlign:'center',opacity:0.4}}>-</td><td style={{padding:'8px 12px',textAlign:'center',opacity:0.4}}>-</td><td style={{padding:'8px 12px',textAlign:'center',fontWeight:700,color:adj.type==='discount'?'#e11d48':'#059669'}}>{adj.type==='discount'?'-':''}{parseFloat(String(adj.amount)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',opacity:0.4}}>-</td><td style={{padding:'8px 12px',textAlign:'center',fontWeight:900,color:adj.type==='discount'?'#be123c':'#047857'}}>{adj.type==='discount'?'-':''}{parseFloat(String(adj.total_with_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td></tr>))}
                    </tbody>
                  </table>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'236px 1fr 1fr',gap:'14px',alignItems:'start'}}>
                  <div style={{background:'#eff6ff',borderRadius:'12px',padding:'14px',border:'1px solid #bfdbfe',textAlign:'center'}}>
                    <p style={{fontSize:'9px',fontWeight:800,color:'#1e40af',margin:'0 0 8px',letterSpacing:'1px'}}>ZATCA QR</p>
                    {isMounted&&<QRCodeCanvas value={qrData} size={200} level="H" includeMargin={false}/>}
                  </div>
                  <div style={{borderRadius:'12px',padding:'14px',border:'1px solid #e2e8f0',background:'#f8fafc'}}>
                    <p style={{fontWeight:900,fontSize:'11px',color:'#0f172a',margin:'0 0 8px'}}>ملخص الفاتورة</p>
                    {[{label:'المبلغ قبل الضريبة',value:`${totalBeforeVat.toLocaleString('en-US',{minimumFractionDigits:2})} SAR`,c:'#0f172a'},{label:'ضريبة القيمة المضافة (15%)',value:`${totalVat.toLocaleString('en-US',{minimumFractionDigits:2})} SAR`,c:'#1e40af'}].map((r,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px dashed #e2e8f0',fontSize:'11px'}}><span style={{color:'#64748b'}}>{r.label}</span><span style={{fontWeight:700,color:r.c}}>{r.value}</span></div>))}
                    <div style={{background:'#1e40af',color:'#fff',borderRadius:'8px',padding:'10px 14px',marginTop:'10px',display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:900,fontSize:'12px'}}>الإجمالي المستحق</span><span style={{fontWeight:900,fontSize:'15px'}}>{grandTotal.toLocaleString('en-US',{minimumFractionDigits:2})} SAR</span></div>
                  </div>
                  {selectedBank&&(<div style={{borderRadius:'12px',padding:'14px',border:'1px solid #e2e8f0',background:'#f8fafc'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}><p style={{fontWeight:900,fontSize:'11px',color:'#0f172a',margin:0}}>بيانات التحويل البنكي</p>{bankAccounts.length>=1&&<div className="no-print" style={{position:'relative'}}><button onClick={(e)=>{e.stopPropagation();setShowBankSelector(s=>!s);}} style={{display:'flex',alignItems:'center',gap:'4px',padding:'4px 9px',border:'1px solid #1e40af',color:'#1e40af',background:'#fff',borderRadius:'6px',fontSize:'10px',fontWeight:700,cursor:'pointer'}}><RefreshCw size={9}/>تبديل الحساب<ChevronDown size={9}/></button>{showBankSelector&&<div onClick={(e)=>e.stopPropagation()} style={{position:'absolute',top:'calc(100% + 3px)',left:0,background:'#fff',border:'1px solid #e2e8f0',borderRadius:'10px',boxShadow:'0 6px 20px rgba(0,0,0,0.12)',zIndex:30,minWidth:'210px',overflow:'hidden'}}>{bankAccounts.map(b=><button key={b.id} onClick={()=>{setSelectedBankId(b.id);setShowBankSelector(false);}} style={{display:'block',width:'100%',textAlign:'right',padding:'9px 13px',fontSize:'11px',background:b.id===selectedBankId?'#eff6ff':'transparent',color:b.id===selectedBankId?'#1e40af':'#0f172a',fontWeight:b.id===selectedBankId?700:400,cursor:'pointer',borderBottom:'1px solid #f1f5f9'}}><div style={{fontWeight:700}}>{b.bank_name}</div><div style={{fontSize:'10px',color:'#94a3b8'}}>{b.bank_beneficiary}</div></button>)}</div>}</div>}</div>{[{label:'البنك',value:selectedBank.bank_name},{label:'المستفيد',value:selectedBank.bank_beneficiary},{label:'رقم الحساب',value:selectedBank.bank_account},{label:'الآيبان',value:selectedBank.bank_iban}].map((r,i)=>(<div key={i} style={{marginBottom:'5px',fontSize:'11px'}}><span style={{color:'#64748b'}}>{r.label}: </span><span style={{fontWeight:700,color:'#0f172a'}}>{r.value}</span></div>))}</div>)}
                </div>
              </div>
            </>)}

            {/* ═══════════ TEMPLATE 2 — Emerald Classic ═══════════ */}
            {selectedTemplate === 2 && (<>
              <div style={{background:'linear-gradient(135deg,#064e3b,#065f46)',padding:'26px 32px',textAlign:'center'}}>
                <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}>
                  <div style={{width:'76px',height:'76px',borderRadius:'50%',overflow:'hidden',border:'3px solid rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {company.logo_path?<img src={getPublicUrl(company.logo_path)||''}alt="Logo"style={{width:'100%',height:'100%',objectFit:'contain'}}crossOrigin="anonymous"/>:<Building2 size={30}color="white"/>}
                  </div>
                </div>
                <h1 style={{fontWeight:900,fontSize:'18px',color:'#fff',margin:'0 0 4px'}}>{company.name}</h1>
                <p style={{fontSize:'11px',color:'rgba(255,255,255,0.55)',margin:0}}>{company.vat_number} | {company.commercial_number}</p>
              </div>
              <div style={{margin:'-14px 24px 0',background:'#fff',borderRadius:'14px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',padding:'14px 20px',border:'1px solid #d1fae5',position:'relative',zIndex:2}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><p style={{fontSize:'10px',color:'#059669',fontWeight:800,letterSpacing:'2px',margin:0}}>فاتورة ضريبية إلكترونية</p><p style={{fontWeight:900,fontSize:'20px',color:'#0f172a',margin:'2px 0 0'}}>رقم {invoice.invoice_number}</p></div>
                  <div style={{display:'flex',gap:'18px'}}>
                    {[{label:'تاريخ الإصدار',value:formatDate(invoice.issue_date)},{label:'شهر المطالبة',value:invoice.invoice_month||getClaimMonth(invoice.issue_date)},{label:'الفترة',value:`${formatDate(items[0]?.period_from)} - ${formatDate(items[0]?.period_to)}`}].map((m,i)=>(<div key={i} style={{textAlign:'center'}}><p style={{fontSize:'9px',color:'#94a3b8',margin:0,fontWeight:700}}>{m.label}</p><p style={{fontWeight:800,fontSize:'11px',color:'#0f172a',margin:'2px 0 0'}}>{m.value}</p></div>))}
                  </div>
                </div>
              </div>
              <div style={{padding:'24px 32px',display:'flex',flexDirection:'column',gap:'20px',marginTop:'8px'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                  {[{title:'بيانات المنشأة',borderColor:'#059669',rows:[{label:'الاسم',value:company.name},{label:'السجل التجاري',value:company.commercial_number},{label:'الرقم الضريبي',value:company.vat_number},{label:'العنوان',value:companyAddress||'-'}]},{title:'بيانات العميل',borderColor:'#94a3b8',rows:[{label:'الاسم',value:customer?.company_name||customer?.name||invoice.client_name},{label:'السجل التجاري',value:customer?.commercial_number||'-'},{label:'الرقم الضريبي',value:customer?.vat_number||invoice.client_vat||'-'},{label:'العنوان',value:customer?.short_address||customer?.address||invoice.client_address||'-'}]}].map((card,ci)=>(
                    <div key={ci} style={{background:'#f8fafc',borderRadius:'12px',padding:'14px',borderRight:`4px solid ${card.borderColor}`}}>
                      <h3 style={{fontWeight:900,fontSize:'11px',color:'#0f172a',margin:'0 0 8px'}}>{card.title}</h3>
                      {card.rows.map((row,ri)=>(<div key={ri} style={{display:'flex',justifyContent:'space-between',marginBottom:'5px',fontSize:'11px'}}><span style={{color:'#64748b'}}>{row.label}:</span><span style={{fontWeight:700,color:'#0f172a',textAlign:'right',maxWidth:'60%'}}>{row.value}</span></div>))}
                    </div>
                  ))}
                </div>
                <div style={{borderRadius:'10px',overflow:'hidden',border:'1px solid #d1fae5'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                    <thead><tr style={{background:'#065f46',color:'#fff'}}>{['البيان','الكمية','السعر','قبل الضريبة','ضريبة 15%','الإجمالي'].map((h,i)=>(<th key={i} style={{padding:'10px 12px',textAlign:i===0?'right':'center',fontWeight:800}}>{h}</th>))}</tr></thead>
                    <tbody>
                      {items.map((item,i)=>(<tr key={item.id} style={{background:i%2===0?'#fff':'#f0fdf4',borderBottom:'1px solid #ecfdf5'}}><td style={{padding:'8px 12px',color:'#0f172a',fontWeight:600}}>{item.product_name}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{item.quantity}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{parseFloat(String(item.unit_price)).toFixed(2)}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{parseFloat(String(item.total_before_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',color:'#059669',fontWeight:700}}>{parseFloat(String(item.vat_amount)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',fontWeight:900}}>{parseFloat(String(item.total_with_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td></tr>))}
                    </tbody>
                  </table>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'14px',alignItems:'start'}}>
                  {selectedBank&&(<div style={{background:'#065f46',borderRadius:'12px',padding:'16px',color:'#fff'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}><p style={{fontWeight:900,fontSize:'11px',color:'#6ee7b7',margin:0}}>التحويل البنكي</p>{bankAccounts.length>=1&&<div className="no-print" style={{position:'relative'}}><button onClick={(e)=>{e.stopPropagation();setShowBankSelector(s=>!s);}} style={{display:'flex',alignItems:'center',gap:'4px',padding:'4px 9px',border:'1px solid #6ee7b7',color:'#6ee7b7',background:'rgba(255,255,255,0.08)',borderRadius:'6px',fontSize:'10px',fontWeight:700,cursor:'pointer'}}><RefreshCw size={9}/>تبديل الحساب<ChevronDown size={9}/></button>{showBankSelector&&<div onClick={(e)=>e.stopPropagation()} style={{position:'absolute',top:'calc(100% + 3px)',left:0,background:'#fff',border:'1px solid #e2e8f0',borderRadius:'10px',boxShadow:'0 6px 20px rgba(0,0,0,0.15)',zIndex:30,minWidth:'210px',overflow:'hidden'}}>{bankAccounts.map(b=><button key={b.id} onClick={()=>{setSelectedBankId(b.id);setShowBankSelector(false);}} style={{display:'block',width:'100%',textAlign:'right',padding:'9px 13px',fontSize:'11px',background:b.id===selectedBankId?'#ecfdf5':'transparent',color:b.id===selectedBankId?'#059669':'#0f172a',fontWeight:b.id===selectedBankId?700:400,cursor:'pointer',borderBottom:'1px solid #f1f5f9'}}><div style={{fontWeight:700}}>{b.bank_name}</div><div style={{fontSize:'10px',color:'#94a3b8'}}>{b.bank_beneficiary}</div></button>)}</div>}</div>}</div>{[{label:'البنك',value:selectedBank.bank_name},{label:'المستفيد',value:selectedBank.bank_beneficiary},{label:'رقم الحساب',value:selectedBank.bank_account},{label:'الآيبان',value:selectedBank.bank_iban}].map((r,i)=>(<div key={i} style={{marginBottom:'5px',fontSize:'11px'}}><span style={{color:'rgba(255,255,255,0.5)'}}>{r.label}: </span><span style={{fontWeight:700,color:'#fff'}}>{r.value}</span></div>))}</div>)}
                  <div style={{background:'#f0fdf4',borderRadius:'12px',padding:'16px',border:'1px solid #d1fae5'}}>
                    <p style={{fontWeight:900,fontSize:'11px',color:'#065f46',margin:'0 0 8px'}}>ملخص المبالغ</p>
                    {[{label:'قبل الضريبة',value:`${totalBeforeVat.toLocaleString('en-US',{minimumFractionDigits:2})} SAR`},{label:'الضريبة (15%)',value:`${totalVat.toLocaleString('en-US',{minimumFractionDigits:2})} SAR`}].map((r,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px dashed #d1fae5',fontSize:'11px'}}><span style={{color:'#6b7280'}}>{r.label}</span><span style={{fontWeight:700}}>{r.value}</span></div>))}
                    <div style={{background:'#059669',color:'#fff',borderRadius:'8px',padding:'10px 14px',marginTop:'10px',display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:900,fontSize:'12px'}}>الإجمالي</span><span style={{fontWeight:900,fontSize:'15px'}}>{grandTotal.toLocaleString('en-US',{minimumFractionDigits:2})} SAR</span></div>
                  </div>
                  <div style={{background:'#fff',borderRadius:'12px',padding:'14px',border:'2px solid #d1fae5',textAlign:'center'}}>
                    <p style={{fontSize:'9px',fontWeight:800,color:'#059669',margin:'0 0 8px'}}>ZATCA QR</p>
                    {isMounted&&<QRCodeCanvas value={qrData} size={200} level="H" includeMargin={false}/>}
                  </div>
                </div>
              </div>
            </>)}

            {/* ═══════════ TEMPLATE 3 — Black & Gold ═══════════ */}
            {selectedTemplate === 3 && (<>
              <div style={{background:'#0a0a0a',padding:'26px 32px',textAlign:'center',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'3px',background:'linear-gradient(90deg,#d97706,#fbbf24,#d97706)'}} />
                <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}>
                  <div style={{width:'70px',height:'70px',borderRadius:'12px',overflow:'hidden',border:'2px solid #d97706',background:'#1a1a1a',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {company.logo_path?<img src={getPublicUrl(company.logo_path)||''}alt="Logo"style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}crossOrigin="anonymous"/>:<Building2 size={30}color="#d97706"/>}
                  </div>
                </div>
                <h1 style={{fontWeight:900,fontSize:'19px',color:'#fff',margin:'0 0 4px',letterSpacing:'2px'}}>{company.name}</h1>
                <p style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',margin:0,letterSpacing:'1px'}}>{company.commercial_number} • {company.vat_number}</p>
                <div style={{marginTop:'14px',paddingTop:'12px',borderTop:'1px solid rgba(217,119,6,0.3)',display:'flex',justifyContent:'center',gap:'24px'}}>
                  {[{label:'INVOICE NO.',value:invoice.invoice_number,big:true},{label:'DATE',value:formatDate(invoice.issue_date),big:false},{label:'PERIOD',value:`${formatDate(items[0]?.period_from)} — ${formatDate(items[0]?.period_to)}`,big:false}].map((m,i)=>(<React.Fragment key={i}>{i>0&&<div style={{width:'1px',background:'rgba(217,119,6,0.3)'}} />}<div style={{textAlign:'center'}}><p style={{fontSize:'9px',color:'#d97706',fontWeight:700,letterSpacing:'2px',margin:0}}>{m.label}</p><p style={{fontWeight:900,fontSize:m.big?'18px':'13px',color:m.big?'#fbbf24':'#fff',margin:'2px 0 0',letterSpacing:m.big?'2px':'0'}}>{m.value}</p></div></React.Fragment>))}
                </div>
                <div style={{position:'absolute',bottom:0,left:0,right:0,height:'3px',background:'linear-gradient(90deg,#d97706,#fbbf24,#d97706)'}} />
              </div>
              <div style={{padding:'24px 32px',display:'flex',flexDirection:'column',gap:'20px',background:'#fff'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                  {[{title:'بيانات المنشأة',top:'#d97706',bg:'#fffbeb',rows:[{label:'الاسم',value:company.name},{label:'السجل التجاري',value:company.commercial_number},{label:'الرقم الضريبي',value:company.vat_number},{label:'العنوان',value:companyAddress||'-'}]},{title:'بيانات العميل',top:'#94a3b8',bg:'#f8fafc',rows:[{label:'الاسم',value:customer?.company_name||customer?.name||invoice.client_name},{label:'السجل التجاري',value:customer?.commercial_number||'-'},{label:'الرقم الضريبي',value:customer?.vat_number||invoice.client_vat||'-'},{label:'العنوان',value:customer?.short_address||customer?.address||invoice.client_address||'-'}]}].map((card,ci)=>(
                    <div key={ci} style={{borderRadius:'10px',padding:'14px',background:card.bg,borderTop:`3px solid ${card.top}`}}>
                      <h3 style={{fontWeight:900,fontSize:'11px',color:'#0f172a',margin:'0 0 8px',paddingBottom:'6px',borderBottom:'1px solid #e2e8f0'}}>{card.title}</h3>
                      {card.rows.map((row,ri)=>(<div key={ri} style={{display:'flex',justifyContent:'space-between',marginBottom:'5px',fontSize:'11px'}}><span style={{color:'#64748b'}}>{row.label}:</span><span style={{fontWeight:700,color:'#0f172a',textAlign:'right',maxWidth:'60%'}}>{row.value}</span></div>))}
                    </div>
                  ))}
                </div>
                <div style={{borderRadius:'10px',overflow:'hidden',border:'1px solid #e2e8f0'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                    <thead><tr style={{background:'#0a0a0a',color:'#fbbf24'}}>{['البيان','الكمية','السعر','قبل الضريبة','ضريبة 15%','الإجمالي'].map((h,i)=>(<th key={i} style={{padding:'10px 12px',textAlign:i===0?'right':'center',fontWeight:800}}>{h}</th>))}</tr></thead>
                    <tbody>
                      {items.map((item,i)=>(<tr key={item.id} style={{background:i%2===0?'#fff':'#fffbeb',borderBottom:'1px solid #f5f5f5'}}><td style={{padding:'8px 12px',color:'#0f172a',fontWeight:600}}>{item.product_name}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{item.quantity}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{parseFloat(String(item.unit_price)).toFixed(2)}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{parseFloat(String(item.total_before_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',color:'#d97706',fontWeight:700}}>{parseFloat(String(item.vat_amount)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',fontWeight:900}}>{parseFloat(String(item.total_with_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td></tr>))}
                    </tbody>
                  </table>
                </div>
                <div style={{background:'#0a0a0a',borderRadius:'12px',padding:'16px 20px',border:'1px solid #d97706'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'20px',alignItems:'start'}}>
                    {selectedBank&&(<div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}><p style={{fontWeight:900,fontSize:'11px',color:'#d97706',margin:0,letterSpacing:'1px'}}>التحويل البنكي</p>{bankAccounts.length>=1&&<div className="no-print" style={{position:'relative'}}><button onClick={(e)=>{e.stopPropagation();setShowBankSelector(s=>!s);}} style={{display:'flex',alignItems:'center',gap:'4px',padding:'4px 9px',border:'1px solid #d97706',color:'#d97706',background:'rgba(255,255,255,0.06)',borderRadius:'6px',fontSize:'10px',fontWeight:700,cursor:'pointer'}}><RefreshCw size={9}/>تبديل الحساب<ChevronDown size={9}/></button>{showBankSelector&&<div onClick={(e)=>e.stopPropagation()} style={{position:'absolute',top:'calc(100% + 3px)',left:0,background:'#fff',border:'1px solid #e2e8f0',borderRadius:'10px',boxShadow:'0 6px 20px rgba(0,0,0,0.2)',zIndex:30,minWidth:'210px',overflow:'hidden'}}>{bankAccounts.map(b=><button key={b.id} onClick={()=>{setSelectedBankId(b.id);setShowBankSelector(false);}} style={{display:'block',width:'100%',textAlign:'right',padding:'9px 13px',fontSize:'11px',background:b.id===selectedBankId?'#fffbeb':'transparent',color:b.id===selectedBankId?'#d97706':'#0f172a',fontWeight:b.id===selectedBankId?700:400,cursor:'pointer',borderBottom:'1px solid #f1f5f9'}}><div style={{fontWeight:700}}>{b.bank_name}</div><div style={{fontSize:'10px',color:'#94a3b8'}}>{b.bank_beneficiary}</div></button>)}</div>}</div>}</div>{[{label:'البنك',value:selectedBank.bank_name},{label:'المستفيد',value:selectedBank.bank_beneficiary},{label:'رقم الحساب',value:selectedBank.bank_account},{label:'الآيبان',value:selectedBank.bank_iban}].map((r,i)=>(<div key={i} style={{marginBottom:'5px',fontSize:'11px'}}><span style={{color:'rgba(255,255,255,0.4)'}}>{r.label}: </span><span style={{fontWeight:700,color:'#fbbf24'}}>{r.value}</span></div>))}</div>)}
                    <div>
                      <p style={{fontWeight:900,fontSize:'11px',color:'#d97706',margin:'0 0 8px',letterSpacing:'1px'}}>الملخص المالي</p>
                      {[{label:'قبل الضريبة',value:totalBeforeVat.toLocaleString('en-US',{minimumFractionDigits:2})},{label:'الضريبة (15%)',value:totalVat.toLocaleString('en-US',{minimumFractionDigits:2})}].map((r,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'5px',fontSize:'11px',borderBottom:'1px solid rgba(217,119,6,0.2)',paddingBottom:'4px'}}><span style={{color:'rgba(255,255,255,0.45)'}}>{r.label}</span><span style={{fontWeight:700,color:'#fbbf24'}}>{r.value} SAR</span></div>))}
                      <div style={{background:'#d97706',borderRadius:'8px',padding:'10px 14px',marginTop:'10px',display:'flex',justifyContent:'space-between'}}><span style={{fontWeight:900,fontSize:'12px',color:'#0a0a0a'}}>الإجمالي</span><span style={{fontWeight:900,fontSize:'16px',color:'#0a0a0a'}}>{grandTotal.toLocaleString('en-US',{minimumFractionDigits:2})} SAR</span></div>
                    </div>
                    <div style={{background:'rgba(255,255,255,0.04)',borderRadius:'10px',padding:'14px',border:'1px solid rgba(217,119,6,0.4)',textAlign:'center'}}>
                      <p style={{fontSize:'9px',fontWeight:700,color:'#d97706',margin:'0 0 8px'}}>ZATCA QR</p>
                      {isMounted&&<QRCodeCanvas value={qrData} size={200} level="H" includeMargin={false} bgColor="#1a1a1a" fgColor="#fbbf24"/>}
                    </div>
                  </div>
                </div>
              </div>
            </>)}

            {/* ═══════════ TEMPLATE 4 — Minimal Modern ═══════════ */}
            {selectedTemplate === 4 && (<>
              <div style={{padding:'28px 36px',background:'#fff',borderBottom:'1px solid #e2e8f0'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                    <div style={{width:'50px',height:'50px',borderRadius:'8px',overflow:'hidden',border:'1px solid #e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8fafc',flexShrink:0}}>
                      {company.logo_path?<img src={getPublicUrl(company.logo_path)||''}alt="Logo"style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}crossOrigin="anonymous"/>:<Building2 size={22}color="#94a3b8"/>}
                    </div>
                    <div><p style={{fontWeight:900,fontSize:'15px',color:'#0f172a',margin:0}}>{company.name}</p><p style={{fontSize:'10px',color:'#94a3b8',margin:'2px 0 0'}}>{companyAddress||'—'}</p></div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <p style={{fontWeight:900,fontSize:'40px',color:'#e2e8f0',margin:0,lineHeight:1,letterSpacing:'-2px'}}>{invoice.invoice_number}</p>
                    <p style={{fontSize:'11px',color:'#94a3b8',margin:'4px 0 0',fontWeight:700}}>فاتورة ضريبية — {formatDate(invoice.issue_date)}</p>
                  </div>
                </div>
              </div>
              <div style={{height:'2px',background:'#e2e8f0'}} />
              <div style={{padding:'16px 36px',background:'#f8fafc',display:'flex',gap:'24px',flexWrap:'wrap'}}>
                {[{label:'العميل',value:customer?.company_name||customer?.name||invoice.client_name},{label:'الرقم الضريبي للعميل',value:customer?.vat_number||invoice.client_vat||'-'},{label:'شهر المطالبة',value:invoice.invoice_month||getClaimMonth(invoice.issue_date)},{label:'الفترة',value:`${formatDate(items[0]?.period_from)} — ${formatDate(items[0]?.period_to)}`}].map((m,i)=>(<div key={i} style={{minWidth:'120px'}}><p style={{fontSize:'9px',color:'#94a3b8',fontWeight:700,letterSpacing:'1px',margin:0,textTransform:'uppercase'}}>{m.label}</p><p style={{fontWeight:800,fontSize:'12px',color:'#0f172a',margin:'3px 0 0'}}>{m.value}</p></div>))}
              </div>
              <div style={{height:'2px',background:'#e2e8f0'}} />
              <div style={{padding:'24px 36px',display:'flex',flexDirection:'column',gap:'22px'}}>
                <div style={{borderRadius:'8px',overflow:'hidden',border:'1px solid #e2e8f0'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                    <thead><tr style={{background:'#1e293b',color:'#fff'}}>{['البيان','الكمية','السعر','قبل الضريبة','ضريبة 15%','الإجمالي'].map((h,i)=>(<th key={i} style={{padding:'10px 12px',textAlign:i===0?'right':'center',fontWeight:700}}>{h}</th>))}</tr></thead>
                    <tbody>
                      {items.map((item,i)=>(<tr key={item.id} style={{background:i%2===0?'#fff':'#f8fafc',borderBottom:'1px solid #f1f5f9'}}><td style={{padding:'8px 12px',color:'#0f172a',fontWeight:600}}>{item.product_name}</td><td style={{padding:'8px 12px',textAlign:'center',color:'#64748b'}}>{item.quantity}</td><td style={{padding:'8px 12px',textAlign:'center',color:'#64748b'}}>{parseFloat(String(item.unit_price)).toFixed(2)}</td><td style={{padding:'8px 12px',textAlign:'center',color:'#64748b'}}>{parseFloat(String(item.total_before_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',color:'#64748b'}}>{parseFloat(String(item.vat_amount)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',fontWeight:900,color:'#0f172a'}}>{parseFloat(String(item.total_with_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td></tr>))}
                    </tbody>
                  </table>
                </div>
                <div style={{height:'1px',background:'#e2e8f0'}} />
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:'20px',alignItems:'start'}}>
                  {selectedBank&&(<div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}><p style={{fontSize:'9px',color:'#94a3b8',fontWeight:700,letterSpacing:'1px',margin:0,textTransform:'uppercase'}}>بيانات البنك</p>{bankAccounts.length>=1&&<div className="no-print" style={{position:'relative'}}><button onClick={(e)=>{e.stopPropagation();setShowBankSelector(s=>!s);}} style={{display:'flex',alignItems:'center',gap:'4px',padding:'4px 9px',border:'1px solid #94a3b8',color:'#64748b',background:'#f8fafc',borderRadius:'6px',fontSize:'10px',fontWeight:700,cursor:'pointer'}}><RefreshCw size={9}/>تبديل الحساب<ChevronDown size={9}/></button>{showBankSelector&&<div onClick={(e)=>e.stopPropagation()} style={{position:'absolute',top:'calc(100% + 3px)',left:0,background:'#fff',border:'1px solid #e2e8f0',borderRadius:'10px',boxShadow:'0 6px 20px rgba(0,0,0,0.1)',zIndex:30,minWidth:'210px',overflow:'hidden'}}>{bankAccounts.map(b=><button key={b.id} onClick={()=>{setSelectedBankId(b.id);setShowBankSelector(false);}} style={{display:'block',width:'100%',textAlign:'right',padding:'9px 13px',fontSize:'11px',background:b.id===selectedBankId?'#f8fafc':'transparent',color:b.id===selectedBankId?'#1e293b':'#0f172a',fontWeight:b.id===selectedBankId?700:400,cursor:'pointer',borderBottom:'1px solid #f1f5f9'}}><div style={{fontWeight:700}}>{b.bank_name}</div><div style={{fontSize:'10px',color:'#94a3b8'}}>{b.bank_beneficiary}</div></button>)}</div>}</div>}</div>{[{label:'البنك',value:selectedBank.bank_name},{label:'المستفيد',value:selectedBank.bank_beneficiary},{label:'رقم الحساب',value:selectedBank.bank_account},{label:'الآيبان',value:selectedBank.bank_iban}].map((r,i)=>(<div key={i} style={{marginBottom:'5px',fontSize:'11px'}}><span style={{color:'#94a3b8'}}>{r.label}: </span><span style={{fontWeight:700,color:'#0f172a'}}>{r.value}</span></div>))}</div>)}
                  <div>
                    <p style={{fontSize:'9px',color:'#94a3b8',fontWeight:700,letterSpacing:'1px',margin:'0 0 10px',textTransform:'uppercase'}}>الملخص</p>
                    {[{label:'قبل الضريبة',value:`${totalBeforeVat.toLocaleString('en-US',{minimumFractionDigits:2})} SAR`},{label:'ضريبة القيمة المضافة',value:`${totalVat.toLocaleString('en-US',{minimumFractionDigits:2})} SAR`}].map((r,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid #f1f5f9',fontSize:'11px'}}><span style={{color:'#94a3b8'}}>{r.label}</span><span style={{fontWeight:700}}>{r.value}</span></div>))}
                    <div style={{marginTop:'10px',padding:'12px 0',borderTop:'2px solid #0f172a',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontWeight:900,fontSize:'13px',color:'#0f172a'}}>الإجمالي المستحق</span><span style={{fontWeight:900,fontSize:'20px',color:'#0f172a'}}>{grandTotal.toLocaleString('en-US',{minimumFractionDigits:2})} <span style={{fontSize:'12px',fontWeight:700,color:'#64748b'}}>SAR</span></span></div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <p style={{fontSize:'9px',color:'#94a3b8',fontWeight:700,letterSpacing:'1px',margin:'0 0 8px',textTransform:'uppercase'}}>باركود ZATCA</p>
                    <div style={{border:'1px solid #e2e8f0',borderRadius:'8px',padding:'10px',display:'inline-block'}}>
                      {isMounted&&<QRCodeCanvas value={qrData} size={200} level="H" includeMargin={false}/>}
                    </div>
                  </div>
                </div>
              </div>
            </>)}

            {/* ═══════════ TEMPLATE 5 — Royal Violet (2 logos) ═══════════ */}
            {selectedTemplate === 5 && (<>
              <div style={{display:'flex',minHeight:'118px'}}>
                <div style={{background:'linear-gradient(135deg,#4c1d95,#6d28d9)',padding:'20px 22px',minWidth:'190px',display:'flex',flexDirection:'column',justifyContent:'space-between',flexShrink:0}}>
                  <div><p style={{fontSize:'9px',color:'rgba(255,255,255,0.5)',fontWeight:700,letterSpacing:'3px',margin:'0 0 5px'}}>INVOICE</p><p style={{fontWeight:900,fontSize:'14px',color:'#c4b5fd',margin:'0 0 3px'}}>{invoice.invoice_number}</p><p style={{fontSize:'10px',color:'rgba(255,255,255,0.5)',margin:0}}>{formatDate(invoice.issue_date)}</p></div>
                  <div style={{width:'52px',height:'52px',borderRadius:'10px',overflow:'hidden',border:'2px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><img src="/logo.png" alt="System" style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/></div>
                </div>
                <div style={{flex:1,background:'#fff',padding:'20px 22px',borderBottom:'1px solid #f3e8ff',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div><h1 style={{fontWeight:900,fontSize:'18px',color:'#0f172a',margin:'0 0 2px'}}>فاتورة ضريبية</h1><p style={{fontSize:'11px',color:'#7c3aed',fontWeight:700,margin:0}}>Electronic VAT Invoice</p></div>
                    <div style={{width:'58px',height:'58px',borderRadius:'10px',overflow:'hidden',border:'1px solid #e9d5ff',background:'#f5f3ff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {company.logo_path?<img src={getPublicUrl(company.logo_path)||''}alt="Logo"style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}crossOrigin="anonymous"/>:<Building2 size={24}color="#7c3aed"/>}
                    </div>
                  </div>
                  <div><p style={{fontWeight:800,fontSize:'13px',color:'#0f172a',margin:'0 0 2px'}}>{company.name}</p><p style={{fontSize:'10px',color:'#94a3b8',margin:0}}>VAT: {company.vat_number} | CR: {company.commercial_number}</p></div>
                </div>
              </div>
              <div style={{background:'linear-gradient(90deg,#4c1d95,#7c3aed)',height:'3px'}} />
              <div style={{padding:'24px 28px',display:'flex',flexDirection:'column',gap:'18px',background:'#faf5ff'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                  {[{title:'بيانات المنشأة',accent:'#7c3aed',rows:[{label:'الاسم',value:company.name},{label:'السجل التجاري',value:company.commercial_number},{label:'الرقم الضريبي',value:company.vat_number},{label:'العنوان',value:companyAddress||'-'}]},{title:'بيانات العميل',accent:'#94a3b8',rows:[{label:'الاسم',value:customer?.company_name||customer?.name||invoice.client_name},{label:'السجل التجاري',value:customer?.commercial_number||'-'},{label:'الرقم الضريبي',value:customer?.vat_number||invoice.client_vat||'-'},{label:'العنوان',value:customer?.short_address||customer?.address||invoice.client_address||'-'}]}].map((card,ci)=>(
                    <div key={ci} style={{background:'#fff',borderRadius:'12px',padding:'14px',border:'1px solid #e9d5ff',borderTop:`3px solid ${card.accent}`}}>
                      <h3 style={{fontWeight:900,fontSize:'11px',color:card.accent,margin:'0 0 8px'}}>{card.title}</h3>
                      {card.rows.map((row,ri)=>(<div key={ri} style={{display:'flex',justifyContent:'space-between',marginBottom:'5px',fontSize:'11px'}}><span style={{color:'#94a3b8'}}>{row.label}:</span><span style={{fontWeight:700,color:'#0f172a',textAlign:'right',maxWidth:'60%'}}>{row.value}</span></div>))}
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:'0',background:'#fff',borderRadius:'10px',border:'1px solid #e9d5ff',overflow:'hidden'}}>
                  {[{label:'شهر المطالبة',value:invoice.invoice_month||getClaimMonth(invoice.issue_date)},{label:'تاريخ الإصدار',value:formatDate(invoice.issue_date)},{label:'تاريخ الاستحقاق',value:formatDate(invoice.due_date)},{label:'الفترة',value:`${formatDate(items[0]?.period_from)} — ${formatDate(items[0]?.period_to)}`}].map((m,i)=>(<div key={i} style={{flex:1,textAlign:'center',padding:'8px 6px',borderRight:i<3?'1px solid #f3e8ff':'none'}}><p style={{fontSize:'9px',color:'#a78bfa',fontWeight:700,margin:0}}>{m.label}</p><p style={{fontWeight:800,fontSize:'11px',color:'#0f172a',margin:'2px 0 0'}}>{m.value}</p></div>))}
                </div>
                <div style={{background:'#fff',borderRadius:'10px',overflow:'hidden',border:'1px solid #e9d5ff'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                    <thead><tr style={{background:'linear-gradient(90deg,#4c1d95,#7c3aed)',color:'#fff'}}>{['البيان','الكمية','السعر','قبل الضريبة','ضريبة 15%','الإجمالي'].map((h,i)=>(<th key={i} style={{padding:'10px 12px',textAlign:i===0?'right':'center',fontWeight:800}}>{h}</th>))}</tr></thead>
                    <tbody>
                      {items.map((item,i)=>(<tr key={item.id} style={{background:i%2===0?'#fff':'#faf5ff',borderBottom:'1px solid #f3e8ff'}}><td style={{padding:'8px 12px',color:'#0f172a',fontWeight:600}}>{item.product_name}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{item.quantity}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{parseFloat(String(item.unit_price)).toFixed(2)}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{parseFloat(String(item.total_before_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',color:'#7c3aed',fontWeight:700}}>{parseFloat(String(item.vat_amount)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',fontWeight:900}}>{parseFloat(String(item.total_with_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td></tr>))}
                    </tbody>
                  </table>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:'14px',alignItems:'start'}}>
                  {selectedBank&&(<div style={{background:'#fff',borderRadius:'12px',padding:'14px',border:'1px solid #e9d5ff'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}><p style={{fontWeight:900,fontSize:'11px',color:'#7c3aed',margin:0}}>التحويل البنكي</p>{bankAccounts.length>=1&&<div className="no-print" style={{position:'relative'}}><button onClick={(e)=>{e.stopPropagation();setShowBankSelector(s=>!s);}} style={{display:'flex',alignItems:'center',gap:'4px',padding:'4px 9px',border:'1px solid #7c3aed',color:'#7c3aed',background:'#faf5ff',borderRadius:'6px',fontSize:'10px',fontWeight:700,cursor:'pointer'}}><RefreshCw size={9}/>تبديل الحساب<ChevronDown size={9}/></button>{showBankSelector&&<div onClick={(e)=>e.stopPropagation()} style={{position:'absolute',top:'calc(100% + 3px)',left:0,background:'#fff',border:'1px solid #e9d5ff',borderRadius:'10px',boxShadow:'0 6px 20px rgba(124,58,237,0.15)',zIndex:30,minWidth:'210px',overflow:'hidden'}}>{bankAccounts.map(b=><button key={b.id} onClick={()=>{setSelectedBankId(b.id);setShowBankSelector(false);}} style={{display:'block',width:'100%',textAlign:'right',padding:'9px 13px',fontSize:'11px',background:b.id===selectedBankId?'#faf5ff':'transparent',color:b.id===selectedBankId?'#7c3aed':'#0f172a',fontWeight:b.id===selectedBankId?700:400,cursor:'pointer',borderBottom:'1px solid #f3e8ff'}}><div style={{fontWeight:700}}>{b.bank_name}</div><div style={{fontSize:'10px',color:'#94a3b8'}}>{b.bank_beneficiary}</div></button>)}</div>}</div>}</div>{[{label:'البنك',value:selectedBank.bank_name},{label:'المستفيد',value:selectedBank.bank_beneficiary},{label:'رقم الحساب',value:selectedBank.bank_account},{label:'الآيبان',value:selectedBank.bank_iban}].map((r,i)=>(<div key={i} style={{marginBottom:'5px',fontSize:'11px'}}><span style={{color:'#94a3b8'}}>{r.label}: </span><span style={{fontWeight:700,color:'#0f172a'}}>{r.value}</span></div>))}</div>)}
                  <div style={{background:'#f5f3ff',borderRadius:'12px',padding:'14px',border:'2px solid #c4b5fd',textAlign:'center'}}>
                    <p style={{fontSize:'9px',fontWeight:800,color:'#7c3aed',margin:'0 0 8px'}}>ZATCA QR</p>
                    {isMounted&&<QRCodeCanvas value={qrData} size={200} level="H" includeMargin={false}/>}
                  </div>
                  <div style={{background:'linear-gradient(135deg,#4c1d95,#6d28d9)',borderRadius:'12px',padding:'16px',color:'#fff'}}>
                    <p style={{fontWeight:900,fontSize:'11px',color:'#c4b5fd',margin:'0 0 8px'}}>الملخص المالي</p>
                    {[{label:'قبل الضريبة',value:totalBeforeVat.toLocaleString('en-US',{minimumFractionDigits:2})},{label:'الضريبة (15%)',value:totalVat.toLocaleString('en-US',{minimumFractionDigits:2})}].map((r,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid rgba(196,181,253,0.2)',fontSize:'11px'}}><span style={{color:'rgba(255,255,255,0.55)'}}>{r.label}</span><span style={{fontWeight:700,color:'#c4b5fd'}}>{r.value} SAR</span></div>))}
                    <div style={{background:'rgba(255,255,255,0.15)',borderRadius:'8px',padding:'10px 14px',marginTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'center',border:'1px solid rgba(255,255,255,0.2)'}}><span style={{fontWeight:900,fontSize:'12px'}}>الإجمالي</span><span style={{fontWeight:900,fontSize:'16px'}}>{grandTotal.toLocaleString('en-US',{minimumFractionDigits:2})} SAR</span></div>
                  </div>
                </div>
              </div>
            </>)}

            {/* ═══════════ TEMPLATE 6 — Elegant Rose (2 logos) ═══════════ */}
            {selectedTemplate === 6 && (<>
              {/* Rose header — two logos */}
              <div style={{background:'#fff',borderTop:'5px solid #e11d48',padding:'22px 28px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px'}}>
                  {/* System logo */}
                  <div style={{display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
                    <div style={{width:'54px',height:'54px',borderRadius:'12px',overflow:'hidden',border:'2px solid #fecdd3',background:'#fff1f2',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <img src="/logo.png" alt="System" style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/>
                    </div>
                    <div style={{width:'1px',height:'40px',background:'#fecdd3'}} />
                    {/* Company logo */}
                    <div style={{width:'54px',height:'54px',borderRadius:'12px',overflow:'hidden',border:'2px solid #fecdd3',background:'#fff1f2',display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {company.logo_path?<img src={getPublicUrl(company.logo_path)||''}alt="Logo"style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}crossOrigin="anonymous"/>:<Building2 size={24}color="#e11d48"/>}
                    </div>
                    <div><p style={{fontWeight:900,fontSize:'15px',color:'#0f172a',margin:0}}>{company.name}</p><p style={{fontSize:'10px',color:'#fb7185',fontWeight:700,margin:'2px 0 0'}}>VAT: {company.vat_number}</p></div>
                  </div>
                  {/* Invoice title & number */}
                  <div style={{textAlign:'center'}}>
                    <p style={{fontWeight:900,fontSize:'22px',color:'#e11d48',margin:0,letterSpacing:'1px'}}>فاتورة ضريبية</p>
                    <p style={{fontSize:'11px',color:'#94a3b8',fontWeight:700,margin:'3px 0 0',letterSpacing:'2px'}}>VAT INVOICE</p>
                    <div style={{background:'#fff1f2',borderRadius:'10px',padding:'6px 16px',display:'inline-block',marginTop:'6px',border:'1px solid #fecdd3'}}>
                      <p style={{fontSize:'9px',color:'#fb7185',margin:0,fontWeight:700}}>رقم الفاتورة</p>
                      <p style={{fontWeight:900,fontSize:'16px',color:'#e11d48',margin:'1px 0 0',letterSpacing:'2px'}}>{invoice.invoice_number}</p>
                    </div>
                  </div>
                  {/* Dates */}
                  <div style={{textAlign:'center',background:'#fff1f2',borderRadius:'12px',padding:'12px 16px',border:'1px solid #fecdd3',flexShrink:0}}>
                    {[{label:'تاريخ الإصدار',value:formatDate(invoice.issue_date)},{label:'شهر المطالبة',value:invoice.invoice_month||getClaimMonth(invoice.issue_date)},{label:'الفترة',value:`${formatDate(items[0]?.period_from)}→${formatDate(items[0]?.period_to)}`}].map((m,i)=>(
                      <div key={i} style={{marginBottom:i<2?'8px':0}}>
                        <p style={{fontSize:'9px',color:'#fb7185',fontWeight:700,margin:0,letterSpacing:'1px'}}>{m.label}</p>
                        <p style={{fontWeight:800,fontSize:'11px',color:'#0f172a',margin:'1px 0 0'}}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Rose divider */}
              <div style={{height:'3px',background:'linear-gradient(90deg,#e11d48,#fb7185,#fda4af,#fb7185,#e11d48)'}} />
              {/* Content */}
              <div style={{padding:'24px 28px',background:'#fff',display:'flex',flexDirection:'column',gap:'20px'}}>
                {/* Info cards */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
                  {[{title:'بيانات المنشأة',accent:'#e11d48',bg:'#fff1f2',border:'#fecdd3',rows:[{label:'الاسم',value:company.name},{label:'السجل التجاري',value:company.commercial_number},{label:'الرقم الضريبي',value:company.vat_number},{label:'العنوان',value:companyAddress||'-'}]},{title:'بيانات العميل',accent:'#fb7185',bg:'#fff7f7',border:'#fce7f3',rows:[{label:'الاسم',value:customer?.company_name||customer?.name||invoice.client_name},{label:'السجل التجاري',value:customer?.commercial_number||'-'},{label:'الرقم الضريبي',value:customer?.vat_number||invoice.client_vat||'-'},{label:'العنوان',value:customer?.short_address||customer?.address||invoice.client_address||'-'}]}].map((card,ci)=>(
                    <div key={ci} style={{borderRadius:'12px',padding:'14px',background:card.bg,border:`1px solid ${card.border}`}}>
                      <h3 style={{fontWeight:900,fontSize:'11px',color:card.accent,margin:'0 0 10px',paddingBottom:'6px',borderBottom:`1px solid ${card.border}`}}>{card.title}</h3>
                      {card.rows.map((row,ri)=>(<div key={ri} style={{display:'flex',justifyContent:'space-between',marginBottom:'5px',fontSize:'11px'}}><span style={{color:'#64748b'}}>{row.label}:</span><span style={{fontWeight:700,color:'#0f172a',textAlign:'right',maxWidth:'60%'}}>{row.value}</span></div>))}
                    </div>
                  ))}
                </div>
                {/* Items table */}
                <div style={{borderRadius:'10px',overflow:'hidden',border:'1px solid #fecdd3'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',fontSize:'12px'}}>
                    <thead><tr style={{background:'linear-gradient(90deg,#e11d48,#f43f5e)',color:'#fff'}}>{['البيان','الكمية','السعر','قبل الضريبة','ضريبة 15%','الإجمالي'].map((h,i)=>(<th key={i} style={{padding:'10px 12px',textAlign:i===0?'right':'center',fontWeight:800}}>{h}</th>))}</tr></thead>
                    <tbody>
                      {items.map((item,i)=>(<tr key={item.id} style={{background:i%2===0?'#fff':'#fff7f7',borderBottom:'1px solid #fce7f3'}}><td style={{padding:'8px 12px',color:'#0f172a',fontWeight:600}}>{item.product_name}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{item.quantity}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{parseFloat(String(item.unit_price)).toFixed(2)}</td><td style={{padding:'8px 12px',textAlign:'center'}}>{parseFloat(String(item.total_before_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',color:'#e11d48',fontWeight:700}}>{parseFloat(String(item.vat_amount)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',fontWeight:900,color:'#0f172a'}}>{parseFloat(String(item.total_with_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td></tr>))}
                      {adjustments.map((adj)=>(<tr key={adj.id} style={{background:adj.type==='discount'?'#fff1f2':'#f0fdf4',borderBottom:'1px solid #fce7f3'}}><td style={{padding:'8px 12px',fontWeight:700}}>{adj.title} <span style={{fontSize:'10px',opacity:0.6}}>({adj.type==='discount'?'خصم':'إضافة'})</span></td><td style={{padding:'8px 12px',textAlign:'center',opacity:0.4}}>-</td><td style={{padding:'8px 12px',textAlign:'center',opacity:0.4}}>-</td><td style={{padding:'8px 12px',textAlign:'center',fontWeight:700,color:adj.type==='discount'?'#e11d48':'#059669'}}>{adj.type==='discount'?'-':''}{parseFloat(String(adj.amount)).toLocaleString('en-US',{minimumFractionDigits:2})}</td><td style={{padding:'8px 12px',textAlign:'center',opacity:0.4}}>-</td><td style={{padding:'8px 12px',textAlign:'center',fontWeight:900,color:adj.type==='discount'?'#be123c':'#047857'}}>{adj.type==='discount'?'-':''}{parseFloat(String(adj.total_with_vat)).toLocaleString('en-US',{minimumFractionDigits:2})}</td></tr>))}
                    </tbody>
                  </table>
                </div>
                {/* QR + Summary */}
                <div style={{display:'grid',gridTemplateColumns:'236px 1fr',gap:'18px',alignItems:'start'}}>
                  <div style={{background:'#fff1f2',borderRadius:'14px',padding:'16px',border:'2px solid #fecdd3',textAlign:'center'}}>
                    <p style={{fontSize:'9px',fontWeight:800,color:'#e11d48',margin:'0 0 10px',letterSpacing:'1px'}}>ZATCA QR CODE</p>
                    {isMounted&&<QRCodeCanvas value={qrData} size={200} level="H" includeMargin={false}/>}
                  </div>
                  <div style={{background:'#fff7f7',borderRadius:'14px',padding:'18px',border:'1px solid #fecdd3',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                    <div>
                      <p style={{fontWeight:900,fontSize:'13px',color:'#e11d48',margin:'0 0 12px',borderBottom:'1px solid #fecdd3',paddingBottom:'8px'}}>ملخص الفاتورة</p>
                      {[{label:'المبلغ قبل الضريبة',value:`${totalBeforeVat.toLocaleString('en-US',{minimumFractionDigits:2})} SAR`,c:'#0f172a'},{label:'ضريبة القيمة المضافة (15%)',value:`${totalVat.toLocaleString('en-US',{minimumFractionDigits:2})} SAR`,c:'#e11d48'},...(discountTotal>0||additionTotal>0?[{label:'خصم / إضافة',value:`${(additionTotal-discountTotal).toLocaleString('en-US',{minimumFractionDigits:2})} SAR`,c:additionTotal-discountTotal<0?'#e11d48':'#059669'}]:[])].map((r,i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px dashed #fecdd3',fontSize:'12px'}}><span style={{color:'#64748b'}}>{r.label}</span><span style={{fontWeight:700,color:r.c}}>{r.value}</span></div>))}
                    </div>
                    <div style={{background:'linear-gradient(135deg,#e11d48,#f43f5e)',color:'#fff',borderRadius:'10px',padding:'12px 16px',marginTop:'14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontWeight:900,fontSize:'13px'}}>الإجمالي المستحق</span>
                      <span style={{fontWeight:900,fontSize:'18px'}}>{grandTotal.toLocaleString('en-US',{minimumFractionDigits:2})} SAR</span>
                    </div>
                  </div>
                </div>
                {/* Bank info */}
                {selectedBank&&(
                  <div style={{background:'#fff1f2',borderRadius:'14px',padding:'16px',border:'1px solid #fecdd3'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}><University size={16} color="#e11d48"/><h3 style={{fontWeight:900,fontSize:'13px',color:'#0f172a',margin:0}}>معلومات السداد البنكي</h3></div>
                      {bankAccounts.length>=1&&<div className="no-print" style={{position:'relative'}}><button onClick={(e)=>{e.stopPropagation();setShowBankSelector(s=>!s);}} style={{display:'flex',alignItems:'center',gap:'5px',padding:'6px 12px',border:'1px solid #e11d48',color:'#e11d48',background:'#fff',borderRadius:'8px',fontSize:'11px',fontWeight:700,cursor:'pointer'}}><RefreshCw size={11}/>تبديل الحساب<ChevronDown size={11}/></button>{showBankSelector&&<div onClick={(e)=>e.stopPropagation()} style={{position:'absolute',top:'calc(100% + 4px)',left:0,background:'#fff',border:'1px solid #fecdd3',borderRadius:'12px',boxShadow:'0 6px 24px rgba(225,29,72,0.15)',zIndex:30,minWidth:'220px',overflow:'hidden'}}>{bankAccounts.map(b=><button key={b.id} onClick={()=>{setSelectedBankId(b.id);setShowBankSelector(false);}} style={{display:'block',width:'100%',textAlign:'right',padding:'10px 14px',fontSize:'11px',background:b.id===selectedBankId?'#fff1f2':'transparent',color:b.id===selectedBankId?'#e11d48':'#0f172a',fontWeight:b.id===selectedBankId?700:400,cursor:'pointer',borderBottom:'1px solid #fce7f3'}}><div style={{fontWeight:700}}>{b.bank_name}</div><div style={{fontSize:'10px',color:'#94a3b8'}}>{b.bank_beneficiary}</div></button>)}</div>}</div>}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                      {[{label:'البنك',value:selectedBank.bank_name},{label:'المستفيد',value:selectedBank.bank_beneficiary},{label:'رقم الحساب',value:selectedBank.bank_account},{label:'الآيبان',value:selectedBank.bank_iban}].map((r,i)=>(
                        <div key={i} style={{background:'#fff',borderRadius:'10px',padding:'10px 14px',border:'1px solid #fce7f3',textAlign:'center'}}>
                          <p style={{fontSize:'10px',color:'#fb7185',fontWeight:700,margin:'0 0 4px'}}>{r.label}</p>
                          <p style={{fontWeight:800,fontSize:i>=2?'11px':'13px',color:'#0f172a',margin:0,wordBreak:'break-all'}}>{r.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>)}

          </div>

          </div>

          {/* Template Selector Modal */}
          {showTemplateSelector && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print" onClick={() => setShowTemplateSelector(false)}>
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden" onClick={(e) => e.stopPropagation()} dir="rtl">
                <div className="px-6 py-4 flex items-center justify-between" style={{background:'linear-gradient(135deg,#4c1d95,#6d28d9)'}}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Layers size={20} className="text-white" /></div>
                    <div><h3 className="text-white font-bold text-base">قوالب الفاتورة</h3><p className="text-white/70 text-xs">اختر تصميماً — يُطبق على الطباعة والتحميل والإرسال</p></div>
                  </div>
                  <button onClick={() => setShowTemplateSelector(false)} className="text-white/70 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="p-5 grid grid-cols-3 gap-4 overflow-y-auto" style={{maxHeight:'65vh'}}>
                  {[
                    {id:0,name:'القالب الافتراضي',desc:'خلفية داكنة مع شعاري المنشأة والنظام',color:'#0f172a',accent:'#3b82f6',logos:'شعاران'},
                    {id:1,name:'الأزرق الاحترافي',desc:'أبيض بشريط أزرق وتوزيع ثلاثي سفلي',color:'#1e40af',accent:'#3b82f6',logos:'شعار المنشأة'},
                    {id:2,name:'الأخضر الفاخر',desc:'ترويسة زمردية وبطاقة عائمة وتذييل داكن',color:'#065f46',accent:'#059669',logos:'شعار المنشأة'},
                    {id:3,name:'الأسود والذهب',desc:'تصميم فاخر أسود مع عناصر ذهبية',color:'#0a0a0a',accent:'#d97706',logos:'شعار المنشأة'},
                    {id:4,name:'النقاء العصري',desc:'أبيض بسيط مع رقم فاتورة ضخم',color:'#1e293b',accent:'#94a3b8',logos:'شعار المنشأة'},
                    {id:5,name:'البنفسجي الملكي',desc:'ترويسة منقسمة بنفسجية مع شعارين',color:'#4c1d95',accent:'#8b5cf6',logos:'شعاران'},
                    {id:6,name:'الوردي الأنيق',desc:'تصميم فاتح راقٍ بألوان الوردي مع شعارين',color:'#e11d48',accent:'#fb7185',logos:'شعاران'},
                  ].map((tpl) => (
                    <button key={tpl.id} onClick={() => { setSelectedTemplate(tpl.id); setShowTemplateSelector(false); }} className="relative rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.03] text-right" style={{borderColor: selectedTemplate === tpl.id ? tpl.accent : '#e2e8f0', outline:'none'}}>
                      {selectedTemplate === tpl.id && (<div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center" style={{background:tpl.accent}}><Check size={12} className="text-white" /></div>)}
                      <div className="h-20 flex items-center justify-center relative overflow-hidden" style={{background:`linear-gradient(135deg,${tpl.color},${tpl.accent})`}}>
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                          <div className="absolute top-4 right-4 h-1 w-14 bg-white/40 rounded" />
                          <div className="absolute top-7 right-4 h-1 w-9 bg-white/40 rounded" />
                          <div className="absolute top-10 right-4 h-1 w-11 bg-white/40 rounded" />
                        </div>
                        <span className="text-white font-black text-2xl opacity-30">{tpl.id + 1}</span>
                      </div>
                      <div className="p-3" style={{background: tpl.id === 0 ? '#1e293b' : '#f8fafc'}}>
                        <p className="font-black text-sm" style={{color: tpl.id === 0 ? '#fff' : '#0f172a'}}>{tpl.name}</p>
                        <p className="text-[10px] mt-1 leading-relaxed" style={{color: tpl.id === 0 ? 'rgba(255,255,255,0.45)' : '#94a3b8'}}>{tpl.desc}</p>
                        <p className="text-[9px] mt-1.5 font-bold" style={{color:tpl.accent}}>{tpl.logos}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 px-6 py-4 flex justify-end">
                  <button onClick={() => setShowTemplateSelector(false)} className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">إغلاق</button>
                </div>
              </div>
            </div>
          )}

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
