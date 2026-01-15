"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Search, Edit2, Trash2, Printer, Download,
    Calendar, User, CreditCard, Building2, MapPin, X, Check,
    ChevronDown, AlertCircle
  } from "lucide-react";

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
  const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
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
    use_custom_beneficiary: false,
    status: "draft",
    notes: ""
  });

  const fetchNotes = async () => {
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
      use_custom_beneficiary: note.use_custom_beneficiary,
      status: note.status,
      notes: note.notes || ""
    });
    setShowForm(true);
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
              سجل تجاري رقم: 
              <span class="field">${getBeneficiaryCommercialNumber(selectedNote!)}</span>
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
    if (!selectedNote) return;
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سند لأمر - ${selectedNote.note_number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 30px; background: #fff; color: #000; }
          .print-container { max-width: 800px; margin: 0 auto; border: 4px double #000; padding: 40px; background: #fff; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #000; padding-bottom: 20px; }
          .header h1 { font-size: 32px; color: #000; font-weight: 700; letter-spacing: 2px; }
          .header p { color: #000; font-size: 14px; margin-top: 8px; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 14px; color: #000; }
            .content { line-height: 2.4; font-size: 16px; text-align: justify; margin-bottom: 30px; color: #000; }
            .field { min-width: 180px; display: inline-block; text-align: center; padding: 6px 20px; font-weight: 700; color: #000; }
            .field-large { min-width: 280px; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 30px; border-top: 2px solid #000; }
            .signature-box { text-align: center; width: 200px; }
            .signature-box p { margin-bottom: 15px; font-weight: 700; color: #000; font-size: 16px; }
            .signature-line { border-bottom: 2px solid #000; height: 80px; margin-bottom: 10px; }
            .fingerprint-box { width: 100px; height: 100px; border: 2px solid #000; border-radius: 50%; margin: 0 auto; }
            .info-row { display: flex; gap: 50px; margin-bottom: 24px; }
            .info-item { flex: 1; }
            .info-item p.label { font-weight: 700; margin-bottom: 10px; color: #000; font-size: 15px; }
            .info-item p.value { padding-bottom: 10px; min-height: 35px; color: #000; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <h1>سند لأمـــر</h1>
            <p>رقم السند: ${selectedNote.note_number}</p>
          </div>
          
          <div class="meta-row">
            <div><strong>تاريخ الإنشاء:</strong> ${formatDate(selectedNote.creation_date)} م</div>
            <div><strong>مكان الإنشاء:</strong> المدينة ${selectedNote.creation_place || ".................."}، المملكة العربية السعودية</div>
          </div>
          
          <div class="content">
            <p style="margin-bottom: 20px;">
              أتعهد أنا الموقع أدناه بأن أدفع بموجب هذا السند بدون قيد أو شرط لأمر / 
              <span class="field">${getBeneficiaryName(selectedNote)}</span>
              سجل تجاري رقم: 
              <span class="field">${getBeneficiaryCommercialNumber(selectedNote)}</span>
              مبلغ وقدره: 
              <span class="field">${formatAmount(selectedNote.amount)}</span>
              ريال لا غير (
              <span class="field field-large">${selectedNote.amount_text || ""}</span>
              ) ريال
            </p>
            
            <p style="margin-bottom: 20px;">
              <strong>تاريخ الاستحقاق:</strong> 
              <span class="field">${selectedNote.due_date ? formatDate(selectedNote.due_date) : "لدى الاطلاع"}</span>
              هذا السند واجب الدفع بدون تعلل بموجب قرار مجلس الوزراء الموقر رقم 692 وتاريخ 26/09/1383 هـ والمتوج بالمرسوم الملكي رقم 37 بتاريخ 11/10/1383 هـ من نظام الأوراق التجارية.
            </p>
            
            <p style="font-size: 14px;">
              * بموجب هذا السند يسقط المدين كافة حقوق التقديم والمطالبة والاحتجاج والإخطار بالامتناع عن الوفاء والمتعلقة بهذا السند.
            </p>
          </div>
          
          <div style="border-top: 2px solid #000; padding-top: 30px; margin-top: 40px;">
            <div class="info-row">
              <div class="info-item">
                <p class="label">اسم المحرر:</p>
                <p class="value">${selectedNote.debtor_name || "................................"}</p>
              </div>
              <div class="info-item">
                <p class="label">رقم الهوية:</p>
                <p class="value">${selectedNote.debtor_id_number || "................................"}</p>
              </div>
            </div>
            
            <div style="margin-bottom: 40px;">
              <p class="label" style="font-weight: 700; margin-bottom: 10px; font-size: 15px;">العنوان:</p>
              <p class="value" style="padding-bottom: 10px; min-height: 35px; font-weight: 700;">${selectedNote.debtor_address || "...................................................................................."}</p>
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
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
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

  const getBeneficiaryCommercialNumber = (note: PromissoryNote) => {
    if (note.use_custom_beneficiary && note.beneficiary_commercial_number) {
      return note.beneficiary_commercial_number;
    }
    return companyInfo?.commercial_number || "..........................................";
  };

  const formatDate = (date: string | null) => {
    if (!date) return "........ / ........ / ........";
    return new Date(date).toLocaleDateString("en-GB");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 mb-8 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-right">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <FileText className="w-10 h-10" />
                سندات لأمر إلكترونية
              </h1>
              <p className="text-emerald-100">إدارة وإصدار سندات الأمر الإلكترونية</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
                <Building2 className="w-5 h-5 inline-block ml-2" />
                {companyInfo?.name || "جاري التحميل..."}
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                سند جديد
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6"
        >
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث بالاسم أو رقم السند أو رقم الهوية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pr-12 pl-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 text-center"
          >
            <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">لا توجد سندات</h3>
            <p className="text-slate-400">ابدأ بإنشاء سند أمر جديد</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-sm font-bold">
                        {note.note_number}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                        note.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                        note.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                        note.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {note.status === 'active' ? 'نشط' :
                         note.status === 'paid' ? 'مدفوع' :
                         note.status === 'cancelled' ? 'ملغي' : 'مسودة'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {note.debtor_name || "بدون اسم"}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {note.debtor_id_number || "---"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(note.creation_date)}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {note.amount ? `${formatAmount(note.amount)} ريال` : "بدون مبلغ"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openPrintPreview(note)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                      title="طباعة"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openEdit(note)}
                      className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all"
                      title="تعديل"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && resetForm()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-emerald-500" />
                    {editingNote ? "تعديل سند لأمر" : "إنشاء سند لأمر جديد"}
                  </h2>
                  <button onClick={resetForm} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-2 text-sm font-medium">
                        <User className="w-4 h-4 inline-block ml-1" />
                        اسم المحرر (المدين)
                      </label>
                      <input
                        type="text"
                        value={formData.debtor_name}
                        onChange={(e) => setFormData({...formData, debtor_name: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="اسم الشخص..."
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 text-sm font-medium">
                        <CreditCard className="w-4 h-4 inline-block ml-1" />
                        رقم الهوية
                      </label>
                      <input
                        type="text"
                        value={formData.debtor_id_number}
                        onChange={(e) => setFormData({...formData, debtor_id_number: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="رقم الهوية..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm font-medium">المبلغ (ريال)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="اترك فارغاً للكتابة لاحقاً..."
                    />
                    {formData.amount && (
                      <p className="text-emerald-400 mt-1 text-sm">
                        {numberToArabicWords(Math.floor(parseFloat(formData.amount)))} ريال
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-2 text-sm font-medium">
                        <Calendar className="w-4 h-4 inline-block ml-1" />
                        تاريخ الإنشاء
                      </label>
                      <input
                        type="date"
                        value={formData.creation_date}
                        onChange={(e) => setFormData({...formData, creation_date: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 text-sm font-medium">
                        <Calendar className="w-4 h-4 inline-block ml-1" />
                        تاريخ الاستحقاق
                      </label>
                      <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="اترك فارغاً..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 mb-2 text-sm font-medium">
                        <MapPin className="w-4 h-4 inline-block ml-1" />
                        مكان الإنشاء (المدينة)
                      </label>
                      <input
                        type="text"
                        value={formData.creation_place}
                        onChange={(e) => setFormData({...formData, creation_place: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="مثال: الرياض"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-2 text-sm font-medium">
                        <MapPin className="w-4 h-4 inline-block ml-1" />
                        عنوان المحرر
                      </label>
                      <input
                        type="text"
                        value={formData.debtor_address}
                        onChange={(e) => setFormData({...formData, debtor_address: e.target.value})}
                        className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="العنوان..."
                      />
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-xl p-4">
                    <label className="flex items-center gap-2 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={formData.use_custom_beneficiary}
                        onChange={(e) => setFormData({...formData, use_custom_beneficiary: e.target.checked})}
                        className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-slate-300">استخدام بيانات مستفيد مخصصة (غير الشركة المسجلة)</span>
                    </label>

                    {formData.use_custom_beneficiary && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-slate-300 mb-2 text-sm font-medium">اسم المستفيد</label>
                          <input
                            type="text"
                            value={formData.beneficiary_name}
                            onChange={(e) => setFormData({...formData, beneficiary_name: e.target.value})}
                            className="w-full bg-slate-600 border border-slate-500 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="اسم المستفيد..."
                          />
                        </div>
                        <div>
                          <label className="block text-slate-300 mb-2 text-sm font-medium">رقم السجل التجاري</label>
                          <input
                            type="text"
                            value={formData.beneficiary_commercial_number}
                            onChange={(e) => setFormData({...formData, beneficiary_commercial_number: e.target.value})}
                            className="w-full bg-slate-600 border border-slate-500 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="رقم السجل التجاري..."
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm font-medium">الحالة</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="draft">مسودة</option>
                      <option value="active">نشط</option>
                      <option value="paid">مدفوع</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-2 text-sm font-medium">ملاحظات</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                      placeholder="ملاحظات إضافية..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      {editingNote ? "حفظ التعديلات" : "إنشاء السند"}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl font-bold transition-all"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showPrintPreview && selectedNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowPrintPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
              >
                <div className="sticky top-0 bg-slate-800 p-4 flex items-center justify-between z-10">
                  <h2 className="text-xl font-bold text-white">معاينة الطباعة</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        <Printer className="w-5 h-5" />
                        طباعة
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        <Download className="w-5 h-5" />
                        تحميل PDF
                      </button>
                      <button
                        onClick={() => setShowPrintPreview(false)}
                        className="text-slate-400 hover:text-white p-2"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                </div>

                  <div ref={printRef} className="p-8" dir="rtl">
                    <div className="print-container border-4 border-double border-black p-8 bg-white">
                      <div className="text-center border-b-2 border-black pb-6 mb-6">
                        <h1 className="text-3xl font-bold text-black mb-2">سند لأمـــر</h1>
                        <p className="text-black text-sm">رقم السند: {selectedNote.note_number}</p>
                      </div>

                      <div className="flex justify-between mb-6 text-sm text-black">
                        <div>
                          <strong>تاريخ الإنشاء:</strong> {formatDate(selectedNote.creation_date)} م
                        </div>
                        <div>
                          <strong>مكان الإنشاء:</strong> المدينة {selectedNote.creation_place || ".................."}، المملكة العربية السعودية
                        </div>
                      </div>

                      <div className="leading-loose text-justify mb-8 text-base text-black">
                          <p className="mb-4">
                            أتعهد أنا الموقع أدناه بأن أدفع بموجب هذا السند بدون قيد أو شرط لأمر / 
                            <span className="font-bold text-black px-2">
                              {getBeneficiaryName(selectedNote)}
                            </span>
                            {" "}سجل تجاري رقم:{" "}
                            <span className="font-bold text-black px-2">
                              {getBeneficiaryCommercialNumber(selectedNote)}
                            </span>
                            {" "}مبلغ وقدره:{" "}
                            <span className="font-bold text-black px-4 py-1 inline-block min-w-[200px]">
                              {formatAmount(selectedNote.amount)}
                            </span>
                            {" "}ريال لا غير ({" "}
                            <span className="font-bold text-black px-4 py-1 inline-block min-w-[300px]">
                              {selectedNote.amount_text || "................................................................"}
                            </span>
                            {" "}) ريال
                          </p>

                          <p className="mb-4">
                            <strong>تاريخ الاستحقاق:</strong>{" "}
                            <span className="font-bold text-black px-2">
                              {selectedNote.due_date ? formatDate(selectedNote.due_date) : "لدى الاطلاع"}
                            </span>
                            {" "}هذا السند واجب الدفع بدون تعلل بموجب قرار مجلس الوزراء الموقر رقم 692 وتاريخ 26/09/1383 هـ والمتوج بالمرسوم الملكي رقم 37 بتاريخ 11/10/1383 هـ من نظام الأوراق التجارية.
                          </p>

                        <p className="text-sm text-black">
                          * بموجب هذا السند يسقط المدين كافة حقوق التقديم والمطالبة والاحتجاج والإخطار بالامتناع عن الوفاء والمتعلقة بهذا السند.
                        </p>
                      </div>

                      <div className="border-t-2 border-black pt-6 mt-8 text-black">
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                              <p className="font-bold mb-2 text-black">اسم المحرر:</p>
                              <p className="pb-2 min-h-[30px] text-black font-bold">
                                {selectedNote.debtor_name || ".........................................."}
                              </p>
                            </div>
                            <div>
                              <p className="font-bold mb-2 text-black">رقم الهوية:</p>
                              <p className="pb-2 min-h-[30px] text-black font-bold">
                                {selectedNote.debtor_id_number || ".........................................."}
                              </p>
                            </div>
                          </div>

                          <div className="mb-8">
                            <p className="font-bold mb-2 text-black">العنوان:</p>
                            <p className="pb-2 min-h-[30px] text-black font-bold">
                              {selectedNote.debtor_address || "...................................................................................."}
                            </p>
                          </div>

                        <div className="flex justify-between items-start mt-12">
                          <div className="text-center">
                            <p className="font-bold mb-4 text-black">التوقيع:</p>
                            <div className="w-48 h-20 border-b-2 border-black">
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="font-bold mb-4 text-black">الإبهام (البصمة):</p>
                            <div className="w-24 h-24 border-2 border-black rounded-full">
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
      </div>
    </div>
  );
}
