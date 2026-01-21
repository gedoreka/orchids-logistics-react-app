"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Receipt,
  User,
  Calendar,
  Hash,
  DollarSign,
  ArrowRight,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText,
  Link as LinkIcon,
  StickyNote,
  Building2,
  Sparkles,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

interface Customer {
  id: number;
  customer_name: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
}

interface NewSalesReceiptClientProps {
  customers: Customer[];
  invoices: Invoice[];
  companyId: number;
  userName: string;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function NewSalesReceiptClient({ customers, invoices, companyId, userName }: NewSalesReceiptClientProps) {
  const t = useTranslations("financialVouchersPage.newSalesReceiptPage");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });
  
  const receiptNumber = 'RCPT' + Math.floor(10000 + Math.random() * 90000);
  
  const [formData, setFormData] = useState({
    receipt_number: receiptNumber,
    client_id: "",
    invoice_id: "",
    receipt_date: new Date().toISOString().split('T')[0],
    amount: "",
    notes: ""
  });

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client_id) {
      showNotification("error", t("errorTitle"), t("selectCustomerError"));
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      showNotification("error", t("errorTitle"), t("enterAmountError"));
      return;
    }

    setLoading(true);
    showNotification("loading", t("saving"), t("saving"));

    try {
      const res = await fetch("/api/sales-receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          company_id: companyId,
          amount: parseFloat(formData.amount),
          invoice_id: formData.invoice_id || null,
          created_by: userName
        })
      });

      if (res.ok) {
        showNotification("success", t("saveSuccess"), t("saveSuccessMsg"));
        setTimeout(() => {
          router.push("/sales-receipts");
          router.refresh();
        }, 1500);
      } else {
        const data = await res.json();
        showNotification("error", t("saveFailed"), data.error || t("genericError"));
      }
    } catch {
      showNotification("error", t("error"), t("genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-8 space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
              onClick={() => notification.type !== "loading" && hideNotification()}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md p-4"
            >
              <div className={cn(
                "bg-white rounded-[2.5rem] p-10 shadow-2xl border-t-8 text-center",
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-rose-500" : "border-blue-500"
              )}>
                <div className={cn(
                  "h-24 w-24 rounded-3xl mx-auto mb-8 flex items-center justify-center rotate-3 transform transition-transform hover:rotate-6 shadow-xl",
                  notification.type === "success" ? "bg-emerald-100 text-emerald-600" :
                  notification.type === "error" ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                )}>
                  {notification.type === "success" && <CheckCircle size={48} />}
                  {notification.type === "error" && <AlertCircle size={48} />}
                  {notification.type === "loading" && <Loader2 size={48} className="animate-spin" />}
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3">{notification.title}</h3>
                <p className="text-slate-500 font-medium mb-10 leading-relaxed">{notification.message}</p>
                {notification.type !== "loading" && (
                  <button
                    onClick={hideNotification}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black text-white transition-all shadow-xl active:scale-95",
                      notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : "bg-rose-500 hover:bg-rose-600 shadow-rose-200"
                    )}
                  >
                    {isRtl ? "حسناً" : "OK"}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Unified Template */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-8 md:p-12 text-white shadow-2xl border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500" />
        
        <div className="relative z-10 space-y-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-blue-200 font-black text-[10px] uppercase tracking-widest">{t("subtitle")}</span>
              </motion.div>
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-[2rem] bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-2xl rotate-3 transform">
                  <Receipt size={40} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-blue-50 to-slate-200 bg-clip-text text-transparent">
                    {t("title")}
                  </h1>
                  <p className="text-slate-400 font-medium mt-2">{t("subtitle")}</p>
                </div>
              </div>
            </div>
            
            <Link href="/sales-receipts">
              <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/10 text-white font-black text-sm hover:bg-white/20 transition-all border border-white/10 shadow-xl group">
                <ChevronLeft className={cn("w-5 h-5 transform transition-transform group-hover:-translate-x-1", isRtl ? "rotate-180 group-hover:translate-x-1" : "")} />
                <span>{t("backToList")}</span>
              </button>
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Unified Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Section 1: Basic Info */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
                    <FileText size={24} />
                  </div>
                  <h3 className="text-xl font-black">{t("basicInfo")}</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                      <Hash size={14} />
                      {t("receiptNumber")}
                    </label>
                    <input
                      type="text"
                      value={formData.receipt_number}
                      readOnly
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-mono focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 font-bold px-2">{t("receiptNumberDesc")}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                      <Calendar size={14} />
                      {t("receiptDate")}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="receipt_date"
                      value={formData.receipt_date}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Section 2: Customer Data */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
                    <User size={24} />
                  </div>
                  <h3 className="text-xl font-black">{t("customerData")}</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                      <User size={14} />
                      {t("selectCustomer")}
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="client_id"
                      value={formData.client_id}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all appearance-none"
                    >
                      <option value="" className="bg-[#1e293b] text-slate-400">-- {t("selectCustomer")} --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id} className="bg-[#1e293b] text-white">
                          {c.customer_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {customers.length === 0 && (
                    <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-amber-200/80 text-xs font-medium leading-relaxed">
                        {t("noCustomers")} 
                        <Link href="/customers/new" className="text-amber-400 hover:underline mx-1 font-black">
                          {t("addNewCustomer")}
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Section 3: Invoice Link */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                    <LinkIcon size={24} />
                  </div>
                  <h3 className="text-xl font-black">{t("invoiceLink")}</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                      <FileText size={14} />
                      {t("linkToInvoice")}
                    </label>
                    <select
                      name="invoice_id"
                      value={formData.invoice_id}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none"
                    >
                      <option value="" className="bg-[#1e293b] text-slate-400">{t("noLink")}</option>
                      {invoices.map(inv => (
                        <option key={inv.id} value={inv.id} className="bg-[#1e293b] text-white">
                          {inv.invoice_number}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 font-bold px-2 leading-relaxed">{t("linkDesc")}</p>
                  </div>
                </div>
              </motion.div>

              {/* Section 4: Amount & Notes */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                    <DollarSign size={24} />
                  </div>
                  <h3 className="text-xl font-black">{t("amountAndNotes")}</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                      <DollarSign size={14} />
                      {t("amount")}
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                        className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all pr-16"
                      />
                      <span className={cn(
                        "absolute top-1/2 -translate-y-1/2 text-emerald-400 font-black text-sm",
                        isRtl ? "left-6" : "right-6"
                      )}>{isRtl ? "ر.س" : "SAR"}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold px-2">{t("amountDesc")}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                      <StickyNote size={14} />
                      {t("notes")}
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder={t("notesPlaceholder")}
                      rows={3}
                      className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none font-medium"
                    />
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 pt-12 border-t border-white/10">
              <Link href="/sales-receipts" className="w-full sm:w-auto">
                <button type="button" className="w-full flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-white/5 text-slate-300 font-black text-sm hover:bg-white/10 hover:text-white transition-all border border-white/10 active:scale-95">
                  <ArrowRight className={cn("w-5 h-5", isRtl ? "" : "rotate-180")} />
                  <span>{t("cancel")}</span>
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-3 px-12 py-5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-sm hover:from-teal-600 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-2xl shadow-emerald-500/20 active:scale-95 group"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Save size={20} className="group-hover:rotate-12 transition-transform" />
                )}
                <span>{t("saveReceipt")}</span>
              </button>
            </div>
          </form>
        </div>
        
        {/* Decorative BG elements */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
      </motion.div>

      {/* Footer Branding */}
      <div className={cn(
        "flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-4 opacity-60",
        isRtl ? "md:flex-row-reverse" : ""
      )}>
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-teal-500" />
          <span>{isRtl ? `نظام ${userName || "Logistics"} - إيصالات المبيعات` : `${userName || "Logistics"} System - Sales Receipts`}</span>
        </div>
        <span>{isRtl ? `جميع الحقوق محفوظة © ${new Date().getFullYear()}` : `All Rights Reserved © ${new Date().getFullYear()}`}</span>
      </div>
    </div>
  );
}
