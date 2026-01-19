"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Search, Edit2, Trash2, Printer, Download,
  Calendar, User, CreditCard, Building2, MapPin, X, Check,
  ChevronDown, AlertCircle, Sparkles, RefreshCw, FileSpreadsheet,
  TrendingUp, TrendingDown, DollarSign, ScrollText, PlusCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PromissoryNote {
  id: number;
  note_number: string;
  debtor_name: string | null;
  debtor_id_number: string | null;
  amount: number | null;
  amount_text: string | null;
  creation_date: string | null;
  due_date: string | null;
  creation_place: string | null;
  debtor_address: string | null;
  beneficiary_name: string | null;
  beneficiary_commercial_number: string | null;
  beneficiary_id_number: string | null;
  beneficiary_id_type: "commercial" | "national" | null;
  use_custom_beneficiary: boolean;
  status: string;
  notes: string | null;
  created_at: string;
}

interface CompanyInfo {
  name: string;
  commercial_number: string;
}

const numberToArabicWords = (num: number): string => {
  if (!num || isNaN(num)) return "";
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسائة"];
  const thousands = ["", "ألف", "ألفان", "ثلاثة آلاف", "أربعة آلاف", "خمسة آلاف", "ستة آلاف", "سبعة آلاف", "ثمانية آلاف", "تسعة آلاف"];
  
  if (num === 0) return "صفر";
  if (num < 10) return ones[num];
  if (num < 100) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    if (o === 0) return tens[t];
    return ones[o] + " و" + tens[t];
  }
  if (num < 1000) {
    const h = Math.floor(num / 100);
    const r = num % 100;
    if (r === 0) return hundreds[h];
    return hundreds[h] + " و" + numberToArabicWords(r);
  }
  if (num < 10000) {
    const th = Math.floor(num / 1000);
    const r = num % 1000;
    if (r === 0) return thousands[th];
    return thousands[th] + " و" + numberToArabicWords(r);
  }
  return num.toLocaleString("ar-SA");
};

const formatAmount = (amount: number | null): string => {
  if (!amount) return "..........................................";
  return amount.toLocaleString("ar-SA", { minimumFractionDigits: 2 });
};

const formatDate = (date: string | null) => {
  if (!date) return "........ / ........ / ........";
  return new Date(date).toLocaleDateString("en-GB");
};

