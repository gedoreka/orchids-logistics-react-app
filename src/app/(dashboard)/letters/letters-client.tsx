"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Search, Edit2, Trash2, Printer, Download,
  Calendar, User, Building2, X, Check, Mail, FileSignature,
  ClipboardList, Receipt, ChevronLeft, Eye, Settings, Upload, MoveVertical
} from "lucide-react";
import { toast } from "sonner";

interface LetterTemplate {
  id: number;
  template_key: string;
  template_name: string;
  template_name_ar: string;
  template_content: string;
  placeholders: string[];
  is_system_template: boolean;
}

interface GeneratedLetter {
  id: number;
  company_id: number;
  template_id: number;
  letter_number: string;
  letter_data: Record<string, string>;
  status: string;
  notes: string | null;
  created_at: string;
  template_name_ar: string;
  template_key: string;
}

interface CompanyInfo {
  name: string;
  commercial_number: string;
  letterhead_path?: string;
  letterhead_top_margin?: number;
  letterhead_bottom_margin?: number;
}

const templateIcons: Record<string, any> = {
  salary_receipt: Receipt,
  work_receipt: ClipboardList,
  custody_receipt: Receipt,
  resignation_letter: Mail,
  final_clearance: FileSignature,
};

const templateColors: Record<string, string> = {
  salary_receipt: "from-blue-600 to-cyan-600",
  work_receipt: "from-blue-500 to-indigo-600",
  custody_receipt: "from-amber-500 to-orange-600",
  resignation_letter: "from-rose-500 to-pink-600",
  final_clearance: "from-emerald-500 to-teal-600",
};

const placeholderLabels: Record<string, string> = {
  employee_name: "اسم الموظف",
  id_number: "رقم الهوية / الإقامة",
  company_name: "اسم الشركة",
  commercial_number: "رقم السجل التجاري",
  start_date: "تاريخ البداية",
  job_title: "المسمى الوظيفي",
  profession: "المهنة",
  nationality: "الجنسية",
  resignation_day: "يوم الاستقالة",
  resignation_date: "تاريخ الاستقالة",
  resignation_reason: "سبب الاستقالة",
  receipt_date: "تاريخ الاستلام",
  item_1: "البند 1", qty_1: "الكمية 1", value_1: "القيمة 1", status_1: "الحالة 1", notes_1: "ملاحظات 1",
  item_2: "البند 2", qty_2: "الكمية 2", value_2: "القيمة 2", status_2: "الحالة 2", notes_2: "ملاحظات 2",
  item_3: "البند 3", qty_3: "الكمية 3", value_3: "القيمة 3", status_3: "الحالة 3", notes_3: "ملاحظات 3",
  item_4: "البند 4", qty_4: "الكمية 4", value_4: "القيمة 4", status_4: "الحالة 4", notes_4: "ملاحظات 4",
  total_value: "إجمالي القيمة",
  service_days: "أيام الخدمة", service_months: "أشهر الخدمة", service_years: "سنوات الخدمة",
  end_date: "تاريخ النهاية",
  basic_salary: "الراتب الأساسي", housing_allowance: "بدل السكن", transport_allowance: "بدل المواصلات",
  end_service_bonus: "مكافأة نهاية الخدمة", vacation_balance: "رصيد الإجازات", total_amount: "إجمالي المستحقات",
  payroll_period: "فترة الراتب",
  period_from: "من تاريخ",
  period_to: "إلى تاريخ",
  total_amount_text: "المبلغ كتابة",
  bank_name: "اسم البنك",
  account_number: "رقم الحساب",
  transfer_date: "تاريخ التحويل",
  due_date: "تاريخ الاستحقاق",
  actual_receipt_date: "تاريخ الاستلام الفعلي",
};

const convertAmountToWords = (amount: number): string => {
  if (isNaN(amount) || amount === 0) return "";
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة"];
  const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسمائة"];
  const processThreeDigits = (num: number): string => {
    let result = "";
    const h = Math.floor(num / 100);
    const rest = num % 100;
    if (h > 0) result += hundreds[h];
    if (rest > 0) {
      if (h > 0) result += " و ";
      if (rest <= 10) result += ones[rest];
      else if (rest < 20) result += teens[rest - 10];
      else {
        const t = Math.floor(rest / 10);
        const o = rest % 10;
        if (o > 0) result += ones[o] + " و ";
        result += tens[t];
      }
    }
    return result;
  };
  const thousands = Math.floor(amount / 1000);
  const rest = Math.floor(amount % 1000);
  let finalResult = "";
  if (thousands > 0) {
    if (thousands === 1) finalResult += "ألف";
    else if (thousands === 2) finalResult += "ألفان";
    else if (thousands >= 3 && thousands <= 10) finalResult += ones[thousands] + " آلاف";
    else finalResult += processThreeDigits(thousands) + " ألف";
  }
  if (rest > 0) {
    if (thousands > 0) finalResult += " و ";
    finalResult += processThreeDigits(rest);
  }
  return finalResult;
};

