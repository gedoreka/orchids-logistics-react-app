"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FileText,
  Building2,
  User,
  Calendar,
  QrCode,
  Printer,
  Download,
  Mail,
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  University,
  Edit,
  Truck,
  ShieldCheck,
  Award,
  Signature,
  Stamp
} from "lucide-react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = printRef.current;
      if (!element) return;
      
      const opt = {
        margin: [2, 2, 2, 2], // Minimal margin to fit in one page
        filename: `فاتورة-ضريبية-${invoice.invoice_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      };
      
      await html2pdf().set(opt).from(element).save();
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
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-6 overflow-y-auto font-tajawal">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap');
        .font-tajawal { font-family: 'Tajawal', sans-serif; }
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .invoice-container { 
            box-shadow: none !important; 
            margin: 0 !important; 
            width: 100% !important; 
            max-width: 100% !important; 
            border: none !important;
            transform: scale(0.95);
            transform-origin: top center;
          }
          @page {
            size: auto;
            margin: 5mm;
          }
        }
        /* Custom styles to prevent lab() colors in Tailwind 4 */
        .bg-invoice-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important; }
        .bg-invoice-footer { background: #f8fafc !important; }
        .text-invoice-primary { color: #0f172a !important; }
        .text-invoice-secondary { color: #475569 !important; }
        .border-invoice { border-color: #f1f5f9 !important; }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-4">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center no-print">
          <Link href="/sales-invoices">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#334155] hover:bg-[#f8fafc] border border-[#e2e8f0] font-bold text-xs transition-all shadow-sm">
              <ArrowRight size={16} />
              العودة
            </button>
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e293b] text-white hover:bg-[#0f172a] font-bold text-xs transition-all shadow-md"
          >
            <Printer size={16} />
            طباعة
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] font-bold text-xs transition-all shadow-md disabled:opacity-50"
          >
            <Download size={16} />
            {pdfLoading ? 'جاري...' : 'تحميل PDF'}
          </button>
        </div>

        {/* Invoice Layout */}
        <div 
          ref={printRef} 
          className="invoice-container bg-white rounded-2xl shadow-xl overflow-hidden border border-[#f1f5f9]"
          style={{ width: '210mm', minHeight: '290mm', margin: '0 auto', backgroundColor: '#ffffff' }}
        >
          {/* Header */}
          <div 
            className="text-white p-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
              {/* Company Logo */}
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center p-2 backdrop-blur-md border border-white/20">
                {company.logo_path ? (
                  <img 
                    src={getPublicUrl(company.logo_path) || ''} 
                    alt="Logo" 
                    className="max-w-full max-h-full object-contain rounded-md"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <Building2 size={32} className="text-white/60" />
                )}
              </div>

              {/* Title Center */}
              <div className="text-center flex-1">
                <h1 className="text-2xl font-black mb-0 tracking-wider">فاتورة ضريبية</h1>
                <p className="text-white/60 text-sm uppercase font-light">VAT Invoice</p>
                <div className="mt-2 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-xl backdrop-blur-sm">
                  <span className="font-bold text-[10px]">نظام الفواتير الإلكترونية</span>
                </div>
              </div>

              {/* System Logo */}
              <div className="flex flex-col items-center gap-1 bg-white/5 p-2 rounded-xl border border-white/10 backdrop-blur-md min-w-[120px]">
                <Truck size={20} className="text-[#3b82f6]" />
                <h2 className="text-[10px] font-black text-white uppercase">Logistics Systems</h2>
              </div>
            </div>

            {/* Header Meta */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10 relative z-10">
              <div className="text-center">
                <span className="text-white/40 text-[10px] block">مطالبة شهر:</span>
                <p className="font-bold text-xs">{invoice.invoice_month || getClaimMonth(invoice.issue_date)}</p>
              </div>
              <div className="text-center">
                <span className="text-white/40 text-[10px] block">رقم الفاتورة:</span>
                <p className="font-bold text-xs tracking-widest">{invoice.invoice_number}</p>
              </div>
              <div className="text-center">
                <span className="text-white/40 text-[10px] block">تاريخ الإصدار:</span>
                <p className="font-bold text-xs">{formatDate(invoice.issue_date)}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Company Info */}
              <div className="rounded-2xl p-4 border border-[#f1f5f9] bg-[#f8fafc]">
                <h3 className="font-black text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0] flex items-center gap-2 text-xs">
                  <div className="w-1 h-4 bg-[#2563eb] rounded-full"></div>
                  بيانات المنشأة
                </h3>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b]">الاسم:</span>
                    <span className="font-bold text-[#0f172a]">{company?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b]">السجل:</span>
                    <span className="font-bold text-[#0f172a]">{company?.commercial_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b]">الضريبي:</span>
                    <span className="font-bold text-[#2563eb]">{company?.vat_number}</span>
                  </div>
                  <div className="flex justify-start gap-2">
                    <span className="text-[#64748b] whitespace-nowrap">العنوان:</span>
                    <span className="font-bold text-[#0f172a] leading-tight">{companyAddress}</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="rounded-2xl p-4 border border-[#f1f5f9] bg-[#f8fafc]">
                <h3 className="font-black text-[#0f172a] mb-3 pb-2 border-b border-[#e2e8f0] flex items-center gap-2 text-xs">
                  <div className="w-1 h-4 bg-[#059669] rounded-full"></div>
                  بيانات العميل
                </h3>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b]">الاسم:</span>
                    <span className="font-bold text-[#0f172a]">{customer?.company_name || customer?.name || invoice.client_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b]">السجل:</span>
                    <span className="font-bold text-[#0f172a]">{customer?.commercial_number || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#64748b]">الضريبي:</span>
                    <span className="font-bold text-[#059669]">{customer?.vat_number || invoice.client_vat || '-'}</span>
                  </div>
                  <div className="flex justify-start gap-2">
                    <span className="text-[#64748b] whitespace-nowrap">العنوان:</span>
                    <span className="font-bold text-[#0f172a] leading-tight">{customer?.address || invoice.client_address || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-xl border border-[#f1f5f9] overflow-hidden shadow-sm">
              <table className="w-full text-[10px] border-collapse">
                <thead style={{ background: '#1e293b', color: '#ffffff' }}>
                  <tr>
                    <th className="px-3 py-3 text-right font-bold">البند</th>
                    <th className="px-3 py-3 text-center font-bold">الكمية</th>
                    <th className="px-3 py-3 text-center font-bold">السعر</th>
                    <th className="px-3 py-3 text-center font-bold">قبل الضريبة</th>
                    <th className="px-3 py-3 text-center font-bold">الضريبة 15%</th>
                    <th className="px-3 py-3 text-center font-bold">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] bg-white">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f8fafc]">
                      <td className="px-3 py-2 font-bold text-[#0f172a]">{item.product_name}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-center">{parseFloat(String(item.unit_price)).toFixed(2)}</td>
                      <td className="px-3 py-2 text-center font-medium">{parseFloat(String(item.total_before_vat)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-center text-[#2563eb] font-bold">{parseFloat(String(item.vat_amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      <td className="px-3 py-2 text-center font-black text-[#0f172a]">{parseFloat(String(item.total_with_vat)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                  
                  {adjustments.map((adj) => (
                    <tr key={adj.id} style={{ backgroundColor: adj.type === 'discount' ? '#fff1f2' : '#f0fdf4' }}>
                      <td className="px-3 py-2 font-bold text-[#1e293b]">
                        {adj.title} <span className="text-[8px] opacity-60">({adj.type === 'discount' ? 'خصم' : 'إضافة'})</span>
                      </td>
                      <td className="px-3 py-2 text-center opacity-40">-</td>
                      <td className="px-3 py-2 text-center opacity-40">-</td>
                      <td className={`px-3 py-2 text-center font-bold ${adj.type === 'discount' ? 'text-[#e11d48]' : 'text-[#059669]'}`}>
                        {adj.type === 'discount' ? '-' : ''}{parseFloat(String(adj.amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2 text-center opacity-40">-</td>
                      <td className={`px-3 py-2 text-center font-black ${adj.type === 'discount' ? 'text-[#be123c]' : 'text-[#047857]'}`}>
                        {adj.type === 'discount' ? '-' : ''}{parseFloat(String(adj.total_with_vat)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary and QR Section */}
            <div className="grid grid-cols-2 gap-4 items-stretch">
              {/* Summary Box */}
              <div 
                className="rounded-2xl p-5 border border-[#f1f5f9] flex flex-col justify-between"
                style={{ background: '#f8fafc' }}
              >
                <div>
                  <h3 className="font-black text-[#0f172a] mb-4 flex items-center gap-2 text-xs">
                    <CreditCard size={14} className="text-[#2563eb]" />
                    ملخص الفاتورة
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-dashed border-[#e2e8f0]">
                      <span className="text-[#64748b] text-[10px]">قبل الضريبة:</span>
                      <span className="font-bold text-[#0f172a] text-[10px]">{totalBeforeVat.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-dashed border-[#e2e8f0]">
                      <span className="text-[#64748b] text-[10px]">الضريبة 15%:</span>
                      <span className="font-bold text-[#2563eb] text-[10px]">{totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</span>
                    </div>
                    {(discountTotal > 0 || additionTotal > 0) && (
                      <div className="flex justify-between items-center py-1 border-b border-dashed border-[#e2e8f0]">
                        <span className="text-[#64748b] text-[10px]">تعديلات:</span>
                        <span className={`font-bold text-[10px] ${additionTotal - discountTotal < 0 ? 'text-[#e11d48]' : 'text-[#059669]'}`}>
                          {(additionTotal - discountTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div 
                  className="flex justify-between items-center py-2 px-4 rounded-xl mt-4 shadow-sm"
                  style={{ background: '#059669' }}
                >
                  <span className="font-black text-white text-[10px]">المبلغ المستحق:</span>
                  <span className="font-black text-xs text-white">
                    {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
                  </span>
                </div>
              </div>

              {/* QR and Period */}
              <div className="rounded-2xl p-5 border border-[#f1f5f9] bg-white text-center flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-[#0f172a] mb-2 flex items-center justify-center gap-2 text-xs">
                    <QrCode size={14} className="text-[#2563eb]" />
                    باركود ZATCA
                  </h3>
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-[#f8fafc]">
                      {isMounted && (
                        <QRCodeCanvas
                          value={qrData}
                          size={100}
                          level="H"
                          includeMargin={false}
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-[#f1f5f9]">
                  <p className="font-bold text-[#2563eb] text-[9px]">
                    الفترة: {formatDate(items[0]?.period_from)} - {formatDate(items[0]?.period_to)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Info */}
            {selectedBank && (
              <div 
                className="rounded-2xl p-4 border border-[#ccfbf1]"
                style={{ background: '#f0fdfa' }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <University size={16} className="text-[#059669]" />
                    <h3 className="font-black text-[#0f172a] text-xs">معلومات السداد البنكي</h3>
                  </div>
                  <div className="flex items-center gap-2 bg-[#10b981] text-white px-2 py-0.5 rounded-full text-[8px] font-bold">
                    <ShieldCheck size={10} />
                    <span>حساب معتمد</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-[#f1f5f9]">
                    <p className="text-[8px] text-[#94a3b8] mb-1">البنك</p>
                    <p className="font-bold text-[#0f172a] text-[9px] truncate">{selectedBank.bank_name}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-[#f1f5f9]">
                    <p className="text-[8px] text-[#94a3b8] mb-1">المستفيد</p>
                    <p className="font-bold text-[#0f172a] text-[9px] truncate">{selectedBank.bank_beneficiary}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-[#f1f5f9]">
                    <p className="text-[8px] text-[#94a3b8] mb-1">الحساب</p>
                    <p className="font-bold text-[#2563eb] text-[9px]">{selectedBank.bank_account}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-[#f1f5f9]">
                    <p className="text-[8px] text-[#94a3b8] mb-1">الآيبان</p>
                    <p className="font-bold text-[#0f172a] text-[8px] break-all">{selectedBank.bank_iban}</p>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  {invoiceStatus === 'paid' ? (
                    <div className="flex items-center gap-1 text-[#059669] text-[9px] font-black uppercase">
                      <CheckCircle size={10} />
                      <span>تم السداد بنجاح</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#d97706] text-[9px] font-black uppercase">
                      <Clock size={10} />
                      <span>بانتظار السداد - الاستحقاق: {formatDate(invoice.due_date)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stamp and Signature Section */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-[#f1f5f9]">
              {/* Stamp */}
              <div className="text-center">
                <h4 className="text-[#64748b] font-bold text-[9px] mb-2 uppercase tracking-tight">ختم المنشأة</h4>
                <div className="w-20 h-20 mx-auto bg-white rounded-xl border border-dashed border-[#e2e8f0] flex items-center justify-center p-2">
                  {company.stamp_path ? (
                    <img 
                      src={getPublicUrl(company.stamp_path) || ''} 
                      alt="Stamp" 
                      className="max-w-full max-h-full object-contain grayscale"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Stamp size={24} className="text-[#e2e8f0]" />
                  )}
                </div>
              </div>

              {/* Signature */}
              <div className="text-center">
                <h4 className="text-[#64748b] font-bold text-[9px] mb-2 uppercase tracking-tight">التوقيع الإلكتروني</h4>
                <div className="w-20 h-20 mx-auto bg-white rounded-xl border border-dashed border-[#e2e8f0] flex items-center justify-center p-2">
                  {company.digital_seal_path ? (
                    <img 
                      src={getPublicUrl(company.digital_seal_path) || ''} 
                      alt="Signature" 
                      className="max-w-full max-h-full object-contain"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Signature size={24} className="text-[#e2e8f0]" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
