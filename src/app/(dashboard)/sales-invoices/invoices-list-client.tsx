"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Plus,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  FileEdit,
  DollarSign,
  Calendar,
  Users,
  AlertCircle,
  Loader2,
  Filter,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_month: string;
  client_id: number;
  client_name: string;
  client_vat: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  vat_total: number;
  status: string;
  subtotal: number;
  tax_amount: number;
  invoice_status: string;
}

interface InvoicesListClientProps {
  invoices: Invoice[];
}

export function InvoicesListClient({ invoices }: InvoicesListClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState<number | null>(null);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: "success" | "error";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const stats = useMemo(() => {
    let totalSubtotal = 0;
    let totalPaidTax = 0;
    let totalDueTax = 0;
    let totalDraft = 0;
    let paidCount = 0;
    let dueCount = 0;
    let draftCount = 0;

    invoices.forEach((inv) => {
      const subtotal = parseFloat(String(inv.subtotal)) || 0;
      const taxAmount = parseFloat(String(inv.tax_amount)) || 0;
      const total = parseFloat(String(inv.total_amount)) || 0;
      const status = inv.invoice_status || inv.status || 'due';

      totalSubtotal += subtotal;

      if (status === 'paid') {
        totalPaidTax += taxAmount;
        paidCount++;
      } else if (status === 'draft') {
        totalDraft += total;
        draftCount++;
      } else {
        totalDueTax += taxAmount;
        dueCount++;
      }
    });

    return {
      totalSubtotal,
      totalPaidTax,
      totalDueTax,
      totalDraft,
      paidCount,
      dueCount,
      draftCount,
      totalCount: invoices.length
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const status = inv.invoice_status || inv.status || 'due';
      const matchesSearch = 
        inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "all" || status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [invoices, searchQuery, filterStatus]);

  const handleTogglePayment = async (invoiceId: number, currentStatus: string) => {
    setLoading(invoiceId);
    try {
      const res = await fetch(`/api/sales-invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_payment" })
      });

      const data = await res.json();

      if (data.success) {
        setNotification({ show: true, type: "success", message: data.message });
        router.refresh();
      } else {
        setNotification({ show: true, type: "error", message: data.error || "حدث خطأ" });
      }
    } catch {
      setNotification({ show: true, type: "error", message: "حدث خطأ في الاتصال" });
    } finally {
      setLoading(null);
      setTimeout(() => setNotification({ show: false, type: "success", message: "" }), 3000);
    }
  };

  const handleDelete = async (invoiceId: number, status: string) => {
    if (status !== 'draft') {
      setNotification({ show: true, type: "error", message: "لا يمكن حذف الفاتورة إلا إذا كانت مسودة" });
      setTimeout(() => setNotification({ show: false, type: "success", message: "" }), 3000);
      return;
    }

    if (!confirm("هل أنت متأكد من حذف هذه الفاتورة؟")) return;

    setLoading(invoiceId);
    try {
      const res = await fetch(`/api/sales-invoices/${invoiceId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setNotification({ show: true, type: "success", message: data.message });
        router.refresh();
      } else {
        setNotification({ show: true, type: "error", message: data.error || "حدث خطأ" });
      }
    } catch {
      setNotification({ show: true, type: "error", message: "حدث خطأ في الاتصال" });
    } finally {
      setLoading(null);
      setTimeout(() => setNotification({ show: false, type: "success", message: "" }), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            مدفوعة
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
            مسودة
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
            مستحقة
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 font-sans">
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl ${
              notification.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            } text-white font-bold flex items-center gap-3 border border-white/20 backdrop-blur-md`}
          >
            {notification.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Statistics Cards - Compact & Fluid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "إجمالي المبيعات", value: stats.totalSubtotal, sub: "قبل الضريبة", icon: FileText, color: "blue" },
            { label: "ضريبة مدفوعة", value: stats.totalPaidTax, sub: `${stats.paidCount} فاتورة`, icon: CheckCircle, color: "emerald" },
            { label: "ضريبة مستحقة", value: stats.totalDueTax, sub: `${stats.dueCount} فاتورة`, icon: Clock, color: "amber" },
            { label: "المسودات", value: stats.totalDraft, sub: `${stats.draftCount} فاتورة`, icon: FileEdit, color: "slate" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-black text-slate-900 truncate">
                    {stat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-[10px] text-slate-400 mr-1">ريال</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          {/* Enhanced Header */}
          <div className="p-4 border-b border-slate-50 flex flex-col lg:flex-row items-center justify-between gap-4 bg-white">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <FileText size={20} />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight">الفواتير الضريبية</h1>
                <p className="text-[11px] text-slate-400 font-medium">إدارة فواتير المبيعات وتحصيل الضرائب</p>
              </div>
              <div className="mr-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <span className="text-[11px] font-black text-slate-600">{filteredInvoices.length} سجل</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث برقم الفاتورة أو العميل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900/5 transition-all text-xs font-medium placeholder:text-slate-400"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-slate-900/5 outline-none text-xs font-bold text-slate-600 cursor-pointer appearance-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="paid">مدفوعة</option>
                <option value="due">مستحقة</option>
                <option value="draft">مسودة</option>
              </select>

              <Link href="/sales-invoices/new">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md hover:shadow-xl font-bold text-xs">
                  <Plus size={16} />
                  فاتورة جديدة
                </button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">رقم الفاتورة</th>
                  <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">العميل</th>
                  <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">تاريخ الإصدار</th>
                  <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">تاريخ الاستحقاق</th>
                  <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">الإجمالي</th>
                  <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">الضريبة</th>
                  <th className="text-right px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">الحالة</th>
                  <th className="text-center px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Search size={24} className="text-slate-200" />
                      </div>
                      <p className="text-xs font-bold text-slate-400">لا توجد نتائج مطابقة</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const status = inv.invoice_status || inv.status || 'due';
                    return (
                      <tr key={inv.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-xs font-black text-slate-900">{inv.invoice_number}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700 max-w-[180px] truncate">{inv.client_name || '-'}</span>
                            {inv.client_vat && <span className="text-[9px] text-slate-400 font-medium">VAT: {inv.client_vat}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-[11px] font-bold text-slate-500">{inv.issue_date || '-'}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-[11px] font-bold text-slate-500">{inv.due_date || '-'}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-xs font-black text-slate-900">
                            {parseFloat(String(inv.total_amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            <span className="text-[9px] text-slate-400 mr-1 font-bold">ريال</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-500">
                            {parseFloat(String(inv.tax_amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">{getStatusBadge(status)}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/sales-invoices/${inv.id}`}>
                              <button className="h-8 px-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all font-bold text-[11px] flex items-center gap-1.5 border border-blue-100">
                                <Eye size={12} />
                                {status === 'draft' ? "عرض المسودة" : "عرض الفاتورة"}
                              </button>
                            </Link>

                            {status === 'due' && (
                              <button
                                onClick={() => handleTogglePayment(inv.id, status)}
                                disabled={loading === inv.id}
                                className="h-8 px-3 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all font-bold text-[11px] flex items-center gap-1.5 border border-emerald-100 disabled:opacity-50"
                              >
                                {loading === inv.id ? <Loader2 size={12} className="animate-spin" /> : <DollarSign size={12} />}
                                سداد المبلغ الضريبي
                              </button>
                            )}

                            {status === 'paid' && (
                              <button
                                onClick={() => handleTogglePayment(inv.id, status)}
                                disabled={loading === inv.id}
                                className="h-8 px-3 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all font-bold text-[11px] flex items-center gap-1.5 border border-amber-100 disabled:opacity-50"
                              >
                                {loading === inv.id ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                                إعادة كمستحقة
                              </button>
                            )}

                            <button
                              onClick={() => handleDelete(inv.id, status)}
                              disabled={loading === inv.id}
                              className="h-8 w-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all border border-rose-100 disabled:opacity-50"
                              title="حذف"
                            >
                              {loading === inv.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/30 flex justify-between items-center border-t border-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              نظام الفواتير الضريبية المعتمد
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400">ZATCA COMPLIANT</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <div className="w-1 h-1 rounded-full bg-slate-400"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
