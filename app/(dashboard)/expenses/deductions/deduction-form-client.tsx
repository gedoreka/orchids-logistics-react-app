"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Save, Tags, Info, CheckCircle, 
  ChevronDown, X, Paperclip, Search, 
  ArrowRight, FileText, History, Bolt, Building2,
  Settings, HandCoins
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import DeductionSubtypeManager from "./deduction-subtype-manager";
import { useTranslations } from "@/lib/locale-context";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HierarchicalSearchableSelect } from "@/components/ui/hierarchical-searchable-select";

import { toast } from "sonner";

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
      <div className="flex items-center space-x-1 space-x-reverse">
        <input 
          type="text" 
          className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1 text-[11px]"
          placeholder={t("form.employeeName")}
          value={row.employee_name}
          onChange={(e) => updateRow(type, row.id, 'employee_name', e.target.value)}
        />
        <button 
          type="button"
          onClick={() => updateRow(type, row.id, 'manualEmployee', false)}
          className="flex items-center gap-1 px-2 py-1 bg-rose-600 text-white rounded hover:bg-rose-700 transition-all text-[10px] font-bold shrink-0"
        >
          <Search className="w-3 h-3" />
          <span>بحث</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 space-x-reverse">
      <div className="relative w-full">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div 
              className="w-full bg-white/50 border border-slate-200 cursor-pointer text-[11px] font-medium py-1 px-2 flex items-center justify-between min-h-[28px] hover:bg-white hover:border-rose-300 rounded transition-all shadow-sm"
            >
              <span className={row.employee_name ? "text-slate-900 font-bold" : "text-slate-400"}>
                {row.employee_name || t("form.selectEmployee")}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-rose-500' : ''}`} />
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
                  className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
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
                    className="px-5 py-4 hover:bg-rose-50 cursor-pointer border-b border-slate-50 last:border-0 transition-all flex flex-col group/item"
                  >
                    <div className="font-bold text-slate-900 text-[15px] group-hover/item:text-rose-700">{emp.name}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-mono border border-slate-200">
                        {emp.iqama_number || "بدون إقامة"}
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
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all text-xs font-black shrink-0 shadow-lg shadow-rose-200"
          >
            <Plus className="w-4 h-4" />
            <span>إدخال البيانات يدوياً</span>
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

    // Validation
    let isValid = true;
    Object.values(sections).forEach(rows => {
      rows.forEach(row => {
        if (!row.amount || !row.expense_date || !row.account_id || !row.cost_center_id) {
          isValid = false;
        }
      });
    });

    if (!isValid) {
      toast.error("يرجى التأكد من إدخال المبلغ، التاريخ، شجرة الحسابات، ومركز التكلفة لجميع الصفوف.");
      return;
    }

    setSubmitting(true);
    const allDeductions = Object.values(sections).flat();
      try {
        const formData = new FormData();
        formData.append("company_id", user.company_id.toString());
        formData.append("user_id", user.id.toString());
        formData.append("month_reference", monthReference);
        formData.append("voucher_number", metadata?.voucherNumber?.toString() || "");
        
        // Prepare rows data without the File objects
        const deductionsData = allDeductions.map(row => {
          const { attachment, ...rest } = row;
          return rest;
        });
        formData.append("deductions_json", JSON.stringify(deductionsData));
  
        // Append files separately with their corresponding row IDs
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
          setSavedCount(data.saved_count);
          setShowSuccess(true);
        }
      } catch (error) {
        console.error("Save failed", error);
      } finally {
        setSubmitting(false);
      }
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

    return (
        <div className="w-full min-h-screen px-4 py-4 space-y-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-900 to-rose-800 p-4 text-white shadow-lg border border-white/10"
        >
          <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
              <HandCoins className="w-5 h-5 text-rose-400" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">{t("deductions.title")}</h1>
            <p className="text-rose-300 max-w-2xl text-xs">{t("deductions.subtitle")}</p>
          </div>
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500"></div>
        </motion.div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 space-y-4">
        <motion.div 
          className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
              <Tags className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t("form.manageCustomTypes")}</h3>
              <p className="text-[10px] text-slate-500">{t("form.manageCustomTypesDesc")}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSubtypeManager(true)}
            className="bg-white hover:bg-rose-50 text-rose-700 px-4 py-1.5 rounded-lg font-bold transition-all flex items-center space-x-2 space-x-reverse border border-rose-200 shadow-sm text-xs"
          >
            <Settings className="w-3 h-3" />
            <span>{t("form.manageBtn")}</span>
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100 flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-white rounded-lg text-rose-600 shadow-sm">
              <History className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[9px] uppercase tracking-wider font-bold text-rose-400 mb-0.5">{t("form.currentMonth")}</p>
              <input 
                type="month" 
                className="bg-transparent border-none p-0 focus:ring-0 font-black text-slate-900 text-sm w-full cursor-pointer"
                value={monthReference}
                onChange={(e) => setMonthReference(e.target.value)}
              />
            </div>
          </div>
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-white rounded-lg text-emerald-600 shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-400 mb-0.5">{t("form.nextVoucher")}</p>
              <p className="text-base font-black text-slate-900">{metadata?.voucherNumber}</p>
            </div>
          </div>
          <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 flex items-center space-x-3 space-x-reverse">
            <div className="p-2 bg-white rounded-lg text-purple-600 shadow-sm">
              <Bolt className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-wider font-bold text-purple-400 mb-0.5">{t("form.voucherStatus")}</p>
              <p className="text-base font-black text-slate-900">{t("form.new")}</p>
            </div>
          </div>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">{t("form.chooseType")}</span>
          </div>
        </div>

        <motion.div 
          className="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-slate-200"
        >
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 mr-2">{t("form.selectType")}</label>
                <select 
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all text-sm font-bold shadow-sm text-slate-900"
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
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-rose-200 hover:shadow-rose-300 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t("form.addTypeBtn")}</span>
            </button>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {Object.entries(sections).map(([type, rows]) => (
              <motion.div 
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="bg-slate-900 p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-1.5 bg-white/10 rounded-lg text-rose-400 backdrop-blur-md">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{t(`types.${type}`)}</h3>
                      <p className="text-[10px] text-white/50">{rows.length} {t("common.records")}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeSection(type)}
                    className="text-white/30 hover:text-rose-400 hover:bg-white/10 p-1.5 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[100px]">{t("form.date")}</th>
                          <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[120px]">{t("form.type")}</th>
                          <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[80px]">{t("form.amount")}</th>
                          <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start min-w-[250px]">{t("form.employee")}</th>
                          <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[90px]">{t("form.iqamaNumber")}</th>
                          <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[120px]">{t("form.account")}</th>
                          <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start w-[120px]">{t("form.costCenter")}</th>
                          <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-start">{t("form.description")}</th>
                          <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center w-[60px]">{t("form.document")}</th>
                          <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center w-[80px]">{t("common.status")}</th>
                          <th className="px-2 py-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider text-center w-[40px]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {rows.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-2 py-2">
                              <input 
                                type="date" 
                                className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-medium text-slate-700"
                                value={row.expense_date}
                                onChange={(e) => updateRow(type, row.id, 'expense_date', e.target.value)}
                                required
                              />
                            </td>
                            <td className="px-2 py-2">
                              <select 
                                className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-medium text-slate-700 appearance-none"
                                value={row.deduction_type}
                                onChange={(e) => updateRow(type, row.id, 'deduction_type', e.target.value)}
                              >
                                <option value="">{t("form.selectType")}</option>
                                {(metadata?.subtypes || [])
                                  .filter(s => s.main_type === type)
                                  .map(s => (
                                    <option key={s.subtype_name} value={s.subtype_name}>
                                      {s.subtype_name} {s.is_custom ? "✏️" : "🌟"}
                                    </option>
                                  ))}
                                <option value="other">أخرى</option>
                              </select>
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex items-center">
                                <span className="text-[9px] font-bold text-rose-300 ml-1">ر.س</span>
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
                                className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-medium text-slate-500"
                                value={row.employee_iqama}
                                readOnly={!row.manualEmployee}
                                onChange={(e) => updateRow(type, row.id, 'employee_iqama', e.target.value)}
                                placeholder="رقم الإقامة"
                              />
                            </td>
                                <td className="px-2 py-2">
                                  <HierarchicalSearchableSelect
                                    items={(metadata?.accounts || []).map(acc => ({
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
                                    className="w-28 text-[11px]"
                                  />
                                </td>
                                <td className="px-2 py-2">
                                  <HierarchicalSearchableSelect
                                    items={(metadata?.costCenters || []).map(cc => ({
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
                                    className="w-28 text-[11px]"
                                  />
                                </td>
                            <td className="px-2 py-2">
                              <input 
                                type="text" 
                                className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-medium text-slate-600 placeholder:text-slate-300"
                                placeholder={t("form.description")}
                                value={row.description}
                                onChange={(e) => updateRow(type, row.id, 'description', e.target.value)}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <div className="flex flex-col items-center gap-0.5">
                                <label className={`cursor-pointer p-1.5 rounded-lg border border-dashed transition-all ${row.attachment ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-400'}`}>
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
                                <div 
                                  onClick={() => updateRow(type, row.id, 'status', row.status === 'collected' ? 'pending' : 'collected')}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer transition-all border text-[9px] ${
                                    row.status === 'collected' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' 
                                    : 'bg-slate-50 text-slate-400 border-slate-200'
                                  }`}
                                >
                                  <span>{row.status === 'collected' ? 'تم' : 'لا'}</span>
                                  <div className={`w-4 h-2 rounded-full relative transition-colors ${row.status === 'collected' ? 'bg-emerald-400' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-0.5 w-1 h-1 bg-white rounded-full transition-all ${row.status === 'collected' ? 'left-2.5' : 'left-0.5'}`} />
                                  </div>
                                </div>
                              </div>
                            </td>
                          <td className="px-2 py-2">
                            <button 
                              type="button"
                              onClick={() => removeRow(type, row.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-3 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center">
                  <button 
                    type="button"
                    onClick={() => addRow(type)}
                    className="flex items-center space-x-1 space-x-reverse text-rose-600 hover:text-rose-700 font-bold text-xs transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{t("form.addRow")}</span>
                  </button>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
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
              className="flex justify-center pt-4"
            >
              <button 
                type="submit"
                disabled={submitting}
                className={`group bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 space-x-reverse shadow-lg shadow-green-200 text-sm ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                <span>{t("deductions.saveAll")}</span>
              </button>
            </motion.div>
          )}
        </form>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => router.push('/expenses')}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-gradient-to-br from-rose-600 to-pink-700 text-white p-8 rounded-3xl shadow-2xl text-center min-w-[350px]"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-3">{t("form.success")}</h2>
              <p className="text-base opacity-90 mb-6">{t("deductions.successDesc", { count: savedCount })}</p>
              <button 
                onClick={() => router.push('/expenses')}
                className="bg-white text-rose-700 px-8 py-2.5 rounded-xl font-bold text-base hover:bg-rose-50 transition-colors flex items-center mx-auto space-x-2 space-x-reverse"
              >
                <span>{t("form.backToCenter")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
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
