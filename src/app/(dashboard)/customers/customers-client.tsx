"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  UserPlus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  ChartBar,
  Upload,
  X,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  commercial_number: string;
  vat_number: string;
  email?: string;
  phone?: string;
  is_active: number;
  created_at: string;
}

interface CustomersClientProps {
  customers: Customer[];
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
  companyId: number;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function CustomersClient({ customers: initialCustomers, stats, companyId }: CustomersClientProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });
  const router = useRouter();

  const filteredCustomers = customers.filter(customer => {
    const search = searchTerm.toLowerCase();
    return (
      customer.customer_name?.toLowerCase().includes(search) ||
      customer.company_name?.toLowerCase().includes(search) ||
      customer.vat_number?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.phone?.includes(search)
    );
  });

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    if (type !== "loading") {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    }
  };

  const handleDelete = async (id: number, customerName: string) => {
    if (!confirm(`هل أنت متأكد من حذف العميل "${customerName}"؟`)) return;
    
    setDeleteLoading(id);
    showNotification("loading", "جاري الحذف", "جاري حذف بيانات العميل...");
    
    try {
      const res = await fetch(`/api/customers/${id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        showNotification("success", "تم الحذف بنجاح", "تم حذف العميل بنجاح");
        router.refresh();
      } else {
        showNotification("error", "فشل الحذف", "فشل حذف العميل، حاول مرة أخرى");
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
          <div className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-2xl p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-[#3498db] flex items-center justify-center shadow-lg">
                    <Users size={28} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">إدارة العملاء</h1>
                    <p className="text-white/60 text-sm">إدارة قاعدة بيانات العملاء والمنشآت</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black">{stats.total}</div>
                    <div className="text-[10px] text-white/60 font-bold">إجمالي</div>
                  </div>
                  <div className="bg-emerald-500/20 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-emerald-300">{stats.active}</div>
                    <div className="text-[10px] text-white/60 font-bold">نشط</div>
                  </div>
                  <div className="bg-red-500/20 backdrop-blur rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-red-300">{stats.inactive}</div>
                    <div className="text-[10px] text-white/60 font-bold">غير نشط</div>
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
                  placeholder="بحث بالاسم، الرقم الضريبي..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link href="/customers/new">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">
                    <UserPlus size={16} />
                    <span>إضافة عميل</span>
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
            <div className="bg-gradient-to-br from-[#2c3e50] to-[#34495e] px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2 text-white">
                <Users size={18} />
                <h3 className="font-bold text-sm">قائمة العملاء</h3>
              </div>
              <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold">
                {filteredCustomers.length} عميل
              </span>
            </div>

            {filteredCustomers.length > 0 ? (
              <div className="overflow-x-auto max-h-[calc(100vh-450px)]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="border-b border-gray-100">
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">العميل</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">المنشأة</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">الرقم الضريبي</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">البريد</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">الهاتف</th>
                      <th className="text-right px-4 py-3 text-xs font-bold text-gray-600">الحالة</th>
                      <th className="text-center px-4 py-3 text-xs font-bold text-gray-600">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredCustomers.map((customer) => (
                      <tr 
                        key={customer.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                              <Users size={14} />
                            </div>
                            <span className="font-bold text-gray-900 text-sm">
                              {customer.customer_name || "غير محدد"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={12} className="text-gray-400" />
                            <span className="text-sm text-gray-700">{customer.company_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                            {customer.vat_number}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          {customer.email ? (
                            <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                              <Mail size={10} />
                              {customer.email}
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {customer.phone ? (
                            <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-xs text-gray-700">
                              <Phone size={10} />
                              {customer.phone}
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {customer.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                              <CheckCircle size={10} />
                              نشط
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                              <XCircle size={10} />
                              غير نشط
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Link href={`/customers/${customer.id}`}>
                              <button className="h-7 w-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all" title="عرض">
                                <Eye size={14} />
                              </button>
                            </Link>
                            <Link href={`/customers/${customer.id}/edit`}>
                              <button className="h-7 w-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all" title="تعديل">
                                <Edit size={14} />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(customer.id, customer.customer_name || customer.company_name)}
                              disabled={deleteLoading === customer.id}
                              className="h-7 w-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                              title="حذف"
                            >
                              {deleteLoading === customer.id ? (
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
                <Users size={48} className="mx-auto text-gray-200 mb-4" />
                <h4 className="text-lg font-bold text-gray-600 mb-2">لا يوجد عملاء</h4>
                <p className="text-gray-400 text-sm mb-4">ابدأ بإضافة أول عميل لك</p>
                <Link href="/customers/new">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">
                    <UserPlus size={16} />
                    <span>إضافة عميل</span>
                  </button>
                </Link>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/customers/new">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center group cursor-pointer">
                <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <UserPlus size={20} />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">إضافة عميل</h4>
                <p className="text-xs text-gray-500">تسجيل عميل جديد</p>
              </div>
            </Link>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-105 transition-transform">
                <Upload size={20} />
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">استيراد</h4>
              <p className="text-xs text-gray-500">من ملف Excel</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center group cursor-pointer">
              <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-105 transition-transform">
                <ChartBar size={20} />
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">التقارير</h4>
              <p className="text-xs text-gray-500">إحصائيات العملاء</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
