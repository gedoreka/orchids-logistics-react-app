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
  Route,
  ArrowLeft,
  Users,
  RefreshCw,
  Printer,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const t = useTranslations("customers.viewPage");
  const { isRTL } = useLocale();
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
    if (!confirm(`${t("confirmDelete")} "${customer.customer_name || customer.company_name}"?`)) return;
    
    setDeleteLoading(true);
    showNotification("loading", t("deleting"), t("deletingMessage"));
    
    try {
      const res = await fetch(`/api/customers/${customer.id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        showNotification("success", t("deleteSuccess"), t("deleteSuccessMessage"));
        setTimeout(() => {
          router.push("/customers");
          router.refresh();
        }, 1500);
      } else {
        showNotification("error", t("deleteFailed"), t("deleteFailedMessage"));
      }
    } catch {
      showNotification("error", t("errorTitle"), t("errorMessage"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-6 space-y-8" dir={isRTL ? "rtl" : "ltr"}>
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
                      {t("okBtn")}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-[#1a2234] print:hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-8 md:p-12">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6 text-center md:text-right">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl rotate-3">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    {t("title")}
                  </h1>
                  <p className="text-white/60 font-medium mt-2 text-lg">
                    {t("subtitle")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/customers">
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl font-bold">
                    {isRTL ? <ArrowRight className="ml-2 w-4 h-4" /> : <ArrowLeft className="mr-2 w-4 h-4" />}
                    {t("backToList")}
                  </Button>
                </Link>
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="bg-amber-500/20 border-amber-500/30 text-amber-300 hover:bg-amber-500/30 font-bold rounded-xl"
                >
                  <Printer className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[1.5rem] group hover:bg-white/10 transition-all md:col-span-2">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <User className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest">{t("customerNameLabel")}</p>
                    <p className="text-xl font-black text-white">{customer.customer_name || t("notSpecified")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[1.5rem] group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest">{t("facilityName")}</p>
                    <p className="text-lg font-black text-white truncate">{customer.company_name || t("notSpecified")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[1.5rem] group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${customer.is_active ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                    {customer.is_active ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-rose-400" />}
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-black uppercase tracking-widest">Status</p>
                    <Badge className={`${customer.is_active ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border-rose-500/30"} font-bold`}>
                      {customer.is_active ? t("activeStatus") : t("inactiveStatus")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-xl">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-blue-800">{t("facilityInfo")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <InfoRow icon={<User size={18} />} label={t("customerNameLabel")} value={customer.customer_name} />
            <InfoRow icon={<Building2 size={18} />} label={t("facilityName")} value={customer.company_name} />
            <InfoRow icon={<FileText size={18} />} label={t("commercialNumber")} value={customer.commercial_number} />
            <InfoRow icon={<Receipt size={18} />} label={t("vatNumber")} value={customer.vat_number} />
            <InfoRow icon={<Hash size={18} />} label={t("unifiedNumber")} value={customer.unified_number} notSpecifiedText={t("notSpecified")} />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-xl">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-emerald-800">{t("contactInfo")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <InfoRow 
              icon={<Mail size={18} />} 
              label={t("email")} 
              value={customer.email}
              isLink={customer.email ? `mailto:${customer.email}` : undefined}
              notSpecifiedText={t("notSpecified")}
            />
            <InfoRow 
              icon={<Phone size={18} />} 
              label={t("phone")} 
              value={customer.phone}
              isLink={customer.phone ? `tel:${customer.phone}` : undefined}
              notSpecifiedText={t("notSpecified")}
            />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-50 to-violet-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-xl">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-purple-800">{t("addressInfo")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <InfoRow icon={<Globe size={18} />} label={t("country")} value={customer.country} notSpecifiedText={t("notSpecified")} />
            <InfoRow icon={<Building size={18} />} label={t("city")} value={customer.city} notSpecifiedText={t("notSpecified")} />
            <InfoRow icon={<MapPinned size={18} />} label={t("district")} value={customer.district} notSpecifiedText={t("notSpecified")} />
            <InfoRow icon={<Route size={18} />} label={t("street")} value={customer.street_name} notSpecifiedText={t("notSpecified")} />
            <InfoRow icon={<Hash size={18} />} label={t("postalCode")} value={customer.postal_code} notSpecifiedText={t("notSpecified")} />
            <InfoRow icon={<MapPin size={18} />} label={t("shortAddress")} value={customer.short_address} notSpecifiedText={t("notSpecified")} />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
          <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-xl">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold text-amber-800">{t("financialInfo")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <InfoRow icon={<Wallet size={18} />} label={t("accountCenter")} value={customer.account_name} notSpecifiedText={t("notSpecified")} />
            <InfoRow icon={<Calculator size={18} />} label={t("costCenter")} value={customer.cost_center_name} notSpecifiedText={t("notSpecified")} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/90 backdrop-blur-xl">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-500 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-lg font-bold text-slate-800">{t("systemInfo")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow 
              icon={<Calendar size={18} />} 
              label={t("createdAt")} 
              value={customer.created_at ? format(new Date(customer.created_at), 'yyyy-MM-dd HH:mm') : undefined}
              notSpecifiedText={t("notSpecified")}
            />
            <InfoRow 
              icon={<Clock size={18} />} 
              label={t("updatedAt")} 
              value={customer.updated_at && customer.updated_at !== '0000-00-00 00:00:00' 
                ? format(new Date(customer.updated_at), 'yyyy-MM-dd HH:mm') 
                : undefined
              }
              notSpecifiedText={t("notSpecified")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-8 print:hidden">
        <Link href="/customers">
          <Button 
            variant="outline"
            className="min-w-[180px] h-14 border-slate-200 bg-white text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all"
          >
            {isRTL ? <ArrowRight className="ml-2 w-5 h-5" /> : <ArrowLeft className="mr-2 w-5 h-5" />}
            {t("backBtn")}
          </Button>
        </Link>
        
        <Link href={`/customers/${customer.id}/edit`}>
          <Button 
            className="min-w-[180px] h-14 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-1 transition-all"
          >
            <Edit className="w-5 h-5 ml-2" />
            {t("editBtn")}
          </Button>
        </Link>
        
        <Button 
          onClick={handleDelete}
          disabled={deleteLoading}
          className="min-w-[180px] h-14 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-500/30 hover:shadow-rose-500/50 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
        >
          {deleteLoading ? (
            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5 ml-2" />
          )}
          {t("deleteBtn")}
        </Button>
      </div>
    </div>
  );
}

function InfoRow({ 
  icon, 
  label, 
  value, 
  isLink,
  notSpecifiedText = "غير محدد"
}: { 
  icon: React.ReactNode; 
  label: string; 
  value?: string | null; 
  isLink?: string;
  notSpecifiedText?: string;
}) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        {value ? (
          isLink ? (
            <a href={isLink} className="text-base font-bold text-blue-600 hover:underline">{value}</a>
          ) : (
            <p className="text-base font-bold text-slate-800">{value}</p>
          )
        ) : (
          <span className="inline-block text-sm text-slate-400 bg-slate-50 px-3 py-1 rounded-lg font-medium">{notSpecifiedText}</span>
        )}
      </div>
    </div>
  );
}
