"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Save, Tags, Info, CheckCircle, 
  ChevronDown, X, Paperclip, Search, 
  ArrowRight, FileText, History, Bolt, Building2,
  Settings, HandCoins, AlertTriangle, CheckCircle2, Loader2, FileCheck, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import DeductionSubtypeManager from "./deduction-subtype-manager";
import { useTranslations } from "@/lib/locale-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HierarchicalSearchableSelect } from "@/components/ui/hierarchical-searchable-select";

interface NotificationState {
  show: boolean;
  type: 'warning' | 'confirm' | 'loading' | 'success' | 'error';
  title: string;
  message: string;
  details?: {
    count: number;
    totalAmount: number;
    types?: string[];
    month?: string;
  };
  missingFields?: string[];
  onConfirm?: () => void;
}

interface Employee {
  id: number;
  name: string;
  iqama_number: string;
  phone: string;
}

interface Account {
  id: number;
  account_code: string;
  account_name: string;
  account_level?: number;
  parent_account?: string | null;
}

interface CostCenter {
  id: number;
  center_code: string;
  center_name: string;
  center_level?: number;
  parent_center?: string | null;
}

interface Subtype {
  main_type: string;
  subtype_name: string;
  is_custom: boolean;
}

interface DeductionRow {
  id: string;
  expense_date: string;
  deduction_type: string;
  amount: string;
  employee_id: string;
  employee_name: string;
  employee_iqama: string;
  account_id: string;
  cost_center_id: string;
  description: string;
  status: 'pending' | 'collected';
  manualEmployee: boolean;
  attachment: File | null;
}

const mainTypes = {
  advances: 'advances',
  deductions: 'deductions',
  other: 'other'
};

const defaultDeductionValues: Record<string, string> = {
  advances: 'سلفية',
  deductions: 'خصم تأخير',
  other: 'استقطاع متنوع'
};

const headersMap: Record<string, string[]> = {
  advances: ['date', 'type', 'amount', 'employee', 'iqamaNumber', 'account', 'costCenter', 'description', 'status', 'delete'],
  deductions: ['date', 'type', 'amount', 'employee', 'iqamaNumber', 'account', 'costCenter', 'description', 'status', 'delete'],
  other: ['date', 'type', 'amount', 'employee', 'iqamaNumber', 'account', 'costCenter', 'description', 'status', 'delete']
};