export default function PromissoryNotesClient() {
  const [notes, setNotes] = useState<PromissoryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<PromissoryNote | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [selectedNote, setSelectedNote] = useState<PromissoryNote | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    debtor_name: "",
    debtor_id_number: "",
    amount: "",
    creation_date: new Date().toISOString().split("T")[0],
    due_date: "",
    creation_place: "",
    debtor_address: "",
    beneficiary_name: "",
    beneficiary_commercial_number: "",
    beneficiary_id_number: "",
    beneficiary_id_type: "commercial" as "commercial" | "national",
    use_custom_beneficiary: false,
    status: "draft",
    notes: ""
  });

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promissory-notes");
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyInfo = async () => {
    try {
      const res = await fetch("/api/company-info");
      const data = await res.json();
      if (data.company) {
        setCompanyInfo({
          name: data.company.name,
          commercial_number: data.company.commercial_number || ""
        });
      }
    } catch (error) {
      console.error("Error fetching company info:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
    fetchCompanyInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        amount_text: formData.amount ? numberToArabicWords(Math.floor(parseFloat(formData.amount))) + " ريال" : null,
        ...(editingNote ? { id: editingNote.id } : {})
      };

      const res = await fetch("/api/promissory-notes", {
        method: editingNote ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchNotes();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا السند؟")) return;
    try {
      const res = await fetch(`/api/promissory-notes?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      debtor_name: "",
      debtor_id_number: "",
      amount: "",
      creation_date: new Date().toISOString().split("T")[0],
      due_date: "",
      creation_place: "",
      debtor_address: "",
      beneficiary_name: "",
      beneficiary_commercial_number: "",
      beneficiary_id_number: "",
      beneficiary_id_type: "commercial",
      use_custom_beneficiary: false,
      status: "draft",
      notes: ""
    });
    setEditingNote(null);
    setShowForm(false);
  };

  const openEdit = (note: PromissoryNote) => {
    setEditingNote(note);
    setFormData({
      debtor_name: note.debtor_name || "",
      debtor_id_number: note.debtor_id_number || "",
      amount: note.amount?.toString() || "",
      creation_date: note.creation_date?.split("T")[0] || "",
      due_date: note.due_date?.split("T")[0] || "",
      creation_place: note.creation_place || "",
      debtor_address: note.debtor_address || "",
      beneficiary_name: note.beneficiary_name || "",
      beneficiary_commercial_number: note.beneficiary_commercial_number || "",
      beneficiary_id_number: note.beneficiary_id_number || "",
      beneficiary_id_type: note.beneficiary_id_type || "commercial",
      use_custom_beneficiary: note.use_custom_beneficiary,
      status: note.status,
      notes: note.notes || ""
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPrintPreview = (note: PromissoryNote) => {
    setSelectedNote(note);
    setShowPrintPreview(true);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سند لأمر - ${selectedNote?.note_number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 20px; background: #fff; color: #000; }
          .print-container { max-width: 800px; margin: 0 auto; border: 4px double #000; padding: 30px; background: #fff; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .header h1 { font-size: 28px; color: #000; font-weight: 700; }
          .header p { color: #000; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; color: #000; }
            .content { line-height: 2.2; font-size: 16px; text-align: justify; margin-bottom: 30px; color: #000; }
            .field { min-width: 180px; display: inline-block; text-align: center; padding: 4px 16px; font-weight: 700; color: #000; }
            .field-large { min-width: 250px; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 30px; border-top: 2px solid #000; }
            .signature-box { text-align: center; width: 200px; }
            .signature-box p { margin-bottom: 10px; font-weight: 700; color: #000; }
            .signature-line { border-bottom: 2px solid #000; height: 70px; margin-bottom: 10px; }
            .fingerprint-box { width: 90px; height: 90px; border: 2px solid #000; border-radius: 50%; margin: 0 auto; }
            .info-row { display: flex; gap: 40px; margin-bottom: 20px; }
            .info-item { flex: 1; }
            .info-item p.label { font-weight: 700; margin-bottom: 8px; color: #000; }
            .info-item p.value { padding-bottom: 8px; min-height: 30px; color: #000; font-weight: 700; }
          @media print { 
            body { padding: 0; } 
            .print-container { border: 4px double #000; }
            @page { margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <h1>سند لأمـــر</h1>
            <p>رقم السند: ${selectedNote?.note_number}</p>
          </div>
          <div class="meta-row">
            <div><strong>تاريخ الإنشاء:</strong> ${formatDate(selectedNote?.creation_date || null)} م</div>
            <div><strong>مكان الإنشاء:</strong> المدينة ${selectedNote?.creation_place || ".................."}، المملكة العربية السعودية</div>
          </div>
          <div class="content">
              <p style="margin-bottom: 16px;">
                أتعهد أنا الموقع أدناه بأن أدفع بموجب هذا السند بدون قيد أو شرط لأمر / 
                <span class="field">${getBeneficiaryName(selectedNote!)}</span>
                ${getBeneficiaryIdLabel(selectedNote!)} 
                <span class="field">${getBeneficiaryIdNumber(selectedNote!)}</span>
                مبلغ وقدره: 
                <span class="field">${formatAmount(selectedNote?.amount || null)}</span>
                ريال لا غير (
                <span class="field field-large">${selectedNote?.amount_text || ""}</span>
                ) ريال
              </p>
            <p style="margin-bottom: 16px;">
              <strong>تاريخ الاستحقاق:</strong> 
              <span class="field">${selectedNote?.due_date ? formatDate(selectedNote.due_date) : "لدى الاطلاع"}</span>
              هذا السند واجب الدفع بدون تعلل بموجب قرار مجلس الوزراء الموقر رقم 692 وتاريخ 26/09/1383 هـ والمتوج بالمرسوم الملكي رقم 37 بتاريخ 11/10/1383 هـ من نظام الأوراق التجارية.
            </p>
            <p style="font-size: 14px;">
              * بموجب هذا السند يسقط المدين كافة حقوق التقديم والمطالبة والاحتجاج والإخطار بالامتناع عن الوفاء والمتعلقة بهذا السند.
            </p>
          </div>
          <div style="border-top: 2px solid #000; padding-top: 24px; margin-top: 32px;">
            <div class="info-row">
              <div class="info-item">
                <p class="label">اسم المحرر:</p>
                <p class="value">${selectedNote?.debtor_name || "................................"}</p>
              </div>
              <div class="info-item">
                <p class="label">رقم الهوية:</p>
                <p class="value">${selectedNote?.debtor_id_number || "................................"}</p>
              </div>
            </div>
              <div style="margin-bottom: 32px;">
                <p class="label" style="font-weight: 700; margin-bottom: 8px;">العنوان:</p>
                <p class="value" style="padding-bottom: 8px; min-height: 30px; font-weight: 700;">${selectedNote?.debtor_address || "...................................................................................."}</p>
              </div>
            <div class="signature-section">
              <div class="signature-box">
                <p>التوقيع:</p>
                <div class="signature-line"></div>
              </div>
              <div class="signature-box">
                <p>الإبهام (البصمة):</p>
                <div class="fingerprint-box"></div>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleDownloadPDF = async () => {
    handlePrint(); // In this context, print works as export
  };

  const filteredNotes = notes.filter(note => 
    note.debtor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.note_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.debtor_id_number?.includes(searchTerm)
  );

  const getBeneficiaryName = (note: PromissoryNote) => {
    if (note.use_custom_beneficiary && note.beneficiary_name) {
      return note.beneficiary_name;
    }
    return companyInfo?.name || "..........................................";
  };

  const getBeneficiaryIdLabel = (note: PromissoryNote) => {
    if (note.use_custom_beneficiary && note.beneficiary_id_type === "national") {
      return "رقم الهوية:";
    }
    return "سجل تجاري رقم:";
  };

  const getBeneficiaryIdNumber = (note: PromissoryNote) => {
    if (note.use_custom_beneficiary) {
      if (note.beneficiary_id_type === "national" && note.beneficiary_id_number) {
        return note.beneficiary_id_number;
      }
      if (note.beneficiary_commercial_number) {
        return note.beneficiary_commercial_number;
      }
    }
    return companyInfo?.commercial_number || "..........................................";
  };

  return (
    <div className="max-w-[95%] mx-auto p-4 md:p-8 space-y-8" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] p-10 text-white shadow-2xl border border-white/10"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-amber-500 via-rose-500 via-emerald-500 via-purple-500 to-blue-500 animate-gradient-x" />
        
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
                <span className="text-blue-200 font-black text-[10px] uppercase tracking-widest">إدارة السندات القانونية</span>
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight bg-gradient-to-r from-white via-amber-100 to-white bg-clip-text text-transparent">
                سندات لأمر
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl font-medium leading-relaxed">
                إصدار وتوثيق سندات لأمر إلكترونية معتمدة لحفظ الحقوق المالية والقانونية
              </p>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                <button 
                  onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
                  className={cn(
                    "flex items-center gap-3 px-6 py-3 font-black text-sm rounded-2xl transition-all shadow-xl active:scale-95",
                    showForm ? "bg-white/10 text-white border border-white/20" : "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20"
                  )}
                >
                  {showForm ? <X size={18} /> : <Plus size={18} />}
                  {showForm ? "إلغاء النموذج" : "إنشاء سند جديد"}
                </button>
                <button 
                    onClick={fetchNotes}
                    className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white font-black text-sm hover:bg-white/20 transition-all shadow-xl active:scale-95"
                  >
                  <RefreshCw size={18} className={cn("text-amber-400", loading ? "animate-spin" : "")} />
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
                  <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400 group-hover:scale-110 transition-transform">
                    <ScrollText className="w-5 h-5" />
                  </div>
                  <span className="text-amber-300 font-black text-[10px] uppercase tracking-wider">العدد الإجمالي</span>
                </div>
                <p className="text-3xl font-black text-white tracking-tight">{notes.length}</p>
                <p className="text-amber-400/60 text-[10px] font-black mt-1">سند مسجل</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl min-w-[160px] group hover:bg-white/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-emerald-300 font-black text-[10px] uppercase tracking-wider">المنشأة</span>
                </div>
                <p className="text-sm font-black text-white truncate max-w-[120px]">{companyInfo?.name || "..."}</p>
                <p className="text-emerald-400/60 text-[10px] font-black mt-1">المصدر المعتمد</p>
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
                            <div className="p-3 bg-amber-500/20 rounded-2xl text-amber-400">
                                <PlusCircle className="w-8 h-8" />
                            </div>
                            <div>
                                  <h2 className="text-2xl font-black text-white">
                                      {editingNote ? "تعديل السند" : "إنشاء سند لأمر جديد"}
                                  </h2>
                                  <p className="text-slate-400 font-bold tracking-wide">يرجى تعبئة بيانات السند بعناية</p>
                              </div>
                          </div>
                      </div>

                      <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Beneficiary Section */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-black text-white">بيانات المستفيد (لأمر)</h3>
                                        <p className="text-xs text-slate-400 font-bold">
                                            {formData.use_custom_beneficiary 
                                                ? "أدخل بيانات المستفيد يدوياً" 
                                                : "سيتم استخدام بيانات شركتك تلقائياً"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, use_custom_beneficiary: !formData.use_custom_beneficiary})}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs transition-all border",
                                            formData.use_custom_beneficiary 
                                                ? "bg-rose-500/20 text-rose-400 border-rose-500/30" 
                                                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                        )}
                                    >
                                        <Edit2 size={14} />
                                        {formData.use_custom_beneficiary ? "إلغاء التعديل اليدوي" : "تعديل يدوي للمستفيد"}
                                    </button>
                                </div>

                                {/* Show company info as default beneficiary */}
                                <div className="bg-blue-500/5 rounded-xl p-4 border border-blue-500/10 flex items-center gap-4">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <Building2 size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-blue-400 font-bold mb-1">المستفيد الحالي:</p>
                                        <p className="text-sm font-black text-white">
                                            {formData.use_custom_beneficiary && formData.beneficiary_name 
                                                ? formData.beneficiary_name 
                                                : companyInfo?.name || "تحميل بيانات الشركة..."}
                                        </p>
                                        <p className="text-[10px] text-blue-400/70 font-bold">
                                            {formData.use_custom_beneficiary 
                                                ? (formData.beneficiary_id_type === "national" ? "هوية: " : "سجل تجاري: ") + 
                                                  (formData.beneficiary_id_type === "commercial" ? formData.beneficiary_commercial_number : formData.beneficiary_id_number || "...")
                                                : `سجل تجاري: ${companyInfo?.commercial_number || "..."}`}
                                        </p>
                                    </div>
                                    {!formData.use_custom_beneficiary && (
                                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20">
                                            تلقائي
                                        </span>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {formData.use_custom_beneficiary && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">اسم المستفيد</label>
                                                <input
                                                    type="text"
                                                    value={formData.beneficiary_name}
                                                    onChange={(e) => setFormData({...formData, beneficiary_name: e.target.value})}
                                                    placeholder="اسم الشخص أو المؤسسة..."
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-amber-500 outline-none transition-all"
                                                    required={formData.use_custom_beneficiary}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">نوع المعرف</label>
                                                <select
                                                    value={formData.beneficiary_id_type}
                                                    onChange={(e) => setFormData({...formData, beneficiary_id_type: e.target.value as "commercial" | "national"})}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-amber-500 outline-none transition-all appearance-none"
                                                >
                                                    <option value="commercial" className="bg-slate-800">سجل تجاري</option>
                                                    <option value="national" className="bg-slate-800">هوية وطنية</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">رقم المعرف</label>
                                                <input
                                                    type="text"
                                                    value={formData.beneficiary_id_type === "commercial" ? formData.beneficiary_commercial_number : formData.beneficiary_id_number}
                                                    onChange={(e) => {
                                                        if (formData.beneficiary_id_type === "commercial") {
                                                            setFormData({...formData, beneficiary_commercial_number: e.target.value});
                                                        } else {
                                                            setFormData({...formData, beneficiary_id_number: e.target.value});
                                                        }
                                                    }}
                                                    placeholder="الرقم الموحد أو الهوية..."
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-amber-500 outline-none transition-all"
                                                    required={formData.use_custom_beneficiary}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">اسم المحرر (المدين)</label>
                                <div className="relative">
                                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.debtor_name}
                                        onChange={(e) => setFormData({...formData, debtor_name: e.target.value})}
                                        placeholder="اسم الشخص أو المؤسسة..."
                                        className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-amber-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">رقم الهوية / السجل</label>
                                <div className="relative">
                                    <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.debtor_id_number}
                                        onChange={(e) => setFormData({...formData, debtor_id_number: e.target.value})}
                                        placeholder="رقم الهوية الوطنية أو السجل..."
                                        className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-amber-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">مبلغ السند (ريال)</label>
                                <div className="relative">
                                    <DollarSign className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        placeholder="0.00"
                                        className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-amber-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                                {formData.amount && (
                                    <p className="text-amber-400 text-[10px] font-black mt-1 px-2">
                                        {numberToArabicWords(Math.floor(parseFloat(formData.amount)))} ريال
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تاريخ الإنشاء</label>
                                <div className="relative">
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        value={formData.creation_date}
                                        onChange={(e) => setFormData({...formData, creation_date: e.target.value})}
                                        className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-amber-500 outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تاريخ الاستحقاق</label>
                                <div className="relative">
                                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                                        className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">مكان الإنشاء</label>
                                <div className="relative">
                                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.creation_place}
                                        onChange={(e) => setFormData({...formData, creation_place: e.target.value})}
                                        placeholder="مثال: الرياض، الدمام..."
                                        className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">عنوان المحرر</label>
                                <div className="relative">
                                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={formData.debtor_address}
                                        onChange={(e) => setFormData({...formData, debtor_address: e.target.value})}
                                        placeholder="العنوان الكامل للمحرر..."
                                        className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-amber-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-10 py-4 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-3 px-10 py-4 bg-amber-500 text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95"
                            >
                                <Check size={20} />
                                {editingNote ? "حفظ التعديلات" : "إصدار السند"}
                            </button>
                        </div>
                    </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="border-t border-white/10" />

          {/* Search & Table Section */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="بحث برقم السند، الاسم، أو الهوية..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-4 py-3 bg-white/10 border border-white/10 rounded-2xl text-white font-medium focus:bg-white/20 focus:border-amber-500/50 outline-none transition-all placeholder:text-slate-500"
                />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-amber-500/20 text-amber-300 font-bold rounded-2xl border border-amber-500/30 hover:bg-amber-500/30 transition-all">
                        <FileSpreadsheet size={18} />
                        تصدير البيانات
                    </button>
                </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-xl">
                            <ScrollText className="w-5 h-5 text-amber-400" />
                        </div>
                        <h3 className="font-black text-lg">سجل السندات المصدرة</h3>
                    </div>
                    <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {filteredNotes.length} سند موجود
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم السند</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">المحرر (المدين)</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">التاريخ</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">المبلغ</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredNotes.length > 0 ? (
                                filteredNotes.map((note, idx) => (
                                    <motion.tr 
                                        key={note.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * idx }}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-black border border-amber-500/20">
                                                {note.note_number}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-all">
                                                    <User size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-slate-200 truncate max-w-[150px]">{note.debtor_name || "بدون اسم"}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold">{note.debtor_id_number}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                                                <Calendar size={14} className="text-slate-500" />
                                                {formatDate(note.creation_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-baseline gap-1 text-emerald-400">
                                                <span className="text-lg font-black">{Number(note.amount || 0).toLocaleString()}</span>
                                                <span className="text-[10px] font-bold text-emerald-400/50 uppercase">ر.س</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border",
                                                note.status === 'active' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                note.status === 'paid' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                note.status === 'cancelled' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                                                "bg-white/10 text-slate-400 border-white/10"
                                            )}>
                                                {note.status === 'active' ? 'نشط' :
                                                 note.status === 'paid' ? 'مدفوع' :
                                                 note.status === 'cancelled' ? 'ملغي' : 'مسودة'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => openPrintPreview(note)}
                                                    className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95"
                                                    title="طباعة"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => openEdit(note)}
                                                    className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center hover:bg-amber-500 hover:text-white transition-all shadow-lg active:scale-95"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(note.id)}
                                                    className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <ScrollText size={64} className="text-slate-400" />
                                            <div className="space-y-1">
                                                <p className="text-xl font-black text-slate-300">لا توجد سندات لأمر</p>
                                                <p className="text-sm font-medium text-slate-500">ابدأ بإصدار أول سند من الزر أعلاه</p>
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
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>

      {/* Print Preview Modal */}
      <AnimatePresence>
        {showPrintPreview && selectedNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative"
            >
              <div className="bg-slate-900 rounded-t-[2.5rem] p-6 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-xl">
                        <Printer className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-black text-white">معاينة طباعة السند</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 text-white font-black text-sm rounded-xl hover:bg-teal-600 transition-all">
                        طباعة الآن
                    </button>
                    <button onClick={() => setShowPrintPreview(false)} className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all">
                        <X size={20} />
                    </button>
                </div>
              </div>

              <div className="p-10" dir="rtl" ref={printRef}>
                <div className="print-container border-4 border-double border-black p-10 bg-white">
                    <div className="text-center border-b-2 border-black pb-6 mb-8">
                        <h1 className="text-4xl font-black text-black mb-2">سند لأمـــر</h1>
                        <p className="text-black text-sm font-bold">رقم السند: {selectedNote.note_number}</p>
                    </div>

                    <div className="flex justify-between mb-8 text-sm text-black font-bold">
                        <div>تاريخ الإنشاء: {formatDate(selectedNote.creation_date)} م</div>
                        <div>مكان الإنشاء: المدينة {selectedNote.creation_place || ".................."}</div>
                    </div>

                    <div className="leading-loose text-justify mb-10 text-lg text-black">
                        <p className="mb-6">
                            أتعهد أنا الموقع أدناه بأن أدفع بموجب هذا السند بدون قيد أو شرط لأمر / 
                            <span className="font-black border-b border-black px-4 mx-2">
                                {getBeneficiaryName(selectedNote)}
                            </span>
                            {" "}{getBeneficiaryIdLabel(selectedNote)}{" "}
                            <span className="font-black border-b border-black px-4 mx-2">
                                {getBeneficiaryIdNumber(selectedNote)}
                            </span>
                            {" "}مبلغ وقدره:{" "}
                            <span className="font-black border-b border-black px-6 mx-2">
                                {formatAmount(selectedNote.amount)}
                            </span>
                            {" "}ريال لا غير ({" "}
                            <span className="font-black border-b border-black px-6 mx-2">
                                {selectedNote.amount_text || "................................................................"}
                            </span>
                            {" "}) ريال سعودي.
                        </p>

                        <p className="mb-6">
                            <strong>تاريخ الاستحقاق:</strong>{" "}
                            <span className="font-black border-b border-black px-4 mx-2">
                                {selectedNote.due_date ? formatDate(selectedNote.due_date) : "لدى الاطلاع"}
                            </span>
                            {" "}هذا السند واجب الدفع بدون تعلل بموجب قرار مجلس الوزراء الموقر رقم 692 وتاريخ 26/09/1383 هـ والمتوج بالمرسوم الملكي رقم 37 بتاريخ 11/10/1383 هـ من نظام الأوراق التجارية.
                        </p>

                        <p className="text-sm font-bold opacity-80 mt-10">
                            * بموجب هذا السند يسقط المدين كافة حقوق التقديم والمطالبة والاحتجاج والإخطار بالامتناع عن الوفاء والمتعلقة بهذا السند.
                        </p>
                    </div>

                    <div className="border-t-2 border-black pt-8 mt-10 text-black">
                        <div className="grid grid-cols-2 gap-10 mb-10">
                            <div>
                                <p className="font-black mb-2">اسم المحرر (المدين):</p>
                                <p className="text-xl font-black pb-2 border-b border-slate-200">
                                    {selectedNote.debtor_name || ".........................................."}
                                </p>
                            </div>
                            <div>
                                <p className="font-black mb-2">رقم الهوية / السجل:</p>
                                <p className="text-xl font-black pb-2 border-b border-slate-200">
                                    {selectedNote.debtor_id_number || ".........................................."}
                                </p>
                            </div>
                        </div>

                        <div className="mb-10">
                            <p className="font-black mb-2">العنوان الوطني:</p>
                            <p className="text-sm font-bold pb-2 border-b border-slate-200">
                                {selectedNote.debtor_address || "...................................................................................."}
                            </p>
                        </div>

                        <div className="flex justify-between items-start mt-16 px-10">
                            <div className="text-center">
                                <p className="font-black mb-6">توقيع المحرر</p>
                                <div className="w-56 h-24 border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 text-[10px]">
                                    ختم أو توقيع
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="font-black mb-6">بصمة الإبهام</p>
                                <div className="w-24 h-24 border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-300 text-[10px]">
                                    بصمة
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest pt-4 opacity-60">
        <div className="flex items-center gap-2">
          <Sparkles size={10} className="text-amber-500" />
          <span>نظام ZoolSpeed Logistics - إدارة السندات القانونية</span>
        </div>
        <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
