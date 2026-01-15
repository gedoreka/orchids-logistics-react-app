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
  CreditCard,
  ArrowRight,
  LayoutDashboard,
  RefreshCw,
  Download,
  ChevronDown,
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
  BarChart3,
  Receipt,
  Building2,
  ArrowUpRight,
  XCircle,
  Banknote
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
  const [showExportMenu, setShowExportMenu] = useState(false);
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
    const configs: Record<string, { bg: string; icon: React.ReactNode; label: string; shadow: string }> = {
      paid: {
        bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
        icon: <CheckCircle size={12} />,
        label: 'مدفوعة',
        shadow: 'shadow-emerald-500/30'
      },
      draft: {
        bg: 'bg-gradient-to-r from-slate-400 to-slate-500',
        icon: <FileEdit size={12} />,
        label: 'مسودة',
        shadow: 'shadow-slate-500/30'
      },
      due: {
        bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
        icon: <Clock size={12} />,
        label: 'مستحقة',
        shadow: 'shadow-amber-500/30'
      }
    };

    const config = configs[status] || configs.due;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${config.bg} text-white text-[10px] font-black uppercase shadow-lg ${config.shadow}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const totalPercent = stats.totalCount > 0 ? 100 : 0;
  const paidPercent = stats.totalCount > 0 ? Math.round((stats.paidCount / stats.totalCount) * 100) : 0;
  const duePercent = stats.totalCount > 0 ? Math.round((stats.dueCount / stats.totalCount) * 100) : 0;
  const draftPercent = stats.totalCount > 0 ? Math.round((stats.draftCount / stats.totalCount) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen pb-20">
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl ${
              notification.type === "success" 
                ? "bg-gradient-to-r from-emerald-600 to-green-600" 
                : "bg-gradient-to-r from-rose-600 to-red-600"
            } text-white font-bold flex items-center gap-3 border border-white/20 backdrop-blur-md`}
          >
            {notification.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[1800px] mx-auto px-4 pt-6 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FileText className="text-white" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                <Link href="/dashboard" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                  <LayoutDashboard size={12} />
                  لوحة التحكم
                </Link>
                <ArrowRight size={12} />
                <span className="text-emerald-600">الفواتير الضريبية</span>
              </div>
              <h1 className="text-xl font-black text-gray-900">إدارة الفواتير الضريبية</h1>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-2 flex-wrap"
          >
            <button 
              onClick={() => router.refresh()}
              className="h-11 px-4 rounded-xl bg-white border border-gray-200 text-xs font-black text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <RefreshCw size={15} />
              تحديث
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="h-11 px-5 rounded-xl bg-white border border-gray-200 text-xs font-black text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center gap-2 shadow-sm"
              >
                <Download size={15} />
                تصدير
                <ChevronDown size={14} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute left-0 top-full mt-2 bg-white rounded-xl border border-gray-100 shadow-xl p-2 min-w-[160px] z-50"
                  >
                    <button className="w-full px-4 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors flex items-center gap-2 text-right">
                      <FileText size={14} />
                      تصدير PDF
                    </button>
                    <button className="w-full px-4 py-2.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors flex items-center gap-2 text-right">
                      <FileSpreadsheet size={14} />
                      تصدير Excel
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/sales-invoices/new">
              <button className="h-11 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all flex items-center gap-2">
                <Plus size={15} />
                فاتورة جديدة
              </button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}>
            <StatCard 
              icon={<Receipt size={22} />}
              label="إجمالي المبيعات"
              value={stats.totalSubtotal}
              subLabel="قبل الضريبة"
              gradient="from-slate-600 to-slate-800"
              shadowColor="slate"
              isCurrency
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatCard 
              icon={<CheckCircle size={22} />}
              label="ضريبة مدفوعة"
              value={stats.totalPaidTax}
              subLabel={`${stats.paidCount} فاتورة`}
              gradient="from-emerald-500 to-green-600"
              shadowColor="emerald"
              trend={`${paidPercent}%`}
              trendColor="text-emerald-100"
              isCurrency
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatCard 
              icon={<Clock size={22} />}
              label="ضريبة مستحقة"
              value={stats.totalDueTax}
              subLabel={`${stats.dueCount} فاتورة`}
              gradient="from-amber-500 to-orange-600"
              shadowColor="amber"
              trend={`${duePercent}%`}
              trendColor="text-amber-100"
              isCurrency
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StatCard 
              icon={<FileEdit size={22} />}
              label="المسودات"
              value={stats.totalDraft}
              subLabel={`${stats.draftCount} فاتورة`}
              gradient="from-violet-500 to-purple-600"
              shadowColor="violet"
              trend={`${draftPercent}%`}
              trendColor="text-violet-100"
              isCurrency
            />
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-gray-500">توزيع حالات الفواتير</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] font-bold text-gray-500">مدفوعة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-[10px] font-bold text-gray-500">مستحقة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                <span className="text-[10px] font-bold text-gray-500">مسودة</span>
              </div>
            </div>
          </div>
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            {stats.paidCount > 0 && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${paidPercent}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
              />
            )}
            {stats.dueCount > 0 && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${duePercent}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            )}
            {stats.draftCount > 0 && (
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${draftPercent}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
              />
            )}
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم الفاتورة أو اسم العميل..."
                className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border-2 border-transparent text-sm font-bold focus:border-emerald-500/30 focus:bg-white outline-none transition-all placeholder:text-gray-400"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <FilterButton 
                  active={filterStatus === 'all'} 
                  label="الكل" 
                  count={stats.totalCount}
                  onClick={() => setFilterStatus('all')}
                  color="gray"
                />
                <FilterButton 
                  active={filterStatus === 'paid'} 
                  label="مدفوعة" 
                  count={stats.paidCount}
                  onClick={() => setFilterStatus('paid')}
                  color="green"
                />
                <FilterButton 
                  active={filterStatus === 'due'} 
                  label="مستحقة" 
                  count={stats.dueCount}
                  onClick={() => setFilterStatus('due')}
                  color="amber"
                />
                <FilterButton 
                  active={filterStatus === 'draft'} 
                  label="مسودة" 
                  count={stats.draftCount}
                  onClick={() => setFilterStatus('draft')}
                  color="violet"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <BarChart3 className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black">سجل الفواتير الضريبية</h3>
                  <p className="text-emerald-200 text-xs font-bold">
                    عرض {filteredInvoices.length} فاتورة من أصل {stats.totalCount}
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 text-white/80 text-xs font-bold">
                <Sparkles size={14} />
                متوافق مع هيئة الزكاة والضريبة ZATCA
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider w-16">#</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">رقم الفاتورة</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">العميل</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">تاريخ الإصدار</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">تاريخ الاستحقاق</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">الإجمالي</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider">الضريبة</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">الحالة</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-wider text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <Search size={28} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-bold">لا توجد فواتير تطابق البحث الحالي</p>
                        <button 
                          onClick={() => setFilterStatus('all')}
                          className="text-emerald-600 text-sm font-black hover:underline"
                        >
                          عرض جميع الفواتير
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv, idx) => {
                    const status = inv.invoice_status || inv.status || 'due';
                    return (
                      <motion.tr 
                        key={inv.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * idx }}
                        className="hover:bg-emerald-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-xs font-black text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 bg-emerald-100 rounded-lg text-sm font-black text-emerald-700">
                            {inv.invoice_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Building2 size={16} className="text-gray-500" />
                            </div>
                            <div>
                              <span className="text-sm font-black text-gray-900 block max-w-[180px] truncate">
                                {inv.client_name || '-'}
                              </span>
                              {inv.client_vat && (
                                <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                  VAT: {inv.client_vat}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-sm font-black text-gray-900">
                              {inv.issue_date || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-600">
                            {inv.due_date || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-gray-900">
                            {parseFloat(String(inv.total_amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            <span className="text-[10px] text-gray-400 mr-1 font-bold">ريال</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-emerald-600">
                            {parseFloat(String(inv.tax_amount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            {getStatusBadge(status)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/sales-invoices/${inv.id}`}>
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="h-9 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all font-bold text-[11px] flex items-center gap-1.5"
                              >
                                <Eye size={14} />
                                عرض
                              </motion.button>
                            </Link>

                            {status === 'due' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTogglePayment(inv.id, status)}
                                disabled={loading === inv.id}
                                className="h-9 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-bold text-[11px] flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {loading === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Banknote size={14} />}
                                سداد
                              </motion.button>
                            )}

                            {status === 'paid' && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTogglePayment(inv.id, status)}
                                disabled={loading === inv.id}
                                className="h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 transition-all font-bold text-[11px] flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {loading === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                                إعادة
                              </motion.button>
                            )}

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(inv.id, status)}
                              disabled={loading === inv.id}
                              className="h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white hover:shadow-lg hover:shadow-rose-500/30 transition-all disabled:opacity-50"
                              title="حذف"
                            >
                              {loading === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span>إجمالي الفواتير المعروضة: {filteredInvoices.length}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ZATCA COMPLIANT</span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-emerald-500" />
            <span>نظام الفواتير الضريبية - ZoolSpeed Logistics</span>
          </div>
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, subLabel, gradient, shadowColor, trend, trendColor, isCurrency }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subLabel?: string;
  gradient: string;
  shadowColor: string;
  trend?: string;
  trendColor?: string;
  isCurrency?: boolean;
}) {
  const shadowColors: Record<string, string> = {
    slate: 'shadow-slate-500/20',
    emerald: 'shadow-emerald-500/30',
    amber: 'shadow-amber-500/30',
    violet: 'shadow-violet-500/30'
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg ${shadowColors[shadowColor]}`}>
      <div className="flex items-start justify-between">
        <div className="text-white/90">{icon}</div>
        {trend && (
          <span className={`text-[10px] font-black ${trendColor || 'text-white/70'} bg-white/10 px-2 py-0.5 rounded-full`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-white/70 text-[10px] font-black uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-white mt-1">
          {isCurrency ? value.toLocaleString('en-US', { minimumFractionDigits: 2 }) : value}
          {isCurrency && <span className="text-sm text-white/70 mr-1">ريال</span>}
        </p>
        {subLabel && <p className="text-white/60 text-[10px] font-bold mt-1">{subLabel}</p>}
      </div>
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );
}

function FilterButton({ active, label, count, onClick, color }: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
  color: string;
}) {
  const activeColors: Record<string, string> = {
    gray: 'bg-gray-900 text-white',
    green: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white',
    violet: 'bg-violet-500 text-white'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
        active 
        ? activeColors[color]
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
        active ? 'bg-white/20' : 'bg-gray-200 text-gray-500'
      }`}>
        {count}
      </span>
    </button>
  );
}
