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

interface Employee {
  id: number;
  name: string;
  iqama_number: string;
  phone: string;
  package_name: string;
}

interface Account {
  id: number;
  account_code: string;
  account_name: string;
}

interface CostCenter {
  id: number;
  center_code: string;
  center_name: string;
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
  iqama: 'منصرفات إقامة',
  fuel: 'منصرفات وقود',
  housing: 'إيجار سكن',
  maintenance: 'صيانة / شراء',
  general: 'مصاريف عامة',
  traffic: 'مخالفات مرورية',
  advances: 'السلفيات'
};

const defaultExpenseValues: Record<string, string> = {
  iqama: 'تجديد إقامة',
  fuel: 'منصرفات وقود',
  housing: 'إيجار سكن',
  maintenance: 'صيانة المركبات',
  general: 'منصرفات داخلية',
  traffic: 'مخالفات مرورية',
  advances: 'سلفيات'
};

const headersMap: Record<string, string[]> = {
  iqama: ['التاريخ', 'نوع المصروف', 'المبلغ', 'رقم الإقامة', 'الموظف', 'الحساب', 'مركز التكلفة', 'الوصف', 'المستند', 'حذف'],
  fuel: ['التاريخ', 'نوع المصروف', 'المبلغ', 'ضريبة؟', 'شامل؟', 'قيمة الضريبة', 'الصافي', 'الحساب', 'مركز التكلفة', 'الوصف', 'المستند', 'حذف'],
  traffic: ['التاريخ', 'نوع المصروف', 'المبلغ', 'السائق', 'رقم الإقامة', 'مركز التكلفة', 'الحساب', 'الوصف', 'المستند', 'حذف'],
  advances: ['التاريخ', 'نوع المصروف', 'المبلغ', 'الموظف', 'رقم الإقامة', 'الحساب', 'مركز التكلفة', 'الوصف', 'المستند*', 'حذف'],
  default: ['التاريخ', 'نوع المصروف', 'المبلغ', 'الحساب', 'مركز التكلفة', 'الوصف', 'المستند', 'حذف']
};

