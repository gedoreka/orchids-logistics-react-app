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
  AlertCircle,
  Loader2,
  ArrowRight,
  Filter,
  MoreVertical,
  Plus,
  Sparkles,
  Crown,
  Star
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "@/lib/locale-context";
import { DeleteConfirmModal, SuccessModal, LoadingModal, ErrorModal } from "@/components/ui/notification-modals";

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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();
  const { isRTL } = useLocale();
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');

  // Modal states
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; item: Customer | null }>({ isOpen: false, item: null });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; type: 'delete' | 'update' | 'create' | null; title: string }>({ isOpen: false, type: null, title: '' });
  const [loadingModal, setLoadingModal] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });

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

  const handleDelete = (customer: Customer) => {
    setDeleteConfirmModal({ isOpen: true, item: customer });
  };

  const confirmDelete = async () => {
    const item = deleteConfirmModal.item;
    if (!item) return;

    setDeleteLoading(true);
    setDeleteConfirmModal({ isOpen: false, item: null });
    setLoadingModal(true);

    try {
      const res = await fetch(`/api/customers/${item.id}?company_id=${companyId}`, {
        method: "DELETE"
      });

      setLoadingModal(false);

      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== item.id));
        setSuccessModal({ isOpen: true, type: 'delete', title: item.customer_name || item.company_name });
        router.refresh();
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

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
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

      {/* Main Content */}
      <div className="relative z-10 flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto">

          {/* === ONE MEGA CARD wrapping everything === */}
          <div className="relative bg-white rounded-[2.5rem] shadow-[0_8px_60px_rgba(0,0,0,0.06)] border border-slate-200/60 overflow-hidden">
            
            {/* Top gradient accent bar */}
            <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

            {/* ── Header Section ── */}
            <div className="relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30" />
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

              <div className="relative z-10 px-8 md:px-12 pt-10 pb-8">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
                  {/* Title area */}
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 rotate-2">
                      <Users size={40} strokeWidth={2.5} className="text-white -rotate-2" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-1">
                        {t('management')}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                          <Crown size={12} />
                          {t('customersList')}
                        </span>
                        <p className="text-slate-500 text-base font-semibold">{t('subtitle')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 xl:min-w-[420px]">
                    <StatCard label={tCommon('total')} value={stats.total} color="blue" />
                    <StatCard label={tCommon('active')} value={stats.active} color="emerald" />
                    <StatCard label={tCommon('inactive')} value={stats.inactive} color="rose" />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="mx-8 md:mx-12 border-t border-slate-100" />

            {/* ── Search & Actions Bar ── */}
            <div className="px-8 md:px-12 py-6">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className={`absolute ${isRTL ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-400`} size={22} />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${isRTL ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-4 rounded-2xl border-2 border-slate-200 bg-slate-50/80 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-base font-bold text-slate-800 placeholder:text-slate-400`}
                  />
                </div>
                {/* Action buttons */}
                <div className="flex gap-3">
                  <Link href="/customers/new">
                    <button className="h-full flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-base hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95 group">
                      <UserPlus size={22} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                      <span>{t('addCustomer')}</span>
                    </button>
                  </Link>
                  <button className="h-full px-5 rounded-2xl bg-emerald-50 text-emerald-600 border-2 border-emerald-200 hover:bg-emerald-100 transition-all active:scale-95" title={tCommon('import')}>
                    <FileSpreadsheet size={22} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Customers Table ── */}
            <div className="mx-8 md:mx-12 mb-8 rounded-[1.5rem] border border-slate-200 overflow-hidden bg-white shadow-sm">
              {/* Table header bar */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xl">
                    <Users size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold">{t('customersList')}</h3>
                </div>
                <span className="bg-white/15 backdrop-blur-xl px-5 py-1.5 rounded-xl text-sm font-bold text-white border border-white/10">
                  {filteredCustomers.length} {t('customer')}
                </span>
              </div>

              <div className="overflow-x-auto">
                {filteredCustomers.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500`}>{t('customer')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500`}>{t('facility')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500`}>{t('taxNumber')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500`}>{t('phoneCol')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500`}>{t('statusCol')}</th>
                        <th className="text-center px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">{tCommon('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCustomers.map((customer) => (
                        <tr 
                          key={customer.id}
                          className="group hover:bg-blue-50/40 transition-all"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3.5">
                              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 border border-blue-200/60 group-hover:scale-105 transition-transform">
                                <Users size={20} />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-[15px] mb-0.5">
                                  {customer.customer_name || t('notSpecified')}
                                </div>
                                <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                                  <Mail size={11} />
                                  {customer.email || '---'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-slate-800 font-bold text-sm">{customer.company_name}</span>
                              <span className="text-slate-400 text-xs">{customer.commercial_number}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <code className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 text-indigo-600 font-mono font-bold text-xs">
                              {customer.vat_number}
                            </code>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                              <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600 border border-emerald-200/60">
                                <Phone size={13} />
                              </div>
                              {customer.phone || '---'}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {customer.is_active ? (
                              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 w-fit">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold">{t('activeStatus')}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200 w-fit">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-xs font-bold">{t('inactiveStatus')}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-2">
                              <Link href={`/customers/${customer.id}`}>
                                <button className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all border border-blue-200 active:scale-90" title={tCommon('view')}>
                                  <Eye size={18} strokeWidth={2.5} />
                                </button>
                              </Link>
                              <Link href={`/customers/${customer.id}/edit`}>
                                <button className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all border border-amber-200 active:scale-90" title={tCommon('edit')}>
                                  <Edit size={18} strokeWidth={2.5} />
                                </button>
                              </Link>
                              <button 
                                onClick={() => handleDelete(customer)}
                                className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-200 active:scale-90 disabled:opacity-50"
                                title={tCommon('delete')}
                              >
                                <Trash2 size={18} strokeWidth={2.5} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-20 text-center">
                    <div className="h-24 w-24 bg-slate-100 rounded-[1.5rem] flex items-center justify-center text-slate-400 mx-auto mb-6 border border-slate-200">
                      <Users size={48} strokeWidth={1.5} />
                    </div>
                    <h4 className="text-2xl font-black text-slate-800 mb-3">{t('noCustomers')}</h4>
                    <p className="text-slate-500 text-base font-semibold mb-8 max-w-sm mx-auto">{t('startAddingCustomer')}</p>
                    <Link href="/customers/new">
                      <button className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-base hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/25 active:scale-95">
                        <Plus size={22} strokeWidth={3} />
                        <span>{t('addCustomer')}</span>
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ── Quick Actions ── */}
            <div className="px-8 md:px-12 pb-10">
              {/* Section title */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                  <Sparkles size={18} />
                </div>
                <h3 className="text-lg font-black text-slate-800">إجراءات سريعة</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionCard 
                  icon={<UserPlus size={22} />} 
                  title={t('addCustomer')} 
                  desc={t('registerNewCustomer')} 
                  color="blue"
                  href="/customers/new"
                />
                <QuickActionCard 
                  icon={<Upload size={22} />} 
                  title={tCommon('import')} 
                  desc={t('importFromExcel')} 
                  color="emerald"
                />
                <QuickActionCard 
                  icon={<ChartBar size={22} />} 
                  title={t('reports')} 
                  desc={t('customerReports')} 
                  color="purple"
                />
                <QuickActionCard 
                  icon={<Filter size={22} />} 
                  title="تصفية متقدمة" 
                  desc="فرز حسب المنطقة أو النشاط" 
                  color="orange"
                />
              </div>
            </div>

          </div>
          {/* === END MEGA CARD === */}

        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: number, color: "blue" | "emerald" | "rose" }) {
  const styles = {
    blue: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60 text-blue-700",
    emerald: "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/60 text-emerald-700",
    rose: "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200/60 text-rose-700"
  };

  return (
    <div className={`${styles[color]} rounded-2xl p-5 border transition-transform hover:-translate-y-0.5 shadow-sm`}>
      <div className="text-3xl font-black mb-0.5">{value}</div>
      <div className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</div>
    </div>
  );
}

function QuickActionCard({ icon, title, desc, color, href }: { icon: React.ReactNode, title: string, desc: string, color: string, href?: string }) {
  const iconStyles: Record<string, string> = {
    blue: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25",
    emerald: "bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-500/25",
    purple: "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/25",
    orange: "bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/25"
  };

  const borderStyles: Record<string, string> = {
    blue: "hover:border-blue-300",
    emerald: "hover:border-emerald-300",
    purple: "hover:border-purple-300",
    orange: "hover:border-orange-300"
  };

  const Content = (
    <div className={`bg-white rounded-2xl border-2 border-slate-100 p-5 hover:shadow-lg transition-all group cursor-pointer ${borderStyles[color]}`}>
      <div className={`h-12 w-12 rounded-xl ${iconStyles[color]} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-2 transition-all`}>
        {icon}
      </div>
      <h4 className="text-sm font-black text-slate-800 mb-1">{title}</h4>
      <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
    </div>
  );

  if (href) return <Link href={href}>{Content}</Link>;
  return Content;
}
