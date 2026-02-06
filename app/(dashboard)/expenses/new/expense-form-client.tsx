"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Save, Tags, Cog, Info, CheckCircle, 
  ChevronDown, X, Calculator, Paperclip, Search, 
  ArrowRight, FileText, History, Bolt, Building2, User as UserIcon,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import SubtypeManager from "./subtype-manager";
import { useTranslations } from "@/lib/locale-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HierarchicalSearchableSelect } from "@/components/ui/hierarchical-searchable-select";

import { toast } from "sonner";

interface Employee {
  id: number;
  name: string;
  iqama_number: string;
  phone: string;
  package_id: number;
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
}

interface ExpenseRow {
  id: string;
  expense_date: string;
  expense_type: string;
  amount: string;
  employee_iqama: string;
  employee_name: string;
  employee_id: string;
  account_code: string;
  cost_center_code: string;
  description: string;
  taxable: boolean;
  tax_inclusive: boolean;
  tax_value: string;
  net_amount: string;
  attachment: File | null;
  manualEmployee: boolean;
}

const mainTypes = {
  iqama: 'iqama',
  fuel: 'fuel',
  housing: 'housing',
  maintenance: 'maintenance',
  general: 'general',
  traffic: 'traffic',
  advances: 'advances'
};

const defaultExpenseValues: Record<string, string> = {
  iqama: 'تجديد هوية',
  fuel: 'منصرفات وقود',
  housing: 'إيجار سكن',
  maintenance: 'صيانة المركبات',
  general: 'منصرفات داخلية',
  traffic: 'مخالفات مرورية',
  advances: 'سلفيات'
};

const headersMap: Record<string, string[]> = {
  iqama: ['التاريخ', 'نوع المصروف', 'المبلغ', 'رقم الهوية', 'الموظف', 'الحساب', 'مركز التكلفة', 'الوصف', 'المستند', 'حذف'],
  fuel: ['التاريخ', 'نوع المصروف', 'المبلغ', 'ضريبة 15%', 'الصافي', 'الحساب', 'مركز التكلفة', 'الوصف', 'المستند', 'حذف'],
  traffic: ['التاريخ', 'نوع المصروف', 'المبلغ', 'السائق', 'رقم الهوية', 'مركز التكلفة', 'الحساب', 'الوصف', 'المستند', 'حذف'],
  advances: ['التاريخ', 'نوع المصروف', 'المبلغ', 'الموظف', 'رقم الهوية', 'الحساب', 'مركز التكلفة', 'الوصف', 'المستند*', 'حذف'],
  default: ['التاريخ', 'نوع المصروف', 'المبلغ', 'الحساب', 'مركز التكلفة', 'الوصف', 'المستند', 'حذف']
};

