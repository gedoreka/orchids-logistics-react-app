"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Search, Edit2, Trash2, Printer, Download,
  Calendar, User, Building2, X, Check, Mail, FileSignature,
  ClipboardList, Receipt, ChevronLeft, Eye, Settings, Upload, MoveVertical,
  Send, AtSign, Loader2, AlertTriangle, Sparkles, Shield, CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import * as pdfjsLib from "pdfjs-dist";
import { useTranslations, useLocale } from "@/lib/locale-context";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
  email?: string;
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

function AutoFitContent({ content, maxHeight }: { content: string; maxHeight: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    let currentFontSize = 16;
    let currentLineHeight = 1.6;
    
    const checkAndAdjust = () => {
      if (container.scrollHeight > maxHeight && currentFontSize > 10) {
        currentFontSize -= 0.5;
        setFontSize(currentFontSize);
        requestAnimationFrame(checkAndAdjust);
      } else if (container.scrollHeight > maxHeight && currentLineHeight > 1.2) {
        currentLineHeight -= 0.05;
        setLineHeight(currentLineHeight);
        requestAnimationFrame(checkAndAdjust);
      }
    };
    
    setFontSize(16);
    setLineHeight(1.6);
    requestAnimationFrame(checkAndAdjust);
  }, [content, maxHeight]);

  return (
    <div 
      ref={containerRef}
      className="letter-content-auto"
      style={{ 
        fontSize: `${fontSize}px`, 
        lineHeight: lineHeight,
        textAlign: 'justify'
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

const placeholderLabels: Record<string, string> = {
  employee_name: "اسم الموظف",
  id_number: "رقم الهوية",
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
    basic_salary: "الراتب الأساسي الشهري", 
    housing_allowance: "بدل السكن الشهري",
    salary_period_type: "نوع فترة الراتب",
    total_deduction: "إجمالي الخصم المستحق",
    transport_allowance: "بدل المواصلات",

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
  const t = useTranslations("officialLettersPage");
  const { locale, isRTL } = useLocale();
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
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfRendered, setPdfRendered] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailLetter, setEmailLetter] = useState<GeneratedLetter | null>(null);
  const [customEmail, setCustomEmail] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Luxury modal states
  const [saveConfirmModal, setSaveConfirmModal] = useState(false);
  const [savingModal, setSavingModal] = useState(false);
  const [saveSuccessModal, setSaveSuccessModal] = useState<{ isOpen: boolean; letterNumber: string }>({ isOpen: false, letterNumber: '' });
  const [saveErrorModal, setSaveErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; item: GeneratedLetter | null }>({ isOpen: false, item: null });
  const [deletingModal, setDeletingModal] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState<{ isOpen: boolean; title: string }>({ isOpen: false, title: '' });

  const placeholderLabels = useMemo(() => ({
    employee_name: t("placeholders.employee_name"),
    id_number: t("placeholders.id_number"),
    company_name: t("placeholders.company_name"),
    commercial_number: t("placeholders.commercial_number"),
    start_date: t("placeholders.start_date"),
    job_title: t("placeholders.job_title"),
    profession: t("placeholders.profession"),
    nationality: t("placeholders.nationality"),
    resignation_day: t("placeholders.resignation_day"),
    resignation_date: t("placeholders.resignation_date"),
    resignation_reason: t("placeholders.resignation_reason"),
    receipt_date: t("placeholders.receipt_date"),
    item_1: t("placeholders.item", { n: 1 }), qty_1: t("placeholders.qty", { n: 1 }), value_1: t("placeholders.value", { n: 1 }), status_1: t("placeholders.status", { n: 1 }), notes_1: t("placeholders.notes", { n: 1 }),
    item_2: t("placeholders.item", { n: 2 }), qty_2: t("placeholders.qty", { n: 2 }), value_2: t("placeholders.value", { n: 2 }), status_2: t("placeholders.status", { n: 2 }), notes_2: t("placeholders.notes", { n: 2 }),
    item_3: t("placeholders.item", { n: 3 }), qty_3: t("placeholders.qty", { n: 3 }), value_3: t("placeholders.value", { n: 3 }), status_3: t("placeholders.status", { n: 3 }), notes_3: t("placeholders.notes", { n: 3 }),
    item_4: t("placeholders.item", { n: 4 }), qty_4: t("placeholders.qty", { n: 4 }), value_4: t("placeholders.value", { n: 4 }), status_4: t("placeholders.status", { n: 4 }), notes_4: t("placeholders.notes", { n: 4 }),
    total_value: t("placeholders.total_value"),
    service_days: t("placeholders.service_days"), service_months: t("placeholders.service_months"), service_years: t("placeholders.service_years"),
    end_date: t("placeholders.end_date"),
    basic_salary: t("placeholders.basic_salary"), 
    housing_allowance: t("placeholders.housing_allowance"),
    salary_period_type: t("placeholders.salary_period_type"),
    total_deduction: t("placeholders.total_deduction"),
    transport_allowance: t("placeholders.transport_allowance"),
    end_service_bonus: t("placeholders.end_service_bonus"), vacation_balance: t("placeholders.vacation_balance"), total_amount: t("placeholders.total_amount"),
    payroll_period: t("placeholders.payroll_period"),
    period_from: t("placeholders.period_from"),
    period_to: t("placeholders.period_to"),
    total_amount_text: t("placeholders.total_amount_text"),
    bank_name: t("placeholders.bank_name"),
    account_number: t("placeholders.account_number"),
    transfer_date: t("placeholders.transfer_date"),
    due_date: t("placeholders.due_date"),
    actual_receipt_date: t("placeholders.actual_receipt_date"),
  }), [t]);

  const renderPdfToCanvas = useCallback(async (pdfUrl: string, canvas: HTMLCanvasElement | null) => {
    if (!canvas || !pdfUrl) return;
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const desiredWidth = 200;
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = desiredWidth / unscaledViewport.width;
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");
      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
        setPdfRendered(true);
      }
    } catch (error) {
      console.error("Error rendering PDF:", error);
    }
  }, []);

  useEffect(() => {
    if (showSettings && companyInfo?.letterhead_path?.toLowerCase().endsWith('.pdf')) {
      setPdfRendered(false);
      setTimeout(() => {
        renderPdfToCanvas(companyInfo.letterhead_path!, pdfCanvasRef.current);
      }, 100);
    }
  }, [showSettings, companyInfo?.letterhead_path, renderPdfToCanvas]);

  const calculateMonths = (from: string, to: string): number => {
    if (!from || !to) return 1;
    const startDate = new Date(from);
    const endDate = new Date(to);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 1;
    
    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += endDate.getMonth();
    
    return Math.max(1, months + 1);
  };

  useEffect(() => {
    if (selectedTemplate?.template_key === "salary_receipt" || selectedTemplate?.template_key === "final_clearance") {
      const basic = parseFloat(formData.basic_salary || "0");
      const housing = parseFloat(formData.housing_allowance || "0");
      const transport = parseFloat(formData.transport_allowance || "0");
      const bonus = parseFloat(formData.end_service_bonus || "0");
      const vacation = parseFloat(formData.vacation_balance || "0");
      const deduction = parseFloat(formData.total_deduction || "0");
      
      let months = 1;
      if (selectedTemplate?.template_key === "salary_receipt") {
        months = calculateMonths(formData.period_from, formData.period_to);
      }
      
      const subtotal = (basic + housing + transport) * months + bonus + vacation;
      const total = Math.max(0, subtotal - deduction);
      
      if (total.toString() !== formData.total_amount) {
        setFormData(prev => ({
          ...prev,
          total_amount: total.toString(),
          total_amount_text: convertAmountToWords(Math.floor(total))
        }));
      }
    }
  }, [formData.basic_salary, formData.housing_allowance, formData.transport_allowance, formData.end_service_bonus, formData.vacation_balance, formData.total_deduction, formData.period_from, formData.period_to, selectedTemplate]);

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
      toast.error(t("messages.fetchError"));
    } finally {
      setLoading(false);
    }
  };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("bucket", "letterheads");
      try {
        const res = await fetch("/api/upload", { method: "POST", body: uploadFormData });
        const data = await res.json();
        if (data.url) {
          const success = await updateCompanySettings({ letterhead_path: data.url });
          if (success) {
            toast.success(t("messages.uploadSuccess"));
            fetchData();
          } else {
            toast.error(t("messages.dbSaveError"));
          }
        } else {
          toast.error(data.error || t("messages.uploadError"));
        }
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(t("messages.uploadError"));
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
      toast.error(t("messages.updateSettingsError"));
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
    setSaveConfirmModal(true);
  };

  const confirmSave = async () => {
    if (!selectedTemplate) return;
    setSaveConfirmModal(false);
    setSavingModal(true);
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
      setSavingModal(false);
      if (data.success) {
        setSaveSuccessModal({ isOpen: true, letterNumber: data.letter_number || editingLetter?.letter_number || '' });
        fetchData();
        resetForm();
      } else {
        setSaveErrorModal({ isOpen: true, message: data.error || t("common.error") });
      }
    } catch (error) {
      console.error("Error saving letter:", error);
      setSavingModal(false);
      setSaveErrorModal({ isOpen: true, message: t("common.error") });
    }
  };

  const handleDeleteClick = (letter: GeneratedLetter) => {
    setDeleteConfirmModal({ isOpen: true, item: letter });
  };

  const confirmDelete = async () => {
    const item = deleteConfirmModal.item;
    if (!item) return;
    setDeleteConfirmModal({ isOpen: false, item: null });
    setDeletingModal(true);
    try {
      const res = await fetch(`/api/letters?id=${item.id}`, { method: "DELETE" });
      const data = await res.json();
      setDeletingModal(false);
      if (data.success) {
        setDeleteSuccessModal({ isOpen: true, title: item.letter_number });
        fetchData();
      } else {
        toast.error(data.error || t("common.error"));
      }
    } catch (error) {
      console.error("Error deleting letter:", error);
      setDeletingModal(false);
      toast.error(t("common.error"));
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
          body { font-family: 'Tajawal', sans-serif; direction: rtl; background: #fff; color: #000; line-height: 1.6; }
          @page { size: A4; margin: 0; }
          .page-container { width: 210mm; height: 297mm; position: relative; margin: 0 auto; overflow: hidden; }
          ${!isPdf ? `
          .page-container {
            background-image: url('${letterhead}');
            background-size: 100% 100%; background-repeat: no-repeat; background-position: center;
          }` : ''}
          .letterhead-pdf { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: -1; }
          .letter-content-wrapper { 
            position: absolute; 
            top: ${topMargin}px; 
            bottom: ${bottomMargin}px; 
            left: 50px; 
            right: 50px; 
            z-index: 1; 
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .letter-content { 
            font-size: var(--font-size, 16px); 
            text-align: justify; 
            line-height: var(--line-height, 1.6);
          }
          .letter-content p { margin-bottom: var(--paragraph-spacing, 12px); }
          .field { font-weight: bold; color: #000; }
          h2 { font-size: calc(var(--font-size, 16px) * 1.4); margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          td, th { padding: 8px; border: 1px solid #000; font-size: var(--font-size, 16px); }
          @media print { 
            .page-container { width: 100%; height: 100%; margin: 0; box-shadow: none; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .letterhead-pdf { display: block; }
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          ${isPdf ? `<iframe src="${letterhead}#toolbar=0&navpanes=0&scrollbar=0" class="letterhead-pdf"></iframe>` : ''}
          <div class="letter-content-wrapper">
            <div class="letter-content" id="letterContent">${content}</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            const wrapper = document.querySelector('.letter-content-wrapper');
            const content = document.getElementById('letterContent');
            const availableHeight = wrapper.clientHeight;
            let fontSize = 16;
            let lineHeight = 1.6;
            let paragraphSpacing = 12;
            
            function adjustContent() {
              document.documentElement.style.setProperty('--font-size', fontSize + 'px');
              document.documentElement.style.setProperty('--line-height', lineHeight);
              document.documentElement.style.setProperty('--paragraph-spacing', paragraphSpacing + 'px');
            }
            
            adjustContent();
            
            while (content.scrollHeight > availableHeight && fontSize > 10) {
              fontSize -= 0.5;
              adjustContent();
            }
            
            while (content.scrollHeight > availableHeight && lineHeight > 1.2) {
              lineHeight -= 0.05;
              adjustContent();
            }
            
            while (content.scrollHeight > availableHeight && paragraphSpacing > 4) {
              paragraphSpacing -= 1;
              adjustContent();
            }
            
            setTimeout(() => { window.print(); }, 500);
          }
        <\/script>
      </body>
      </html>
    `);
      printWindow.document.close();
    };

  const openEmailModal = (letter: GeneratedLetter) => {
    setEmailLetter(letter);
    setCustomEmail("");
    setShowEmailModal(true);
  };

  const generatePdfBase64 = async (letter: GeneratedLetter): Promise<string> => {
    const content = generateLetterContent(letter);
    const letterhead = companyInfo?.letterhead_path;
    const topMargin = margins.top;
    const bottomMargin = margins.bottom;
    const isPdf = letterhead?.toLowerCase().endsWith('.pdf');

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Tajawal', sans-serif; direction: rtl; background: #fff; color: #000; line-height: 1.6; }
          @page { size: A4; margin: 0; }
          .page-container { width: 210mm; height: 297mm; position: relative; margin: 0 auto; overflow: hidden; }
          ${!isPdf && letterhead ? `
          .page-container {
            background-image: url('${letterhead}');
            background-size: 100% 100%; background-repeat: no-repeat; background-position: center;
          }` : ''}
          .letter-content-wrapper { 
            position: absolute; 
            top: ${topMargin}px; 
            bottom: ${bottomMargin}px; 
            left: 50px; 
            right: 50px; 
            z-index: 1; 
            overflow: hidden;
          }
          .letter-content { font-size: 14px; text-align: justify; line-height: 1.6; }
          .letter-content p { margin-bottom: 10px; }
          .field { font-weight: bold; color: #000; }
          h2 { font-size: 18px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          td, th { padding: 8px; border: 1px solid #000; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="page-container">
          <div class="letter-content-wrapper">
            <div class="letter-content">${content}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    const { jsPDF } = await import('jspdf');
    const html2canvas = (await import('html2canvas')).default;
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '794px';
    iframe.style.height = '1123px';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Could not access iframe document');
    
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      width: 794,
      height: 1123
    });
    
    document.body.removeChild(iframe);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    
    return pdf.output('datauristring').split(',')[1];
  };

  const handleSendEmail = async (toCompanyEmail: boolean) => {
    if (!emailLetter) return;
    
    const recipientEmail = toCompanyEmail ? companyInfo?.email : customEmail;
    
    if (!recipientEmail) {
      toast.error(toCompanyEmail ? t("email.noCompanyEmail") : t("messages.enterEmail"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error(t("messages.invalidEmail"));
      return;
    }

    setIsSendingEmail(true);
    
    try {
      const pdfBase64 = await generatePdfBase64(emailLetter);
      
      const res = await fetch("/api/letters/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail,
          letterNumber: emailLetter.letter_number,
          letterType: t(`templates.${emailLetter.template_key}`),
          pdfBase64
        })
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(t("messages.emailSendSuccess", { email: recipientEmail }));
        setShowEmailModal(false);
        setEmailLetter(null);
        setCustomEmail("");
      } else {
        toast.error(data.error || t("messages.emailSendError"));
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(t("messages.emailSendError"));
    } finally {
      setIsSendingEmail(false);
    }
  };

    const filteredLetters = letters.filter(letter =>
    letter.letter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t(`templates.${letter.template_key}`).includes(searchTerm)
  );


  const getPlaceholders = (template: LetterTemplate): string[] => {
    let placeholders = typeof template.placeholders === 'string' ? JSON.parse(template.placeholders) : template.placeholders;
    if (template.template_key === "salary_receipt") {
      const essential = ["salary_period_type", "total_deduction"];
      essential.forEach(field => {
        if (!placeholders.includes(field)) {
          placeholders.push(field);
        }
      });
    }
    return placeholders;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-4 md:p-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 mb-8 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className={`text-center ${locale === 'ar' ? 'md:text-right' : 'md:text-left'}`}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <FileText className="w-10 h-10" />
                {t("title")}
              </h1>
              <p className="text-blue-100">{t("subtitle")}</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30 rounded-xl p-3 transition-all flex items-center gap-2 border border-amber-400/50"
                  title={t("paperSettings")}
                >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">{t("paperSettings")}</span>
              </button>
              {companyInfo && (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white border border-white/10">
                  <Building2 className={`w-5 h-5 inline-block ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
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
            {t("newLetterTitle")}
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
                  className={`bg-gradient-to-br ${colorClass} p-6 rounded-2xl text-white ${locale === 'ar' ? 'text-right' : 'text-left'} shadow-xl hover:shadow-2xl transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-white/20 rounded-xl"><Icon className="w-6 h-6" /></div>
                    {locale === 'ar' ? <ChevronLeft className="w-5 h-5 opacity-50" /> : <ChevronLeft className="w-5 h-5 opacity-50 rotate-180" />}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{t(`templates.${template.template_key}`)}</h3>
                  <p className="text-sm text-white/70">{t("fieldsToFill", { count: getPlaceholders(template).length })}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 mb-6">
          <div className="relative">
            <Search className={`absolute ${locale === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5`} />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-white/10 border border-white/20 rounded-xl py-3 ${locale === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </motion.div>

        {/* Letters List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            {t("createdLettersTitle", { count: filteredLetters.length })}
          </h2>
          {filteredLetters.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl text-white mb-2">{t("noLetters")}</h3>
              <p className="text-slate-400">{t("noLettersDesc")}</p>
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
                              {t(`status.${letter.status}`)}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-white">{t(`templates.${letter.template_key}`)}</h3>
                          <p className="text-slate-400 text-sm flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(letter.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <button onClick={() => openPreview(letter)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all" title={t("actions.preview")}><Eye className="w-5 h-5" /></button>
                          <button onClick={() => openEmailModal(letter)} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all" title={t("actions.sendEmail")}><Send className="w-5 h-5" /></button>
                          <button onClick={() => openEditForm(letter)} className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all" title={t("actions.edit")}><Edit2 className="w-5 h-5" /></button>
                          <button onClick={() => handleDeleteClick(letter)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all" title={t("actions.delete")}><Trash2 className="w-5 h-5" /></button>
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
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="w-6 h-6 text-blue-500" /> {t("settings.title")}</h2>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <div className="space-y-6">
                    <div className="bg-slate-700/50 p-6 rounded-xl border border-slate-600">
                      <label className="block text-white font-bold mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-blue-400" /> {t("settings.letterheadLabel")}</label>
                      <div className="relative group">
                        <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" id="letterhead-upload" />
                        <label htmlFor="letterhead-upload" className="cursor-pointer block border-2 border-dashed border-slate-500 hover:border-blue-500 rounded-xl p-8 text-center transition-all bg-slate-800/50">
                          {isUploading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div> :
                            companyInfo?.letterhead_path ? (
                              <div className="relative">
                                {companyInfo.letterhead_path.toLowerCase().endsWith('.pdf') ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <FileText className="w-20 h-20 text-red-500" />
                                    <span className="text-white text-sm">{t("settings.pdfSuccess")}</span>
                                    <span className="text-slate-400 text-xs">{t("settings.pdfNotice")}</span>
                                  </div>
                                ) : (
                                  <img src={companyInfo.letterhead_path} alt="Letterhead" className="max-h-40 mx-auto rounded shadow-lg" />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                  <span className="text-white text-sm">{t("settings.changeFile")}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-slate-400"><Upload className="w-12 h-12 mx-auto mb-2 opacity-20" /><p>{t("settings.dragDrop")}</p></div>
                            )
                          }
                        </label>
                      </div>
                    </div>

                      <div className="space-y-4">
                        <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
                          <div className="flex justify-between items-center mb-4">
                            <label className="text-white font-bold flex items-center gap-2"><MoveVertical className="w-5 h-5 text-blue-400" /> {t("settings.topMargin")}</label>
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
                            <label className="text-white font-bold flex items-center gap-2"><MoveVertical className="w-5 h-5 text-blue-400" /> {t("settings.bottomMargin")}</label>
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

                        {/* Visual Margin Preview with Full Letterhead */}
                        <div className="bg-slate-900/50 rounded-xl p-4">
                          <p className="text-center text-slate-400 text-sm mb-3">{t("settings.previewMargins")}</p>
                          <div className="flex justify-center">
                            <div 
                              className="relative bg-white border-2 border-slate-500 overflow-hidden shadow-2xl"
                              style={{ width: '200px', height: '283px' }}
                            >
                              {companyInfo?.letterhead_path ? (
                                companyInfo.letterhead_path.toLowerCase().endsWith('.pdf') ? (
                                  <div className="absolute inset-0">
                                    <canvas 
                                      ref={pdfCanvasRef} 
                                      className="w-full h-full object-cover"
                                    />
                                    {!pdfRendered && (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                                        <span className="text-[9px] text-slate-500">Loading PDF...</span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <img 
                                    src={companyInfo.letterhead_path} 
                                    className="absolute inset-0 w-full h-full object-cover" 
                                    alt="Letterhead" 
                                  />
                                )
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                                  <Upload className="w-10 h-10 mb-2 opacity-30" />
                                  <span className="text-[9px]">{t("settings.noFileUploaded")}</span>
                                </div>
                              )}
                              
                              {/* Top Margin Overlay */}
                              <div 
                                className="absolute top-0 left-0 right-0 bg-blue-500/50 border-b-2 border-blue-600 flex items-end justify-center transition-all duration-200"
                                style={{ height: `${(margins.top / 1122) * 283}px` }}
                              >
                                <div className="bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-t-md mb-[-1px] shadow">
                                  {margins.top}px
                                </div>
                              </div>
                              
                              {/* Bottom Margin Overlay */}
                              <div 
                                className="absolute bottom-0 left-0 right-0 bg-blue-500/50 border-t-2 border-blue-600 flex items-start justify-center transition-all duration-200"
                                style={{ height: `${(margins.bottom / 1122) * 283}px` }}
                              >
                                <div className="bg-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-b-md mt-[-1px] shadow">
                                  {margins.bottom}px
                                </div>
                              </div>
                              
                              {/* Safe Content Zone Indicator */}
                              <div 
                                className="absolute left-2 right-2 border border-dashed border-green-500/60 bg-green-500/10 flex items-center justify-center transition-all duration-200"
                                style={{ 
                                  top: `${(margins.top / 1122) * 283}px`,
                                  bottom: `${(margins.bottom / 1122) * 283}px`
                                }}
                              >
                                <span className="text-[7px] text-green-600 font-bold bg-white/80 px-1 rounded">{t("settings.safeZone")}</span>
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
                              toast.success(t("messages.updateSuccess"));
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
                          {t("settings.saveSettings")}
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
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="w-6 h-6 text-blue-500" /> {editingLetter ? t("form.editTitle") : t("form.createTitle", { template: t(`templates.${selectedTemplate.template_key}`) })}</h2>
                  <button onClick={resetForm} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getPlaceholders(selectedTemplate).map((placeholder) => (
                        <div key={placeholder}>
                          <label className="block text-slate-300 mb-2 text-sm font-medium">{placeholderLabels[placeholder as keyof typeof placeholderLabels] || placeholder}</label>
                          {placeholder === "salary_period_type" ? (
                            <select
                              value={formData[placeholder] || ""}
                              onChange={(e) => setFormData({ ...formData, [placeholder]: e.target.value })}
                              className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">{t("form.select") || "اختر..."}</option>
                              <option value="شهري">شهري</option>
                              <option value="سنوي">سنوي</option>
                            </select>
                          ) : (
                            <>
                              <input 
                                type={placeholder.includes("date") || placeholder.includes("period_") ? "date" : "text"} 
                                value={formData[placeholder] || ""} 
                                onChange={(e) => setFormData({ ...formData, [placeholder]: e.target.value })} 
                                readOnly={placeholder === "total_amount" || placeholder === "total_amount_text"} 
                                className={`w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${(placeholder === "total_amount" || placeholder === "total_amount_text") ? "opacity-75 cursor-not-allowed bg-slate-800" : ""}`} 
                                placeholder={t("form.placeholderPrefix", { label: placeholderLabels[placeholder as keyof typeof placeholderLabels] || placeholder })} 
                              />
                              {placeholder === "total_deduction" && (
                                <p className="text-xs text-slate-400 mt-1">يمكنك إضافة مبلغ خصم هنا من الإجمالي إذا كان المبلغ لا يطابق أو أشهر رواتبها منخفضة</p>
                              )}
                            </>
                          )}
                        </div>
                      ))}

                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="submit" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> 
                      {editingLetter ? t("form.saveChanges") : t("form.createLetter")}
                    </button>
                    <button type="button" onClick={resetForm} className="px-6 bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl font-bold transition-all">
                      {t("form.cancel")}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowPreview(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                <div className="bg-slate-800 p-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{t("preview.title", { number: previewLetter.letter_number })}</h2>
                  <div className="flex items-center gap-2">
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all"><Printer className="w-5 h-5" /> {t("preview.print")}</button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-all"><Download className="w-5 h-5" /> {t("preview.downloadPdf")}</button>
                    <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white p-2"><X className="w-6 h-6" /></button>
                  </div>
                </div>
                  <div className="flex-1 overflow-y-auto bg-slate-200 p-4 md:p-8 flex justify-center">
                      <div 
                        className="bg-white shadow-2xl origin-top relative overflow-hidden"
                        style={{ 
                          width: '210mm', height: '297mm',
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
                          ref={printRef}
                          className={`absolute ${locale === 'ar' ? 'right-[50px] left-[50px]' : 'left-[50px] right-[50px]'} z-10 overflow-hidden`}
                          style={{ 
                            top: `${margins.top}px`,
                            bottom: `${margins.bottom}px`
                          }}
                        >
                            <AutoFitContent 
                              content={generateLetterContent(previewLetter)}
                              maxHeight={1122 - margins.top - margins.bottom}
                            />
                          </div>
                        </div>
                      </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Modal */}
          <AnimatePresence>
            {showEmailModal && emailLetter && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
                onClick={(e) => e.target === e.currentTarget && !isSendingEmail && setShowEmailModal(false)}
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.9, opacity: 0 }} 
                  className="bg-slate-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-white/10"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <Send className="w-6 h-6 text-emerald-400" />
                      </div>
                      {t("email.title")}
                    </h2>
                    <button 
                      onClick={() => !isSendingEmail && setShowEmailModal(false)} 
                      className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                      disabled={isSendingEmail}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="bg-slate-700/30 rounded-2xl p-4 mb-6 border border-slate-600/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{t(`templates.${emailLetter.template_key}`)}</p>
                        <p className="text-slate-400 text-sm">{emailLetter.letter_number}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => handleSendEmail(true)}
                      disabled={isSendingEmail || !companyInfo?.email}
                      className={`w-full p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                        companyInfo?.email 
                          ? "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/20" 
                          : "bg-slate-700/30 border-slate-600/30 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="p-3 bg-emerald-500/20 rounded-xl">
                        {isSendingEmail ? (
                          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                        ) : (
                          <Building2 className="w-6 h-6 text-emerald-400" />
                        )}
                      </div>
                      <div className={`${locale === 'ar' ? 'text-right' : 'text-left'} flex-1`}>
                        <p className="text-white font-bold text-lg">{t("email.sendToCompany")}</p>
                        <p className="text-slate-400 text-sm">
                          {companyInfo?.email || t("email.noCompanyEmail")}
                        </p>
                      </div>
                      <Send className={`w-5 h-5 text-emerald-400 ${locale === 'ar' ? '' : 'rotate-180'}`} />
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-600"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-slate-800 px-4 text-slate-400 text-sm">{t("email.or")}</span>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 rounded-2xl p-5 border border-slate-600/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <AtSign className="w-5 h-5 text-blue-400" />
                        </div>
                        <p className="text-white font-bold">{t("email.sendToOther")}</p>
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="email"
                          placeholder={t("email.emailPlaceholder")}
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          disabled={isSendingEmail}
                          className="flex-1 bg-slate-800 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          dir="ltr"
                        />
                        <button
                          onClick={() => handleSendEmail(false)}
                          disabled={isSendingEmail || !customEmail}
                          className={`px-6 rounded-xl font-bold flex items-center gap-2 transition-all ${
                            customEmail && !isSendingEmail
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                              : "bg-slate-700 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          {isSendingEmail ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Send className={`w-5 h-5 ${locale === 'ar' ? '' : 'rotate-180'}`} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isSendingEmail && (
                    <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                      <p className="text-blue-400 text-sm">{t("email.sendingStatus")}</p>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>

          {/* Save Confirm Modal */}
          <AnimatePresence>
            {saveConfirmModal && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSaveConfirmModal(false)}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20"
                >
                  <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-10 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", damping: 15 }}
                      className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <Shield size={48} className="text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                    <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-black tracking-tight relative z-10">
                      تأكيد {editingLetter ? 'تعديل' : 'حفظ'} الخطاب
                    </motion.h3>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-white/80 font-bold mt-2 relative z-10">
                      يرجى التأكد من صحة البيانات قبل المتابعة
                    </motion.p>
                  </div>
                  <div className="p-8 text-center space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-6 border-2 border-blue-100 dark:border-blue-900/50">
                      <p className="text-slate-700 dark:text-slate-300 font-bold text-lg leading-relaxed">
                        {editingLetter ? 'هل تريد حفظ التعديلات على الخطاب؟' : 'هل تريد إنشاء هذا الخطاب الرسمي؟'}
                      </p>
                      <p className="text-blue-600 dark:text-blue-400 font-black text-xl mt-2">
                        {selectedTemplate ? t(`templates.${selectedTemplate.template_key}`) : ''}
                      </p>
                      {formData.employee_name && (
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-2">
                          الموظف: {formData.employee_name}
                        </p>
                      )}
                    </div>
                    <p className="text-slate-500 font-bold text-sm">
                      سيتم حفظ الخطاب وإضافته إلى السجلات الرسمية
                    </p>
                    <div className="flex gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSaveConfirmModal(false)}
                        className="flex-1 flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <X size={20} />
                        إلغاء
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={confirmSave}
                        className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 border-b-4 border-blue-700/50"
                      >
                        <Check size={20} />
                        نعم، احفظ
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Saving Modal */}
          <AnimatePresence>
            {savingModal && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20"
                >
                  <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-12 text-white text-center overflow-hidden">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      <Loader2 size={48} className="text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-black tracking-tight">جارٍ الحفظ</h3>
                    <div className="flex items-center justify-center gap-1 mt-3">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                          className="w-3 h-3 bg-white rounded-full"
                        />
                      ))}
                    </div>
                    <p className="text-white/80 font-bold mt-4">يتم حفظ الخطاب الرسمي في النظام...</p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Save Success Modal */}
          <AnimatePresence>
            {saveSuccessModal.isOpen && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSaveSuccessModal({ isOpen: false, letterNumber: '' })}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden border-4 border-emerald-500/20"
                >
                  <div className="relative bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 p-10 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 100, x: Math.random() * 400 - 200 }}
                          animate={{ opacity: [0, 1, 0], y: -100, rotate: Math.random() * 360 }}
                          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                          className="absolute"
                        >
                          <Sparkles size={20} className="text-yellow-300" />
                        </motion.div>
                      ))}
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", damping: 15 }}
                      className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.3, 1] }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <CheckCircle size={48} className="text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                    <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-black tracking-tight relative z-10">
                      تم الحفظ بنجاح!
                    </motion.h3>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-white/80 font-bold mt-2 relative z-10">
                      تم إنشاء الخطاب الرسمي وإضافته للسجلات
                    </motion.p>
                  </div>
                  <div className="p-8 text-center space-y-6">
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-6 border-2 border-emerald-100 dark:border-emerald-900/50">
                      <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">
                        رقم الخطاب
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-black text-2xl mt-2">
                        {saveSuccessModal.letterNumber}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSaveSuccessModal({ isOpen: false, letterNumber: '' })}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-700/50"
                    >
                      <Check size={20} />
                      تم، إغلاق
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Save Error Modal */}
          <AnimatePresence>
            {saveErrorModal.isOpen && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSaveErrorModal({ isOpen: false, message: '' })}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
                >
                  <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", damping: 15 }}
                      className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      <X size={48} className="text-white drop-shadow-lg" />
                    </motion.div>
                    <h3 className="text-3xl font-black tracking-tight">فشل في الحفظ</h3>
                    <p className="text-white/80 font-bold mt-2">حدث خطأ أثناء حفظ الخطاب</p>
                  </div>
                  <div className="p-8 text-center space-y-6">
                    <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 border-2 border-red-100 dark:border-red-900/50">
                      <p className="text-red-600 dark:text-red-400 font-bold text-lg">{saveErrorModal.message}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSaveErrorModal({ isOpen: false, message: '' })}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50"
                    >
                      <X size={20} />
                      إغلاق
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Delete Confirm Modal */}
          <AnimatePresence>
            {deleteConfirmModal.isOpen && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDeleteConfirmModal({ isOpen: false, item: null })}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
                >
                  <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", damping: 15 }}
                      className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <AlertTriangle size={48} className="text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                    <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-black tracking-tight relative z-10">
                      تأكيد الحذف
                    </motion.h3>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-white/80 font-bold mt-2 relative z-10">
                      هذا الإجراء لا يمكن التراجع عنه
                    </motion.p>
                  </div>
                  <div className="p-8 text-center space-y-6">
                    <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 border-2 border-red-100 dark:border-red-900/50">
                      <p className="text-slate-700 dark:text-slate-300 font-bold text-lg leading-relaxed">
                        هل أنت متأكد من حذف الخطاب الرسمي
                      </p>
                      <p className="text-red-600 dark:text-red-400 font-black text-xl mt-2">
                        "{deleteConfirmModal.item?.letter_number}"
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-2">
                        {deleteConfirmModal.item ? t(`templates.${deleteConfirmModal.item.template_key}`) : ''}
                      </p>
                    </div>
                    <p className="text-slate-500 font-bold text-sm">
                      سيتم حذف الخطاب نهائياً من السجلات ولا يمكن التراجع عنه
                    </p>
                    <div className="flex gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDeleteConfirmModal({ isOpen: false, item: null })}
                        className="flex-1 flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <X size={20} />
                        إلغاء
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={confirmDelete}
                        className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50"
                      >
                        <Trash2 size={20} />
                        نعم، احذف
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Deleting Modal */}
          <AnimatePresence>
            {deletingModal && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
                >
                  <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-12 text-white text-center overflow-hidden">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      <Loader2 size={48} className="text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-black tracking-tight">جارٍ الحذف</h3>
                    <div className="flex items-center justify-center gap-1 mt-3">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                          className="w-3 h-3 bg-white rounded-full"
                        />
                      ))}
                    </div>
                    <p className="text-white/80 font-bold mt-4">يتم حذف الخطاب من السجلات...</p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Delete Success Modal */}
          <AnimatePresence>
            {deleteSuccessModal.isOpen && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setDeleteSuccessModal({ isOpen: false, title: '' })}
                  className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden border-4 border-emerald-500/20"
                >
                  <div className="relative bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 p-10 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 100, x: Math.random() * 400 - 200 }}
                          animate={{ opacity: [0, 1, 0], y: -100, rotate: Math.random() * 360 }}
                          transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                          className="absolute"
                        >
                          <Sparkles size={20} className="text-yellow-300" />
                        </motion.div>
                      ))}
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", damping: 15 }}
                      className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ delay: 0.5, duration: 0.5 }}>
                        <CheckCircle size={48} className="text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                    <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-black tracking-tight relative z-10">
                      تم الحذف بنجاح!
                    </motion.h3>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-white/80 font-bold mt-2 relative z-10">
                      تم حذف الخطاب من السجلات الرسمية
                    </motion.p>
                  </div>
                  <div className="p-8 text-center space-y-6">
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-6 border-2 border-emerald-100 dark:border-emerald-900/50">
                      <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">
                        تم حذف الخطاب
                      </p>
                      <p className="text-emerald-600 dark:text-emerald-400 font-black text-xl mt-2">
                        "{deleteSuccessModal.title}"
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDeleteSuccessModal({ isOpen: false, title: '' })}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-700/50"
                    >
                      <Check size={20} />
                      تم، إغلاق
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      </div>
    );
}

