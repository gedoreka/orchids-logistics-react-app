"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Receipt,
  Hash,
  Globe,
  Building,
  MapPinned,
  Route,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ArrowRight,
  Wallet,
  Calculator
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
  unified_number?: string;
  email?: string;
  phone?: string;
  country?: string;
  city?: string;
  district?: string;
  street_name?: string;
  postal_code?: string;
  short_address?: string;
  account_id?: number;
  cost_center_id?: number;
  account_name?: string;
  cost_center_name?: string;
  is_active: number;
  created_at: string;
  updated_at?: string;
}

interface CustomerViewClientProps {
  customer: Customer;
  companyId: number;
}

export function CustomerViewClient({ customer, companyId }: CustomerViewClientProps) {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف العميل "${customer.customer_name || customer.company_name}"؟`)) return;
    
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        router.push("/customers");
        router.refresh();
      } else {
        alert("فشل حذف العميل");
      }
    } catch (error) {
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto px-4">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-[2rem] p-8 text-white shadow-2xl">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Building2 size={40} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{customer.customer_name || "غير محدد"}</h1>
              <p className="text-white/60 text-sm mt-1">{customer.company_name}</p>
            </div>
            <div className="flex items-center gap-3">
              {customer.is_active ? (
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-bold border border-emerald-500/30">
                  <CheckCircle size={16} />
                  نشط
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-red-500/20 text-red-300 text-sm font-bold border border-red-500/30">
                  <XCircle size={16} />
                  غير نشط
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mt-6">
            <Link href="/customers">
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                <ArrowRight size={18} />
                <span>العودة للقائمة</span>
              </button>
            </Link>
            <Link href={`/customers/${customer.id}/edit`}>
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all">
                <Edit size={18} />
                <span>تعديل البيانات</span>
              </button>
            </Link>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-4 flex items-center gap-2 text-white">
            <Building2 size={20} />
            <h3 className="font-black">معلومات المنشأة</h3>
          </div>
          <div className="p-6 space-y-4">
            <InfoRow icon={<User size={18} />} label="اسم العميل" value={customer.customer_name} />
            <InfoRow icon={<Building2 size={18} />} label="اسم المنشأة" value={customer.company_name} />
            <InfoRow icon={<FileText size={18} />} label="السجل التجاري" value={customer.commercial_number} />
            <InfoRow icon={<Receipt size={18} />} label="الرقم الضريبي" value={customer.vat_number} />
            <InfoRow icon={<Hash size={18} />} label="الرقم الموحد" value={customer.unified_number} />
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-4 flex items-center gap-2 text-white">
            <Phone size={20} />
            <h3 className="font-black">معلومات الاتصال</h3>
          </div>
          <div className="p-6 space-y-4">
            <InfoRow 
              icon={<Mail size={18} />} 
              label="البريد الإلكتروني" 
              value={customer.email}
              isLink={customer.email ? `mailto:${customer.email}` : undefined}
            />
            <InfoRow 
              icon={<Phone size={18} />} 
              label="رقم الهاتف" 
              value={customer.phone}
              isLink={customer.phone ? `tel:${customer.phone}` : undefined}
            />
          </div>
        </motion.div>

        {/* Address Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-6 py-4 flex items-center gap-2 text-white">
            <MapPin size={20} />
            <h3 className="font-black">العنوان</h3>
          </div>
          <div className="p-6 space-y-4">
            <InfoRow icon={<Globe size={18} />} label="الدولة" value={customer.country} />
            <InfoRow icon={<Building size={18} />} label="المدينة" value={customer.city} />
            <InfoRow icon={<MapPinned size={18} />} label="الحي" value={customer.district} />
            <InfoRow icon={<Route size={18} />} label="الشارع" value={customer.street_name} />
            <InfoRow icon={<Hash size={18} />} label="الرمز البريدي" value={customer.postal_code} />
            <InfoRow icon={<MapPin size={18} />} label="العنوان المختصر" value={customer.short_address} />
          </div>
        </motion.div>

        {/* Financial Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-4 flex items-center gap-2 text-white">
            <Wallet size={20} />
            <h3 className="font-black">المعلومات المالية</h3>
          </div>
          <div className="p-6 space-y-4">
            <InfoRow icon={<Wallet size={18} />} label="مركز الحساب" value={customer.account_name} />
            <InfoRow icon={<Calculator size={18} />} label="مركز التكلفة" value={customer.cost_center_name} />
          </div>
        </motion.div>
      </div>

      {/* System Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="bg-gradient-to-br from-gray-600 to-gray-700 px-6 py-4 flex items-center gap-2 text-white">
          <Clock size={20} />
          <h3 className="font-black">معلومات النظام</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow 
            icon={<Calendar size={18} />} 
            label="تاريخ الإنشاء" 
            value={customer.created_at ? format(new Date(customer.created_at), 'yyyy-MM-dd HH:mm') : undefined}
          />
          <InfoRow 
            icon={<Clock size={18} />} 
            label="آخر تحديث" 
            value={customer.updated_at && customer.updated_at !== '0000-00-00 00:00:00' 
              ? format(new Date(customer.updated_at), 'yyyy-MM-dd HH:mm') 
              : undefined
            }
          />
        </div>
      </motion.div>

      {/* Action Footer */}
      <div className="flex justify-center gap-4">
        <Link href="/customers">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
            <ArrowRight size={18} />
            <span>العودة للقائمة</span>
          </button>
        </Link>
        <Link href={`/customers/${customer.id}/edit`}>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all">
            <Edit size={18} />
            <span>تعديل البيانات</span>
          </button>
        </Link>
        <button 
          onClick={handleDelete}
          disabled={deleteLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50"
        >
          {deleteLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={18} />
          )}
          <span>حذف العميل</span>
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, isLink }: { icon: React.ReactNode; label: string; value?: string | null; isLink?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
        {value ? (
          isLink ? (
            <a href={isLink} className="text-sm font-bold text-blue-600 hover:underline">{value}</a>
          ) : (
            <p className="text-sm font-bold text-gray-900">{value}</p>
          )
        ) : (
          <span className="text-sm text-gray-400 bg-gray-50 px-2 py-0.5 rounded">غير محدد</span>
        )}
      </div>
    </div>
  );
}