export default function LettersClient() {
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [letters, setLetters] = useState<GeneratedLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [margins, setMargins] = useState({ top: 100, bottom: 100 });
  const [hasUnsavedMargins, setHasUnsavedMargins] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [editingLetter, setEditingLetter] = useState<GeneratedLetter | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<GeneratedLetter | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedTemplate?.template_key === "salary_receipt" || selectedTemplate?.template_key === "final_clearance") {
      const basic = parseFloat(formData.basic_salary || "0");
      const housing = parseFloat(formData.housing_allowance || "0");
      const transport = parseFloat(formData.transport_allowance || "0");
      const bonus = parseFloat(formData.end_service_bonus || "0");
      const vacation = parseFloat(formData.vacation_balance || "0");
      const total = basic + housing + transport + bonus + vacation;
      if (total > 0 && total.toString() !== formData.total_amount) {
        setFormData(prev => ({
          ...prev,
          total_amount: total.toString(),
          total_amount_text: convertAmountToWords(Math.floor(total))
        }));
      }
    }
  }, [formData.basic_salary, formData.housing_allowance, formData.transport_allowance, formData.end_service_bonus, formData.vacation_balance, selectedTemplate]);

  const fetchData = async () => {
    try {
      const [lettersRes, companyRes] = await Promise.all([
        fetch("/api/letters"),
        fetch("/api/company-info")
      ]);
      const lettersData = await lettersRes.json();
      const companyData = await companyRes.json();
      if (lettersData.success) {
        setTemplates(lettersData.templates || []);
        setLetters(lettersData.letters || []);
      }
      if (companyData.company) {
        setCompanyInfo(companyData.company);
        setMargins({
          top: companyData.company.letterhead_top_margin || 100,
          bottom: companyData.company.letterhead_bottom_margin || 100
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "letterheads");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        await updateCompanySettings({ letterhead_path: data.url });
        toast.success("تم رفع الورق المروس بنجاح");
      } else {
        toast.error(data.error || "فشل الرفع");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("حدث خطأ أثناء الرفع");
    } finally {
      setIsUploading(false);
    }
  };

  const updateCompanySettings = async (updates: Partial<CompanyInfo>) => {
    try {
      const res = await fetch("/api/company-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
        if (data.success) {
          setCompanyInfo(prev => ({ ...(prev || {}), ...updates } as CompanyInfo));
          return true;
        }

    } catch (error) {
      console.error("Update settings error:", error);
      toast.error("حدث خطأ أثناء تحديث الإعدادات");
    }
    return false;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = (template: LetterTemplate) => {
    setSelectedTemplate(template);
    setEditingLetter(null);
    const initialData: Record<string, string> = {};
    const placeholders = typeof template.placeholders === 'string' 
      ? JSON.parse(template.placeholders) 
      : template.placeholders;
    placeholders.forEach((p: string) => {
      if (p === "company_name" && companyInfo) initialData[p] = companyInfo.name;
      else if (p === "commercial_number" && companyInfo) initialData[p] = companyInfo.commercial_number;
      else initialData[p] = "";
    });
    setFormData(initialData);
    setShowForm(true);
  };

  const openEditForm = (letter: GeneratedLetter) => {
    const template = templates.find(t => t.id === letter.template_id);
    if (!template) return;
    setSelectedTemplate(template);
    setEditingLetter(letter);
    const letterData = typeof letter.letter_data === 'string' ? JSON.parse(letter.letter_data) : letter.letter_data;
    setFormData(letterData);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    try {
      const payload = editingLetter 
        ? { id: editingLetter.id, letter_data: formData, status: "active" }
        : { template_id: selectedTemplate.id, letter_data: formData };
      const res = await fetch("/api/letters", {
        method: editingLetter ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingLetter ? "تم تحديث الخطاب بنجاح" : `تم إنشاء الخطاب بنجاح: ${data.letter_number}`);
        fetchData();
        resetForm();
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error saving letter:", error);
      toast.error("حدث خطأ في حفظ الخطاب");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخطاب؟")) return;
    try {
      const res = await fetch(`/api/letters?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("تم حذف الخطاب بنجاح");
        fetchData();
      } else {
        toast.error(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error deleting letter:", error);
      toast.error("حدث خطأ في حذف الخطاب");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setSelectedTemplate(null);
    setEditingLetter(null);
    setFormData({});
  };

  const openPreview = (letter: GeneratedLetter) => {
    setPreviewLetter(letter);
    setShowPreview(true);
  };

  const generateLetterContent = (letter: GeneratedLetter): string => {
    const template = templates.find(t => t.id === letter.template_id);
    if (!template) return "";
    let content = template.template_content;
    const letterData = typeof letter.letter_data === 'string' ? JSON.parse(letter.letter_data) : letter.letter_data;
    Object.entries(letterData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      content = content.replace(regex, value as string || "..................");
    });
    return content;
  };

  const handlePrint = () => {
    if (!previewLetter) return;
    const content = generateLetterContent(previewLetter);
    const letterhead = companyInfo?.letterhead_path;
    const topMargin = margins.top;
    const bottomMargin = margins.bottom;
    const isPdf = letterhead?.toLowerCase().endsWith('.pdf');
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>طباعة الخطاب - ${previewLetter.letter_number}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Tajawal', sans-serif; direction: rtl; background: #fff; color: #000; line-height: 1.8; }
          @page { size: A4; margin: 0; }
          .page-container { width: 210mm; min-height: 297mm; position: relative; margin: 0 auto; overflow: hidden; }
          ${!isPdf ? `
          .page-container {
            background-image: url('${letterhead}');
            background-size: 100% 100%; background-repeat: no-repeat; background-position: center;
          }` : ''}
          .letterhead-pdf { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: -1; }
          .letter-content-wrapper { position: relative; z-index: 1; padding-top: ${topMargin}px; padding-bottom: ${bottomMargin}px; padding-left: 50px; padding-right: 50px; }
          .letter-content { font-size: 16px; text-align: justify; }
          .field { font-weight: bold; color: #000; }
          h2 { font-size: 22px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          td, th { padding: 10px; border: 1px solid #000; }
          @media print { 
            .page-container { width: 100%; margin: 0; box-shadow: none; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .letterhead-pdf { display: block; }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          ${isPdf ? `<iframe src="${letterhead}#toolbar=0&navpanes=0&scrollbar=0" class="letterhead-pdf"></iframe>` : ''}
          <div class="letter-content-wrapper">
            <div class="letter-content">${content}</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => { window.print(); }, 500);
          }
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredLetters = letters.filter(letter => 
    letter.letter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    letter.template_name_ar.includes(searchTerm)
  );

  const getPlaceholders = (template: LetterTemplate): string[] => {
    return typeof template.placeholders === 'string' ? JSON.parse(template.placeholders) : template.placeholders;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 mb-8 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-right">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <FileText className="w-10 h-10" />
                الخطابات الرسمية الجاهزة
              </h1>
              <p className="text-blue-100">إنشاء وإدارة الخطابات والإقرارات الرسمية</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-3 text-white transition-all flex items-center gap-2 border border-white/20"
                title="إعدادات الورق المروس"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">إعدادات الورق</span>
              </button>
              {companyInfo && (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white border border-white/10">
                  <Building2 className="w-5 h-5 inline-block ml-2" />
                  {companyInfo.name}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Templates Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-400" />
            إنشاء خطاب جديد
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((template) => {
              const Icon = templateIcons[template.template_key] || FileText;
              const colorClass = templateColors[template.template_key] || "from-gray-500 to-gray-600";
              return (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openCreateForm(template)}
                  className={`bg-gradient-to-br ${colorClass} p-6 rounded-2xl text-white text-right shadow-xl hover:shadow-2xl transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-white/20 rounded-xl"><Icon className="w-6 h-6" /></div>
                    <ChevronLeft className="w-5 h-5 opacity-50" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{template.template_name_ar}</h3>
                  <p className="text-sm text-white/70">{getPlaceholders(template).length} حقل للتعبئة</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث في الخطابات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pr-12 pl-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </motion.div>

        {/* Letters List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            الخطابات المنشأة ({filteredLetters.length})
          </h2>
          {filteredLetters.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl text-white mb-2">لا توجد خطابات</h3>
              <p className="text-slate-400">ابدأ بإنشاء خطاب جديد من القوالب أعلاه</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredLetters.map((letter, index) => {
                const Icon = templateIcons[letter.template_key] || FileText;
                const colorClass = templateColors[letter.template_key] || "from-gray-500 to-gray-600";
                return (
                  <motion.div key={letter.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass}`}><Icon className="w-6 h-6 text-white" /></div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-bold">{letter.letter_number}</span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${letter.status === 'active' ? 'bg-green-500/20 text-green-400' : letter.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {letter.status === 'active' ? 'نشط' : letter.status === 'cancelled' ? 'ملغي' : 'مسودة'}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white">{letter.template_name_ar}</h3>
                          <p className="text-slate-400 text-sm flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(letter.created_at).toLocaleDateString("ar-SA")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openPreview(letter)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"><Eye className="w-5 h-5" /></button>
                        <button onClick={() => openEditForm(letter)} className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all"><Edit2 className="w-5 h-5" /></button>
                        <button onClick={() => handleDelete(letter.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettings && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="w-6 h-6 text-blue-500" /> إعدادات الورق المروس</h2>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-6">
                    <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600">
                      <label className="block text-white font-bold mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-blue-400" /> الورق المروس (Image or PDF)</label>
                      <div className="relative group">
                        <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" id="letterhead-upload" />
                        <label htmlFor="letterhead-upload" className="cursor-pointer block border-2 border-dashed border-slate-500 hover:border-blue-500 rounded-xl p-8 text-center transition-all bg-slate-800/50">
                          {isUploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div> :
                            companyInfo?.letterhead_path ? (
                              <div className="relative">
                                {companyInfo.letterhead_path.toLowerCase().endsWith('.pdf') ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <FileText className="w-20 h-20 text-red-500" />
                                    <span className="text-white text-sm">تم رفع ملف PDF بنجاح</span>
                                    <span className="text-slate-400 text-xs">(ملاحظة: يفضل استخدام الصور لضمان أفضل جودة في المعاينة)</span>
                                  </div>
                                ) : (
                                  <img src={companyInfo.letterhead_path} alt="Letterhead" className="max-h-40 mx-auto rounded shadow-lg" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                  <span className="text-white text-sm">تغيير الملف</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-slate-400"><Upload className="w-12 h-12 mx-auto mb-2 opacity-20" /><p>اسحب الملف هنا أو اضغط للرفع</p></div>
                            )
                          }
                        </label>
                      </div>
                    </div>

                      <div className="space-y-4">
                        <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-white font-bold flex items-center gap-2"><MoveVertical className="w-5 h-5 text-blue-400" /> الهامش العلوي (Header)</label>
                            <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">{margins.top}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="500" 
                            step="5" 
                            value={margins.top} 
                            onChange={(e) => {
                              setMargins({ ...margins, top: parseInt(e.target.value) });
                              setHasUnsavedMargins(true);
                            }}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                          />
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-white font-bold flex items-center gap-2"><MoveVertical className="w-5 h-5 text-blue-400" /> الهامش السفلي (Footer)</label>
                            <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">{margins.bottom}px</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="500" 
                            step="5" 
                            value={margins.bottom} 
                            onChange={(e) => {
                              setMargins({ ...margins, bottom: parseInt(e.target.value) });
                              setHasUnsavedMargins(true);
                            }}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                          />
                        </div>
                      </div>

                      {/* Visual Margin Preview (Shadow) */}
                      <div className="flex justify-center py-4">
                        <div className="relative bg-white border border-slate-400 w-[210px] h-[297px] overflow-hidden shadow-inner scale-75">
                            {companyInfo?.letterhead_path && (
                              companyInfo.letterhead_path.toLowerCase().endsWith('.pdf') ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-4 border border-slate-200">
                                  <FileText className="w-12 h-12 text-red-500 mb-2 opacity-50" />
                                  <span className="text-[10px] font-bold text-slate-500">تم رفع ملف PDF بنجاح</span>
                                  <span className="text-[8px] text-slate-400">سيظهر في المعاينة والطباعة</span>
                                </div>
                              ) : (
                                <img 
                                  src={companyInfo.letterhead_path} 
                                  className="absolute inset-0 w-full h-full object-fill opacity-40" 
                                  alt="" 
                                />
                              )
                            )}
                            {/* Top Margin Shadow */}
                            <div 
                              className="absolute top-0 left-0 right-0 bg-blue-500/30 border-b-2 border-blue-500/50 flex items-end justify-center text-[10px] font-bold text-blue-700 pb-2 transition-all duration-300"
                              style={{ height: `${margins.top * (297/1122)}px` }} // Scale factor A4 height px at 96dpi is ~1122
                            >
                              <div className="bg-white/80 px-1 rounded shadow-sm flex items-center gap-1">
                                <MoveVertical className="w-2 h-2" />
                                {margins.top}px
                              </div>
                            </div>
                            {/* Bottom Margin Shadow */}
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-blue-500/30 border-t-2 border-blue-500/50 flex items-start justify-center text-[10px] font-bold text-blue-700 pt-2 transition-all duration-300"
                              style={{ height: `${margins.bottom * (297/1122)}px` }}
                            >
                              <div className="bg-white/80 px-1 rounded shadow-sm flex items-center gap-1">
                                <MoveVertical className="w-2 h-2" />
                                {margins.bottom}px
                              </div>
                            </div>
                          {/* Content Area */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="border border-dashed border-slate-300 w-[80%] h-[60%] flex items-center justify-center text-[8px] text-slate-400">
                              منطقة النص
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={async () => {
                            const success = await updateCompanySettings({
                              letterhead_top_margin: margins.top,
                              letterhead_bottom_margin: margins.bottom
                            });
                            if (success) {
                              setHasUnsavedMargins(false);
                              toast.success("تم حفظ إعدادات الهوامش");
                            }
                          }}
                          disabled={!hasUnsavedMargins}
                          className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            hasUnsavedMargins 
                              ? "bg-blue-500 hover:bg-blue-600 text-white" 
                              : "bg-slate-700 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          <Check className="w-5 h-5" />
                          حفظ الضبط
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>


        {/* Create/Edit Form Modal */}
        <AnimatePresence>
          {showForm && selectedTemplate && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && resetForm()}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-800 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="w-6 h-6 text-blue-500" /> {editingLetter ? "تعديل الخطاب" : `إنشاء ${selectedTemplate.template_name_ar}`}</h2>
                  <button onClick={resetForm} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getPlaceholders(selectedTemplate).map((placeholder) => (
                      <div key={placeholder}>
                        <label className="block text-slate-300 mb-2 text-sm font-medium">{placeholderLabels[placeholder] || placeholder}</label>
                        <input type={placeholder.includes("date") ? "date" : "text"} value={formData[placeholder] || ""} onChange={(e) => setFormData({ ...formData, [placeholder]: e.target.value })} readOnly={placeholder === "total_amount" || placeholder === "total_amount_text"} className={`w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${(placeholder === "total_amount" || placeholder === "total_amount_text") ? "opacity-75 cursor-not-allowed bg-slate-800" : ""}`} placeholder={`أدخل ${placeholderLabels[placeholder] || placeholder}`} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-4"><button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"><Check className="w-5 h-5" /> {editingLetter ? "حفظ التعديلات" : "إنشاء الخطاب"}</button><button type="button" onClick={resetForm} className="px-6 bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl font-bold transition-all">إلغاء</button></div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && previewLetter && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowPreview(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                <div className="bg-slate-800 p-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">معاينة الخطاب - {previewLetter.letter_number}</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all"><Printer className="w-5 h-5" /> طباعة</button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all"><Download className="w-5 h-5" /> تحميل PDF</button>
                    <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white p-2"><X className="w-6 h-6" /></button>
                  </div>
                </div>
                  <div className="flex-1 overflow-y-auto bg-slate-200 p-4 md:p-8 flex justify-center">
                    <div 
                      className="bg-white shadow-2xl origin-top relative overflow-hidden"
                      style={{ 
                        width: '210mm', minHeight: '297mm',
                        transform: 'scale(0.8)'
                      }}
                    >
                      {companyInfo?.letterhead_path && (
                        companyInfo.letterhead_path.toLowerCase().endsWith('.pdf') ? (
                          <iframe 
                            src={`${companyInfo.letterhead_path}#toolbar=0&navpanes=0&scrollbar=0`} 
                            className="absolute inset-0 w-full h-full border-none pointer-events-none"
                            style={{ zIndex: 0 }}
                          />
                        ) : (
                          <div 
                            className="absolute inset-0"
                            style={{ 
                              backgroundImage: `url(${companyInfo.letterhead_path})`,
                              backgroundSize: '100% 100%',
                              backgroundRepeat: 'no-repeat',
                              zIndex: 0
                            }}
                          />
                        )
                      )}
                      <div 
                        className="relative z-10"
                        style={{ padding: `${margins.top}px 50px ${margins.bottom}px` }}
                        dangerouslySetInnerHTML={{ __html: generateLetterContent(previewLetter) }}
                      />
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
