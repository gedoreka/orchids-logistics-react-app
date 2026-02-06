"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight, 
  ChevronLeft,
  Calendar,
  AlertTriangle,
  Umbrella,
  CheckCircle2,
  UserPlus,
  Package,
  LayoutDashboard,
  Target,
  Trophy,
  DollarSign,
  IdCard,
  FileImage,
  FileCheck,
  Car,
  Sparkles,
  Download,
  Upload,
  Settings,
  TrendingUp,
  Plus,
  X,
  Save,
  FileSpreadsheet,
  ScanLine,
  Globe,
  Phone,
  Mail,
  Briefcase,
  Hash,
  Home,
  CreditCard,
  FileText,
  Building,
  Info
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { toast } from "sonner";
import { deleteEmployee, updateIqamaExpiry, toggleEmployeeStatus, saveEmployees } from "@/lib/actions/hr";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

const getPublicUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (path.includes('supabase')) {
    return path;
  }

  return `${process.env.NEXT_PUBLIC_APP_URL}/${cleanPath}`;
};

// Empty employee template with all 14 fields
const emptyEmployee = () => ({
  name: "",
  name_en: "",
  iqama_number: "",
  user_code: "",
  job_title: "",
  nationality: "",
  phone: "",
  email: "",
  vehicle_plate: "",
  birth_date: "",
  passport_number: "",
  operation_card_number: "",
  basic_salary: 0,
  housing_allowance: 0,
  iqama_expiry: "",
  iban: "",
});

interface PackageViewClientProps {
  packageData: any;
  allPackages: any[];
  stats: any;
  initialEmployees: any[];
  searchQuery: string;
  activeFilter: string;
}

