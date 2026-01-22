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
  QrCode
} from "lucide-react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import { useTranslations } from "@/lib/locale-context";

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

interface InvoiceViewClientProps {
  invoice: Invoice;
  items: InvoiceItem[];
  adjustments: Adjustment[];
  company: Company;
  bankAccounts: BankAccount[];
  customer: Customer | null;
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
    const safeDate = invoiceDate && invoiceDate !== 'Invalid Date' ? invoiceDate : new Date().toISOString().split('T')[0];
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
  customer
}: InvoiceViewClientProps) {
  const t = useTranslations("invoices");
  const tc = useTranslations("common");
  const printRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(bankAccounts[0]?.id);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

    const handleDownloadPDF = async () => {
      setPdfLoading(true);
      try {
        const html2canvas = (await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');
        
        const element = printRef.current;
        if (!element) return;
        
        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Use full height if it fits, otherwise scale
        let finalImgHeight = imgHeight;
        let finalImgWidth = imgWidth;
        
        if (imgHeight > pdfHeight) {
          const ratio = pdfHeight / imgHeight;
          finalImgHeight = pdfHeight;
          finalImgWidth = imgWidth * ratio;
        }
        
        const xOffset = (pdfWidth - finalImgWidth) / 2;
        
        pdf.addImage(imgData, 'PNG', xOffset, 0, finalImgWidth, finalImgHeight);
        pdf.save(`${t("vatInvoice")}-${invoice.invoice_number}.pdf`);


    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  const getPublicUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/project-uploads/${path}`;
  };

    return (
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
                boxSizing: 'border-box'
              }}
            >
              <style>{`
                @media print {
                  .no-print { display: none !important; }
                  body { 
                    background: white !important; 
                    margin: 0 !important; 
                    padding: 0 !important;
                  }
                  .invoice-container { 
                    box-shadow: none !important; 
                    margin: 0 !important; 
                    width: 210mm !important; 
                    min-height: 297mm !important;
                    max-width: 100% !important; 
                    border: none !important;
                    padding: 0 !important;
                    overflow: visible !important;
                    display: flex !important;
                    flex-direction: column !important;
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


          {/* Header */}
          <div 
            className="text-white p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
          >
            <div className="flex flex-row justify-between items-center gap-4 relative z-10">
              {/* Company Logo */}
              <div 
                className="w-20 h-20 rounded-xl flex items-center justify-center p-3 border border-[#ffffff33]"
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
                <h1 className="text-2xl font-black mb-0 tracking-wider">{t("vatInvoice")}</h1>
                <p className="text-white/60 text-[12px] uppercase font-light">{t("vatInvoiceEn")}</p>
                <div className="mt-2 inline-flex items-center gap-2 px-4 py-1 rounded-lg border border-[#ffffff1a]" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="font-bold text-[10px]">{t("electronicInvoicingSystem")}</span>
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
                <span className="text-[#ffffff66] text-[10px] block">{t("claimMonth")}</span>
                <p className="font-bold text-[13px]">{invoice.invoice_month || getClaimMonth(invoice.issue_date)}</p>
              </div>
              <div className="text-center">
                <span className="text-[#ffffff66] text-[10px] block">{t("invoiceNumber")}:</span>
                <p className="font-bold text-[13px] tracking-widest">{invoice.invoice_number}</p>
              </div>
              <div className="text-center">
                <span className="text-[#ffffff66] text-[10px] block">{t("issueDateLabel")}</span>
                <p className="font-bold text-[13px]">{formatDate(invoice.issue_date)}</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6 flex-grow flex flex-col">
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-6">
              {/* Company Info */}
              <div className="rounded-2xl p-4 border border-[#f1f5f9]" style={{ backgroundColor: '#f8fafc' }}>
                <h3 className="font-black text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0] flex items-center gap-2 text-[13px]">
                  <div className="w-1.5 h-4 bg-[#2563eb] rounded-full"></div>
                  {t("facilityData")}
                </h3>
                <div className="space-y-2 text-[11px]">
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
              <div className="rounded-2xl p-4 border border-[#f1f5f9]" style={{ backgroundColor: '#f8fafc' }}>
                <h3 className="font-black text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0] flex items-center gap-2 text-[13px]">
                  <div className="w-1.5 h-4 bg-[#059669] rounded-full"></div>
                  {t("customerData")}
                </h3>
                <div className="space-y-2 text-[11px]">
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
                    <span className="font-bold text-[#0f172a] leading-tight text-right">{customer?.address || invoice.client_address || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-xl border border-[#f1f5f9] overflow-hidden shadow-sm">
              <table className="w-full text-[11px] border-collapse">
                <thead style={{ background: '#1e293b', color: '#ffffff' }}>
                  <tr>
                    <th className="px-3 py-3 text-right font-bold">{t("itemNameHeader")}</th>
                    <th className="px-3 py-3 text-center font-bold">{t("quantity")}</th>
                    <th className="px-3 py-3 text-center font-bold">{t("unitPrice")}</th>
                    <th className="px-3 py-3 text-center font-bold">{t("beforeTax")}</th>
                    <th className="px-3 py-3 text-center font-bold">{t("taxRateHeader")}</th>
                    <th className="px-3 py-3 text-center font-bold">{tc("total")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] bg-white">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f8fafc]">
                      <td className="px-3 py-2.5 font-bold text-[#0f172a]">{item.product_name}</td>
                      <td className="px-3 py-2.5 text-center">{item.quantity}</td>
                      <td className="px-3 py-2.5 text-center">{parseFloat(String(item.unit_price)).toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-center font-medium">{parseFloat(String(item.total_before_vat)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2.5 text-center text-[#2563eb] font-bold">{parseFloat(String(item.vat_amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2.5 text-center font-black text-[#0f172a]">{parseFloat(String(item.total_with_vat)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  
                  {adjustments.map((adj) => (
                    <tr key={adj.id} style={{ backgroundColor: adj.type === 'discount' ? '#fff1f2' : '#f0fdf4' }}>
                      <td className="px-3 py-2.5 font-bold text-[#1e293b]">
                        {adj.title} <span className="text-[9px] opacity-60">({adj.type === 'discount' ? t("adjustmentDiscount") : t("adjustmentAddition")})</span>
                      </td>
                      <td className="px-3 py-2.5 text-center opacity-40">-</td>
                      <td className="px-3 py-2.5 text-center opacity-40">-</td>
                      <td className={`px-3 py-2.5 text-center font-bold ${adj.type === 'discount' ? 'text-[#e11d48]' : 'text-[#059669]'}`}>
                        {adj.type === 'discount' ? '-' : ''}{parseFloat(String(adj.amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2.5 text-center opacity-40">-</td>
                      <td className={`px-3 py-2.5 text-center font-black ${adj.type === 'discount' ? 'text-[#be123c]' : 'text-[#047857]'}`}>
                        {adj.type === 'discount' ? '-' : ''}{parseFloat(String(adj.total_with_vat)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary and QR Section */}
            <div className="grid grid-cols-2 gap-6 items-stretch">
              {/* Summary Box */}
              <div 
                className="rounded-2xl p-5 border border-[#f1f5f9] flex flex-col justify-between"
                style={{ background: '#f8fafc' }}
              >
                <div>
                  <h3 className="font-black text-[#0f172a] mb-3 flex items-center gap-2 text-[13px]">
                    <CreditCard size={16} className="text-[#2563eb]" />
                    {t("summary")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#e2e8f0]">
                      <span className="text-[#64748b] text-[11px]">{t("beforeTax")}:</span>
                      <span className="font-bold text-[#0f172a] text-[11px]">{totalBeforeVat.toLocaleString('en-US', { minimumFractionDigits: 2 })} {tc("sar")}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#e2e8f0]">
                      <span className="text-[#64748b] text-[11px]">{t("taxRateHeader")}:</span>
                      <span className="font-bold text-[#2563eb] text-[11px]">{totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })} {tc("sar")}</span>
                    </div>
                    {(discountTotal > 0 || additionTotal > 0) && (
                      <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#e2e8f0]">
                        <span className="text-[#64748b] text-[11px]">{tc("discount")}/{tc("add")}:</span>
                        <span className={`font-bold text-[11px] ${additionTotal - discountTotal < 0 ? 'text-[#e11d48]' : 'text-[#059669]'}`}>
                          {(additionTotal - discountTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} {tc("sar")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div 
                  className="flex justify-between items-center py-3 px-4 rounded-xl mt-4 shadow-md"
                  style={{ background: '#059669' }}
                >
                  <span className="font-black text-white text-[12px]">{t("amountDue")}</span>
                  <span className="font-black text-[14px] text-white">
                    {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} {tc("sar")}
                  </span>
                </div>
              </div>

              {/* QR and Period */}
              <div className="rounded-2xl p-5 border border-[#f1f5f9] bg-white text-center flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="font-black text-[#0f172a] mb-3 flex items-center justify-center gap-2 text-[13px]">
                    <QrCode size={16} className="text-[#2563eb]" />
                    {t("zatcaBarcode")}
                  </h3>
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-[#f8fafc]">
                      {isMounted && (
                        <QRCodeCanvas
                          value={qrData}
                          size={130}
                          level="H"
                          includeMargin={false}
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-[#f1f5f9]">
                  <p className="font-bold text-[#2563eb] text-[10px]">
                    {t("period")} {formatDate(items[0]?.period_from)} - {formatDate(items[0]?.period_to)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            {selectedBank && (
              <div 
                className="rounded-2xl p-5 border border-[#ccfbf1]"
                style={{ background: '#f0fdfa' }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <University size={18} className="text-[#059669]" />
                    <h3 className="font-black text-[#0f172a] text-[13px]">{t("bankInfo")}</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-[#10b981] text-white px-3 py-1 rounded-full text-[9px] font-bold">
                    <ShieldCheck size={12} />
                    <span>{t("certifiedAccount")}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-3 border border-[#f1f5f9] shadow-sm">
                    <p className="text-[9px] text-[#94a3b8] mb-1">{tc("bank") || "Bank"}</p>
                    <p className="font-bold text-[#0f172a] text-[10px] truncate">{selectedBank.bank_name}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-[#f1f5f9] shadow-sm">
                    <p className="text-[9px] text-[#94a3b8] mb-1">{tc("beneficiary") || "Beneficiary"}</p>
                    <p className="font-bold text-[#0f172a] text-[10px] truncate">{selectedBank.bank_beneficiary}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-[#f1f5f9] shadow-sm">
                    <p className="text-[9px] text-[#94a3b8] mb-1">{tc("account") || "Account"}</p>
                    <p className="font-bold text-[#2563eb] text-[11px]">{selectedBank.bank_account}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-[#f1f5f9] shadow-sm">
                    <p className="text-[9px] text-[#94a3b8] mb-1">{tc("iban") || "IBAN"}</p>
                    <p className="font-bold text-[#0f172a] text-[9px] break-all leading-tight">{selectedBank.bank_iban}</p>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  {invoiceStatus === 'paid' ? (
                    <div className="flex items-center gap-1.5 text-[#059669] text-[10px] font-black uppercase">
                      <CheckCircle size={12} />
                      <span>{t("paidSuccessfully")}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#d97706] text-[10px] font-black uppercase">
                      <Clock size={12} />
                      <span>{t("pendingPayment")} - {t("dueDatePrefix")} {formatDate(invoice.due_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stamp and Signature Section */}
            <div className="grid grid-cols-2 gap-12 pt-8 mt-auto border-t border-[#f1f5f9]">
              {/* Stamp */}
              <div className="text-center">
                <h4 className="text-[#64748b] font-bold text-[10px] mb-3 uppercase tracking-tight">{t("companyStamp")}</h4>
                <div className="w-32 h-32 mx-auto bg-white rounded-2xl border border-dashed border-[#e2e8f0] flex items-center justify-center p-4 shadow-sm hover:border-[#2563eb] transition-all">
                  {company.stamp_path ? (
                    <img 
                      src={getPublicUrl(company.stamp_path) || ''} 
                      alt="Stamp" 
                      className="max-w-full max-h-full object-contain grayscale opacity-80"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Stamp size={48} className="text-[#e2e8f0]" />
                  )}
                </div>
              </div>

              {/* Signature */}
              <div className="text-center">
                <h4 className="text-[#64748b] font-bold text-[10px] mb-3 uppercase tracking-tight">{t("digitalSignature")}</h4>
                <div className="w-32 h-32 mx-auto bg-white rounded-2xl border border-dashed border-[#e2e8f0] flex items-center justify-center p-4 shadow-sm hover:border-[#2563eb] transition-all">
                  {company.digital_seal_path ? (
                    <img 
                      src={getPublicUrl(company.digital_seal_path) || ''} 
                      alt="Signature" 
                      className="max-w-full max-h-full object-contain"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Signature size={48} className="text-[#e2e8f0]" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
