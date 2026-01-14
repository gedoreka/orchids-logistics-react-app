"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Search, 
  FileText, 
  Eye, 
  FileDown, 
  XCircle,
  TrendingDown,
  Percent,
  History,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface CreditNote {
  id: number;
  credit_note_number: string;
  invoice_number: string;
  client_name: string;
  reason: string;
  total_amount: string | number;
  vat_amount: string | number;
  created_at: string;
  status: 'active' | 'cancelled';
  invoice_status: string;
}

interface CreditNotesListClientProps {
  creditNotes: CreditNote[];
}

export function CreditNotesListClient({ creditNotes: initialNotes }: CreditNotesListClientProps) {
  const [creditNotes, setCreditNotes] = useState(initialNotes);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNotes = creditNotes.filter(note => 
    note.credit_note_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeNotes = creditNotes.filter(n => n.status === 'active');
  const totalAmount = activeNotes.reduce((sum, n) => sum + parseFloat(String(n.total_amount)), 0);
  const totalVat = activeNotes.reduce((sum, n) => sum + parseFloat(String(n.vat_amount)), 0);

  const handleCancel = async (id: number) => {
    if (!confirm("هل أنت متأكد من إلغاء إشعار الدائن هذا؟")) return;

    try {
      const res = await fetch(`/api/credit-notes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success("تم إلغاء إشعار الدائن بنجاح");
        setCreditNotes(prev => prev.map(n => n.id === id ? { ...n, status: 'cancelled' } : n));
      } else {
        toast.error(data.error || "فشل إلغاء إشعار الدائن");
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1e293b]">إشعارات الدائن الضريبية</h1>
          <p className="text-[#64748b] font-bold text-sm mt-1">إدارة المبالغ المخصصة والمرتجعة للعملاء</p>
        </div>
        <Link href="/credit-notes/new">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-[#2c3e50] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} />
            <span>إنشاء إشعار دائن جديد</span>
          </motion.button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="إجمالي المرتجعات" 
          value={`${totalAmount.toLocaleString()} ريال`}
          subtitle={`${activeNotes.length} إشعار نشط`}
          icon={TrendingDown}
          color="blue"
        />
        <StatCard 
          title="الضريبة المسترجعة" 
          value={`${totalVat.toLocaleString()} ريال`}
          subtitle="ضريبة القيمة المضافة 15%"
          icon={Percent}
          color="emerald"
        />
        <StatCard 
          title="إجمالي الإشعارات" 
          value={creditNotes.length.toString()}
          subtitle={`${creditNotes.length - activeNotes.length} ملغاة`}
          icon={History}
          color="amber"
        />
        <StatCard 
          title="الحالة الضريبية" 
          value="متوافق"
          subtitle="نظام ZATCA"
          icon={AlertCircle}
          color="slate"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="البحث برقم الإشعار، العميل، أو رقم الفاتورة..."
              className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-black text-slate-600">
              {filteredNotes.length} إشعار
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">رقم الإشعار</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الفاتورة</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">العميل</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">السبب</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">المبلغ</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">التاريخ</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">الحالة</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotes.map((note) => (
                <motion.tr
                  key={note.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-black text-slate-900 text-sm">{note.credit_note_number}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700 text-sm">{note.invoice_number}</span>
                      <span className="text-[10px] text-slate-400 font-black">{note.invoice_status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-slate-700 text-sm">{note.client_name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-slate-500 text-sm truncate max-w-[200px] block font-medium" title={note.reason}>
                      {note.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-black text-red-600 text-sm">{parseFloat(String(note.total_amount)).toLocaleString()} ريال</span>
                      <span className="text-[10px] text-slate-400 font-bold">شامل الضريبة</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-slate-500 font-bold text-xs">
                      {note.created_at ? format(new Date(note.created_at), 'yyyy-MM-dd', { locale: ar }) : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StatusBadge status={note.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/credit-notes/${note.id}`}>
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="عرض التفاصيل">
                          <Eye size={18} />
                        </button>
                      </Link>
                      <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="تحميل PDF">
                        <FileDown size={18} />
                      </button>
                      {note.status === 'active' && (
                        <button 
                          onClick={() => handleCancel(note.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="إلغاء الإشعار"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredNotes.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText size={48} className="text-slate-200" />
                      <p className="text-slate-500 font-bold">لا توجد إشعارات دائنة مطابقة للبحث</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100"
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
      <div className={cn("p-3 rounded-xl border", colors[color])}>
        <Icon size={24} />
      </div>
      <div className="flex flex-col">
        <span className="text-slate-500 font-bold text-xs">{title}</span>
        <span className="text-xl font-black text-slate-900 mt-1">{value}</span>
        <span className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-wider">{subtitle}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'active' | 'cancelled' }) {
  if (status === 'active') {
    return (
      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black border border-emerald-100">
        نشط
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black border border-slate-200">
      ملغي
    </span>
  );
}
