"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, Trash2, Save, Tags, Cog, Info, CheckCircle, 
  ChevronDown, X, Calculator, Search, 
  ArrowRight, FileText, History, Bolt, Building2, User as UserIcon,
  Settings, HandCoins, Calendar, DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import DeductionSubtypeManager from "./deduction-subtype-manager";

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
}

interface CostCenter {
  id: number;
  center_code: string;
  center_name: string;
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
}

const mainTypes = {
  advances: 'السلفيات',
  deductions: 'الخصومات الشهرية',
  other: 'استقطاعات أخرى'
};

const defaultDeductionValues: Record<string, string> = {
  advances: 'سلفية',
  deductions: 'خصم تأخير',
  other: 'استقطاع متنوع'
};

function EmployeeSelect({ row, type, metadata, updateRow }: { 
  row: DeductionRow; 
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
      const centerX = rect.left + (rect.width / 2);
      let leftPos = centerX - (dropdownWidth / 2);
      
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
              className="bg-white border border-slate-200 rounded-2xl shadow-[0_20px_70px_-10px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in duration-200 rtl"
              dir="rtl"
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
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-slate-50 last:border-0 transition-all flex flex-col group/item text-right"
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

export default function DeductionFormClient({ user }: { user: User }) {
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

  const [sections, setSections] = useState<Record<string, DeductionRow[]>>({});
  const [selectedTypeToAdd, setSelectedTypeToAdd] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [showSubtypeManager, setShowSubtypeManager] = useState(false);
  const [monthReference, setMonthReference] = useState(new Date().toISOString().substring(0, 7));

  const fetchMetadata = async () => {
    try {
      const res = await fetch(`/api/expenses/deductions/metadata?company_id=${user.company_id}&user_id=${user.id}`);
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
      manualEmployee: false
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

  const updateRow = (type: string, id: string, field: keyof DeductionRow, value: any) => {
    setSections(prev => {
      const updatedRows = prev[type].map(row => {
        if (row.id === id) {
          let updatedRow = { ...row, [field]: value };
          
          // Auto description
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

    setSubmitting(true);
    const allDeductions = Object.values(sections).flat();

    try {
      const res = await fetch("/api/expenses/deductions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: user.company_id,
          user_id: user.id,
          month_reference: monthReference,
          voucher_number: metadata?.voucherNumber,
          deductions: allDeductions
        }),
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

  const calculateSectionTotal = (rows: DeductionRow[]) => {
    return rows.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8 space-y-8 rtl" dir="rtl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-rose-700 to-rose-900 p-8 text-white shadow-2xl border border-white/10"
      >
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md shadow-lg border border-white/10">
            <HandCoins className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">إضافة الاستقطاعات الشهرية</h1>
          <p className="text-rose-100 max-w-2xl font-medium opacity-90">
            إدارة السلفيات والخصومات الشهرية للموظفين بدقة واحترافية عالية
          </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-rose-600"></div>
      </motion.div>

      {/* Subtype Management Banner */}
      <motion.div 
        className="bg-white p-6 rounded-[2rem] shadow-xl border border-rose-50 flex flex-col md:flex-row items-center justify-between gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center space-x-5 space-x-reverse">
          <div className="p-4 bg-rose-50 rounded-2xl text-rose-600 shadow-sm border border-rose-100">
            <Tags className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">إدارة أنواع الاستقطاعات المخصصة</h3>
            <p className="text-sm text-slate-500 font-medium">يمكنك إضافة وتعديل أنواع الاستقطاعات المخصصة لك فقط التي تظهر في القوائم المنسدلة.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSubtypeManager(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-2xl font-black transition-all flex items-center space-x-3 space-x-reverse shadow-lg shadow-rose-100 group border-b-4 border-rose-800"
        >
          <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          <span>إدارة الأنواع المخصصة</span>
        </button>
      </motion.div>

      {/* Info Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg flex items-center space-x-4 space-x-reverse group hover:border-rose-200 transition-colors">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">الشهر</p>
            <input 
              type="month" 
              className="w-full bg-transparent border-none p-0 focus:ring-0 font-black text-slate-800 text-lg"
              value={monthReference}
              onChange={(e) => setMonthReference(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg flex items-center space-x-4 space-x-reverse group hover:border-rose-200 transition-colors">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">رقم القيد</p>
            <p className="text-lg font-black text-slate-800">{metadata?.voucherNumber}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg flex items-center space-x-4 space-x-reverse group hover:border-rose-200 transition-colors">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
            <Bolt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">حالة القيد</p>
            <p className="text-lg font-black text-slate-800">جديد</p>
          </div>
        </div>
      </motion.div>

      {/* Deduction Type Selector */}
      <motion.div 
        className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden"
        whileHover={{ y: -5 }}
      >
        <div className="absolute top-0 right-0 w-2 h-full bg-rose-600" />
        <div className="flex items-center space-x-3 space-x-reverse mb-6">
          <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
            <Tags className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">إضافة قسم استقطاع جديد</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <select 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-bold text-slate-700"
            value={selectedTypeToAdd}
            onChange={(e) => setSelectedTypeToAdd(e.target.value)}
          >
            <option value="">-- اختر نوع الاستقطاع --</option>
            {Object.entries(mainTypes).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <button 
            onClick={() => addSection(selectedTypeToAdd)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-2xl font-black transition-all flex items-center justify-center space-x-3 space-x-reverse shadow-lg shadow-rose-100 border-b-4 border-rose-800 active:translate-y-1 active:border-b-0"
          >
            <Plus className="w-6 h-6" />
            <span>إضافة القسم</span>
          </button>
        </div>
      </motion.div>

      {/* Sections */}
      <form onSubmit={handleSubmit} className="space-y-10">
        <AnimatePresence>
          {Object.entries(sections).map(([type, rows]) => (
              <motion.div 
                key={type}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden group"
              >
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="p-3 bg-rose-100 rounded-2xl text-rose-600 shadow-inner">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{mainTypes[type as keyof typeof mainTypes]}</h3>
                      <p className="text-xs font-bold text-slate-400">إجمالي القسم: <span className="text-rose-600">{calculateSectionTotal(rows)} ريال</span></p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeSection(type)}
                    className="bg-white text-slate-300 hover:text-rose-500 p-2.5 rounded-2xl border border-slate-100 hover:border-rose-100 hover:bg-rose-50 transition-all duration-300 shadow-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

              <div className="overflow-x-auto p-6 custom-scrollbar">
                <table className="w-full text-right border-separate border-spacing-y-2 min-w-[1200px]">
                  <thead>
                    <tr className="text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">التاريخ</th>
                      <th className="px-4 py-3">نوع الاستقطاع</th>
                      <th className="px-4 py-3">المبلغ</th>
                      <th className="px-4 py-3">الموظف</th>
                      <th className="px-4 py-3">رقم الإقامة</th>
                      <th className="px-4 py-3">الحساب</th>
                      <th className="px-4 py-3">مركز التكلفة</th>
                      <th className="px-4 py-3">الوصف</th>
                      <th className="px-4 py-3">التحصيل</th>
                      <th className="px-4 py-3">حذف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.id} className="bg-slate-50/50 hover:bg-white transition-all duration-300 group/row border border-transparent hover:border-rose-100 hover:shadow-md rounded-2xl overflow-hidden">
                        <td className="px-2 py-4 text-center font-black text-slate-300 group-hover/row:text-rose-600">
                          {idx + 1}
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="date" 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700"
                            value={row.expense_date}
                            onChange={(e) => updateRow(type, row.id, 'expense_date', e.target.value)}
                            required
                          />
                        </td>
                        <td className="px-2 py-4">
                            <select 
                              className="w-full bg-transparent border-none focus:ring-0 text-sm font-black text-slate-800"
                              value={row.deduction_type}
                              onChange={(e) => updateRow(type, row.id, 'deduction_type', e.target.value)}
                            >
                              <option value="">اختر النوع</option>
                              {(metadata?.subtypes || [])
                                .filter(s => s.main_type === type)
                                .map(s => (
                                  <option key={s.subtype_name} value={s.subtype_name} className={s.is_custom ? "text-indigo-600" : "text-emerald-600 font-bold"}>
                                    {s.subtype_name} {s.is_custom ? "✏️" : "🌟"}
                                  </option>
                                ))}
                              <option value="other">أخرى</option>
                            </select>
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            className="w-24 bg-transparent border-none focus:ring-0 text-lg font-black text-rose-600 text-center"
                            placeholder="0.00"
                            value={row.amount}
                            onChange={(e) => updateRow(type, row.id, 'amount', e.target.value)}
                            required
                          />
                        </td>
                        
                        <td className="px-2 py-4 min-w-[200px]">
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
                            className="w-32 bg-transparent border-none focus:ring-0 text-sm font-mono font-bold text-slate-500 text-center"
                            value={row.employee_iqama}
                            readOnly={!row.manualEmployee}
                            onChange={(e) => updateRow(type, row.id, 'employee_iqama', e.target.value)}
                            placeholder="رقم الإقامة"
                          />
                        </td>

                        <td className="px-2 py-4">
                          <select 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600"
                            value={row.account_id}
                            onChange={(e) => updateRow(type, row.id, 'account_id', e.target.value)}
                          >
                            <option value="">-- الحساب --</option>
                            {(metadata?.accounts || []).map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.account_code} - {acc.account_name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-4">
                          <select 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-600"
                            value={row.cost_center_id}
                            onChange={(e) => updateRow(type, row.id, 'cost_center_id', e.target.value)}
                          >
                            <option value="">-- المركز --</option>
                            {(metadata?.costCenters || []).map(cc => (
                              <option key={cc.id} value={cc.id}>{cc.center_code} - {cc.center_name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700"
                            placeholder="وصف الاستقطاع..."
                            value={row.description}
                            onChange={(e) => updateRow(type, row.id, 'description', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-4 text-center">
                          <div 
                            onClick={() => updateRow(type, row.id, 'status', row.status === 'collected' ? 'pending' : 'collected')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all border ${
                              row.status === 'collected' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-black' 
                              : 'bg-slate-100 text-slate-400 border-slate-200 font-bold'
                            }`}
                          >
                            <span className="text-[10px] whitespace-nowrap">{row.status === 'collected' ? 'تم الخصم' : 'لم يخصم'}</span>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${row.status === 'collected' ? 'bg-emerald-400' : 'bg-slate-300'}`}>
                              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${row.status === 'collected' ? 'left-4.5' : 'left-0.5'}`} />
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-center">
                          <button 
                            type="button"
                            onClick={() => removeRow(type, row.id)}
                            className="text-slate-200 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-xl"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <button 
                  type="button"
                  onClick={() => addRow(type)}
                  className="flex items-center space-x-3 space-x-reverse bg-white border border-slate-200 px-6 py-3 rounded-2xl text-rose-600 hover:text-rose-700 font-black text-sm transition-all shadow-sm hover:shadow-md hover:border-rose-200 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  <span>إضافة سطر جديد للقسم</span>
                </button>
                <div className="flex items-center space-x-4 space-x-reverse bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm font-bold text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>عدد العمليات:</span>
                    <span className="text-slate-900">{rows.length}</span>
                  </div>
                  <div className="w-px h-4 bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <span>إجمالي القسم:</span>
                    <span className="text-rose-600 font-black">{calculateSectionTotal(rows)} ريال</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

          {Object.keys(sections).length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center pt-8 pb-16"
            >
              <button 
                type="submit"
                disabled={submitting}
                className={`group relative bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-5 rounded-[2rem] font-black transition-all flex items-center space-x-4 space-x-reverse shadow-2xl shadow-emerald-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden`}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
                {submitting ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-b-transparent"></div>
                ) : (
                  <Save className="w-7 h-7 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xl">حفظ كافة الاستقطاعات</span>
              </button>
            </motion.div>
          )}
      </form>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-[1000]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
              onClick={() => router.push('/expenses')}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 100 }}
              className="relative z-[1001] bg-white text-slate-900 p-12 rounded-[3.5rem] shadow-2xl text-center max-w-md w-full border border-white"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner relative">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-20" />
                <CheckCircle className="w-14 h-14 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tight">تم الحفظ بنجاح!</h2>
              <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                تم تسجيل <span className="text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-lg">{savedCount}</span> استقطاعاً بنجاح في النظام المالي.
              </p>
              <button 
                onClick={() => router.push('/expenses')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-5 rounded-3xl font-black text-lg transition-all flex items-center justify-center space-x-3 space-x-reverse shadow-xl shadow-slate-200 group"
              >
                <span>العودة لمركز المنصرفات</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-[-5px] transition-transform" />
              </button>
            </motion.div>
          </div>
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
        .rtl { direction: rtl; }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(0.5);
        }
        .left-4.5 { left: 1.125rem; }
      `}</style>
    </div>
  );
}
