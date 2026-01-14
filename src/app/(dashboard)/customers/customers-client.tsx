"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
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
  Receipt,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  ChartBar,
  Upload,
  MoreVertical
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

export function CustomersClient({ customers: initialCustomers, stats, companyId }: CustomersClientProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
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

  const handleDelete = async (id: number, customerName: string) => {
    if (!confirm(`هل أنت متأكد من حذف العميل "${customerName}"؟`)) return;
    
    setDeleteLoading(id);
    try {
      const res = await fetch(`/api/customers/${id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        router.refresh();
      } else {
        alert("فشل حذف العميل");
      }
    } catch (error) {
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1800px] mx-auto px-4">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-[2rem] p-8 text-white shadow-2xl">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-[#3498db] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Users size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">إدارة العملاء</h1>
              <p className="text-white/60 text-sm mt-2">إدارة قاعدة بيانات العملاء والمنشآت</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <StatCard 
              icon={<Users size={20} />} 
              label="إجمالي العملاء" 
              value={stats.total} 
              color="blue"
            />
            <StatCard 
              icon={<CheckCircle size={20} />} 
              label="العملاء النشطين" 
              value={stats.active} 
              color="green"
            />
            <StatCard 
              icon={<XCircle size={20} />} 
              label="العملاء الغير نشطين" 
              value={stats.inactive} 
              color="orange"
            />
            <StatCard 
              icon={<ChartBar size={20} />} 
              label="هذا الشهر" 
              value={stats.total} 
              color="purple"
            />
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
      </div>

      {/* Search & Actions */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="بحث بالاسم، الرقم الضريبي، البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-bold"
            />
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Link href="/customers/new">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                <UserPlus size={18} />
                <span>إضافة عميل جديد</span>
              </button>
            </Link>
            <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all">
              <FileSpreadsheet size={18} />
              <span>تصدير Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#2c3e50] to-[#34495e] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Users size={20} />
            <h3 className="font-black">قائمة العملاء</h3>
          </div>
          <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold">
            {filteredCustomers.length} عميل
          </span>
        </div>

        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-right px-6 py-4 text-xs font-black text-gray-600 uppercase">العميل</th>
                  <th className="text-right px-6 py-4 text-xs font-black text-gray-600 uppercase">المنشأة</th>
                  <th className="text-right px-6 py-4 text-xs font-black text-gray-600 uppercase">الرقم الضريبي</th>
                  <th className="text-right px-6 py-4 text-xs font-black text-gray-600 uppercase">البريد الإلكتروني</th>
                  <th className="text-right px-6 py-4 text-xs font-black text-gray-600 uppercase">الهاتف</th>
                  <th className="text-right px-6 py-4 text-xs font-black text-gray-600 uppercase">الحالة</th>
                  <th className="text-right px-6 py-4 text-xs font-black text-gray-600 uppercase">تاريخ الإنشاء</th>
                  <th className="text-center px-6 py-4 text-xs font-black text-gray-600 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <motion.tr 
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                          <Users size={18} />
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {customer.customer_name || "غير محدد"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{customer.company_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                        {customer.vat_number}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {customer.email ? (
                        <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                          <Mail size={12} />
                          {customer.email}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">غير محدد</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {customer.phone ? (
                        <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600">
                          <Phone size={12} />
                          {customer.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">غير محدد</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {customer.is_active ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                          <CheckCircle size={12} />
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                          <XCircle size={12} />
                          غير نشط
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {format(new Date(customer.created_at), 'yyyy-MM-dd')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/customers/${customer.id}`}>
                          <button className="h-9 w-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all" title="عرض">
                            <Eye size={16} />
                          </button>
                        </Link>
                        <Link href={`/customers/${customer.id}/edit`}>
                          <button className="h-9 w-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all" title="تعديل">
                            <Edit size={16} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(customer.id, customer.customer_name || customer.company_name)}
                          disabled={deleteLoading === customer.id}
                          className="h-9 w-9 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          title="حذف"
                        >
                          {deleteLoading === customer.id ? (
                            <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <Users size={60} className="mx-auto text-gray-200 mb-4" />
            <h4 className="text-lg font-bold text-gray-600 mb-2">لا يوجد عملاء</h4>
            <p className="text-gray-400 text-sm mb-6">ابدأ بإضافة أول عميل لك</p>
            <Link href="/customers/new">
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                <UserPlus size={18} />
                <span>إضافة عميل جديد</span>
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/customers/new">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center group">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
              <UserPlus size={24} />
            </div>
            <h4 className="font-black text-gray-900 mb-1">إضافة عميل جديد</h4>
            <p className="text-xs text-gray-500">تسجيل بيانات عميل أو منشأة جديدة</p>
          </div>
        </Link>
        
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center group cursor-pointer">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload size={24} />
          </div>
          <h4 className="font-black text-gray-900 mb-1">استيراد البيانات</h4>
          <p className="text-xs text-gray-500">استيراد العملاء من ملف Excel</p>
        </div>
        
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center group cursor-pointer">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform">
            <ChartBar size={24} />
          </div>
          <h4 className="font-black text-gray-900 mb-1">التقارير</h4>
          <p className="text-xs text-gray-500">عرض تقارير وإحصائيات العملاء</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500 shadow-blue-500/20",
    green: "bg-emerald-500 shadow-emerald-500/20",
    orange: "bg-orange-500 shadow-orange-500/20",
    purple: "bg-purple-500 shadow-purple-500/20"
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/20 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-xl font-black">{value}</span>
      </div>
      <p className="text-[10px] font-black uppercase tracking-wider text-white/60">{label}</p>
    </div>
  );
}
