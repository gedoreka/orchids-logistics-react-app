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
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            <CheckCircle size={12} />
            مدفوعة
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
            <FileEdit size={12} />
            مسودة
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
            <Clock size={12} />
            مستحقة
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-6">
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-4 left-1/2 z-50 px-6 py-3 rounded-xl shadow-lg ${
              notification.type === "success" ? "bg-emerald-500" : "bg-red-500"
            } text-white font-bold flex items-center gap-2`}
          >
            {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                <FileText className="h-8 w-8" />
                الفواتير الضريبية
              </h1>
              <p className="text-white/80 mt-1">إدارة وعرض جميع فواتير المبيعات الضريبية</p>
            </div>
            <Link href="/sales-invoices/new">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-lg hover:shadow-xl">
                <Plus size={20} />
                إنشاء فاتورة جديدة
              </button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">إجمالي الفواتير</p>
                <p className="text-xl font-black text-gray-900">{stats.totalSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</p>
                <p className="text-xs text-gray-400">قيمة الفواتير قبل الضريبة</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">ضريبة مدفوعة</p>
                <p className="text-xl font-black text-emerald-600">{stats.totalPaidTax.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</p>
                <p className="text-xs text-gray-400">{stats.paidCount} فاتورة</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">ضريبة مستحقة</p>
                <p className="text-xl font-black text-amber-600">{stats.totalDueTax.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</p>
                <p className="text-xs text-gray-400">{stats.dueCount} فاتورة</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                <FileEdit size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">مسودات</p>
                <p className="text-xl font-black text-gray-600">{stats.totalDraft.toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال</p>
                <p className="text-xs text-gray-400">{stats.draftCount} فاتورة</p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Luxurious Header */}
          <div className="bg-gradient-to-r from-[#1e293b] to-[#334155] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <FileText className="text-white h-5 w-5" />
              </div>
              <div>
                <h2 className="text-white font-black text-lg">قائمة الفواتير</h2>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded-md text-[10px] font-bold border border-blue-500/30">
                    {filteredInvoices.length} فاتورة
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-white/20 outline-none transition-all text-sm text-white placeholder:text-gray-400"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 outline-none text-sm text-white cursor-pointer"
              >
                <option value="all" className="text-gray-900">جميع الحالات</option>
                <option value="paid" className="text-gray-900">مدفوعة</option>
                <option value="due" className="text-gray-900">مستحقة</option>
                <option value="draft" className="text-gray-900">مسودة</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="text-right px-4 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">رقم الفاتورة</th>
                  <th className="text-right px-4 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">اسم العميل</th>
                  <th className="text-right px-4 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">تاريخ الإصدار</th>
                  <th className="text-right px-4 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">تاريخ الاستحقاق</th>
                  <th className="text-right px-4 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">الإجمالي</th>
                  <th className="text-right px-4 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">الضريبة</th>
                  <th className="text-right px-4 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">الحالة</th>
                  <th className="text-center px-4 py-4 font-black text-gray-500 text-xs uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-20">
                      <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-bold">لا توجد فواتير مطابقة للبحث</p>
                      <p className="text-gray-400 text-xs mt-1">جرب تغيير معايير البحث أو الفلترة</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const status = inv.invoice_status || inv.status || 'due';
                    return (
                      <tr key={inv.id} className="group hover:bg-blue-50/40 transition-all">
                        <td className="px-4 py-4 font-black text-gray-900">{inv.invoice_number}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 truncate max-w-[200px]">{inv.client_name || '-'}</span>
                            {inv.client_vat && <span className="text-[10px] text-gray-400 font-medium">ضريبة: {inv.client_vat}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-600 font-medium">{inv.issue_date || '-'}</td>
                        <td className="px-4 py-4 text-gray-600 font-medium">{inv.due_date || '-'}</td>
                        <td className="px-4 py-4">
                          <span className="font-black text-gray-900">
                            {parseFloat(String(inv.total_amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-bold text-gray-600">
                            {parseFloat(String(inv.tax_amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })} ريال
                          </span>
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(status)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* عرض الفاتورة / المسودة */}
                            <Link href={`/sales-invoices/${inv.id}`}>
                              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-all shadow-sm hover:shadow-md font-bold text-xs min-w-[110px] justify-center">
                                <Eye size={14} />
                                {status === 'draft' ? "عرض المسودة" : "عرض الفاتورة"}
                              </button>
                            </Link>

                            {/* سداد المبلغ الضريبي */}
                            {status === 'due' && (
                              <button
                                onClick={() => handleTogglePayment(inv.id, status)}
                                disabled={loading === inv.id}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#10b981] text-white hover:bg-[#059669] transition-all shadow-sm hover:shadow-md font-bold text-xs min-w-[130px] justify-center disabled:opacity-50"
                              >
                                {loading === inv.id ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                                سداد المبلغ الضريبي
                              </button>
                            )}

                            {/* إعادة كمستحقة */}
                            {status === 'paid' && (
                              <button
                                onClick={() => handleTogglePayment(inv.id, status)}
                                disabled={loading === inv.id}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f59e0b] text-white hover:bg-[#d97706] transition-all shadow-sm hover:shadow-md font-bold text-xs min-w-[130px] justify-center disabled:opacity-50"
                              >
                                {loading === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                                إعادة كمستحقة
                              </button>
                            )}

                            {/* حذف الفاتورة */}
                            <button
                              onClick={() => handleDelete(inv.id, status)}
                              disabled={loading === inv.id}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all shadow-sm hover:shadow-md font-bold text-xs min-w-[70px] justify-center disabled:opacity-50"
                            >
                              {loading === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              حذف
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

          <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <p className="text-xs font-bold text-gray-500">
              إجمالي المعروض: {filteredInvoices.length} من {invoices.length} فاتورة
            </p>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
