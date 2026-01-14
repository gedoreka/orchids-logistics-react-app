"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  Loader2,
  DollarSign,
  User
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Quotation {
  id: number;
  quotation_number: string;
  client_name: string;
  client_vat: string;
  issue_date: string;
  due_date: string;
  expiry_date: string;
  total_amount: number;
  status: string;
}

interface QuotationsClientProps {
  quotations: Quotation[];
  stats: {
    total: number;
    confirmed: number;
    draft: number;
    expired: number;
  };
  companyId: number;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function QuotationsClient({ quotations: initialQuotations, stats, companyId }: QuotationsClientProps) {
  const [quotations, setQuotations] = useState(initialQuotations);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });
  const router = useRouter();

  const filteredQuotations = quotations.filter(q => {
    const search = searchTerm.toLowerCase();
    return (
      q.quotation_number?.toLowerCase().includes(search) ||
      q.client_name?.toLowerCase().includes(search)
    );
  });

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    if (type !== "loading") {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    }
  };

  const handleDelete = async (id: number, quotationNumber: string) => {
    if (!confirm(`هل أنت متأكد من حذف عرض السعر "${quotationNumber}"؟`)) return;
    
    setDeleteLoading(id);
    showNotification("loading", "جاري الحذف", "جاري حذف عرض السعر...");
    
    try {
      const res = await fetch(`/api/quotations/${id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setQuotations(prev => prev.filter(q => q.id !== id));
        showNotification("success", "تم الحذف بنجاح", "تم حذف عرض السعر بنجاح");
        router.refresh();
      } else {
        showNotification("error", "فشل الحذف", "فشل حذف عرض السعر");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحذف");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusBadge = (status: string, expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (status === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
          <CheckCircle size={10} />
          مؤكد
        </span>
      );
    } else if (expiry < today) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold">
          <Clock size={10} />
          منتهي
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-xs font-bold">
          <Edit size={10} />
          مسودة
        </span>
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => notification.type !== "loading" && setNotification(prev => ({ ...prev, show: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <div className={`bg-white rounded-3xl p-8 shadow-2xl border-t-4 ${
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-red-500" : "border-blue-500"
              }`}>
                <div className="text-center">
                  <div className={`h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                    notification.type === "success" ? "bg-emerald-100 text-emerald-500" :
                    notification.type === "error" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
                  }`}>
                    {notification.type === "success" && <CheckCircle size={40} />}
                    {notification.type === "error" && <AlertCircle size={40} />}
                    {notification.type === "loading" && <Loader2 size={40} className="animate-spin" />}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{notification.title}</h3>
                  <p className="text-gray-500 mb-6">{notification.message}</p>
                  {notification.type !== "loading" && (
                    <button
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className={`px-8 py-3 rounded-xl font-bold text-white transition-all ${
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      حسناً
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] rounded-2xl p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">إدارة عروض الأسعار</h1>
                    <p className="text-white/60 text-sm">إنشاء وإدارة عروض الأسعار للعملاء</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black">{stats.total}</div>
                    <div className="text-[10px] text-white/60 font-bold">إجمالي</div>
                  </div>
                  <div className="bg-emerald-500/20 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-emerald-300">{stats.confirmed}</div>
                    <div className="text-[10px] text-white/60 font-bold">مؤكد</div>
                  </div>
                  <div className="bg-amber-500/20 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-amber-300">{stats.draft}</div>
                    <div className="text-[10px] text-white/60 font-bold">مسودة</div>
                  </div>
                  <div className="bg-red-500/20 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-red-300">{stats.expired}</div>
                    <div className="text-[10px] text-white/60 font-bold">منتهي</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="بحث برقم العرض أو اسم العميل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href="/quotations/new">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">
                    <Plus size={16} />
                    <span>إنشاء عرض سعر</span>
                  </button>
                </Link>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all">
                  <FileSpreadsheet size={16} />
                  <span>تصدير</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <FileText size={18} />
                <h3 className="font-bold text-sm">قائمة عروض الأسعار</h3>
              </div>
              <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold">
                {filteredQuotations.length} عرض
              </span>
            </div>

            {filteredQuotations.length > 0 ? (
              <div className="overflow-x-auto max-h-[calc(100vh-450px)]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="border-b border-gray-100">
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">رقم العرض</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">العميل</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">تاريخ الإصدار</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">تاريخ الانتهاء</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">الإجمالي</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">الحالة</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredQuotations.map((quotation) => (
                      <tr 
                        key={quotation.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <code className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold">
                            {quotation.quotation_number}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                              <User size={14} />
                            </div>
                            <span className="font-bold text-gray-900 text-sm">
                              {quotation.client_name || "غير محدد"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Calendar size={12} />
                            {quotation.issue_date ? format(new Date(quotation.issue_date), 'yyyy/MM/dd') : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Clock size={12} />
                            {quotation.due_date ? format(new Date(quotation.due_date), 'yyyy/MM/dd') : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                            <DollarSign size={14} />
                            {Number(quotation.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            <span className="text-xs text-gray-400">ر.س</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(quotation.status, quotation.expiry_date || quotation.due_date)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/quotations/${quotation.id}`}>
                              <button className="h-7 w-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all" title="عرض">
                                <Eye size={14} />
                              </button>
                            </Link>
                            <Link href={`/quotations/${quotation.id}/edit`}>
                              <button className="h-7 w-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all" title="تعديل">
                                <Edit size={14} />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(quotation.id, quotation.quotation_number)}
                              disabled={deleteLoading === quotation.id}
                              className="h-7 w-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                              title="حذف"
                            >
                              {deleteLoading === quotation.id ? (
                                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                <h4 className="text-lg font-bold text-gray-600 mb-2">لا توجد عروض أسعار</h4>
                <p className="text-gray-400 text-sm mb-4">ابدأ بإنشاء أول عرض سعر</p>
                <Link href="/quotations/new">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">
                    <Plus size={16} />
                    <span>إنشاء عرض سعر</span>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
