"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Search, Edit2, Trash2, Printer, Download,
  Calendar, User, Building2, X, Check, Mail, FileSignature,
  ClipboardList, Receipt, ChevronLeft, Eye
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
}

const templateIcons: Record<string, any> = {
  work_receipt: ClipboardList,
  custody_receipt: Receipt,
  resignation_letter: Mail,
  final_clearance: FileSignature,
};

const templateColors: Record<string, string> = {
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
};

export default function LettersClient() {
  const [templates, setTemplates] = useState<LetterTemplate[]>([]);
  const [letters, setLetters] = useState<GeneratedLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [editingLetter, setEditingLetter] = useState<GeneratedLetter | null>(null);

  const [showPreview, setShowPreview] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<GeneratedLetter | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

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
        setCompanyInfo({
          name: companyData.company.name,
          commercial_number: companyData.company.commercial_number || ""
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("حدث خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
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
      if (p === "company_name" && companyInfo) {
        initialData[p] = companyInfo.name;
      } else if (p === "commercial_number" && companyInfo) {
        initialData[p] = companyInfo.commercial_number;
      } else {
        initialData[p] = "";
      }
    });
    setFormData(initialData);
    setShowForm(true);
  };

  const openEditForm = (letter: GeneratedLetter) => {
    const template = templates.find(t => t.id === letter.template_id);
    if (!template) return;
    
    setSelectedTemplate(template);
    setEditingLetter(letter);
    const letterData = typeof letter.letter_data === 'string' 
      ? JSON.parse(letter.letter_data) 
      : letter.letter_data;
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
    const letterData = typeof letter.letter_data === 'string' 
      ? JSON.parse(letter.letter_data) 
      : letter.letter_data;

    Object.entries(letterData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      content = content.replace(regex, value as string || "..................");
    });

    return content;
  };

  const handlePrint = () => {
    if (!previewLetter) return;
    const content = generateLetterContent(previewLetter);
    
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
          body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 40px; background: #fff; color: #000; line-height: 1.8; }
          .letter-content { max-width: 800px; margin: 0 auto; }
          .field { font-weight: bold; color: #000; padding: 0 5px; }
          .field-line { border-bottom: 1px solid #000; min-width: 150px; display: inline-block; padding: 0 10px; }
          h2 { font-size: 22px; }
          table { width: 100%; border-collapse: collapse; }
          td, th { padding: 10px; border: 1px solid #000; }
          @media print { 
            body { padding: 20px; } 
            @page { margin: 15mm; size: A4; }
          }
        </style>
      </head>
      <body>
        ${content}
        <script>window.onload = function() { window.print(); }<\/script>
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
    return typeof template.placeholders === 'string' 
      ? JSON.parse(template.placeholders) 
      : template.placeholders;
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
            {companyInfo && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
                <Building2 className="w-5 h-5 inline-block ml-2" />
                {companyInfo.name}
              </div>
            )}
          </div>
        </motion.div>

        {/* Templates Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
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
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Icon className="w-6 h-6" />
                    </div>
                    <ChevronLeft className="w-5 h-5 opacity-50" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{template.template_name_ar}</h3>
                  <p className="text-sm text-white/70">
                    {getPlaceholders(template).length} حقل للتعبئة
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6"
        >
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
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
                  <motion.div
                    key={letter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass}`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-sm font-bold">
                              {letter.letter_number}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                              letter.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              letter.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {letter.status === 'active' ? 'نشط' : letter.status === 'cancelled' ? 'ملغي' : 'مسودة'}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white">{letter.template_name_ar}</h3>
                          <p className="text-slate-400 text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(letter.created_at).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openPreview(letter)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                          title="عرض"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditForm(letter)}
                          className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all"
                          title="تعديل"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(letter.id)}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Create/Edit Form Modal */}
        <AnimatePresence>
          {showForm && selectedTemplate && (
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
                className="bg-slate-800 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-500" />
                    {editingLetter ? "تعديل الخطاب" : `إنشاء ${selectedTemplate.template_name_ar}`}
                  </h2>
                  <button onClick={resetForm} className="text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getPlaceholders(selectedTemplate).map((placeholder) => (
                      <div key={placeholder}>
                        <label className="block text-slate-300 mb-2 text-sm font-medium">
                          {placeholderLabels[placeholder] || placeholder}
                        </label>
                        <input
                          type={placeholder.includes("date") ? "date" : "text"}
                          value={formData[placeholder] || ""}
                          onChange={(e) => setFormData({ ...formData, [placeholder]: e.target.value })}
                          className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`أدخل ${placeholderLabels[placeholder] || placeholder}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      {editingLetter ? "حفظ التعديلات" : "إنشاء الخطاب"}
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

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && previewLetter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
              >
                <div className="sticky top-0 bg-slate-800 p-4 flex items-center justify-between z-10">
                  <h2 className="text-xl font-bold text-white">
                    معاينة الخطاب - {previewLetter.letter_number}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      <Printer className="w-5 h-5" />
                      طباعة
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all"
                    >
                      <Download className="w-5 h-5" />
                      تحميل PDF
                    </button>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-slate-400 hover:text-white p-2"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div 
                  ref={printRef} 
                  className="p-8 bg-white overflow-y-auto max-h-[calc(95vh-80px)]" 
                  dir="rtl"
                  dangerouslySetInnerHTML={{ __html: generateLetterContent(previewLetter) }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
