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
  FileSpreadsheet,
  ChartBarBig,
  Upload,
  ArrowRight,
  Filter,
  Plus,
  Sparkles,
  Crown,
  LayoutDashboard
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
    <div className="min-h-screen pb-20 bg-transparent" dir={isRTL ? "rtl" : "ltr"}>
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

      {/* ═══════════ Page Content ═══════════ */}
      <div className="w-full px-2 pt-6 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 rounded-[3rem] shadow-2xl border border-slate-500/30 overflow-hidden"
        >
          {/* Rainbow top bar */}
          <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 via-emerald-500 to-blue-500" />

          <div className="p-6 md:p-10 space-y-6">

            {/* ── Header ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shadow-xl relative overflow-hidden"
            >
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-8 -left-8 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 relative z-10">
                {/* Title */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-3">
                    <Link href="/dashboard" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                      <LayoutDashboard size={13} />
                      لوحة التحكم
                    </Link>
                    <ArrowRight size={13} className="text-slate-500 rotate-180" />
                    <span className="text-blue-400">{t('management')}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                      <Users size={32} strokeWidth={2.5} className="text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-1">
                        {t('management')}
                      </h1>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                          <Crown size={12} />
                          {t('customersList')}
                        </span>
                        <p className="text-slate-400 text-sm font-semibold">{t('subtitle')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 xl:min-w-[400px]">
                  <StatCard label={tCommon('total')} value={stats.total} gradient="from-blue-500 to-indigo-600" />
                  <StatCard label={tCommon('active')} value={stats.active} gradient="from-emerald-500 to-teal-600" />
                  <StatCard label={tCommon('inactive')} value={stats.inactive} gradient="from-rose-500 to-pink-600" />
                </div>
              </div>
            </motion.div>

            {/* ── Search & Actions Bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col lg:flex-row gap-4 items-stretch"
            >
              {/* Search */}
              <div className="flex-1 relative">
                <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-white/30`} size={20} />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-12 pl-5' : 'pl-12 pr-5'} py-3.5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-white placeholder-white/30 font-bold text-sm focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all`}
                />
              </div>
              {/* Action buttons */}
              <div className="flex gap-3">
                <Link href="/customers/new">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59,130,246,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="h-full flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <UserPlus size={20} strokeWidth={2.5} />
                    <span>{t('addCustomer')}</span>
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-full px-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                  title={tCommon('import')}
                >
                  <FileSpreadsheet size={20} />
                </motion.button>
              </div>
            </motion.div>

            {/* ── Customers Table ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-xl"
            >
              {/* Table header bar */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xl border border-white/10">
                    <Users size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-black">{t('customersList')}</h3>
                </div>
                <span className="bg-white/20 backdrop-blur-xl px-5 py-1.5 rounded-xl text-sm font-black text-white border border-white/20">
                  {filteredCustomers.length} {t('customer')}
                </span>
              </div>

              <div className="overflow-x-auto">
                {filteredCustomers.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40`}>{t('customer')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40`}>{t('facility')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40`}>{t('taxNumber')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40`}>{t('phoneCol')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40`}>{t('statusCol')}</th>
                        <th className="text-center px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/40">{tCommon('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCustomers.map((customer, index) => (
                        <motion.tr
                          key={customer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04 }}
                          className="group hover:bg-white/5 transition-all"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3.5">
                              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                                <Users size={20} />
                              </div>
                              <div>
                                <div className="font-black text-white text-sm mb-0.5">
                                  {customer.customer_name || t('notSpecified')}
                                </div>
                                <div className="text-white/40 text-xs font-medium flex items-center gap-1.5">
                                  <Mail size={11} />
                                  {customer.email || '---'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-white font-bold text-sm">{customer.company_name}</span>
                              <span className="text-white/40 text-xs">{customer.commercial_number}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <code className="px-3 py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400 font-mono font-black text-xs">
                              {customer.vat_number}
                            </code>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 text-white/70 text-sm font-semibold">
                              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                                <Phone size={13} />
                              </div>
                              {customer.phone || '---'}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {customer.is_active ? (
                              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 w-fit">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-black">{t('activeStatus')}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-3.5 py-1.5 rounded-full border border-rose-500/20 w-fit">
                                <div className="w-2 h-2 rounded-full bg-rose-400" />
                                <span className="text-xs font-black">{t('inactiveStatus')}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-2">
                              <Link href={`/customers/${customer.id}`}>
                                <motion.button
                                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500/20 transition-all border border-blue-500/20"
                                  title={tCommon('view')}
                                >
                                  <Eye size={17} strokeWidth={2.5} />
                                </motion.button>
                              </Link>
                              <Link href={`/customers/${customer.id}/edit`}>
                                <motion.button
                                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                  className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center hover:bg-amber-500/20 transition-all border border-amber-500/20"
                                  title={tCommon('edit')}
                                >
                                  <Edit size={17} strokeWidth={2.5} />
                                </motion.button>
                              </Link>
                              <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(customer)}
                                className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500/20 transition-all border border-rose-500/20 disabled:opacity-50"
                                title={tCommon('delete')}
                              >
                                <Trash2 size={17} strokeWidth={2.5} />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-20 text-center">
                    <div className="inline-flex p-6 rounded-full bg-white/5 border border-white/10 mb-6">
                      <Users size={48} className="text-white/15" />
                    </div>
                    <h4 className="text-2xl font-black text-white/50 mb-3">{t('noCustomers')}</h4>
                    <p className="text-white/30 text-base font-semibold mb-8 max-w-sm mx-auto">{t('startAddingCustomer')}</p>
                    <Link href="/customers/new">
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-base shadow-lg shadow-blue-500/25"
                      >
                        <Plus size={22} strokeWidth={3} />
                        <span>{t('addCustomer')}</span>
                      </motion.button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── Quick Actions ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                  <Sparkles size={18} />
                </div>
                <h3 className="text-lg font-black text-white">إجراءات سريعة</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
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
                  icon={<ChartBarBig size={22} />}
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
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ label, value, gradient }: { label: string; value: number; gradient: string }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-5 shadow-2xl transition-all group cursor-default hover:-translate-y-1`}>
      <div className="relative z-10">
        <p className="text-3xl font-black text-white mb-0.5">{value}</p>
        <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
    </div>
  );
}

function QuickActionCard({ icon, title, desc, color, href }: { icon: React.ReactNode; title: string; desc: string; color: string; href?: string }) {
  const iconGradients: Record<string, string> = {
    blue: "from-blue-500 to-indigo-600 shadow-blue-500/25",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/25",
    purple: "from-purple-500 to-violet-600 shadow-purple-500/25",
    orange: "from-orange-500 to-amber-600 shadow-orange-500/25",
  };
  const hoverBorders: Record<string, string> = {
    blue: "hover:border-blue-500/30",
    emerald: "hover:border-emerald-500/30",
    purple: "hover:border-purple-500/30",
    orange: "hover:border-orange-500/30",
  };

  const Content = (
    <div className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 ${hoverBorders[color]} p-5 hover:shadow-xl hover:bg-white/[0.08] transition-all group cursor-pointer`}>
      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${iconGradients[color]} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="text-sm font-black text-white mb-1">{title}</h4>
      <p className="text-white/40 text-xs font-medium leading-relaxed">{desc}</p>
    </div>
  );

  if (href) return <Link href={href}>{Content}</Link>;
  return Content;
}