export function PackageViewClient({ 
  packageData, 
  allPackages, 
  stats, 
  initialEmployees,
  searchQuery,
  activeFilter
}: PackageViewClientProps) {
  const { isRTL } = useLocale();
  const t = useTranslations('packages.packageView');
  const tp = useTranslations('packages');
  
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState(searchQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [filter, setFilter] = useState(activeFilter);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Delete employee modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; employee: any | null; phase: 'confirm' | 'deleting' | 'success' }>({ isOpen: false, employee: null, phase: 'confirm' });

  // Add employees modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newEmployees, setNewEmployees] = useState([emptyEmployee()]);
  const [excelScanModal, setExcelScanModal] = useState<{ isOpen: boolean; phase: 'scanning' | 'found' | 'done'; count: number }>({ isOpen: false, phase: 'scanning', count: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEmployees(initialEmployees);
  }, [initialEmployees]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!mounted) return;
    const trimmedSearch = debouncedSearch.trim();
    const params = new URLSearchParams();
    if (trimmedSearch) params.set('search', trimmedSearch);
    if (filter !== 'all') params.set('filter', filter);
    const queryStr = params.toString();
    const url = `/hr/packages/${packageData.id}${queryStr ? `?${queryStr}` : ''}`;
    router.replace(url, { scroll: false });
  }, [debouncedSearch, filter, packageData.id, router, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentIndex = allPackages.findIndex(p => p.id === packageData.id);
  const prevPackage = currentIndex > 0 ? allPackages[currentIndex - 1] : null;
  const nextPackage = currentIndex < allPackages.length - 1 ? allPackages[currentIndex + 1] : null;

  const openDeleteModal = (emp: any) => {
    setDeleteModal({ isOpen: true, employee: emp, phase: 'confirm' });
  };

  const confirmDeleteEmployee = async () => {
    if (!deleteModal.employee) return;
    setDeleteModal(prev => ({ ...prev, phase: 'deleting' }));
    
    const result = await deleteEmployee(deleteModal.employee.id);
    
    if (result.success) {
      setDeleteModal(prev => ({ ...prev, phase: 'success' }));
      setEmployees(prev => prev.filter(e => e.id !== deleteModal.employee.id));
      setTimeout(() => {
        setDeleteModal({ isOpen: false, employee: null, phase: 'confirm' });
      }, 2500);
    } else {
      toast.error(result.error);
      setDeleteModal({ isOpen: false, employee: null, phase: 'confirm' });
    }
  };

  const handleUpdateExpiry = async (id: number, date: string) => {
    const result = await updateIqamaExpiry(id, date);
    if (result.success) {
      toast.success(t('iqamaExpiryUpdated'));
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSearch = search.trim();
    router.push(`/hr/packages/${packageData.id}?search=${encodeURIComponent(trimmedSearch)}&filter=${filter}`, { scroll: false });
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  // ======= Add Employees Modal Logic =======
  const addEmployeeRow = () => {
    setNewEmployees(prev => [...prev, emptyEmployee()]);
  };

  const removeEmployeeRow = (index: number) => {
    if (newEmployees.length === 1) {
      toast.error(tp('mustHaveOneEmployee'));
      return;
    }
    setNewEmployees(prev => prev.filter((_, i) => i !== index));
  };

  const updateNewEmployee = (index: number, field: string, value: any) => {
    setNewEmployees(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddEmployeesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validEmployees = newEmployees.filter(emp => emp.name.trim() !== "");
    if (validEmployees.length === 0) {
      toast.error(tp('validationNoEmployees'), { duration: 5000 });
      return;
    }

    for (let i = 0; i < validEmployees.length; i++) {
      const emp = validEmployees[i];
      const missingFields: string[] = [];
      if (!emp.name.trim()) missingFields.push(tp('employeeName'));
      if (!emp.nationality.trim()) missingFields.push(tp('nationality'));
      if (!emp.basic_salary || emp.basic_salary <= 0) missingFields.push(tp('basicSalary'));

      if (missingFields.length > 0) {
        toast.error(
          `${tp('validationEmployeeIncomplete')} #${i + 1} (${emp.name || '---'})\n${tp('validationMissingFields')} ${missingFields.join('، ')}`,
          { duration: 7000 }
        );
        return;
      }
    }

    setIsLoading(true);
    try {
      const employeesToSave = validEmployees.map(emp => ({
        ...emp,
        company_id: packageData.company_id,
      }));

      const result = await saveEmployees(packageData.id, employeesToSave);
      if (result.success) {
        toast.success(tp('employeesAddedSuccess'));
        setIsAddModalOpen(false);
        setNewEmployees([emptyEmployee()]);
        router.refresh();
      } else {
        toast.error(result.error || tp('errorOccurred'));
      }
    } catch {
      toast.error(tp('unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  // ======= Excel Logic =======
  const columnAliases: Record<string, string[]> = {
    employee_name: ['اسم الموظف', 'Employee Name', 'الاسم', 'Name', 'اسم', 'employee name', 'employee_name'],
    name_en: ['اسم الموظف بالإنجليزية', 'Employee Name EN', 'Name EN', 'الاسم بالإنجليزية', 'name_en', 'English Name'],
    iqama_number: ['رقم الهوية', 'رقم الإقامة', 'Iqama Number', 'Identity Number', 'رقم الاقامة', 'الإقامة', 'الاقامة', 'الهوية', 'Iqama', 'ID Number', 'iqama_number', 'iqama number', 'identity_number', 'identity number'],
    user_code: ['رقم المستخدم', 'User Code', 'كود المستخدم', 'Employee Code', 'user_code', 'user code'],
    job_title: ['المسمى الوظيفي', 'Job Title', 'الوظيفة', 'المسمي الوظيفي', 'job_title', 'job title'],
    nationality: ['الجنسية', 'Nationality', 'الجنسيه', 'nationality'],
    phone: ['رقم الهاتف', 'Phone Number', 'الهاتف', 'الجوال', 'Phone', 'phone', 'phone_number'],
    email: ['البريد الإلكتروني', 'Email', 'البريد', 'الايميل', 'email', 'Email Address'],
    basic_salary: ['الراتب الأساسي', 'Basic Salary', 'الراتب', 'Salary', 'basic_salary', 'basic salary'],
    housing_allowance: ['بدل السكن', 'Housing Allowance', 'السكن', 'Housing', 'housing_allowance'],
    vehicle_plate: ['لوحة المركبة', 'Vehicle Plate', 'المركبة', 'لوحة السيارة', 'Plate', 'vehicle_plate'],
    iban: ['الآيبان', 'IBAN', 'آيبان', 'iban', 'الايبان'],
    birth_date: ['تاريخ الميلاد', 'Birth Date', 'الميلاد', 'birth_date', 'birth date', 'Date of Birth'],
    passport_number: ['رقم الجواز', 'Passport Number', 'الجواز', 'passport_number', 'passport number', 'Passport'],
    operation_card_number: ['كرت التشغيل', 'Operation Card', 'كرت تشغيل', 'operation_card_number', 'operation card'],
    iqama_expiry: ['انتهاء الإقامة', 'Iqama Expiry', 'تاريخ انتهاء الإقامة', 'iqama_expiry', 'Expiry Date'],
  };

  const resolveColumnField = (header: string): string | null => {
    const normalized = header.trim().toLowerCase();
    for (const [field, aliases] of Object.entries(columnAliases)) {
      if (aliases.some(alias => alias.toLowerCase() === normalized)) return field;
    }
    return null;
  };

  const downloadTemplate = () => {
    const headers = [
      'اسم الموظف\nEmployee Name',
      'اسم الموظف بالإنجليزية\nName EN',
      'رقم الهوية\nID Number',
      'رقم المستخدم\nUser Code',
      'المسمى الوظيفي\nJob Title',
      'الجنسية\nNationality',
      'رقم الهاتف\nPhone Number',
      'البريد الإلكتروني\nEmail',
      'لوحة المركبة\nVehicle Plate',
      'تاريخ الميلاد\nBirth Date',
      'رقم الجواز\nPassport Number',
      'كرت التشغيل\nOperation Card',
      'الراتب الأساسي\nBasic Salary',
      'بدل السكن\nHousing Allowance',
      'انتهاء الإقامة\nIqama Expiry',
    ];
    const sampleRow = ["أحمد محمد", "Ahmed Mohammed", "2000000000", "EMP001", "سائق", "سعودي", "0555555555", "ahmed@example.com", "أ ب ج 1234", "1990-01-15", "A12345678", "OP-001", 3000, 1000, "2027-06-30"];

    const wsData = [headers, sampleRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = headers.map(() => ({ wch: 24 }));
    ws['!rows'] = [{ hpt: 40 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, `add_employees_${packageData.group_name}.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setExcelScanModal({ isOpen: true, phase: 'scanning', count: 0 });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', codepage: 65001 });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false, defval: '' });

        if (rawRows.length < 2) {
          setExcelScanModal({ isOpen: false, phase: 'scanning', count: 0 });
          toast.error(tp('excelParseError'));
          return;
        }

        const headerRow = rawRows[0].map((h: any) => String(h || ''));
        const columnFieldMap: (string | null)[] = headerRow.map((header: string) => {
          const parts = header.split(/[\n\r]+/).map((p: string) => p.trim());
          for (const part of parts) {
            const field = resolveColumnField(part);
            if (field) return field;
          }
          return resolveColumnField(header);
        });

        const parsed = rawRows.slice(1).map(values => {
          if (!values || values.every((v: any) => !v || String(v).trim() === '')) return null;
          const getValue = (fieldName: string): string => {
            const idx = columnFieldMap.indexOf(fieldName);
            if (idx === -1) return '';
            const v = values[idx];
            return v != null ? String(v).trim() : '';
          };
          const getNum = (fieldName: string): number => parseFloat(getValue(fieldName)) || 0;

          const emp = {
              name: getValue('employee_name'),
              name_en: getValue('name_en'),
              iqama_number: getValue('iqama_number'),
              user_code: getValue('user_code'),
            job_title: getValue('job_title'),
            nationality: getValue('nationality'),
            phone: getValue('phone'),
            email: getValue('email'),
            vehicle_plate: getValue('vehicle_plate'),
            birth_date: getValue('birth_date'),
            passport_number: getValue('passport_number'),
            operation_card_number: getValue('operation_card_number'),
            basic_salary: getNum('basic_salary'),
            housing_allowance: getNum('housing_allowance'),
            iqama_expiry: getValue('iqama_expiry'),
            iban: getValue('iban'),
          };
          return emp.name ? emp : null;
        }).filter(Boolean) as any[];

        setTimeout(() => {
          setExcelScanModal(prev => ({ ...prev, phase: 'found', count: parsed.length }));
          setTimeout(() => {
            if (parsed.length > 0) setNewEmployees(parsed);
            setExcelScanModal(prev => ({ ...prev, phase: 'done' }));
            setTimeout(() => {
              setExcelScanModal({ isOpen: false, phase: 'scanning', count: 0 });
            }, 2000);
          }, 1200);
        }, 1500);
      } catch {
        setExcelScanModal({ isOpen: false, phase: 'scanning', count: 0 });
        toast.error(tp('excelParseError'));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ======= Table field definitions for the 14 fields =======
  const fieldDefs = [
    { key: 'name', label: 'اسم الموظف', labelEn: 'Name', required: true, type: 'text', icon: <UserPlus size={12} /> },
    { key: 'name_en', label: 'الاسم بالإنجليزية', labelEn: 'Name EN', required: false, type: 'text', icon: <Globe size={12} /> },
    { key: 'iqama_number', label: 'رقم الهوية', labelEn: 'ID', required: false, type: 'text', icon: <IdCard size={12} /> },
    { key: 'user_code', label: 'رقم المستخدم', labelEn: 'Code', required: false, type: 'text', icon: <Hash size={12} /> },
    { key: 'job_title', label: 'المسمى الوظيفي', labelEn: 'Job', required: false, type: 'text', icon: <Briefcase size={12} /> },
    { key: 'nationality', label: 'الجنسية', labelEn: 'Nationality', required: true, type: 'text', icon: <Globe size={12} /> },
    { key: 'phone', label: 'رقم الهاتف', labelEn: 'Phone', required: false, type: 'text', icon: <Phone size={12} /> },
    { key: 'email', label: 'البريد الإلكتروني', labelEn: 'Email', required: false, type: 'email', icon: <Mail size={12} /> },
    { key: 'vehicle_plate', label: 'لوحة المركبة', labelEn: 'Plate', required: false, type: 'text', icon: <Car size={12} /> },
    { key: 'birth_date', label: 'تاريخ الميلاد', labelEn: 'DOB', required: false, type: 'date', icon: <Calendar size={12} /> },
    { key: 'passport_number', label: 'رقم الجواز', labelEn: 'Passport', required: false, type: 'text', icon: <FileText size={12} /> },
    { key: 'operation_card_number', label: 'كرت التشغيل', labelEn: 'Op Card', required: false, type: 'text', icon: <IdCard size={12} /> },
    { key: 'basic_salary', label: 'الراتب الأساسي', labelEn: 'Salary', required: true, type: 'number', icon: <CreditCard size={12} /> },
    { key: 'housing_allowance', label: 'بدل السكن', labelEn: 'Housing', required: false, type: 'number', icon: <Building size={12} /> },
    { key: 'iqama_expiry', label: 'انتهاء الإقامة', labelEn: 'Expiry', required: false, type: 'date', icon: <Calendar size={12} /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const getWorkTypeLabel = (workType: string) => {
    switch (workType) {
      case 'target': return t('targetSystemType');
      case 'salary': return t('salarySystemType');
      case 'commission': return t('commissionSystemType');
      default: return workType;
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col h-full space-y-4 w-full px-2 overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-100 rounded-[2rem]" />
        <div className="h-20 bg-gray-100 rounded-2xl" />
        <div className="flex-1 bg-gray-100 rounded-3xl" />
      </div>
    );
  }

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen pb-20 w-full px-2 pt-6"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Package className="text-white" size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                      <Link href="/hr" className="hover:text-white transition-colors flex items-center gap-1">
                        <LayoutDashboard size={12} />
                        {t('hrAffairs')}
                      </Link>
                      {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                      <Link href="/hr/packages" className="hover:text-white transition-colors">{t('packages')}</Link>
                      {isRTL ? <ArrowLeft size={12} /> : <ArrowRight size={12} />}
                      <span className="text-purple-300">{packageData.group_name}</span>
                    </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                  <span className="text-xs font-black text-white/80">{stats.total_employees} {t('employee')}</span>
                </div>
                
                {prevPackage && (
                  <Link href={`/hr/packages/${prevPackage.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="h-10 px-4 rounded-xl bg-white/10 border border-white/10 text-xs font-black text-white hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                      {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                      {t('previous')}
                    </motion.button>
                  </Link>
                )}
                {nextPackage && (
                  <Link href={`/hr/packages/${nextPackage.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="h-10 px-4 rounded-xl bg-white/10 border border-white/10 text-xs font-black text-white hover:bg-white/20 transition-all flex items-center gap-2"
                    >
                      {t('next')}
                      {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </motion.button>
                  </Link>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:from-purple-600 hover:to-violet-600 transition-all font-black text-sm shadow-lg"
                >
                  <UserPlus size={18} />
                  {t('addEmployees')}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                  <Package size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black tracking-tight text-white">{packageData.group_name}</h2>
                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${
                      packageData.work_type === 'target' 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                        : packageData.work_type === 'salary'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {getWorkTypeLabel(packageData.work_type)}
                    </span>
                  </div>
                  {packageData.work_type === 'target' && (
                    <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <Target size={14} className="text-blue-400" />
                        {t('target')}: {packageData.monthly_target}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      <span className="flex items-center gap-1.5">
                        <Trophy size={14} className="text-amber-400" />
                        {t('bonus')}: {packageData.bonus_after_target} {isRTL ? 'ر.س' : 'SAR'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <StatCard 
                  icon={<Users size={18} />}
                  label={t('totalEmployees')}
                  value={stats.total_employees}
                  color="purple"
                />
                <StatCard 
                  icon={<IdCard size={18} />}
                  label={t('iqamaCompletion')}
                  value={`${stats.iqama_complete}/${stats.total_employees}`}
                  color="blue"
                />
                <StatCard 
                  icon={<FileImage size={18} />}
                  label={t('photoCompletion')}
                  value={`${stats.photo_complete}/${stats.total_employees}`}
                  color="emerald"
                />
                <StatCard 
                  icon={<FileCheck size={18} />}
                  label={t('licenseCompletion')}
                  value={`${stats.license_complete}/${stats.total_employees}`}
                  color="amber"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-white/10">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className={cn("absolute top-1/2 -translate-y-1/2 text-slate-400", isRTL ? "right-4" : "left-4")} size={18} />
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className={cn(
                    "w-full h-12 rounded-xl bg-white/10 border border-white/10 text-sm font-bold text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/30 focus:bg-white/20 outline-none transition-all",
                    isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                  )}
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {['all', 'active', 'soon', 'expired', 'on_leave'].map((f) => (
                  <motion.button
                    key={f}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFilterChange(f)}
                    className={`h-12 px-4 rounded-xl text-xs font-black transition-all ${
                      filter === f 
                        ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg' 
                        : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {f === 'all' && t('all')}
                    {f === 'active' && t('active')}
                    {f === 'soon' && t('expiringSoon')}
                    {f === 'expired' && t('expired')}
                    {f === 'on_leave' && t('onLeave')}
                  </motion.button>
                ))}
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="h-12 px-8 rounded-xl bg-white text-gray-900 text-xs font-black hover:bg-gray-100 transition-all shadow-lg"
              >
                {t('search')}
              </motion.button>
            </form>
          </div>

          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Users className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black">{t('employeesList')}</h3>
                  <p className="text-slate-400 text-xs font-bold">{employees.length} {t('employeesInList')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="h-9 px-4 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Download size={14} />
                  {t('export')}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50">
            <div className="overflow-auto max-h-[650px] scrollbar-hide">
              <table className={cn("w-full border-separate border-spacing-0", isRTL ? "text-right" : "text-left")}>
                <thead className="sticky top-0 z-20">
                  <tr className="bg-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('employeeCol')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('employeeCode')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('iqamaNumber')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('iqamaExpiry')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('salary')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">{t('status')}</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center border-b border-gray-200">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {employees.map((emp, index) => (
                      <motion.tr 
                        key={emp.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`hover:bg-purple-50/30 transition-colors group bg-white ${emp.is_active === 0 ? 'bg-orange-50/30' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center text-purple-600 font-black text-sm overflow-hidden shadow-sm group-hover:shadow-md transition-all">
                              {emp.personal_photo ? (
                                <img src={getPublicUrl(emp.personal_photo) || ""} alt="" className="h-full w-full object-cover" />
                              ) : (
                                emp.name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900">{emp.name}</p>
                              <p className="text-[10px] font-bold text-gray-400">{emp.nationality || t('notSpecified')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">#{emp.user_code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-600">{emp.iqama_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input 
                              type="date"
                              defaultValue={emp.iqama_expiry ? (() => {
                                const d = new Date(emp.iqama_expiry);
                                return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : "";
                              })() : ""}
                              onChange={(e) => handleUpdateExpiry(emp.id, e.target.value)}
                              className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-600 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 cursor-pointer hover:border-purple-200 transition-all"
                            />
                            <ExpiryBadge date={emp.iqama_expiry} isRTL={isRTL} t={t} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-black text-gray-900">{Number(emp.basic_salary).toLocaleString('en-US')} <span className="text-gray-400 text-xs">{isRTL ? 'ر.س' : 'SAR'}</span></span>
                        </td>
                        <td className="px-6 py-4">
                          {emp.is_active === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-200">
                              <CheckCircle2 size={12} />
                              {t('activeStatus')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 text-[10px] font-black uppercase border border-orange-200">
                              <Umbrella size={12} />
                              {t('onLeaveStatus')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/hr/employees/${emp.id}`}>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              >
                                <Eye size={16} />
                              </motion.button>
                            </Link>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openDeleteModal(emp)}
                              className="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center bg-white">
                        <div className="h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <Users size={48} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-black text-gray-400 mb-2">{t('noMatchingEmployees')}</p>
                        <p className="text-sm font-bold text-gray-300">{t('tryDifferentSearch')}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-600 px-6 py-4">
            <div className="flex items-center justify-between text-xs font-bold text-white/70">
              <span>{t('totalEmployeesFooter')}: {employees.length}</span>
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-purple-400" />
                <span>{t('package')} {packageData.group_name}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-purple-500" />
            <span>{t('systemManagement')}</span>
          </div>
          <span>{t('allRightsReserved')} © {new Date().getFullYear()}</span>
        </div>

        {/* ========== DELETE EMPLOYEE PREMIUM MODAL ========== */}
        <AnimatePresence>
          {deleteModal.isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => deleteModal.phase === 'confirm' ? setDeleteModal({ isOpen: false, employee: null, phase: 'confirm' }) : undefined}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
              />

              {/* Phase: Confirm */}
              {deleteModal.phase === 'confirm' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
                  dir={isRTL ? 'rtl' : 'ltr'}
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
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <AlertTriangle size={48} className="text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                    
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-3xl font-black tracking-tight relative z-10"
                    >
                      {t('deleteEmployeeTitle')}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-white/80 font-bold mt-2 relative z-10"
                    >
                      {t('deleteEmployeeCannotUndo')}
                    </motion.p>
                  </div>

                  <div className="p-8 text-center space-y-6">
                    <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-100">
                      <p className="text-slate-700 font-bold text-lg leading-relaxed">
                        {t('deleteEmployeeQuestion')}
                      </p>
                      <p className="text-red-600 font-black text-xl mt-2 truncate">
                        &quot;{deleteModal.employee?.name}&quot;
                      </p>
                      {deleteModal.employee?.user_code && (
                        <p className="text-slate-400 font-bold text-sm mt-1">
                          #{deleteModal.employee.user_code}
                        </p>
                      )}
                    </div>

                    <p className="text-slate-500 font-bold text-sm">
                      {t('deleteEmployeeWarning')}
                    </p>

                    <div className="flex gap-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDeleteModal({ isOpen: false, employee: null, phase: 'confirm' })}
                        className="flex-1 flex items-center justify-center gap-3 bg-slate-100 text-slate-700 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 transition-colors"
                      >
                        <X size={20} />
                        {tp('cancel')}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={confirmDeleteEmployee}
                        className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 border-b-4 border-red-700/50"
                      >
                        <Trash2 size={20} />
                        {t('yesDeleteEmployee')}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Phase: Deleting */}
              {deleteModal.phase === 'deleting' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.2)] overflow-hidden border-4 border-orange-500/20"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="relative bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 p-10 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            y: [0, -20, 0],
                            opacity: [0.3, 0.8, 0.3],
                          }}
                          transition={{ 
                            delay: i * 0.15, 
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                          className="absolute"
                          style={{ left: `${10 + i * 12}%`, top: '30%' }}
                        >
                          <Sparkles size={16} className="text-white/30" />
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="h-14 w-14 border-4 border-white/30 border-t-white rounded-full"
                      />
                    </motion.div>
                    
                    <h3 className="text-2xl font-black tracking-tight relative z-10">
                      {t('deletingEmployee')}
                    </h3>
                    <p className="text-white/80 font-bold mt-2 relative z-10">
                      {t('deletingEmployeeDesc')}
                    </p>
                  </div>

                  <div className="p-8 text-center">
                    <div className="bg-orange-50 rounded-2xl p-5 border-2 border-orange-100">
                      <p className="text-orange-700 font-black text-lg">
                        {deleteModal.employee?.name}
                      </p>
                      <div className="mt-3 h-2 bg-orange-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                          className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Phase: Success */}
              {deleteModal.phase === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_0_100px_rgba(16,185,129,0.3)] overflow-hidden border-4 border-emerald-500/20"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 p-10 text-white text-center overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: 100, opacity: 0 }}
                          animate={{ 
                            y: -100, 
                            opacity: [0, 1, 0],
                            x: Math.random() * 100 - 50
                          }}
                          transition={{ 
                            delay: i * 0.2, 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
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
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                      >
                        <CheckCircle2 size={56} className="text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                    
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl font-black tracking-tight relative z-10"
                    >
                      {t('employeeDeletedSuccess')}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-white/80 font-bold mt-2 relative z-10"
                    >
                      {t('employeeRemovedFromSystem')}
                    </motion.p>
                  </div>

                  <div className="p-8 text-center space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-100"
                    >
                      <p className="text-emerald-700 font-black text-xl">
                        {deleteModal.employee?.name}
                      </p>
                      <p className="text-emerald-600/70 font-bold text-sm mt-1">
                        {t('employeeDeletedFromPackage')}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* ========== ADD EMPLOYEES MODAL ========== */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-md" 
                onClick={() => setIsAddModalOpen(false)} 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-[95vw] h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <UserPlus className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{tp('addEmployeesToPackage')}</h3>
                      <p className="text-white/70 font-bold text-xs mt-0.5">{packageData.group_name} - {getWorkTypeLabel(packageData.work_type)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl">
                      <Users size={14} />
                      <span className="text-xs font-black">{newEmployees.filter(e => e.name.trim()).length} {tp('employeesCount')}</span>
                    </div>
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-auto p-6 scrollbar-hide">
                  <form id="addEmployeesForm" onSubmit={handleAddEmployeesSubmit} className="space-y-6">

                    {/* Excel Import Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-[0_8px_40px_rgba(99,102,241,0.12)] p-6"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500"></div>
                      <div className="flex items-start gap-4 mb-5">
                        <div className="shrink-0 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <FileSpreadsheet size={26} className="text-white" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h4 className="text-base font-black text-gray-900">{tp('excelImportTitle')}</h4>
                          <p className="text-xs font-bold text-gray-500 leading-relaxed">{tp('excelImportDesc')}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-5 border border-indigo-100">
                        <p className="text-xs font-black text-indigo-600 text-center tracking-wide">{tp('excelImportSteps')}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button"
                          onClick={downloadTemplate}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-black hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
                        >
                          <Download size={18} />
                          {tp('downloadExcelTemplate')}
                        </motion.button>
                        <label className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-black hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer">
                          <Upload size={18} />
                          {tp('uploadExcelFile')}
                          <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.xls" onChange={handleFileUpload} />
                        </label>
                      </div>

                      <div className="flex items-start gap-2.5 bg-amber-50 rounded-xl p-3 border border-amber-200">
                        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-bold text-amber-700 leading-relaxed">{tp('excelImportWarning')}</p>
                      </div>
                    </motion.div>

                    {/* Note about available fields */}
                    <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-black text-blue-700 mb-1">ملاحظة: الحقول الإضافية بعد حفظ الباقة</p>
                        <p className="text-[11px] font-bold text-blue-600 leading-relaxed">
                            هذا الجدول يحتوي على جميع بيانات الموظف المتاحة بعد حفظ الباقة: الاسم بالإنجليزية، رقم الهوية، رقم المستخدم، المسمى الوظيفي، الجنسية، رقم الهاتف، البريد الإلكتروني، لوحة المركبة، تاريخ الميلاد، رقم الجواز، كرت التشغيل، الراتب الأساسي، بدل السكن، انتهاء الإقامة.
                        </p>
                      </div>
                    </div>

                    {/* Employee Count Header + Add Row */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                        <Users size={20} className="text-purple-500" />
                        {tp('employeesData')}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-700 border border-purple-200">
                          <Users size={14} />
                          {newEmployees.filter(e => e.name.trim()).length || newEmployees.length} {tp('employeesCount')}
                        </span>
                      </h4>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={addEmployeeRow}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-xl text-xs font-black hover:bg-purple-200 transition-all"
                      >
                        <Plus size={16} />
                        {tp('addEmployee')}
                      </motion.button>
                    </div>

                    {/* Employees Table */}
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                      <table className={cn("w-full border-collapse", isRTL ? "text-right" : "text-left")}>
                        <thead className="bg-gradient-to-r from-purple-600 to-violet-600 text-white">
                          <tr>
                            {fieldDefs.map(f => (
                              <th key={f.key} className="p-3 text-[10px] font-black whitespace-nowrap">
                                <span className="flex items-center gap-1">
                                  {f.icon}
                                  {f.label}
                                  {f.required && <span className="text-red-300">*</span>}
                                </span>
                              </th>
                            ))}
                            <th className="p-3 text-[10px] font-black whitespace-nowrap">{tp('actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {newEmployees.map((emp, idx) => (
                            <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                              {fieldDefs.map(f => (
                                <td key={f.key} className="p-2">
                                  <input
                                    type={f.type}
                                    value={(emp as any)[f.key] ?? ''}
                                    onChange={(e) => updateNewEmployee(idx, f.key, f.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value)}
                                    placeholder={f.label}
                                    className={cn(
                                      "w-full min-w-[100px] bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-2 text-xs font-bold text-gray-700 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all",
                                      f.type === 'number' && "text-center font-black text-blue-600 min-w-[80px]",
                                      f.type === 'date' && "min-w-[130px]",
                                      f.key === 'name' && "min-w-[140px]",
                                      f.key === 'email' && "min-w-[160px]",
                                    )}
                                  />
                                </td>
                              ))}
                              <td className="p-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  type="button"
                                  onClick={() => removeEmployeeRow(idx)}
                                  className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                >
                                  <Trash2 size={14} />
                                </motion.button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Required fields indicator */}
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                      <span className="text-red-400">*</span> {tp('requiredFieldsIndicator')}
                    </div>
                  </form>
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 bg-gray-50 p-6 flex items-center justify-between shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-8 py-3 rounded-xl bg-gray-200 text-gray-600 font-black text-sm hover:bg-gray-300 transition-all"
                  >
                    {tp('cancel')}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    form="addEmployeesForm"
                    disabled={isLoading}
                    className="px-10 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-black text-sm shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-violet-700 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={18} />
                        {tp('addEmployeesToPackageBtn')}
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ========== EXCEL SCAN MODAL ========== */}
        <AnimatePresence>
          {excelScanModal.isOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative bg-white rounded-3xl shadow-2xl p-10 text-center min-w-[350px]"
              >
                {excelScanModal.phase === 'scanning' && (
                  <div className="space-y-5">
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto animate-pulse">
                      <ScanLine size={40} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">{tp('excelScanningTitle')}</h3>
                    <p className="text-sm font-bold text-gray-500">{tp('excelScanningDesc')}</p>
                    <div className="flex justify-center gap-3 text-xs font-bold text-indigo-500">
                      <span className="animate-pulse">{tp('excelReading')}</span>
                      <span className="animate-pulse delay-100">{tp('excelAnalyzing')}</span>
                      <span className="animate-pulse delay-200">{tp('excelMapping')}</span>
                    </div>
                  </div>
                )}
                {excelScanModal.phase === 'found' && (
                  <div className="space-y-5">
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={40} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">{tp('excelFoundTitle')}</h3>
                    <p className="text-4xl font-black text-emerald-600">{excelScanModal.count}</p>
                    <p className="text-sm font-bold text-gray-500">{tp('excelEmployeesFound')}</p>
                  </div>
                )}
                {excelScanModal.phase === 'done' && (
                  <div className="space-y-5">
                    <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={40} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">{tp('excelDoneTitle')}</h3>
                    <p className="text-sm font-bold text-gray-500">{tp('excelDoneDesc')}</p>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colorClasses: Record<string, string> = {
    purple: 'from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-300',
    blue: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300',
    emerald: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
    amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md border rounded-xl px-4 py-3 min-w-[120px]`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="opacity-70">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-wider opacity-70">{label}</span>
      </div>
      <span className="text-lg font-black text-white">{value}</span>
    </div>
  );
}

function ExpiryBadge({ date, isRTL, t }: { date: string; isRTL: boolean; t: (key: string) => string }) {
  if (!date) return <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{t('notSpecified')}</span>;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  
  const days = Math.round((d.getTime() - new Date().getTime()) / 86400000);
  
  if (days <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-black border border-red-200">
        <AlertTriangle size={12} />
        {t('expiryExpired')}
      </span>
    );
  }
  if (days <= 30) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black border border-orange-200">
        <AlertTriangle size={12} />
        {days} {t('expiryDays')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-200">
      <CheckCircle2 size={12} />
      {t('expiryValid')}
    </span>
  );
}
