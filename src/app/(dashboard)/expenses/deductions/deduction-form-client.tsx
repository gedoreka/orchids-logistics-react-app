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
      <div className="flex items-center space-x-2 space-x-reverse">
        <input 
          type="text" 
          className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-sm"
          placeholder={t("form.employeeName")}
          value={row.employee_name}
          onChange={(e) => updateRow(type, row.id, 'employee_name', e.target.value)}
        />
        <button 
          type="button"
          onClick={() => updateRow(type, row.id, 'manualEmployee', false)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-700 hover:to-pink-700 transition-all text-xs font-black shrink-0 shadow-lg shadow-rose-200"
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
              className="w-full bg-white/50 border border-slate-200 cursor-pointer text-sm font-medium py-1.5 px-3 flex items-center justify-between min-h-[36px] hover:bg-white hover:border-rose-300 rounded-lg transition-all shadow-sm"
            >
              <span className={row.employee_name ? "text-slate-900 font-bold" : "text-slate-400"}>
                {row.employee_name || t("form.selectEmployee")}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-rose-500' : ''}`} />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[96%] w-[96%] mx-auto px-4 py-8 space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-900 to-rose-800 p-8 text-white shadow-xl border border-white/10"
      >
        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
            <HandCoins className="w-8 h-8 text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t("deductions.title")}</h1>
          <p className="text-rose-300 max-w-2xl">{t("deductions.subtitle")}</p>
        </div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500"></div>
      </motion.div>

      <motion.div 
        className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{t("form.manageCustomTypes")}</h3>
            <p className="text-xs text-slate-500">{t("form.manageCustomTypesDesc")}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowSubtypeManager(true)}
          className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-2 space-x-reverse border border-rose-100 text-sm"
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
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-md flex items-center space-x-3 space-x-reverse">
          <div className="p-2.5 bg-rose-50 rounded-lg text-rose-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t("form.currentMonth")}</p>
            <input 
              type="month" 
              className="bg-transparent border-none p-0 focus:ring-0 font-bold text-slate-900 text-base w-full"
              value={monthReference}
              onChange={(e) => setMonthReference(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-md flex items-center space-x-3 space-x-reverse">
          <div className="p-2.5 bg-green-50 rounded-lg text-green-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t("form.nextVoucher")}</p>
            <p className="text-base font-bold text-slate-900">{metadata?.voucherNumber}</p>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-md flex items-center space-x-3 space-x-reverse">
          <div className="p-2.5 bg-purple-50 rounded-lg text-purple-600">
            <Bolt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">{t("form.voucherStatus")}</p>
            <p className="text-base font-bold text-slate-900">{t("form.new")}</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="flex items-center space-x-2 space-x-reverse mb-4">
          <Tags className="w-5 h-5 text-rose-600" />
          <h2 className="text-lg font-bold text-slate-900">{t("form.chooseType")}</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <select 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all text-sm"
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
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 space-x-reverse shadow-lg shadow-rose-200 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t("form.addTypeBtn")}</span>
          </button>
        </div>
      </motion.div>

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
                  <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{t(`types.${type}`)}</h3>
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
                      <tr className="bg-rose-600 border-b border-rose-700 text-white text-[10px] uppercase tracking-wider">
                        {headersMap[type].map((h, i) => (
                          <th key={i} className="px-4 py-4 font-black text-start whitespace-nowrap">{t(`form.${h}`)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="bg-white border-b border-slate-100 hover:bg-rose-50/30 transition-colors group">
                          <td className="px-2 py-4">

                          <input 
                            type="date" 
                            className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold"
                            value={row.expense_date}
                            onChange={(e) => updateRow(type, row.id, 'expense_date', e.target.value)}
                            required
                          />
                        </td>
                        <td className="px-2 py-4">
                          <select 
                            className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold"
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
                        <td className="px-2 py-4">
                          <input 
                            type="number" 
                            className="w-20 bg-transparent border-none focus:ring-0 text-xs font-black text-rose-700"
                            placeholder="0.00"
                            value={row.amount}
                            onChange={(e) => updateRow(type, row.id, 'amount', e.target.value)}
                            required
                          />
                        </td>
                        <td className="px-2 py-4 min-w-[200px]">
                          <EmployeeSelect row={row} type={type} metadata={metadata} updateRow={updateRow} t={t} />
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="text" 
                            className="w-24 bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-600"
                            value={row.employee_iqama}
                            readOnly={!row.manualEmployee}
                            onChange={(e) => updateRow(type, row.id, 'employee_iqama', e.target.value)}
                            placeholder={t("form.iqamaNumber")}
                          />
                        </td>
                        <td className="px-2 py-4">
                          <div className="w-32">
                            <select 
                              className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold truncate"
                              value={row.account_id}
                              onChange={(e) => updateRow(type, row.id, 'account_id', e.target.value)}
                            >
                              <option value="">-- {t("form.account")} --</option>
                              {(metadata?.accounts || []).map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.account_code} - {acc.account_name}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          <div className="w-32">
                            <select 
                              className="w-full bg-transparent border-none focus:ring-0 text-xs font-bold truncate"
                              value={row.cost_center_id}
                              onChange={(e) => updateRow(type, row.id, 'cost_center_id', e.target.value)}
                            >
                              <option value="">-- {t("form.costCenter")} --</option>
                              {(metadata?.costCenters || []).map(cc => (
                                <option key={cc.id} value={cc.id}>{cc.center_code} - {cc.center_name}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          <input 
                            type="text" 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm"
                            placeholder={t("form.description")}
                            value={row.description}
                            onChange={(e) => updateRow(type, row.id, 'description', e.target.value)}
                          />
                        </td>
                        <td className="px-2 py-4 text-center">
                          <div 
                            onClick={() => updateRow(type, row.id, 'status', row.status === 'collected' ? 'pending' : 'collected')}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-all border text-xs ${
                              row.status === 'collected' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold' 
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                          >
                            <span>{row.status === 'collected' ? 'تم الخصم' : 'لم يخصم'}</span>
                            <div className={`w-6 h-3 rounded-full relative transition-colors ${row.status === 'collected' ? 'bg-emerald-400' : 'bg-slate-300'}`}>
                              <div className={`absolute top-0.5 w-2 h-2 bg-white rounded-full transition-all ${row.status === 'collected' ? 'left-3.5' : 'left-0.5'}`} />
                            </div>
                          </div>
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
                  className="flex items-center space-x-2 space-x-reverse text-rose-600 hover:text-rose-700 font-semibold text-sm transition-colors"
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
              <span className="text-lg">{t("deductions.saveAll")}</span>
            </button>
          </motion.div>
        )}
      </form>

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
