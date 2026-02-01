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
  Plus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "@/lib/locale-context";

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
  const { isRTL } = useLocale();
  const t = useTranslations('customers');
  const tCommon = useTranslations('common');

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
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleDelete = async (id: number, customerName: string) => {
    if (!confirm(t('confirmDelete').replace('{name}', customerName))) return;
    
    setDeleteLoading(id);
    showNotification("loading", "جاري الحذف", "جاري حذف بيانات العميل...");
    
    try {
      const res = await fetch(`/api/customers/${id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        showNotification("success", "تم الحذف بنجاح", "تم حذف العميل بنجاح من النظام");
        router.refresh();
      } else {
        showNotification("error", "فشل الحذف", "حدث خطأ أثناء محاولة حذف العميل");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ غير متوقع");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d1525] relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[150px] -ml-96 -mb-96 pointer-events-none" />

      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0d1525]/80 backdrop-blur-xl z-[10000]"
              onClick={() => notification.type !== "loading" && hideNotification()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10001] w-full max-w-md p-4"
            >
              <div className={`bg-white rounded-[2.5rem] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] border-t-[12px] ${
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-red-500" : "border-blue-500"
              }`}>
                <div className="text-center">
                  <div className={`h-28 w-28 rounded-full mx-auto mb-8 flex items-center justify-center ${
                    notification.type === "success" ? "bg-emerald-50 text-emerald-500" :
                    notification.type === "error" ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-500"
                  }`}>
                    {notification.type === "success" && <CheckCircle size={56} strokeWidth={2.5} />}
                    {notification.type === "error" && <AlertCircle size={56} strokeWidth={2.5} />}
                    {notification.type === "loading" && <Loader2 size={56} className="animate-spin" strokeWidth={2.5} />}
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3">{notification.title}</h3>
                  <p className="text-slate-500 mb-10 text-lg leading-relaxed font-bold">{notification.message}</p>
                  {notification.type !== "loading" && (
                    <button
                      onClick={hideNotification}
                      className={`w-full py-5 rounded-2xl font-black text-white text-xl shadow-2xl transition-all active:scale-95 ${
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30" : "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                      }`}
                    >
                      موافق
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex-1 p-4 md:p-8 lg:p-10">
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Header Card */}
          <div className="relative overflow-hidden bg-white/5 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 text-white shadow-2xl border border-white/10">
            <div className="relative z-10">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-10">
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="h-20 w-24 md:h-24 md:w-28 rounded-[2rem] bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3 border border-white/20">
                    <Users size={48} strokeWidth={2.5} className="-rotate-3" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">{t('management')}</h1>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-black border border-blue-500/20">
                        {t('customersList')}
                      </span>
                      <p className="text-slate-400 text-lg md:text-xl font-bold">{t('subtitle')}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:min-w-[500px]">
                  <StatCard label={tCommon('total')} value={stats.total} color="blue" />
                  <StatCard label={tCommon('active')} value={stats.active} color="emerald" />
                  <StatCard label={tCommon('inactive')} value={stats.inactive} color="rose" />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
          </div>

          {/* Search and Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-6 shadow-2xl">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-white/30`} size={24} />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-16 pl-8' : 'pl-16 pr-8'} py-6 rounded-[1.5rem] border-2 border-white/10 bg-white/5 focus:bg-white/10 focus:border-blue-500 focus:ring-[6px] focus:ring-blue-500/5 outline-none transition-all text-xl font-black text-white placeholder:text-white/20`}
                />
              </div>
            </div>
            <div className="lg:col-span-4 flex gap-4">
              <Link href="/customers/new" className="flex-1">
                <button className="w-full h-full flex items-center justify-center gap-4 px-8 py-6 rounded-[2.5rem] bg-emerald-500 text-white font-black text-xl hover:bg-emerald-600 transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 group">
                  <UserPlus size={28} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                  <span>{t('addCustomer')}</span>
                </button>
              </Link>
              <button className="px-8 rounded-[2.5rem] bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all active:scale-95">
                <FileSpreadsheet size={28} className="text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-10 py-6 flex items-center justify-between text-white border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xl border border-white/20">
                  <Users size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black">{t('customersList')}</h3>
              </div>
              <span className="bg-white/20 backdrop-blur-xl px-6 py-2 rounded-2xl text-sm font-black border border-white/20">
                {filteredCustomers.length} {t('customer')}
              </span>
            </div>

            <div className="overflow-x-auto">
              {filteredCustomers.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-slate-400">
                      <th className={`${isRTL ? 'text-right' : 'text-left'} px-8 py-6 text-sm font-black uppercase tracking-wider`}>{t('customer')}</th>
                      <th className={`${isRTL ? 'text-right' : 'text-left'} px-8 py-6 text-sm font-black uppercase tracking-wider`}>{t('facility')}</th>
                      <th className={`${isRTL ? 'text-right' : 'text-left'} px-8 py-6 text-sm font-black uppercase tracking-wider`}>{t('taxNumber')}</th>
                      <th className={`${isRTL ? 'text-right' : 'text-left'} px-8 py-6 text-sm font-black uppercase tracking-wider`}>{t('phoneCol')}</th>
                      <th className={`${isRTL ? 'text-right' : 'text-left'} px-8 py-6 text-sm font-black uppercase tracking-wider`}>{t('statusCol')}</th>
                      <th className="text-center px-8 py-6 text-sm font-black uppercase tracking-wider">{tCommon('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCustomers.map((customer) => (
                      <tr 
                        key={customer.id}
                        className="group hover:bg-white/5 transition-all cursor-default"
                      >
                        <td className="px-8 py-7">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5 group-hover:scale-110 transition-transform">
                              <Users size={22} />
                            </div>
                            <div>
                              <div className="font-black text-white text-lg mb-0.5">
                                {customer.customer_name || t('notSpecified')}
                              </div>
                              <div className="text-slate-500 text-sm font-bold flex items-center gap-1.5">
                                <Mail size={12} />
                                {customer.email || '---'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex flex-col">
                            <span className="text-slate-200 font-black text-base">{customer.company_name}</span>
                            <span className="text-slate-500 text-sm font-bold">{customer.commercial_number}</span>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          <code className="px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-blue-400 font-mono font-bold text-sm">
                            {customer.vat_number}
                          </code>
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex items-center gap-2 text-slate-300 font-bold">
                            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                              <Phone size={14} />
                            </div>
                            {customer.phone || '---'}
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          {customer.is_active ? (
                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 w-fit">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-xs font-black">{t('activeStatus')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20 w-fit">
                              <div className="w-2 h-2 rounded-full bg-rose-500" />
                              <span className="text-xs font-black">{t('inactiveStatus')}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex items-center justify-center gap-3">
                            <Link href={`/customers/${customer.id}`}>
                              <button className="h-11 w-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 shadow-lg shadow-blue-500/10 active:scale-90" title={tCommon('view')}>
                                <Eye size={20} strokeWidth={2.5} />
                              </button>
                            </Link>
                            <Link href={`/customers/${customer.id}/edit`}>
                              <button className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20 shadow-lg shadow-amber-500/10 active:scale-90" title={tCommon('edit')}>
                                <Edit size={20} strokeWidth={2.5} />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(customer.id, customer.customer_name || customer.company_name)}
                              disabled={deleteLoading === customer.id}
                              className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 shadow-lg shadow-rose-500/10 active:scale-90 disabled:opacity-50"
                              title={tCommon('delete')}
                            >
                              {deleteLoading === customer.id ? (
                                <Loader2 size={20} className="animate-spin" />
                              ) : (
                                <Trash2 size={20} strokeWidth={2.5} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-24 text-center">
                  <div className="h-28 w-28 bg-white/5 rounded-[2rem] flex items-center justify-center text-slate-700 mx-auto mb-8 border border-white/5">
                    <Users size={64} strokeWidth={1} />
                  </div>
                  <h4 className="text-3xl font-black text-white mb-4">{t('noCustomers')}</h4>
                  <p className="text-slate-500 text-xl font-bold mb-10 max-w-md mx-auto">{t('startAddingCustomer')}</p>
                  <Link href="/customers/new">
                    <button className="inline-flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-emerald-500 text-white font-black text-xl hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-500/30 active:scale-95">
                      <Plus size={28} strokeWidth={3} />
                      <span>{t('addCustomer')}</span>
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
            <QuickActionCard 
              icon={<UserPlus size={24} />} 
              title={t('addCustomer')} 
              desc={t('registerNewCustomer')} 
              color="blue"
              href="/customers/new"
            />
            <QuickActionCard 
              icon={<Upload size={24} />} 
              title={tCommon('import')} 
              desc={t('importFromExcel')} 
              color="emerald"
            />
            <QuickActionCard 
              icon={<ChartBar size={24} />} 
              title={t('reports')} 
              desc={t('customerReports')} 
              color="purple"
            />
            <QuickActionCard 
              icon={<Filter size={24} />} 
              title="تصفية متقدمة" 
              desc="فرز حسب المنطقة أو النشاط" 
              color="orange"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: number, color: "blue" | "emerald" | "rose" }) {
  const colors = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10"
  };

  return (
    <div className={`${colors[color]} backdrop-blur-xl rounded-3xl p-6 border shadow-2xl transition-transform hover:-translate-y-1`}>
      <div className="text-4xl font-black mb-1">{value}</div>
      <div className="text-sm font-black uppercase tracking-wider opacity-60">{label}</div>
    </div>
  );
}

function QuickActionCard({ icon, title, desc, color, href }: { icon: React.ReactNode, title: string, desc: string, color: string, href?: string }) {
  const colorStyles: any = {
    blue: "bg-blue-500 shadow-blue-500/20",
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    purple: "bg-purple-500 shadow-purple-500/20",
    orange: "bg-orange-500 shadow-orange-500/20"
  };

  const Content = (
    <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl hover:bg-white/10 transition-all group cursor-pointer h-full border-b-[6px] border-b-white/5 hover:border-b-white/20">
      <div className={`h-16 w-16 rounded-2xl ${colorStyles[color]} flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all`}>
        {icon}
      </div>
      <h4 className="text-xl font-black text-white mb-2">{title}</h4>
      <p className="text-slate-500 font-bold leading-relaxed">{desc}</p>
    </div>
  );

  if (href) return <Link href={href}>{Content}</Link>;
  return Content;
}
