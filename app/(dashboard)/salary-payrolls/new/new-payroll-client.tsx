"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText,
  Calendar,
  Users,
  Search,
  Save,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  DollarSign,
  Target,
  Gift,
  Layers,
  Calculator,
  FileCheck,
  AlertTriangle,
  Clock,
  X,
  CheckSquare,
  Square,
  Trash2,
  RefreshCw,
  CreditCard,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Building2,
  Folder,
  FolderOpen,
  Hash,
  CircleDot,
  Sparkles,
  CheckCircle2,
  Package as PackageIcon,
  Crown,
  Briefcase,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/locale-context";

interface Package {
  id: number;
  group_name: string;
  work_type: string;
  monthly_target: number;
  bonus_after_target: number;
}

interface Employee {
  id: number;
  name: string;
  iqama_number: string;
  user_code: string;
  basic_salary: number;
  housing_allowance: number;
  nationality: string;
  job_title: string;
}

interface Tier {
  id: number;
  min_orders: number;
  base_salary: number;
  increment_per_order: number;
  bonus: number;
}

interface Slab {
  id: number;
  from_orders: number;
  to_orders: number | null;
  value_per_order: number;
}

interface Debt {
  id: number;
  employee_name: string;
  iqama_number: string;
  month_reference: string;
  amount: number;
}

interface EmployeeRow {
  employee_name: string;
  iqama_number: string;
  user_code: string;
  basic_salary: number;
  housing_allowance: number;
  nationality: string;
  job_title: string;
  target: number;
  bonus_per_order: number;
  successful_orders: number;
  target_deduction: number;
  monthly_bonus: number;
  operator_deduction: number;
  internal_deduction: number;
  wallet_deduction: number;
  internal_bonus: number;
  net_salary: number;
  payment_method: string;
  achieved_tier: string;
  tier_bonus: number;
  extra_amount: number;
  selected: boolean;
  has_debt: boolean;
  debt_amount: number;
}

interface Account {
  id: number;
  account_code: string;
  account_name: string;
  type: string;
  parent_id: number | null;
  account_type: 'main' | 'sub';
  account_level: number;
  parent_account: string | null;
  children?: Account[];
}

interface CostCenterItem {
  id: number;
  center_code: string;
  center_name: string;
  parent_id: number | null;
  center_type: 'main' | 'sub';
  center_level: number;
  parent_center: string | null;
  children?: CostCenterItem[];
}

interface NewPayrollClientProps {
  packages: Package[];
  debts: Debt[];
  companyId: number;
  userName: string;
}

interface NotificationState {
  show: boolean;
  type: "success" | "error" | "loading" | "confirm" | "warning";
  title: string;
  message: string;
  details?: {
    month?: string;
    employeeCount?: number;
    totalAmount?: number;
    totalDeductions?: number;
    packageName?: string;
    accountName?: string;
    costCenterName?: string;
    workType?: string;
    isDraft?: boolean;
  };
  missingFields?: string[];
  onConfirm?: () => void;
}

