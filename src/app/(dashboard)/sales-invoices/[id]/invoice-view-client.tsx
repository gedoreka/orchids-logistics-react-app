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
        margin: [5, 5, 5, 5],
        filename: `فاتورة-ضريبية-${invoice.invoice_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 1.5, 
          useCORS: true, 
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
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
          .invoice-container { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; border: none !important; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center no-print">
          <Link href="/sales-invoices">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-bold text-sm transition-all shadow-sm">
              <ArrowRight size={18} />
              العودة للقائمة
            </button>
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 font-bold text-sm transition-all shadow-md"
          >
            <Printer size={18} />
            طباعة
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm transition-all shadow-md disabled:opacity-50"
          >
            <Download size={18} />
            {pdfLoading ? 'جاري التحميل...' : 'تحميل PDF'}
          </button>
          <a
            href={`mailto:${customer?.email || ''}?subject=فاتورة رقم ${invoice.invoice_number}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-sm transition-all shadow-md"
          >
            <Mail size={18} />
            إرسال بالبريد
          </a>
        </div>

        {/* Invoice Layout */}
        <div 
          ref={printRef} 
          className="invoice-container bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div 
            className="text-white p-8 md:p-10 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
          >
            {/* Background elements */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
              {/* Company Logo (Left) */}
              <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center p-2 backdrop-blur-md border border-white/20">
                {company.logo_path ? (
                  <img 
                    src={getPublicUrl(company.logo_path) || ''} 
                    alt="Logo" 
                    className="max-w-full max-h-full object-contain rounded-lg"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <Building2 size={40} className="text-white/60" />
                )}
              </div>

              {/* Title Center */}
              <div className="text-center flex-1">
                <h1 className="text-3xl md:text-4xl font-black mb-1 tracking-wider">فاتورة ضريبية</h1>
                <p className="text-white/70 text-lg uppercase font-light">VAT Invoice</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white/10 border border-white/10 px-5 py-2 rounded-2xl backdrop-blur-sm">
                  <FileText size={18} className="text-blue-400" />
                  <span className="font-bold text-sm">نظام الفواتير الإلكترونية</span>
                </div>
              </div>

              {/* System Logo (Right) */}
              <div className="flex flex-col items-center gap-2 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md min-w-[150px]">
                <div className="bg-blue-500 p-2 rounded-xl text-white shadow-lg">
                  <Truck size={24} />
                </div>
                <h2 className="text-xs font-black text-white tracking-tight uppercase">Logistics Systems Pro</h2>
              </div>
            </div>

            {/* Header Meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-6 border-t border-white/10 relative z-10">
              <div className="flex items-center justify-center gap-3">
                <Calendar size={18} className="text-blue-400" />
                <div>
                  <span className="text-white/50 text-xs block text-right">مطالبة عن شهر:</span>
                  <p className="font-bold text-sm">{invoice.invoice_month || getClaimMonth(invoice.issue_date)}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <FileText size={18} className="text-blue-400" />
                <div>
                  <span className="text-white/50 text-xs block text-right">رقم الفاتورة:</span>
                  <p className="font-bold text-sm tracking-widest">{invoice.invoice_number}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Clock size={18} className="text-blue-400" />
                <div>
                  <span className="text-white/50 text-xs block text-right">تاريخ الإصدار:</span>
                  <p className="font-bold text-sm">{formatDate(invoice.issue_date)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-10">
            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Company Info */}
              <div className="relative group">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg z-10 transition-transform group-hover:scale-110">
                  <Building2 size={16} />
                </div>
                  <div className="rounded-3xl p-6 border border-[#f1f5f9] bg-[#f8fafc] shadow-sm transition-all hover:shadow-md hover:border-blue-100">
                    <h3 className="font-black text-[#1e293b] mb-5 pb-3 border-b border-[#e2e8f0] flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                      بيانات المنشأة
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748b] font-medium">اسم المنشأة:</span>
                        <span className="font-bold text-[#1e293b]">{company?.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748b] font-medium">السجل التجاري:</span>
                        <span className="font-bold text-[#1e293b]">{company?.commercial_number || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748b] font-medium">الرقم الضريبي:</span>
                        <span className="font-bold text-[#1e293b] tracking-wider text-blue-600">{company?.vat_number || '-'}</span>
                      </div>
                      <div className="flex justify-start gap-4">
                        <span className="text-[#64748b] font-medium whitespace-nowrap">العنوان:</span>
                        <span className="font-bold text-[#1e293b] text-left w-full">{companyAddress || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="relative group">
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg z-10 transition-transform group-hover:scale-110">
                    <User size={16} />
                  </div>
                  <div className="rounded-3xl p-6 border border-[#f1f5f9] bg-[#f8fafc] shadow-sm transition-all hover:shadow-md hover:border-emerald-100">
                    <h3 className="font-black text-[#1e293b] mb-5 pb-3 border-b border-[#e2e8f0] flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-emerald-600 rounded-full"></span>
                      بيانات العميل
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748b] font-medium">اسم العميل:</span>
                        <span className="font-bold text-[#1e293b]">{customer?.company_name || customer?.customer_name || customer?.name || invoice.client_name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748b] font-medium">السجل التجاري:</span>
                        <span className="font-bold text-[#1e293b]">{customer?.commercial_number || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#64748b] font-medium">الرقم الضريبي:</span>
                        <span className="font-bold text-[#1e293b] tracking-wider text-emerald-600">{customer?.vat_number || invoice.client_vat || '-'}</span>
                      </div>
                      <div className="flex justify-start gap-4">
                        <span className="text-[#64748b] font-medium whitespace-nowrap">العنوان:</span>
                        <span className="font-bold text-[#1e293b] text-left w-full">{customer?.address || invoice.client_address || '-'}</span>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead 
                    className="text-white"
                    style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
                  >
                    <tr>
                      <th className="px-5 py-5 text-right font-black uppercase tracking-wider">البند</th>
                      <th className="px-5 py-5 text-center font-black uppercase tracking-wider">الكمية</th>
                      <th className="px-5 py-5 text-center font-black uppercase tracking-wider">سعر الوحدة</th>
                      <th className="px-5 py-5 text-center font-black uppercase tracking-wider">قبل الضريبة</th>
                      <th className="px-5 py-5 text-center font-black uppercase tracking-wider">الضريبة 15%</th>
                      <th className="px-5 py-5 text-center font-black uppercase tracking-wider">الإجمالي</th>
                      <th className="px-5 py-5 text-center font-black uppercase tracking-wider">العملة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-5 font-bold text-slate-900">{item.product_name}</td>
                        <td className="px-5 py-5 text-center text-slate-600 font-medium">{item.quantity}</td>
                        <td className="px-5 py-5 text-center text-slate-600 font-medium">{parseFloat(String(item.unit_price)).toFixed(4)}</td>
                        <td className="px-5 py-5 text-center text-slate-600 font-bold">{parseFloat(String(item.total_before_vat)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-5 py-5 text-center text-blue-600 font-bold">{parseFloat(String(item.vat_amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-5 py-5 text-center font-black text-slate-900">{parseFloat(String(item.total_with_vat)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-5 py-5 text-center text-slate-400 text-xs font-bold">{company?.currency || 'ريال سعودي'}</td>
                      </tr>
                    ))}
                    
                    {adjustments.map((adj) => (
                      <tr key={adj.id} className={adj.type === 'discount' ? 'bg-[#fef2f2]' : 'bg-[#f0fdf4]'}>
                        <td className="px-5 py-5 font-bold text-slate-800 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${adj.type === 'discount' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                          {adj.title} <span className="text-xs font-normal opacity-60">({adj.type === 'discount' ? 'خصم' : 'إضافة'})</span>
                        </td>
                        <td className="px-5 py-5 text-center text-slate-400">-</td>
                        <td className="px-5 py-5 text-center text-slate-400">-</td>
                        <td className={`px-5 py-5 text-center font-bold ${adj.type === 'discount' ? 'text-red-500' : 'text-emerald-500'}`}>
                          {adj.type === 'discount' ? '-' : ''}{parseFloat(String(adj.amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-5 text-center text-slate-400 font-medium">{parseFloat(String(adj.vat_amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className={`px-5 py-5 text-center font-black ${adj.type === 'discount' ? 'text-red-600' : 'text-emerald-600'}`}>
                          {adj.type === 'discount' ? '-' : ''}{parseFloat(String(adj.total_with_vat)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 py-5 text-center text-slate-400 text-xs font-bold">{company?.currency || 'ريال سعودي'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

              {/* Summary and QR Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
                {/* Summary Box */}
                <div 
                  className="rounded-3xl p-8 border border-[#f1f5f9] shadow-sm relative overflow-hidden flex flex-col justify-between"
                  style={{ background: 'linear-gradient(to bottom right, #ffffff, #f8fafc)' }}
                >
                  <div className="absolute top-0 right-0 w-2 h-full bg-blue-600/10"></div>
                  <div>
                    <h3 className="font-black text-[#1e293b] mb-6 flex items-center gap-2">
                      <CreditCard size={20} className="text-blue-600" />
                      ملخص الفاتورة
                    </h3>
  
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-[#e2e8f0]">
                        <span className="text-[#64748b] font-medium text-xs">الإجمالي قبل الضريبة:</span>
                        <span className="font-bold text-[#1e293b] text-xs">{totalBeforeVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-dashed border-[#e2e8f0]">
                        <span className="text-[#64748b] font-medium text-xs">ضريبة القيمة المضافة (15%):</span>
                        <span className="font-bold text-blue-600 text-xs">{totalVat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال</span>
                      </div>
                      {discountTotal > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-dashed border-[#e2e8f0] bg-[#fef2f2] px-2 rounded-lg">
                          <span className="text-red-600 font-medium text-xs">إجمالي الخصومات:</span>
                          <span className="font-bold text-red-600 text-xs">-{discountTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال</span>
                        </div>
                      )}
                      {additionTotal > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-dashed border-[#e2e8f0] bg-[#f0fdf4] px-2 rounded-lg">
                          <span className="text-emerald-600 font-medium text-xs">إجمالي الإضافات:</span>
                          <span className="font-bold text-emerald-600 text-xs">+{additionTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div 
                    className="flex justify-between items-center py-3 px-6 rounded-2xl mt-6 shadow-sm border border-emerald-100"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <span className="font-black text-white text-xs">إجمالي المبلغ المستحق:</span>
                    <span className="font-black text-xs text-white tracking-tight">
                      {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال
                    </span>
                  </div>
                </div>
  
                {/* QR and Period */}
                <div 
                  className="rounded-3xl p-8 border border-[#f1f5f9] bg-white shadow-sm text-center relative group flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 w-full h-1 bg-[#f1f5f9]"></div>
                    <div>
                      <h3 className="font-black text-[#1e293b] mb-4 flex items-center justify-center gap-2">
                        <QrCode size={20} className="text-blue-600" />
                        الباركود الضريبي | ZATCA
                      </h3>
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-white rounded-2xl shadow-md border border-[#f8fafc] transition-transform group-hover:scale-105">
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
                      <p className="text-[9px] text-[#94a3b8] font-bold mb-4">باركود ضريبي قابل للقراءة متوافق مع هيئة الزكاة والضريبة</p>
                    </div>
                    
                    <div className="flex justify-center items-center gap-4 pt-3 border-t border-[#f1f5f9]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#94a3b8] text-[8px] font-bold">الفترة:</span>
                        <p className="font-bold text-blue-600 text-[9px]">{formatDate(items[0]?.period_from)} - {formatDate(items[0]?.period_to)}</p>
                      </div>
                    </div>
                  </div>
              </div>

            {/* Bank Info Section with Status Integrated */}
            {selectedBank && (
              <div 
                className="rounded-3xl p-8 border border-emerald-100 shadow-sm relative overflow-hidden"
                style={{ background: 'linear-gradient(to bottom right, #f0fdfa, #f9fafb)' }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <University size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-[#1e293b] text-lg">معلومات الحساب البنكي</h3>
                      <p className="text-[10px] text-emerald-600 font-black">حساب بنكي معتمد وامن</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 no-print">
                    <span className="text-[#64748b] font-bold text-xs">تبديل الحساب:</span>
                    <select
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(parseInt(e.target.value))}
                      className="px-4 py-2 rounded-xl border border-emerald-200 bg-white text-sm font-bold text-[#475569] shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                    >
                      {bankAccounts.map(bank => (
                        <option key={bank.id} value={bank.id}>{bank.bank_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm transition-all hover:shadow-md">
                    <p className="text-[9px] text-[#94a3b8] font-black uppercase mb-2 tracking-tighter">اسم البنك</p>
                    <p className="font-black text-[#1e293b] text-xs">{selectedBank.bank_name}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm transition-all hover:shadow-md">
                    <p className="text-[9px] text-[#94a3b8] font-black uppercase mb-2 tracking-tighter">اسم المستفيد</p>
                    <p className="font-black text-[#1e293b] text-xs">{selectedBank.bank_beneficiary}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm transition-all hover:shadow-md">
                    <p className="text-[9px] text-[#94a3b8] font-black uppercase mb-2 tracking-tighter">رقم الحساب</p>
                    <p className="font-black text-blue-600 text-xs tracking-widest">{selectedBank.bank_account}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 border border-[#f1f5f9] shadow-sm transition-all hover:shadow-md">
                    <p className="text-[9px] text-[#94a3b8] font-black uppercase mb-2 tracking-tighter">الآيبان</p>
                    <p className="font-black text-[#1e293b] text-[10px] break-all leading-relaxed font-mono tracking-tighter">{selectedBank.bank_iban}</p>
                  </div>
                </div>

                {/* Integrated Status and Secure Badges */}
                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-emerald-100">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-emerald-700 text-[10px] font-bold">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span>حساب أمن</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 text-[10px] font-bold">
                      <Award size={14} className="text-emerald-500" />
                      <span>حساب بنكي معتمد</span>
                    </div>
                  </div>
                  
                  {/* Small Tidy Status */}
                  <div className="flex items-center gap-3">
                    {invoiceStatus === 'paid' ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                        <CheckCircle size={12} />
                        <span className="font-bold text-[10px] uppercase">تم السداد</span>
                      </div>
                    ) : invoiceStatus === 'draft' ? (
                      <div className="flex items-center gap-1.5 text-[#64748b] bg-[#f8fafc] px-3 py-1 rounded-lg border border-[#f1f5f9]">
                        <Edit size={12} />
                        <span className="font-bold text-[10px] uppercase">مسودة</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-1.5 text-amber-600">
                          <Clock size={12} />
                          <span className="font-bold text-[10px] uppercase">بانتظار السداد</span>
                        </div>
                        <div className="w-px h-3 bg-amber-200" />
                        <span className="text-[9px] font-bold text-amber-700/70">الاستحقاق: {formatDate(invoice.due_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

              {/* Stamp and Signature Section - REPOSITIONED TO END */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-[#f1f5f9] mt-10">
              {/* Stamp */}
              <div className="text-center group">
                <h4 className="text-[#1e293b] font-black text-[11px] mb-4 flex items-center justify-center gap-2">
                  <Stamp size={14} className="text-[#94a3b8]" />
                  ختم المنشأة
                </h4>
                <div className="w-24 h-24 mx-auto bg-white rounded-2xl border border-dashed border-[#e2e8f0] flex items-center justify-center p-4 relative overflow-hidden transition-all group-hover:border-blue-300 shadow-sm">
                  {company.stamp_path ? (
                    <img 
                      src={getPublicUrl(company.stamp_path) || ''} 
                      alt="Stamp" 
                      className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-500"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="text-[#e2e8f0] flex flex-col items-center gap-1">
                      <Stamp size={32} className="opacity-10" />
                      <span className="text-[8px] font-black uppercase">لا يوجد ختم</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature */}
              <div className="text-center group">
                <h4 className="text-[#1e293b] font-black text-[11px] mb-4 flex items-center justify-center gap-2">
                  <Signature size={14} className="text-[#94a3b8]" />
                  التوقيع الإلكتروني
                </h4>
                <div className="w-24 h-24 mx-auto bg-white rounded-2xl border border-dashed border-[#e2e8f0] flex items-center justify-center p-4 relative overflow-hidden transition-all group-hover:border-indigo-300 shadow-sm">
                  {company.digital_seal_path ? (
                    <img 
                      src={getPublicUrl(company.digital_seal_path) || ''} 
                      alt="Signature" 
                      className="max-w-full max-h-full object-contain"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="text-[#e2e8f0] flex flex-col items-center gap-1">
                      <Signature size={32} className="opacity-10" />
                      <span className="text-[8px] font-black uppercase">لا يوجد توقيع</span>
                    </div>
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