function EmployeeSelect({ row, type, metadata, updateRow }: { 
  row: ExpenseRow; 
  type: string; 
  metadata: any; 
  updateRow: any 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const filteredEmployees = (metadata?.employees || []).filter((emp: Employee) => 
    (emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (emp.iqama_number || "").includes(searchTerm)
  );

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 280;
      // Calculate center position
      const centerX = rect.left + (rect.width / 2);
      let leftPos = centerX - (dropdownWidth / 2);
      
      // Keep it within screen bounds
      if (leftPos < 10) leftPos = 10;
      if (leftPos + dropdownWidth > window.innerWidth - 10) {
        leftPos = window.innerWidth - dropdownWidth - 10;
      }

      setCoords({
        top: rect.bottom + 4,
        left: leftPos,
        width: dropdownWidth
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Use scroll event on window and capture to ensure it works with nested scrolls
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (row.manualEmployee) {
    return (
      <div className="flex items-center space-x-2 space-x-reverse">
        <input 
          type="text" 
          className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-sm"
          placeholder="اسم الموظف"
          value={row.employee_name}
          onChange={(e) => updateRow(type, row.id, 'employee_name', e.target.value)}
        />
        <button 
          type="button"
          onClick={() => updateRow(type, row.id, 'manualEmployee', false)}
          className="text-blue-500"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group" ref={containerRef}>
      <div className="flex items-center space-x-2 space-x-reverse">
        <div className="relative w-full" ref={triggerRef}>
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white/50 border border-slate-200 cursor-pointer text-sm font-medium py-1.5 px-3 flex items-center justify-between min-h-[36px] hover:bg-white hover:border-blue-300 rounded-lg transition-all shadow-sm"
          >
            <span className={row.employee_name ? "text-slate-900 font-bold" : "text-slate-400"}>
              {row.employee_name || "-- اختر الموظف --"}
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
          </div>

          {isOpen && (
            <div 
              style={{ 
                position: 'fixed',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
                zIndex: 9999
              }}
              className="bg-white border border-slate-200 rounded-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in duration-200"
            >
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="بحث بالاسم أو الإقامة..."
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
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-all flex flex-col group/item"
                    >
                      <div className="font-bold text-slate-900 text-sm group-hover/item:text-blue-700">{emp.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono">
                          {emp.iqama_number || "بدون إقامة"}
                        </span>
                        {emp.phone && (
                          <span className="text-[10px] text-slate-400">{emp.phone}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">لا يوجد نتائج لهذا البحث</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button 
          type="button"
          onClick={() => updateRow(type, row.id, 'manualEmployee', true)}
          className="text-slate-400 hover:text-blue-500 p-1 rounded-lg transition-colors"
          title="إدخال يدوي"
        >
          <Bolt className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ExpenseFormClient({ user }: { user: User }) {
  const router = useRouter();
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
          
          // Logic for taxable/inclusive sync
          if (field === 'tax_inclusive' && value === true) {
            updatedRow.taxable = true;
          }
          if (field === 'taxable' && value === false) {
            updatedRow.tax_inclusive = false;
          }

          // Auto calculations for fuel
          if (type === 'fuel') {
            const amtStr = String(updatedRow.amount || "0").trim();
            const amt = parseFloat(amtStr) || 0;
            
            if (updatedRow.taxable) {
              if (updatedRow.tax_inclusive) {
                // If tax inclusive: base = total / 1.15, tax = total - base
                const base = amt / 1.15;
                const tax = amt - base;
                updatedRow.tax_value = tax.toFixed(2);
                updatedRow.net_amount = amt.toFixed(2);
              } else {
                // If not inclusive: tax = base * 0.15, net = base + tax
                const tax = amt * 0.15;
                updatedRow.tax_value = tax.toFixed(2);
                updatedRow.net_amount = (amt + tax).toFixed(2);
              }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(sections).length === 0) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append("company_id", user.company_id.toString());
    formData.append("user_id", user.id.toString());
    formData.append("month", new Date().toISOString().substring(0, 7));

    Object.entries(sections).forEach(([mainType, rows]) => {
      rows.forEach(row => {
        formData.append("main_type[]", mainType);
        formData.append("expense_date[]", row.expense_date);
        formData.append("expense_type[]", row.expense_type);
        formData.append("amount[]", row.amount);
        formData.append("employee_iqama[]", row.employee_iqama);
        formData.append("employee_name[]", row.employee_name);
        formData.append("employee_id[]", row.employee_id);
        formData.append("account_code[]", row.account_code);
        formData.append("cost_center_code[]", row.cost_center_code);
        formData.append("description[]", row.description);
        formData.append("tax_value[]", row.tax_value);
        formData.append("net_amount[]", row.net_amount);
        if (row.attachment) {
          formData.append("attachment[]", row.attachment);
        } else {
          formData.append("attachment[]", "");
        }
      });
    });

    try {
      const res = await fetch("/api/expenses/save", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSavedCount(data.savedCount);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-8 rtl" dir="rtl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white shadow-xl border border-white/10"
      >
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
            <Plus className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">إضافة مصروفات متعددة</h1>
          <p className="text-slate-300 max-w-2xl">
            أضف وتعديل مصروفات الشركة بشكل منظم وسهل مع الحساب التلقائي والربط بالموظفين
          </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-red-500"></div>
      </motion.div>

      {/* Subtype Management Banner */}
      <motion.div 
        className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">إدارة أنواع المصروفات المخصصة</h3>
            <p className="text-xs text-slate-500">يمكنك إضافة وتعديل أنواع المصروفات المخصصة لك فقط التي تظهر في القوائم المنسدلة.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSubtypeManager(true)}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 space-x-reverse border border-indigo-100 text-sm"
        >
          <Settings className="w-4 h-4" />
          <span>إدارة الأنواع المخصصة</span>
        </button>
      </motion.div>

      {/* Info Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-md flex items-center space-x-3 space-x-reverse">
          <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">الشهر الحالي</p>
            <p className="text-base font-bold text-slate-900">{new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-md flex items-center space-x-3 space-x-reverse">
          <div className="p-2.5 bg-green-50 rounded-lg text-green-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">رقم القيد التالي</p>
            <p className="text-base font-bold text-slate-900">{metadata?.voucherNumber}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-md flex items-center space-x-3 space-x-reverse">
          <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
            <Bolt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">حالة القيد</p>
            <p className="text-base font-bold text-slate-900">جديد</p>
          </div>
        </div>
      </motion.div>

      {/* Expense Type Selector */}
      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex items-center space-x-2 space-x-reverse mb-4">
          <Tags className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">اختر نوع المصروف لإضافته</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <select 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
            value={selectedTypeToAdd}
            onChange={(e) => setSelectedTypeToAdd(e.target.value)}
          >
            <option value="">-- اختر نوع المصروف --</option>
            {Object.entries(mainTypes).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button 
            onClick={() => addSection(selectedTypeToAdd)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-blue-200 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة النوع</span>
          </button>
        </div>
      </motion.div>

      {/* Sections */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <AnimatePresence>
          {Object.entries(sections).map(([type, rows]) => (
              <motion.div 
                key={type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
              >
                <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{mainTypes[type as keyof typeof mainTypes]}</h3>
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
                <table className="w-full text-right border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-sm">
                      {headersMap[type] ? headersMap[type].map((h, i) => (
                        <th key={i} className="px-4 py-3 font-semibold">{h}</th>
                      )) : headersMap.default.map((h, i) => (
                        <th key={i} className="px-4 py-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-2 py-4">
                          <input 
                            type="date" 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm"
                            value={row.expense_date}
                            onChange={(e) => updateRow(type, row.id, 'expense_date', e.target.value)}
                            required
                          />
                        </td>
                        <td className="px-2 py-4">
                            <select 
                              className="w-full bg-transparent border-none focus:ring-0 text-sm font-semibold"
                              value={row.expense_type}
                              onChange={(e) => updateRow(type, row.id, 'expense_type', e.target.value)}
                            >
                              <option value="">اختر النوع</option>
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
                            className="w-24 bg-transparent border-none focus:ring-0 text-sm font-bold text-blue-600"
                            placeholder="0.00"
                            value={row.amount}
                            onChange={(e) => updateRow(type, row.id, 'amount', e.target.value)}
                            required
                          />
                        </td>
                        
                          {type === 'fuel' && (
                            <>
                              <td className="px-2 py-4 text-center">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded text-blue-600"
                                  checked={row.taxable}
                                  onChange={(e) => updateRow(type, row.id, 'taxable', e.target.checked)}
                                />
                              </td>
                              <td className="px-2 py-4 text-center">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 rounded text-green-600"
                                  checked={row.tax_inclusive}
                                  onChange={(e) => updateRow(type, row.id, 'tax_inclusive', e.target.checked)}
                                />
                              </td>
                              <td className="px-2 py-4">
                                <input 
                                  type="number" 
                                  className="w-20 bg-transparent border-none focus:ring-0 text-sm"
                                  placeholder="0.00"
                                  value={row.tax_value}
                                  readOnly
                                />
                              </td>
                              <td className="px-2 py-4">
                                <span className="text-sm font-bold text-slate-700">{row.net_amount}</span>
                              </td>
                            </>
                          )}

                        {(type === 'iqama') && (
                          <>
                            <td className="px-2 py-4">
                              <input 
                                type="text" 
                                className="w-28 bg-transparent border-none focus:ring-0 text-sm text-slate-500"
                                value={row.employee_iqama}
                                readOnly={!row.manualEmployee}
                                onChange={(e) => updateRow(type, row.id, 'employee_iqama', e.target.value)}
                                placeholder="رقم الإقامة"
                              />
                            </td>
                            <td className="px-2 py-4">
                              <EmployeeSelect 
                                row={row} 
                                type={type} 
                                metadata={metadata} 
                                updateRow={updateRow} 
                              />
                            </td>
                          </>
                        )}

                        {(type === 'traffic' || type === 'advances') && (
                          <>
                            <td className="px-2 py-4">
                              <EmployeeSelect 
                                row={row} 
                                type={type} 
                                metadata={metadata} 
                                updateRow={updateRow} 
                              />
                            </td>
                            <td className="px-2 py-4">
                              <input 
                                type="text" 
                                className="w-28 bg-transparent border-none focus:ring-0 text-sm text-slate-500"
                                value={row.employee_iqama}
                                readOnly={!row.manualEmployee}
                                onChange={(e) => updateRow(type, row.id, 'employee_iqama', e.target.value)}
                                placeholder="رقم الإقامة"
                              />
                            </td>
                          </>
                        )}

                        <td className="px-2 py-4">
                          <select 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm"
                            value={row.account_code}
                            onChange={(e) => updateRow(type, row.id, 'account_code', e.target.value)}
                          >
                            <option value="">-- الحساب --</option>
                            {(metadata?.accounts || []).map(acc => (
                              <option key={acc.id} value={acc.account_code}>{acc.account_code} - {acc.account_name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-4">
                          <select 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm"
                            value={row.cost_center_code}
                            onChange={(e) => updateRow(type, row.id, 'cost_center_code', e.target.value)}
                          >
                            <option value="">-- المركز --</option>
                            {(metadata?.costCenters || []).map(cc => (
                              <option key={cc.id} value={cc.center_code}>{cc.center_code} - {cc.center_name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm"
                            placeholder="وصف..."
                            value={row.description}
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
                  <span>إضافة سطر جديد للقسم</span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

          {Object.keys(sections).length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center pt-8 pb-16"
            >
              <button 
                type="submit"
                disabled={submitting}
                className={`bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center space-x-3 space-x-reverse shadow-xl shadow-green-100 transform active:scale-95 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span className="text-lg">حفظ كافة المصروفات</span>
              </button>
            </motion.div>
          )}
      </form>

      {/* Success Notification */}
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
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-8 rounded-3xl shadow-2xl text-center min-w-[350px]"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-3">تم الحفظ بنجاح!</h2>
                <p className="text-base opacity-90 mb-6">تم تسجيل {savedCount} مصروفاً بنجاح في النظام المالي.</p>
                <button 
                  onClick={() => router.push('/expenses')}
                  className="bg-white text-indigo-700 px-8 py-2.5 rounded-xl font-bold text-base hover:bg-indigo-50 transition-colors flex items-center mx-auto space-x-2 space-x-reverse"
                >
                  <span>العودة لمركز المنصرفات</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
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
        .rtl { direction: rtl; }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.5);
        }
      `}</style>
    </div>
  );
}
