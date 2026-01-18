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
  Loader2
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
    if (type !== "loading") {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    }
  };

  const handleDelete = async (id: number, customerName: string) => {
    if (!confirm(t('confirmDelete').replace('{name}', customerName))) return;
    
    setDeleteLoading(id);
    showNotification("loading", t('deleteLoading'), t('deletingCustomer'));
    
    try {
      const res = await fetch(`/api/customers/${id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setCustomers(prev => prev.filter(c => c.id !== id));
        showNotification("success", t('deleteSuccess'), t('customerDeleted'));
        router.refresh();
      } else {
        showNotification("error", t('deleteFailed'), t('deleteFailedMessage'));
      }
    } catch {
      showNotification("error", t('errorOccurred'), t('deleteError'));
    } finally {
      setDeleteLoading(null);
    }
  };

    return (
      <div className="h-full flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
        <AnimatePresence>
          {notification.show && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`fixed top-8 ${isRTL ? 'left-8' : 'right-8'} z-[100] min-w-[320px]`}
            >
              <div className={`bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex items-center gap-5`}>
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  notification.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                  notification.type === 'error' ? 'bg-rose-50 text-rose-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {notification.type === 'loading' ? (
                    <Loader2 className="animate-spin" size={28} />
                  ) : notification.type === 'success' ? (
                    <CheckCircle size={28} />
                  ) : (
                    <AlertCircle size={28} />
                  )}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">{notification.title}</h4>
                  <p className="text-slate-500 font-medium">{notification.message}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
  
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 via-rose-500 via-amber-500 via-purple-500 to-blue-500 animate-gradient-x" />
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <Users size={32} className="text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">{t('management')}</h1>
                      <p className="text-slate-300 font-medium">{t('subtitle')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/5 text-center shadow-lg">
                      <div className="text-2xl font-black text-white">{stats.total}</div>
                      <div className="text-[10px] text-slate-300 font-bold tracking-wider">{tCommon('total')}</div>
                    </div>
                    <div className="bg-emerald-500/10 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20 text-center shadow-lg">
                      <div className="text-2xl font-black text-emerald-400">{stats.active}</div>
                      <div className="text-[10px] text-emerald-200/60 font-bold tracking-wider">{tCommon('active')}</div>
                    </div>
                    <div className="bg-rose-500/10 backdrop-blur-md rounded-2xl p-4 border border-rose-500/20 text-center shadow-lg">
                      <div className="text-2xl font-black text-rose-400">{stats.inactive}</div>
                      <div className="text-[10px] text-rose-200/60 font-bold tracking-wider">{tCommon('inactive')}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
            </motion.div>
  
            <motion.div 
              className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 p-6 shadow-2xl"
              whileHover={{ y: -2 }}
            >
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className={`absolute ${isRTL ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${isRTL ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-bold transition-all shadow-sm`}
                  />
                </div>
                <div className="flex gap-4 flex-wrap">
                  <Link href="/customers/new">
                    <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
                      <UserPlus size={18} />
                      <span>{t('addCustomer')}</span>
                    </button>
                  </Link>
                  <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-slate-700 font-black text-sm border border-slate-200 hover:bg-slate-50 transition-all shadow-lg active:scale-95">
                    <FileSpreadsheet size={18} className="text-emerald-600" />
                    <span>{tCommon('export')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
  
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users size={18} className="text-blue-600" />
                  </div>
                  <h3 className="font-black text-slate-800 text-sm">{t('customersList')}</h3>
                </div>
                <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-blue-500/20">
                  {filteredCustomers.length} {t('customer')}
                </span>
              </div>

              {filteredCustomers.length > 0 ? (
                <div className="overflow-x-auto max-h-[calc(100vh-450px)]">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                      <tr className="border-b border-gray-100">
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-bold text-gray-600`}>{t('customer')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-bold text-gray-600`}>{t('facility')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-bold text-gray-600`}>{t('taxNumber')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-bold text-gray-600`}>{t('emailCol')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-bold text-gray-600`}>{t('phoneCol')}</th>
                        <th className={`${isRTL ? 'text-right' : 'text-left'} px-4 py-3 text-xs font-bold text-gray-600`}>{t('statusCol')}</th>
                        <th className="text-center px-4 py-3 text-xs font-bold text-gray-600">{t('actionsCol')}</th>
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
                                {customer.customer_name || t('notSpecified')}
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
                                {t('activeStatus')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                                <XCircle size={10} />
                                {t('inactiveStatus')}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Link href={`/customers/${customer.id}`}>
                                <button className="h-7 w-7 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all" title={tCommon('view')}>
                                  <Eye size={14} />
                                </button>
                              </Link>
                              <Link href={`/customers/${customer.id}/edit`}>
                                <button className="h-7 w-7 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all" title={tCommon('edit')}>
                                  <Edit size={14} />
                                </button>
                              </Link>
                              <button 
                                onClick={() => handleDelete(customer.id, customer.customer_name || customer.company_name)}
                                disabled={deleteLoading === customer.id}
                                className="h-7 w-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                title={tCommon('delete')}
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
                  <h4 className="text-lg font-bold text-gray-600 mb-2">{t('noCustomers')}</h4>
                  <p className="text-gray-400 text-sm mb-4">{t('startAddingCustomer')}</p>
                  <Link href="/customers/new">
                    <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all">
                      <UserPlus size={16} />
                      <span>{t('addCustomer')}</span>
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>
  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/customers/new">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center group cursor-pointer">
                  <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <UserPlus size={20} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mb-1">{t('addCustomer')}</h4>
                  <p className="text-xs text-gray-500">{t('registerNewCustomer')}</p>
                </div>
              </Link>
              
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center group cursor-pointer">
                <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Upload size={20} />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{tCommon('import')}</h4>
                <p className="text-xs text-gray-500">{t('importFromExcel')}</p>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-center group cursor-pointer">
                <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <ChartBar size={20} />
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{t('reports')}</h4>
                <p className="text-xs text-gray-500">{t('customerReports')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
