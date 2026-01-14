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
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useReactToPrint } from "react-to-print";

interface CreditNoteViewClientProps {
  creditNote: any;
  qrData: string;
}

export function CreditNoteViewClient({ creditNote, qrData }: CreditNoteViewClientProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `إشعار دائن - ${creditNote.credit_note_number}`,
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
      
      let finalImgHeight = imgHeight;
      let finalImgWidth = imgWidth;
      
      if (imgHeight > pdfHeight) {
        const ratio = pdfHeight / imgHeight;
        finalImgHeight = pdfHeight;
        finalImgWidth = imgWidth * ratio;
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

  return (
    <div className="min-h-screen bg-[#f1f5f9] overflow-y-auto font-tajawal">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@200;300;400;500;700;800;900&display=swap');
          .font-tajawal { font-family: 'Tajawal', sans-serif; }
          @media print {
            .no-print { display: none !important; }
            html, body { 
              background: white !important; 
              padding: 0 !important; 
              margin: 0 !important; 
              width: 210mm !important;
              height: auto !important;
            }
            .invoice-container { 
              box-shadow: none !important; 
              margin: 0 !important; 
              width: 210mm !important; 
              min-height: 297mm !important;
              max-width: 100% !important; 
              border: none !important;
              transform: none !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              overflow: visible !important;
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
            onClick={handlePrint}
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
        </div>

        {/* Credit Note Layout */}
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
          {/* Header */}
          <div 
            className="text-white p-6 relative overflow-hidden"
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

            <div className="p-8 space-y-8 flex-grow flex flex-col">
              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-8">
                {/* Company Info */}
                <div className="rounded-[2rem] p-6 border-2 border-[#f1f5f9] relative overflow-hidden group hover:border-[#2563eb]/20 transition-all shadow-sm" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#2563eb]/5 rounded-bl-[4rem] -z-0"></div>
                  <h3 className="font-black text-[#0f172a] mb-5 pb-3 border-b-2 border-[#e2e8f0] flex items-center gap-3 text-sm relative z-10">
                    <div className="w-2 h-5 bg-[#2563eb] rounded-full"></div>
                    بيانات البائع <span className="text-[10px] text-slate-400 font-bold opacity-50">Seller Details</span>
                  </h3>
                  <div className="space-y-3 text-[12px] relative z-10">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[#64748b] font-bold">اسم الشركة:</span>
                      <span className="font-black text-[#0f172a] text-right">{creditNote.company_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-y border-dashed border-slate-200">
                      <span className="text-[#64748b] font-bold">السجل التجاري:</span>
                      <span className="font-black text-[#0f172a] tracking-wider">{creditNote.company_cr || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748b] font-bold">الرقم الضريبي:</span>
                      <span className="font-black text-[#2563eb] text-sm">{creditNote.company_vat}</span>
                    </div>
                    <div className="flex justify-start gap-3 mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[#64748b] font-bold whitespace-nowrap">العنوان:</span>
                      <span className="font-bold text-[#0f172a] leading-relaxed text-right text-[11px]">{creditNote.company_address}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="rounded-[2rem] p-6 border-2 border-[#f1f5f9] relative overflow-hidden group hover:border-[#059669]/20 transition-all shadow-sm" style={{ backgroundColor: '#f8fafc' }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#059669]/5 rounded-bl-[4rem] -z-0"></div>
                  <h3 className="font-black text-[#0f172a] mb-5 pb-3 border-b-2 border-[#e2e8f0] flex items-center gap-3 text-sm relative z-10">
                    <div className="w-2 h-5 bg-[#059669] rounded-full"></div>
                    بيانات العميل <span className="text-[10px] text-slate-400 font-bold opacity-50">Customer Details</span>
                  </h3>
                  <div className="space-y-3 text-[12px] relative z-10">
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-[#64748b] font-bold">اسم العميل:</span>
                      <span className="font-black text-[#0f172a] text-right">{creditNote.client_name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-y border-dashed border-slate-200">
                      <span className="text-[#64748b] font-bold">السجل التجاري:</span>
                      <span className="font-black text-[#0f172a] tracking-wider">{creditNote.client_cr || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748b] font-bold">الرقم الضريبي:</span>
                      <span className="font-black text-[#059669] text-sm">{creditNote.client_vat || '-'}</span>
                    </div>
                    <div className="flex justify-start gap-3 mt-2 pt-2 border-t border-slate-100">
                      <span className="text-[#64748b] font-bold whitespace-nowrap">العنوان:</span>
                      <span className="font-bold text-[#0f172a] leading-relaxed text-right text-[11px]">{creditNote.client_address || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reference Invoice Info */}
              <div className="bg-[#1e293b] p-6 rounded-[2rem] border-2 border-slate-200 flex flex-wrap gap-8 items-center justify-between relative overflow-hidden shadow-lg shadow-slate-200/50">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/10 to-transparent opacity-50"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                    <FileText size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">مرجع الفاتورة الأصلية</p>
                    <p className="text-xl font-black text-white">{creditNote.invoice_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                    <Calendar size={24} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">تاريخ الفاتورة</p>
                    <p className="text-lg font-black text-white">{formatDate(creditNote.invoice_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                    <Calculator size={24} className="text-green-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الفاتورة</p>
                    <p className="text-lg font-black text-white">{parseFloat(creditNote.invoice_total_amount).toLocaleString()} <span className="text-xs font-normal opacity-50">ريال</span></p>
                  </div>
                </div>
              </div>

            {/* Reason */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} className="text-amber-500" />
                سبب إصدار الإشعار
              </h3>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 min-h-[80px] italic text-slate-600 font-medium text-[13px]">
                {creditNote.reason}
              </div>
            </div>

            {/* Amount Table */}
            <div className="rounded-xl border border-[#f1f5f9] overflow-hidden shadow-sm">
              <table className="w-full text-[11px] border-collapse">
                <thead style={{ background: '#1e293b', color: '#ffffff' }}>
                  <tr>
                    <th className="px-3 py-3 text-right font-bold">الوصف</th>
                    <th className="px-3 py-3 text-center font-bold">قبل الضريبة</th>
                    <th className="px-3 py-3 text-center font-bold">الضريبة 15%</th>
                    <th className="px-3 py-3 text-center font-bold">الإجمالي المسترجع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] bg-white">
                  <tr>
                    <td className="px-3 py-4 font-bold text-[#0f172a]">
                      مبلغ إشعار الدائن المسترجع
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">خصم من الفاتورة رقم {creditNote.invoice_number}</p>
                    </td>
                    <td className="px-3 py-4 text-center font-medium">{parseFloat(creditNote.total_before_vat).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</td>
                    <td className="px-3 py-4 text-center text-[#2563eb] font-bold">{parseFloat(creditNote.vat_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</td>
                    <td className="px-3 py-4 text-center font-black text-red-600 text-[14px]">{parseFloat(creditNote.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary and QR Section */}
            <div className="grid grid-cols-2 gap-6 items-stretch mt-auto">
              {/* Summary Box */}
              <div 
                className="rounded-2xl p-5 border border-[#f1f5f9] flex flex-col justify-between"
                style={{ background: '#f8fafc' }}
              >
                <div>
                  <h3 className="font-black text-[#0f172a] mb-3 flex items-center gap-2 text-[13px]">
                    <CreditCard size={16} className="text-[#2563eb]" />
                    ملخص الإشعار
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#e2e8f0]">
                      <span className="text-[#64748b] text-[11px]">قبل الضريبة:</span>
                      <span className="font-bold text-[#0f172a] text-[11px]">{parseFloat(creditNote.total_before_vat).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-dashed border-[#e2e8f0]">
                      <span className="text-[#64748b] text-[11px]">الضريبة 15%:</span>
                      <span className="font-bold text-[#2563eb] text-[11px]">{parseFloat(creditNote.vat_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</span>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="flex justify-between items-center py-3 px-4 rounded-xl mt-4 shadow-md"
                  style={{ background: '#dc2626' }}
                >
                  <span className="font-black text-white text-[12px]">الإجمالي المسترجع:</span>
                  <span className="font-black text-[14px] text-white">
                    {parseFloat(creditNote.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
                  </span>
                </div>
              </div>

              {/* QR and Compliance */}
              <div className="rounded-2xl p-5 border border-[#f1f5f9] bg-white text-center flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="font-black text-[#0f172a] mb-3 flex items-center justify-center gap-2 text-[13px]">
                    <QrCode size={16} className="text-[#2563eb]" />
                    باركود ZATCA
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
                  <p className="text-[9px] font-bold text-slate-400">
                    مستند ضريبي معتمد - المرحلة الأولى
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance Footer */}
            <div className="pt-6 border-t border-[#f1f5f9]">
              <p className="text-[10px] text-center text-slate-400 font-medium">
                هذا المستند تم إنشاؤه آلياً وهو متوافق مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
