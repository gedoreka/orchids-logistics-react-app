"use client";

import React from "react";
import { 
  ArrowRight, 
  Printer, 
  Download, 
  Building2, 
  User, 
  FileText, 
  Calculator,
  Calendar,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CreditNoteViewClientProps {
  creditNote: any;
  qrData: string;
}

export function CreditNoteViewClient({ creditNote, qrData }: CreditNoteViewClientProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-6 overflow-y-auto bg-slate-50/50 print:bg-white print:p-0">
      {/* Header - Hidden in Print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/credit-notes">
            <button className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-slate-500">
              <ArrowRight size={20} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#1e293b]">عرض إشعار الدائن</h1>
            <p className="text-[#64748b] font-bold text-sm">تفاصيل المستند الضريبي رقم {creditNote.credit_note_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="bg-white text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={18} />
            <span>طباعة</span>
          </button>
          <button className="bg-[#2c3e50] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20">
            <Download size={18} />
            <span>تحميل PDF</span>
          </button>
        </div>
      </div>

      {/* Credit Note Document */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none max-w-4xl mx-auto w-full">
        {/* Document Header */}
        <div className="bg-[#2c3e50] text-white p-8 lg:p-12 relative overflow-hidden print:bg-slate-100 print:text-slate-900">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl print:hidden" />
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 p-2.5 rounded-xl">
                  <FileText size={24} className="text-white" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight">إشعار دائن ضريبي</h2>
              </div>
              <div className="space-y-1">
                <p className="text-blue-200 font-bold text-sm print:text-slate-500">رقم الإشعار: <span className="text-white print:text-slate-900">{creditNote.credit_note_number}</span></p>
                <p className="text-blue-200 font-bold text-sm print:text-slate-500">تاريخ الإصدار: <span className="text-white print:text-slate-900">{format(new Date(creditNote.created_at), 'yyyy-MM-dd HH:mm', { locale: ar })}</span></p>
                {creditNote.status === 'cancelled' && (
                  <div className="flex items-center gap-1.5 text-red-400 font-black text-xs uppercase mt-2 bg-red-500/10 px-3 py-1 rounded-full w-fit">
                    <AlertTriangle size={12} />
                    <span>تم إلغاء هذا الإشعار</span>
                  </div>
                )}
              </div>
            </div>

            {creditNote.company_logo && (
              <img 
                src={creditNote.company_logo} 
                alt="Logo" 
                className="h-16 lg:h-20 object-contain bg-white p-2 rounded-xl"
              />
            )}
          </div>
        </div>

        {/* Document Body */}
        <div className="p-8 lg:p-12 space-y-12">
          {/* Parties Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building2 size={16} className="text-blue-600" />
                بيانات البائع
              </h3>
              <div className="space-y-2">
                <p className="font-black text-slate-900 text-lg">{creditNote.company_name}</p>
                <p className="text-slate-600 font-bold text-sm">{creditNote.company_address}</p>
                <p className="text-slate-600 font-bold text-sm">الرقم الضريبي: {creditNote.company_vat}</p>
                <p className="text-slate-600 font-bold text-sm">الهاتف: {creditNote.company_phone}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                <User size={16} className="text-blue-600" />
                بيانات العميل
              </h3>
              <div className="space-y-2">
                <p className="font-black text-slate-900 text-lg">{creditNote.client_name}</p>
                <p className="text-slate-600 font-bold text-sm">{creditNote.client_address}</p>
                <p className="text-slate-600 font-bold text-sm">الرقم الضريبي: {creditNote.client_vat}</p>
                {creditNote.client_email && <p className="text-slate-600 font-bold text-sm">{creditNote.client_email}</p>}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-wrap gap-8 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <FileText size={18} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">الفاتورة الأصلية</p>
                <p className="text-sm font-black text-slate-700">{creditNote.invoice_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <Calendar size={18} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">تاريخ الفاتورة</p>
                <p className="text-sm font-black text-slate-700">
                  {creditNote.invoice_date ? format(new Date(creditNote.invoice_date), 'yyyy-MM-dd', { locale: ar }) : '-'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <Calculator size={18} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">قيمة الفاتورة</p>
                <p className="text-sm font-black text-slate-700">{parseFloat(creditNote.invoice_total_amount).toLocaleString()} ريال</p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">سبب إصدار الإشعار</h3>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 min-h-[100px] italic text-slate-600 font-medium">
              {creditNote.reason}
            </div>
          </div>

          {/* Totals Table */}
          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">تفاصيل المبلغ</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الوصف</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">قبل الضريبة</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">الضريبة (15%)</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-6 py-6 font-bold text-slate-700 text-sm">
                      مبلغ إشعار الدائن المسترجع
                      <p className="text-[10px] text-slate-400 font-black mt-1">خصم من الفاتورة رقم {creditNote.invoice_number}</p>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="font-bold text-slate-600 text-sm">{parseFloat(creditNote.total_before_vat).toLocaleString()} ريال</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="font-bold text-slate-600 text-sm">{parseFloat(creditNote.vat_amount).toLocaleString()} ريال</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="font-black text-red-600 text-lg">{parseFloat(creditNote.total_amount).toLocaleString()} ريال</span>
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-black">
                    <td colSpan={3} className="px-6 py-4 text-left text-slate-500 text-sm uppercase">إجمالي المبلغ المستحق للعميل</td>
                    <td className="px-6 py-4 text-center text-red-600 text-xl">{parseFloat(creditNote.total_amount).toLocaleString()} ريال</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer & QR */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 pt-8 border-t border-slate-100">
            <div className="space-y-4 max-w-md">
              <p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed">
                هذا المستند تم إنشاؤه آلياً وهو متوافق مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) للمرحلة الأولى من الربط الإلكتروني.
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`}
                alt="ZATCA QR Code"
                className="w-32 h-32"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase">رمز التحقق الضريبي</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