function EmployeeSelect({ row, type, metadata, updateRow, t }: { 
  row: ExpenseRow; 
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
      <div className="flex items-center space-x-2 space-x-reverse">
        <input 
          type="text" 
          className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-sm text-gray-900"
          placeholder={t("form.employeeName")}
          value={row.employee_name || ""}
          onChange={(e) => updateRow(type, row.id, 'employee_name', e.target.value)}
        />
        <button 
          type="button"
          onClick={() => updateRow(type, row.id, 'manualEmployee', false)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-xs font-black shrink-0 shadow-lg shadow-blue-200"
        >
          <Search className="w-4 h-4" />
          <span>البحث في قاعدة البيانات</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 space-x-reverse">
      <div className="relative w-full">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div 
              className="w-full bg-white/50 border border-slate-200 cursor-pointer text-sm font-medium py-1.5 px-3 flex items-center justify-between min-h-[36px] hover:bg-white hover:border-blue-300 rounded-lg transition-all shadow-sm"
            >
              <span className={row.employee_name ? "text-gray-900 font-bold" : "text-slate-400"}>
                {row.employee_name || t("form.selectEmployee")}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
            </div>
          </PopoverTrigger>
          <PopoverContent 
            className="p-0 w-[400px] bg-white border border-slate-200 rounded-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] overflow-hidden z-[9999]" 
            align="start"
            sideOffset={8}
          >
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder={t("form.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
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
                    className="px-5 py-4 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-all flex flex-col group/item"
                  >
                    <div className="font-bold text-slate-900 text-[15px] group-hover/item:text-blue-700">{emp.name}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-mono border border-slate-200">
                        {emp.iqama_number || "بدون هوية"}
                      </span>
                      {emp.phone && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          {emp.phone}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-base text-slate-400 font-medium">{t("form.noResults")}</p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
          <button 
            type="button"
            onClick={() => updateRow(type, row.id, 'manualEmployee', true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-xs font-black shrink-0 shadow-lg shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            <span>إدخال البيانات يدوياً</span>
          </button>
    </div>
  );
}

export default function ExpenseFormClient({ user }: { user: User }) {
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

  const [sections, setSections] = useState<Record<string, ExpenseRow[]>>({});
  const [selectedTypeToAdd, setSelectedTypeToAdd] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [showSubtypeManager, setShowSubtypeManager] = useState(false);

  const fetchMetadata = async () => {
    try {
      const res = await fetch(`/api/expenses/metadata?company_id=${user.company_id}&user_id=${user.id}`);
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

    const newRow: ExpenseRow = {
      id: Math.random().toString(36).substr(2, 9),
      expense_date: new Date().toISOString().split('T')[0],
      expense_type: defaultExpenseValues[type] || "",
      amount: "",
      employee_iqama: "",
      employee_name: "",
      employee_id: "",
      account_code: "",
      cost_center_code: "",
      description: "",
      taxable: false,
      tax_inclusive: false,
      tax_value: "0",
      net_amount: "0",
      attachment: null,
      manualEmployee: false
    };

    setSections(prev => ({
      ...prev,
      [type]: [newRow]
    }));
    setSelectedTypeToAdd("");
  };

  const addRow = (type: string) => {
    const newRow: ExpenseRow = {
      id: Math.random().toString(36).substr(2, 9),
      expense_date: new Date().toISOString().split('T')[0],
      expense_type: defaultExpenseValues[type] || "",
      amount: "",
      employee_iqama: "",
      employee_name: "",
      employee_id: "",
      account_code: "",
      cost_center_code: "",
      description: "",
      taxable: false,
      tax_inclusive: false,
      tax_value: "0",
      net_amount: "0",
      attachment: null,
      manualEmployee: false
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

  const updateRow = (type: string, id: string, field: keyof ExpenseRow, value: any) => {
    setSections(prev => {
      const updatedRows = prev[type].map(row => {
        if (row.id === id) {
          let updatedRow = { ...row, [field]: value };
          if (type === 'fuel') {
            const amtStr = String(updatedRow.amount || "0").trim();
            const amt = parseFloat(amtStr) || 0;
            if (updatedRow.taxable) {
              const tax = amt * 0.15;
              updatedRow.tax_value = tax.toFixed(2);
              updatedRow.net_amount = (amt + tax).toFixed(2);
            } else {
              updatedRow.tax_value = "0";
              updatedRow.net_amount = amt.toFixed(2);
            }
          } else {
            updatedRow.net_amount = updatedRow.amount;
          }
          return updatedRow;
        }
        return row;
      });
      return { ...prev, [type]: updatedRows };
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(sections).length === 0) return;

    // Validation
    let isValid = true;
    Object.values(sections).forEach(rows => {
      rows.forEach(row => {
        const amount = String(row.amount || "").trim();
        const expenseDate = String(row.expense_date || "").trim();
        const accountCode = String(row.account_code || "").trim();
        const costCenterCode = String(row.cost_center_code || "").trim();
        
        if (!amount || !expenseDate || !accountCode || !costCenterCode) {
          isValid = false;
        }
      });
    });

    if (!isValid) {
      toast.error("يرجى التأكد من إدخال المبلغ، التاريخ، شجرة الحسابات، ومركز التكلفة لجميع الصفوف.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("company_id", user.company_id.toString());
    formData.append("user_id", user.id.toString());
    formData.append("month", new Date().toISOString().substring(0, 7));
    
    // Log data being sent for debugging
    let rowCount = 0;
    Object.entries(sections).forEach(([mainType, rows]) => {
      rows.forEach(row => {
        formData.append("main_type[]", mainType);
        formData.append("expense_date[]", row.expense_date || "");
        formData.append("expense_type[]", row.expense_type || "");
        formData.append("amount[]", row.amount || "");
        formData.append("employee_iqama[]", row.employee_iqama || "");
        formData.append("employee_name[]", row.employee_name || "");
        formData.append("employee_id[]", row.employee_id || "");
        formData.append("account_code[]", row.account_code || "");
        formData.append("cost_center_code[]", row.cost_center_code || "");
        formData.append("description[]", row.description || "");
        formData.append("tax_value[]", row.tax_value || "0");
        formData.append("net_amount[]", row.net_amount || "");
        rowCount++;
        if (row.attachment) {
          formData.append("attachment[]", row.attachment);
        } else {
          formData.append("attachment[]", "");
        }
      });
    });
    try {
      console.log("Sending expenses data:", rowCount, "rows");
      const res = await fetch("/api/expenses/save", {
        method: "POST",
        body: formData,
      });
      
      console.log("Response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("Response data:", data);
      
      if (data.success) {
        setSavedCount(data.savedCount);
        setShowSuccess(true);
      } else {
        const errorMsg = data.message || data.error || "فشل حفظ المنصرفات";
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Save failed:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ في الاتصال";
      toast.error(`خطأ: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[96%] w-[96%] mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-slate-800 via-slate-700 to-slate-600 rounded-3xl shadow-2xl overflow-hidden border border-slate-500/30"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white border-b border-slate-600/50">
          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
              <Plus className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight glow-text-white">{t("form.addMultiple")}</h1>
            <p className="text-slate-300 max-w-2xl">{t("form.subtitle")}</p>
          </div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-red-500"></div>
        </div>
  
        <div className="p-6 space-y-6">
          <motion.div 
            className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/50 flex flex-col md:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 glow-text">{t("form.manageCustomTypes")}</h3>
                <p className="text-xs text-slate-500">{t("form.manageCustomTypesDesc")}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSubtypeManager(true)}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 space-x-reverse border border-indigo-100 text-sm"
            >
              <Settings className="w-4 h-4" />
              <span>{t("form.manageBtn")}</span>
            </button>
          </motion.div>
  
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-md flex items-center space-x-3 space-x-reverse">
              <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("form.currentMonth")}</p>
                <p className="text-base font-bold text-slate-900 glow-text">{new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-md flex items-center space-x-3 space-x-reverse">
              <div className="p-2.5 bg-green-50 rounded-lg text-green-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("form.nextVoucher")}</p>
                <p className="text-base font-bold text-slate-900 glow-text">{metadata?.voucherNumber}</p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-md flex items-center space-x-3 space-x-reverse">
              <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
                <Bolt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("form.voucherStatus")}</p>
                <p className="text-base font-bold text-slate-900 glow-text">{t("form.new")}</p>
              </div>
            </div>
          </motion.div>
  
          <motion.div 
            className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <Tags className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900 glow-text">{t("form.chooseType")}</h2>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <select 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm text-gray-900"
                value={selectedTypeToAdd}
                onChange={(e) => setSelectedTypeToAdd(e.target.value)}
              >
                <option value="">{t("form.selectType")}</option>
                {Object.entries(mainTypes).map(([key]) => (
                  <option key={key} value={key}>{t(`types.${key}`)}</option>
                ))}
              </select>
              <button 
                onClick={() => addSection(selectedTypeToAdd)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-blue-200 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{t("form.addTypeBtn")}</span>
              </button>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6 p-6">
          <AnimatePresence>
            {Object.entries(sections).map(([type, rows]) => (
              <motion.div 
                key={type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden"
              >
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 glow-text">{t(`types.${type}`)}</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeSection(type)}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto p-4">
                      <table className="w-full text-start border-collapse min-w-[1000px]">
                        <thead>
                          <tr className="bg-blue-600 border-b border-blue-700 text-white text-[10px] uppercase tracking-wider">
                            {headersMap[type] ? headersMap[type].map((h, i) => (
                              <th key={i} className="px-4 py-4 font-black text-start whitespace-nowrap">
                                {t(`form.${h === 'التاريخ' ? 'date' : h === 'نوع المصروف' ? 'type' : h === 'المبلغ' ? 'amount' : h === 'ضريبة 15%' ? 'tax' : h === 'الصافي' ? 'net' : h === 'الحساب' ? 'account' : h === 'مركز التكلفة' ? 'costCenter' : h === 'الوصف' ? 'description' : h === 'المستند' || h === 'المستند*' ? 'document' : h === 'رقم الهوية' ? 'iqamaNumber' : h === 'الموظف' ? 'employee' : h === 'السائق' ? 'driver' : 'delete'}`)}
                              </th>
                            )) : headersMap.default.map((h, i) => (
                              <th key={i} className="px-4 py-4 font-black text-start whitespace-nowrap">{t(`form.${h === 'التاريخ' ? 'date' : h === 'نوع المصروف' ? 'type' : h === 'المبلغ' ? 'amount' : h === 'الحساب' ? 'account' : h === 'مركز التكلفة' ? 'costCenter' : h === 'الوصف' ? 'description' : h === 'المستند' ? 'document' : 'delete'}`)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row) => (
                            <tr key={row.id} className="bg-white border-b border-slate-100 hover:bg-blue-50/30 transition-colors group">
                              <td className="px-2 py-4">

                              <input 
                                type="date" 
                                className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-900"
                                value={row.expense_date || ""}
                                onChange={(e) => updateRow(type, row.id, 'expense_date', e.target.value)}
                                required
                              />
                            </td>
                            <td className="px-2 py-4">
                              <select 
                                className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-900"
                                value={row.expense_type || ""}
                                onChange={(e) => updateRow(type, row.id, 'expense_type', e.target.value)}
                              >
                                <option value="">{t("form.selectType")}</option>
                                {(metadata?.subtypes || [])
                                  .filter(s => s.main_type === type)
                                  .map(s => (
                                    <option key={s.subtype_name} value={s.subtype_name}>{s.subtype_name}</option>
                                  ))}
                                <option value="other">أخرى</option>
                              </select>
                            </td>
                            <td className="px-2 py-4">
                              <input 
                                type="number" 
                                className="w-20 bg-transparent border-none focus:ring-0 text-xs font-black text-gray-900"
                                placeholder="0.00"
                                value={row.amount || ""}
                                onChange={(e) => updateRow(type, row.id, 'amount', e.target.value)}
                                required
                              />
                            </td>
                            {type === 'fuel' && (
                              <>
                                <td className="px-2 py-4 text-center">
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                                    checked={row.taxable}
                                    onChange={(e) => updateRow(type, row.id, 'taxable', e.target.checked)}
                                  />
                                </td>
                                <td className="px-2 py-4">
                                  <span className="text-xs font-black text-green-700 bg-green-50 px-2 py-1 rounded-lg border border-green-100">{row.net_amount}</span>
                                </td>
                              </>
                            )}
                            {(type === 'iqama') && (
                              <>
                                <td className="px-2 py-4">
                                  <input 
                                    type="text" 
                                    className="w-24 bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-900"
                                    value={row.employee_iqama || ""}
                                    readOnly={!row.manualEmployee}
                                    onChange={(e) => updateRow(type, row.id, 'employee_iqama', e.target.value)}
                                    placeholder={t("form.iqamaNumber")}
                                  />
                                </td>
                                <td className="px-2 py-4 min-w-[200px]">
                                  <EmployeeSelect row={row} type={type} metadata={metadata} updateRow={updateRow} t={t} />
                                </td>
                              </>
                            )}
                            {(type === 'traffic' || type === 'advances') && (
                              <>
                                <td className="px-2 py-4 min-w-[200px]">
                                  <EmployeeSelect row={row} type={type} metadata={metadata} updateRow={updateRow} t={t} />
                                </td>
                                <td className="px-2 py-4">
                                  <input 
                                    type="text" 
                                    className="w-24 bg-transparent border-none focus:ring-0 text-xs font-bold text-gray-900"
                                    value={row.employee_iqama || ""}
                                    readOnly={!row.manualEmployee}
                                    onChange={(e) => updateRow(type, row.id, 'employee_iqama', e.target.value)}
                                    placeholder={t("form.iqamaNumber")}
                                  />
                                </td>
                              </>
                            )}
                              <td className="px-2 py-4">
                                <div className="w-48">
                                  <HierarchicalSearchableSelect
                                    items={(metadata?.accounts || []).map(acc => ({
                                      id: acc.id,
                                      code: acc.account_code,
                                      name: acc.account_name,
                                      level: acc.account_level,
                                      parent: acc.parent_account
                                    }))}
                                    value={row.account_code || ""}
                                    onSelect={(val) => updateRow(type, row.id, 'account_code', val)}
                                    placeholder={t("form.account")}
                                  />
                                </div>
                              </td>
                                <td className="px-2 py-4">
                                  <div className="w-48">
                                    <HierarchicalSearchableSelect
                                      items={(metadata?.costCenters || []).map(cc => ({
                                        id: cc.id,
                                        code: cc.center_code,
                                        name: cc.center_name,
                                        level: cc.center_level,
                                        parent: cc.parent_center
                                      }))}
                                      value={row.cost_center_code || ""}
                                      onSelect={(val) => updateRow(type, row.id, 'cost_center_code', val)}
                                      placeholder={t("form.costCenter")}
                                    />
                                  </div>
                                </td>
                          <td className="px-2 py-4">
                            <input 
                              type="text" 
                              className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900"
                              placeholder={t("form.description")}
                              value={row.description || ""}
                              onChange={(e) => updateRow(type, row.id, 'description', e.target.value)}
                            />
                          </td>
                          <td className="px-2 py-4 text-center">
                            <label className="cursor-pointer hover:text-blue-600 transition-colors">
                              <Paperclip className={`w-5 h-5 ${row.attachment ? 'text-green-600' : 'text-slate-400'}`} />
                              <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => updateRow(type, row.id, 'attachment', e.target.files ? e.target.files[0] : null)}
                              />
                            </label>
                          </td>
                          <td className="px-2 py-4 text-center">
                            <button 
                              type="button"
                              onClick={() => removeRow(type, row.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                  <button 
                    type="button"
                    onClick={() => addRow(type)}
                    className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t("form.addRow")}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {Object.keys(sections).length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center pt-8 pb-8"
            >
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={`bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-3 space-x-reverse shadow-xl shadow-green-200/50 transform active:scale-95 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span className="text-lg">{t("form.saveAll")}</span>
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showSuccess && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998]"
              onClick={() => {
                setShowSuccess(false);
                setSections({});
                setSelectedTypeToAdd("");
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white p-10 rounded-3xl shadow-2xl text-center w-[90%] max-w-[550px]"
            >
              <div className="w-24 h-24 bg-white/25 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-16 h-16 text-white drop-shadow-lg" />
              </div>
              <h2 className="text-4xl font-black mb-4 drop-shadow-md">✓ تم الحفظ بنجاح</h2>
              <p className="text-xl opacity-95 mb-2 font-bold">
                تم حفظ {savedCount} من السجلات بنجاح في النظام
              </p>
              <p className="text-base opacity-85 mb-10">
                يمكنك الآن إدخال منصروفات جديدة أو العودة للقائمة الرئيسية
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => {
                    setShowSuccess(false);
                    setSections({});
                    setSelectedTypeToAdd("");
                  }}
                  className="bg-white text-green-700 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-green-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>إدخال جديد</span>
                </button>
                <button 
                  onClick={() => {
                    setShowSuccess(false);
                    setTimeout(() => router.push('/expenses'), 200);
                  }}
                  className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                >
                  <span>العودة للمركز</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSubtypeManager && (
          <SubtypeManager 
            companyId={user.company_id}
            userId={user.id}
            onClose={() => setShowSubtypeManager(false)}
            onRefresh={fetchMetadata}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        .glow-text {
          text-shadow: 0 0 8px rgba(59, 130, 246, 0.2), 0 0 15px rgba(59, 130, 246, 0.1);
        }
        .glow-text-white {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.4), 0 0 20px rgba(59, 130, 246, 0.3);
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.5);
        }
      `}</style>
    </div>
  );
}
