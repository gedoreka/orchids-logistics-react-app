"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Search, 
  Eye,
  Edit,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Loader2,
  User,
  Sparkles,
  Building2,
  RefreshCw,
  FileCheck,
  PlusCircle,
  Hash,
  X,
  Save,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Quotation {
  id: number;
  quotation_number: string;
  client_name: string;
  client_vat: string;
  issue_date: string;
  due_date: string;
  expiry_date: string;
  total_amount: number;
  status: string;
}

interface Customer {
  id: number;
  customer_name: string;
  company_name: string;
  vat_number: string;
  address?: string;
}

interface ProductItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  vat_amount: number;
  price_with_vat: number;
}

interface QuotationsClientProps {
  quotations: Quotation[];
  stats: {
    total: number;
    confirmed: number;
    draft: number;
    expired: number;
  };
  companyId: number;
  customers: Customer[];
  nextQuotationNumber: string;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading";
  title: string;
  message: string;
}

export function QuotationsClient({ 
  quotations: initialQuotations, 
  stats, 
  companyId, 
  customers,
  nextQuotationNumber 
}: QuotationsClientProps) {
  const [quotations, setQuotations] = useState(initialQuotations);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: ""
  });
  
  const [useCustomClient, setUseCustomClient] = useState(false);
  const [formData, setFormData] = useState({
    quotation_number: nextQuotationNumber,
    client_id: "",
    client_name: "",
    client_commercial_number: "",
    client_address: "",
    issue_date: new Date().toISOString().split('T')[0],
    due_date: ""
  });
  
  const vatRate = 15;
  
  const calculateItemTotals = (quantity: number, price: number) => {
    const vatAmount = (price * vatRate) / 100;
    const priceWithVat = price + vatAmount;
    return { vatAmount, priceWithVat };
  };
  
  const [items, setItems] = useState<ProductItem[]>([
    { id: "1", product_name: "", quantity: 1, price: 0, vat_amount: 0, price_with_vat: 0 }
  ]);

  const router = useRouter();

  const calculateTotals = () => {
    let subtotal = 0;
    let totalVat = 0;
    items.forEach(item => {
      subtotal += item.price;
      totalVat += item.vat_amount;
    });
    const total = subtotal + totalVat;
    return { subtotal, vatAmount: totalVat, total };
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  const filteredQuotations = quotations.filter(q => {
    const search = searchTerm.toLowerCase();
    return (
      q.quotation_number?.toLowerCase().includes(search) ||
      q.client_name?.toLowerCase().includes(search)
    );
  });

  const showNotification = (type: "success" | "error" | "loading", title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    if (type !== "loading") {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
    }
  };

  const handleItemChange = (id: string, field: keyof ProductItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      const updatedItem = { ...item, [field]: value };
      
      if (field === 'price') {
        const price = Number(value);
        const { vatAmount, priceWithVat } = calculateItemTotals(item.quantity, price);
        updatedItem.vat_amount = vatAmount;
        updatedItem.price_with_vat = priceWithVat;
      }
      
      return updatedItem;
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      product_name: "",
      quantity: 1,
      price: 0,
      vat_amount: 0,
      price_with_vat: 0
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const getSelectedCustomer = () => {
    if (!formData.client_id) return null;
    return customers.find(c => c.id === Number(formData.client_id));
  };

  const handleSubmit = async (status: 'draft' | 'confirmed') => {
    if (!useCustomClient && !formData.client_id) {
      showNotification("error", "خطأ في البيانات", "يرجى اختيار العميل");
      return;
    }

    if (useCustomClient && !formData.client_name) {
      showNotification("error", "خطأ في البيانات", "يرجى إدخال اسم العميل");
      return;
    }

    if (!formData.due_date) {
      showNotification("error", "خطأ في البيانات", "يرجى تحديد تاريخ الانتهاء");
      return;
    }

    const validItems = items.filter(item => item.product_name && item.quantity > 0 && item.price > 0);
    if (validItems.length === 0) {
      showNotification("error", "خطأ في البيانات", "يرجى إضافة منتج واحد على الأقل");
      return;
    }

    setLoading(true);
    showNotification("loading", "جاري الحفظ", "جاري حفظ عرض السعر...");

    const selectedCustomer = getSelectedCustomer();
    
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quotation_number: formData.quotation_number,
          company_id: companyId,
          client_id: useCustomClient ? null : formData.client_id,
          client_name: useCustomClient ? formData.client_name : (selectedCustomer?.customer_name || selectedCustomer?.company_name),
          client_commercial_number: useCustomClient ? formData.client_commercial_number : selectedCustomer?.vat_number,
          client_address: useCustomClient ? formData.client_address : selectedCustomer?.address,
          use_custom_client: useCustomClient ? 1 : 0,
          issue_date: formData.issue_date,
          due_date: formData.due_date,
          status,
          items: validItems
        })
      });

      if (res.ok) {
        showNotification("success", "تم الحفظ بنجاح", status === 'confirmed' ? "تم حفظ وتأكيد عرض السعر" : "تم حفظ عرض السعر كمسودة");
        setTimeout(() => {
          setShowForm(false);
          router.refresh();
          setFormData({
            quotation_number: nextQuotationNumber,
            client_id: "",
            client_name: "",
            client_commercial_number: "",
            client_address: "",
            issue_date: new Date().toISOString().split('T')[0],
            due_date: ""
          });
          setUseCustomClient(false);
          setItems([{ id: "1", product_name: "", quantity: 1, price: 0, vat_amount: 0, price_with_vat: 0 }]);
        }, 1500);
      } else {
        const data = await res.json();
        showNotification("error", "فشل الحفظ", data.error || "فشل حفظ عرض السعر");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, quotationNumber: string) => {
    if (!confirm(`هل أنت متأكد من حذف عرض السعر "${quotationNumber}"؟`)) return;
    
    setDeleteLoading(id);
    showNotification("loading", "جاري الحذف", "جاري حذف عرض السعر...");
    
    try {
      const res = await fetch(`/api/quotations/${id}?company_id=${companyId}`, {
        method: "DELETE"
      });
      
      if (res.ok) {
        setQuotations(prev => prev.filter(q => q.id !== id));
        showNotification("success", "تم الحذف بنجاح", "تم حذف عرض السعر بنجاح");
        router.refresh();
      } else {
        showNotification("error", "فشل الحذف", "فشل حذف عرض السعر");
      }
    } catch {
      showNotification("error", "خطأ", "حدث خطأ أثناء الحذف");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusBadge = (status: string, expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (status === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20">
          <CheckCircle size={12} />
          مؤكد
        </span>
      );
    } else if (expiry < today) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 text-[10px] font-black rounded-full border border-rose-500/20">
          <Clock size={12} />
          منتهي
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black rounded-full border border-amber-500/20">
          <Edit size={12} />
          مسودة
        </span>
      );
    }
  };

  const selectedCustomer = getSelectedCustomer();

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-8 space-y-8" dir="rtl">
      <AnimatePresence>
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
              onClick={() => notification.type !== "loading" && setNotification(prev => ({ ...prev, show: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-full max-w-md p-4"
            >
              <div className={cn(
                "bg-white rounded-[2.5rem] p-8 shadow-2xl border-t-8",
                notification.type === "success" ? "border-emerald-500" :
                notification.type === "error" ? "border-red-500" : "border-blue-500"
              )}>
                <div className="text-center">
                  <div className={cn(
                    "h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center",
                    notification.type === "success" ? "bg-emerald-100 text-emerald-500" :
                    notification.type === "error" ? "bg-red-100 text-red-500" : "bg-blue-100 text-blue-500"
                  )}>
                    {notification.type === "success" && <CheckCircle size={40} />}
                    {notification.type === "error" && <AlertCircle size={40} />}
                    {notification.type === "loading" && <Loader2 size={40} className="animate-spin" />}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-2">{notification.title}</h3>
                  <p className="text-gray-500 mb-6 font-medium">{notification.message}</p>
                  {notification.type !== "loading" && (
                    <button
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className={cn(
                        "w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg active:scale-95",
                        notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                      )}
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

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-rose-500 via-emerald-500 to-blue-500 animate-gradient-x" />
        
        <div className="relative z-10 space-y-10">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-right space-y-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-blue-200 font-black text-[10px] uppercase tracking-widest">إدارة عروض الأسعار</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                عروض الأسعار
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
                إنشاء ومتابعة عروض الأسعار والتقديرات المالية للعملاء بكل احترافية
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                <button 
                  onClick={() => setShowForm(!showForm)}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 font-black text-sm rounded-2xl transition-all shadow-xl active:scale-95",
                    showForm ? "bg-white/10 text-white border border-white/20" : "bg-purple-500 text-white hover:bg-purple-600 shadow-purple-500/20"
                  )}
                >
                  {showForm ? <X size={18} /> : <Plus size={18} />}
                  {showForm ? "إلغاء النموذج" : "إنشاء عرض سعر جديد"}
                </button>
                <button 
                    onClick={() => router.refresh()}
                    className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95"
                  >
                  <RefreshCw size={18} className="text-purple-400" />
                  تحديث البيانات
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-purple-300 font-black text-[10px] uppercase tracking-wider">الإجمالي</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{stats.total}</p>
                <p className="text-purple-400/60 text-[10px] font-black mt-1">عرض سعر</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-emerald-300 font-black text-[10px] uppercase tracking-wider">المؤكدة</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{stats.confirmed}</p>
                <p className="text-emerald-400/60 text-[10px] font-black mt-1">عرض معتمد</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                    <Edit className="w-5 h-5" />
                  </div>
                  <span className="text-amber-300 font-black text-[10px] uppercase tracking-wider">المسودات</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{stats.draft}</p>
                <p className="text-amber-400/60 text-[10px] font-black mt-1">قيد المراجعة</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400 group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-rose-300 font-black text-[10px] uppercase tracking-wider">المنتهية</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{stats.expired}</p>
                <p className="text-rose-400/60 text-[10px] font-black mt-1">عرض منتهي</p>
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400">
                                <PlusCircle className="w-8 h-8" />
                            </div>
                            <div>
                                  <h2 className="text-2xl font-black text-white">إنشاء عرض سعر جديد</h2>
                                  <p className="text-slate-400 font-bold tracking-wide">يرجى تعبئة بيانات العرض والمنتجات بعناية</p>
                              </div>
                          </div>
                      </div>

                      <div className="p-8 space-y-8">
                          {/* Info Section */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">رقم العرض</label>
                                  <div className="relative">
                                      <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input
                                          type="text"
                                          value={formData.quotation_number}
                                          readOnly
                                          className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold outline-none opacity-60"
                                      />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تاريخ الإصدار</label>
                                  <div className="relative">
                                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input
                                          type="date"
                                          value={formData.issue_date}
                                          onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                                          className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-purple-500 outline-none transition-all"
                                      />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تاريخ الانتهاء</label>
                                  <div className="relative">
                                      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                      <input
                                          type="date"
                                          value={formData.due_date}
                                          onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                          className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-purple-500 outline-none transition-all"
                                          required
                                      />
                                  </div>
                              </div>
                          </div>

                          {/* Customer Section */}
                          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                              <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                      <h3 className="text-lg font-black text-white">بيانات العميل</h3>
                                      <p className="text-xs text-slate-400 font-bold">
                                          {useCustomClient 
                                              ? "أدخل بيانات العميل يدوياً" 
                                              : "اختر من قائمة العملاء المسجلين"}
                                      </p>
                                  </div>
                                  <button
                                      type="button"
                                      onClick={() => setUseCustomClient(!useCustomClient)}
                                      className={cn(
                                          "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all border",
                                          useCustomClient 
                                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
                                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                      )}
                                  >
                                      <Edit2 size={14} />
                                      {useCustomClient ? "إلغاء الإدخال اليدوي" : "إدخال يدوي للعميل"}
                                  </button>
                              </div>

                              <AnimatePresence mode="wait">
                                  {!useCustomClient ? (
                                      <motion.div
                                          key="select-customer"
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          className="space-y-4"
                                      >
                                          <div className="relative">
                                              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                              <select
                                                  value={formData.client_id}
                                                  onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                                                  className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-purple-500 outline-none transition-all appearance-none"
                                                  required
                                              >
                                                  <option value="" className="bg-slate-800">اختر العميل...</option>
                                                  {customers.map(c => (
                                                      <option key={c.id} value={c.id} className="bg-slate-800">
                                                          {c.customer_name || c.company_name} - {c.vat_number}
                                                      </option>
                                                  ))}
                                              </select>
                                          </div>
                                          
                                          {selectedCustomer && (
                                              <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 flex items-center gap-4">
                                                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                                      <Building2 size={20} />
                                                  </div>
                                                  <div className="flex-1">
                                                      <p className="text-[10px] text-blue-400 font-bold mb-1">العميل المختار:</p>
                                                      <p className="text-sm font-black text-white">
                                                          {selectedCustomer.customer_name || selectedCustomer.company_name}
                                                      </p>
                                                      <p className="text-[10px] text-blue-400/70 font-bold">
                                                          سجل تجاري: {selectedCustomer.vat_number || "غير محدد"}
                                                      </p>
                                                  </div>
                                                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20">
                                                      مسجل
                                                  </span>
                                              </div>
                                          )}
                                      </motion.div>
                                  ) : (
                                      <motion.div
                                          key="manual-customer"
                                          initial={{ opacity: 0, y: -10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          exit={{ opacity: 0, y: -10 }}
                                          className="grid grid-cols-1 md:grid-cols-3 gap-6"
                                      >
                                          <div className="space-y-2">
                                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">اسم العميل</label>
                                              <div className="relative">
                                                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                  <input
                                                      type="text"
                                                      value={formData.client_name}
                                                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                                                      placeholder="اسم العميل أو الشركة..."
                                                      className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-purple-500 outline-none transition-all"
                                                      required={useCustomClient}
                                                  />
                                              </div>
                                          </div>
                                          <div className="space-y-2">
                                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">رقم السجل التجاري</label>
                                              <div className="relative">
                                                  <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                  <input
                                                      type="text"
                                                      value={formData.client_commercial_number}
                                                      onChange={(e) => setFormData({...formData, client_commercial_number: e.target.value})}
                                                      placeholder="رقم السجل التجاري..."
                                                      className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-purple-500 outline-none transition-all"
                                                  />
                                              </div>
                                          </div>
                                          <div className="space-y-2">
                                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">العنوان</label>
                                              <div className="relative">
                                                  <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                  <input
                                                      type="text"
                                                      value={formData.client_address}
                                                      onChange={(e) => setFormData({...formData, client_address: e.target.value})}
                                                      placeholder="عنوان العميل..."
                                                      className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-purple-500 outline-none transition-all"
                                                  />
                                              </div>
                                          </div>
                                      </motion.div>
                                  )}
                              </AnimatePresence>
                          </div>

                          {/* Items Section */}
                          <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-black text-white">المنتجات / الخدمات</h3>
                                  <button
                                      onClick={addItem}
                                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                                  >
                                      <Plus size={14} />
                                      إضافة منتج
                                  </button>
                              </div>

                              {/* Table Header */}
                              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                                  <div className="grid grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                      <div className="col-span-3">اسم المنتج</div>
                                      <div className="col-span-1 text-center">الكمية</div>
                                      <div className="col-span-2 text-center">السعر</div>
                                      <div className="col-span-2 text-center">الضريبة (15%)</div>
                                      <div className="col-span-3 text-center">شامل الضريبة</div>
                                      <div className="col-span-1"></div>
                                  </div>
                              </div>

                              <div className="space-y-3">
                                  {items.map((item) => (
                                      <motion.div 
                                          key={item.id}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          className="bg-white/5 rounded-2xl p-4 border border-white/10 group relative"
                                      >
                                          <div className="grid grid-cols-12 gap-4 items-center">
                                              <div className="col-span-3">
                                                  <input
                                                      type="text"
                                                      value={item.product_name}
                                                      onChange={(e) => handleItemChange(item.id, 'product_name', e.target.value)}
                                                      placeholder="اسم المنتج..."
                                                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold focus:bg-white/10 focus:border-purple-500 outline-none transition-all"
                                                  />
                                              </div>
                                              <div className="col-span-1">
                                                  <input
                                                      type="number"
                                                      value={item.quantity}
                                                      onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                      className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold focus:bg-white/10 focus:border-purple-500 outline-none transition-all text-center"
                                                      min="1"
                                                  />
                                              </div>
                                              <div className="col-span-2">
                                                  <div className="relative">
                                                      <input
                                                          type="number"
                                                          step="0.01"
                                                          value={item.price}
                                                          onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                                                          placeholder="أدخل السعر..."
                                                          className="w-full px-2 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold focus:bg-white/10 focus:border-purple-500 outline-none transition-all text-center"
                                                      />
                                                  </div>
                                              </div>
                                              <div className="col-span-2 text-center">
                                                  <div className="bg-amber-500/10 rounded-lg py-2 px-3 border border-amber-500/20">
                                                      <span className="text-amber-400 font-bold text-sm">{item.vat_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                      <span className="text-amber-400/50 text-[10px] mr-1">ر.س</span>
                                                  </div>
                                              </div>
                                              <div className="col-span-3 text-center">
                                                  <div className="bg-emerald-500/10 rounded-lg py-2 px-3 border border-emerald-500/20">
                                                      <span className="text-emerald-400 font-black text-sm">{item.price_with_vat.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                      <span className="text-emerald-400/50 text-[10px] mr-1">ر.س</span>
                                                  </div>
                                              </div>
                                              <div className="col-span-1 flex justify-center">
                                                  <button
                                                      onClick={() => removeItem(item.id)}
                                                      disabled={items.length === 1}
                                                      className="h-9 w-9 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-30"
                                                  >
                                                      <Trash2 size={14} />
                                                  </button>
                                              </div>
                                          </div>
                                      </motion.div>
                                  ))}
                              </div>
                          </div>

                          {/* Totals Summary */}
                          <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                              <div className="grid grid-cols-2 gap-8 w-full md:w-auto">
                                  <div>
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">المجموع الفرعي</p>
                                      <p className="text-xl font-black text-white">{subtotal.toLocaleString()} <span className="text-xs text-slate-500">ر.س</span></p>
                                  </div>
                                  <div>
                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">إجمالي الضريبة ({vatRate}%)</p>
                                      <p className="text-xl font-black text-amber-400">{vatAmount.toLocaleString()} <span className="text-xs text-amber-400/50">ر.س</span></p>
                                  </div>
                              </div>
                              <div className="text-center md:text-left bg-emerald-500/10 px-8 py-4 rounded-3xl border border-emerald-500/20">
                                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">الإجمالي الكلي</p>
                                  <p className="text-4xl font-black text-emerald-400">{total.toLocaleString()} <span className="text-sm">ر.س</span></p>
                              </div>
                          </div>

                          {/* Form Actions */}
                          <div className="flex justify-end gap-4">
                              <button
                                  onClick={() => setShowForm(false)}
                                  className="px-10 py-4 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                              >
                                  إلغاء
                              </button>
                              <button
                                  onClick={() => handleSubmit('draft')}
                                  disabled={loading}
                                  className="flex items-center gap-3 px-8 py-4 bg-white/10 text-white font-black rounded-2xl border border-white/10 hover:bg-white/20 transition-all active:scale-95 disabled:opacity-50"
                              >
                                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                  حفظ كمسودة
                              </button>
                              <button
                                  onClick={() => handleSubmit('confirmed')}
                                  disabled={loading}
                                  className="flex items-center gap-3 px-10 py-4 bg-purple-500 text-white font-black rounded-2xl shadow-xl shadow-purple-500/20 hover:bg-purple-600 transition-all active:scale-95 disabled:opacity-50"
                              >
                                  {loading ? <Loader2 size={20} className="animate-spin" /> : <FileCheck size={20} />}
                                  حفظ وتأكيد العرض
                              </button>
                          </div>
                      </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Search & Filter Bar */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="بحث برقم العرض أو اسم العميل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-white/10 border border-white/10 rounded-2xl text-white font-medium focus:bg-white/20 focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-500"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-500/20 text-blue-300 font-bold rounded-2xl border border-blue-500/30 hover:bg-blue-500/30 transition-all">
                <FileSpreadsheet size={18} />
                تصدير البيانات
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="font-black text-lg">سجل عروض الأسعار</h3>
              </div>
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                {filteredQuotations.length} عرض موجود
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم العرض</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">العميل</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">تاريخ العرض</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">صلاحية العرض</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">المبلغ الإجمالي</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredQuotations.length > 0 ? (
                    filteredQuotations.map((quotation, idx) => (
                      <motion.tr 
                        key={quotation.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * idx }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <span className="px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-black border border-purple-500/20">
                            {quotation.quotation_number}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all">
                              <User size={16} />
                            </div>
                            <span className="font-bold text-sm text-slate-200">{quotation.client_name || "غير محدد"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                            <Calendar size={14} className="text-slate-500" />
                            {quotation.issue_date ? format(new Date(quotation.issue_date), 'yyyy/MM/dd') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                            <Clock size={14} className="text-slate-500" />
                            {quotation.expiry_date || quotation.due_date ? format(new Date(quotation.expiry_date || quotation.due_date), 'yyyy/MM/dd') : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-baseline gap-1 text-emerald-400">
                            <span className="text-lg font-black">{Number(quotation.total_amount || 0).toLocaleString()}</span>
                            <span className="text-[10px] font-bold text-emerald-400/50 uppercase">ر.س</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          {getStatusBadge(quotation.status, quotation.expiry_date || quotation.due_date)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/quotations/${quotation.id}`}>
                              <button className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95" title="عرض">
                                <Eye size={16} />
                              </button>
                            </Link>
                            <Link href={`/quotations/${quotation.id}/edit`}>
                              <button className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95" title="تعديل">
                                <Edit size={16} />
                              </button>
                            </Link>
                            <button 
                              onClick={() => handleDelete(quotation.id, quotation.quotation_number)}
                              disabled={deleteLoading === quotation.id}
                              className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95 disabled:opacity-50"
                              title="حذف"
                            >
                              {deleteLoading === quotation.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-40">
                          <FileText size={64} className="text-slate-400" />
                          <div className="space-y-1">
                            <p className="text-xl font-black text-slate-300">لا توجد عروض أسعار</p>
                            <p className="text-sm font-medium text-slate-500">ابدأ بإنشاء أول عرض سعر من الزر أعلاه</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-4 opacity-60">
        <div className="flex items-center gap-2">
          <Sparkles size={10} className="text-purple-500" />
          <span>نظام ZoolSpeed Logistics - إدارة عروض الأسعار</span>
        </div>
        <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
