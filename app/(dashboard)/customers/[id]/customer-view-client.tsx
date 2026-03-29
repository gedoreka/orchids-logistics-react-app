"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2, User, Mail, Phone, MapPin, FileText, Receipt, Hash,
  Globe, Building, MapPinned, Calendar, Edit, Trash2, ArrowRight,
  Wallet, Calculator, Loader2, Route, Users, Printer, Power, LayoutDashboard
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
  updated_at?: string;
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

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; item: Customer | null }>({ isOpen: false, item: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; type: 'delete' | null; title: string }>({ isOpen: false, type: null, title: '' });
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });

  const handleDelete = () => setDeleteConfirmModal({ isOpen: true, item: customer });

  const confirmDelete = async () => {
    setDeleteLoading(true);
    setDeleteConfirmModal({ isOpen: false, item: null });
    setLoadingModal(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}?company_id=${companyId}`, { method: "DELETE" });
      setLoadingModal(false);
      if (res.ok) {
        setSuccessModal({ isOpen: true, type: 'delete', title: customer.customer_name || customer.company_name });
        setTimeout(() => { router.push("/customers"); router.refresh(); }, 2000);
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

  const fullAddress = [customer.city, customer.district && `حي ${customer.district}`, customer.street_name && `شارع ${customer.street_name}`].filter(Boolean).join(' ');

  return (
    <div className="w-full px-2 pt-4 pb-6 print:p-0" dir={isRTL ? "rtl" : "ltr"}>
      {/* Modals */}
      <DeleteConfirmModal isOpen={deleteConfirmModal.isOpen} itemTitle={deleteConfirmModal.item?.customer_name || deleteConfirmModal.item?.company_name || ''} isLoading={deleteLoading} onConfirm={confirmDelete} onCancel={() => setDeleteConfirmModal({ isOpen: false, item: null })} />
      <SuccessModal isOpen={successModal.isOpen} type={successModal.type} title={successModal.title} onClose={() => setSuccessModal({ isOpen: false, type: null, title: '' })} />
      <LoadingModal isOpen={loadingModal} title="جاري الحذف" message="جاري حذف بيانات العميل..." />
      <ErrorModal isOpen={errorModal.isOpen} title={errorModal.title} message={errorModal.message} onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 rounded-[3rem] shadow-2xl border border-slate-500/30 overflow-hidden print:shadow-none print:rounded-none"
      >
        {/* Rainbow bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 via-emerald-500 to-blue-500 print:hidden" />

        <div className="p-5 md:p-8 space-y-5">

          {/* ── Compact Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white/5 backdrop-blur-xl px-6 py-5 rounded-[1.75rem] border border-white/10 shadow-lg flex items-center justify-between print:hidden"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 flex-shrink-0">
                <Building2 size={22} strokeWidth={2.5} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-1">
                  <Link href="/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                    <LayoutDashboard size={11} />لوحة التحكم
                  </Link>
                  <ArrowRight size={11} className="text-slate-500 rotate-180" />
                  <Link href="/customers" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                    <Users size={11} />العملاء
                  </Link>
                  <ArrowRight size={11} className="text-slate-500 rotate-180" />
                  <span className="text-blue-400">بيانات العميل</span>
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  {customer.company_name || customer.customer_name}
                </h1>
                <p className="text-white/40 text-xs font-semibold mt-0.5">
                  {fullAddress || 'عرض تفصيلي لبيانات العميل والمنشأة'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 text-amber-400 hover:bg-amber-500/10 transition-all border border-white/10"
                title="طباعة"
              >
                <Printer size={16} />
              </button>
              <Link href={`/customers/${customer.id}/edit`}>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-400 font-bold text-sm hover:bg-amber-500/20 transition-all border border-amber-500/20"
                >
                  <Edit size={15} />
                  <span>{t('editBtn')}</span>
                </motion.button>
              </Link>
              <Link href="/customers">
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 text-white/70 font-bold text-sm hover:bg-white/10 hover:text-white transition-all border border-white/10"
                >
                  <ArrowRight size={15} className="rotate-180" />
                  <span>{t('backToList')}</span>
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* ── Main Content: 2-column ── */}
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

            {/* Left: Basic Info + Address (3/5) */}
            <div className="xl:col-span-3 space-y-5">

              {/* Basic Info */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-lg overflow-hidden">
                <SectionHeader title={t('facilityInfo')} icon={<Building2 size={16} />} color="blue" />
                <div className="p-5 grid grid-cols-2 xl:grid-cols-3 gap-3">
                  <InfoCell icon={<User size={13} />} label={t('customerNameLabel')} value={customer.customer_name} />
                  <InfoCell icon={<Building2 size={13} />} label={t('facilityName')} value={customer.company_name} />
                  <InfoCell icon={<FileText size={13} />} label={t('commercialNumber')} value={customer.commercial_number} mono />
                  <InfoCell icon={<Receipt size={13} />} label={t('vatNumber')} value={customer.vat_number} mono />
                  <InfoCell icon={<Hash size={13} />} label={t('unifiedNumber')} value={customer.unified_number} />
                </div>
              </motion.div>

              {/* Address */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-lg overflow-hidden">
                <SectionHeader title={t('addressInfo')} icon={<MapPin size={16} />} color="purple" />
                <div className="p-5 grid grid-cols-2 xl:grid-cols-3 gap-3">
                  <InfoCell icon={<Globe size={13} />} label={t('country')} value={customer.country} />
                  <InfoCell icon={<Building size={13} />} label={t('city')} value={customer.city} />
                  <InfoCell icon={<MapPinned size={13} />} label={t('district')} value={customer.district} />
                  <InfoCell icon={<Route size={13} />} label={t('street')} value={customer.street_name} />
                  <InfoCell icon={<Hash size={13} />} label={t('postalCode')} value={customer.postal_code} mono />
                  <InfoCell icon={<MapPin size={13} />} label={t('shortAddress')} value={customer.short_address} mono />
                </div>
              </motion.div>

              {/* Financial */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-lg overflow-hidden">
                <SectionHeader title={t('financialInfo')} icon={<Wallet size={16} />} color="orange" />
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoCell icon={<Wallet size={13} />} label="الحساب المالي" value={customer.account_name || 'غير مربوط'} />
                  <InfoCell icon={<Calculator size={13} />} label="مركز التكلفة" value={customer.cost_center_name || 'غير محدد'} />
                </div>
              </motion.div>
            </div>

            {/* Right: Contact + Status (2/5) */}
            <div className="xl:col-span-2 space-y-5">

              {/* Contact */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-lg overflow-hidden">
                <SectionHeader title={t('contactInfo')} icon={<Phone size={16} />} color="emerald" />
                <div className="p-5 space-y-3">
                  <a href={customer.email ? `mailto:${customer.email}` : '#'} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/5 hover:border-emerald-500/20 transition-all group">
                    <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                      <Mail size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{t('email')}</p>
                      <p className="text-white text-sm font-bold truncate group-hover:text-emerald-400 transition-colors">{customer.email || '---'}</p>
                    </div>
                  </a>
                  <a href={customer.phone ? `tel:${customer.phone}` : '#'} className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/5 hover:border-blue-500/20 transition-all group">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{t('phone')}</p>
                      <p className="text-white text-sm font-bold group-hover:text-blue-400 transition-colors">{customer.phone || '---'}</p>
                    </div>
                  </a>
                </div>
              </motion.div>

              {/* System Info + Status + Delete */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 shadow-lg p-5 space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${customer.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">الحالة</p>
                      <p className={`text-sm font-black ${customer.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {customer.is_active ? t('activeStatus') : t('inactiveStatus')}
                      </p>
                    </div>
                  </div>
                  <div className="text-white/30 text-xs font-black bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                    #{customer.id}
                  </div>
                </div>

                {/* Dates */}
                <div className="px-3.5 py-3 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/30 font-bold flex items-center gap-1.5"><Calendar size={11} />{t('createdAt')}</span>
                    <span className="text-white/70 font-black">{customer.created_at ? format(new Date(customer.created_at), 'yyyy-MM-dd') : '---'}</span>
                  </div>
                  {customer.updated_at && customer.updated_at !== '0000-00-00 00:00:00' && (
                    <div className="flex items-center justify-between text-xs border-t border-white/5 pt-2">
                      <span className="text-white/30 font-bold flex items-center gap-1.5"><Calendar size={11} />{t('updatedAt')}</span>
                      <span className="text-white/70 font-black">{format(new Date(customer.updated_at), 'yyyy-MM-dd')}</span>
                    </div>
                  )}
                </div>

                {/* Delete */}
                <motion.button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  whileHover={{ scale: deleteLoading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-400 font-black text-sm border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  {deleteLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  <span>{t('deleteBtn')}</span>
                </motion.button>
              </motion.div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

function SectionHeader({ title, icon, color }: { title: string; icon: React.ReactNode; color: "blue" | "emerald" | "purple" | "orange" }) {
  const gradients = {
    blue: "from-blue-600 to-indigo-600",
    emerald: "from-emerald-600 to-teal-600",
    purple: "from-purple-600 to-violet-600",
    orange: "from-orange-500 to-amber-600",
  };
  return (
    <div className={`bg-gradient-to-r ${gradients[color]} px-5 py-3.5 flex items-center gap-3 text-white relative overflow-hidden`}>
      <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-xl border border-white/20 relative z-10">{icon}</div>
      <h3 className="text-sm font-black tracking-tight relative z-10">{title}</h3>
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />
    </div>
  );
}

function InfoCell({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="space-y-1.5 group">
      <div className="flex items-center gap-1.5 text-[10px] font-black text-white/30 uppercase tracking-widest">
        <span className="text-white/20 group-hover:text-white/50 transition-colors">{icon}</span>
        {label}
      </div>
      <div className={`text-sm font-bold text-white bg-white/5 px-3.5 py-2.5 rounded-xl border border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-all truncate ${mono ? 'font-mono' : ''}`}>
        {value || '---'}
      </div>
    </div>
  );
}
