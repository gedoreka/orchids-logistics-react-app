"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ArrowRight,
  Wallet,
  Calculator,
  AlertCircle,
  Loader2,
  Route
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

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function CustomerViewClient({ customer, companyId }: CustomerViewClientProps) {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف العميل "${customer.customer_name || customer.company_name}"؟`)) return;
    
    setDeleteLoading(true);
    showNotification("loading", "جاري الحذف", "جاري حذف بيانات العميل...");
    
    try {
      const res = await fetch(`/api/customers/${customer.id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        showNotification("success", "تم الحذف بنجاح", "تم حذف العميل بنجاح");
        setTimeout(() => {
          router.push("/customers");
          router.refresh();
        }, 1500);
      } else {
        showNotification("error", "فشل الحذف", "فشل حذف العميل");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحذف");
    } finally {
      setDeleteLoading(false);
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
              onClick={() => notification.type !== "loading" && hideNotification()}
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
                      onClick={hideNotification}
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
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-2xl p-6 text-white shadow-xl">
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black">{customer.customer_name || "غير محدد"}</h1>
                    <p className="text-white/60 text-sm">{customer.company_name}</p>
                    <div className="mt-2">
                      {customer.is_active ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                          <CheckCircle size={12} />
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
                          <XCircle size={12} />
                          غير نشط
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/customers">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                      <ArrowRight size={16} />
                      <span>القائمة</span>
                    </button>
                  </Link>
                  <Link href={`/customers/${customer.id}/edit`}>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all">
                      <Edit size={16} />
                      <span>تعديل</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-blue-500 px-4 py-3 flex items-center gap-2 text-white">
                <Building2 size={18} />
                <h3 className="font-bold text-sm">معلومات المنشأة</h3>
              </div>
              <div className="p-4 space-y-3">
                <InfoRow icon={<User size={16} />} label="اسم العميل" value={customer.customer_name} />
                <InfoRow icon={<Building2 size={16} />} label="اسم المنشأة" value={customer.company_name} />
                <InfoRow icon={<FileText size={16} />} label="السجل التجاري" value={customer.commercial_number} />
                <InfoRow icon={<Receipt size={16} />} label="الرقم الضريبي" value={customer.vat_number} />
                <InfoRow icon={<Hash size={16} />} label="الرقم الموحد" value={customer.unified_number} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-emerald-500 px-4 py-3 flex items-center gap-2 text-white">
                <Phone size={18} />
                <h3 className="font-bold text-sm">معلومات الاتصال</h3>
              </div>
              <div className="p-4 space-y-3">
                <InfoRow 
                  icon={<Mail size={16} />} 
                  label="البريد الإلكتروني" 
                  value={customer.email}
                  isLink={customer.email ? `mailto:${customer.email}` : undefined}
                />
                <InfoRow 
                  icon={<Phone size={16} />} 
                  label="رقم الهاتف" 
                  value={customer.phone}
                  isLink={customer.phone ? `tel:${customer.phone}` : undefined}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-purple-500 px-4 py-3 flex items-center gap-2 text-white">
                <MapPin size={18} />
                <h3 className="font-bold text-sm">العنوان</h3>
              </div>
              <div className="p-4 space-y-3">
                <InfoRow icon={<Globe size={16} />} label="الدولة" value={customer.country} />
                <InfoRow icon={<Building size={16} />} label="المدينة" value={customer.city} />
                <InfoRow icon={<MapPinned size={16} />} label="الحي" value={customer.district} />
                <InfoRow icon={<Route size={16} />} label="الشارع" value={customer.street_name} />
                <InfoRow icon={<Hash size={16} />} label="الرمز البريدي" value={customer.postal_code} />
                <InfoRow icon={<MapPin size={16} />} label="العنوان المختصر" value={customer.short_address} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-orange-500 px-4 py-3 flex items-center gap-2 text-white">
                <Wallet size={18} />
                <h3 className="font-bold text-sm">المعلومات المالية</h3>
              </div>
              <div className="p-4 space-y-3">
                <InfoRow icon={<Wallet size={16} />} label="مركز الحساب" value={customer.account_name} />
                <InfoRow icon={<Calculator size={16} />} label="مركز التكلفة" value={customer.cost_center_name} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-600 px-4 py-3 flex items-center gap-2 text-white">
              <Clock size={18} />
              <h3 className="font-bold text-sm">معلومات النظام</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow 
                icon={<Calendar size={16} />} 
                label="تاريخ الإنشاء" 
                value={customer.created_at ? format(new Date(customer.created_at), 'yyyy-MM-dd HH:mm') : undefined}
              />
              <InfoRow 
                icon={<Clock size={16} />} 
                label="آخر تحديث" 
                value={customer.updated_at && customer.updated_at !== '0000-00-00 00:00:00' 
                  ? format(new Date(customer.updated_at), 'yyyy-MM-dd HH:mm') 
                  : undefined
                }
              />
            </div>
          </div>

          <div className="flex justify-center gap-3 pb-6">
            <Link href="/customers">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                <ArrowRight size={16} />
                <span>العودة</span>
              </button>
            </Link>
            <Link href={`/customers/${customer.id}/edit`}>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all">
                <Edit size={16} />
                <span>تعديل</span>
              </button>
            </Link>
            <button 
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50"
            >
              {deleteLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, isLink }: { icon: React.ReactNode; label: string; value?: string | null; isLink?: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-400 mb-0.5">{label}</p>
        {value ? (
          isLink ? (
            <a href={isLink} className="text-sm font-bold text-blue-600 hover:underline">{value}</a>
          ) : (
            <p className="text-sm font-bold text-gray-900">{value}</p>
          )
        ) : (
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">غير محدد</span>
        )}
      </div>
    </div>
  );
}