function EmployeeSelect({ row, type, metadata, updateRow, t }: { 
  row: DeductionRow; 
  type: string; 
  metadata: any; 
  updateRow: any;
  t: any;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredEmployees = (metadata?.employees || []).filter((emp: Employee) => 
    (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (emp.iqama_number || "").includes(searchTerm)
  );

  if (row.manualEmployee) {
    return (
      <div className="flex flex-col gap-1">
        <input 
          type="text" 
          className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-[11px] text-slate-900 placeholder:text-slate-400 font-medium"
          placeholder={t("form.employeeName")}
          value={row.employee_name}
          onChange={(e) => updateRow(type, row.id, 'employee_name', e.target.value)}
        />
        <button 
          type="button"
          onClick={() => updateRow(type, row.id, 'manualEmployee', false)}
          className="w-full flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all text-[10px] font-bold"
        >
          <Search className="w-3 h-3" />
          <span>بحث من القائمة</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div 
            className="w-full bg-white border border-slate-200 cursor-pointer text-[11px] font-medium py-1.5 px-2 flex items-center justify-between min-h-[32px] hover:bg-slate-50 hover:border-rose-300 rounded transition-all shadow-sm"
          >
            <span className={row.employee_name ? "text-slate-900 font-bold truncate" : "text-slate-400"}>
              {row.employee_name || t("form.selectEmployee")}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-rose-500' : ''}`} />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[320px] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-[9999]" 
          align="start"
          sideOffset={4}
        >
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
                placeholder={t("form.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp: Employee) => (
                <div
                  key={emp.id}
                  onClick={() => {
                    updateRow(type, row.id, 'employee_id', emp.id.toString());
                    updateRow(type, row.id, 'employee_name', emp.name);
                    updateRow(type, row.id, 'employee_iqama', emp.iqama_number);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="px-3 py-2 hover:bg-rose-50 cursor-pointer border-b border-slate-50 last:border-0 transition-all flex flex-col group/item"
                >
                  <div className="font-bold text-slate-900 text-[11px] group-hover/item:text-rose-700">{emp.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-200">
                      {emp.iqama_number || "بدون هوية"}
                    </span>
                    {emp.phone && (
                      <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                        <Info className="w-2.5 h-2.5" />
                        {emp.phone}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <Search className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                <p className="text-xs text-slate-400 font-medium">{t("form.noResults")}</p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <button 
        type="button"
        onClick={() => updateRow(type, row.id, 'manualEmployee', true)}
        className="w-full flex items-center justify-center gap-1 px-2 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 transition-all text-[10px] font-bold"
      >
        <Plus className="w-3 h-3" />
        <span>إدخال يدوي</span>
      </button>
    </div>
  );
}

export default function DeductionFormClient({ user }: { user: User }) {
  const router = useRouter();
  const t = useTranslations("expenses");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [metadata, setMetadata] = useState<{
    accounts: Account[];
    costCenters: CostCenter[];
    subtypes: Subtype[];
    employees: Employee[];
    voucherNumber: number;
  } | null>(null);

  const [sections, setSections] = useState<Record<string, DeductionRow[]>>({});
  const [selectedTypeToAdd, setSelectedTypeToAdd] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [showSubtypeManager, setShowSubtypeManager] = useState(false);
  const [monthReference, setMonthReference] = useState(new Date().toISOString().substring(0, 7));

  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'warning',
    title: '',
    message: '',
  });

  const showNotification = (
    type: NotificationState['type'],
    title: string,
    message: string,
    details?: NotificationState['details'],
    missingFields?: string[],
    onConfirm?: () => void
  ) => {
    setNotification({ show: true, type, title, message, details, missingFields, onConfirm });
  };

  const fetchMetadata = async () => {
    try {
      const res = await fetch(`/api/expenses/deductions/metadata?company_id=${user.company_id}&user_id=${user.id}`, {
        credentials: 'include'
      });
      if (!res.ok) {
        console.error("Failed to fetch metadata:", res.status);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setMetadata(data);
    } catch (error) {
      console.error("Failed to fetch metadata", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, [user.company_id, user.id]);

  const addSection = (type: string) => {
    if (!type) return;
    if (sections[type]) return;

    const newRow: DeductionRow = {
      id: Math.random().toString(36).substr(2, 9),
      expense_date: new Date().toISOString().split('T')[0],
      deduction_type: defaultDeductionValues[type] || "",
      amount: "",
      employee_id: "",
      employee_name: "",
      employee_iqama: "",
      account_id: "",
      cost_center_id: "",
        description: "",
        status: 'pending',
        manualEmployee: false,
        attachment: null
      };
  
      setSections(prev => ({
        ...prev,
        [type]: [newRow]
      }));
      setSelectedTypeToAdd("");
    };
  
    const addRow = (type: string) => {
      const newRow: DeductionRow = {
        id: Math.random().toString(36).substr(2, 9),
        expense_date: new Date().toISOString().split('T')[0],
        deduction_type: defaultDeductionValues[type] || "",
        amount: "",
        employee_id: "",
        employee_name: "",
        employee_iqama: "",
        account_id: "",
        cost_center_id: "",
        description: "",
        status: 'pending',
        manualEmployee: false,
        attachment: null
      };

    setSections(prev => ({
      ...prev,
      [type]: [...prev[type], newRow]
    }));
  };

  const removeRow = (type: string, id: string) => {
    setSections(prev => {
      const updated = prev[type].filter(row => row.id !== id);
      if (updated.length === 0) {
        const { [type]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [type]: updated };
    });
  };

  const removeSection = (type: string) => {
    setSections(prev => {
      const { [type]: removed, ...rest } = prev;
      return rest;
    });
  };

  const updateRow = (type: string, id: string, field: keyof DeductionRow, value: any) => {
    setSections(prev => {
      const updatedRows = prev[type].map(row => {
        if (row.id === id) {
          let updatedRow = { ...row, [field]: value };
          if (field === 'deduction_type' || field === 'employee_name') {
            const dType = field === 'deduction_type' ? value : row.deduction_type;
            const eName = field === 'employee_name' ? value : row.employee_name;
            if (dType && eName) {
              updatedRow.description = `${dType} للموظف: ${eName}`;
            }
          }
          return updatedRow;
        }
        return row;
      });
      return { ...prev, [type]: updatedRows };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(sections).length === 0) return;

    // Collect missing fields
    const rowsWithMissingFields: string[] = [];
    
    Object.entries(sections).forEach(([type, rows]) => {
      rows.forEach((row, index) => {
        const rowNumber = index + 1;
        const missing: string[] = [];
        
        if (!String(row.account_id || "").trim()) missing.push('شجرة الحسابات');
        if (!String(row.cost_center_id || "").trim()) missing.push('مركز التكلفة');
        if (!String(row.amount || "").trim() || parseFloat(row.amount) <= 0) missing.push('المبلغ');
        if (!String(row.expense_date || "").trim()) missing.push('التاريخ');
        
        if (missing.length > 0) {
          rowsWithMissingFields.push(`صف ${rowNumber} (${t(`types.${type}`)}) - ${missing.join('، ')}`);
        }
      });
    });

    if (rowsWithMissingFields.length > 0) {
      showNotification(
        'warning',
        'حقول إجبارية مفقودة',
        'يرجى إكمال الحقول التالية قبل الحفظ:',
        undefined,
        rowsWithMissingFields
      );
      return;
    }

    // Calculate totals for confirm modal
    const allRows = Object.values(sections).flat();
    const totalCount = allRows.length;
    const totalAmount = allRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
    const types = Object.keys(sections).map(type => t(`types.${type}`));

    showNotification(
      'confirm',
      'تأكيد حفظ الاستقطاعات',
      'هل تريد حفظ الاستقطاعات التالية؟',
      {
        count: totalCount,
        totalAmount,
        types,
        month: new Date(monthReference + '-01').toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })
      },
      undefined,
      () => executeSave()
    );
  };

  const executeSave = async () => {
    showNotification('loading', 'جاري الحفظ...', 'يتم حفظ الاستقطاعات في النظام');

    setSubmitting(true);
    const allDeductions = Object.values(sections).flat();
      try {
        const formData = new FormData();
        formData.append("company_id", user.company_id.toString());
        formData.append("user_id", user.id.toString());
        formData.append("month_reference", monthReference);
        formData.append("voucher_number", metadata?.voucherNumber?.toString() || "");
        
        const deductionsData = allDeductions.map(row => {
          const { attachment, ...rest } = row;
          return rest;
        });
        formData.append("deductions_json", JSON.stringify(deductionsData));
  
        allDeductions.forEach(row => {
          if (row.attachment) {
            formData.append(`file_${row.id}`, row.attachment);
          }
        });
  
        const res = await fetch("/api/expenses/deductions/save", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          const totalAmount = allDeductions.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
          setSavedCount(data.saved_count);
          showNotification(
            'success',
            'تم الحفظ بنجاح',
            `تم حفظ ${data.saved_count} استقطاع بنجاح`,
            {
              count: data.saved_count,
              totalAmount,
              types: Object.keys(sections).map(type => t(`types.${type}`)),
              month: new Date(monthReference + '-01').toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })
            }
          );
        } else {
          const errorMsg = data.message || data.error || "فشل حفظ الاستقطاعات";
          showNotification('error', 'خطأ في الحفظ', errorMsg);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "حدث خطأ في الاتصال";
        showNotification('error', 'خطأ في الحفظ', errorMessage);
      } finally {
        setSubmitting(false);
      }
    };

  if (loading) {
      return (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        </div>
      );
    }

      return (
          <div className="w-full min-h-screen px-3 py-3 space-y-3">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-lg bg-gradient-to-r from-rose-900 to-rose-800 p-3 text-white shadow-md border border-white/10"
          >
            <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-1">
              <div className="p-1.5 bg-white/10 rounded-full backdrop-blur-sm">
                <HandCoins className="w-4 h-4 text-rose-400" />
              </div>
              <h1 className="text-base font-bold tracking-tight">{t("deductions.title")}</h1>
              <p className="text-rose-300 max-w-2xl text-[10px]">{t("deductions.subtitle")}</p>
            </div>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500"></div>
          </motion.div>

        <div className="bg-white rounded-xl shadow-md border border-slate-100 p-3 space-y-3">
          <motion.div 
            className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="p-1 bg-rose-100 rounded text-rose-600">
                <Tags className="w-3 h-3" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">{t("form.manageCustomTypes")}</h3>
                <p className="text-[9px] text-slate-500">{t("form.manageCustomTypesDesc")}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSubtypeManager(true)}
              className="bg-white hover:bg-rose-50 text-rose-700 px-3 py-1 rounded font-bold transition-all flex items-center space-x-1 space-x-reverse border border-rose-200 shadow-sm text-[10px]"
            >
              <Settings className="w-3 h-3" />
              <span>{t("form.manageBtn")}</span>
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-2"
          >
            <div className="bg-rose-50/50 p-2 rounded-lg border border-rose-100 flex items-center space-x-2 space-x-reverse">
              <div className="p-1.5 bg-white rounded text-rose-600 shadow-sm">
                <History className="w-3 h-3" />
              </div>
              <div className="flex-1">
                <p className="text-[8px] uppercase tracking-wider font-bold text-rose-400">{t("form.currentMonth")}</p>
                <input 
                  type="month" 
                  className="bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 text-xs w-full cursor-pointer"
                  value={monthReference}
                  onChange={(e) => setMonthReference(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 flex items-center space-x-2 space-x-reverse">
              <div className="p-1.5 bg-white rounded text-emerald-600 shadow-sm">
                <FileText className="w-3 h-3" />
              </div>
              <div>
                <p className="text-[8px] uppercase tracking-wider font-bold text-emerald-400">{t("form.nextVoucher")}</p>
                <p className="text-sm font-bold text-slate-900">{metadata?.voucherNumber}</p>
              </div>
            </div>
            <div className="bg-purple-50/50 p-2 rounded-lg border border-purple-100 flex items-center space-x-2 space-x-reverse">
              <div className="p-1.5 bg-white rounded text-purple-600 shadow-sm">
                <Bolt className="w-3 h-3" />
              </div>
              <div>
                <p className="text-[8px] uppercase tracking-wider font-bold text-purple-400">{t("form.voucherStatus")}</p>
                <p className="text-sm font-bold text-slate-900">{t("form.new")}</p>
              </div>
            </div>
          </motion.div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("form.chooseType")}</span>
            </div>
          </div>

          <motion.div 
            className="bg-slate-50 p-3 rounded-lg border-2 border-dashed border-slate-200"
          >
            <div className="flex flex-col md:flex-row gap-2 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold text-slate-500 mr-2">{t("form.selectType")}</label>
                  <select 
                    className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all text-xs font-bold shadow-sm text-slate-900"
                    value={selectedTypeToAdd}
                    onChange={(e) => setSelectedTypeToAdd(e.target.value)}
                  >
                    <option value="" className="text-slate-900">{t("form.selectType")}</option>
                  {Object.entries(mainTypes).map(([key]) => (
                    <option key={key} value={key}>{t(`types.${key}`)}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => addSection(selectedTypeToAdd)}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded font-bold transition-all flex items-center justify-center space-x-1 space-x-reverse shadow-md text-xs"
              >
                <Plus className="w-3 h-3" />
                <span>{t("form.addTypeBtn")}</span>
              </button>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <AnimatePresence>
              {Object.entries(sections).map(([type, rows]) => (
                <motion.div 
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
                >
                  <div className="bg-slate-900 p-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <div className="p-1 bg-white/10 rounded text-rose-400 backdrop-blur-md">
                        <Building2 className="w-3 h-3" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white">{t(`types.${type}`)}</h3>
                        <p className="text-[9px] text-white/50">{rows.length} {t("common.records")}</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeSection(type)}
                      className="text-white/30 hover:text-rose-400 hover:bg-white/10 p-1 rounded transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse text-[11px]">
                      <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[95px]">{t("form.date")} <span className="text-red-500 text-sm">*</span></th>
                            <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[110px]">{t("form.type")}</th>
                            <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[90px]">{t("form.amount")} <span className="text-red-500 text-sm">*</span></th>
                            <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[180px]">{t("form.employee")}</th>
                            <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[100px]">{t("form.iqamaNumber")}</th>
                            <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[90px]">{t("form.account")} <span className="text-red-500 text-sm">*</span></th>
                            <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[90px]">{t("form.costCenter")} <span className="text-red-500 text-sm">*</span></th>
                            <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[100px]">{t("form.description")}</th>
                            <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center w-[45px]">{t("form.document")}</th>
                            <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center w-[75px]">{t("common.status")}</th>
                            <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center w-[35px]"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {rows.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group align-top">
                              <td className="px-2 py-2">
                                <input 
                                  type="date" 
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-rose-500 text-[11px] font-medium text-slate-700"
                                  value={row.expense_date}
                                  onChange={(e) => updateRow(type, row.id, 'expense_date', e.target.value)}
                                  required
                                />
                              </td>
                              <td className="px-2 py-2">
                                <select 
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-rose-500 text-[11px] font-medium text-slate-700"
                                  value={row.deduction_type}
                                  onChange={(e) => updateRow(type, row.id, 'deduction_type', e.target.value)}
                                >
                                  <option value="">{t("form.selectType")}</option>
                                  {(metadata?.subtypes || [])
                                    .filter((s: Subtype) => s.main_type === type)
                                    .map((s: Subtype) => (
                                      <option key={s.subtype_name} value={s.subtype_name}>
                                        {s.subtype_name}
                                      </option>
                                    ))}
                                  <option value="other">أخرى</option>
                                </select>
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex items-center bg-white border border-slate-200 rounded px-2 py-1.5">
                                  <span className="text-[9px] font-bold text-rose-400 ml-1">ر.س</span>
                                  <input 
                                    type="number" 
                                    className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-bold text-rose-600 p-0"
                                    placeholder="0.00"
                                    value={row.amount}
                                    onChange={(e) => updateRow(type, row.id, 'amount', e.target.value)}
                                    required
                                  />
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <EmployeeSelect row={row} type={type} metadata={metadata} updateRow={updateRow} t={t} />
                              </td>
                              <td className="px-2 py-2">
                                <input 
                                  type="text" 
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-rose-500 text-[11px] font-medium text-slate-600"
                                  value={row.employee_iqama}
                                  readOnly={!row.manualEmployee}
                                  onChange={(e) => updateRow(type, row.id, 'employee_iqama', e.target.value)}
                                  placeholder="رقم الهوية"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <HierarchicalSearchableSelect
                                  items={(metadata?.accounts || []).map((acc: Account) => ({
                                    id: acc.id,
                                    code: acc.account_code,
                                    name: acc.account_name,
                                    level: acc.account_level,
                                    parent: acc.parent_account
                                  }))}
                                  value={row.account_id}
                                  valueKey="id"
                                  onSelect={(val) => updateRow(type, row.id, 'account_id', val)}
                                  placeholder={t("form.account")}
                                  className="text-[11px]"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <HierarchicalSearchableSelect
                                  items={(metadata?.costCenters || []).map((cc: CostCenter) => ({
                                    id: cc.id,
                                    code: cc.center_code,
                                    name: cc.center_name,
                                    level: cc.center_level,
                                    parent: cc.parent_center
                                  }))}
                                  value={row.cost_center_id}
                                  valueKey="id"
                                  onSelect={(val) => updateRow(type, row.id, 'cost_center_id', val)}
                                  placeholder={t("form.costCenter")}
                                  className="text-[11px]"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input 
                                  type="text" 
                                  className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 focus:ring-1 focus:ring-rose-500 text-[10px] font-medium text-slate-600 placeholder:text-slate-300"
                                  placeholder={t("form.description")}
                                  value={row.description}
                                  onChange={(e) => updateRow(type, row.id, 'description', e.target.value)}
                                />
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex flex-col items-center gap-0.5">
                                  <label className={`cursor-pointer p-1.5 rounded border border-dashed transition-all ${row.attachment ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-400'}`}>
                                    <Paperclip className="w-3 h-3" />
                                    <input 
                                      type="file" 
                                      className="hidden" 
                                      onChange={(e) => updateRow(type, row.id, 'attachment', e.target.files?.[0] || null)}
                                    />
                                  </label>
                                  {row.attachment && (
                                    <span className="text-[8px] font-bold text-emerald-600">تم</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <div className="flex justify-center">
                                  <button 
                                    type="button"
                                    onClick={() => updateRow(type, row.id, 'status', row.status === 'collected' ? 'pending' : 'collected')}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border text-[10px] font-bold ${
                                      row.status === 'collected' 
                                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300' 
                                      : 'bg-red-50 text-red-600 border-red-200'
                                    }`}
                                  >
                                    <span>{row.status === 'collected' ? 'تم التحصيل' : 'لم يتم'}</span>
                                  </button>
                                </div>
                              </td>
                              <td className="px-2 py-2">
                                <button 
                                  type="button"
                                  onClick={() => removeRow(type, row.id)}
                                  className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                    </table>
                  </div>
                  
                  <div className="p-2 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center">
                    <button 
                      type="button"
                      onClick={() => addRow(type)}
                      className="flex items-center space-x-1 space-x-reverse text-rose-600 hover:text-rose-700 font-bold text-[10px] transition-all"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>{t("form.addRow")}</span>
                    </button>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                      {rows.length} {t("common.records")} {t(`types.${type}`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {Object.keys(sections).length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center pt-3"
              >
                <button 
                  type="submit"
                  disabled={submitting}
                  className={`group bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-all flex items-center space-x-1 space-x-reverse shadow-md text-xs ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-3 h-3 group-hover:scale-110 transition-transform" />
                  )}
                  <span>{t("deductions.saveAll")}</span>
                </button>
              </motion.div>
            )}
          </form>
        </div>

      <AnimatePresence>
        {/* Luxury Notification Modal */}
        {notification.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
              onClick={() => {
                if (notification.type !== 'loading') {
                  if (notification.type === 'success') {
                    setNotification(prev => ({ ...prev, show: false }));
                    setSections({});
                    setSelectedTypeToAdd("");
                    fetchMetadata();
                  } else {
                    setNotification(prev => ({ ...prev, show: false }));
                  }
                }
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90%] max-w-[520px]"
            >
              {/* Warning Modal */}
              {notification.type === 'warning' && (
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white">{notification.title}</h2>
                    <p className="text-amber-100 mt-2 text-sm">{notification.message}</p>
                  </div>
                  {notification.missingFields && notification.missingFields.length > 0 && (
                    <div className="p-6 max-h-[300px] overflow-y-auto">
                      <div className="space-y-2">
                        {notification.missingFields.map((field, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
                            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                              <X className="w-3 h-3 text-red-600" />
                            </div>
                            <span className="text-sm font-bold text-red-800">{field}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <button
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-200 active:scale-95"
                    >
                      فهمت، سأكمل البيانات
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Modal */}
              {notification.type === 'confirm' && (
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100">
                  <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileCheck className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white">{notification.title}</h2>
                    <p className="text-rose-200 mt-2 text-sm">{notification.message}</p>
                  </div>
                  {notification.details && (
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-center">
                          <p className="text-xs text-rose-500 font-bold mb-1">عدد العمليات</p>
                          <p className="text-2xl font-black text-rose-700">{notification.details.count}</p>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                          <p className="text-xs text-green-500 font-bold mb-1">إجمالي المبلغ</p>
                          <p className="text-2xl font-black text-green-700">{notification.details.totalAmount?.toFixed(2)}</p>
                        </div>
                      </div>
                      {notification.details.types && notification.details.types.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 justify-center">
                          {notification.details.types.map((type, idx) => (
                            <span key={idx} className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">{type}</span>
                          ))}
                        </div>
                      )}
                      {notification.details.month && (
                        <p className="text-center text-sm text-slate-500 mt-3 flex items-center justify-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {notification.details.month}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setNotification(prev => ({ ...prev, show: false }));
                        notification.onConfirm?.();
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-200 active:scale-95 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      تأكيد الحفظ
                    </button>
                    <button
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className="bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all active:scale-95"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* Loading Modal */}
              {notification.type === 'loading' && (
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 p-10 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-rose-100"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-rose-600 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-3 rounded-full border-4 border-pink-100"></div>
                    <div className="absolute inset-3 rounded-full border-4 border-pink-500 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                  </div>
                  <h2 className="text-xl font-black text-slate-800 mb-2">{notification.title}</h2>
                  <p className="text-slate-500 text-sm">{notification.message}</p>
                  <div className="mt-6 flex justify-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Success Modal */}
              {notification.type === 'success' && (
                <div className="bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 rounded-3xl shadow-2xl overflow-hidden text-white p-8 text-center">
                  <div className="w-24 h-24 bg-white/25 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-16 h-16 text-white drop-shadow-lg" />
                  </div>
                  <h2 className="text-3xl font-black mb-3 drop-shadow-md">{notification.title}</h2>
                  <p className="text-lg opacity-95 font-bold mb-2">{notification.message}</p>
                  {notification.details && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-xs text-rose-200">عدد العمليات</p>
                        <p className="text-2xl font-black">{notification.details.count}</p>
                      </div>
                      <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-xs text-rose-200">إجمالي المبلغ</p>
                        <p className="text-2xl font-black">{notification.details.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4 justify-center mt-8">
                    <button
                      onClick={() => {
                        setNotification(prev => ({ ...prev, show: false }));
                        setSections({});
                        setSelectedTypeToAdd("");
                        fetchMetadata();
                      }}
                      className="bg-white text-rose-700 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-rose-50 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      إدخال جديد
                    </button>
                    <button
                      onClick={() => {
                        setNotification(prev => ({ ...prev, show: false }));
                        setTimeout(() => router.push('/expenses'), 200);
                      }}
                      className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                    >
                      العودة للمركز
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Error Modal */}
              {notification.type === 'error' && (
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-100">
                  <div className="bg-gradient-to-r from-red-600 to-rose-600 p-6 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-white">{notification.title}</h2>
                    <p className="text-red-200 mt-2 text-sm">{notification.message}</p>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                    <button
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-3 rounded-xl font-bold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                    >
                      حسناً
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSubtypeManager && (
          <DeductionSubtypeManager 
            companyId={user.company_id}
            userId={user.id}
            onClose={() => setShowSubtypeManager(false)}
            onRefresh={fetchMetadata}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.5);
        }
        .left-3\\.5 { left: 0.875rem; }
      `}</style>
    </div>
  );
}
