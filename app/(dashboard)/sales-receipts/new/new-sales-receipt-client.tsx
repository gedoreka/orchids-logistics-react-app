"use client";

import React, { useState, useEffect } from "react";
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
  ChevronLeft,
  Plus,
  Trash2,
  Percent,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import { SuccessModal, ErrorModal, LoadingModal } from "@/components/ui/notification-modals";

interface Customer {
  id: number;
  customer_name: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
}

interface ProductItem {
  id: string;
  product_name: string;
  product_desc: string;
  quantity: number;
  amount_before_vat: number;
  unit_price: number;
  vat_rate: number;
  vat_amount: number;
  total_with_vat: number;
}

interface NewSalesReceiptClientProps {
  customers: Customer[];
  invoices: Invoice[];
  companyId: number;
  userName: string;
}


export function NewSalesReceiptClient({ customers, invoices, companyId, userName }: NewSalesReceiptClientProps) {
  const t = useTranslations("financialVouchersPage.newSalesReceiptPage");
  const { locale, isRTL: isRtl } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });
  const [loadingModal, setLoadingModal] = useState(false);
  
  const receiptNumber = 'RCPT' + Math.floor(10000 + Math.random() * 90000);
  
  const [formData, setFormData] = useState({
    receipt_number: receiptNumber,
    client_id: "",
    use_custom_client: false,
    client_name: "",
    client_vat: "",
    client_commercial_number: "",
    client_address: "",
    invoice_id: "",
    receipt_date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const [items, setItems] = useState<ProductItem[]>([
    { 
      id: "1", 
      product_name: "", 
      product_desc: "", 
      quantity: 1,
      amount_before_vat: 0,
      unit_price: 0, 
      vat_rate: 15,
      vat_amount: 0,
      total_with_vat: 0
    }
  ]);

  const calculateItemTotals = (item: ProductItem) => {
    const unitPrice = item.quantity > 0 ? item.amount_before_vat / item.quantity : 0;
    const vatAmount = (item.amount_before_vat * item.vat_rate) / 100;
    const total = item.amount_before_vat + vatAmount;
    return { ...item, unit_price: unitPrice, vat_amount: vatAmount, total_with_vat: total };
  };

  const calculateGrandTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    let totalAmount = 0;
    
    items.forEach(item => {
      subtotal += item.amount_before_vat;
      taxAmount += item.vat_amount;
      totalAmount += item.total_with_vat;
    });

    return { subtotal, taxAmount, totalAmount };
  };

  const { subtotal, taxAmount, totalAmount } = calculateGrandTotals();

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    if (type === "success") setSuccessModal({ isOpen: true, title, message });
    else if (type === "error") setErrorModal({ isOpen: true, title, message });
    else if (type === "loading") setLoadingModal(true);
  };

  const hideNotification = () => setLoadingModal(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (id: string, field: keyof ProductItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        return calculateItemTotals(updatedItem);
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      product_name: "",
      product_desc: "",
      quantity: 1,
      amount_before_vat: 0,
      unit_price: 0,
      vat_rate: 15,
      vat_amount: 0,
      total_with_vat: 0
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.use_custom_client && !formData.client_id) {
      showNotification("error", t("errorTitle"), t("selectCustomerError"));
      return;
    }

    if (formData.use_custom_client && !formData.client_name) {
      showNotification("error", t("errorTitle"), t("customerNameError"));
      return;
    }

    const validItems = items.filter(item => item.product_name && item.quantity > 0 && item.amount_before_vat > 0);
    if (validItems.length === 0) {
      showNotification("error", t("errorTitle"), t("addItemError"));
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
          items: validItems,
          subtotal,
          tax_amount: taxAmount,
          total_amount: totalAmount,
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
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal(prev => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
      />
      <LoadingModal isOpen={loadingModal} />
      </AnimatePresence>

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
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
                      <User size={24} />
                    </div>
                    <h3 className="text-xl font-black">{t("customerData")}</h3>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, use_custom_client: !prev.use_custom_client }))}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                  >
                    {formData.use_custom_client ? (
                      <ToggleRight className="text-emerald-400 w-6 h-6" />
                    ) : (
                      <ToggleLeft className="text-slate-400 w-6 h-6" />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {t("manualEntry")}
                    </span>
                  </button>
                </div>
                
                <div className="space-y-6">
                  {!formData.use_custom_client ? (
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
                        className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all appearance-none"
                      >
                        <option value="" className="bg-[#1e293b] text-slate-400">-- {t("selectCustomer")} --</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id} className="bg-[#1e293b] text-white">
                            {c.customer_name}
                          </option>
                        ))}
                      </select>
                      {customers.length === 0 && (
                        <div className="mt-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-start gap-3">
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
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                          {t("customerName")}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="client_name"
                          value={formData.client_name}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                          {t("vatNumber")}
                        </label>
                        <input
                          type="text"
                          name="client_vat"
                          value={formData.client_vat}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                          {t("idCrNumber")}
                        </label>
                        <input
                          type="text"
                          name="client_commercial_number"
                          value={formData.client_commercial_number}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider">
                          {t("address")}
                        </label>
                        <input
                          type="text"
                          name="client_address"
                          value={formData.client_address}
                          onChange={handleChange}
                          className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Section 3: Items Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                    <Building2 size={24} />
                  </div>
                  <h3 className="text-xl font-black">{t("receiptItems")}</h3>
                </div>
                
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm hover:bg-emerald-600 transition-all border border-emerald-400/20 shadow-xl active:scale-95"
                >
                  <Plus size={18} />
                  <span>{t("addItem")}</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/5">
                  <table className="w-full text-sm text-right">
                    <thead>
                      <tr className="bg-white/10 text-slate-300 font-black uppercase text-[10px] tracking-widest">
                        <th className="px-6 py-4">{t("itemName")}</th>
                        <th className="px-6 py-4">{t("description")}</th>
                        <th className="px-6 py-4 w-28">{t("quantity")}</th>
                        <th className="px-6 py-4 w-36">{t("amountBeforeVat")}</th>
                        <th className="px-6 py-4 w-32">{t("unitPrice")}</th>
                        <th className="px-6 py-4 w-32">{t("vatAmount")}</th>
                        <th className="px-6 py-4 w-36">{t("totalWithVat")}</th>
                        <th className="px-6 py-4 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {items.map((item, index) => (
                        <tr key={item.id} className="group/row hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              value={item.product_name}
                              onChange={(e) => handleItemChange(item.id, 'product_name', e.target.value)}
                              required
                              placeholder={t("itemNamePlaceholder")}
                              className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="text"
                              value={item.product_desc}
                              onChange={(e) => handleItemChange(item.id, 'product_desc', e.target.value)}
                              placeholder={t("itemDescriptionPlaceholder")}
                              className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                              min="1"
                              required
                              className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-xs text-center outline-none focus:border-emerald-500"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <input
                              type="number"
                              value={item.amount_before_vat || ''}
                              onChange={(e) => handleItemChange(item.id, 'amount_before_vat', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              required
                              placeholder="0.00"
                              className="w-full px-4 py-2 rounded-xl bg-white/10 border border-emerald-500/50 text-white text-xs text-center outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 text-xs text-center font-mono">
                              {item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="w-full px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center font-black">
                              {item.vat_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="w-full px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center font-black">
                              {item.total_with_vat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              <span className="text-[8px] mx-1 uppercase opacity-60">SAR</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              disabled={items.length === 1}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </motion.div>

            {/* Section 4: Totals & Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl relative overflow-hidden group h-fit"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
                    <StickyNote size={24} />
                  </div>
                  <h3 className="text-xl font-black">{t("notes")}</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder={t("notesPlaceholder")}
                      rows={6}
                      className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all resize-none font-medium"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                    <DollarSign size={24} />
                  </div>
                  <h3 className="text-xl font-black">{t("totalsSummary")}</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-6 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">{t("subtotal")}</span>
                    <span className="text-xl font-black">{subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500">SAR</span></span>
                  </div>
                  
                  <div className="flex justify-between items-center p-6 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">{t("vatTotal")}</span>
                    <span className="text-xl font-black text-amber-400">{taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs text-slate-500">SAR</span></span>
                  </div>
                  
                  <div className="flex justify-between items-center p-8 rounded-[2rem] bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border-2 border-emerald-500/30">
                    <div className="flex flex-col">
                      <span className="text-emerald-400 font-black uppercase text-[10px] tracking-widest mb-1">{t("grandTotal")}</span>
                      <span className="text-xs text-slate-500 font-medium">{t("inclusiveVat")}</span>
                    </div>
                    <span className="text-4xl md:text-5xl font-black text-emerald-400">{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm text-emerald-600">SAR</span></span>
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
          <span>{t("systemFooterBranding", { name: userName || "Logistics" })}</span>
        </div>
        <span>{t("allRightsReserved", { year: new Date().getFullYear() })}</span>
      </div>
    </div>
  );
}
