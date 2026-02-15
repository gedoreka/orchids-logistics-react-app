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
  Loader2,
  Route,
  ArrowLeft,
  Users,
  RefreshCw,
  Printer,
  FileSpreadsheet,
  Power
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { DeleteConfirmModal, SuccessModal, LoadingModal, ErrorModal } from "@/components/ui/notification-modals";

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
  updated_at?: string; // may not exist in DB but keep for display safety
}

interface CustomerViewClientProps {
  customer: Customer;
  companyId: number;
}

export function CustomerViewClient({ customer, companyId }: CustomerViewClientProps) {
  const router = useRouter();
  const t = useTranslations("customers.viewPage");
  const { isRTL } = useLocale();
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Modal states
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; item: Customer | null }>({ isOpen: false, item: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; type: 'delete' | 'update' | 'create' | null; title: string }>({ isOpen: false, type: null, title: '' });
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });

  const handleDelete = () => {
    setDeleteConfirmModal({ isOpen: true, item: customer });
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    setDeleteConfirmModal({ isOpen: false, item: null });
    setLoadingModal(true);

    try {
      const res = await fetch(`/api/customers/${customer.id}?company_id=${companyId}`, {
        method: "DELETE"
      });

      setLoadingModal(false);

      if (res.ok) {
        setSuccessModal({ isOpen: true, type: 'delete', title: customer.customer_name || customer.company_name });
        setTimeout(() => {
          router.push("/customers");
          router.refresh();
        }, 2000);
      } else {
        setErrorModal({ isOpen: true, title: "فشل الحذف", message: "حدث خطأ أثناء محاولة حذف العميل" });
      }
    } catch {
      setLoadingModal(false);
      setErrorModal({ isOpen: true, title: "خطأ", message: "حدث خطأ غير متوقع" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1525] relative overflow-hidden print:bg-white print:text-black" dir={isRTL ? "rtl" : "ltr"}>
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none print:hidden" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] -ml-96 -mb-96 pointer-events-none print:hidden" />

      {/* Modals */}
      <DeleteConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        itemTitle={deleteConfirmModal.item?.customer_name || deleteConfirmModal.item?.company_name || ''}
        isLoading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmModal({ isOpen: false, item: null })}
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        type={successModal.type}
        title={successModal.title}
        onClose={() => setSuccessModal({ isOpen: false, type: null, title: '' })}
      />
      <LoadingModal isOpen={loadingModal} title="جاري الحذف" message="جاري حذف بيانات العميل..." />
      <ErrorModal
        isOpen={errorModal.isOpen}
        title={errorModal.title}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
      />

      <div className="relative z-10 flex-1 p-4 md:p-8 lg:p-10">
        <div className="max-w-[1400px] mx-auto space-y-10">
          {/* Header Card */}
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 text-white shadow-2xl border border-white/10 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
            <div className="relative z-10">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="h-24 w-28 rounded-[2rem] bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 border border-white/20 print:hidden">
                    <Building2 size={48} strokeWidth={2.5} className="-rotate-3" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3 print:text-black">{t('title')}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-black border border-blue-500/20 print:border-black print:text-black">
                        بطاقة معلومات
                      </span>
                      <p className="text-slate-400 text-xl font-bold print:text-black/60">{t('subtitle')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 print:hidden">
                  <Link href="/customers">
                    <button className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-white/5 text-white font-black text-lg hover:bg-white/10 transition-all border border-white/10 backdrop-blur-xl">
                      {isRTL ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
                      <span>{t('backToList')}</span>
                    </button>
                  </Link>
                  <button
                    onClick={handlePrint}
                    className="p-5 rounded-2xl bg-white/5 text-amber-400 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                  >
                    <Printer size={28} />
                  </button>
                  <Link href={`/customers/${customer.id}/edit`}>
                    <button className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-amber-500 text-white font-black text-lg hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20 active:scale-95">
                      <Edit size={24} />
                      <span>{t('editBtn')}</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 print:hidden" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32 print:hidden" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Info Columns */}
            <div className="lg:col-span-8 space-y-10">
              {/* Basic Info Section */}
              <Section title={t('facilityInfo')} icon={<Building2 size={28} />} color="blue">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                  <InfoItem icon={<User size={22} />} label={t('customerNameLabel')} value={customer.customer_name} />
                  <InfoItem icon={<Building2 size={22} />} label={t('facilityName')} value={customer.company_name} />
                  <InfoItem icon={<FileText size={22} />} label={t('commercialNumber')} value={customer.commercial_number} />
                  <InfoItem icon={<Receipt size={22} />} label={t('vatNumber')} value={customer.vat_number} />
                  <InfoItem icon={<Hash size={22} />} label={t('unifiedNumber')} value={customer.unified_number} />
                </div>
              </Section>

              {/* Address Section */}
              <Section title={t('addressInfo')} icon={<MapPin size={28} />} color="purple">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <InfoItem icon={<Globe size={22} />} label={t('country')} value={customer.country} />
                  <InfoItem icon={<Building size={22} />} label={t('city')} value={customer.city} />
                  <InfoItem icon={<MapPinned size={22} />} label={t('district')} value={customer.district} />
                  <InfoItem icon={<Route size={22} />} label={t('street')} value={customer.street_name} />
                  <InfoItem icon={<Hash size={22} />} label={t('postalCode')} value={customer.postal_code} />
                  <InfoItem icon={<MapPin size={22} />} label={t('shortAddress')} value={customer.short_address} />
                </div>
              </Section>
            </div>

            {/* Sidebar Columns */}
            <div className="lg:col-span-4 space-y-10">
              {/* Financial Info Card */}
              <Section title={t('financialInfo')} icon={<Wallet size={28} />} color="orange">
                <div className="space-y-8">
                  <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Wallet size={14} className="text-orange-400" />
                      الحساب المالي المرتبط
                    </p>
                    <p className="text-xl font-black text-white">{customer.account_name || 'غير مربوط بحساب'}</p>
                  </div>
                  <div className="bg-white/5 rounded-[2rem] p-6 border border-white/10">
                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Calculator size={14} className="text-orange-400" />
                      مركز التكلفة
                    </p>
                    <p className="text-xl font-black text-white">{customer.cost_center_name || 'غير محدد'}</p>
                  </div>
                </div>
              </Section>

              {/* Contact Info Card */}
              <Section title={t('contactInfo')} icon={<Phone size={28} />} color="emerald">
                <div className="space-y-6">
                  <a href={customer.email ? `mailto:${customer.email}` : '#'} className="block group">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 group-hover:border-emerald-500/30 transition-all">
                      <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <Mail size={22} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase">{t('email')}</p>
                        <p className="text-white font-bold group-hover:text-emerald-400 transition-colors">{customer.email || '---'}</p>
                      </div>
                    </div>
                  </a>
                  <a href={customer.phone ? `tel:${customer.phone}` : '#'} className="block group">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 group-hover:border-emerald-500/30 transition-all">
                      <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                        <Phone size={22} />
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase">{t('phone')}</p>
                        <p className="text-white font-bold group-hover:text-blue-400 transition-colors">{customer.phone || '---'}</p>
                      </div>
                    </div>
                  </a>
                </div>
              </Section>

              {/* System Info Card */}
              <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className={`w-3 h-3 rounded-full ${customer.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                     <span className="text-white font-black">{customer.is_active ? t('activeStatus') : t('inactiveStatus')}</span>
                   </div>
                   <div className="text-slate-500 text-xs font-black bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                     ID: #{customer.id}
                   </div>
                </div>
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold">{t('createdAt')}</span>
                    <span className="text-slate-200 font-black">
                      {customer.created_at ? format(new Date(customer.created_at), 'yyyy-MM-dd') : '---'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold">{t('updatedAt')}</span>
                    <span className="text-slate-200 font-black">
                      {customer.updated_at && customer.updated_at !== '0000-00-00 00:00:00' 
                        ? format(new Date(customer.updated_at), 'yyyy-MM-dd HH:mm') 
                        : '---'}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="w-full mt-6 py-5 rounded-2xl bg-rose-500/10 text-rose-400 font-black text-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {deleteLoading ? <Loader2 className="animate-spin" /> : <Trash2 size={24} />}
                  <span>حذف ملف العميل</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, color, children }: { 
  title: string; 
  icon: React.ReactNode; 
  color: "blue" | "emerald" | "purple" | "orange";
  children: React.ReactNode;
}) {
  const colors = {
    blue: "from-blue-600 to-blue-400",
    emerald: "from-emerald-600 to-emerald-400",
    purple: "from-purple-600 to-purple-400",
    orange: "from-orange-600 to-orange-400"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden group hover:border-white/20 transition-all"
    >
      <div className={`bg-gradient-to-r ${colors[color]} px-10 py-7 flex items-center gap-6 text-white border-b border-white/10`}>
        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/20 relative z-10 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-2xl font-black tracking-tight">{title}</h3>
      </div>
      <div className="p-10 md:p-12">
        {children}
      </div>
    </motion.div>
  );
}

function InfoItem({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="space-y-2 group">
      <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest">
        <span className="text-white/20 group-hover:text-white/40 transition-colors">{icon}</span>
        {label}
      </div>
      <div className="text-lg font-black text-white bg-white/5 px-6 py-4 rounded-2xl border border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-all">
        {value || '---'}
      </div>
    </div>
  );
}
