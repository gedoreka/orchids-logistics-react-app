"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt, 
  Plus, 
  Search, 
  Eye,
  Trash2,
  Calendar,
  Link as LinkIcon,
  Unlink,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Loader2,
  DollarSign,
  User,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface SalesReceipt {
  id: number;
  receipt_number: string;
  client_name: string;
  invoice_id: number | null;
  invoice_number: string | null;
  receipt_date: string;
  amount: number;
  notes: string;
  created_by: string;
}

interface SalesReceiptsClientProps {
  receipts: SalesReceipt[];
  stats: {
    total: number;
    total_amount: number;
    linked: number;
    unlinked: number;
  };
  companyId: number;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function SalesReceiptsClient({ receipts: initialReceipts, stats, companyId }: SalesReceiptsClientProps) {
  const [receipts, setReceipts] = useState(initialReceipts);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });
  const router = useRouter();

  const filteredReceipts = receipts.filter(r => {
    const search = searchTerm.toLowerCase();
    return (
      r.receipt_number?.toLowerCase().includes(search) ||
      r.client_name?.toLowerCase().includes(search) ||
      r.invoice_number?.toLowerCase().includes(search)
    );
  });

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    if (type !== "loading") {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    }
  };

  const handleDelete = async (id: number, receiptNumber: string) => {
    if (!confirm(`هل أنت متأكد من حذف الإيصال "${receiptNumber}"؟`)) return;
    
    setDeleteLoading(id);
    showNotification("loading", "جاري الحذف", "جاري حذف الإيصال...");
    
    try {
      const res = await fetch(`/api/sales-receipts/${id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setReceipts(prev => prev.filter(r => r.id !== id));
        showNotification("success", "تم الحذف بنجاح", "تم حذف الإيصال بنجاح");
        router.refresh();
      } else {
        showNotification("error", "فشل الحذف", "فشل حذف الإيصال");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحذف");
    } finally {
      setDeleteLoading(null);
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
                  <div className="h-14 w-14 rounded-xl bg-teal-500 flex items-center justify-center shadow-lg">
                    <Receipt size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">إيصالات المبيعات</h1>
                    <p className="text-white/60 text-sm">إدارة سندات قبض المبيعات</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black">{stats.total}</div>
                    <div className="text-[10px] text-white/60 font-bold">إجمالي</div>
                  </div>
                  <div className="bg-emerald-500/20 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-lg font-black text-emerald-300">{Number(stats.total_amount).toLocaleString('ar-SA')}</div>
                    <div className="text-[10px] text-white/60 font-bold">ر.س</div>
                  </div>
                  <div className="bg-blue-500/20 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-blue-300">{stats.linked}</div>
                    <div className="text-[10px] text-white/60 font-bold">مرتبط</div>
                  </div>
                  <div className="bg-gray-500/20 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-gray-300">{stats.unlinked}</div>
                    <div className="text-[10px] text-white/60 font-bold">غير مرتبط</div>
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
                  placeholder="بحث برقم الإيصال أو اسم العميل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href="/sales-receipts/new">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 text-white font-bold text-sm hover:bg-teal-600 transition-all">
                    <Plus size={16} />
                    <span>إضافة إيصال جديد</span>
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
                <Receipt size={18} />
                <h3 className="font-bold text-sm">قائمة إيصالات المبيعات</h3>
              </div>
              <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold">
                {filteredReceipts.length} إيصال
              </span>
            </div>

            {filteredReceipts.length > 0 ? (
              <div className="overflow-x-auto max-h-[calc(100vh-450px)]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="border-b border-gray-100">
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">رقم الإيصال</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">العميل</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">التاريخ</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">المبلغ</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">مرتبط بفاتورة</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredReceipts.map((receipt) => (
                      <tr 
                        key={receipt.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <code className="px-2 py-1 bg-teal-50 text-teal-600 rounded text-xs font-bold">
                            {receipt.receipt_number}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                              <User size={14} />
                            </div>
                            <span className="font-bold text-gray-900 text-sm">
                              {receipt.client_name || "غير محدد"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Calendar size={12} />
                            {receipt.receipt_date ? format(new Date(receipt.receipt_date), 'yyyy/MM/dd') : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                            <DollarSign size={14} />
                            {Number(receipt.amount || 0).toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                            <span className="text-xs text-gray-400">ر.س</span>
                          </div>
                        </td>
                          <td className="px-4 py-3">
                          {receipt.invoice_number ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                              <LinkIcon size={10} />
                              {receipt.invoice_number}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold">
                              <Unlink size={10} />
                              غير مرتبط
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/sales-receipts/${receipt.id}`}>
                              <button className="h-7 w-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all" title="عرض">
                                <Eye size={14} />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(receipt.id, receipt.receipt_number)}
                              disabled={deleteLoading === receipt.id}
                              className="h-7 w-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                              title="حذف"
                            >
                              {deleteLoading === receipt.id ? (
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
                <Receipt size={48} className="mx-auto text-gray-200 mb-4" />
                <h4 className="text-lg font-bold text-gray-600 mb-2">لا توجد إيصالات مبيعات</h4>
                <p className="text-gray-400 text-sm mb-4">ابدأ بإضافة أول إيصال مبيعات</p>
                <Link href="/sales-receipts/new">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-white font-bold text-sm hover:bg-teal-600 transition-all">
                    <Plus size={16} />
                    <span>إضافة إيصال جديد</span>
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