// Build tree from flat list
function buildTree<T extends { id: number; parent_id: number | null; children?: T[] }>(items: T[]): T[] {
  const map = new Map<number, T>();
  const roots: T[] = [];
  items.forEach(item => map.set(item.id, { ...item, children: [] }));
  items.forEach(item => {
    const node = map.get(item.id)!;
    if (item.parent_id && map.has(item.parent_id)) {
      map.get(item.parent_id)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

// Hierarchical Tree Dropdown Component
function TreeDropdown<T extends { id: number; children?: T[] }>({
  label,
  icon,
  items,
  selectedId,
  onSelect,
  getCode,
  getName,
  getType,
  placeholder,
  required,
  error,
  gradient,
}: {
  label: string;
  icon: React.ReactNode;
  items: T[];
  selectedId: number | null;
  onSelect: (id: number | null, name: string) => void;
  getCode: (item: T) => string;
  getName: (item: T) => string;
  getType: (item: T) => string;
  placeholder: string;
  required?: boolean;
  error?: boolean;
  gradient: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Find selected item name
  const findItem = (items: T[], id: number): T | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedItem = selectedId ? findItem(items, selectedId) : null;

  // Filter items by search
  const matchesSearch = (item: T): boolean => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    if (getName(item).toLowerCase().includes(q) || getCode(item).toLowerCase().includes(q)) return true;
    if (item.children) return item.children.some(child => matchesSearch(child));
    return false;
  };

  // Auto-expand parents when searching
  useEffect(() => {
    if (search.trim()) {
      const collectExpandIds = (items: T[]): number[] => {
        let ids: number[] = [];
        items.forEach(item => {
          if (item.children && item.children.some(child => matchesSearch(child))) {
            ids.push(item.id);
            ids = ids.concat(collectExpandIds(item.children));
          }
        });
        return ids;
      };
      setExpandedIds(new Set(collectExpandIds(items)));
    }
  }, [search]);

  const renderNode = (item: T, depth: number = 0) => {
    if (!matchesSearch(item)) return null;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedIds.has(item.id);
    const isSelected = selectedId === item.id;
    const isHovered = hoveredId === item.id;
    const isMain = getType(item) === 'main';

    return (
      <div key={item.id}>
        <motion.div
          initial={false}
          animate={{ 
            backgroundColor: isSelected ? 'rgb(239, 246, 255)' : isHovered ? 'rgb(249, 250, 251)' : 'transparent',
            x: isHovered && !isSelected ? 4 : 0
          }}
          transition={{ duration: 0.15 }}
          className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer rounded-xl mx-1 my-0.5 transition-all ${
            isSelected ? 'ring-2 ring-blue-200 bg-blue-50' : ''
          }`}
          style={{ paddingRight: `${depth * 20 + 12}px` }}
          onClick={() => {
            onSelect(item.id, `${getCode(item)} - ${getName(item)}`);
            setOpen(false);
            setSearch("");
          }}
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {hasChildren ? (
            <motion.button
              onClick={(e) => toggleExpand(item.id, e)}
              className="p-0.5 rounded-md hover:bg-gray-200 transition-colors flex-shrink-0"
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} className="text-gray-400" />
            </motion.button>
          ) : (
            <span className="w-5 flex-shrink-0" />
          )}

          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isMain 
              ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600' 
              : 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600'
          }`}>
            {isMain ? (hasChildren && isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />) : <CircleDot size={12} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isMain ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {getCode(item)}
              </span>
              <span className={`text-sm truncate ${isMain ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                {getName(item)}
              </span>
            </div>
          </div>

          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex-shrink-0"
            >
              <CheckCircle size={16} className="text-blue-500" />
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence initial={false}>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="relative" style={{ marginRight: `${depth * 20 + 28}px` }}>
                <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-200" />
                {item.children!.map(child => renderNode(child, depth + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm bg-white text-right transition-all ${
          error ? 'border-red-400 ring-2 ring-red-100' :
          open ? 'border-blue-500 ring-2 ring-blue-100' :
          selectedItem ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedItem ? (
            <>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                {getCode(selectedItem)}
              </span>
              <span className="text-gray-900 font-medium truncate">{getName(selectedItem)}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-gray-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            style={{ maxHeight: '380px' }}
          >
            {/* Header */}
            <div className={`p-3 ${gradient} text-white`}>
              <div className="relative">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث بالاسم أو الرمز..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 text-sm focus:bg-white/25 focus:border-white/40 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Tree */}
            <div className="overflow-auto" style={{ maxHeight: '300px' }} dir="rtl">
              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <Folder size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-sm">لا توجد بيانات</p>
                </div>
              ) : (
                <div className="py-1">
                  {items.map(item => renderNode(item))}
                </div>
              )}
            </div>

            {/* Footer - clear selection */}
            {selectedId && (
              <div className="border-t border-gray-100 p-2">
                <button
                  onClick={() => {
                    onSelect(null, "");
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 text-sm font-bold transition-colors"
                >
                  <X size={14} />
                  إلغاء الاختيار
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Premium Package Dropdown Component
const MONTHS_AR = [
  { value: '01', label: 'يناير', short: 'ينا' },
  { value: '02', label: 'فبراير', short: 'فبر' },
  { value: '03', label: 'مارس', short: 'مار' },
  { value: '04', label: 'أبريل', short: 'أبر' },
  { value: '05', label: 'مايو', short: 'ماي' },
  { value: '06', label: 'يونيو', short: 'يون' },
  { value: '07', label: 'يوليو', short: 'يول' },
  { value: '08', label: 'أغسطس', short: 'أغس' },
  { value: '09', label: 'سبتمبر', short: 'سبت' },
  { value: '10', label: 'أكتوبر', short: 'أكت' },
  { value: '11', label: 'نوفمبر', short: 'نوف' },
  { value: '12', label: 'ديسمبر', short: 'ديس' },
];

const MONTH_SEASONS: Record<string, { gradient: string; icon: string }> = {
  '01': { gradient: 'from-sky-400 to-blue-500', icon: '❄️' },
  '02': { gradient: 'from-sky-400 to-blue-500', icon: '❄️' },
  '03': { gradient: 'from-emerald-400 to-green-500', icon: '🌿' },
  '04': { gradient: 'from-emerald-400 to-green-500', icon: '🌸' },
  '05': { gradient: 'from-emerald-400 to-green-500', icon: '🌷' },
  '06': { gradient: 'from-amber-400 to-orange-500', icon: '☀️' },
  '07': { gradient: 'from-amber-400 to-orange-500', icon: '🌞' },
  '08': { gradient: 'from-amber-400 to-orange-500', icon: '🔥' },
  '09': { gradient: 'from-orange-400 to-red-500', icon: '🍂' },
  '10': { gradient: 'from-orange-400 to-red-500', icon: '🍁' },
  '11': { gradient: 'from-violet-400 to-purple-500', icon: '🌧️' },
  '12': { gradient: 'from-violet-400 to-purple-500', icon: '🎄' },
};

function MonthPickerDropdown({
  value,
  onChange,
}: {
  value: string; // "2026-02"
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState(() => {
    const y = parseInt(value?.split('-')[0] || '');
    return isNaN(y) ? currentYear : y;
  });

  const selectedMonth = value?.split('-')[1] || '';
  const selectedYear = parseInt(value?.split('-')[0] || '0');

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open]);

  const filteredMonths = MONTHS_AR.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.label.includes(q) || m.short.includes(q) || m.value.includes(q) || String(viewYear).includes(q);
  });

  const selectedLabel = MONTHS_AR.find(m => m.value === selectedMonth)?.label || '';
  const seasonConfig = MONTH_SEASONS[selectedMonth] || { gradient: 'from-gray-400 to-gray-500', icon: '📅' };

  const yearRange = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-sm text-right ${
          open
            ? 'border-blue-400 ring-4 ring-blue-500/10 bg-blue-50/50 shadow-lg shadow-blue-500/10'
            : value
              ? 'border-blue-200 bg-gradient-to-l from-blue-50/50 to-white hover:border-blue-300 hover:shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        {value ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${seasonConfig.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <span className="text-base">{seasonConfig.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{selectedLabel} {selectedYear}</p>
              <p className="text-[10px] text-gray-500">{value}</p>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 flex-1">
            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <span className="text-gray-400 font-medium flex-1">اختر شهر المسير...</span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
          </div>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="absolute z-[100] top-full mt-2 w-full min-w-[340px] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-2 border-gray-100 dark:border-slate-800 overflow-hidden"
          >
            {/* Search Header */}
            <div className="p-3 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-l from-indigo-50/80 via-blue-50/50 to-sky-50/80 dark:from-slate-800/50 dark:to-slate-800/50">
              <div className="relative">
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن الشهر..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200/80 dark:border-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {/* Year Selector */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/80 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-700">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewYear(prev => prev + 1)}
                className="h-8 w-8 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm"
              >
                <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
              </motion.button>

              {/* Year pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2">
                {yearRange.map(year => (
                  <motion.button
                    key={year}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewYear(year)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      viewYear === year
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                        : year === currentYear
                          ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'
                          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {year}
                  </motion.button>
                ))}
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setViewYear(prev => prev - 1)}
                className="h-8 w-8 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm"
              >
                <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
              </motion.button>
            </div>

            {/* Months Grid */}
            <div className="p-3">
              {filteredMonths.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400 font-bold">لا توجد نتائج مطابقة</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {filteredMonths.map((month, index) => {
                    const isSelected = selectedMonth === month.value && selectedYear === viewYear;
                    const isCurrentMonth = month.value === String(new Date().getMonth() + 1).padStart(2, '0') && viewYear === currentYear;
                    const season = MONTH_SEASONS[month.value];

                    return (
                      <motion.button
                        key={month.value}
                        type="button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          onChange(`${viewYear}-${month.value}`);
                          setOpen(false);
                          setSearch('');
                        }}
                        className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                          isSelected
                            ? `bg-gradient-to-br ${season.gradient} text-white shadow-lg shadow-blue-500/20 ring-2 ring-white/50`
                            : isCurrentMonth
                              ? 'bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:shadow-md'
                              : 'bg-gray-50/80 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:shadow-sm'
                        }`}
                      >
                        <span className="text-lg">{season.icon}</span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : ''}`}>
                          {month.label}
                        </span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -left-1"
                          >
                            <div className="h-5 w-5 rounded-full bg-white shadow-md flex items-center justify-center">
                              <CheckCircle2 size={12} className="text-blue-600" />
                            </div>
                          </motion.div>
                        )}
                        {isCurrentMonth && !isSelected && (
                          <span className="absolute -top-1 -left-1 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white shadow-sm" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer: Quick select current month */}
            <div className="p-2 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  const val = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                  onChange(val);
                  setViewYear(now.getFullYear());
                  setOpen(false);
                  setSearch('');
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-bold transition-colors"
              >
                <Clock size={14} />
                الشهر الحالي
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PackageDropdown({
  packages: pkgList,
  selectedPackageId,
  onSelect,
  getWorkTypeLabel,
  placeholder,
}: {
  packages: Package[];
  selectedPackageId: string;
  onSelect: (id: string) => void;
  getWorkTypeLabel: (type: string) => string;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [open]);

  const selectedPkg = pkgList.find(p => String(p.id) === selectedPackageId) || null;

  const filteredPkgs = pkgList.filter(pkg => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return pkg.group_name.toLowerCase().includes(q) || 
           getWorkTypeLabel(pkg.work_type).toLowerCase().includes(q);
  });

  const getWorkTypeConfig = (type: string) => {
    switch (type) {
      case 'salary': return { 
        icon: <Briefcase size={14} />, 
        gradient: 'from-emerald-500 to-green-600', 
        bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        ring: 'ring-emerald-500/20'
      };
      case 'target': return { 
        icon: <Target size={14} />, 
        gradient: 'from-blue-500 to-indigo-600', 
        bg: 'bg-blue-50 dark:bg-blue-950/30', 
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        ring: 'ring-blue-500/20'
      };
      case 'tiers': return { 
        icon: <TrendingUp size={14} />, 
        gradient: 'from-violet-500 to-purple-600', 
        bg: 'bg-violet-50 dark:bg-violet-950/30', 
        text: 'text-violet-700 dark:text-violet-400',
        border: 'border-violet-200 dark:border-violet-800',
        ring: 'ring-violet-500/20'
      };
      default: return { 
        icon: <Layers size={14} />, 
        gradient: 'from-gray-500 to-gray-600', 
        bg: 'bg-gray-50', 
        text: 'text-gray-700',
        border: 'border-gray-200',
        ring: 'ring-gray-500/20'
      };
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-sm text-right ${
          open 
            ? 'border-blue-400 ring-4 ring-blue-500/10 bg-blue-50/50 shadow-lg shadow-blue-500/10' 
            : selectedPkg 
              ? 'border-blue-200 bg-gradient-to-l from-blue-50/50 to-white hover:border-blue-300 hover:shadow-md' 
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        {selectedPkg ? (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${getWorkTypeConfig(selectedPkg.work_type).gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <span className="text-white">{getWorkTypeConfig(selectedPkg.work_type).icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{selectedPkg.group_name}</p>
              <p className="text-[10px] text-gray-500">{getWorkTypeLabel(selectedPkg.work_type)}</p>
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 flex-1">
            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <PackageIcon size={16} className="text-gray-400" />
            </div>
            <span className="text-gray-400 font-medium flex-1">{placeholder}</span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
          </div>
        )}
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="absolute z-[100] top-full mt-2 w-full min-w-[340px] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-2 border-gray-100 dark:border-slate-800 overflow-hidden"
          >
            {/* Search Header */}
            <div className="p-3 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-l from-blue-50/80 via-indigo-50/50 to-violet-50/80 dark:from-slate-800/50 dark:to-slate-800/50">
              <div className="relative">
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن الباقة..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200/80 dark:border-slate-700 text-sm font-medium text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Crown size={12} className="text-amber-500" />
                <span className="text-[10px] font-bold text-gray-500">{filteredPkgs.length} باقة متاحة</span>
              </div>
            </div>

            {/* Package List */}
            <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
              {filteredPkgs.length === 0 ? (
                <div className="text-center py-8">
                  <PackageIcon size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400 font-bold">لا توجد باقات مطابقة</p>
                </div>
              ) : (
                filteredPkgs.map((pkg, index) => {
                  const config = getWorkTypeConfig(pkg.work_type);
                  const isSelected = String(pkg.id) === selectedPackageId;
                  const isHovered = hoveredId === pkg.id;

                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onMouseEnter={() => setHoveredId(pkg.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => {
                        onSelect(String(pkg.id));
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 ${
                        isSelected 
                          ? `${config.bg} ring-2 ${config.ring} ${config.border} border` 
                          : isHovered 
                            ? 'bg-gray-50 dark:bg-slate-800/50' 
                            : 'hover:bg-gray-50/50'
                      }`}
                    >
                      {/* Icon */}
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <span className="text-white">{config.icon}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{pkg.group_name}</p>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex-shrink-0"
                            >
                              <CheckCircle2 size={16} className="text-blue-500" />
                            </motion.div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${config.bg} ${config.text}`}>
                            {config.icon}
                            {getWorkTypeLabel(pkg.work_type)}
                          </span>
                          {pkg.work_type === 'target' && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              هدف: {pkg.monthly_target} | بونص: {pkg.bonus_after_target}
                            </span>
                          )}
                          {pkg.work_type === 'salary' && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              نظام رواتب ثابت
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Clear Selection */}
            {selectedPackageId && (
              <div className="p-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    onSelect("");
                    setOpen(false);
                    setSearch("");
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors"
                >
                  <X size={14} />
                  إلغاء الاختيار
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function NewPayrollClient({ packages, debts, companyId, userName }: NewPayrollClientProps) {
  const router = useRouter();
  const t = useTranslations("financialVouchersPage.salaryPayrollsPage");
  const [loading, setLoading] = useState(false);
  const [fetchingPackage, setFetchingPackage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    title: "",
    message: "",
    details: undefined,
    missingFields: undefined,
    onConfirm: undefined
  });
  const [showDebtsPanel, setShowDebtsPanel] = useState(false);

  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [employeeRows, setEmployeeRows] = useState<EmployeeRow[]>([]);
  const [tierSystemActive, setTierSystemActive] = useState(false);

  // Chart of Accounts & Cost Centers
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenterItem[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedAccountName, setSelectedAccountName] = useState("");
  const [selectedCostCenterId, setSelectedCostCenterId] = useState<number | null>(null);
  const [selectedCostCenterName, setSelectedCostCenterName] = useState("");
  const [accountError, setAccountError] = useState(false);
  const [costCenterError, setCostCenterError] = useState(false);

  const accountTree = useMemo(() => buildTree(accounts), [accounts]);
  const costCenterTree = useMemo(() => buildTree(costCenters), [costCenters]);

  // Fetch accounts & cost centers on mount
  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        const [accRes, ccRes] = await Promise.all([
          fetch(`/api/accounts?company_id=${companyId}`),
          fetch(`/api/cost-centers?company_id=${companyId}`)
        ]);
        if (accRes.ok) {
          const accData = await accRes.json();
          setAccounts(accData.accounts || []);
        }
        if (ccRes.ok) {
          const ccData = await ccRes.json();
          setCostCenters(ccData.costCenters || []);
        }
      } catch (err) {
        console.error("Error fetching tree data:", err);
      }
    };
    if (companyId) fetchTreeData();
  }, [companyId]);

  const workType = selectedPackage?.work_type || 'salary';
  const isSalaryType = workType === 'salary';

  const showNotification = (
    type: NotificationState['type'], 
    title: string, 
    message: string,
    details?: NotificationState['details'],
    missingFields?: string[],
    onConfirm?: () => void
  ) => {
    setNotification({ show: true, type, title, message, details, missingFields, onConfirm });
    if (type !== "loading" && type !== "confirm" && type !== "warning") {
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 6000);
    }
  };

  const fetchPackageData = useCallback(async (packageId: string) => {
    if (!packageId) return;
    
    setFetchingPackage(true);
    try {
      const res = await fetch(`/api/packages?company_id=${companyId}&package_id=${packageId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedPackage(data.package);
        setEmployees(data.employees || []);
        setTiers((data.tiers || []).map((t: Tier) => ({
          ...t,
          min_orders: Number(t.min_orders) || 0,
          base_salary: Number(t.base_salary) || 0,
          increment_per_order: Number(t.increment_per_order) || 0,
          bonus: Number(t.bonus) || 0
        })));
        setSlabs((data.slabs || []).map((s: Slab) => ({
          ...s,
          from_orders: Number(s.from_orders) || 0,
          to_orders: s.to_orders ? Number(s.to_orders) : null,
          value_per_order: Number(s.value_per_order) || 0
        })));

        const pkgWorkType = data.package?.work_type || 'salary';
        const rows: EmployeeRow[] = (data.employees || []).map((emp: Employee) => {
          const basicSalary = Number(emp.basic_salary) || 0;
          const housingAllowance = Number(emp.housing_allowance) || 0;
          const target = Number(data.package?.monthly_target) || 0;
          const bonusPerOrder = Number(data.package?.bonus_after_target) || 0;
          
          const employeeDebt = debts.find(d => d.iqama_number === emp.iqama_number);
          const debtAmount = employeeDebt ? Math.abs(Number(employeeDebt.amount)) : 0;

          return {
            employee_name: emp.name,
            iqama_number: emp.iqama_number,
            user_code: emp.user_code || '',
            basic_salary: basicSalary,
            housing_allowance: housingAllowance,
            nationality: emp.nationality || '',
            job_title: emp.job_title || '',
            target: target,
            bonus_per_order: bonusPerOrder,
            successful_orders: 0,
            target_deduction: 0,
            monthly_bonus: 0,
            operator_deduction: 0,
            internal_deduction: debtAmount,
            wallet_deduction: 0,
            internal_bonus: 0,
            net_salary: pkgWorkType === 'salary' ? basicSalary + housingAllowance - debtAmount : basicSalary - debtAmount,
            payment_method: 'غير محدد',
            achieved_tier: '',
            tier_bonus: 0,
            extra_amount: 0,
            selected: true,
            has_debt: debtAmount > 0,
            debt_amount: debtAmount
          };
        });
        setEmployeeRows(rows);
      }
    } catch (error) {
      console.error("Error fetching package:", error);
    } finally {
      setFetchingPackage(false);
    }
  }, [companyId, debts, t]);

  useEffect(() => {
    if (selectedPackageId) {
      fetchPackageData(selectedPackageId);
    }
  }, [selectedPackageId, fetchPackageData]);

  const calculateTierSystem = (orders: number, operator: number, internal: number, wallet: number, reward: number) => {
    const ordersVal = Number(orders) || 0;
    const operatorVal = Number(operator) || 0;
    const internalVal = Number(internal) || 0;
    const walletVal = Number(wallet) || 0;
    const rewardVal = Number(reward) || 0;

    let calculatedSalary = 0;
    let achievedTier = '';
    
    if (ordersVal < 1) {
      calculatedSalary = 0;
      achievedTier = t("newPayroll.noOrders");
    } else if (ordersVal < 301) {
      calculatedSalary = ordersVal * 2;
      achievedTier = t("newPayroll.tierRange", { from: 1, to: 300, rate: 2 });
    } else if (ordersVal < 401) {
      calculatedSalary = ordersVal * 3;
      achievedTier = t("newPayroll.tierRange", { from: 301, to: 400, rate: 3 });
    } else if (ordersVal < 450) {
      calculatedSalary = ordersVal * 4;
      achievedTier = t("newPayroll.tierRange", { from: 401, to: 449, rate: 4 });
    } else if (ordersVal < 520) {
      calculatedSalary = 2450 + (ordersVal - 450) * 7;
      achievedTier = t("newPayroll.tierLevel", { level: 1, range: '450-519' });
    } else if (ordersVal < 560) {
      calculatedSalary = 3000 + (ordersVal - 520) * 8;
      achievedTier = t("newPayroll.tierLevel", { level: 2, range: '520-559' });
    } else {
      calculatedSalary = 3450 + (ordersVal - 560) * 10;
      achievedTier = t("newPayroll.tierLevel", { level: 3, range: '560+' });
    }
    
    const totalDeductions = operatorVal + internalVal + walletVal;
    return {
      net: Number(calculatedSalary + rewardVal - totalDeductions),
      achievedTier,
      baseSalary: calculatedSalary
    };
  };

  const calculateRow = useCallback((row: EmployeeRow): EmployeeRow => {
    const currentWorkType = selectedPackage?.work_type || 'salary';
    let net = 0;
    let targetDeduction = 0;
    let monthlyBonus = 0;
    let achievedTier = '';
    let tierBonus = 0;
    let extraAmount = 0;

    const operatorVal = Number(row.operator_deduction) || 0;
    const internalVal = Number(row.internal_deduction) || 0;
    const walletVal = Number(row.wallet_deduction) || 0;
    const rewardVal = Number(row.internal_bonus) || 0;
    const ordersVal = Number(row.successful_orders) || 0;
    const basicSalaryVal = Number(row.basic_salary) || 0;
    const housingVal = Number(row.housing_allowance) || 0;

    if (currentWorkType === 'salary') {
      net = basicSalaryVal + housingVal + rewardVal - internalVal;
    } else if (currentWorkType === 'target') {
      const target = Number(row.target || selectedPackage?.monthly_target || 0);
      const bonusPerOrder = Number(row.bonus_per_order || selectedPackage?.bonus_after_target || 0);
      const totalDeductions = operatorVal + internalVal + walletVal;
      
      if (ordersVal < target) {
        targetDeduction = target > 0 ? (target - ordersVal) * (basicSalaryVal / target) : 0;
      } else {
        monthlyBonus = (ordersVal - target) * bonusPerOrder;
      }
      
      net = basicSalaryVal + monthlyBonus + rewardVal - targetDeduction - totalDeductions;
    } else if (currentWorkType === 'tiers') {
      const totalDeductions = operatorVal + internalVal + walletVal;
      
      if (tierSystemActive) {
        const result = calculateTierSystem(
          ordersVal,
          operatorVal,
          internalVal,
          walletVal,
          rewardVal
        );
        net = result.net;
        achievedTier = result.achievedTier;
      } else {
        let matchedTier: Tier | null = null;
        for (const tier of tiers) {
          if (ordersVal >= tier.min_orders) {
            matchedTier = tier;
          } else {
            break;
          }
        }

        if (matchedTier) {
          const baseSalary = Number(matchedTier.base_salary);
          extraAmount = (ordersVal - Number(matchedTier.min_orders)) * Number(matchedTier.increment_per_order);
          tierBonus = Number(matchedTier.bonus) || 0;
          net = baseSalary + extraAmount + tierBonus + rewardVal - totalDeductions;
          achievedTier = `من ${matchedTier.min_orders} طلب`;
        } else {
          let matchedSlab: Slab | null = null;
          for (const slab of slabs) {
            if (ordersVal >= slab.from_orders && 
                (slab.to_orders === null || slab.to_orders === 0 || ordersVal <= slab.to_orders)) {
              matchedSlab = slab;
              break;
            }
          }

          if (matchedSlab) {
            net = ordersVal * Number(matchedSlab.value_per_order) + rewardVal - totalDeductions;
            achievedTier = `انخفاض (${matchedSlab.from_orders}-${matchedSlab.to_orders || 'فوق'})`;
          } else {
            net = rewardVal - totalDeductions;
            achievedTier = 'لا توجد شريحة مناسبة';
          }
        }
      }
    } else if (currentWorkType === 'commission') {
      const totalDeductions = operatorVal + internalVal + walletVal;
      const commissionRate = (Number(selectedPackage?.bonus_after_target) || 0) / 100;
      const commission = ordersVal * commissionRate;
      net = basicSalaryVal + commission + rewardVal - totalDeductions;
    }

    return {
      ...row,
      target_deduction: targetDeduction,
      monthly_bonus: monthlyBonus,
      net_salary: net,
      achieved_tier: achievedTier,
      tier_bonus: tierBonus,
      extra_amount: extraAmount
    };
  }, [selectedPackage, tiers, slabs, tierSystemActive]);

  const handleRowChange = (index: number, field: keyof EmployeeRow, value: number | string | boolean) => {
    setEmployeeRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field !== 'selected') {
        updated[index] = calculateRow(updated[index]);
      }
      return updated;
    });
  };

  const recalculateAll = useCallback(() => {
    setEmployeeRows(prev => prev.map(row => calculateRow(row)));
  }, [calculateRow]);

  useEffect(() => {
    if (employeeRows.length > 0) {
      recalculateAll();
    }
  }, [tierSystemActive]);

  const toggleSelectAll = () => {
    const allSelected = employeeRows.every(row => row.selected);
    setEmployeeRows(prev => prev.map(row => ({ ...row, selected: !allSelected })));
  };

  const removeUnselected = () => {
    setEmployeeRows(prev => prev.filter(row => row.selected));
  };

  const selectedCount = employeeRows.filter(row => row.selected).length;

  const getTotals = () => {
    let totalSalary = 0;
    let totalOrders = 0;
    let totalDeductions = 0;

    employeeRows.filter(row => row.selected).forEach(row => {
      const netSalary = Number(row.net_salary) || 0;
      const orders = Number(row.successful_orders) || 0;
      
      if (netSalary >= 0) totalSalary += netSalary;
      totalOrders += orders;
      
      const targetDed = Number(row.target_deduction) || 0;
      const operatorDed = Number(row.operator_deduction) || 0;
      const internalDed = Number(row.internal_deduction) || 0;
      const walletDed = Number(row.wallet_deduction) || 0;
      
      if (isSalaryType) {
        totalDeductions += internalDed;
      } else {
        totalDeductions += targetDed + operatorDed + internalDed + walletDed;
      }
    });

    return { totalSalary, totalOrders, totalDeductions };
  };

  const handleSave = async (isDraft: boolean) => {
    if (!selectedPackageId || !payrollMonth) {
      showNotification("error", t("newPayroll.notifications.error"), t("newPayroll.notifications.selectMonthAndPackage"));
      return;
    }

    // Collect missing required fields
    const missingFields: string[] = [];
    if (!selectedAccountId) {
      setAccountError(true);
      missingFields.push(t("newPayroll.notifications.requiredAccount"));
    }
    if (!selectedCostCenterId) {
      setCostCenterError(true);
      missingFields.push(t("newPayroll.notifications.requiredCostCenter"));
    }

    // For target/tiers/commission types, check if orders are entered
    const currentWorkType = selectedPackage?.work_type || 'salary';
    if (currentWorkType !== 'salary') {
      const selectedRows = employeeRows.filter(row => row.selected);
      const hasNoOrders = selectedRows.some(row => Number(row.successful_orders) <= 0);
      if (hasNoOrders) {
        missingFields.push(t("newPayroll.notifications.requiredOrders"));
      }
    }

    if (missingFields.length > 0) {
      showNotification(
        "warning",
        t("newPayroll.notifications.requiredFields"),
        t("newPayroll.notifications.requiredFieldsDesc"),
        undefined,
        missingFields
      );
      return;
    }

    const selectedRows = employeeRows.filter(row => row.selected);
    if (selectedRows.length === 0) {
      showNotification("error", t("newPayroll.notifications.error"), t("newPayroll.notifications.selectEmployee"));
      return;
    }

    const totalAmount = selectedRows.reduce((sum, row) => sum + (Number(row.net_salary) || 0), 0);
    const totalDeductions = selectedRows.reduce((sum, row) => {
      return sum + (Number(row.target_deduction) || 0) + (Number(row.operator_deduction) || 0) + (Number(row.internal_deduction) || 0) + (Number(row.wallet_deduction) || 0);
    }, 0);

    // Show confirmation modal
    showNotification(
      "confirm",
      isDraft ? t("newPayroll.notifications.confirmSaveTitle") : t("newPayroll.notifications.confirmSaveTitle"),
      isDraft ? t("newPayroll.notifications.confirmSaveDraftDesc") : t("newPayroll.notifications.confirmSaveDesc"),
      {
        month: payrollMonth,
        employeeCount: selectedRows.length,
        totalAmount,
        totalDeductions,
        packageName: selectedPackage?.group_name,
        accountName: selectedAccountName,
        costCenterName: selectedCostCenterName,
        workType: getWorkTypeLabel(currentWorkType),
        isDraft,
      },
      undefined,
      () => executeSave(isDraft, selectedRows, totalAmount)
    );
  };

  const executeSave = async (isDraft: boolean, selectedRows: EmployeeRow[], totalAmount: number) => {
    setLoading(true);
    showNotification(
      "loading",
      t("newPayroll.notifications.preparingSave"),
      t("newPayroll.notifications.preparingSaveDesc")
    );

    try {
      const items = selectedRows.map(row => ({
        employee_name: row.employee_name,
        iqama_number: row.iqama_number,
        user_code: row.user_code,
        basic_salary: row.basic_salary,
        target: row.target,
        successful_orders: row.successful_orders,
        target_deduction: row.target_deduction,
        monthly_bonus: row.monthly_bonus,
        operator_deduction: row.operator_deduction,
        internal_deduction: row.internal_deduction,
        wallet_deduction: row.wallet_deduction,
        internal_bonus: row.internal_bonus,
        net_salary: row.net_salary,
        payment_method: row.payment_method,
        housing_allowance: row.housing_allowance,
        achieved_tier: row.achieved_tier,
        tier_bonus: row.tier_bonus,
        extra_amount: row.extra_amount
      }));

      const res = await fetch("/api/payrolls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          payroll_month: payrollMonth,
          package_id: selectedPackageId,
          saved_by: userName,
          is_draft: isDraft ? 1 : 0,
          account_id: selectedAccountId,
          cost_center_id: selectedCostCenterId,
          items
        })
      });

      if (res.ok) {
        const totalDeductions = selectedRows.reduce((sum, row) => {
          return sum + (Number(row.target_deduction) || 0) + (Number(row.operator_deduction) || 0) + (Number(row.internal_deduction) || 0) + (Number(row.wallet_deduction) || 0);
        }, 0);
        showNotification(
          "success", 
          isDraft ? t("newPayroll.notifications.savedDraft") : t("newPayroll.notifications.savedPayroll"), 
          isDraft ? t("newPayroll.notifications.savedDraftDesc") : t("newPayroll.notifications.savedPayrollDesc"),
          {
            month: payrollMonth,
            employeeCount: selectedRows.length,
            totalAmount,
            totalDeductions,
            packageName: selectedPackage?.group_name,
            accountName: selectedAccountName,
            costCenterName: selectedCostCenterName,
            workType: getWorkTypeLabel(selectedPackage?.work_type || 'salary'),
            isDraft,
          }
        );
        setTimeout(() => {
          router.push("/salary-payrolls");
          router.refresh();
        }, 3000);
      } else {
        const data = await res.json();
        showNotification("error", t("newPayroll.notifications.saveFailed"), data.error || t("newPayroll.notifications.errorSaving"));
      }
    } catch {
      showNotification("error", t("newPayroll.notifications.error"), t("newPayroll.notifications.errorSaving"));
    } finally {
      setLoading(false);
    }
  };

  const getWorkTypeLabel = (type: string) => {
    switch (type) {
      case 'salary': return t("workTypes.salary");
      case 'target': return t("workTypes.target");
      case 'tiers': return t("workTypes.tiers");
      case 'commission': return t("workTypes.commission");
      default: return type;
    }
  };

  const totals = getTotals();
  const totalDebts = debts.reduce((sum, d) => sum + Math.abs(Number(d.amount)), 0);
  const employeesWithDebts = employeeRows.filter(row => row.has_debt);

  const filteredEmployeeRows = useMemo(() => {
    if (!searchQuery.trim()) return employeeRows;
    const query = searchQuery.toLowerCase().trim();
    return employeeRows.filter(row => 
      row.employee_name.toLowerCase().includes(query) ||
      row.iqama_number.includes(query) ||
      row.user_code.includes(query)
    );
  }, [employeeRows, searchQuery]);

  const getFilteredIndex = (filteredIdx: number) => {
    if (!searchQuery.trim()) return filteredIdx;
    const filteredRow = filteredEmployeeRows[filteredIdx];
    return employeeRows.findIndex(row => row.iqama_number === filteredRow.iqama_number);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Premium Notification Modals */}
      <AnimatePresence>
          {notification.show && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !["loading"].includes(notification.type) && setNotification(prev => ({ ...prev, show: false }))}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
              />

              {/* Warning: Missing fields */}
              {notification.type === "warning" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(245,158,11,0.3)] overflow-hidden border-4 border-amber-500/20"
                >
                  <div className="relative bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-10 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
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
                      {notification.title}
                    </motion.h3>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-white/80 font-bold mt-2 relative z-10">
                      {notification.message}
                    </motion.p>
                  </div>
                  <div className="p-8 text-center space-y-6" dir="rtl">
                    {notification.missingFields && (
                      <div className="space-y-2">
                        {notification.missingFields.map((field, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100"
                          >
                            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <AlertTriangle size={16} className="text-amber-600" />
                            </div>
                            <span className="text-sm font-bold text-gray-800">{field}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-amber-500/30 border-b-4 border-amber-700/50"
                    >
                      {t("newPayroll.notifications.ok")}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Confirm Save */}
              {notification.type === "confirm" && notification.details && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(139,92,246,0.3)] overflow-hidden border-4 border-violet-500/20"
                >
                  <div className="relative bg-gradient-to-br from-violet-500 via-purple-600 to-violet-700 p-10 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", damping: 15 }}
                      className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <FileCheck size={48} className="text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                    <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-black tracking-tight relative z-10">
                      {notification.title}
                    </motion.h3>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-white/80 font-bold mt-2 relative z-10">
                      {notification.message}
                    </motion.p>
                  </div>
                  <div className="p-8 text-center space-y-6" dir="rtl">
                    <div className="bg-violet-50 rounded-2xl p-6 border-2 border-violet-100">
                      <div className="grid grid-cols-2 gap-3">
                        {notification.details.month && (
                          <div className="bg-white rounded-xl p-3 border border-violet-100">
                            <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1">
                              <Calendar size={12} />
                              <span className="text-[10px] font-bold">شهر المسير</span>
                            </div>
                            <p className="font-black text-gray-900 text-sm">{notification.details.month}</p>
                          </div>
                        )}
                        {notification.details.packageName && (
                          <div className="bg-white rounded-xl p-3 border border-violet-100">
                            <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1">
                              <Layers size={12} />
                              <span className="text-[10px] font-bold">الباقة</span>
                            </div>
                            <p className="font-black text-gray-900 text-sm truncate">{notification.details.packageName}</p>
                          </div>
                        )}
                        {notification.details.workType && (
                          <div className="bg-white rounded-xl p-3 border border-violet-100">
                            <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1">
                              <Target size={12} />
                              <span className="text-[10px] font-bold">نظام العمل</span>
                            </div>
                            <p className="font-black text-gray-900 text-sm">{notification.details.workType}</p>
                          </div>
                        )}
                        {notification.details.employeeCount !== undefined && (
                          <div className="bg-white rounded-xl p-3 border border-violet-100">
                            <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                              <Users size={12} />
                              <span className="text-[10px] font-bold">عدد الموظفين</span>
                            </div>
                            <p className="font-black text-gray-900 text-sm">{notification.details.employeeCount} موظف</p>
                          </div>
                        )}
                        {notification.details.totalAmount !== undefined && (
                          <div className="bg-white rounded-xl p-3 border border-violet-100">
                            <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                              <DollarSign size={12} />
                              <span className="text-[10px] font-bold">إجمالي المسير</span>
                            </div>
                            <p className="font-black text-emerald-600 text-sm">{notification.details.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t("stats.sar")}</p>
                          </div>
                        )}
                        {notification.details.totalDeductions !== undefined && notification.details.totalDeductions > 0 && (
                          <div className="bg-white rounded-xl p-3 border border-violet-100">
                            <div className="flex items-center justify-center gap-1.5 text-red-600 mb-1">
                              <AlertTriangle size={12} />
                              <span className="text-[10px] font-bold">إجمالي الخصومات</span>
                            </div>
                            <p className="font-black text-red-600 text-sm">{notification.details.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t("stats.sar")}</p>
                          </div>
                        )}
                        {notification.details.accountName && (
                          <div className="bg-white rounded-xl p-3 border border-violet-100 col-span-2">
                            <div className="flex items-center justify-center gap-1.5 text-indigo-600 mb-1">
                              <BookOpen size={12} />
                              <span className="text-[10px] font-bold">الحساب ومركز التكلفة</span>
                            </div>
                            <p className="font-bold text-gray-900 text-xs truncate">{notification.details.accountName}</p>
                            {notification.details.costCenterName && (
                              <p className="font-bold text-gray-600 text-xs truncate mt-1">{notification.details.costCenterName}</p>
                            )}
                          </div>
                        )}
                      </div>
                      {notification.details.isDraft && (
                        <div className="mt-3 bg-amber-50 rounded-xl p-2 border border-amber-200">
                          <p className="text-amber-700 text-xs font-bold text-center">سيتم حفظه كمسودة - يمكنك تعديله لاحقاً</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                        className="flex-1 flex items-center justify-center gap-3 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 transition-colors"
                      >
                        <X size={20} />
                        {t("newPayroll.notifications.cancelBtn")}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => notification.onConfirm?.()}
                        className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-violet-500 via-purple-600 to-violet-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-violet-500/30 border-b-4 border-violet-700/50"
                      >
                        <Save size={20} />
                        {t("newPayroll.notifications.confirmBtn")}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Loading */}
              {notification.type === "loading" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20"
                >
                  <div className="relative bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 p-10 text-white text-center overflow-hidden">
                    <motion.div className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30">
                      <Loader2 size={48} className="text-white animate-spin" />
                    </motion.div>
                    <h3 className="text-2xl font-black relative z-10">{notification.title}</h3>
                    <p className="text-white/80 font-bold mt-2 relative z-10">{notification.message}</p>
                  </div>
                  <div className="p-8">
                    <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-100">
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <p className="text-blue-700 font-bold text-center mt-3 text-sm">
                        جاري حفظ بيانات الموظفين والرواتب...
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Success */}
              {notification.type === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden border-4 border-emerald-500/20"
                >
                  <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-10 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 100, opacity: 0 }}
                          animate={{ y: -100, opacity: [0, 1, 0], x: Math.random() * 100 - 50 }}
                          transition={{ delay: i * 0.2, duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          className="absolute"
                          style={{ left: `${15 + i * 15}%` }}
                        >
                          <Sparkles size={20} className="text-white/40" />
                        </motion.div>
                      ))}
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: "spring", damping: 12 }}
                      className="relative z-10 mx-auto w-28 h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ delay: 0.3, duration: 0.5 }}>
                        <CheckCircle2 size={56} className="text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                    <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-black tracking-tight relative z-10">
                      {notification.title}
                    </motion.h3>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-white/80 font-bold mt-2 relative z-10">
                      {notification.message}
                    </motion.p>
                  </div>
                  <div className="p-8 text-center space-y-6" dir="rtl">
                    {notification.details && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-100"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          {notification.details.month && (
                            <div className="bg-white rounded-xl p-3 border border-emerald-100">
                              <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                                <Calendar size={12} />
                                <span className="text-[10px] font-bold">شهر المسير</span>
                              </div>
                              <p className="font-black text-gray-900 text-sm">{notification.details.month}</p>
                            </div>
                          )}
                          {notification.details.packageName && (
                            <div className="bg-white rounded-xl p-3 border border-emerald-100">
                              <div className="flex items-center justify-center gap-1.5 text-emerald-600 mb-1">
                                <Layers size={12} />
                                <span className="text-[10px] font-bold">الباقة</span>
                              </div>
                              <p className="font-black text-gray-900 text-sm truncate">{notification.details.packageName}</p>
                            </div>
                          )}
                          {notification.details.employeeCount !== undefined && (
                            <div className="bg-white rounded-xl p-3 border border-emerald-100">
                              <div className="flex items-center justify-center gap-1.5 text-blue-600 mb-1">
                                <Users size={12} />
                                <span className="text-[10px] font-bold">عدد الموظفين</span>
                              </div>
                              <p className="font-black text-gray-900 text-sm">{notification.details.employeeCount} موظف</p>
                            </div>
                          )}
                          {notification.details.totalAmount !== undefined && (
                            <div className="bg-white rounded-xl p-3 border border-emerald-100">
                              <div className="flex items-center justify-center gap-1.5 text-amber-600 mb-1">
                                <DollarSign size={12} />
                                <span className="text-[10px] font-bold">{t("newPayroll.notifications.totalPayroll")}</span>
                              </div>
                              <p className="font-black text-gray-900 text-sm">{notification.details.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t("stats.sar")}</p>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 bg-emerald-100 rounded-xl p-2">
                          <p className="text-emerald-700 text-xs font-bold text-center">{t("newPayroll.notifications.redirecting")}</p>
                        </div>
                      </motion.div>
                    )}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { router.push("/salary-payrolls"); router.refresh(); }}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/30 border-b-4 border-emerald-700/50"
                    >
                      <CheckCircle2 size={24} />
                      {t("newPayroll.notifications.ok")}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {notification.type === "error" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
                >
                  <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      <AlertCircle size={48} className="text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-black relative z-10">{notification.title}</h3>
                    <p className="text-white/80 font-bold mt-2 relative z-10">{notification.message}</p>
                  </div>
                  <div className="p-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50"
                    >
                      {t("newPayroll.notifications.ok")}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
      </AnimatePresence>

      <AnimatePresence>
        {showDebtsPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowDebtsPanel(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed top-0 left-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">{t("newPayroll.previousDebts")}</h2>
                      <p className="text-white/70 text-sm">{t("newPayroll.debtsCount", { count: debts.length })}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowDebtsPanel(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {debts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
                    <p className="text-gray-500 font-bold">{t("newPayroll.noDebts")}</p>
                  </div>
                ) : (
                  debts.map(debt => (
                    <div key={debt.id} className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-900">{debt.employee_name}</p>
                          <p className="text-xs text-gray-500">{debt.iqama_number}</p>
                          <p className="text-xs text-gray-400 mt-1">{t("newPayroll.debtMonth")} {debt.month_reference}</p>
                        </div>
                        <div className="text-left">
                          <p className="text-red-600 font-black text-lg">{Math.abs(Number(debt.amount)).toLocaleString('en-US')}</p>
                          <p className="text-xs text-red-400">{t("newPayroll.sar")}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {debts.length > 0 && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 font-bold">{t("newPayroll.totalDebts")}</span>
                    <span className="text-red-600 font-black text-xl">{totalDebts.toLocaleString('en-US')} {t("newPayroll.sar")}</span>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    {t("newPayroll.debtsNote")}
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a237e] to-[#283593] p-6 text-white border-b border-white/10">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg">
                      <FileText size={28} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black">{t("newPayroll.title")}</h1>
                      <p className="text-white/60 text-sm">{t("newPayroll.subtitle")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {debts.length > 0 && (
                      <button 
                        onClick={() => setShowDebtsPanel(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all animate-pulse"
                      >
                        <AlertTriangle size={16} />
                        <span>{t("newPayroll.debtsCount", { count: debts.length })}</span>
                      </button>
                    )}
                    <Link href="/salary-payrolls">
                      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all border border-white/10">
                        <ArrowRight size={16} />
                        <span>{t("backToList")}</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
            </div>

            <div className="p-6 space-y-6">
              {debts.length > 0 && employeesWithDebts.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 rounded-2xl border-2 border-red-200 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
                        <AlertTriangle size={24} className="text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-red-900 text-lg">{t("newPayroll.debtsWarning")}</h3>
                        <p className="text-red-600 text-sm">{t("newPayroll.debtsWarningDesc", { count: employeesWithDebts.length })}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowDebtsPanel(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all"
                    >
                      <CreditCard size={16} />
                      <span>{t("newPayroll.viewDebtsDetails")}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {employeesWithDebts.slice(0, 4).map(emp => (
                      <div key={emp.iqama_number} className="bg-white rounded-xl p-3 border border-red-100">
                        <p className="font-bold text-gray-900 text-sm truncate">{emp.employee_name}</p>
                        <p className="text-red-600 font-bold">{emp.debt_amount.toLocaleString('en-US')} {t("newPayroll.sar")}</p>
                      </div>
                    ))}
                    {employeesWithDebts.length > 4 && (
                      <div className="bg-red-100 rounded-xl p-3 flex items-center justify-center">
                        <p className="text-red-700 font-bold">{t("newPayroll.others", { count: employeesWithDebts.length - 4 })}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {t("newPayroll.payrollMonth")}
                    </label>
                      <MonthPickerDropdown
                        value={payrollMonth}
                        onChange={(val) => setPayrollMonth(val)}
                      />
                  </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
                        <PackageIcon size={14} className="text-blue-500" />
                        {t("newPayroll.selectPackage")}
                      </label>
                      <PackageDropdown
                        packages={packages.filter(pkg => pkg.work_type !== 'commission')}
                        selectedPackageId={selectedPackageId}
                        onSelect={(id) => setSelectedPackageId(id)}
                        getWorkTypeLabel={getWorkTypeLabel}
                        placeholder={t("newPayroll.selectPackagePlaceholder")}
                      />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => selectedPackageId && fetchPackageData(selectedPackageId)}
                      disabled={!selectedPackageId || fetchingPackage}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                      {fetchingPackage ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                      <span>{t("newPayroll.search")}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart of Accounts & Cost Center Selection */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-violet-50/80 via-purple-50/50 to-indigo-50/80 rounded-2xl border-2 border-violet-200/60 p-5 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-sm">شجرة الحسابات ومركز التكلفة</h3>
                    <p className="text-gray-500 text-xs">اختر الحساب ومركز التكلفة لربطهم بالمسير (إجباري)</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TreeDropdown<Account>
                    label="شجرة الحسابات"
                    icon={<BookOpen size={14} className="text-violet-500" />}
                    items={accountTree}
                    selectedId={selectedAccountId}
                    onSelect={(id, name) => {
                      setSelectedAccountId(id);
                      setSelectedAccountName(name);
                      setAccountError(false);
                    }}
                    getCode={(a) => a.account_code}
                    getName={(a) => a.account_name}
                    getType={(a) => a.account_type}
                    placeholder="اختر الحساب من الشجرة..."
                    required
                    error={accountError}
                    gradient="bg-gradient-to-r from-violet-500 to-purple-600"
                  />
                  <TreeDropdown<CostCenterItem>
                    label="مركز التكلفة"
                    icon={<Building2 size={14} className="text-indigo-500" />}
                    items={costCenterTree}
                    selectedId={selectedCostCenterId}
                    onSelect={(id, name) => {
                      setSelectedCostCenterId(id);
                      setSelectedCostCenterName(name);
                      setCostCenterError(false);
                    }}
                    getCode={(c) => c.center_code}
                    getName={(c) => c.center_name}
                    getType={(c) => c.center_type}
                    placeholder="اختر مركز التكلفة..."
                    required
                    error={costCenterError}
                    gradient="bg-gradient-to-r from-indigo-500 to-blue-600"
                  />
                </div>
              </motion.div>

              {selectedPackage && (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Info size={18} className="text-blue-500" />
                      <h3 className="font-bold text-blue-900">{t("newPayroll.systemInfo")}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <Layers size={14} />
                          <span className="text-xs font-bold">{t("newPayroll.workSystem")}</span>
                        </div>
                        <p className="font-bold text-gray-900">{getWorkTypeLabel(selectedPackage.work_type)}</p>
                      </div>
                      {!isSalaryType && (
                        <>
                          <div className="bg-white rounded-xl p-3 border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                              <Target size={14} />
                              <span className="text-xs font-bold">{t("newPayroll.monthlyTarget")}</span>
                            </div>
                            <p className="font-bold text-gray-900">{selectedPackage.monthly_target || 0} {t("newPayroll.orderUnit")}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-blue-100">
                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                              <Gift size={14} />
                              <span className="text-xs font-bold">{t("newPayroll.bonusValue")}</span>
                            </div>
                            <p className="font-bold text-gray-900">{selectedPackage.bonus_after_target || 0} {t("newPayroll.perOrder")}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {selectedPackage.work_type === 'tiers' && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <button
                          onClick={() => setTierSystemActive(!tierSystemActive)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                            tierSystemActive
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                          }`}
                        >
                          {tierSystemActive ? <CheckCircle size={16} /> : <Clock size={16} />}
                          {tierSystemActive ? t("newPayroll.tiersSystem") : t("newPayroll.activateTiers")}
                        </button>
                      </div>
                    )}
                  </div>

                  {employeeRows.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 420px)', minHeight: '500px' }}>
                      <div className="bg-gradient-to-br from-[#1a237e] to-[#283593] px-4 py-3 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-2 text-white">
                          <Calculator size={18} />
                          <h3 className="font-bold text-sm">
                            {isSalaryType ? t("newPayroll.salaryTable") :
                             workType === 'target' ? t("newPayroll.targetTable") :
                             workType === 'tiers' ? t("newPayroll.tiersTable") : t("newPayroll.salaryTable")}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={toggleSelectAll}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all border border-white/20"
                            >
                              {employeeRows.every(row => row.selected) ? <CheckSquare size={14} /> : <Square size={14} />}
                              {employeeRows.every(row => row.selected) ? t("newPayroll.deselectAll") : t("newPayroll.selectAll")}
                            </button>
                            <button
                              onClick={removeUnselected}
                              disabled={selectedCount === employeeRows.length}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-xs font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={14} />
                              {t("newPayroll.deleteUnselected")}
                            </button>
                            <button
                              onClick={() => fetchPackageData(selectedPackageId)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/80 text-white text-xs font-bold hover:bg-emerald-600 transition-all"
                            >
                              <RefreshCw size={14} />
                              {t("newPayroll.reload")}
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder={t("newPayroll.searchEmployee")}
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-56 pl-8 pr-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-xs focus:bg-white/20 focus:border-white/40 outline-none transition-all"
                            />
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50" />
                            {searchQuery && (
                              <button 
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                          <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold">
                            {selectedCount} / {employeeRows.length} {t("newPayroll.selected")}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 sticky top-0 z-10">
                            <tr className="border-b border-gray-200">
                              <th className="text-center px-2 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">
                                <input
                                  type="checkbox"
                                  checked={employeeRows.every(row => row.selected)}
                                  onChange={toggleSelectAll}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </th>
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.no")}</th>
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.employeeName")}</th>
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.iqama")}</th>
                              {!isSalaryType && (
                                <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.code")}</th>
                              )}
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.salary")}</th>
                              {isSalaryType ? (
                                <>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.housing")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.nationality")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.internalDeduction")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.reward")}</th>
                                </>
                              ) : (
                                <>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.target")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.bonus")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.orders")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.targetDeduction")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.monthlyBonus")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.operatorDeduction")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.internal")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.wallet")}</th>
                                  <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.reward")}</th>
                                </>
                              )}
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap border-l border-gray-200">{t("newPayroll.columns.netSalary")}</th>
                              <th className="text-right px-3 py-2.5 text-xs font-bold text-gray-700 whitespace-nowrap">{t("newPayroll.columns.paymentMethod")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEmployeeRows.map((row, filteredIdx) => {
                              const realIndex = getFilteredIndex(filteredIdx);
                              return (
                                <tr 
                                  key={realIndex} 
                                  className={`border-b border-gray-100 transition-colors duration-100 ${
                                    !row.selected ? 'bg-gray-100 opacity-60' :
                                    row.has_debt ? 'bg-amber-50 hover:bg-amber-100/60' :
                                    row.net_salary < 0 ? 'bg-red-50 hover:bg-red-100/60' : 
                                    'hover:bg-blue-50/60'
                                  }`}
                                >
                                  <td className="px-2 py-2 text-center border-l border-gray-100">
                                    <input
                                      type="checkbox"
                                      checked={row.selected}
                                      onChange={(e) => handleRowChange(realIndex, 'selected', e.target.checked)}
                                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-3 py-2 text-gray-400 text-center border-l border-gray-100 text-xs">{realIndex + 1}</td>
                                  <td className="px-3 py-2 font-bold text-gray-900 whitespace-nowrap border-l border-gray-100">
                                    <div className="flex items-center gap-2">
                                      {row.has_debt && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600" title={`دين سابق: ${row.debt_amount} ريال`}>
                                          <AlertTriangle size={12} />
                                        </span>
                                      )}
                                      {row.employee_name}
                                    </div>
                                  </td>
                                  <td className="px-3 py-2 text-gray-600 whitespace-nowrap border-l border-gray-100 text-xs">{row.iqama_number}</td>
                                  {!isSalaryType && (
                                    <td className="px-3 py-2 text-gray-600 border-l border-gray-100 text-xs">{row.user_code}</td>
                                  )}
                                  <td className="px-3 py-2 font-black text-gray-900 border-l border-gray-100">
                                    {row.basic_salary.toLocaleString('en-US')}
                                  </td>
                                  {isSalaryType ? (
                                    <>
                                      <td className="px-3 py-2 text-gray-600 border-l border-gray-100 text-xs">{row.housing_allowance.toLocaleString('en-US')}</td>
                                      <td className="px-3 py-2 text-gray-500 border-l border-gray-100 text-xs">{row.nationality}</td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.internal_deduction}
                                          onChange={(e) => handleRowChange(realIndex, 'internal_deduction', parseFloat(e.target.value) || 0)}
                                          className={`w-20 px-2 py-1 rounded-lg border text-center text-sm focus:border-blue-500 outline-none ${
                                            row.has_debt ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                          }`}
                                          min="0"
                                        />
                                      </td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.internal_bonus}
                                          onChange={(e) => handleRowChange(realIndex, 'internal_bonus', parseFloat(e.target.value) || 0)}
                                          className="w-20 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm focus:border-blue-500 outline-none"
                                          min="0"
                                        />
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="px-3 py-2 text-gray-500 border-l border-gray-100 text-xs">{row.target}</td>
                                      <td className="px-3 py-2 text-gray-500 border-l border-gray-100 text-xs">{row.bonus_per_order}</td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.successful_orders}
                                          onChange={(e) => handleRowChange(realIndex, 'successful_orders', parseFloat(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm focus:border-blue-500 outline-none"
                                          min="0"
                                        />
                                      </td>
                                        <td className="px-3 py-2 border-l border-gray-100">
                                          <input
                                            type="text"
                                            value={(Number(row.target_deduction) || 0).toFixed(2)}
                                            readOnly
                                            className="w-16 px-2 py-1 rounded-lg border border-gray-100 bg-gray-50 text-center text-sm text-red-600 font-bold"
                                          />
                                        </td>
                                        <td className="px-3 py-2 border-l border-gray-100">
                                          <input
                                            type="text"
                                            value={(Number(row.monthly_bonus) || 0).toFixed(2)}
                                            readOnly
                                            className="w-16 px-2 py-1 rounded-lg border border-gray-100 bg-gray-50 text-center text-sm text-emerald-600 font-bold"
                                          />
                                        </td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.operator_deduction}
                                          onChange={(e) => handleRowChange(realIndex, 'operator_deduction', parseFloat(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm focus:border-blue-500 outline-none"
                                          min="0"
                                        />
                                      </td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.internal_deduction}
                                          onChange={(e) => handleRowChange(realIndex, 'internal_deduction', parseFloat(e.target.value) || 0)}
                                          className={`w-16 px-2 py-1 rounded-lg border text-center text-sm focus:border-blue-500 outline-none ${
                                            row.has_debt ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                          }`}
                                          min="0"
                                        />
                                      </td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.wallet_deduction}
                                          onChange={(e) => handleRowChange(realIndex, 'wallet_deduction', parseFloat(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm focus:border-blue-500 outline-none"
                                          min="0"
                                        />
                                      </td>
                                      <td className="px-3 py-2 border-l border-gray-100">
                                        <input
                                          type="number"
                                          value={row.internal_bonus}
                                          onChange={(e) => handleRowChange(realIndex, 'internal_bonus', parseFloat(e.target.value) || 0)}
                                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm focus:border-blue-500 outline-none"
                                          min="0"
                                        />
                                      </td>
                                    </>
                                  )}
                                  <td className="px-3 py-2 border-l border-gray-100">
                                    <input
                                      type="text"
                                      value={(Number(row.net_salary) || 0).toFixed(2)}
                                      readOnly
                                      className={`w-24 px-2 py-1 rounded-lg border text-center text-sm font-bold ${
                                        row.net_salary < 0 ? 'bg-red-100 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                      }`}
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <select
                                      value={row.payment_method}
                                      onChange={(e) => handleRowChange(realIndex, 'payment_method', e.target.value)}
                                      className="w-full min-w-[100px] px-2 py-1 rounded-lg border border-gray-200 text-xs focus:border-blue-500 outline-none bg-white text-gray-700"
                                    >
                                      <option value="غير محدد">{t("newPayroll.paymentMethods.notSpecified")}</option>
                                      <option value="مدد">{t("newPayroll.paymentMethods.mudad")}</option>
                                      <option value="كاش">{t("newPayroll.paymentMethods.cash")}</option>
                                      <option value="تحويل بنكي">{t("newPayroll.paymentMethods.transfer")}</option>
                                    </select>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="bg-gray-50 border-t border-gray-100 p-4 flex-shrink-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                              <DollarSign size={14} />
                              <span className="text-xs font-bold">{t("newPayroll.totals.totalSalaries")}</span>
                            </div>
                            <p className="text-xl font-black text-blue-600">{totals.totalSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs">{t("stats.sar")}</span></p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                              <Target size={14} />
                              <span className="text-xs font-bold">{t("newPayroll.totals.totalOrders")}</span>
                            </div>
                            <p className="text-xl font-black text-gray-900">{totals.totalOrders.toLocaleString('en-US')}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                              <AlertTriangle size={14} />
                              <span className="text-xs font-bold">{t("newPayroll.totals.totalDeductions")}</span>
                            </div>
                            <p className="text-xl font-black text-red-600">{totals.totalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs">{t("stats.sar")}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <Link href="/salary-payrolls">
                      <button className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
                        {t("newPayroll.cancel")}
                      </button>
                    </Link>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSave(true)}
                        disabled={loading || selectedCount === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-all disabled:opacity-50"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <FileCheck size={16} />}
                        <span>{t("newPayroll.saveDraft")}</span>
                      </button>
                      <button
                        onClick={() => handleSave(false)}
                        disabled={loading || selectedCount === 0}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/25"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span>{t("newPayroll.savePayroll", { count: selectedCount })}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!selectedPackage && !fetchingPackage && (
                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-12 text-center">
                  <Info size={48} className="mx-auto text-blue-300 mb-4" />
                  <h4 className="text-lg font-bold text-gray-600 mb-2">{t("newPayroll.welcomeTitle")}</h4>
                  <p className="text-gray-400 text-sm">{t("newPayroll.welcomeDesc")}</p>
                </div>
              )}

              {fetchingPackage && (
                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-12 text-center">
                  <Loader2 size={48} className="mx-auto text-blue-500 mb-4 animate-spin" />
                  <h4 className="text-lg font-bold text-gray-600 mb-2">{t("newPayroll.loadingData")}</h4>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
