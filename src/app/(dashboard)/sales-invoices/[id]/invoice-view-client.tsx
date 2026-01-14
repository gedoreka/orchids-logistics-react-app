"use client";

import React, { useRef, useState } from "react";
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
  Edit
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

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
  const encoder = new TextEncoder();
  const values = [
    sellerName,
    vatNumber,
    invoiceDate + 'T00:00:00Z',
    totalWithVAT,
    vatAmount
  ];
  
  const tlvParts: number[] = [];
  values.forEach((value, index) => {
    const encoded = encoder.encode(value);
    tlvParts.push(index + 1);
    tlvParts.push(encoded.length);
    tlvParts.push(...encoded);
  });
  
  const bytes = new Uint8Array(tlvParts);
  let binary = '';
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

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
        margin: [10, 10, 10, 10],
        filename: `فاتورة-ضريبية-${invoice.invoice_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-3 justify-center print:hidden">
          <Link href="/sales-invoices">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-sm transition-all">
              <ArrowRight size={18} />
              العودة للقائمة
            </button>
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 text-white hover:bg-gray-900 font-bold text-sm transition-all"
          >
            <Printer size={18} />
            طباعة
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-sm transition-all disabled:opacity-50"
          >
            <Download size={18} />
            {pdfLoading ? 'جاري التحميل...' : 'تحميل PDF'}
          </button>
          <a
            href={`mailto:${customer?.email || ''}?subject=فاتورة رقم ${invoice.invoice_number}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-sm transition-all"
          >
            <Mail size={18} />
            إرسال بالبريد
          </a>
        </div>

        <div ref={printRef} className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
          <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] text-white p-6 print:bg-[#1a237e]">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="text-center flex-1">
                <h1 className="text-2xl md:text-3xl font-black mb-2">فاتورة ضريبية</h1>
                <p className="text-white/80 text-lg">VAT Invoice</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                  <FileText size={18} />
                  <span>نظام الفواتير الإلكترونية</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20 text-center">
              <div>
                <span className="text-white/70 text-sm">مطالبة عن شهر:</span>
                <p className="font-bold">{invoice.invoice_month || '-'}</p>
              </div>
              <div>
                <span className="text-white/70 text-sm">رقم الفاتورة:</span>
                <p className="font-bold">{invoice.invoice_number}</p>
              </div>
              <div>
                <span className="text-white/70 text-sm">تاريخ الإصدار:</span>
                <p className="font-bold">{invoice.issue_date || '-'}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 size={18} className="text-blue-600" />
                  بيانات المنشأة
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">اسم المنشأة:</span> <span className="font-bold">{company?.name || '-'}</span></p>
                  <p><span className="text-gray-500">السجل التجاري:</span> <span className="font-bold">{company?.commercial_number || '-'}</span></p>
                  <p><span className="text-gray-500">الرقم الضريبي:</span> <span className="font-bold">{company?.vat_number || '-'}</span></p>
                  <p><span className="text-gray-500">العنوان:</span> <span className="font-bold">{companyAddress || '-'}</span></p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={18} className="text-emerald-600" />
                  بيانات العميل
                </h3>
                <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">اسم العميل:</span> <span className="font-bold">{customer?.company_name || customer?.customer_name || customer?.name || invoice.client_name || '-'}</span></p>
                    <p><span className="text-gray-500">السجل التجاري:</span> <span className="font-bold">{customer?.commercial_number || '-'}</span></p>
                    <p><span className="text-gray-500">الرقم الضريبي:</span> <span className="font-bold">{customer?.vat_number || invoice.client_vat || '-'}</span></p>
                    <p><span className="text-gray-500">العنوان:</span> <span className="font-bold">{customer?.address || invoice.client_address || '-'}</span></p>
                  </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gradient-to-br from-[#1a237e] to-[#283593] text-white print:bg-[#1a237e]">
                  <tr>
                    <th className="px-3 py-3 text-right font-bold">البند</th>
                    <th className="px-3 py-3 text-center font-bold">الكمية</th>
                    <th className="px-3 py-3 text-center font-bold">سعر الوحدة</th>
                    <th className="px-3 py-3 text-center font-bold">قبل الضريبة</th>
                    <th className="px-3 py-3 text-center font-bold">الضريبة 15%</th>
                    <th className="px-3 py-3 text-center font-bold">الإجمالي</th>
                    <th className="px-3 py-3 text-center font-bold">العملة</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50/30">
                      <td className="px-3 py-3 font-bold text-gray-900">{item.product_name}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{item.quantity}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{parseFloat(String(item.unit_price)).toFixed(4)}</td>
                      <td className="px-3 py-3 text-center text-gray-600">{parseFloat(String(item.total_before_vat)).toFixed(2)}</td>
                      <td className="px-3 py-3 text-center text-blue-600">{parseFloat(String(item.vat_amount)).toFixed(2)}</td>
                      <td className="px-3 py-3 text-center font-bold text-gray-900">{parseFloat(String(item.total_with_vat)).toFixed(2)}</td>
                      <td className="px-3 py-3 text-center text-gray-500">{company?.currency || 'ريال سعودي'}</td>
                    </tr>
                  ))}
                  
                  {adjustments.map((adj) => (
                    <tr key={adj.id} className={`border-b border-gray-100 ${adj.type === 'discount' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                      <td className="px-3 py-3 font-bold">
                        {adj.title} ({adj.type === 'discount' ? 'خصم' : 'إضافة'})
                      </td>
                      <td className="px-3 py-3 text-center">-</td>
                      <td className="px-3 py-3 text-center">-</td>
                      <td className="px-3 py-3 text-center">{parseFloat(String(adj.amount)).toFixed(2)}</td>
                      <td className="px-3 py-3 text-center">{parseFloat(String(adj.vat_amount)).toFixed(2)}</td>
                      <td className="px-3 py-3 text-center font-bold">
                        {adj.type === 'discount' ? '-' : ''}{parseFloat(String(adj.total_with_vat)).toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-500">{company?.currency || 'ريال سعودي'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-600" />
                  ملخص الفاتورة
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                    <span className="text-gray-600">الإجمالي قبل الضريبة:</span>
                    <span className="font-bold">{totalBeforeVat.toFixed(2)} ريال</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                    <span className="text-gray-600">ضريبة القيمة المضافة (15%):</span>
                    <span className="font-bold text-blue-600">{totalVat.toFixed(2)} ريال</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                      <span className="text-gray-600">إجمالي الخصومات:</span>
                      <span className="font-bold text-red-600">-{discountTotal.toFixed(2)} ريال</span>
                    </div>
                  )}
                  {additionTotal > 0 && (
                    <div className="flex justify-between py-2 border-b border-dashed border-gray-200">
                      <span className="text-gray-600">إجمالي الإضافات:</span>
                      <span className="font-bold text-emerald-600">{additionTotal.toFixed(2)} ريال</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-t-2 border-blue-200 mt-2">
                    <span className="font-bold text-lg">إجمالي المبلغ المستحق:</span>
                    <span className="font-black text-xl text-emerald-600 bg-emerald-100 px-4 py-1 rounded-lg">
                      {grandTotal.toFixed(2)} ريال
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  <QrCode size={18} className="text-blue-600" />
                  الباركود الضريبي | ZATCA
                </h3>
                <div className="flex justify-center mb-4">
                  <QRCodeSVG
                    value={qrData}
                    size={150}
                    level="M"
                    includeMargin
                    className="rounded-lg shadow-md"
                  />
                </div>
                <p className="text-xs text-gray-500 mb-4">باركود ضريبي قابل للقراءة متوافق مع هيئة الزكاة</p>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
                  <div>
                    <span className="text-gray-500">الفترة من:</span>
                    <p className="font-bold text-blue-600">{items[0]?.period_from || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">إلى:</span>
                    <p className="font-bold text-blue-600">{items[0]?.period_to || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {selectedBank && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <University size={18} className="text-emerald-600" />
                    معلومات الحساب البنكي
                  </h3>
                  {bankAccounts.length > 1 && (
                    <select
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(parseInt(e.target.value))}
                      className="px-3 py-1.5 rounded-lg border border-emerald-200 text-sm print:hidden"
                    >
                      {bankAccounts.map(bank => (
                        <option key={bank.id} value={bank.id}>{bank.bank_name}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-gray-500 mb-1">اسم البنك</p>
                    <p className="font-bold text-gray-900">{selectedBank.bank_name}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-gray-500 mb-1">اسم المستفيد</p>
                    <p className="font-bold text-gray-900">{selectedBank.bank_beneficiary}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-gray-500 mb-1">رقم الحساب</p>
                    <p className="font-bold text-gray-900">{selectedBank.bank_account}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs text-gray-500 mb-1">الآيبان</p>
                    <p className="font-bold text-gray-900 text-sm break-all">{selectedBank.bank_iban}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center items-center gap-8 pt-6 border-t border-gray-100">
              {invoiceStatus === 'paid' ? (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-6 py-3 rounded-xl">
                  <CheckCircle size={24} />
                  <span className="font-bold text-lg">تم السداد</span>
                </div>
              ) : invoiceStatus === 'draft' ? (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-6 py-3 rounded-xl">
                  <Edit size={24} />
                  <span className="font-bold text-lg">مسودة</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-6 py-3 rounded-xl">
                  <Clock size={24} />
                  <span className="font-bold text-lg">مستحقة - تاريخ الاستحقاق: {invoice.due_date || '-'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
